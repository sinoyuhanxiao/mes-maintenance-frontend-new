<template>
  <div class="page-container">
    <!-- Show pie ONLY if we have any non-zero data -->
    <GridLayout
      v-if="hasAnyData"
      :layout="layout"
      :col-num="6"
      :row-height="10"
      :is-draggable="false"
      :is-resizable="false"
      :use-css-transforms="true"
      :margin="[10, 10]"
    >
      <GridItem v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
        <div class="card">
          <component
            :is="item.component"
            v-bind="item.props"
            class="widget"
            @slice-click="onPieSelect"
            @legend-click="onPieSelect"
          />
        </div>
      </GridItem>
    </GridLayout>

    <!-- Empty state -->
    <div v-else class="empty-wrap">No related work orders available</div>

    <!-- Details section -->
    <el-divider v-if="selectedState && hasAnyData" />

    <!-- When there IS a selected state and data exists -->
    <!-- When there IS a selected state and data exists -->
    <div v-if="selectedState && hasAnyData" class="table-wrap">
      <div class="table-header">
        <div class="title">Related Work Orders - {{ selectedState }}</div>
      </div>

      <!-- ✅ Always render SearchTable if this state has any rows -->
      <SearchTable
        v-if="filteredRows.length"
        :key="`wo-${selectedState}`"
        :data="filteredRows"
        :columns="columns"
        :enable-search="true"
        v-model:search="searchQuery"
        empty-text="No match found"
        :client-page-size="5"
        :min-height="200"
        :row-key="rowKey"
      />

      <!-- 🚫 This state has zero work orders overall -->
      <div v-else class="empty-wrap">No related work orders - {{ selectedState }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { GridLayout, GridItem } from 'vue3-grid-layout'
import WidgetPie from '../../../../components/Widgets/PieChart.vue'
import { searchWorkOrders } from '@/api/work-order'
import SearchTable from '@/components/Common/SearchTable.vue' // adjust path if needed

const props = defineProps( { equipmentId : [Number, String] } )

/* ---------- Columns for SearchTable (basic/fixed) ---------- */
function formatDate( val ) {
  if ( !val ) return ''
  try {
    // Parse ISO string or timestamp
    const d = new Date( val )
    if ( isNaN( d.getTime() ) ) return ''

    // Format nicely in local time (e.g., "Nov 7, 2025, 12:00 AM")
    return d.toLocaleString( undefined, {
      year : 'numeric',
      month : 'short',
      day : 'numeric',
      hour : '2-digit',
      minute : '2-digit',
      hour12 : true
    } )
  } catch {
    return ''
  }
}

const columns = [
  { label : 'Work Order Name', prop : 'name', width : 400 },
  { label : 'Code', prop : 'code', width : 120 },
  { label : 'Start Time', prop : '_start', width : 120, formatter : ( _, __, v ) => formatDate( v ) },
  { label : 'End Time', prop : '_end', width : 120, formatter : ( _, __, v ) => formatDate( v ) }
]
const rowKey = row => row.code || row.name || `${row._start}-${row._end}`

/* ---------- State/colors/pie data ---------- */
const STATE_ORDER = [
  'Completed',
  'Failed',
  'Incomplete',
  'In Progress',
  'Pending Approval',
  'Pending',
  'Forecast',
  'Ready',
  'Released'
]
const STATE_COLORS = {
  // 🔮 keep Forecast neutral / secondary
  Forecast : '#8D6E63', // soft brown/neutral

  // 🟠 Pending (matches tag text #C45A00)
  Pending : '#C45A00',

  // 🔵 Ready (keep as action blue)
  Ready : '#2196F3',

  // 🟧 In Progress (warm orange, distinct from Pending)
  'In Progress' : '#FF9800',

  // ✅ Completed (green = success)
  Completed : '#4CAF50',

  // ❌ Failed (red = danger)
  Failed : '#F44336',

  // ⚠ Incomplete → your Overdue; keep a strong accent
  Incomplete : '#D81B60', // deep pink / magenta

  // 🌟 Pending Approval (matches tag text #B88600)
  'Pending Approval' : '#F5D11F',

  // 💜 Released (matches tag text #9b59b6)
  Released : '#9b59b6'
}

const initialPieData = STATE_ORDER.map( name => ( { name, value : 0, color : STATE_COLORS[name] } ) )

/* ---------- Local state ---------- */
const allRows = ref( [] )
const selectedState = ref( '' )
const hasAnyData = ref( true )
const searchQuery = ref( '' )

const layout = ref( [
  {
    x : 0,
    y : 0,
    w : 6,
    h : 20,
    i : '1',
    component : markRaw( WidgetPie ),
    props : { title : '', data : initialPieData, onSelect : name => onPieSelect( name ) }
  }
] )

/* ---------- Helpers ---------- */
function normalizeState( raw ) {
  if ( !raw ) return ''
  const s = String( raw ).trim().toLowerCase()
  if ( s === 'in_progress' || s === 'in progress' ) return 'In Progress'
  if ( s === 'pending_approval' || s === 'pending approval' ) return 'Pending Approval'
  if ( s === 'released' ) return 'Released'
  return s.charAt( 0 ).toUpperCase() + s.slice( 1 )
}
function getStateName( row ) {
  const raw = row?.state?.name ?? row?.state_name ?? row?.state ?? row?.status_name ?? row?.status
  return normalizeState( raw )
}
const getName = row => row?.name ?? row?.title ?? ''
const getCode = row => row?.code ?? row?.wo_code ?? ''
const getDesc = row => row?.description ?? row?.desc ?? ''
const getStart = row =>
  row?.start_date ?? row?.startTime ?? row?.start_time ?? row?.planned_start ?? row?.scheduledStart ?? row?.createdAt
const getEnd = row =>
  row?.end_date ?? row?.endTime ?? row?.end_time ?? row?.planned_end ?? row?.scheduledEnd ?? row?.dueAt

function onPieSelect( payload ) {
  const name = typeof payload === 'string' ? payload : payload?.name
  if ( !name ) return
  const normalized = normalizeState( name )
  if ( !STATE_ORDER.includes( normalized ) ) return
  selectedState.value = normalized
}

/* ---------- Rows for table ---------- */
// 1) filter by state (for the page)
const filteredRows = computed( () =>
  !selectedState.value
    ? []
    : allRows.value
      .filter( r => getStateName( r ) === selectedState.value )
      .map( r => ( {
        name : getName( r ),
        code : getCode( r ),
        description : getDesc( r ),
        _start : getStart( r ),
        _end : getEnd( r ),
        _raw : r
      } ) )
)

/* ---------- Data load ---------- */
async function loadPieData() {
  try {
    const page = 1
    const size = 100
    const eq = props.equipmentId ? Number( props.equipmentId ) : null
    const payload = {
      latest_per_recurrence : false,
      ...( eq ? { equipment_node_ids : [eq] } : {} )
    }

    const res = await searchWorkOrders( page, size, 'createdAt', 'DESC', payload )
    const root = res?.data
    const rawRows =
      root?.data?.content ?? root?.content ?? root?.records ?? root?.list ?? root?.items ?? root?.rows ?? []

    let rows = rawRows
    if ( eq ) {
      rows = rawRows.filter( r => {
        const topHit = Array.isArray( r?.equipment_node_ids ) && r.equipment_node_ids.map( Number ).includes( eq )
        const taskHit = Array.isArray( r?.task_list ) && r.task_list.some( t => Number( t?.equipment_node?.id ) === eq )
        return topHit || taskHit
      } )
    }

    allRows.value = rows

    // pie counts
    const counts = Object.fromEntries( STATE_ORDER.map( k => [k, 0] ) )
    for ( const row of rows ) {
      const s = getStateName( row )
      if ( STATE_ORDER.includes( s ) ) counts[s]++
      else counts.Incomplete++
    }

    const total = Object.values( counts ).reduce( ( a, b ) => a + b, 0 )
    hasAnyData.value = total > 0
    if ( !hasAnyData.value ) selectedState.value = ''

    const pieData = STATE_ORDER.map( name => ( {
      name,
      value : counts[name] ?? 0,
      color : STATE_COLORS[name]
    } ) )

    layout.value = [
      {
        ...layout.value[0],
        props : { ...layout.value[0].props, data : pieData }
      }
    ]
  } catch ( err ) {
    console.error( err )
    ElMessage.error( 'Failed to load work orders' )
    hasAnyData.value = false
    selectedState.value = ''
  }
}

onMounted( loadPieData )
watch(
  () => props.equipmentId,
  () => {
    selectedState.value = ''
    searchQuery.value = ''
    loadPieData()
  }
)

defineExpose( { reload : loadPieData, formatDate } )
</script>

<style scoped>
.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}
.card {
  background: white;
  border-radius: 8px;
  height: 100%;
  width: 100%;

  /* FIX: Give the pie card enough vertical space */
  min-height: 420px; /* ← tune between 360–420 if needed */
}
.widget {
  width: 100%;
  height: 100%;
}
.empty-wrap {
  font-size: 14px;
  color: gray;
  text-align: left;
  align-self: flex-start;
}
.table-wrap {
  margin-top: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.table-header .title {
  font-weight: 600;
}

/* old page-level search bar is not used anymore */
.search-bar {
  display: none;
}
.search-input {
  width: 300px;
  max-width: 100%;
}
</style>

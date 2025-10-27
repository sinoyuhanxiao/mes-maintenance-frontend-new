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

    <!-- Replace your empty state div with this -->
    <div v-else class="empty-wrap">No related work orders available</div>

    <!-- Details table appears only when a state is selected AND we have data -->
    <el-divider v-if="selectedState && hasAnyData" />
    <div v-if="selectedState && hasAnyData" class="table-wrap">
      <div class="table-header">
        <div class="title">Related WO - {{ selectedState }}</div>
      </div>

      <el-table :data="filteredRows" border stripe empty-text="No work orders found" max-height="280">
        <el-table-column prop="name" label="WO Name" min-width="220" />
        <el-table-column prop="code" label="Code" min-width="140" />
        <el-table-column label="Start Time" min-width="180">
          <template #default="{ row }">{{ formatDate(row._start) }}</template>
        </el-table-column>
        <el-table-column label="End Time" min-width="180">
          <template #default="{ row }">{{ formatDate(row._end) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { GridLayout, GridItem } from 'vue3-grid-layout'
import WidgetPie from '../../../../components/Widgets/PieChart.vue'
import { searchWorkOrders } from '@/api/work-order'

const props = defineProps( {
  equipmentId : {
    type : [Number, String],
    required : false
  }
} )

const STATE_ORDER = [
  'Completed',
  'Failed',
  'Incomplete',
  'In progress',
  'Pending Approval',
  'Pending',
  'Forecast',
  'Ready',
  'Released'
]

const STATE_COLORS = {
  Forecast : '#8D6E63',
  Pending : '#9E9E9E',
  Ready : '#2196F3',
  'In progress' : '#FF9800',
  Completed : '#4CAF50',
  Failed : '#F44336',
  Incomplete : '#AB47BC',
  'Pending Approval' : '#607D8B',
  Released : '#7E57C2'
}

const initialPieData = STATE_ORDER.map( name => ( { name, value : 0, color : STATE_COLORS[name] } ) )

const allRows = ref( [] )
const selectedState = ref( '' )
const hasAnyData = ref( true ) // toggles pie vs empty text

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

function normalizeState( raw ) {
  if ( !raw ) return ''
  const s = String( raw ).trim()
  const lower = s.toLowerCase()
  if ( lower === 'in_progress' || lower === 'in progress' ) return 'In progress'
  if ( lower === 'pending_approval' || lower === 'pending approval' ) return 'Pending Approval'
  if ( lower === 'released' ) return 'Released'
  return s
}
function getStateName( row ) {
  const raw = row?.state?.name ?? row?.state_name ?? row?.state ?? row?.status_name ?? row?.status
  return normalizeState( raw )
}
const getName = row => row?.name ?? row?.title ?? ''
const getCode = row => row?.code ?? row?.wo_code ?? ''
const getDesc = row => row?.description ?? row?.desc ?? ''
function getStart( row ) {
  return (
    row?.start_date ?? row?.startTime ?? row?.start_time ?? row?.planned_start ?? row?.scheduledStart ?? row?.createdAt
  )
}
function getEnd( row ) {
  return row?.end_date ?? row?.endTime ?? row?.end_time ?? row?.planned_end ?? row?.scheduledEnd ?? row?.dueAt
}
function formatDate( val ) {
  if ( !val ) return ''
  const d = typeof val === 'number' ? new Date( val ) : new Date( String( val ) )
  if ( isNaN( d.getTime() ) ) return ''
  return d.toLocaleString()
}

function onPieSelect( payload ) {
  const name = typeof payload === 'string' ? payload : payload?.name
  if ( !name ) return
  const normalized = normalizeState( name )
  if ( !STATE_ORDER.includes( normalized ) ) return
  selectedState.value = normalized
}

const filteredRows = computed( () => {
  if ( !selectedState.value ) return []
  return allRows.value
    .filter( r => getStateName( r ) === selectedState.value )
    .map( r => ( {
      name : getName( r ),
      code : getCode( r ),
      description : getDesc( r ),
      _start : getStart( r ),
      _end : getEnd( r ),
      _raw : r
    } ) )
} )

async function loadPieData() {
  try {
    const page = 1
    const size = 100
    const sortField = 'createdAt'
    const direction = 'DESC'

    const eq = props.equipmentId != null && props.equipmentId !== '' ? Number( props.equipmentId ) : null
    const searchPayload = {
      latest_per_recurrence : false,
      ...( eq ? { equipment_node_ids : [eq] } : {} )
    }

    const res = await searchWorkOrders( page, size, sortField, direction, searchPayload )

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

    // Build counts for the pie
    const counts = {}
    for ( const name of STATE_ORDER ) counts[name] = 0
    for ( const row of rows ) {
      const s = getStateName( row )
      if ( STATE_ORDER.includes( s ) ) counts[s]++
      else counts.Incomplete++ // truly unknown states still bucketed here
    }

    // Decide whether we have any data
    const total = Object.values( counts ).reduce( ( a, b ) => a + b, 0 )
    hasAnyData.value = total > 0

    // If no data, reset table selection and keep layout pie at zeros (unused)
    if ( !hasAnyData.value ) {
      selectedState.value = ''
    }

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
}
.widget {
  width: 100%;
  height: 100%;
}
.empty-wrap {
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  text-align: left;
  align-self: flex-start; /* keeps it top-left */
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
</style>

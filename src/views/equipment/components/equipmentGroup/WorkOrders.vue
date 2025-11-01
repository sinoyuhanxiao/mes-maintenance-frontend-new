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

    <!-- Details table -->
    <el-divider v-if="selectedState && hasAnyData" />
    <div v-if="selectedState && hasAnyData" class="table-wrap">
      <div class="table-header">
        <div class="title">Related WO - {{ selectedState }}</div>
      </div>

      <!-- 🔍 Search bar right above table -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="Search by name or code"
          clearable
          class="search-input"
          @keyup.enter="onSearchEnter"
        />
      </div>

      <el-table :data="searchedRows" border stripe empty-text="No match found" max-height="280">
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

const props = defineProps({
  equipmentId: [Number, String],
})

const STATE_ORDER = [
  'Completed',
  'Failed',
  'Incomplete',
  'In progress',
  'Pending Approval',
  'Pending',
  'Forecast',
  'Ready',
  'Released',
]

const STATE_COLORS = {
  Forecast: '#8D6E63',
  Pending: '#9E9E9E',
  Ready: '#2196F3',
  'In progress': '#FF9800',
  Completed: '#4CAF50',
  Failed: '#F44336',
  Incomplete: '#D81B60', // distinct pink
  'Pending Approval': '#607D8B',
  Released: '#00796B', // teal
}

const initialPieData = STATE_ORDER.map(name => ({ name, value: 0, color: STATE_COLORS[name] }))

const allRows = ref([])
const selectedState = ref('')
const hasAnyData = ref(true)
const searchQuery = ref('')

const layout = ref([
  {
    x: 0,
    y: 0,
    w: 6,
    h: 20,
    i: '1',
    component: markRaw(WidgetPie),
    props: { title: '', data: initialPieData, onSelect: name => onPieSelect(name) },
  },
])

function normalizeState(raw) {
  if (!raw) return ''
  const s = String(raw).trim().toLowerCase()
  if (s === 'in_progress' || s === 'in progress') return 'In progress'
  if (s === 'pending_approval' || s === 'pending approval') return 'Pending Approval'
  if (s === 'released') return 'Released'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getStateName(row) {
  const raw = row?.state?.name ?? row?.state_name ?? row?.state ?? row?.status_name ?? row?.status
  return normalizeState(raw)
}

const getName = row => row?.name ?? row?.title ?? ''
const getCode = row => row?.code ?? row?.wo_code ?? ''
const getDesc = row => row?.description ?? row?.desc ?? ''
const getStart = row =>
  row?.start_date ?? row?.startTime ?? row?.start_time ?? row?.planned_start ?? row?.scheduledStart ?? row?.createdAt
const getEnd = row =>
  row?.end_date ?? row?.endTime ?? row?.end_time ?? row?.planned_end ?? row?.scheduledEnd ?? row?.dueAt

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toLocaleString()
}

function onPieSelect(payload) {
  const name = typeof payload === 'string' ? payload : payload?.name
  if (!name) return
  const normalized = normalizeState(name)
  if (!STATE_ORDER.includes(normalized)) return
  selectedState.value = normalized
}

const filteredRows = computed(() =>
  !selectedState.value
    ? []
    : allRows.value
        .filter(r => getStateName(r) === selectedState.value)
        .map(r => ({
          name: getName(r),
          code: getCode(r),
          description: getDesc(r),
          _start: getStart(r),
          _end: getEnd(r),
          _raw: r,
        }))
)

const searchedRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return filteredRows.value
  return filteredRows.value.filter(
    r =>
      r.name.toLowerCase().includes(q) ||
      String(r.code).toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q)
  )
})

function onSearchEnter() {
  // Optional: trigger any analytics or manual refresh here
}

async function loadPieData() {
  try {
    const page = 1
    const size = 100
    const eq = props.equipmentId ? Number(props.equipmentId) : null
    const payload = {
      latest_per_recurrence: false,
      ...(eq ? { equipment_node_ids: [eq] } : {}),
    }

    const res = await searchWorkOrders(page, size, 'createdAt', 'DESC', payload)
    const root = res?.data
    const rawRows =
      root?.data?.content ?? root?.content ?? root?.records ?? root?.list ?? root?.items ?? root?.rows ?? []

    let rows = rawRows
    if (eq) {
      rows = rawRows.filter(r => {
        const topHit = Array.isArray(r?.equipment_node_ids) && r.equipment_node_ids.map(Number).includes(eq)
        const taskHit = Array.isArray(r?.task_list) && r.task_list.some(t => Number(t?.equipment_node?.id) === eq)
        return topHit || taskHit
      })
    }

    allRows.value = rows
    const counts = Object.fromEntries(STATE_ORDER.map(k => [k, 0]))
    for (const row of rows) {
      const s = getStateName(row)
      if (STATE_ORDER.includes(s)) counts[s]++
      else counts.Incomplete++
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    hasAnyData.value = total > 0
    if (!hasAnyData.value) selectedState.value = ''

    const pieData = STATE_ORDER.map(name => ({
      name,
      value: counts[name] ?? 0,
      color: STATE_COLORS[name],
    }))

    layout.value = [
      {
        ...layout.value[0],
        props: { ...layout.value[0].props, data: pieData },
      },
    ]
  } catch (err) {
    console.error(err)
    ElMessage.error('Failed to load work orders')
    hasAnyData.value = false
    selectedState.value = ''
  }
}

onMounted(loadPieData)
watch(
  () => props.equipmentId,
  () => {
    selectedState.value = ''
    searchQuery.value = ''
    loadPieData()
  }
)

defineExpose({ reload: loadPieData, formatDate })
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
.search-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
}
.search-input {
  width: 300px;
  max-width: 100%;
}
</style>

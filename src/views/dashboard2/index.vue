<template>
  <div class="dashboard">
    <!-- ── KPI CARDS (YTD, with Skeleton) ───────────────────────── -->
    <el-skeleton :loading="kpiLoading" animated>
      <!-- Skeleton layout -->
      <template #template>
        <el-row :gutter="16" class="mb16">
          <el-col :xs="24" :sm="12" :lg="8" v-for="n in 3" :key="n">
            <div class="kpi-card panel">
              <div class="kpi-left">
                <div class="kpi-icon">
                  <el-skeleton-item variant="circle" />
                </div>
                <div class="kpi-text">
                  <div class="kpi-value">
                    <el-skeleton-item variant="text" style="width: 80px" />
                  </div>
                  <div class="kpi-label">
                    <el-skeleton-item variant="text" style="width: 120px" />
                  </div>
                </div>
              </div>
              <el-skeleton-item variant="text" style="width: 70px" />
            </div>
          </el-col>
        </el-row>
      </template>

      <!-- Actual KPI cards (YTD) -->
      <template #default>
        <el-row :gutter="16" class="mb16">
          <el-col :xs="24" :sm="12" :lg="8" v-for="item in cardList" :key="item.id">
            <div class="kpi-card panel">
              <div class="kpi-left">
                <div class="kpi-icon">
                  <component :is="item.icon" />
                </div>
                <div class="kpi-text">
                  <div class="kpi-value">
                    <span v-if="item.prefix">{{ item.prefix }}</span>
                    {{ formatNumber(item.end) }}
                    <span v-if="item.postfix">{{ item.postfix }}</span>
                  </div>
                  <div class="kpi-label">{{ item.title }}</div>
                </div>
              </div>
              <el-tag size="small" type="success">{{ item.badge.txt }}</el-tag>
            </div>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <!-- ── CHARTS ROW: BAR (LEFT) + TRACKING (RIGHT) ─────────────── -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="16">
        <div class="panel">
          <div class="panel-header">
            <div>
              <div class="h-title">Work Order Stats</div>
              <div class="h-sub">Planned vs completed work orders</div>
            </div>
            <el-radio-group v-model="range" size="small" class="range-pill">
              <el-radio-button label="weekly">Weekly</el-radio-button>
              <el-radio-button label="monthly">Monthly</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 🔥 One skeleton for chart + mini cards -->
          <el-skeleton :loading="chartLoading" animated>
            <!-- Skeleton layout -->
            <template #template>
              <!-- chart skeleton -->
              <div class="panel-body chart-panel-body">
                <div class="wo-chart">
                  <el-skeleton-item variant="rect" style="width: 100%; height: 100%" />
                </div>
              </div>

              <!-- mini cards skeleton -->
              <div class="mini-stats">
                <!-- left mini card -->
                <div class="mini panel borderless">
                  <div class="mini-title">
                    <el-skeleton-item variant="text" style="width: 90px" />
                  </div>
                  <div class="mini-big">
                    <el-skeleton-item variant="text" style="width: 60px" />
                  </div>
                  <div class="mini-sub">
                    <el-skeleton-item variant="text" style="width: 140px" />
                  </div>
                  <div class="mini-med">
                    <el-skeleton-item variant="text" style="width: 80px" />
                  </div>
                </div>

                <!-- right mini card -->
                <div class="mini panel borderless">
                  <div class="mini-title">
                    <el-skeleton-item variant="text" style="width: 140px" />
                  </div>
                  <div class="mini-big">
                    <el-skeleton-item variant="text" style="width: 40px" />
                  </div>
                  <div class="mini-sub">
                    <el-skeleton-item variant="text" style="width: 120px" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Real content -->
            <template #default>
              <!-- chart -->
              <div class="panel-body chart-panel-body">
                <div class="wo-chart">
                  <WorkOrderStatsBarChart
                    :categories="chartCategories"
                    :series-a="chartSeriesAll"
                    :series-b="chartSeriesCompleted"
                    :is-weekly="range === 'weekly'"
                  />
                </div>
              </div>

              <!-- Two stat cards under the bar (toggle weekly/monthly) -->
              <div class="mini-stats">
                <!-- Completion rate (counts-only) -->
                <div class="mini panel borderless">
                  <div class="mini-title">Completion rate</div>
                  <div class="mini-big">{{ miniCompletionRate }}%</div>
                  <div class="mini-sub">
                    <span v-if="range === 'weekly'"> Completed work orders (this week) </span>
                    <!-- 🔁 CHANGED: this month instead of YTD -->
                    <span v-else>Completed work orders (this month)</span>
                  </div>
                  <div class="mini-med">
                    {{ range === 'weekly' ? formatNumber(weeklyCompletedTotal) : formatNumber(monthlyCompletedTotal) }}
                    <!-- 🔁 was yearlyCompletedTotal -->
                  </div>
                  <div class="mini-spark"></div>
                </div>

                <!-- Overdue work orders -->
                <div class="mini panel borderless">
                  <div class="mini-title">
                    <span v-if="range === 'weekly'">Overdue work orders (this week)</span>
                    <!-- 🔁 CHANGED: this month instead of YTD -->
                    <span v-else>Overdue work orders (this month)</span>
                  </div>
                  <div class="mini-row">
                    <div>
                      <div class="mini-big">{{ formatNumber(miniOverdue) }}</div>
                      <div class="mini-status">
                        <div class="mini-row" v-show="miniOverdue > 0">
                          <el-tag type="danger">Overdue</el-tag>
                        </div>
                        <div class="mini-sub mt8 mini-status-ok" v-show="miniOverdue === 0">
                          No overdue work orders 🎉
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </el-col>

      <!-- Activity by Location card extracted to its own component -->
      <el-col :xs="24" :lg="8">
        <ActivityByLocationCard />
      </el-col>
    </el-row>

    <!-- ── MID ROW: CATEGORY + UPCOMING SCHEDULE ───────────── -->
    <el-row :gutter="16" class="mid-row mt16">
      <el-col :xs="24" :lg="12">
        <div class="panel tall-panel">
          <CategoryChart />
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="panel tall-panel">
          <UpcomingScheduleCard />
        </div>
      </el-col>
    </el-row>

    <div class="panel mt16">
      <div class="panel-header">
        <div>
          <div class="h-title">Work Order State</div>
          <div class="h-sub">Work orders due in the last 7 days</div>
        </div>
        <div class="filters">
          <el-radio-group v-model="status" size="small" class="chip-group">
            <el-radio-button label="Planned" />
            <el-radio-button label="Completed" />
            <el-radio-button label="Failed" />
            <el-radio-button label="Overdue" />
            <el-radio-button label="Others" />
          </el-radio-group>
        </div>
      </div>
      <div class="panel-body">
        <WOStateTable :status="status" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import WorkOrderStatsBarChart from './components/WorkOrderStatsBarChart.vue'
import WOStateTable from './components/WOStateTable.vue'
import CategoryChart from './components/CategoryChart.vue'
import UpcomingScheduleCard from './components/UpcomingScheduleCard.vue'
import ActivityByLocationCard from '@/views/dashboard2/components/ActivityByLocationCard.vue'
import { searchWorkOrders } from 'src/api/work-order'
import { Tickets, Clock, Check } from '@element-plus/icons-vue'

const range = ref( 'weekly' )

const weeklyCategories = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthlyCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const chartCategories = computed( () => ( range.value === 'weekly' ? weeklyCategories : monthlyCategories ) )

// ── STATE GROUPS ────────────────────────────────────────────────
// from your state list:
// 1 Forecast
// 2 Released
// 3 Cancelled
// 4 Pending
// 5 Ready
// 6 In progress
// 7 Completed
// 8 Aborted
// 9 Held
// 10 Suspended
// 11 Closed
// 12 Failed
// 13 Incomplete (overdue)
// 14 Pending Approval

const COMPLETED_STATE_ID = 7
const OVERDUE_STATE_ID = 13
const IN_PROGRESS_STATE_IDS = [2, 4, 5, 6, 9, 10, 14]

// "Planned" = everything except Cancelled(3) + Aborted(8)
const PLANNED_STATE_IDS = [
  1, // Forecast
  2, // Released
  4, // Pending
  5, // Ready
  6, // In progress
  7, // Completed
  9, // Held
  10, // Suspended
  11, // Closed
  12, // Failed
  13, // Incomplete (overdue)
  14 // Pending Approval
]

// ── chart data from API: Planned vs Completed ───────────────────
const weeklyAll = ref( Array( 7 ).fill( 0 ) ) // planned (excl cancelled/aborted)
const weeklyCompleted = ref( Array( 7 ).fill( 0 ) ) // completed
const monthlyAll = ref( Array( 12 ).fill( 0 ) ) // planned per month
const monthlyCompleted = ref( Array( 12 ).fill( 0 ) ) // completed per month

const chartSeriesAll = computed( () => ( range.value === 'weekly' ? weeklyAll.value : monthlyAll.value ) )
const chartSeriesCompleted = computed( () => ( range.value === 'weekly' ? weeklyCompleted.value : monthlyCompleted.value ) )

// ⭐ Separate loading states for weekly vs monthly chart
const weeklyChartLoading = ref( true )
const monthlyChartLoading = ref( false )
const yearlyLoaded = ref( false )

const chartLoading = computed( () => ( range.value === 'weekly' ? weeklyChartLoading.value : monthlyChartLoading.value ) )

const status = ref( 'All' )

/* ── KPI metrics (YTD) ─────────────────────────────────────────── */
const kpiTotal = ref( 0 ) // total planned (excl cancelled/aborted)
const kpiInProgress = ref( 0 )
const kpiCompleted = ref( 0 )
const kpiOverdue = ref( 0 )
const kpiOnTimeRate = ref( 0 ) // % among planned
const kpiLoading = ref( true )

/* Weekly / monthly stats for the mini-cards under bar chart (counts-only) */
const weeklyAllTotal = ref( 0 )
const weeklyCompletedTotal = ref( 0 )
const weeklyOverdueCount = ref( 0 )

const monthlyAllTotal = ref( 0 )
const monthlyCompletedTotal = ref( 0 )
const monthlyOverdueCount = ref( 0 )

// still keep yearly totals if you need them elsewhere
const yearlyAllTotal = ref( 0 )
const yearlyCompletedTotal = ref( 0 )
const yearlyOverdueCount = ref( 0 )

/* Mini stats that toggle with weekly/monthly */
const miniCompletionRate = computed( () => {
  const total = range.value === 'weekly' ? weeklyAllTotal.value : monthlyAllTotal.value
  const completed = range.value === 'weekly' ? weeklyCompletedTotal.value : monthlyCompletedTotal.value
  return total ? Math.round( ( completed / total ) * 100 ) : 0
} )

// hide overdue tag instantly while the relevant range is loading
const miniOverdue = computed( () => {
  if ( range.value === 'weekly' ) {
    if ( weeklyChartLoading.value ) return 0
    return weeklyOverdueCount.value
  }
  if ( monthlyChartLoading.value ) return 0
  return monthlyOverdueCount.value
} )

/* KPI cards derived from KPIs (YTD – still using due_date YTD) */
const cardList = computed( () => [
  {
    id : 1,
    end : kpiTotal.value,
    title : 'Planned Work Orders',
    icon : Tickets,
    badge : { txt : 'Year to date' }
  },
  {
    id : 2,
    end : kpiInProgress.value,
    title : 'Work Orders In Progress',
    icon : Clock,
    badge : { txt : 'Active now (YTD)' }
  },
  {
    id : 3,
    end : kpiCompleted.value,
    title : 'Completed Work Orders',
    icon : Check,
    badge : { txt : 'Year to date' }
  }
] )

const formatNumber = num => ( num == null ? '' : num.toLocaleString( 'en-US' ) )

/* ---------- helpers ---------- */

function getBucketDate( row ) {
  return row.due_date || row.dueDate || row.due_date_time || row.dueDateTime || null
}

function extractRows( res ) {
  const root = res?.data ?? res
  return root?.content ?? []
}

function extractTotal( res ) {
  const root = res?.data ?? res
  return root?.totalElements ?? 0
}

/** Weekly: current week (Sun → Sat) + weekly stats, by DUE DATE, PLANNED vs COMPLETED */
async function loadWeeklyData() {
  const now = new Date()

  const startOfWeek = new Date( now )
  const day = startOfWeek.getDay()
  startOfWeek.setDate( startOfWeek.getDate() - day )
  startOfWeek.setHours( 0, 0, 0, 0 )

  const endOfWeek = new Date( startOfWeek )
  endOfWeek.setDate( endOfWeek.getDate() + 6 )
  endOfWeek.setHours( 23, 59, 59, 999 )

  const basePayload = {
    latest_per_recurrence : false,
    due_date_from : startOfWeek.toISOString(),
    due_date_to : endOfWeek.toISOString()
  }

  const [resAll, resCompleted, resOverdue] = await Promise.all( [
    // 🔁 Planned = exclude cancelled(3) + aborted(8)
    searchWorkOrders( 1, 1000, 'dueDate', 'ASC', {
      ...basePayload,
      state_ids : PLANNED_STATE_IDS
    } ),
    searchWorkOrders( 1, 1000, 'dueDate', 'ASC', {
      ...basePayload,
      state_ids : [COMPLETED_STATE_ID]
    } ),
    searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
      ...basePayload,
      state_ids : [OVERDUE_STATE_ID]
    } )
  ] )

  const allCounts = Array( 7 ).fill( 0 )
  const completedCounts = Array( 7 ).fill( 0 )

  const rowsAll = extractRows( resAll )
  const rowsCompleted = extractRows( resCompleted )

  rowsAll.forEach( r => {
    const bd = getBucketDate( r )
    if ( !bd ) return
    const d = new Date( bd )
    if ( Number.isNaN( d.getTime() ) ) return
    const idx = d.getDay()
    allCounts[idx] += 1
  } )

  rowsCompleted.forEach( r => {
    const bd = getBucketDate( r )
    if ( !bd ) return
    const d = new Date( bd )
    if ( Number.isNaN( d.getTime() ) ) return
    const idx = d.getDay()
    completedCounts[idx] += 1
  } )

  weeklyAll.value = allCounts
  weeklyCompleted.value = completedCounts

  weeklyAllTotal.value = extractTotal( resAll )
  weeklyCompletedTotal.value = extractTotal( resCompleted )
  weeklyOverdueCount.value = extractTotal( resOverdue )
}

/** Yearly: 12 bars (PLANNED vs COMPLETED by month) + current-month totals */
async function loadYearlyChartData() {
  const now = new Date()
  const year = now.getFullYear()
  const currentMonth = now.getMonth()

  const allCounts = Array( 12 ).fill( 0 )
  const completedCounts = Array( 12 ).fill( 0 )

  const monthPromises = Array.from( { length : 12 }, ( _, month ) => {
    const startOfMonth = new Date( year, month, 1, 0, 0, 0, 0 )
    const endOfMonth = new Date( year, month + 1, 0, 23, 59, 59, 999 )

    const basePayload = {
      latest_per_recurrence : false,
      due_date_from : startOfMonth.toISOString(),
      due_date_to : endOfMonth.toISOString()
    }

    return ( async() => {
      const [resAll, resCompleted] = await Promise.all( [
        // planned
        searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
          ...basePayload,
          state_ids : PLANNED_STATE_IDS
        } ),
        // completed
        searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
          ...basePayload,
          state_ids : [COMPLETED_STATE_ID]
        } )
      ] )
      return {
        allCount : extractTotal( resAll ),
        completedCount : extractTotal( resCompleted )
      }
    } )()
  } )

  const monthResults = await Promise.all( monthPromises )

  let yearlyAllTotalLocal = 0
  let yearlyCompletedTotalLocal = 0

  monthResults.forEach( ( res, month ) => {
    allCounts[month] = res.allCount
    completedCounts[month] = res.completedCount
    yearlyAllTotalLocal += res.allCount
    yearlyCompletedTotalLocal += res.completedCount
  } )

  monthlyAll.value = allCounts
  monthlyCompleted.value = completedCounts
  yearlyAllTotal.value = yearlyAllTotalLocal
  yearlyCompletedTotal.value = yearlyCompletedTotalLocal

  // current month totals for mini cards
  monthlyAllTotal.value = allCounts[currentMonth]
  monthlyCompletedTotal.value = completedCounts[currentMonth]

  // yearly overdue (not used in mini-cards, but kept)
  const startOfYear = new Date( year, 0, 1, 0, 0, 0, 0 )
  const endOfYear = new Date( year, 11, 31, 23, 59, 59, 999 )

  const overduePayloadYear = {
    latest_per_recurrence : false,
    due_date_from : startOfYear.toISOString(),
    due_date_to : endOfYear.toISOString(),
    state_ids : [OVERDUE_STATE_ID]
  }

  const overdueResYear = await searchWorkOrders( 1, 1, 'dueDate', 'ASC', overduePayloadYear )
  yearlyOverdueCount.value = extractTotal( overdueResYear )

  // current month overdue for mini cards
  const startOfCurrentMonth = new Date( year, currentMonth, 1, 0, 0, 0, 0 )
  const endOfCurrentMonth = new Date( year, currentMonth + 1, 0, 23, 59, 59, 999 )

  const overduePayloadMonth = {
    latest_per_recurrence : false,
    due_date_from : startOfCurrentMonth.toISOString(),
    due_date_to : endOfCurrentMonth.toISOString(),
    state_ids : [OVERDUE_STATE_ID]
  }

  const overdueResMonth = await searchWorkOrders( 1, 1, 'dueDate', 'ASC', overduePayloadMonth )
  monthlyOverdueCount.value = extractTotal( overdueResMonth )
}

/** Year-to-date KPIs: PLANNED vs COMPLETED/OVERDUE/IN PROGRESS */
async function loadYtdKpiData() {
  kpiLoading.value = true
  try {
    const now = new Date()
    const startOfYear = new Date( now.getFullYear(), 0, 1, 0, 0, 0, 0 )
    const endOfYear = now

    const basePayload = {
      latest_per_recurrence : false,
      due_date_from : startOfYear.toISOString(),
      due_date_to : endOfYear.toISOString()
    }

    const [resTotal, resCompleted, resOverdue, resInProgress] = await Promise.all( [
      // total planned (exclude cancelled + aborted)
      searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
        ...basePayload,
        state_ids : PLANNED_STATE_IDS
      } ),
      // completed
      searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
        ...basePayload,
        state_ids : [COMPLETED_STATE_ID]
      } ),
      // overdue
      searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
        ...basePayload,
        state_ids : [OVERDUE_STATE_ID]
      } ),
      // in progress group
      searchWorkOrders( 1, 1, 'dueDate', 'ASC', {
        ...basePayload,
        state_ids : IN_PROGRESS_STATE_IDS
      } )
    ] )

    const totalWO = extractTotal( resTotal )
    const completedTotal = extractTotal( resCompleted )
    const overdueTotal = extractTotal( resOverdue )
    const inProgressTotal = extractTotal( resInProgress )

    kpiTotal.value = totalWO
    kpiCompleted.value = completedTotal
    kpiInProgress.value = inProgressTotal
    kpiOverdue.value = overdueTotal

    // on-time ≈ completion rate among planned
    kpiOnTimeRate.value = totalWO ? Math.round( ( completedTotal / totalWO ) * 100 ) : 0
  } catch ( err ) {
    console.error( 'Failed to load YTD KPIs:', err )
  } finally {
    kpiLoading.value = false
  }
}

/** Lazy loader for yearly (monthly tab) data */
async function ensureYearlyChartData() {
  if ( yearlyLoaded.value ) return
  monthlyChartLoading.value = true
  try {
    await loadYearlyChartData()
    yearlyLoaded.value = true
  } catch ( err ) {
    console.error( 'Failed to load yearly chart data:', err )
  } finally {
    monthlyChartLoading.value = false
  }
}

watch( range, val => {
  if ( val === 'monthly' ) {
    ensureYearlyChartData()
  }
} )

onMounted( async() => {
  weeklyChartLoading.value = true
  try {
    await loadWeeklyData()
  } catch ( err ) {
    console.error( 'Failed to load weekly stats:', err )
  } finally {
    weeklyChartLoading.value = false
  }

  loadYtdKpiData()
} )
</script>

<style scoped lang="scss">
/* your existing styles – unchanged */
.dashboard {
  padding: 24px;
  background: var(--el-bg-color-page);
}

/* ── Generic Card/Panel look ───────────────────────────────────── */
.panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(16, 24, 40, 0.02), 0 1px 2px rgba(16, 24, 40, 0.06);
  transition: box-shadow 0.2s ease;
}

.panel:hover {
  transform: none !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.panel-body {
  padding: 16px;
}

/* 🔥 extra bottom padding inside the chart panel body
   so overflowed x-axis labels don't collide with mini cards */
.chart-panel-body {
  padding: 16px 16px 32px;
}

/* Chart container: fixed height, no clipping */
.wo-chart {
  width: 100%;
  height: 300px;
  position: relative;
}

/* make chart libraries fill the container */
.wo-chart :deep(svg),
.wo-chart :deep(canvas),
.wo-chart :deep(.apexcharts-canvas),
.wo-chart :deep(.echarts) {
  width: 100%;
  height: 100%;
}

.h-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}
.h-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.mt16 {
  margin-top: 16px;
}
.mb16 {
  margin-bottom: 16px;
}

/* ── KPI Cards ─────────────────────────────────────────────────── */
.kpi-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 18px;
  min-height: 80px;
}

.kpi-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  display: grid;
  place-items: center;
  color: var(--el-text-color-secondary);
}

.kpi-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.kpi-text .kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--el-text-color-primary);
  line-height: 1;
}
.kpi-text .kpi-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

/* ── Mini stat cards (under bar chart) ─────────────────────────── */

.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 16px 16px;
  margin-top: 4px;
}

/* fixed, stable height */
.mini.panel {
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 90px;
}

.borderless {
  border: 1px dashed var(--el-border-color-lighter);
}

.mini-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mini-big {
  font-size: 24px;
  font-weight: 800;
  color: var(--el-text-color-primary);
  margin: 4px 0 10px;
}

.mini-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mini-med {
  font-size: 16px;
  font-weight: 700;
  margin-top: 8px;
}

.mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-delta {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 6px;
}

/* ⭐ fixed-height status section (tag + text) */
.mini-status {
  margin-top: 4px;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.mini-status-tag {
  align-self: flex-start;
}

.mini-status-ok {
  line-height: 1.4;
}

/* ⭐⭐ Make “Work Order Stats” and “Activity by Location” same height */
.charts-row {
  display: flex;
  align-items: stretch;
}

.charts-row :deep(.el-col) {
  display: flex;
}

.charts-row :deep(.el-col > .panel) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mt8 {
  margin-top: 8px;
}

/* Vertical spacing on tablet & mobile */
@media (max-width: 991.98px) {
  .kpi-card {
    margin-bottom: 10px;
  }

  .charts-row :deep(.el-col > .panel) {
    margin-bottom: 12px;
  }

  .dashboard > .panel {
    margin-top: 0;
    margin-bottom: 12px;
  }

  .mini.panel {
    margin-bottom: 0;
  }
  .mb16 {
    margin-bottom: 4px !important;
  }
  .dashboard :deep(.el-row) {
    margin-bottom: 4px !important;
  }
}

/* ---- New mid-row equal height ---- */
.mid-row {
  display: flex;
  align-items: stretch;
}

.mid-row :deep(.el-col) {
  display: flex;
}

.mid-row :deep(.el-col > .panel) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Make both new charts taller */
.tall-panel {
  min-height: 300px;
}

.mini-row {
  display: flex;
  align-items: center;
  gap: 4px; /* space between icon and text */
}

.mini-icon-warning {
  color: red; /* icon becomes red */
  font-size: 16px;
}

@media (max-width: 991.98px) {
  .tall-panel {
    min-height: auto;
  }
}
</style>

<template>
  <div>
    <el-divider />

    <h3 class="section-title">Related Work Orders</h3>

    <!-- Loading -->
    <el-skeleton v-if="loading" animated />

    <!-- Empty -->
    <el-empty
      v-else-if="partUsageRows.length === 0"
      description="This part has not been used in any work orders yet"
      :image-size="60"
    />

    <!-- Content -->
    <div v-else>
      <!-- KPI SUMMARY -->
      <div class="progress-header">
        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-label">Work Orders</div>
            <div class="stat-value">{{ totalWorkOrders }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">Units Used</div>
            <div class="stat-value">{{ totalUsed }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-label">Avg / WO</div>
            <div class="stat-value">
              {{ avgUsedPerWO }}
            </div>
          </div>
        </div>
      </div>

      <!-- CHARTS -->
      <div class="chart-grid">
        <div ref="woCountChartRef" class="chart"></div>
        <div ref="usageQtyChartRef" class="chart"></div>
      </div>
    </div>

    <!-- WORK ORDER LIST -->
    <div class="wo-list">
      <el-card v-for="wo in workOrdersUsed" :key="wo.id" class="wo-card" shadow="never" @click="handleView(wo)">
        <div class="wo-card-content">
          <div class="wo-main">
            <div class="wo-name">{{ wo.name }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

/* -------------------------
   PROPS
-------------------------- */
const props = defineProps( {
  partId : {
    type : Number,
    required : true
  },
  workOrders : {
    type : Array,
    default : () => []
  },
  loading : {
    type : Boolean,
    default : false
  }
} )

const router = useRouter()

/* -------------------------
   DATA NORMALIZATION
-------------------------- */
const partUsageRows = computed( () => {
  const rows = []

  props.workOrders.forEach( wo => {
    wo.task_list?.forEach( task => {
      task.parts_list?.forEach( p => {
        if ( p.part_id === props.partId ) {
          rows.push( {
            workOrderId : wo.id,
            date : wo.finished_at || wo.start_date,
            required : p.required_quantity ?? 0,
            used : p.used_quantity ?? 0
          } )
        }
      } )
    } )
  } )

  return rows
} )

/* -------------------------
   KPI COMPUTATIONS
-------------------------- */
const totalWorkOrders = computed( () => new Set( partUsageRows.value.map( r => r.workOrderId ) ).size )

const totalUsed = computed( () => partUsageRows.value.reduce( ( s, r ) => s + r.used, 0 ) )

const avgUsedPerWO = computed( () =>
  totalWorkOrders.value === 0 ? 0 : ( totalUsed.value / totalWorkOrders.value ).toFixed( 1 )
)

/* -------------------------
   GROUP BY DATE
-------------------------- */
const groupedByDate = computed( () => {
  const map = {}

  partUsageRows.value.forEach( r => {
    const date = r.date?.slice( 0, 10 )
    if ( !map[date] ) {
      map[date] = {
        workOrders : new Set(),
        required : 0,
        used : 0
      }
    }
    map[date].workOrders.add( r.workOrderId )
    map[date].required += r.required
    map[date].used += r.used
  } )

  return Object.entries( map )
    .sort( ( [a], [b] ) => a.localeCompare( b ) )
    .map( ( [date, v] ) => ( {
      date,
      woCount : v.workOrders.size,
      required : v.required,
      used : v.used
    } ) )
} )

/* -------------------------
   CHART REFS
-------------------------- */
const woCountChartRef = ref( null )
const usageQtyChartRef = ref( null )

const workOrdersUsed = computed( () => {
  const map = new Map()

  partUsageRows.value.forEach( r => {
    if ( !map.has( r.workOrderId ) ) {
      map.set( r.workOrderId, {
        id : r.workOrderId,
        name : props.workOrders.find( w => w.id === r.workOrderId )?.name || '-',
        state : props.workOrders.find( w => w.id === r.workOrderId )?.state?.name || '-',
        date : r.date,
        required : 0,
        used : 0
      } )
    }

    const wo = map.get( r.workOrderId )
    wo.required += r.required
    wo.used += r.used
  } )

  return Array.from( map.values() ).sort( ( a, b ) => new Date( b.date ) - new Date( a.date ) )
} )

const handleView = row => {
  router.push( {
    name : 'ViewWorkOrder',
    params : { id : row.id }
  } )
}

let woCountChart = null
let usageQtyChart = null

/* -------------------------
   INIT CHARTS
-------------------------- */
function initCharts() {
  if ( !woCountChartRef.value || !usageQtyChartRef.value ) return

  woCountChart = echarts.init( woCountChartRef.value )
  usageQtyChart = echarts.init( usageQtyChartRef.value )

  woCountChart.setOption( {
    tooltip : { trigger : 'axis' },
    grid : {
      top : 60,
      left : '6%',
      right : '4%',
      bottom : '8%',
      containLabel : true
    },
    xAxis : {
      type : 'category',
      data : groupedByDate.value.map( d => d.date )
    },
    yAxis : {
      type : 'value',
      minInterval : 1
    },
    series : [
      {
        type : 'line',
        smooth : true,
        symbolSize : 8,
        data : groupedByDate.value.map( d => d.woCount )
      }
    ]
  } )

  usageQtyChart.setOption( {
    title : {
      text : 'Required vs Used Quantity',
      left : 'center'
    },
    tooltip : { trigger : 'axis' },
    legend : {
      top : 32
    },
    grid : {
      top : 80,
      left : '6%',
      right : '4%',
      bottom : '8%',
      containLabel : true
    },
    xAxis : {
      type : 'category',
      data : groupedByDate.value.map( d => d.date )
    },
    yAxis : {
      type : 'value'
    },
    series : [
      {
        name : 'Required',
        type : 'bar',
        data : groupedByDate.value.map( d => d.required )
      },
      {
        name : 'Used',
        type : 'bar',
        data : groupedByDate.value.map( d => d.used )
      }
    ]
  } )
}

/* -------------------------
   RESIZE HANDLING
-------------------------- */
function handleResize() {
  woCountChart?.resize()
  usageQtyChart?.resize()
}

/* -------------------------
   LIFECYCLE
-------------------------- */
onMounted( () => {
  nextTick( () => {
    initCharts()
    window.addEventListener( 'resize', handleResize )
  } )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
  woCountChart?.dispose()
  usageQtyChart?.dispose()
} )

/* -------------------------
   REACTIVE UPDATE
-------------------------- */
watch( groupedByDate, () => {
  nextTick( () => {
    woCountChart?.setOption( {
      xAxis : { data : groupedByDate.value.map( d => d.date ) },
      series : [{ data : groupedByDate.value.map( d => d.woCount ) }]
    } )

    usageQtyChart?.setOption( {
      xAxis : { data : groupedByDate.value.map( d => d.date ) },
      series : [{ data : groupedByDate.value.map( d => d.required ) }, { data : groupedByDate.value.map( d => d.used ) }]
    } )
  } )
} )
</script>

<style scoped>
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 36px;
}

.chart {
  height: 260px;
}

.progress-header {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 24px;
}

.progress-stats {
  display: flex;
  gap: 120px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
}

.wo-list {
  margin-top: 32px;
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.wo-card {
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wo-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.wo-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wo-main {
  display: flex;
  flex-direction: column;
}

.wo-name {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.wo-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

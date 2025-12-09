<template>
  <div class="panel">
    <div class="panel-header header-with-subtitle">
      <div>
        <div class="h-title">Category</div>
        <div class="h-subtitle">Work orders due in the last 7 days</div>
      </div>
    </div>

    <div class="panel-body sales-body">
      <div class="donut-left">
        <div ref="chartEl" class="donut-chart"></div>
      </div>

      <!-- ⭐ TWO-COLUMN LEGEND -->
      <div class="donut-right">
        <div v-for="item in items" :key="item.label" class="sales-row">
          <span class="sales-dot" :style="{ backgroundColor: item.color }"></span>

          <div class="sales-text">
            <div class="sales-label">{{ item.label }}</div>
            <div class="sales-meta">{{ item.percent }}% · {{ formatNumber(item.products) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { searchWorkOrders } from 'src/api/work-order'

/* 🎨 Your fixed category colors */
const CATEGORY_COLORS = {
  Reactive : '#ff9f7f', // danger
  Preventative : '#91cc75', // success
  Preventive : '#91cc75',
  Other : '#d3d3d3',
  'Follow up' : '#fac858', // warning
  Corrective : '#409EFF',
  SOP : '#a0cfff',
  Inspection : '#c6e2ff',
  Safety : '#e0e0e0'
}

/* 🎨 For unknown categories → blue/gray tones only */
function genColor( label ) {
  let hash = 0
  for ( let i = 0; i < label.length; i++ ) {
    hash = label.charCodeAt( i ) + ( ( hash << 5 ) - hash )
  }

  const hue = 200 + ( Math.abs( hash ) % 40 )
  const sat = 10 + ( Math.abs( hash ) % 25 )
  const light = 55
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

function resolveColor( label ) {
  return CATEGORY_COLORS[label] || genColor( label )
}

/* ------------------------------------------------------ */
/* ⭐ ADD: color → hue helpers (for grouping similar colors) */
/* ------------------------------------------------------ */
function hexToRgb( hex ) {
  let c = hex.replace( '#', '' )
  if ( c.length === 3 ) {
    c = c
      .split( '' )
      .map( x => x + x )
      .join( '' )
  }
  const num = parseInt( c, 16 )
  return {
    r : ( num >> 16 ) & 255,
    g : ( num >> 8 ) & 255,
    b : num & 255
  }
}

function rgbToHue( r, g, b ) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max( r, g, b )
  const min = Math.min( r, g, b )
  const d = max - min
  let h = 0

  if ( d === 0 ) h = 0
  else if ( max === r ) h = ( ( g - b ) / d ) % 6
  else if ( max === g ) h = ( b - r ) / d + 2
  else h = ( r - g ) / d + 4

  h = Math.round( h * 60 )
  if ( h < 0 ) h += 360
  return h
}

function getHue( color ) {
  if ( !color ) return 0

  // hsl()
  const m = color.match( /hsl\(([\d.]+),/ )
  if ( m ) return parseFloat( m[1] )

  // hex
  if ( color.startsWith( '#' ) ) {
    const { r, g, b } = hexToRgb( color )
    return rgbToHue( r, g, b )
  }

  return 0
}
/* ------------------------------------------------------ */

const items = ref( [] )
const chartEl = ref( null )
let chartInstance = null

const formatNumber = num => ( num ?? 0 ).toLocaleString( 'en-US' )

/** Donut chart data */
const chartData = computed( () =>
  items.value.map( i => ( {
    name : i.label,
    value : i.percent,
    itemStyle : { color : i.color }
  } ) )
)

/** Center label */
const centerText = computed( () => `Work Orders\n${formatNumber( items.value.reduce( ( s, i ) => s + i.products, 0 ) )}` )

/** Build donut */
const buildOption = () => ( {
  tooltip : {
    trigger : 'item',
    formatter : p => `${p.name}: ${p.value}%`
  },
  series : [
    {
      type : 'pie',
      radius : ['54%', '81%'],
      label : { show : false },
      labelLine : { show : false },
      data : chartData.value
    }
  ],
  graphic : {
    type : 'text',
    left : 'center',
    top : 'center',
    style : {
      text : centerText.value,
      textAlign : 'center',
      fill : '#111827',
      fontSize : 15,
      fontWeight : 600,
      lineHeight : 20
    }
  }
} )

/** Fetch last 7 days */
async function loadCategoryData() {
  const end = new Date()
  const start = new Date()
  start.setDate( start.getDate() - 7 )

  const payload = {
    due_date_from : start.toISOString(),
    due_date_to : end.toISOString()
  }

  const res = await searchWorkOrders( 1, 500, 'dueDate', 'ASC', payload )
  const raw = res?.data?.data?.content ?? res?.data?.content ?? res?.content ?? []

  const counts = {}

  raw.forEach( wo => {
    const categories = wo.category_list?.map( c => c.name ) ?? ['Other']
    categories.forEach( cat => {
      if ( !counts[cat] ) counts[cat] = 0
      counts[cat]++
    } )
  } )

  const total = Object.values( counts ).reduce( ( a, b ) => a + b, 0 )

  const arr = Object.entries( counts ).map( ( [label, count] ) => ( {
    label,
    products : count,
    percent : total ? Math.round( ( count / total ) * 100 ) : 0,
    color : resolveColor( label )
  } ) )

  /* ⭐ SORT SIMILAR COLORS TOGETHER */
  arr.sort( ( a, b ) => getHue( a.color ) - getHue( b.color ) )

  items.value = arr
}

/** Init */
function initChart() {
  if ( !chartEl.value ) return
  chartInstance = echarts.init( chartEl.value )
  chartInstance.setOption( buildOption() )
}

onMounted( async() => {
  await loadCategoryData()
  initChart()
  window.addEventListener( 'resize', () => chartInstance?.resize() )
} )

watch( chartData, () => {
  chartInstance?.setOption( buildOption(), true )
} )
</script>

<style scoped lang="scss">
.panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(16, 24, 40, 0.02), 0 1px 2px rgba(16, 24, 40, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-with-subtitle {
  padding: 14px 16px;
}
.h-title {
  font-weight: 600;
  font-size: 16px;
}
.h-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.panel-body {
  flex: 1;
  display: flex;
  padding: 20px;
}

.sales-body {
  display: flex;
  gap: 24px;
  height: 100%;
  align-items: center; /* ⬅ THIS is the fix */
  margin-top: -10px; /* ⬅ lift everything upward slightly */
}

.donut-left {
  flex: 0 0 210px;
  display: flex;
  justify-content: center;
  align-items: flex-start; // ⬅ was center
}
.donut-chart {
  width: 100%;
  height: 210px; // match the flex-basis of donut-left
}

.donut-right {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
  align-content: start;
  margin-left: 40px;
}

.sales-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sales-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  margin-top: 4px;
}

.sales-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sales-label {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.sales-meta {
  font-size: 13px;
  color: #848b98;
}
</style>

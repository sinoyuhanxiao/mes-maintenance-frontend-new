<template>
  <div ref="el" class="wo-chart-root"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

/** Props */
const props = defineProps( {
  categories : {
    type : Array,
    default : () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  seriesA : {
    // "Planned"
    type : Array,
    default : () => []
  },
  seriesB : {
    // "Completed"
    type : Array,
    default : () => []
  },
  isWeekly : { type : Boolean, default : false },
  labelA : { type : String, default : 'Planned' },
  labelB : { type : String, default : 'Completed' }
} )

const COLORS = ['#C6E2FF', '#409EFF']

const el = ref( null )
let chart = null
let ro = null

// 🔹 dynamic labels for weekly view: ["Tue, 9th", ...]
const weeklyLabels = ref( [] )

/* ---------- helpers for weekly labels ---------- */

function getDaySuffix( day ) {
  if ( day >= 11 && day <= 13 ) return 'th'
  switch ( day % 10 ) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

function buildWeeklyLabels() {
  // We assume weekly = current week (Sun–Sat), same as your API query.
  const now = new Date()
  const startOfWeek = new Date( now )
  const day = startOfWeek.getDay() // 0–6 (Sun = 0)
  startOfWeek.setDate( startOfWeek.getDate() - day )
  startOfWeek.setHours( 0, 0, 0, 0 )

  const labels = []
  for ( let i = 0; i < 7; i++ ) {
    const d = new Date( startOfWeek )
    d.setDate( startOfWeek.getDate() + i )

    const weekday = d.toLocaleDateString( 'en-US', { weekday : 'short' } ) // "Tue"
    const date = d.getDate()
    const suffix = getDaySuffix( date )
    labels.push( `${weekday}, ${date}${suffix}` ) // "Tue, 9th"
  }

  weeklyLabels.value = labels
}

/* ---------- Y axis config ---------- */

function getYAxisConfig() {
  const allValues = [
    ...( Array.isArray( props.seriesA ) ? props.seriesA : [] ),
    ...( Array.isArray( props.seriesB ) ? props.seriesB : [] )
  ].map( v => ( typeof v === 'number' && !Number.isNaN( v ) ? v : 0 ) )

  if ( !allValues.length ) {
    return { max : 8, interval : 2 }
  }

  const rawMax = Math.max( ...allValues )
  let max = Math.ceil( rawMax / 8 ) * 8
  if ( max === 0 ) max = 8
  const interval = Math.ceil( max / 4 )
  return { max, interval }
}

/* ---------- chart option ---------- */

function buildOption() {
  const { max, interval } = getYAxisConfig()

  // Decide which labels to show on X:
  const xLabels =
    props.isWeekly && weeklyLabels.value.length === props.categories.length ? weeklyLabels.value : props.categories

  return {
    color : COLORS,

    tooltip : {
      trigger : 'axis',
      axisPointer : {
        // keep axis behavior, but pointer invisible
        type : 'line',
        lineStyle : {
          width : 0,
          color : 'rgba(0,0,0,0)'
        }
      },
      formatter : params => {
        if ( !Array.isArray( params ) || !params.length ) return ''

        const idx = params[0].dataIndex

        // Use dynamic weekly label if weekly mode, otherwise plain category
        const category = props.isWeekly
          ? weeklyLabels.value[idx] ?? props.categories[idx] ?? ''
          : props.categories[idx] ?? ''

        // Always read values directly from props so "Completed: 0" still shows
        const planned = props.seriesA?.[idx] ?? 0
        const completed = props.seriesB?.[idx] ?? 0

        return `
          <strong>${category}</strong><br/>
          <span style="
            display:inline-block;
            width:8px;
            height:8px;
            border-radius:50%;
            background:${COLORS[0]};
            margin-right:6px;"></span>
          ${props.labelA}: ${planned}<br/>
          <span style="
            display:inline-block;
            width:8px;
            height:8px;
            border-radius:50%;
            background:${COLORS[1]};
            margin-right:6px;"></span>
          ${props.labelB}: ${completed}
        `
      }
    },

    legend : {
      top : 6,
      left : 8,
      itemWidth : 10,
      itemHeight : 10,
      textStyle : { color : '#64748B', fontSize : 12 }
    },

    grid : {
      left : 48,
      right : 12,
      top : 36,
      bottom : 24,
      containLabel : false
    },

    xAxis : {
      type : 'category',
      data : xLabels,
      axisTick : { show : false },
      axisLine : { lineStyle : { color : '#E2E8F0' }},
      axisLabel : { color : '#475569' }
    },

    yAxis : {
      type : 'value',
      min : 0,
      max,
      interval,
      axisLabel : { color : '#475569', margin : 8 },
      splitLine : { show : false },
      axisLine : { show : false },
      axisTick : { show : false }
    },

    series : [
      {
        name : props.labelA,
        type : 'bar',
        data : props.seriesA,
        barWidth : 14,
        barGap : '20%',
        itemStyle : { borderRadius : [4, 4, 0, 0] }
      },
      {
        name : props.labelB,
        type : 'bar',
        data : props.seriesB,
        barWidth : 14,
        itemStyle : { borderRadius : [4, 4, 0, 0] }
      }
    ]
  }
}

/* ---------- init / lifecycle ---------- */

function initChart() {
  if ( !el.value ) return

  chart = echarts.init( el.value, null, {
    renderer : 'canvas'
  } )

  // build initial weekly labels if needed
  if ( props.isWeekly ) {
    buildWeeklyLabels()
  }

  chart.setOption( buildOption() )

  const dom = chart.getDom && chart.getDom()
  if ( dom ) {
    dom.style.background = 'transparent'
  }

  ro = new ResizeObserver( () => chart && chart.resize() )
  ro.observe( el.value )
  window.addEventListener( 'resize', handleResize )
}

function handleResize() {
  chart && chart.resize()
}

onMounted( () => {
  initChart()
} )

watch(
  () => [props.categories, props.seriesA, props.seriesB, props.labelA, props.labelB, props.isWeekly],
  () => {
    if ( !chart ) return

    // recompute weekly labels whenever weekly flag / data changes
    if ( props.isWeekly ) {
      buildWeeklyLabels()
    }

    chart.clear()
    chart.setOption( buildOption(), { notMerge : true, lazyUpdate : false } )
  },
  { deep : true }
)

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
  if ( ro && el.value ) ro.unobserve( el.value )
  if ( chart ) {
    chart.dispose()
    chart = null
  }
} )
</script>

<style scoped>
.wo-chart-root {
  width: 100%;
  height: 320px;
}
</style>

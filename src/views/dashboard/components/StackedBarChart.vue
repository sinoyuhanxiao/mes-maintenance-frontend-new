<template>
  <div :class="props.className" :style="{ height: props.height, width: props.width }" ref="container" />
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps( {
  className : {
    type : String,
    default : 'chart'
  },
  width : {
    type : String,
    default : '100%'
  },
  height : {
    type : String,
    default : '300px'
  }
} )

const chart = ref( null )
const container = ref( null )

const initChart = () => {
  chart.value = echarts.init( container.value )

  chart.value.setOption( {
    tooltip : {
      trigger : 'axis',
      axisPointer : {
        type : 'shadow'
      },
      formatter : params => {
        let result = `${params[0].axisValue}<br/>`
        let total = 0
        params.forEach( item => {
          result += `${item.marker} ${item.seriesName}: ${item.value} hrs<br/>`
          total += item.value
        } )
        result += `<strong>Total: ${total} hrs</strong>`
        return result
      }
    },
    legend : {
      data : ['Planned Maintenance', 'Unplanned Downtime', 'Repair Time'],
      top : 10
    },
    grid : {
      top : 50,
      left : '3%',
      right : '4%',
      bottom : '3%',
      containLabel : true
    },
    xAxis : {
      type : 'category',
      data : ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    },
    yAxis : {
      type : 'value',
      name : 'Hours',
      axisLabel : {
        formatter : '{value} hrs'
      }
    },
    series : [
      {
        name : 'Planned Maintenance',
        type : 'bar',
        stack : 'downtime',
        data : [12, 10, 14, 11],
        itemStyle : {
          color : '#29bbe3'
        }
      },
      {
        name : 'Unplanned Downtime',
        type : 'bar',
        stack : 'downtime',
        data : [8, 15, 6, 12],
        itemStyle : {
          color : '#ec536c'
        }
      },
      {
        name : 'Repair Time',
        type : 'bar',
        stack : 'downtime',
        data : [18, 22, 16, 20],
        itemStyle : {
          color : '#f5b225'
        }
      }
    ],
    animationEasing : 'cubicInOut'
  } )
}

const handleResize = () => {
  if ( chart.value ) {
    chart.value.resize()
  }
}

onMounted( () => {
  nextTick( () => {
    initChart()
    window.addEventListener( 'resize', handleResize )
  } )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
  if ( !chart.value ) {
    return
  }
  chart.value.dispose()
  chart.value = null
} )

defineOptions( {
  name : 'StackedBarChart'
} )
</script>

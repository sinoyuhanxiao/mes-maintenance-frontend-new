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

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8']
  const preventiveData = [125, 118, 112, 108, 105, 102, 98, 95]
  const correctiveData = [88, 85, 82, 79, 76, 73, 71, 68]

  chart.value.setOption( {
    tooltip : {
      trigger : 'axis',
      axisPointer : {
        type : 'cross',
        label : {
          backgroundColor : '#6a7985'
        }
      },
      formatter : params => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach( item => {
          result += `${item.marker} ${item.seriesName}: ${item.value} min<br/>`
        } )
        return result
      }
    },
    legend : {
      data : ['Preventive Maintenance', 'Corrective Maintenance'],
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
      boundaryGap : false,
      data : weeks
    },
    yAxis : {
      type : 'value',
      name : 'Minutes',
      axisLabel : {
        formatter : '{value} min'
      }
    },
    series : [
      {
        name : 'Preventive Maintenance',
        type : 'line',
        smooth : true,
        stack : 'Total',
        areaStyle : {
          color : new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
            { offset : 0, color : 'rgba(0, 133, 164, 0.5)' },
            { offset : 1, color : 'rgba(0, 133, 164, 0.1)' }
          ] )
        },
        emphasis : {
          focus : 'series'
        },
        data : preventiveData,
        itemStyle : {
          color : '#0085a4'
        }
      },
      {
        name : 'Corrective Maintenance',
        type : 'line',
        smooth : true,
        stack : 'Total',
        areaStyle : {
          color : new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
            { offset : 0, color : 'rgba(236, 83, 108, 0.5)' },
            { offset : 1, color : 'rgba(236, 83, 108, 0.1)' }
          ] )
        },
        emphasis : {
          focus : 'series'
        },
        data : correctiveData,
        itemStyle : {
          color : '#ec536c'
        }
      }
    ]
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
  name : 'AreaChart'
} )
</script>

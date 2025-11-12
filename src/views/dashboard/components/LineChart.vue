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

  // Simulated equipment availability data over 30 days
  const days = []
  const productionLineData = []
  const equipmentGroupData = []
  const criticalEquipmentData = []

  for ( let i = 30; i >= 1; i-- ) {
    days.push( `Day ${31 - i}` )
    // Production line: 92-96% availability
    productionLineData.push( ( 92 + Math.random() * 4 ).toFixed( 1 ) )
    // Equipment group: 88-94% availability
    equipmentGroupData.push( ( 88 + Math.random() * 6 ).toFixed( 1 ) )
    // Critical equipment: 94-98% availability
    criticalEquipmentData.push( ( 94 + Math.random() * 4 ).toFixed( 1 ) )
  }

  chart.value.setOption( {
    tooltip : {
      trigger : 'axis',
      axisPointer : {
        type : 'cross'
      },
      formatter : params => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach( item => {
          result += `${item.marker} ${item.seriesName}: ${item.value}%<br/>`
        } )
        return result
      }
    },
    legend : {
      data : ['Production Lines', 'Equipment Groups', 'Critical Equipment'],
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
      data : days,
      axisLabel : {
        rotate : 45,
        interval : 4
      }
    },
    yAxis : {
      type : 'value',
      name : 'Availability %',
      min : 80,
      max : 100,
      axisLabel : {
        formatter : '{value}%'
      }
    },
    series : [
      {
        name : 'Production Lines',
        type : 'line',
        smooth : true,
        data : productionLineData,
        itemStyle : {
          color : '#0085a4'
        },
        areaStyle : {
          color : new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
            { offset : 0, color : 'rgba(0, 133, 164, 0.3)' },
            { offset : 1, color : 'rgba(0, 133, 164, 0.05)' }
          ] )
        }
      },
      {
        name : 'Equipment Groups',
        type : 'line',
        smooth : true,
        data : equipmentGroupData,
        itemStyle : {
          color : '#29bbe3'
        },
        areaStyle : {
          color : new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
            { offset : 0, color : 'rgba(41, 187, 227, 0.3)' },
            { offset : 1, color : 'rgba(41, 187, 227, 0.05)' }
          ] )
        }
      },
      {
        name : 'Critical Equipment',
        type : 'line',
        smooth : true,
        data : criticalEquipmentData,
        itemStyle : {
          color : '#f5b225'
        },
        areaStyle : {
          color : new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
            { offset : 0, color : 'rgba(245, 178, 37, 0.3)' },
            { offset : 1, color : 'rgba(245, 178, 37, 0.05)' }
          ] )
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
  name : 'LineChart'
} )
</script>

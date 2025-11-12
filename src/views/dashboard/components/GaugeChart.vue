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
    series : [
      {
        type : 'gauge',
        startAngle : 180,
        endAngle : 0,
        min : 0,
        max : 100,
        radius : '90%',
        center : ['50%', '70%'],
        splitNumber : 10,
        axisLine : {
          lineStyle : {
            width : 6,
            color : [
              [0.6, '#ec536c'],
              [0.8, '#f5b225'],
              [1, '#67c23a']
            ]
          }
        },
        pointer : {
          icon : 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length : '60%',
          width : 10,
          offsetCenter : [0, '-50%'],
          itemStyle : {
            color : 'auto'
          }
        },
        axisTick : {
          length : 8,
          lineStyle : {
            color : 'auto',
            width : 1
          }
        },
        splitLine : {
          length : 12,
          lineStyle : {
            color : 'auto',
            width : 3
          }
        },
        axisLabel : {
          color : '#464646',
          fontSize : 12,
          distance : -50,
          formatter : value => {
            return value + '%'
          }
        },
        title : {
          offsetCenter : [0, '10%'],
          fontSize : 16,
          color : '#333'
        },
        detail : {
          fontSize : 32,
          offsetCenter : [0, '-15%'],
          valueAnimation : true,
          formatter : value => {
            return value.toFixed( 1 ) + '%'
          },
          color : 'auto'
        },
        data : [
          {
            value : 83.4,
            name : 'Completion Rate'
          }
        ]
      }
    ]
  } )

  // Add target indicator
  setTimeout( () => {
    const option = chart.value.getOption()
    option.graphic = [
      {
        type : 'text',
        left : 'center',
        top : '85%',
        style : {
          text : 'Target: 85%',
          fontSize : 14,
          fontWeight : 'bold',
          fill : '#909399'
        }
      }
    ]
    chart.value.setOption( option )
  }, 1500 )
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
  name : 'GaugeChart'
} )
</script>

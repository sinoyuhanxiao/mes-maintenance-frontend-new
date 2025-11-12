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
      trigger : 'item',
      formatter : '{a} <br/>{b}: {c} ({d}%)'
    },
    legend : {
      orient : 'vertical',
      right : '10',
      top : 'center',
      data : ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected']
    },
    series : [
      {
        name : 'Request Status',
        type : 'pie',
        radius : ['40%', '70%'],
        center : ['40%', '50%'],
        avoidLabelOverlap : false,
        label : {
          show : false,
          position : 'center'
        },
        emphasis : {
          label : {
            show : true,
            fontSize : '20',
            fontWeight : 'bold'
          }
        },
        labelLine : {
          show : false
        },
        data : [
          {
            value : 45,
            name : 'Pending',
            itemStyle : { color : '#f5b225' }
          },
          {
            value : 28,
            name : 'Approved',
            itemStyle : { color : '#0085a4' }
          },
          {
            value : 35,
            name : 'In Progress',
            itemStyle : { color : '#29bbe3' }
          },
          {
            value : 82,
            name : 'Completed',
            itemStyle : { color : '#67c23a' }
          },
          {
            value : 12,
            name : 'Rejected',
            itemStyle : { color : '#ec536c' }
          }
        ],
        animationType : 'scale',
        animationEasing : 'elasticOut',
        animationDelay : () => {
          return Math.random() * 200
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
  name : 'DonutChart'
} )
</script>

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
      formatter : '{b}: {c} units'
    },
    grid : {
      top : 10,
      left : '3%',
      right : '4%',
      bottom : '3%',
      containLabel : true
    },
    xAxis : {
      type : 'value',
      name : 'Usage (units)',
      axisLabel : {
        formatter : '{value}'
      }
    },
    yAxis : {
      type : 'category',
      data : [
        'Lubricant Oil',
        'Bearing Set',
        'Belt Assembly',
        'Filter Cartridge',
        'Safety Gloves',
        'Cleaning Solution',
        'Seal Kit',
        'Motor Coupling',
        'Sensor Module',
        'Control Panel'
      ].reverse()
    },
    series : [
      {
        name : 'Resource Usage',
        type : 'bar',
        data : [
          { value : 245, itemStyle : { color : '#0085a4' }},
          { value : 189, itemStyle : { color : '#0085a4' }},
          { value : 167, itemStyle : { color : '#0085a4' }},
          { value : 142, itemStyle : { color : '#29bbe3' }},
          { value : 135, itemStyle : { color : '#29bbe3' }},
          { value : 128, itemStyle : { color : '#29bbe3' }},
          { value : 98, itemStyle : { color : '#67c23a' }},
          { value : 87, itemStyle : { color : '#67c23a' }},
          { value : 76, itemStyle : { color : '#67c23a' }},
          { value : 65, itemStyle : { color : '#67c23a' }}
        ].reverse(),
        barWidth : '60%',
        animationDelay : idx => {
          return idx * 80
        }
      }
    ],
    animationEasing : 'elasticOut',
    animationDelayUpdate : idx => {
      return idx * 5
    }
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
  name : 'HorizontalBarChart'
} )
</script>

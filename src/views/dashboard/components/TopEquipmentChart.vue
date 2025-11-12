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
      formatter : '{b}: {c} times'
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
      name : 'Maintenance Count',
      axisLabel : {
        formatter : '{value}'
      }
    },
    yAxis : {
      type : 'category',
      data : [
        'Conveyor Belt A1',
        'Robotic Arm R2',
        'CNC Machine M3',
        'Hydraulic Press P1',
        'Assembly Line L2',
        'Quality Scanner Q1',
        'Packaging Unit PU1',
        'Cooling System C4',
        'Power Generator G2',
        'Air Compressor AC3'
      ].reverse()
    },
    series : [
      {
        name : 'Maintenance Frequency',
        type : 'bar',
        data : [
          { value : 28, itemStyle : { color : '#ec536c' }},
          { value : 24, itemStyle : { color : '#ec536c' }},
          { value : 22, itemStyle : { color : '#f5b225' }},
          { value : 19, itemStyle : { color : '#f5b225' }},
          { value : 17, itemStyle : { color : '#f5b225' }},
          { value : 15, itemStyle : { color : '#0085a4' }},
          { value : 13, itemStyle : { color : '#0085a4' }},
          { value : 12, itemStyle : { color : '#0085a4' }},
          { value : 10, itemStyle : { color : '#67c23a' }},
          { value : 9, itemStyle : { color : '#67c23a' }}
        ].reverse(),
        barWidth : '60%',
        animationDelay : idx => {
          return idx * 100
        },
        label : {
          show : true,
          position : 'right',
          formatter : '{c}'
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
  name : 'TopEquipmentChart'
} )
</script>

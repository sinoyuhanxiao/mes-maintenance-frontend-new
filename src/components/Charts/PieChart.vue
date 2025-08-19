<template>
  <div ref="chartRef" style="width: 400px; height: 230px"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps( {
  chartData : Array,
  chartTitle : String
} )

const chartRef = ref( null )
let chartInstance = null

const renderChart = () => {
  if ( !chartRef.value ) return

  if ( !chartInstance ) {
    chartInstance = echarts.init( chartRef.value )
  }

  chartInstance.setOption( {
    tooltip : { trigger : 'item' },
    title : {
      text : props.chartTitle,
      left : 'center',
      top : '5%',
      textStyle : { fontSize : 14 }
    },
    legend : { top : '20%', left : 'center' },
    series : [
      {
        name : 'Work Order Priority',
        type : 'pie',
        radius : ['40%', '70%'],
        avoidLabelOverlap : false,
        padAngle : 5,
        itemStyle : { borderRadius : 10 },
        label : { show : false, position : 'center' },
        emphasis : {
          label : {
            show : true,
            fontSize : 18,
            fontWeight : 'bold'
          }
        },
        labelLine : { show : false },
        data : props.chartData,
        top : '30%'
      }
    ]
  } )
}

onMounted( () => {
  renderChart()
} )

watch(
  () => props.chartData,
  () => {
    renderChart()
  },
  { deep : true }
)
</script>

<template>
  <div class="pie-chart-widget">
    <h3 class="title">{{ props.title }}</h3>
    <div class="buttons-grid">
      <color-display-button
        v-for="(item, index) in props.data"
        :key="index"
        :name="item.name"
        :value="item.value"
        :color="item.color"
      />
    </div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import ColorDisplayButton from 'src/components/Common/ColorDisplayButton.vue'

const props = defineProps( {
  title : { type : String, default : 'Pie Chart' },
  data : { type : Array, required : true }
} )

const chart = ref( null )
const myChart = ref( null )
let resizeObserver = null

function renderChart() {
  if ( !chart.value ) return

  const rect = chart.value.getBoundingClientRect()
  if ( rect.width === 0 || rect.height === 0 ) {
    setTimeout( renderChart, 100 )
    return
  }

  const existing = echarts.getInstanceByDom( chart.value )
  if ( existing ) {
    existing.dispose()
  }

  myChart.value = echarts.init( chart.value )
  myChart.value.setOption( {
    title : {
      text : '',
      left : 'center'
    },
    tooltip : {
      trigger : 'item'
    },
    color : props.data.map( item => item.color ),
    series : [
      {
        name : 'Status',
        type : 'pie',
        radius : ['40%', '70%'],
        avoidLabelOverlap : false,
        itemStyle : {
          borderRadius : 10,
          borderColor : '#fff',
          borderWidth : 2
        },
        label : { show : false, position : 'center' },
        emphasis : {
          label : {
            show : true,
            fontSize : 25,
            fontWeight : 'bold'
          }
        },
        labelLine : { show : false },
        data : props.data
      }
    ]
  } )
}

onMounted( async() => {
  await nextTick()
  setTimeout( () => {
    renderChart()
  }, 50 )

  resizeObserver = new ResizeObserver( () => {
    if ( myChart.value ) {
      myChart.value.resize()
    }
  } )

  if ( chart.value ) {
    resizeObserver.observe( chart.value )
  }
} )

onBeforeUnmount( () => {
  if ( resizeObserver && chart.value ) {
    resizeObserver.unobserve( chart.value )
  }
  if ( myChart.value ) {
    myChart.value.dispose()
  }
} )

watch(
  () => props.data,
  newData => {
    if ( myChart.value ) {
      myChart.value.setOption( {
        color : newData.map( item => item.color ),
        series : [{ data : newData }]
      } )
    }
  }
)

watch(
  () => props.title,
  newTitle => {
    if ( myChart.value ) {
      myChart.value.setOption( {
        title : { text : newTitle }
      } )
    }
  }
)
</script>

<style scoped>
.pie-chart-widget {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.title {
  flex-shrink: 0;
  margin: 0 0 16px 0;
  text-align: center;
}

.buttons-grid {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
  padding: 0 10px;
  box-sizing: border-box;
}

.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  max-height: 100%;
}
</style>

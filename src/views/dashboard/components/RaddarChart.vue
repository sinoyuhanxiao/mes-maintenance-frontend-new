<template>
  <div :class="props.className" :style="{ height: props.height, width: props.width }" ref="container" />
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'

const animationDuration = 3000

const props = defineProps({
  className: {
    type: String,
    default: 'chart',
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '300px',
  },
})

const chart = ref(null)
const container = ref(null)

const initChart = () => {
  chart.value = echarts.init(container.value)
  chart.value.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    radar: {
      radius: '66%',
      center: ['50%', '42%'],
      splitNumber: 8,
      splitArea: {
        areaStyle: {
          color: 'rgba(127,95,132,.3)',
          opacity: 1,
          shadowBlur: 45,
          shadowColor: 'rgba(0,0,0,.5)',
          shadowOffsetX: 0,
          shadowOffsetY: 15,
        },
      },
      indicator: [
        { name: 'Low', max: 10000 },
        { name: 'Medium', max: 20000 },
        { name: 'High', max: 20000 },
        { name: 'Urgent', max: 20000 },
        { name: 'Others', max: 20000 },
        { name: 'None', max: 20000 },
      ],
    },
    legend: {
      left: 'center',
      bottom: '10',
      data: ['Preventive', 'Reactive', 'Others'],
    },
    series: [
      {
        type: 'radar',
        symbolSize: 0,
        areaStyle: {
          shadowBlur: 13,
          shadowColor: 'rgba(0,0,0,.2)',
          shadowOffsetX: 0,
          shadowOffsetY: 10,
          opacity: 1,
        },
        data: [
          {
            value: [5000, 7000, 12000, 11000, 15000, 14000],
            name: 'Preventive',
          },
          {
            value: [4000, 9000, 15000, 15000, 13000, 11000],
            name: 'Reactive',
          },
          {
            value: [5500, 11000, 12000, 15000, 12000, 12000],
            name: 'Others',
          },
        ],
        animationDuration,
      },
    ],
  })
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
onBeforeUnmount(() => {
  if (!chart.value) {
    return
  }
  chart.value.dispose()
  chart.value = null
})

defineOptions({
  name: 'RaddarChart',
})
</script>

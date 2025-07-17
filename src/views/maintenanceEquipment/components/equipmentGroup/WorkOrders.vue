<template>
  <div class="page-container">
    <GridLayout
      :layout="layout"
      :col-num="6"
      :row-height="10"
      :is-draggable="false"
      :is-resizable="false"
      :use-css-transforms="true"
      :margin="[10, 10]"
    >
      <GridItem v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
        <div class="card">
          <component :is="item.component" v-bind="item.props" class="widget" />
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { GridLayout, GridItem } from 'vue3-grid-layout'
import WidgetPie from '@/components/widgets/PieChart.vue'

const layout = ref( [
  {
    x : 0,
    y : 0,
    w : 6,
    h : 20,
    i : '1',
    component : markRaw( WidgetPie ),
    props : {
      title : '',
      data : [
        { value : 40, name : 'Windows', color : '#4CAF50' },
        { value : 30, name : 'macOS', color : '#2196F3' },
        { value : 20, name : 'Linux', color : '#FF9800' },
        { value : 10, name : 'Other', color : '#9E9E9E' }
      ]
    }
  }
] )
</script>

<style scoped>
.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.card {
  background: white;
  border-radius: 8px;
  height: 100%;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.widget {
  width: 100%;
  height: 100%;
}
</style>

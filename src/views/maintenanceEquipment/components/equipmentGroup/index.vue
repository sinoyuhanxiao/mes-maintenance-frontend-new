<template>
  <div class="t2-main-container">
    <div class="t2-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <h1>{{ node.label }}</h1>
    </div>
    <div class="t2-main-details">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="Details" name="details">
          <DetailsTab />
        </el-tab-pane>
        <el-tab-pane label="Sub Items" name="subItems">
          <SubItemsTab />
        </el-tab-pane>
        <el-tab-pane label="Work Orders" name="workOrders">
          <WorkOrderTab />
        </el-tab-pane>
        <el-tab-pane label="Tasks" name="tasks">
          <TasksTab />
        </el-tab-pane>
        <el-tab-pane label="Personnel" name="personnel">
          <PersonnelTab />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DetailsTab from './Details.vue'
import SubItemsTab from './SubItems.vue'
import WorkOrderTab from './WorkOrders.vue'
import TasksTab from './Tasks.vue'
import PersonnelTab from './Personnel.vue'

defineProps( {
  node : {
    type : Object,
    required : true
  },
  breadcrumb : {
    type : Array,
    default : () => []
  }
} )

const activeTab = ref( 'details' )
</script>

<style scoped>
.t2-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.t2-main-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.t2-main-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

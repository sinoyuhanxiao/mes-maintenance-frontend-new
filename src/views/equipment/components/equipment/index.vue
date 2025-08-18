<template>
  <div class="t3-main-container">
    <div class="t3-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <h1>{{ node.label }}</h1>
    </div>
    <div class="t3-main-details">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="Details" name="details">
          <EquipmentDetailsTab :equipmentId="props.node.id" />
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
        <el-tab-pane label="Documents Load" name="documentsLoad">
          <DocumentsLoadTab />
        </el-tab-pane>
        <el-tab-pane label="Documents View" name="documentsView">
          <DocumentsViewTab />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EquipmentDetailsTab from './EquipmentDetails.vue'
import SubItemsTab from './SubItems.vue'
import WorkOrderTab from './WorkOrders.vue'
import TasksTab from './Tasks.vue'
import PersonnelTab from './Personnel.vue'
import DocumentsLoadTab from './DocumentsLoad.vue'
import DocumentsViewTab from './DocumentsView.vue'

const props = defineProps( {
  node : {
    type : Object,
    required : true
  },
  breadcrumb : {
    type : Array,
    default : () => []
  }
} )

console.log( props.node.id )
console.log( props.breadcrumb )

const activeTab = ref( 'details' )
</script>

<style scoped>
.t3-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.t3-main-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 0px;
}

.t3-main-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

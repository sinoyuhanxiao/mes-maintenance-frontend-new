<template>
  <div class="approval-management-container">
    <div class="approval-management-header"></div>
    <div class="approval-management-content">
      <div class="approval-management-tree">
        <approval-tree @node-selected="handleNodeSelected"></approval-tree>
      </div>

      <div class="approval-management-details">
        <approval-designer :selected-department-id="selectedDepartmentId"></approval-designer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import approvalTree from './components/approvalTree/index.vue'
import approvalDesigner from './components/approvalDesigner/index.vue'

const selectedDepartmentId = ref( null )

const handleNodeSelected = id => {
  console.log( 'Department selected:', id )
  selectedDepartmentId.value = id
}
</script>

<style scoped>
.approval-management-container {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.approval-management-header {
  flex-shrink: 0;
}

.approval-management-content {
  flex: 1;
  background-color: white;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.approval-management-tree {
  width: 300px;
  border-right: 1px solid #ddd;
  padding: 10px;
  background-color: #fafafa;
  overflow-y: auto;
}

.approval-management-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  width: calc(100vw - 685px);
}
</style>

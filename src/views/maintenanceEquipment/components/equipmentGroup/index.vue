<template>
  <div class="t2-main-container">
    <div class="t2-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="t2-sub-header">
        <h1>{{ node.label }}</h1>
        <el-dropdown class="kebab-dropdown">
          <el-icon class="kebab-icon">
            <MoreFilled />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openAddDialog">Add New Tier 2</el-dropdown-item>
              <el-dropdown-item>Edit Tier 2</el-dropdown-item>
              <el-dropdown-item divided>Delete Tier 2</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="t2-main-details">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="Details" name="details">
          <DetailsTab :equipmentId="props.node.id" />
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

    <!-- Add Equipment Group Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="Add New Tier 2"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <AddEquipmentGroup
        @close="closeAddDialog"
        @success="handleAddSuccess"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import DetailsTab from './Details.vue'
import SubItemsTab from './SubItems.vue'
import WorkOrderTab from './WorkOrders.vue'
import TasksTab from './Tasks.vue'
import PersonnelTab from './Personnel.vue'
import AddEquipmentGroup from './components/AddEquipmentGroup.vue'

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
const showAddDialog = ref( false )

// Dialog methods
const openAddDialog = () => {
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
}

const handleCloseDialog = ( done ) => {
  // You can add confirmation logic here if needed
  done()
}

const handleAddSuccess = ( newEquipment ) => {
  // Handle successful addition (e.g., refresh data, show message)
  console.log( 'New equipment added:', newEquipment )
  closeAddDialog()
  // You might want to emit an event to parent component or refresh data here
}
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

.t2-sub-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.t2-main-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kebab-dropdown {
  margin-left: auto;
}

.kebab-icon {
  transform: rotate(90deg);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 24px;
  color: #409EFF;
}

.kebab-icon:hover {
  background-color: var(--el-fill-color-light);
}
</style>

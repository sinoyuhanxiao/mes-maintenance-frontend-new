<template>
  <div class="t2-main-container">
    {{ props.node.id }}
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
              <el-dropdown-item @click="openEditDialog">Edit Tier 2</el-dropdown-item>
              <el-dropdown-item divided @click="openDeactivateDialog">Delete Tier 2</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="t2-main-details">
      <el-tabs v-model="activeTab" type="border-card" :key="refreshKey">
        <el-tab-pane label="Details" name="details">
          <DetailsTab :equipmentId="props.node.id" :key="`details-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Sub Items" name="subItems">
          <SubItemsTab :key="`subitems-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Work Orders" name="workOrders">
          <WorkOrderTab :key="`workorders-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Tasks" name="tasks">
          <TasksTab :key="`tasks-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Personnel" name="personnel">
          <PersonnelTab :key="`personnel-${refreshKey}`" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showAddDialog" title="Add New Tier 2" width="600px" :before-close="handleCloseDialog">
      <AddEquipmentGroup @close="closeAddDialog" @success="handleAddSuccess" :parentId="parentId" />
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="Edit Tier 2" width="600px" :before-close="handleCloseDialog">
      <EditEquipmentGroup
        @close="closeEditDialog"
        @success="handleEditSuccess"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <el-dialog v-model="showDeactivateDialog" title="Delete Tier 2" width="600px" :before-close="handleCloseDialog">
      <DeactivateNode
        @close="closeDeactivateDialog"
        @success="handleDeleteSuccess"
        @refresh-tree="handleRefreshTree"
        :equipmentId="props.node.id"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import DetailsTab from './Details.vue'
import SubItemsTab from './SubItems.vue'
import WorkOrderTab from './WorkOrders.vue'
import TasksTab from './Tasks.vue'
import PersonnelTab from './Personnel.vue'
import AddEquipmentGroup from './components/AddEquipmentGroup.vue'
import EditEquipmentGroup from './components/EditEquipmentGroup.vue'
import DeactivateNode from '../common/DeactivateNode.vue'

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

// Add emit for refresh-tree and refresh-data events
const emit = defineEmits( ['refresh-tree', 'refresh-data'] )

const parentId = computed( () => {
  // Filter out the first array item and get valid breadcrumb items
  const validBreadcrumbItems = props.breadcrumb.filter( ( item, index ) => {
    return index > 0 && item && typeof item === 'object' && 'id' in item
  } )

  if ( validBreadcrumbItems.length >= 2 ) {
    // Get second-to-last item (parent of current)
    return validBreadcrumbItems[validBreadcrumbItems.length - 2].id
  }

  return null
} )

console.log( props.node.id )
console.log( props.breadcrumb )

const activeTab = ref( 'details' )
const showAddDialog = ref( false )
const showEditDialog = ref( false )
const showDeactivateDialog = ref( false )
const refreshKey = ref( 0 ) // Key for forcing component re-render

// Dialog methods
const openAddDialog = () => {
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
}

const openEditDialog = () => {
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
}

const openDeactivateDialog = () => {
  showDeactivateDialog.value = true
}

const closeDeactivateDialog = () => {
  showDeactivateDialog.value = false
}

const handleCloseDialog = done => {
  done()
}

const handleAddSuccess = newEquipment => {
  closeAddDialog()
  // Emit refresh-tree when new equipment is added
  emit( 'refresh-tree' )
}

const handleEditSuccess = updatedEquipment => {
  closeEditDialog()
  // Emit refresh-tree when equipment is edited
  emit( 'refresh-tree' )

  // Refresh only the data in the current view
  refreshViewData()
}

// Function to refresh data in the current view
const refreshViewData = () => {
  // Force re-render of all tabs by updating a reactive key
  refreshKey.value += 1

  // You can also emit a custom event to refresh specific data
  emit( 'refresh-data', props.node.id )
}

const handleDeleteSuccess = deletedEquipmentId => {
  closeDeactivateDialog()
  // Emit refresh-tree when equipment is deleted
  emit( 'refresh-tree' )
}

const handleRefreshTree = () => {
  // Pass the refresh-tree event up to parent
  emit( 'refresh-tree' )
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
  color: #409eff;
}

.kebab-icon:hover {
  background-color: var(--el-fill-color-light);
}
</style>

<template>
  <div class="t4-main-container">
    <div class="t4-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="t4-sub-header">
        <h1>{{ node.label }}</h1>
        <el-dropdown class="kebab-dropdown">
          <el-icon class="kebab-icon">
            <MoreFilled />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openEditDialog">Edit Tier 4</el-dropdown-item>
              <el-dropdown-item @click="openAddTier5Dialog">Add Tier 5</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="t4-main-details">
      <el-tabs v-model="activeTab" type="border-card" :key="refreshKey">
        <el-tab-pane label="Details" name="details">
          <SubEquipmentDetailsTab :equipmentId="props.node.id" :key="`details-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Sub Items" name="subItems">
          <SubItemsTab :tier4Id="props.node.id" :key="`subitems-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Maintenance History" name="maintenanceHistory">
          <MaintenanceHistory :key="`maintenance-${refreshKey}`" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showAddDialog" title="Add New Tier 4" width="600px" :before-close="handleCloseDialog">
      <AddSubEquipment v-if="showAddDialog" @close="closeAddDialog" @success="handleAddSuccess" :parentId="parentId" />
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="Edit Tier 4" width="600px" :before-close="handleCloseDialog">
      <EditSubEquipment
        v-if="showEditDialog"
        :key="`edit-${props.node.id}-${editDialogKey}`"
        @close="closeEditDialog"
        @success="handleEditSuccess"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <el-dialog v-model="showDeactivateDialog" title="Delete Tier 4" width="600px" :before-close="handleCloseDialog">
      <DeactivateNode
        v-if="showDeactivateDialog"
        @close="closeDeactivateDialog"
        @success="handleDeleteSuccess"
        @refresh-tree="handleRefreshTree"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <el-dialog v-model="showAddTier5Dialog" title="Add Tier 5" width="720px" :before-close="handleCloseDialog">
      <AddTier5Form
        v-if="showAddTier5Dialog"
        :tier4-id="props.node.id"
        :parent-id="parentId"
        @close="closeAddTier5Dialog"
        @success="handleTier5Created"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import SubEquipmentDetailsTab from './Details.vue'
import SubItemsTab from './SubItems.vue'
import MaintenanceHistory from './MaintenanceHistory.vue'
import AddSubEquipment from './components/AddSubEquipment.vue'
import EditSubEquipment from './components/EditSubEquipment.vue'
import DeactivateNode from '../common/DeactivateNode.vue'
import AddTier5Form from './components/AddTier5Form.vue'

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

const emit = defineEmits( ['refresh-tree', 'refresh-data', 'after-delete'] )

const parentId = computed( () => {
  const validBreadcrumbItems = props.breadcrumb.filter( ( item, index ) => {
    return index > 0 && item && typeof item === 'object' && 'id' in item
  } )

  if ( validBreadcrumbItems.length >= 2 ) {
    return validBreadcrumbItems[validBreadcrumbItems.length - 2].id
  }

  return null
} )

const activeTab = ref( 'details' )
const showAddDialog = ref( false )
const showEditDialog = ref( false )
const showDeactivateDialog = ref( false )
const showAddTier5Dialog = ref( false )
const refreshKey = ref( 0 )
const editDialogKey = ref( 0 )

const openAddTier5Dialog = () => {
  showAddTier5Dialog.value = true
}
const closeAddTier5Dialog = () => {
  showAddTier5Dialog.value = false
}

const closeAddDialog = () => {
  showAddDialog.value = false
}

const openEditDialog = () => {
  editDialogKey.value += 1
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

const handleTier5Created = () => {
  // ⬅️ new
  closeAddTier5Dialog()
  // Refresh the sub items tab (Tier-5 list usually shows there)
  emit( 'refresh-tree' )
  setTimeout( () => {
    refreshViewData()
  }, 120 )
}

const handleAddSuccess = newEquipment => {
  closeAddDialog()
  emit( 'refresh-tree' )
}

const handleEditSuccess = updatedEquipment => {
  closeEditDialog()
  emit( 'refresh-tree' )

  setTimeout( () => {
    refreshViewData()
  }, 100 )
}

const refreshViewData = () => {
  refreshKey.value += 1
  emit( 'refresh-data', props.node.id )
}

const handleDeleteSuccess = deletedEquipmentId => {
  closeDeactivateDialog()
  emit( 'refresh-tree' )
  emit( 'after-delete', { parentId : parentId.value, deletedId : props.node.id } )
}

const handleRefreshTree = () => {
  emit( 'refresh-tree' )
}

defineExpose( { openDeactivateDialog } )
</script>

<style scoped>
.t4-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.t4-main-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 0px;
}

.t4-sub-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.t4-main-details {
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

<template>
  <div class="t4-main-container">
    <div class="t4-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          <el-link class="crumb-link" :underline="true" @click="handleBreadcrumbClick(item, index)">
            {{ item.label }}
          </el-link>
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
          <MaintenanceHistory :tier4Id="props.node.id" :key="`maintenance-${refreshKey}`" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showEditDialog" title="Edit Tier 4" width="600px" :before-close="handleCloseDialog" draggable>
      <EditSubEquipment
        v-if="showEditDialog"
        :key="`edit-${props.node.id}-${editDialogKey}`"
        @close="closeEditDialog"
        @success="handleEditSuccess"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <el-dialog
      v-model="showDeactivateDialog"
      title="Delete Tier 4"
      width="600px"
      :before-close="handleCloseDialog"
      draggable
    >
      <DeactivateNode
        v-if="showDeactivateDialog"
        @close="closeDeactivateDialog"
        @success="handleDeleteSuccess"
        @refresh-tree="handleRefreshTree"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <el-dialog
      v-model="showAddTier5Dialog"
      title="Add New Tier 5"
      width="720px"
      :before-close="handleCloseDialog"
      draggable
    >
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
import EditSubEquipment from './components/EditSubEquipment.vue'
import DeactivateNode from '../common/DeactivateNode.vue'
import AddTier5Form from './components/AddTier5Form.vue'

const props = defineProps( {
  node : { type : Object, required : true },
  breadcrumb : { type : Array, default : () => [] }
} )

const emit = defineEmits( ['refresh-tree', 'refresh-data', 'after-delete', 'request-select-node'] )

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
const showEditDialog = ref( false )
const showDeactivateDialog = ref( false )
const showAddTier5Dialog = ref( false )
const refreshKey = ref( 0 )
const editDialogKey = ref( 0 )

/* ---- Breadcrumb click (same style/behavior as T3) ---- */
function handleBreadcrumbClick( item, index ) {
  if ( item?.id != null ) emit( 'request-select-node', Number( item.id ) )
}

const openAddTier5Dialog = () => {
  showAddTier5Dialog.value = true
}
const closeAddTier5Dialog = () => {
  showAddTier5Dialog.value = false
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
  closeAddTier5Dialog()
  emit( 'refresh-tree' )
  setTimeout( () => {
    refreshViewData()
  }, 120 )
}

const handleEditSuccess = () => {
  closeEditDialog()
  emit( 'refresh-tree' )
  setTimeout( () => {
    refreshViewData()
  }, 100 )
}

const handleDeleteSuccess = () => {
  closeDeactivateDialog()
  emit( 'refresh-tree' )
  emit( 'after-delete', { parentId : parentId.value, deletedId : props.node.id } )
}
const handleRefreshTree = () => {
  emit( 'refresh-tree' )
}

const refreshViewData = () => {
  refreshKey.value += 1
  emit( 'refresh-data', props.node.id )
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

/* === Exact same breadcrumb link style as your T3 === */
/* base: inherit normal breadcrumb color */
.t4-main-header :deep(.crumb-link) {
  color: var(--el-text-color-regular) !important; /* default gray */
  font-weight: 400;
  text-decoration: underline;
  cursor: pointer;
}

/* on hover: turn primary blue */
.t4-main-header :deep(.crumb-link:hover),
.t4-main-header :deep(.el-breadcrumb__inner:hover .crumb-link) {
  color: var(--el-color-primary) !important;
}

/* prevent wrapper hover color override */
.t4-main-header :deep(.el-breadcrumb__inner:hover) {
  color: inherit !important;
}
</style>

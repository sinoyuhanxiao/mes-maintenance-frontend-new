<template>
  <div class="t2-main-container">
    <div class="t2-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          <el-link class="crumb-link" :underline="true" @click="handleBreadcrumbClick(item, index)">
            {{ item.label }}
          </el-link>
        </el-breadcrumb-item>
      </el-breadcrumb>

      <div class="t2-sub-header">
        <h1>{{ props.node.label }}</h1>
        <el-dropdown class="kebab-dropdown">
          <el-icon class="kebab-icon">
            <MoreFilled />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openEditDialog">Edit Tier 2</el-dropdown-item>
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
          <SubItemsTab
            :equipmentId="props.node.id"
            :key="`subitems-${refreshKey}`"
            @request-select-node="handleSelectFromCard"
          />
        </el-tab-pane>

        <el-tab-pane label="Work Orders" name="workOrders">
          <WorkOrderTab :equipmentId="props.node.id" :key="`workorders-${refreshKey}`" />
        </el-tab-pane>

        <el-tab-pane label="Task Templates" name="tasks">
          <TasksTab :equipmentId="props.node.id" :key="`tasks-${refreshKey}`" />
        </el-tab-pane>

        <el-tab-pane label="Personnel" name="personnel">
          <PersonnelTab :equipmentId="props.node.id" :key="`personnel-${refreshKey}`" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Add -->
    <el-dialog v-model="showAddDialog" title="Add New Tier 2" width="600px" :before-close="handleCloseDialog" draggable>
      <AddEquipmentGroup
        v-if="showAddDialog"
        @close="closeAddDialog"
        @success="handleAddSuccess"
        :parentId="parentId"
      />
    </el-dialog>

    <!-- Edit -->
    <el-dialog v-model="showEditDialog" title="Edit Tier 2" width="600px" :before-close="handleCloseDialog" draggable>
      <EditEquipmentGroup
        v-if="showEditDialog"
        :key="`edit-${props.node.id}-${editDialogKey}`"
        @close="closeEditDialog"
        @success="handleEditSuccess"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <!-- Delete -->
    <el-dialog
      v-model="showDeactivateDialog"
      title="Delete Tier 2"
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

const props = defineProps({
  node: { type: Object, required: true },
  breadcrumb: { type: Array, default: () => [] },
})

const emit = defineEmits(['refresh-tree', 'refresh-data', 'after-delete', 'request-select-node'])

const parentId = computed(() => {
  const valid = props.breadcrumb.filter((item, index) => index > 0 && item && typeof item === 'object' && 'id' in item)
  return valid.length >= 2 ? valid[valid.length - 2].id : null
})

const activeTab = ref('details')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeactivateDialog = ref(false)
const refreshKey = ref(0)
const editDialogKey = ref(0)

/* ---- Breadcrumb click (same behavior as T3) ---- */
function handleBreadcrumbClick(item, index) {
  emit('request-select-node', Number(item.id))
}

const closeAddDialog = () => {
  showAddDialog.value = false
}
const handleAddSuccess = () => {
  closeAddDialog()
  emit('refresh-tree')
}

/* ---- Edit ---- */
const openEditDialog = () => {
  editDialogKey.value += 1
  showEditDialog.value = true
}
const closeEditDialog = () => {
  showEditDialog.value = false
}
const handleEditSuccess = () => {
  closeEditDialog()
  emit('refresh-tree')
  setTimeout(() => {
    refreshViewData()
  }, 100)
}

/* ---- Delete ---- */
const openDeactivateDialog = () => {
  showDeactivateDialog.value = true
}
const closeDeactivateDialog = () => {
  showDeactivateDialog.value = false
}
const handleDeleteSuccess = () => {
  closeDeactivateDialog()
  emit('refresh-tree')
  emit('after-delete', { parentId: parentId.value, deletedId: props.node.id })
}

/* ---- Misc ---- */
const handleCloseDialog = done => {
  done()
}
const refreshViewData = () => {
  refreshKey.value += 1
  emit('refresh-data', props.node.id)
}
const handleRefreshTree = () => {
  emit('refresh-tree')
}

/* Re-emit up to the container that owns <EquipmentTree> */
function handleSelectFromCard(id) {
  emit('request-select-node', Number(id))
}

/* Expose opener so parent can trigger Delete dialog */
defineExpose({ openDeactivateDialog })
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

/* === Exact same breadcrumb link style as your T3 === */
/* base: inherit normal breadcrumb color */
.t2-main-header :deep(.crumb-link) {
  color: var(--el-text-color-regular) !important; /* default gray */
  font-weight: 400;
  text-decoration: underline;
  cursor: pointer;
}

/* on hover: turn primary blue */
.t2-main-header :deep(.crumb-link:hover),
.t2-main-header :deep(.el-breadcrumb__inner:hover .crumb-link) {
  color: var(--el-color-primary) !important;
}

/* prevent wrapper hover color override */
.t2-main-header :deep(.el-breadcrumb__inner:hover) {
  color: inherit !important;
}
</style>

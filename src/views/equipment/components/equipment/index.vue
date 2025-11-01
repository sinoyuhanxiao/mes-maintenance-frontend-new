<template>
  <div class="t3-main-container">
    <div class="t3-main-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
          <el-link class="crumb-link" :underline="true" @click="handleBreadcrumbClick(item, index)">
            {{ item.label }}
          </el-link>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="t3-sub-header">
        <h1>{{ node.label }}</h1>
        <el-dropdown class="kebab-dropdown">
          <el-icon class="kebab-icon">
            <MoreFilled />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openEditDialog">Edit Tier 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="t3-main-details">
      <el-tabs v-model="activeTab" type="border-card" :key="refreshKey">
        <el-tab-pane label="Details" name="details">
          <EquipmentDetailsTab :equipmentId="props.node.id" :key="`details-${refreshKey}`" />
        </el-tab-pane>
        <el-tab-pane label="Sub Items" name="subItems">
          <SubItems
            :equipment-id="props.node.id"
            :key="`subitems-${refreshKey}-${props.node.id}`"
            @request-select-node="onSubItemSelect"
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

    <el-dialog v-model="showAddDialog" title="Add New Tier 3" width="600px" :before-close="handleCloseDialog" draggable>
      <AddEquipment v-if="showAddDialog" @close="closeAddDialog" @success="handleAddSuccess" :parentId="parentId" />
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="Edit Tier 3" width="600px" :before-close="handleCloseDialog" draggable>
      <EditEquipment
        v-if="showEditDialog"
        :key="`edit-${props.node.id}-${editDialogKey}`"
        @close="closeEditDialog"
        @success="handleEditSuccess"
        :equipmentId="props.node.id"
      />
    </el-dialog>

    <el-dialog
      v-model="showDeactivateDialog"
      title="Delete Tier 3"
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
import EquipmentDetailsTab from './Details.vue'
import SubItems from '../equipmentGroup/SubItems.vue'
import WorkOrderTab from '@/views/equipment/components/equipmentGroup/WorkOrders.vue'
import TasksTab from './../equipmentGroup/Tasks.vue'
import PersonnelTab from '../equipmentGroup/Personnel.vue'
import AddEquipment from './components/AddEquipment.vue'
import EditEquipment from './components/EditEquipment.vue'
import DeactivateNode from '../common/DeactivateNode.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  breadcrumb: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['refresh-tree', 'refresh-data', 'after-delete', 'request-select-node'])

const parentId = computed(() => {
  const validBreadcrumbItems = props.breadcrumb.filter((item, index) => {
    return index > 0 && item && typeof item === 'object' && 'id' in item
  })

  if (validBreadcrumbItems.length >= 2) {
    return validBreadcrumbItems[validBreadcrumbItems.length - 2].id
  }

  return null
})

function handleBreadcrumbClick(item, index) {
  emit('request-select-node', Number(item.id))
}

const activeTab = ref('details')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeactivateDialog = ref(false)
const refreshKey = ref(0)
const editDialogKey = ref(0)

console.log(props.node.id)
console.log(props.breadcrumb)

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

const handleAddSuccess = newEquipment => {
  closeAddDialog()
  emit('refresh-tree')
}

const handleEditSuccess = updatedEquipment => {
  closeEditDialog()
  emit('refresh-tree')

  setTimeout(() => {
    refreshViewData()
  }, 100)
}

const refreshViewData = () => {
  refreshKey.value += 1
  emit('refresh-data', props.node.id)
}

const handleDeleteSuccess = deletedEquipmentId => {
  closeDeactivateDialog()
  emit('refresh-tree')
  emit('after-delete', { parentId: parentId.value, deletedId: deletedEquipmentId })
}

const handleRefreshTree = () => {
  emit('refresh-tree')
}

function onSubItemSelect(id) {
  // bubble up so the parent can navigate to Tier 4
  emit('request-select-node', Number(id))
}

defineExpose({ openDeactivateDialog })
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

.t3-sub-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.t3-main-details {
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

/* base: inherit normal breadcrumb color */
.t3-main-header :deep(.crumb-link) {
  color: var(--el-text-color-regular) !important; /* default gray */
  font-weight: 400;
  text-decoration: underline;
  cursor: pointer;
}

/* on hover: turn primary blue */
.t3-main-header :deep(.crumb-link:hover),
.t3-main-header :deep(.el-breadcrumb__inner:hover .crumb-link) {
  color: var(--el-color-primary) !important;
}

/* prevent wrapper hover color override */
.t3-main-header :deep(.el-breadcrumb__inner:hover) {
  color: inherit !important;
}
</style>

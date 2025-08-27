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
              <el-dropdown-item @click="openAddDialog">Add New Tier 4</el-dropdown-item>
              <el-dropdown-item @click="openEditDialog">Edit Tier 4</el-dropdown-item>
              <el-dropdown-item divided @click="openDeactivateDialog">Delete Tier 4</el-dropdown-item>
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
          <SubItemsTab :entityId="props.node.id" :tierType="'equipment'" />
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import SubEquipmentDetailsTab from './SubEquipmentDetails.vue'
import SubItemsTab from './SubItems.vue'
import MaintenanceHistory from './MaintenanceHistory.vue'
import AddSubEquipment from './components/AddSubEquipment.vue'
import EditSubEquipment from './components/EditSubEquipment.vue'
import DeactivateNode from '../common/DeactivateNode.vue'

const props = defineProps( {
  node : {
    type : Object,
    required : true
  },
  breadcrumb : {
    type : Array,
    default : () => []
  },
  activeTab : {
    type : String,
    default : 'details'
  }
} )

const activeTab = ref( props.activeTab )

// Watch for changes in activeTab prop
watch(
  () => props.activeTab,
  newTab => {
    console.log( '🔄 [SubEquipment] Active tab prop changed:', newTab )
    activeTab.value = newTab
  }
)
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

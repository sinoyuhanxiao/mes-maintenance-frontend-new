<template>
  <div class="edit-work-order-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
      <div class="loading-text">Loading work order data...</div>
    </div>

    <!-- Work Order Edit -->
    <WorkOrderEdit
      v-else-if="workOrderData"
      :work-order="workOrderData"
      @work-order-updated="handleWorkOrderUpdated"
      @back-to-detail="handleBackToTable"
    />

    <!-- Error State -->
    <div v-else class="error-container">
      <el-result
        icon="error"
        title="Work Order Not Found"
        sub-title="The work order you're trying to edit could not be found."
      >
        <template #extra>
          <el-button type="primary" @click="handleBackToTable">Back to Table</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWorkOrderById } from '@/api/work-order'
import WorkOrderEdit from '@/components/WorkOrder/TodoView/WorkOrderEdit.vue'
import { useTagsViewStore } from '@/store'

// Router
const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

// State
const workOrderData = ref( null )
const loading = ref( false )

// Methods
const loadWorkOrderData = async() => {
  try {
    const workOrderId = route.params.id || route.query.id

    if ( !workOrderId ) {
      ElMessage.error( 'No work order ID provided' )
      router.push( '/maintenance/work-orders/table' )
      return
    }

    loading.value = true
    const response = await getWorkOrderById( workOrderId )

    if ( response && response.data ) {
      workOrderData.value = response.data

      // Update tags view title with work order name if available
      const title = workOrderData.value.name ? `Edit: ${workOrderData.value.name}` : 'Edit Work Order'
      tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, title )
    } else {
      ElMessage.error( 'Failed to load work order data' )
      workOrderData.value = null
    }
  } catch ( error ) {
    console.error( 'Failed to fetch work order:', error )
    ElMessage.error( 'Failed to load work order data' )
    workOrderData.value = null
  } finally {
    loading.value = false
  }
}

const handleWorkOrderUpdated = async workOrder => {
  ElMessage.success( 'Work order updated successfully' )
  // Close the current tag view
  await tagsViewStore.DEL_VIEW( route )
  // Navigate back to the work order table view with refresh flag
  router.push( { name : 'WorkOrderManagement', query : { refresh : Date.now() }} )
}

const handleBackToTable = async() => {
  // Close the current tag view
  await tagsViewStore.DEL_VIEW( route )
  // Navigate back to work order table
  router.push( { name : 'WorkOrderManagement' } )
}

// Lifecycle
onMounted( () => {
  loadWorkOrderData()
} )

defineOptions( {
  name : 'EditWorkOrder'
} )
</script>

<style scoped lang="scss">
.edit-work-order-wrapper {
  height: 100%;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .loading-container {
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .loading-text {
      text-align: center;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      margin-top: 16px;
    }
  }

  .error-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
}

// Override WorkOrderEdit styles to fit standalone page
:deep(.work-order-edit-enhanced) {
  height: 100%;
  overflow-y: auto;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 4px;

    &:hover {
      background: var(--el-fill-color-darker);
    }
  }
}
</style>

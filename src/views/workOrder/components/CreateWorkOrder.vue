<template>
  <div class="create-work-order-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
      <div class="loading-text">Loading work order data...</div>
    </div>

    <!-- Work Order Create -->
    <WorkOrderCreate
      v-else
      :initial-request-data="initialRequestData"
      @work-order-created="handleWorkOrderCreated"
      @back-to-detail="handleBackToDetail"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWorkOrderById } from '@/api/work-order'
import WorkOrderCreate from '@/components/WorkOrder/TodoView/WorkOrderCreate.vue'
import { useTagsViewStore } from '@/store'

// Router
const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

// State
const initialRequestData = ref( null )
const loading = ref( false )

// Methods
const loadInitialData = async() => {
  try {
    // Check if we're recreating or copying an existing work order
    const workOrderId = route.query.workOrderId
    const isRecreation = route.query.recreate === 'true'
    const isCopy = route.query.copy === 'true'

    // Update tags view title
    if ( isRecreation ) {
      tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, 'Recreate Work Order' )
    } else if ( isCopy ) {
      tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, 'Copy Work Order' )
    } else {
      tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, 'New Work Order' )
    }

    // Load work order data if recreating or copying
    if ( workOrderId && ( isRecreation || isCopy ) ) {
      loading.value = true
      const response = await getWorkOrderById( workOrderId )
      if ( response && response.data ) {
        // Prepare the initial request data with recreation/copy flags
        initialRequestData.value = {
          ...response.data,
          isRecreation,
          isCopy
        }
      } else {
        ElMessage.error( 'Failed to load work order data' )
      }
    }
  } catch ( error ) {
    console.error( 'Failed to fetch work order:', error )
    ElMessage.error( 'Failed to load work order data' )
  } finally {
    loading.value = false
  }
}

const handleWorkOrderCreated = workOrder => {
  ElMessage.success( 'Work order created successfully' )
  // Navigate to the work order table view
  router.push( '/maintenance/work-orders/table' )
}

const handleBackToDetail = () => {
  // Navigate back to work order table
  router.push( '/maintenance/work-orders/table' )
}

// Lifecycle
onMounted( () => {
  loadInitialData()
} )

defineOptions( {
  name : 'CreateWorkOrder'
} )
</script>

<style scoped lang="scss">
.create-work-order-wrapper {
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
}

// Override WorkOrderCreate styles to fit standalone page
:deep(.work-order-create-enhanced) {
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

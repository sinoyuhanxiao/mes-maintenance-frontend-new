<template>
  <div class="view-work-order-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
      <div class="loading-text">Loading work order details...</div>
    </div>

    <!-- Work Order Detail -->
    <WorkOrderDetail
      v-else-if="workOrder"
      :work-order="workOrder"
      :disable-actions="true"
      @edit="handleEdit"
      @share="handleShare"
      @export="handleExport"
      @add-parts="handleAddParts"
      @add-time="handleAddTime"
      @add-costs="handleAddCosts"
      @view-procedure="handleViewProcedure"
      @add-comment="handleAddComment"
      @start-work-order="handleStartWorkOrder"
      @refresh="handleRefresh"
      @recreate="handleRecreate"
      @delete="handleDelete"
    />

    <!-- Error State -->
    <div v-else class="error-container">
      <el-empty description="Work order not found" :image-size="120" />
      <el-button type="primary" @click="goBack">Go Back</el-button>
    </div>

    <!-- PDF Preview Modal -->
    <PdfPreviewModal v-model:visible="showPdfPreview" :work-order="pdfPreviewData" @close="handlePdfPreviewClose" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWorkOrderById } from '@/api/work-order'
import WorkOrderDetail from '@/components/WorkOrder/TodoView/WorkOrderDetail.vue'
import PdfPreviewModal from '@/components/WorkOrder/PdfPreview/PdfPreviewModal.vue'
import { useTagsViewStore } from '@/store'

// Router
const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

// State
const workOrder = ref( null )
const loading = ref( true )
const showPdfPreview = ref( false )
const pdfPreviewData = ref( null )

// Methods
const loadWorkOrder = async() => {
  try {
    loading.value = true
    const workOrderId = route.params.id

    if ( !workOrderId ) {
      ElMessage.error( 'Work order ID is missing' )
      loading.value = false
      return
    }

    const response = await getWorkOrderById( workOrderId )
    if ( response && response.data ) {
      workOrder.value = response.data
      // Update tags view title with work order ID
      tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, `Work Order - ${workOrderId}` )
    } else {
      ElMessage.error( 'Failed to load work order details' )
    }
  } catch ( error ) {
    console.error( 'Failed to fetch work order:', error )
    ElMessage.error( 'Failed to load work order details' )
  } finally {
    loading.value = false
  }
}

const handleEdit = async workOrderToEdit => {
  // Navigate to work order management page with edit panel
  router.push( {
    path : '/work-order/table',
    query : {
      panel : 'edit',
      workOrderId : workOrderToEdit.id
    }
  } )
}

const handleShare = workOrderToShare => {
  ElMessage.success( 'Share functionality coming soon' )
}

const handleExport = async workOrderToExport => {
  try {
    // Show PDF preview
    pdfPreviewData.value = workOrderToExport
    showPdfPreview.value = true
    ElMessage.success( 'PDF preview opened' )
  } catch ( error ) {
    console.error( 'Export error:', error )
    ElMessage.error( 'Failed to open PDF preview. Please try again.' )
  }
}

const handlePdfPreviewClose = () => {
  showPdfPreview.value = false
  pdfPreviewData.value = null
}

const handleAddParts = () => {
  ElMessage.info( 'Add parts functionality coming soon' )
}

const handleAddTime = () => {
  ElMessage.info( 'Add time functionality coming soon' )
}

const handleAddCosts = () => {
  ElMessage.info( 'Add costs functionality coming soon' )
}

const handleViewProcedure = () => {
  ElMessage.info( 'View procedure functionality coming soon' )
}

const handleAddComment = () => {
  ElMessage.success( 'Comment added' )
}

const handleStartWorkOrder = async workOrderToStart => {
  // Navigate to work order management page with execution panel
  router.push( {
    path : '/work-order/table',
    query : {
      panel : 'execution',
      workOrderId : workOrderToStart.id
    }
  } )
}

const handleRefresh = async() => {
  await loadWorkOrder()
  ElMessage.success( 'Work order refreshed' )
}

const handleRecreate = async workOrderToRecreate => {
  // Navigate to work order management page with create panel for recreation
  router.push( {
    path : '/work-order/table',
    query : {
      panel : 'create',
      workOrderId : workOrderToRecreate.id,
      recreate : 'true'
    }
  } )
}

const handleDelete = async( { workOrder : workOrderToDelete, type } ) => {
  // After delete, go back to the work order list
  ElMessage.success( `Work order deleted (${type})` )
  router.push( '/work-order/table' )
}

const goBack = () => {
  router.push( '/work-order/table' )
}

// Lifecycle
onMounted( () => {
  loadWorkOrder()
} )

defineOptions( {
  name : 'ViewWorkOrder'
} )
</script>

<style scoped lang="scss">
.view-work-order-wrapper {
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
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
}

// Override WorkOrderDetail styles to remove duplicate top margin
:deep(.work-order-detail) {
  margin: 24px 12px;
  border-radius: 0 !important;
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

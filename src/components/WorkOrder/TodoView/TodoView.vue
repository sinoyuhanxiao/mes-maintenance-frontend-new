<template>
  <div class="todo-view">
    <!-- Left Panel - Work Order List -->
    <div class="left-panel">
      <!-- Todo-specific Filters (Status tabs and sorting) -->
      <div v-show="false" class="todo-specific-filters">
        <!-- Status Tabs -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="todo-tabs">
          <el-tab-pane :label="$t('workOrder.tabs.todo')" name="todo" />
          <el-tab-pane :label="$t('workOrder.tabs.done')" name="done" />
        </el-tabs>

        <!-- Sort Options -->
        <div class="sort-options">
          <div class="sort-label">{{ $t('workOrder.sort.sortBy') }}:</div>
          <el-select v-model="sortBy" @change="handleSortChange" size="small" style="width: 180px">
            <el-option :label="$t('workOrder.sort.priorityHighest')" value="priority-desc" />
            <el-option :label="$t('workOrder.sort.priorityLowest')" value="priority-asc" />
            <el-option :label="$t('workOrder.sort.dueDateNearest')" value="dueDate-asc" />
            <el-option :label="$t('workOrder.sort.dueDateFarthest')" value="dueDate-desc" />
            <el-option :label="$t('workOrder.sort.createdNewest')" value="created-desc" />
            <el-option :label="$t('workOrder.sort.createdOldest')" value="created-asc" />
          </el-select>
        </div>
      </div>

      <!-- Work Order Cards -->
      <div class="work-order-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="displayedWorkOrders && displayedWorkOrders.length === 0" class="empty-list">
          <el-empty :description="$t('workOrder.messages.noData')" :image-size="80" />
        </div>

        <div v-else class="list-content">
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              {{
                $t('workOrder.pagination.showing', {
                  start: paginationInfo.start,
                  end: paginationInfo.end,
                  total: paginationInfo.total,
                })
              }}
            </div>
            <el-select v-model="internalPageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option :label="'10'" :value="10" />
              <el-option :label="'20'" :value="20" />
              <el-option :label="'50'" :value="50" />
            </el-select>
          </div>

          <!-- Cards Container -->
          <div class="cards-container">
            <el-row :gutter="16">
              <el-col v-for="workOrder in displayedWorkOrders" :key="workOrder.id">
                <WorkOrderCard
                  :work-order="workOrder"
                  :is-selected="selectedWorkOrder?.id === workOrder.id"
                  @select="selectWorkOrder"
                  @action="handleCardAction"
                />
              </el-col>
            </el-row>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination-controls" v-if="paginationInfo.total > internalPageSize">
            <el-pagination
              :current-page="internalCurrentPage"
              :page-size="internalPageSize"
              :pager-count="pagerCount"
              :total="paginationInfo.total"
              layout="total, prev, pager, next, jumper"
              :small="true"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
              hide-on-single-page
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Work Order Detail or Create -->
    <div class="right-panel">
      <!-- Loading State -->
      <div v-if="isLoadingWorkOrder" class="loading-container">
        <el-skeleton :rows="5" animated />
        <div class="loading-text">{{ 'Loading work order details...' }}</div>
      </div>

      <!-- Work Order Detail View -->
      <WorkOrderDetail
        v-else-if="currentRightPanelView === 'detail'"
        :work-order="selectedWorkOrder"
        @edit="handleEdit"
        @share="handleShare"
        @export="handleExport"
        @status-change="handleStatusChange"
        @add-parts="handleAddParts"
        @add-time="handleAddTime"
        @add-costs="handleAddCosts"
        @view-procedure="handleViewProcedure"
        @add-comment="handleAddComment"
        @start-work-order="handleStartWorkOrder"
      />

      <!-- Work Order Create View -->
      <WorkOrderCreate
        :key="computedCreatePanelKey"
        v-else-if="currentRightPanelView === 'create'"
        @back-to-detail="showDetailView"
        @work-order-created="handleWorkOrderCreated"
        ref="workOrderCreateRef"
      />

      <!-- Work Order Edit View -->
      <WorkOrderEdit
        v-else-if="currentRightPanelView === 'edit'"
        :work-order="workOrderToEdit"
        @back-to-detail="showDetailView"
        @work-order-updated="handleWorkOrderUpdated"
      />

      <WorkOrderExecution
        v-else-if="currentRightPanelView === 'execution'"
        :key="workOrderInExecution?.id || 'execution'"
        :work-order="workOrderInExecution"
        @close="handleExecutionClose"
        @back-to-detail="showDetailView"
      />
    </div>

    <StandardsConfirmDialog
      v-model="showStandardsDialog"
      :work-order-name="pendingExecutionWorkOrder?.name || ''"
      :standards="executionStandards"
      @confirm="confirmStartExecution"
      @cancel="cancelStartExecution"
    />

    <!-- PDF Preview Modal -->
    <PdfPreviewModal v-model:visible="showPdfPreview" :work-order="pdfPreviewData" @close="handlePdfPreviewClose" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWorkOrderById } from '@/api/work-order'
import WorkOrderCard from './WorkOrderCard.vue'
import WorkOrderDetail from './WorkOrderDetail.vue'
import WorkOrderCreate from './WorkOrderCreate.vue'
import WorkOrderEdit from './WorkOrderEdit.vue'
import PdfPreviewModal from '../PdfPreview/PdfPreviewModal.vue'
import WorkOrderExecution from '@/components/WorkOrder/WorkOrderExecution.vue'
import StandardsConfirmDialog from '@/components/WorkOrder/StandardsConfirmDialog.vue'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'

// Props
const props = defineProps( {
  workOrders : {
    type : Array,
    default : () => []
  },
  loading : {
    type : Boolean,
    default : false
  },
  filters : {
    type : Object,
    default : () => ( {} )
  },
  total : {
    type : Number,
    default : 0
  },
  currentPage : {
    type : Number,
    default : 1
  },
  pageSize : {
    type : Number,
    default : 10
  }
} )

// Emits
const emit = defineEmits( [
  'edit',
  'delete',
  'status-change',
  'refresh',
  'work-order-created',
  'work-order-updated',
  'page-change',
  'page-size-change',
  'tab-change'
] )

const { t } = useI18n()

// State
const selectedWorkOrder = ref( null )
const activeTab = ref( 'todo' )
const sortBy = ref( 'priority-desc' )
const currentRightPanelView = ref( 'detail' ) // 'detail', 'create', 'edit', or 'execution'
const workOrderToEdit = ref( null )
const isLoadingWorkOrder = ref( false )

// Screen width tracking for responsive pager count
const screenWidth = ref( window.innerWidth )

// PDF Preview state
const showPdfPreview = ref( false )
const pdfPreviewData = ref( null )

// WorkOrderCreate component ref
const workOrderCreateRef = ref( null )

const router = useRouter()
const route = useRoute()

// Use pagination from props instead of local state
const internalCurrentPage = ref( props.currentPage )
const internalPageSize = ref( props.pageSize )

const workOrderDraftStore = useWorkOrderDraftStore()
const createPanelKey = ref( 'work-order-create' )
const createPanelRefreshCounter = ref( 0 )
const showStandardsDialog = ref( false )
const pendingExecutionWorkOrder = ref( null )
const workOrderInExecution = ref( null )

// Computed key that changes when we need to refresh from template designer
const computedCreatePanelKey = computed( () => `${createPanelKey.value}-${createPanelRefreshCounter.value}` )
const executionStandards = computed( () => {
  const standardsSource = pendingExecutionWorkOrder.value?.standards || pendingExecutionWorkOrder.value?.standard_list
  if ( Array.isArray( standardsSource ) ) {
    return standardsSource
  }
  return []
} )

// Function to scroll to tasks section after template designer return
const scrollToTasksSection = () => {
  if ( !workOrderCreateRef.value ) return

  try {
    // Look for the tasks section in the WorkOrderCreate component
    const createComponent = workOrderCreateRef.value.$el || workOrderCreateRef.value
    const tasksSection = createComponent.querySelector( '.tasks-section' )

    if ( tasksSection ) {
      // Scroll the main container to bring tasks section into view
      const scrollContainer = createComponent.querySelector( '.work-order-create-enhanced' )
      if ( scrollContainer ) {
        const tasksSectionTop = tasksSection.offsetTop
        scrollContainer.scrollTo( {
          top : tasksSectionTop - 50, // 50px padding from top
          behavior : 'smooth'
        } )
      }
    }
  } catch ( error ) {
    console.warn( 'Could not scroll to tasks section:', error )
  }
}

// Dynamic pager count based on screen width
const pagerCount = computed( () => ( screenWidth.value > 1800 ? 7 : 3 ) )

// Server handles all filtering, sorting, and pagination
// Use work orders directly from props - no client-side processing needed
const displayedWorkOrders = computed( () => {
  return Array.isArray( props.workOrders ) ? props.workOrders : []
} )

const paginationInfo = computed( () => {
  const total = props.total
  const start = total === 0 ? 0 : ( internalCurrentPage.value - 1 ) * internalPageSize.value + 1
  const end = Math.min( internalCurrentPage.value * internalPageSize.value, total )
  return {
    start,
    end,
    total
  }
} )

// Helper function to check for unsaved changes and show confirmation
const checkUnsavedChanges = async() => {
  // If we're currently in create mode, check for unsaved changes
  if ( currentRightPanelView.value === 'create' && workOrderCreateRef.value ) {
    try {
      // Check if the create form has unsaved changes
      const hasChanges = workOrderCreateRef.value.hasFormChanges ? workOrderCreateRef.value.hasFormChanges() : false

      if ( hasChanges ) {
        // Show confirmation dialog
        await ElMessageBox.confirm(
          'Are you sure you want to leave the form? All unsaved changes will be lost.',
          'Confirm Leave',
          {
            confirmButtonText : 'Leave',
            cancelButtonText : 'Cancel',
            type : 'warning'
          }
        )

        // If user confirmed, clear the draft
        if ( workOrderDraftStore && workOrderDraftStore.clearDraft ) {
          workOrderDraftStore.clearDraft()
        }
      }
      return true // Proceed with action
    } catch ( error ) {
      // User cancelled the confirmation dialog
      if ( error === 'cancel' || error === 'close' ) {
        return false // Don't proceed with action
      }
      console.error( 'Error checking form changes:', error )
      return true // Proceed with action on error
    }
  }
  return true // No create mode, proceed with action
}

// Methods
const selectWorkOrder = async workOrder => {
  // Check for unsaved changes before proceeding
  const canProceed = await checkUnsavedChanges()
  if ( !canProceed ) {
    return // Don't proceed with selection
  }

  try {
    isLoadingWorkOrder.value = true

    // Call API to get latest work order data
    const response = await getWorkOrderById( workOrder.id )

    if ( response && response.data ) {
      selectedWorkOrder.value = response.data
    } else {
      // Fallback to existing data if API response is invalid
      selectedWorkOrder.value = workOrder
    }

    currentRightPanelView.value = 'detail'
  } catch ( error ) {
    console.error( 'Failed to fetch work order:', error )
    // Fallback to existing data on error
    selectedWorkOrder.value = workOrder
    currentRightPanelView.value = 'detail'
    ElMessage.error( 'Failed to load work order details' )
  } finally {
    isLoadingWorkOrder.value = false
  }
}

const handleTabChange = async tabName => {
  // Check for unsaved changes before proceeding
  const canProceed = await checkUnsavedChanges()
  if ( !canProceed ) {
    return // Don't proceed with tab change
  }

  activeTab.value = tabName
  // Clear selection when switching tabs
  selectedWorkOrder.value = null

  // Emit tab change to parent for server-side filtering
  const statusFilter = tabName === 'todo' ? 'pending,in_progress' : 'completed'
  emit( 'tab-change', { tab : tabName, statusFilter } )
}

const handleSortChange = sortValue => {
  sortBy.value = sortValue
}

const handleCardAction = ( { action, workOrder } ) => {
  switch ( action ) {
    case 'edit':
      handleEdit( workOrder )
      break
    case 'view':
      selectWorkOrder( workOrder )
      break
    case 'delete':
      handleDelete( workOrder )
      break
    case 'start':
      handleStartWorkOrder( workOrder )
      break
    default:
      console.warn( `Unhandled action: ${action}`, workOrder )
  }
}

const handleEdit = async workOrder => {
  const canProceed = await checkUnsavedChanges()
  if ( !canProceed ) {
    return
  }

  currentRightPanelView.value = 'edit'
  isLoadingWorkOrder.value = true

  try {
    const response = await getWorkOrderById( workOrder.id )
    const workOrderData = response?.data || workOrder

    workOrderToEdit.value = workOrderData
    selectedWorkOrder.value = workOrderData
  } catch ( error ) {
    console.error( 'Failed to load work order for edit:', error )
    ElMessage.error( 'Failed to load the latest work order details. Showing cached data.' )
    workOrderToEdit.value = workOrder
    selectedWorkOrder.value = workOrder
  } finally {
    isLoadingWorkOrder.value = false
  }
}

const handleDelete = workOrder => {
  emit( 'delete', workOrder )
}

const handleStartWorkOrder = async workOrder => {
  const canProceed = await checkUnsavedChanges()
  if ( !canProceed ) {
    return
  }
  selectedWorkOrder.value = workOrder
  pendingExecutionWorkOrder.value = workOrder
  showStandardsDialog.value = true
}

const confirmStartExecution = () => {
  showStandardsDialog.value = false
  if ( !pendingExecutionWorkOrder.value ) return
  workOrderInExecution.value = pendingExecutionWorkOrder.value
  currentRightPanelView.value = 'execution'
  selectedWorkOrder.value = pendingExecutionWorkOrder.value
}

const cancelStartExecution = () => {
  showStandardsDialog.value = false
  pendingExecutionWorkOrder.value = null
}

const handleExecutionClose = () => {
  currentRightPanelView.value = 'detail'
  workOrderInExecution.value = null
  pendingExecutionWorkOrder.value = null
}

const isProcessingReturnContext = ref( false )

const processReturnPanel = async( panel, workOrderId ) => {
  if ( !panel || isProcessingReturnContext.value ) return

  isProcessingReturnContext.value = true
  try {
    if ( panel === 'create' ) {
      showCreateForm( { fromTemplateDesigner : true } )
    } else if ( panel === 'edit' ) {
      const targetId = workOrderId ? Number( workOrderId ) || workOrderId : null
      if ( !targetId ) {
        console.warn( 'Missing workOrderId for edit return context.' )
        return
      }

      // If we're already editing this work order, don't reload it
      if ( currentRightPanelView.value === 'edit' && workOrderToEdit.value?.id === targetId ) {
        console.log( 'TodoView: Already editing work order', targetId, '- skipping reload to prevent interruption' )
        return
      }

      const existing = displayedWorkOrders.value.find( wo => wo.id === targetId )
      await handleEdit( existing || { id : targetId } )
    }
  } finally {
    isProcessingReturnContext.value = false
  }
}

const cleanupReturnQuery = async() => {
  const query = { ...route.query }
  delete query.panel
  delete query.workOrderId
  try {
    await router.replace( { path : route.path, query } )
  } catch ( error ) {
    if ( error?.name !== 'NavigationDuplicated' ) {
      console.warn( 'Failed to cleanup return query:', error )
    }
  }
}

watch(
  () => route.query.panel,
  async panelValue => {
    const panel = Array.isArray( panelValue ) ? panelValue[0] : panelValue
    if ( !panel ) return

    let workOrderIdValue = Array.isArray( route.query.workOrderId ) ? route.query.workOrderId[0] : route.query.workOrderId

    if ( !workOrderIdValue && workOrderDraftStore.returnWorkOrderId ) {
      workOrderIdValue = workOrderDraftStore.returnWorkOrderId
    }

    await processReturnPanel( panel, workOrderIdValue )
    await cleanupReturnQuery()

    // Delay context clearing to allow WorkOrderEdit component to hydrate from draft
    // Only clear return context (route info), but preserve draft context for component mounting
    nextTick( () => {
      setTimeout( () => {
        workOrderDraftStore.clearReturnContext()
      }, 100 ) // Small delay to ensure component mounting completes
    } )
  },
  { immediate : true }
)

watch(
  () => workOrderDraftStore.returnPanel,
  async panel => {
    if ( !panel || route.query.panel ) {
      return
    }

    await processReturnPanel( panel, workOrderDraftStore.returnWorkOrderId )

    // Delay context clearing to allow WorkOrderEdit component to hydrate from draft
    nextTick( () => {
      setTimeout( () => {
        workOrderDraftStore.clearReturnContext()
      }, 100 ) // Small delay to ensure component mounting completes
    } )
  },
  { immediate : true }
)

const handleShare = _workOrder => {
  ElMessage.success( t( 'workOrder.messages.shareSuccess' ) )
}

const handleExport = async workOrder => {
  try {
    // Show PDF preview
    pdfPreviewData.value = workOrder
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

const handleStatusChange = ( { workOrder, status } ) => {
  emit( 'status-change', { workOrder, status } )
}

const handleAddParts = () => {
  // Implement add parts functionality
  ElMessage.info( t( 'workOrder.tracking.addParts' ) )
}

const handleAddTime = () => {
  // Implement add time functionality
  ElMessage.info( t( 'workOrder.tracking.addTime' ) )
}

const handleAddCosts = () => {
  // Implement add costs functionality
  ElMessage.info( t( 'workOrder.tracking.addCosts' ) )
}

const handleViewProcedure = () => {
  // Implement view procedure functionality
  ElMessage.info( t( 'workOrder.tracking.viewProcedure' ) )
}

const handleAddComment = () => {
  ElMessage.success( t( 'workOrder.comments.add' ) )
}

const handlePageChange = async page => {
  // Check for unsaved changes before proceeding
  const canProceed = await checkUnsavedChanges()
  if ( !canProceed ) {
    return // Don't proceed with page change
  }

  internalCurrentPage.value = page
  emit( 'page-change', page )
  selectedWorkOrder.value = null
}

const handlePageSizeChange = newPageSize => {
  internalPageSize.value = newPageSize
  internalCurrentPage.value = 1
  emit( 'page-size-change', newPageSize )
  selectedWorkOrder.value = null
}

watch(
  () => props.workOrders,
  newWorkOrders => {
    if ( newWorkOrders.length > 0 && !selectedWorkOrder.value ) {
      selectedWorkOrder.value = displayedWorkOrders.value[0]
    }
  },
  { immediate : true }
)

watch(
  () => props.currentPage,
  newPage => {
    internalCurrentPage.value = newPage
  }
)

watch(
  () => props.pageSize,
  newPageSize => {
    internalPageSize.value = newPageSize
  }
)

watch(
  () => props.filters,
  ( newFilters, oldFilters ) => {
    const stripPagination = f => {
      if ( !f ) return {}
      const rest = { ...f }
      delete rest.page
      delete rest.limit
      return rest
    }
    const a = JSON.stringify( stripPagination( oldFilters ) )
    const b = JSON.stringify( stripPagination( newFilters ) )
    if ( a !== b ) {
      internalCurrentPage.value = 1
      emit( 'page-change', 1 )
      selectedWorkOrder.value = null
    }
  },
  { deep : true }
)

watch(
  [activeTab, sortBy],
  () => {
    internalCurrentPage.value = 1
    emit( 'page-change', 1 )
    selectedWorkOrder.value = null
  },
  { deep : true }
)

const showCreateForm = ( options = {} ) => {
  currentRightPanelView.value = 'create'
  selectedWorkOrder.value = null

  // If coming from template designer, refresh the component and scroll to tasks
  if ( options.fromTemplateDesigner || workOrderDraftStore.shouldOpenCreatePanel ) {
    createPanelRefreshCounter.value += 1

    // After component refreshes, scroll to tasks section
    nextTick( () => {
      setTimeout( () => {
        scrollToTasksSection()
      }, 100 ) // Small delay to ensure DOM is fully rendered
    } )
  }
}

const showDetailView = () => {
  console.log( '🔄 TodoView: showDetailView called' )
  console.log( '🔄 TodoView: Setting currentRightPanelView to detail' )
  currentRightPanelView.value = 'detail'
  workOrderToEdit.value = null
  if ( !selectedWorkOrder.value && displayedWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = displayedWorkOrders.value[0]
  }
  console.log( '🔄 TodoView: showDetailView completed, currentRightPanelView:', currentRightPanelView.value )
}

const handleWorkOrderCreated = newWorkOrder => {
  emit( 'work-order-created', newWorkOrder )
}

const handleWorkOrderUpdated = updatedWorkOrder => {
  const index = displayedWorkOrders.value.findIndex( wo => wo.id === updatedWorkOrder.id )
  if ( index !== -1 ) {
    displayedWorkOrders.value[index] = updatedWorkOrder
  }

  if ( selectedWorkOrder.value && selectedWorkOrder.value.id === updatedWorkOrder.id ) {
    selectedWorkOrder.value = updatedWorkOrder
  }

  workOrderToEdit.value = null
  currentRightPanelView.value = 'detail'

  emit( 'work-order-updated', updatedWorkOrder )

  ElMessage.success( 'Work order updated successfully' )
}

const selectWorkOrderById = workOrderId => {
  const workOrder = displayedWorkOrders.value.find( wo => wo.id === workOrderId )
  if ( workOrder ) {
    selectedWorkOrder.value = workOrder
    currentRightPanelView.value = 'detail'
    return true
  }
  console.warn( 'Work order not found in displayedWorkOrders' )
  return false
}

defineExpose( {
  showCreateForm,
  showDetailView,
  selectWorkOrderById
} )

onMounted( () => {
  if ( displayedWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = displayedWorkOrders.value[0]
  }

  // Add resize listener for responsive pager count
  const handleResize = () => {
    screenWidth.value = window.innerWidth
  }

  window.addEventListener( 'resize', handleResize )

  // Cleanup on unmount
  onUnmounted( () => {
    window.removeEventListener( 'resize', handleResize )
  } )
} )

// Remove the standalone window.addEventListener outside the lifecycle hooks
defineOptions( {
  name : 'TodoView'
} )
</script>

<style scoped lang="scss">
.todo-view {
  display: flex;
  height: 100%;
  gap: 10px;
}

.left-panel {
  width: 30%;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .todo-specific-filters {
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid var(--el-border-color-light);

    .todo-tabs {
      margin-bottom: 16px;

      :deep(.el-tabs__header) {
        margin: 0;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
      }

      :deep(.el-tabs__item) {
        font-size: 14px;
        font-weight: 500;
      }
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 8px;

      .sort-label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        font-weight: 500;
      }
    }
  }
}

.work-order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);

  .loading-container {
    padding: 16px;
  }

  .empty-list {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .list-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .pagination-info {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background: var(--el-bg-color);

      .info-text {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .cards-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
      overflow-x: hidden;

      // Custom scrollbar
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: var(--el-fill-color-lighter);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-fill-color-dark);
        border-radius: 3px;

        &:hover {
          background: var(--el-fill-color-darker);
        }
      }
    }

    .pagination-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      background: var(--el-bg-color);

      :deep(.el-pagination) {
        .el-pager li {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
        }

        .btn-prev,
        .btn-next {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
        }

        .el-pagination__total,
        .el-pagination__jump {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.right-panel {
  flex: 1;
  padding-bottom: 40px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;

  .loading-container {
    padding: 24px;

    .loading-text {
      text-align: center;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      margin-top: 16px;
    }
  }
}

// Responsive design for smaller screen
@media (max-width: 1024px) {
  .todo-view {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: auto;
    max-height: 50vh;

    .work-order-list {
      .list-content {
        .cards-container {
          min-height: 200px; // Reduce min-height for smaller screens
          max-height: calc(50vh - 120px); // Reserve space for pagination and info
        }
      }
    }
  }

  .right-panel {
    min-height: 50vh;
  }
}

@media (max-width: 768px) {
  .todo-view {
    gap: 12px;
  }

  .left-panel {
    max-height: 45vh; // Slightly increase height for mobile

    .work-order-list {
      padding-right: 0;

      .list-content {
        .pagination-info {
          padding: 8px 12px;
          font-size: 12px;

          .el-select {
            width: 80px;
          }
        }

        .cards-container {
          min-height: 150px; // Further reduce min-height for mobile
          max-height: calc(45vh - 100px); // Reserve space for pagination and info

          :deep(.work-order-card) {
            .card-content {
              .content-main {
                .card-title {
                  font-size: 14px;
                }

                .card-meta {
                  font-size: 11px;
                }
              }

              .card-thumbnail-circle {
                width: 50px;
                height: 50px;

                .circular-image {
                  width: 50px;
                  height: 50px;
                }

                .image-slot-circle {
                  width: 50px;
                  height: 50px;
                  font-size: 16px;
                }
              }
            }
          }
        }

        .pagination-controls {
          padding: 8px 12px;

          :deep(.el-pagination) {
            .el-pager li {
              min-width: 24px;
              height: 24px;
              line-height: 24px;
              font-size: 11px;
            }

            .btn-prev,
            .btn-next {
              min-width: 24px;
              height: 24px;
              line-height: 24px;
            }

            .el-pagination__total,
            .el-pagination__jump {
              font-size: 11px;
            }
          }
        }
      }
    }
  }

  .work-order-list {
    // Ensure the work-order-list has proper height management
    height: 100%;
    min-height: 300px; // Ensure minimum height even on very small screens
  }
}
</style>

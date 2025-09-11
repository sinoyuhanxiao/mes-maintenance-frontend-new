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
      <!-- Work Order Detail View -->
      <WorkOrderDetail
        v-if="currentRightPanelView === 'detail'"
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
      />

      <!-- Work Order Create View -->
      <WorkOrderCreate
        v-else-if="currentRightPanelView === 'create'"
        @back-to-detail="showDetailView"
        @work-order-created="handleWorkOrderCreated"
      />

      <!-- Work Order Edit View -->
      <WorkOrderEdit
        v-else-if="currentRightPanelView === 'edit'"
        :work-order="workOrderToEdit"
        @back-to-detail="showDetailView"
        @work-order-updated="handleWorkOrderUpdated"
      />
    </div>

    <!-- PDF Preview Modal -->
    <PdfPreviewModal v-model:visible="showPdfPreview" :work-order="pdfPreviewData" @close="handlePdfPreviewClose" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import WorkOrderCard from './WorkOrderCard.vue'
import WorkOrderDetail from './WorkOrderDetail.vue'
import WorkOrderCreate from './WorkOrderCreate.vue'
import WorkOrderEdit from './WorkOrderEdit.vue'
import PdfPreviewModal from '../PdfPreview/PdfPreviewModal.vue'

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
const currentRightPanelView = ref( 'detail' ) // 'detail', 'create', or 'edit'
const workOrderToEdit = ref( null )

// PDF Preview state
const showPdfPreview = ref( false )
const pdfPreviewData = ref( null )

// Use pagination from props instead of local state
const internalCurrentPage = ref( props.currentPage )
const internalPageSize = ref( props.pageSize )

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

// Methods
const selectWorkOrder = workOrder => {
  selectedWorkOrder.value = workOrder
}

const handleTabChange = tabName => {
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
    default:
      console.warn( `Unhandled action: ${action}`, workOrder )
  }
}

const handleEdit = workOrder => {
  // Show edit view in right panel instead of emitting to parent
  workOrderToEdit.value = workOrder
  currentRightPanelView.value = 'edit'
  selectedWorkOrder.value = workOrder
}

const handleDelete = workOrder => {
  emit( 'delete', workOrder )
}

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

const handlePageChange = page => {
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

const showCreateForm = () => {
  currentRightPanelView.value = 'create'
  selectedWorkOrder.value = null
}

const showDetailView = () => {
  currentRightPanelView.value = 'detail'
  workOrderToEdit.value = null
  if ( !selectedWorkOrder.value && displayedWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = displayedWorkOrders.value[0]
  }
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
} )

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

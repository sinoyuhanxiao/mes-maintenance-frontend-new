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

        <div v-else-if="filteredWorkOrders.length === 0" class="empty-list">
          <el-empty :description="$t('workOrder.messages.noData')" :image-size="80" />
        </div>

        <div v-else class="list-content">
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              {{ $t('workOrder.pagination.showing', {
                start: paginationInfo.start,
                end: paginationInfo.end,
                total: paginationInfo.total
              }) }}
            </div>
            <el-select
              v-model="pageSize"
              @change="handlePageSizeChange"
              size="small"
              style="width: 100px"
            >
              <el-option :label="'10'" :value="10" />
              <el-option :label="'20'" :value="20" />
              <el-option :label="'50'" :value="50" />
            </el-select>
          </div>

          <!-- Cards Container -->
          <div class="cards-container">
            <el-row :gutter="16">
              <el-col
                v-for="workOrder in paginatedWorkOrders"
                :key="workOrder.id"
              >
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
          <div class="pagination-controls" v-if="totalPages > 1">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredWorkOrders.length"
              :page-count="totalPages"
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

    <!-- Right Panel - Work Order Detail -->
    <div class="right-panel">
      <WorkOrderDetail
        :work-order="selectedWorkOrder"
        @edit="handleEdit"
        @share="handleShare"
        @status-change="handleStatusChange"
        @add-parts="handleAddParts"
        @add-time="handleAddTime"
        @add-costs="handleAddCosts"
        @view-procedure="handleViewProcedure"
        @add-comment="handleAddComment"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import WorkOrderCard from './WorkOrderCard.vue'
import WorkOrderDetail from './WorkOrderDetail.vue'

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
  }
} )

// Emits
const emit = defineEmits( ['edit', 'delete', 'status-change', 'refresh'] )

const { t } = useI18n()

// State
const selectedWorkOrder = ref( null )
const activeTab = ref( 'todo' )
const sortBy = ref( 'priority-desc' )

// Pagination state
const currentPage = ref( 1 )
const pageSize = ref( 10 )

// Computed
const filteredWorkOrders = computed( () => {
  let filtered = [...props.workOrders]

  // Apply external filters from UnifiedWorkOrderFilters
  const externalFilters = props.filters || {}

  // Filter by assigned to
  if ( externalFilters.assignedTo ) {
    filtered = filtered.filter( wo => wo.assigned_to === externalFilters.assignedTo )
  }

  // Filter by due date
  if ( externalFilters.dueDate ) {
    const now = new Date()
    const today = new Date( now.getFullYear(), now.getMonth(), now.getDate() )

    switch ( externalFilters.dueDate ) {
      case 'overdue':
        filtered = filtered.filter( wo => wo.due_date && new Date( wo.due_date ) < now )
        break
      case 'today':
        filtered = filtered.filter( wo => {
          if ( !wo.due_date ) return false
          const dueDate = new Date( wo.due_date )
          return dueDate >= today && dueDate < new Date( today.getTime() + 24 * 60 * 60 * 1000 )
        } )
        break
      case 'thisWeek': {
        const weekStart = new Date( today )
        weekStart.setDate( today.getDate() - today.getDay() )
        const weekEnd = new Date( weekStart )
        weekEnd.setDate( weekStart.getDate() + 7 )
        filtered = filtered.filter( wo => {
          if ( !wo.due_date ) return false
          const dueDate = new Date( wo.due_date )
          return dueDate >= weekStart && dueDate < weekEnd
        } )
        break
      }
      case 'thisMonth': {
        const monthStart = new Date( today.getFullYear(), today.getMonth(), 1 )
        const monthEnd = new Date( today.getFullYear(), today.getMonth() + 1, 1 )
        filtered = filtered.filter( wo => {
          if ( !wo.due_date ) return false
          const dueDate = new Date( wo.due_date )
          return dueDate >= monthStart && dueDate < monthEnd
        } )
        break
      }
      case 'custom':
        if ( externalFilters.customDateRange && externalFilters.customDateRange.length === 2 ) {
          const [startDate, endDate] = externalFilters.customDateRange
          filtered = filtered.filter( wo => {
            if ( !wo.due_date ) return false
            const dueDate = new Date( wo.due_date )
            return dueDate >= startDate && dueDate <= endDate
          } )
        }
        break
      default:
        break
    }
  }

  // Filter by work type
  if ( externalFilters.workType ) {
    filtered = filtered.filter( wo => wo.work_type?.id === externalFilters.workType )
  }

  // Filter by priority
  if ( externalFilters.priority ) {
    filtered = filtered.filter( wo => wo.priority?.id === externalFilters.priority )
  }

  // Filter by search text
  if ( externalFilters.search ) {
    const searchTerm = externalFilters.search.toLowerCase()
    filtered = filtered.filter(
      wo =>
        wo.name?.toLowerCase().includes( searchTerm ) ||
        wo.description?.toLowerCase().includes( searchTerm ) ||
        wo.code?.toLowerCase().includes( searchTerm )
    )
  }

  // Filter by tab (todo/done)
  if ( activeTab.value === 'todo' ) {
    filtered = filtered.filter( wo => wo.state?.name !== 'Completed' && wo.state?.name !== 'Done' )
  } else {
    filtered = filtered.filter( wo => wo.state?.name === 'Completed' || wo.state?.name === 'Done' )
  }

  // Apply sorting
  filtered.sort( ( a, b ) => {
    switch ( sortBy.value ) {
      case 'priority-desc':
        return getPriorityValue( b.priority?.name ) - getPriorityValue( a.priority?.name )
      case 'priority-asc':
        return getPriorityValue( a.priority?.name ) - getPriorityValue( b.priority?.name )
      case 'dueDate-asc':
        return new Date( a.due_date || '9999-12-31' ) - new Date( b.due_date || '9999-12-31' )
      case 'dueDate-desc':
        return new Date( b.due_date || '1900-01-01' ) - new Date( a.due_date || '1900-01-01' )
      case 'created-desc':
        return new Date( b.created_at ) - new Date( a.created_at )
      case 'created-asc':
        return new Date( a.created_at ) - new Date( b.created_at )
      default:
        return 0
    }
  } )

  return filtered
} )

// Pagination computed properties
const totalPages = computed( () => Math.ceil( filteredWorkOrders.value.length / pageSize.value ) )

const paginatedWorkOrders = computed( () => {
  const start = ( currentPage.value - 1 ) * pageSize.value
  const end = start + pageSize.value
  return filteredWorkOrders.value.slice( start, end )
} )

const paginationInfo = computed( () => {
  const total = filteredWorkOrders.value.length
  const start = total === 0 ? 0 : ( currentPage.value - 1 ) * pageSize.value + 1
  const end = Math.min( currentPage.value * pageSize.value, total )

  return {
    start,
    end,
    total
  }
} )

// Methods
const getPriorityValue = priority => {
  const priorityMap = {
    Urgent : 4,
    High : 3,
    Medium : 2,
    Low : 1
  }
  return priorityMap[priority] || 0
}

const selectWorkOrder = workOrder => {
  selectedWorkOrder.value = workOrder
}

const handleTabChange = tabName => {
  activeTab.value = tabName
  // Clear selection when switching tabs
  selectedWorkOrder.value = null
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
  emit( 'edit', workOrder )
}

const handleDelete = workOrder => {
  emit( 'delete', workOrder )
}

const handleShare = workOrder => {
  // Implement share functionality
  ElMessage.success( t( 'workOrder.messages.shareSuccess' ) )
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

const handleAddComment = ( { workOrder, comment } ) => {
  // Implement add comment functionality
  ElMessage.success( t( 'workOrder.comments.add' ) )
}

// Pagination methods
const handlePageChange = ( page ) => {
  currentPage.value = page
  // Clear selection when changing pages to avoid confusion
  selectedWorkOrder.value = null
}

const handlePageSizeChange = ( newPageSize ) => {
  pageSize.value = newPageSize
  currentPage.value = 1 // Reset to first page when changing page size
  selectedWorkOrder.value = null
}

// Watchers
watch(
  () => props.workOrders,
  newWorkOrders => {
    // Auto-select first work order if none selected
    if ( newWorkOrders.length > 0 && !selectedWorkOrder.value ) {
      selectedWorkOrder.value = paginatedWorkOrders.value[0]
    }
  },
  { immediate : true }
)

// Watch for filter changes to reset pagination
watch( () => props.filters, () => {
  currentPage.value = 1
  selectedWorkOrder.value = null
}, { deep : true } )

// Reset pagination when tab or sort changes
watch( [activeTab, sortBy], () => {
  currentPage.value = 1
  selectedWorkOrder.value = null
}, { deep : true } )

// Lifecycle
onMounted( () => {
  // Auto-select first work order
  if ( paginatedWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = paginatedWorkOrders.value[0]
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
      min-height: 550px; // Ensure space for at least 5 cards (5 * 110px)
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
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

// Responsive design
@media (max-width: 1024px) {
  .todo-view {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: auto;
    max-height: 50vh;
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
    max-height: 40vh;
  }

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
</style>

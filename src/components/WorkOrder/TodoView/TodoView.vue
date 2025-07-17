<template>
  <div class="todo-view">
    <!-- Left Panel - Work Order List -->
    <div class="left-panel">
      <!-- Todo-specific Filters (Status tabs and sorting) -->
      <div class="todo-specific-filters">
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

        <div v-else class="cards-container">
          <WorkOrderCard
            v-for="workOrder in filteredWorkOrders"
            :key="workOrder.id"
            :work-order="workOrder"
            :is-selected="selectedWorkOrder?.id === workOrder.id"
            @select="selectWorkOrder"
            @action="handleCardAction"
          />
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
  // TODO: Implement share functionality
  ElMessage.success( t( 'workOrder.messages.shareSuccess' ) )
}

const handleStatusChange = ( { workOrder, status } ) => {
  emit( 'status-change', { workOrder, status } )
}

const handleAddParts = () => {
  // TODO: Implement add parts functionality
  ElMessage.info( t( 'workOrder.tracking.addParts' ) )
}

const handleAddTime = () => {
  // TODO: Implement add time functionality
  ElMessage.info( t( 'workOrder.tracking.addTime' ) )
}

const handleAddCosts = () => {
  // TODO: Implement add costs functionality
  ElMessage.info( t( 'workOrder.tracking.addCosts' ) )
}

const handleViewProcedure = () => {
  // TODO: Implement view procedure functionality
  ElMessage.info( t( 'workOrder.tracking.viewProcedure' ) )
}

const handleAddComment = ( { workOrder, comment } ) => {
  // TODO: Implement add comment functionality
  console.log( 'Add comment:', comment, 'to work order:', workOrder.id )
  ElMessage.success( t( 'workOrder.comments.add' ) )
}

// Watchers
watch(
  () => props.workOrders,
  newWorkOrders => {
    // Auto-select first work order if none selected
    if ( newWorkOrders.length > 0 && !selectedWorkOrder.value ) {
      selectedWorkOrder.value = filteredWorkOrders.value[0]
    }
  },
  { immediate : true }
)

// Lifecycle
onMounted( () => {
  // Auto-select first work order
  if ( filteredWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = filteredWorkOrders.value[0]
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
  gap: 16px;
  background: var(--el-bg-color-page);
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
  overflow-y: auto;
  padding-right: 8px;

  .loading-container {
    padding: 16px;
  }

  .empty-list {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .cards-container {
    padding-bottom: 16px;
  }
}

.right-panel {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

// Custom scrollbar for work order list
.work-order-list::-webkit-scrollbar {
  width: 6px;
}

.work-order-list::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
}

.work-order-list::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 3px;
}

.work-order-list::-webkit-scrollbar-thumb:hover {
  background: var(--el-fill-color-darker);
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
  }
}
</style>

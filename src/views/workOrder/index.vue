<template>
  <MesLayout :title="$t('workOrder.title')" :view-mode="currentView">
    <!-- View Mode Selector in Title Row -->
    <template #viewMode>
      <div class="view-mode-selector">
        <el-select v-model="currentView" @change="handleViewChange" size="default" style="width: 140px">
          <el-option :label="$t('workOrder.viewModes.todo')" value="todo">
            <el-icon style="margin-right: 8px"><List /></el-icon>
            {{ $t('workOrder.viewModes.todo') }}
          </el-option>
          <el-option :label="$t('workOrder.viewModes.table')" value="table">
            <el-icon style="margin-right: 8px"><Grid /></el-icon>
            {{ $t('workOrder.viewModes.table') }}
          </el-option>
          <el-option :label="$t('workOrder.viewModes.calendar')" value="calendar">
            <el-icon style="margin-right: 8px"><Calendar /></el-icon>
            {{ $t('workOrder.viewModes.calendar') }}
          </el-option>
        </el-select>
      </div>
    </template>

    <!-- HEADER: Unified Filters Section (for both views) -->
    <template #head>
      <UnifiedWorkOrderFilters
        :model-value="{ ...listQuery }"
        @update:model-value="handleFilterUpdate"
        :export-loading="downloadLoading"
        :show-todo-actions="currentView === 'todo'"
        :current-view="currentView"
        class="unified-work-order-filters"
        @create="handleCreate"
        @export="handleDownload"
        @refresh="handleRefresh"
      />
    </template>

    <!-- BODY: Dynamic View Section -->
    <template #body>
      <!-- Table View -->
      <div v-if="currentView === 'table'" class="table-view">
        <!-- Recurrence View Banner -->
        <div v-if="recurrenceViewMode" class="recurrence-view-banner">
          <div class="banner-content">
            <el-icon class="banner-icon"><View /></el-icon>
            <span class="banner-text">
              {{ $t('workOrder.recurrenceView.title') }}
              <strong>{{ currentRecurrenceId }}</strong>
            </span>
          </div>
          <el-button type="primary" size="small" @click="handleExitRecurrenceView" class="exit-button">
            <el-icon><Back /></el-icon>
            {{ $t('workOrder.recurrenceView.exitView') }}
          </el-button>
        </div>

        <WorkOrderTable
          :data="list"
          :loading="listLoading"
          :expanded-rows="expandedRows"
          :load-children="loadChildren"
          :recurrence-view-mode="recurrenceViewMode"
          class="work-order-table"
          @expand-change="toggleRowHighlight"
          @view="handleView"
          @edit="handleUpdate"
          @delete="handleDelete"
          @view-recurrence="handleViewRecurrence"
        />
      </div>

      <!-- To-Do View -->
      <div v-else-if="currentView === 'todo'" class="todo-view-container">
        <TodoView
          ref="todoViewRef"
          :work-orders="list"
          :loading="listLoading"
          :filters="listQuery"
          :total="total"
          :current-page="listQuery.page"
          :page-size="listQuery.limit"
          @edit="handleUpdate"
          @delete="handleDelete"
          @refresh="fetchWorkOrders"
          @work-order-created="handleWorkOrderCreated"
          @work-order-updated="handleWorkOrderUpdated"
          @page-change="handleCurrentChange"
          @page-size-change="handleSizeChange"
          @tab-change="handleTabChange"
        />
      </div>

      <!-- Calendar View -->
      <div v-else-if="currentView === 'calendar'" class="todo-view-container">
        <CalendarView
          ref="calendarViewRef"
          :data="list"
          :loading="listLoading"
          @date-range-change="handleCalendarDisplayDateChange"
          @view="handleView"
        />
      </div>
    </template>

    <!-- FOOTER: Pagination Section (only for Table View) -->
    <template #foot>
      <div v-if="currentView === 'table'">
        <el-pagination
          :total="total"
          :hide-on-single-page="true"
          v-model:current-page="listQuery.page"
          v-model:page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </MesLayout>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Calendar, Grid, List, View, Back } from '@element-plus/icons-vue'
import MesLayout from 'src/components/MesLayout'
import UnifiedWorkOrderFilters from '@/components/WorkOrder/Filters/UnifiedWorkOrderFilters.vue'
import WorkOrderTable from '@/components/WorkOrder/Tables/WorkOrderTable.vue'
import TodoView from '@/components/WorkOrder/TodoView/TodoView.vue'
import CalendarView from '@/views/workOrder/components/workOrderCalendar.vue'
import { useWorkOrder } from '@/composables/useWorkOrder'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ElMessage } from 'element-plus'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'

// Composables
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { showSuccess } = useErrorHandler()
const workOrderDraftStore = useWorkOrderDraftStore()

// Work Order composable
const {
  loading : listLoading,
  list,
  total,
  listQuery,
  expandedRows,
  recurrenceViewMode,
  currentRecurrenceId,
  fetchWorkOrders,
  fetchRecurringWorkOrders,
  exitRecurrenceView,
  loadChildren,
  handleFilter,
  updateFilters,
  handleSizeChange,
  handleCurrentChange,
  toggleRowHighlight,
  // eslint-disable-next-line no-unused-vars
  handleDelete : deleteWorkOrder,
  initializeCommonData
} = useWorkOrder()

// State
const downloadLoading = ref( false )
const currentView = ref( 'todo' ) // 'table' or 'todo' or 'calendar'
const calendarViewRef = ref()
const todoViewRef = ref( null )

const clearShowCreateFlag = () => {
  if ( route.query.showCreate === undefined ) return
  // eslint-disable-next-line no-unused-vars
  const { showCreate, ...rest } = route.query
  router.replace( { path : route.path, query : { ...rest }} )
}

watch(
  () => route.query.showCreate,
  value => {
    if ( value === '1' || value === 'true' ) {
      nextTick( () => {
        todoViewRef.value?.showCreateForm()
        clearShowCreateFlag()
      } )
    }
  },
  { immediate : true }
)

watch(
  () => workOrderDraftStore.shouldOpenCreatePanel,
  value => {
    if ( value ) {
      nextTick( () => {
        todoViewRef.value?.showCreateForm()
        workOrderDraftStore.setShouldOpenCreatePanel( false )
      } )
    }
  }
)

// Methods
const handleView = row => {
  router.push( { name : 'ViewWorkOrder', params : { id : row.id }} )
}

const handleCreate = () => {
  if ( currentView.value === 'todo' ) {
    // For this view, emit create event to TodoView
    todoViewRef.value?.showCreateForm()
  } else {
    // For table view, navigate to separate page
    router.push( { name : 'NewWorkOrder' } )
  }
}

const handleUpdate = row => {
  // Edit work order functionality
}

const handleDelete = async( row, index ) => {
  // WorkOrderDetail component already handles the deletion and shows confirmation dialogs
  // This handler just needs to refresh the list after the delete event is emitted
  try {
    showSuccess( t( 'workOrder.messages.deleteSuccess' ) )
    // Refresh the work order list to reflect the deletion
    await fetchWorkOrders()
  } catch ( error ) {
    // Error handled by fetchWorkOrders
  }
}

const handleViewChange = async view => {
  currentView.value = view

  // Reset filter params that are specific to calendar view
  if ( view !== 'calendar' ) {
    delete listQuery.start_date_from
    delete listQuery.end_date_to
    listQuery.page = 1
    listQuery.limit = 20
  }

  // When switching to to-do view, set default status filter for "to-do" tab
  if ( view === 'todo' ) {
    updateFilters( { status : 'pending,in_progress' } )
  } else if ( view === 'table' ) {
    // Clear status filter for table view to show all items
    updateFilters( { status : null } )
  }
}

const handleRefresh = async() => {
  try {
    await fetchWorkOrders()
    showSuccess( 'Refreshed!' )
  } catch ( error ) {
    // Error handled by fetchWorkOrders composable
  }
}

const handleFilterUpdate = newFilters => {
  // Avoid breaking reactivity of listQuery by mutating its property
  Object.assign( listQuery, newFilters )
  // If current view is calendar, trigger calendar to sync its internal events with the newest version of list
  if ( currentView.value === 'calendar' ) {
    calendarViewRef.value?.refetchEvents()
  } else {
    handleFilter() // Triggers fetch
  }
}

const handleDownload = () => {
  // Download functionality to be implemented
}

const handleCalendarDisplayDateChange = async( { start_date_from, end_date_to, resolve, reject } ) => {
  Object.assign( listQuery, { start_date_from, end_date_to } )

  // Set page to -1 and limit to -1 to indicate using non page fetchWorkOrder as calendar don't have table's page concept
  listQuery.page = -1
  listQuery.limit = -1
  try {
    await fetchWorkOrders()
    resolve( list.value )
  } catch ( e ) {
    reject( e )
    ElMessage.error( 'Unable to load work-orders' )
  }
}

const handleWorkOrderCreated = async newWorkOrder => {
  try {
    // Reset to first page to ensure new item is visible (most recent first)
    listQuery.page = 1

    // Refresh the data to ensure consistency and get latest from server
    await fetchWorkOrders()

    // Auto-select the newly created work order in todo view
    if ( todoViewRef.value && newWorkOrder.id ) {
      // Give the Vue reactivity system a tick to update the computed properties
      await nextTick()

      const selected = todoViewRef.value.selectWorkOrderById( newWorkOrder.id )
      if ( !selected ) {
        const foundInList = list.value.find( wo => wo.id === newWorkOrder.id )

        if ( !foundInList ) {
          // Try fetching without status filter to see if it's a filtering issue
          const tempStatus = listQuery.status
          listQuery.status = null // Remove status filter temporarily
          await fetchWorkOrders()
          // Restore status filter
          listQuery.status = tempStatus
          await fetchWorkOrders()
        }

        // Fallback: select first available work order and switch to detail view
        todoViewRef.value.showDetailView()
      }
    }

    // Show success message after everything is updated
    showSuccess( t( 'workOrder.messages.createSuccess' ) )
  } catch ( error ) {
    // Still show success since creation succeeded, just list refresh failed
    showSuccess( t( 'workOrder.messages.createSuccess' ) )
  }
}

const handleWorkOrderUpdated = async updatedWorkOrder => {
  // Update the work order in the list
  const index = list.value.findIndex( wo => wo.id === updatedWorkOrder.id )
  if ( index !== -1 ) {
    list.value[index] = updatedWorkOrder
  }
  // Refresh to ensure data consistency with server
  await fetchWorkOrders()
}

const handleTabChange = async( { tab, statusFilter } ) => {
  // Update the status filter using the new updateFilters method
  updateFilters( { status : statusFilter } )
}

// Recurrence view handlers
const handleViewRecurrence = async recurrenceId => {
  if ( !recurrenceId ) return
  try {
    await fetchRecurringWorkOrders( recurrenceId )
    showSuccess( t( 'workOrder.messages.recurrenceViewEnabled' ) )
  } catch ( error ) {
    // Error handled by fetchRecurringWorkOrders composable
  }
}

const handleExitRecurrenceView = () => {
  exitRecurrenceView()
  showSuccess( t( 'workOrder.messages.recurrenceViewDisabled' ) )
}

// Handle creating work order from maintenance request
const handleCreateFromRequest = async() => {
  if ( route.query.action !== 'create' || !route.query.requestId ) return

  // Switch to todo view if not already there
  if ( currentView.value !== 'todo' ) {
    currentView.value = 'todo'
  }

  // Import the API function and load request data
  const { getMaintenanceRequestById } = await import( '@/api/maintenance-requests' )
  const requestId = Number( route.query.requestId )

  try {
    const response = await getMaintenanceRequestById( requestId )
    const requestData = response.data

    // Wait for TodoView to be ready, then pass the request data
    await nextTick()
    if ( todoViewRef.value ) {
      todoViewRef.value.showCreateFormWithRequestData( requestData )
    }

    // Clear query params after processing
    // eslint-disable-next-line no-unused-vars
    const { action, requestId : rid, ...rest } = route.query
    router.replace( { path : route.path, query : { ...rest }} )
  } catch ( error ) {
    ElMessage.error( 'Failed to load maintenance request data' )
  }
}

// Watch for route changes to handle creating work order from maintenance request
watch(
  () => route.query,
  async() => {
    await handleCreateFromRequest()
  }
)

// Lifecycle
onMounted( async() => {
  try {
    await initializeCommonData()
    await fetchWorkOrders()

    // Handle query parameters for creating work order from maintenance request
    await handleCreateFromRequest()
  } catch ( error ) {
    // Error handled by individual initialization functions
  }
} )

defineOptions( {
  name : 'WorkOrderManagement'
} )
</script>

<style scoped lang="scss">
// View Mode Selector (in title row)
.view-mode-selector {
  .el-select {
    :deep(.el-input__wrapper) {
      border-radius: 6px;
      border: 1px solid var(--el-border-color);
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    :deep(.el-input__inner) {
      font-weight: 500;
      font-size: 14px;
    }

    :deep(.el-select__caret) {
      color: var(--el-text-color-secondary);
    }
  }
}

// View Containers
.table-view {
  background: var(--el-bg-color);
}

.todo-view-container {
  height: calc(100vh - 200px); // Adjust based on header height
  padding-top: 5px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .view-mode-selector {
    .el-select {
      width: 160px;
    }
  }

  .todo-view-container {
    height: calc(100vh - 250px);
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .view-mode-selector {
    .el-select {
      width: 140px;
    }
  }

  .todo-view-container {
    height: calc(100vh - 280px);
    padding: 8px;
  }
}

// Additional styling for better integration
.work-order-filters {
  :deep(.filter-container) {
    margin-bottom: 0;
  }
}

// Recurrence View Banner
.recurrence-view-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border: 1px solid var(--el-color-primary-light-6);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

  .banner-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .banner-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }

    .banner-text {
      font-size: 14px;
      color: var(--el-text-color-primary);
      font-weight: 500;

      strong {
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }
  }

  .exit-button {
    font-size: 13px;
    font-weight: 500;

    .el-icon {
      margin-right: 6px;
    }
  }
}
</style>

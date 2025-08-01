<template>
  <MesLayout :title="$t('workOrder.title')" :view-mode="currentView">
    <!-- View Mode Selector in Title Row -->
    <template #viewMode>
      <div class="view-mode-selector">
        <el-select v-model="currentView" @change="handleViewChange" size="default" style="width: 140px">
          <el-option :label="$t('workOrder.viewModes.table')" value="table">
            <el-icon style="margin-right: 8px"><Grid /></el-icon>
            {{ $t('workOrder.viewModes.table') }}
          </el-option>
          <el-option :label="$t('workOrder.viewModes.todo')" value="todo">
            <el-icon style="margin-right: 8px"><List /></el-icon>
            {{ $t('workOrder.viewModes.todo') }}
          </el-option>
        </el-select>
      </div>
    </template>

    <!-- HEADER: Unified Filters Section (for both views) -->
    <template #head>
      <UnifiedWorkOrderFilters
        v-model="listQuery"
        :export-loading="downloadLoading"
        :show-todo-actions="currentView === 'todo'"
        class="unified-work-order-filters"
        @filter-change="handleFilter"
        @create="handleCreate"
        @export="handleDownload"
        @refresh="handleRefresh"
      />
    </template>

    <!-- BODY: Dynamic View Section -->
    <template #body>
      <!-- Table View -->
      <div v-if="currentView === 'table'" class="table-view">
        <WorkOrderTable
          :data="list"
          :loading="listLoading"
          :expanded-rows="expandedRows"
          :load-children="loadChildren"
          class="work-order-table"
          @expand-change="toggleRowHighlight"
          @view="handleView"
          @edit="handleUpdate"
          @delete="handleDelete"
        />
      </div>

      <!-- To-Do View -->
      <div v-else-if="currentView === 'todo'" class="todo-view-container">
        <TodoView
          ref="todoViewRef"
          :work-orders="list"
          :loading="listLoading"
          :filters="listQuery"
          @edit="handleUpdate"
          @delete="handleDelete"
          @status-change="handleStatusChange"
          @refresh="fetchWorkOrders"
          @work-order-created="handleWorkOrderCreated"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Grid, List } from '@element-plus/icons-vue'
import MesLayout from 'src/components/MesLayout'
import UnifiedWorkOrderFilters from '@/components/WorkOrder/UnifiedWorkOrderFilters.vue'
import WorkOrderTable from '@/components/WorkOrder/WorkOrderTable.vue'
import TodoView from '@/components/WorkOrder/TodoView/TodoView.vue'
import { useWorkOrder } from '@/composables/useWorkOrder'
import { useErrorHandler } from '@/composables/useErrorHandler'

// Composables
const router = useRouter()
const { t } = useI18n()
const { showSuccess } = useErrorHandler()

// Work Order composable
const {
  loading : listLoading,
  list,
  total,
  listQuery,
  expandedRows,
  fetchWorkOrders,
  loadChildren,
  handleFilter,
  handleSizeChange,
  handleCurrentChange,
  toggleRowHighlight,
  handleDelete : deleteWorkOrder,
  initializeCommonData
} = useWorkOrder()

// State
const downloadLoading = ref( false )
const currentView = ref( 'table' ) // 'table' or 'todo'
const todoViewRef = ref( null )

// Methods
const handleView = row => {
  router.push( { name : 'ViewWorkOrder', params : { id : row.id }} )
}

const handleCreate = () => {
  if ( currentView.value === 'todo' ) {
    // For todo view, emit create event to TodoView
    todoViewRef.value?.showCreateForm()
  } else {
    // For table view, navigate to separate page
    router.push( { name : 'NewWorkOrder' } )
  }
}

const handleUpdate = row => {
  console.log( 'Edit work order:', row )
}

const handleDelete = async( row, index ) => {
  try {
    await deleteWorkOrder( row, index )
    showSuccess( t( 'workOrder.messages.deleteSuccess' ) )
  } catch ( error ) {
    console.error( 'Delete failed:', error )
  }
}

const handleViewChange = view => {
  currentView.value = view
  console.log( 'View changed to:', view )
}

const handleStatusChange = ( { workOrder, status } ) => {
  // Implement status change API call
  console.log( 'Status change:', workOrder.id, 'to', status )
  showSuccess( t( 'workOrder.messages.statusChanged' ) )
}

const handleRefresh = async() => {
  try {
    await fetchWorkOrders()
    showSuccess( t( 'workOrder.messages.refreshSuccess' ) )
  } catch ( error ) {
    console.error( 'Refresh failed:', error )
  }
}

const handleDownload = () => {
  console.log( 'Download action triggered' )
}

const handleWorkOrderCreated = async newWorkOrder => {
  // Add the new work order to the list
  list.value.unshift( newWorkOrder )
  showSuccess( t( 'workOrder.messages.createSuccess' ) )
  // Refresh the data to ensure consistency
  await fetchWorkOrders()
}

// Lifecycle
onMounted( async() => {
  try {
    await initializeCommonData()
    await fetchWorkOrders()
  } catch ( error ) {
    console.error( 'Failed to initialize work order page:', error )
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
  padding: 5px;
  border-radius: 8px;
}

// Responsive design
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
</style>

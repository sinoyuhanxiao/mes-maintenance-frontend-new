<template>
  <div class="maintenance-requests-view" :style="{ height: containerHeight }">
    <!-- Left Panel - Request List -->
    <div class="left-panel">
      <!-- Filters Section -->
      <div class="filters-section" :class="{ 'filters-collapsed': !showFilters }">
        <!-- Search Input -->
        <div class="search-bar">
          <el-input v-model="searchQuery" placeholder="Search maintenance requests..." @input="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <div class="search-suffix-icons">
                <el-tooltip content="Show/Hide filters" placement="top">
                  <el-icon
                    class="filter-toggle"
                    :class="{ 'is-active': showFilters }"
                    @click.stop="toggleFilterVisibility"
                  >
                    <Filter />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-input>
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls" v-show="showFilters">
          <div class="filter-controls">
            <el-tree-select
              v-model="equipmentFilter"
              placeholder="Equipment"
              :data="equipmentTreeData"
              multiple
              filterable
              check-strictly
              node-key="value"
              :props="{ children: 'children', label: 'label' }"
              size="small"
              style="width: 140px"
              class="equipment-tree-select"
              popper-class="equipment-tree-select-popper"
              :teleported="false"
              @change="handleEquipmentFilter"
            />

            <el-select
              v-model="statusFilter"
              placeholder="Status"
              clearable
              size="small"
              style="width: 120px"
              @change="handleStatusFilter"
            >
              <el-option
                v-for="status in availableStatuses"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>

            <el-button size="small" @click="clearAllFilters"> Clear Filters </el-button>
          </div>
        </div>
      </div>

      <!-- Request Cards -->
      <div class="request-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="displayedRequests.length === 0" class="empty-list">
          <el-empty description="No maintenance requests found" :image-size="80" />
        </div>

        <div v-else class="list-content">
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ paginationInfo.total }} requests
            </div>
            <el-select v-model="pageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select>
          </div>

          <!-- Request Cards List -->
          <div class="requests-container">
            <RequestCard
              v-for="request in displayedRequests"
              :key="request.id"
              :request="request"
              :is-selected="selectedRequestId === request.id"
              @select="handleRequestSelect"
            />
          </div>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :pager-count="3"
              :total="pagination.total || 0"
              :page-sizes="[10, 20, 50]"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Request Details/Actions -->
    <div class="right-panel">
      <div v-if="requestDetailLoading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="!selectedRequest" class="no-selection">
        <div class="no-selection-content">
          <el-icon class="no-selection-icon"><Document /></el-icon>
          <h3>Select a Request</h3>
          <p>Choose a request from the list to view details and actions</p>
          <el-button type="primary" @click="openCreateDialog" style="margin-top: 8px">
            <el-icon><Plus /></el-icon>
            Create New Request
          </el-button>
        </div>
      </div>

      <div v-else class="request-details">
        <!-- Fixed Header Section -->
        <div class="fixed-header-section">
          <!-- Request Header -->
          <div class="details-header">
            <div class="header-main">
              <h2 class="request-title">
                {{ selectedRequest.name }}
                <el-tag type="info" class="status-tag-header"> #{{ selectedRequest.id }} </el-tag>
              </h2>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="default" @click="openCreateDialog" class="create-button">
                <el-icon><Plus /></el-icon>
                Request
              </el-button>
              <el-dropdown v-if="hasDropdownActions" trigger="click" @command="handleHeaderAction">
                <el-button type="text" size="default" class="action-button">
                  <el-icon class="rotated-icon"><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="approve" v-if="selectedRequest.status === 0" class="approve-action">
                      <el-icon><Check /></el-icon>
                      Approve
                    </el-dropdown-item>
                    <el-dropdown-item command="reject" v-if="selectedRequest.status === 0" class="reject-action">
                      <el-icon><Close /></el-icon>
                      Reject
                    </el-dropdown-item>
                    <el-dropdown-item command="edit" v-if="selectedRequest.status === 0" divided>
                      <el-icon><Edit /></el-icon>
                      Edit
                    </el-dropdown-item>
                    <el-dropdown-item command="createWorkOrder" v-if="selectedRequest.status !== 1">
                      <el-icon><DocumentAdd /></el-icon>
                      Create Work Order
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" v-if="selectedRequest.status === 0" divided class="delete-item">
                      <el-icon><Delete /></el-icon>
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="scrollable-content">
          <div class="tab-content-wrapper">
            <!-- General Tab -->
            <div class="tab-pane-content">
              <!-- Request Overview Card -->
              <div class="overview-card">
                <div class="card-content">
                  <el-descriptions :column="3" direction="vertical">
                    <el-descriptions-item label="Request ID">
                      <span class="info-value">#{{ selectedRequest.id }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="Created By">
                      <span class="info-value">{{ selectedRequest.created_by || 'N/A' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="Created At">
                      <span class="info-value">{{ formatDate(selectedRequest.created_at) }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedRequest.equipment_node" label="Equipment">
                      <span class="info-value">{{ selectedRequest.equipment_node.name }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="Status">
                      <el-tag :type="statusTagType(selectedRequest.status)" size="small">
                        {{ statusLabel(selectedRequest.status) }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedRequest.updated_at" label="Last Updated">
                      <span class="info-value">{{ formatDate(selectedRequest.updated_at) }}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>

              <!-- Description Card -->
              <div class="description-card" v-if="selectedRequest.description">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-content">
                  <div class="description-text">
                    {{ selectedRequest.description }}
                  </div>
                </div>
              </div>

              <!-- Associated Work Orders Card -->
              <div v-if="hasAssociatedWorkOrders" class="workorder-card">
                <div class="card-header">
                  <h3 class="card-title">Associated Work Orders</h3>
                </div>
                <div class="card-content">
                  <div class="request-grid">
                    <el-tooltip
                      v-for="workOrder in selectedRequest.request_work_orders"
                      :key="`workorder-${workOrder.id}`"
                      effect="light"
                      placement="top"
                      popper-class="request-tooltip-popper"
                    >
                      <template #content>
                        <div class="request-tooltip">
                          <div><strong>Name:</strong> {{ workOrder.name || `Work Order ${workOrder.id}` }}</div>
                          <div v-if="workOrder.assignee_ids && workOrder.assignee_ids.length">
                            <strong>Assignees:</strong> {{ workOrder.assignee_ids.length }} assigned
                          </div>
                          <div v-if="workOrder.priority">
                            <strong>Priority:</strong> {{ workOrder.priority.name || workOrder.priority }}
                          </div>
                          <div v-if="workOrder.status !== undefined">
                            <strong>Status:</strong> {{ getWorkOrderStatusLabel(workOrder.status) }}
                          </div>
                        </div>
                      </template>
                      <div class="request-card" @click="navigateToWorkOrder(workOrder.id)">
                        <div class="request-image">
                          <el-image
                            v-if="workOrder.image_list && workOrder.image_list.length"
                            :src="workOrder.image_list[0]"
                            fit="cover"
                            class="request-thumbnail"
                          >
                            <template #error>
                              <div class="request-icon workorder-icon">
                                <el-icon><DocumentAdd /></el-icon>
                              </div>
                            </template>
                          </el-image>
                          <div v-else class="request-icon workorder-icon">
                            <el-icon><DocumentAdd /></el-icon>
                          </div>
                        </div>
                        <div class="request-info">
                          <div class="request-name">{{ workOrder.name || `Work Order ${workOrder.id}` }}</div>
                          <div class="request-code">ID: #{{ workOrder.id }}</div>
                        </div>
                      </div>
                    </el-tooltip>
                  </div>
                </div>
              </div>

              <!-- Images Card -->
              <div v-if="requestImages.length > 0" class="images-card">
                <div class="card-header">
                  <h3 class="card-title">Images</h3>
                </div>
                <div class="card-content">
                  <div class="image-gallery">
                    <el-image
                      v-for="(imagePath, index) in requestImages"
                      :key="index"
                      :src="imagePath"
                      :preview-src-list="requestImages"
                      fit="cover"
                      class="workorder-image"
                    >
                      <template #error>
                        <div class="image-slot">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Request Dialog -->
    <CreateRequestDialog
      v-model:visible="createDialogVisible"
      :equipment-tree-data="equipmentTreeData"
      @submit="handleCreateRequest"
    />

    <!-- Edit Request Dialog -->
    <EditRequestDialog
      v-model:visible="editDialogVisible"
      :equipment-tree-data="equipmentTreeData"
      :request-data="selectedRequest"
      @submit="handleUpdateRequest"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Filter,
  Document,
  Plus,
  MoreFilled,
  Check,
  Close,
  DocumentAdd,
  Picture,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import { useMaintenanceRequests } from '@/composables/maintenanceRequests/useMaintenanceRequests'
import { getEquipmentTree } from '@/api/equipment'
import RequestCard from '../components/RequestCard.vue'
import CreateRequestDialog from '../components/CreateRequestDialog.vue'
import EditRequestDialog from '../components/EditRequestDialog.vue'
import useSettingsStore from '@/store/modules/settings'

const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()

// Composable integration
const {
  loading,
  requestDetailLoading,
  requests,
  currentRequest,
  pagination,
  loadRequests,
  loadRequest,
  createRequest,
  updateRequest,
  approveRequest,
  rejectRequest,
  deleteRequest,
  setFilter,
  clearFilters,
  setPage,
  setPageSize
} = useMaintenanceRequests()

// Local state management
const selectedRequestId = ref( null )
const createDialogVisible = ref( false )
const editDialogVisible = ref( false )
const showFilters = ref( false )
const containerHeight = ref( 'calc(100vh - 84px)' )

// Filters
const searchQuery = ref( '' )
const equipmentFilter = ref( [] )
const statusFilter = ref( null )
const equipmentTreeData = ref( [] )

// Pagination
const currentPage = ref( 1 )
const pageSize = ref( 20 )

// Computed properties
const selectedRequest = computed( () => {
  return currentRequest.value || requests.value.find( r => r.id === selectedRequestId.value )
} )

const displayedRequests = computed( () => {
  return Array.isArray( requests.value ) ? requests.value : []
} )

const availableStatuses = computed( () => [
  { value : 0, label : 'Pending' },
  { value : 1, label : 'Rejected' },
  { value : 2, label : 'Approved' }
] )

const paginationInfo = computed( () => {
  const start = ( pagination.page - 1 ) * pagination.size + 1
  const end = Math.min( pagination.page * pagination.size, pagination.total )
  return {
    start : pagination.total > 0 ? start : 0,
    end,
    total : pagination.total
  }
} )

const requestImages = computed( () => {
  if ( !selectedRequest.value?.image_list ) return []
  if ( Array.isArray( selectedRequest.value.image_list ) ) {
    return selectedRequest.value.image_list
  }
  if ( typeof selectedRequest.value.image_list === 'string' ) {
    return selectedRequest.value.image_list.split( ',' ).filter( Boolean )
  }
  return []
} )

const hasAssociatedWorkOrders = computed( () => {
  return selectedRequest.value?.request_work_orders?.length > 0
} )

const hasDropdownActions = computed( () => {
  if ( !selectedRequest.value ) return false
  const status = selectedRequest.value.status
  // Show dropdown if: pending (has approve/reject/edit/createWorkOrder) or non-rejected (has createWorkOrder)
  return status === 0 || status !== 1
} )

// Status helpers
const statusLabel = status => {
  const statusMap = {
    0 : 'Pending',
    1 : 'Rejected',
    2 : 'Approved'
  }
  return statusMap[status] || 'Unknown'
}

const statusTagType = status => {
  const typeMap = {
    0 : 'info',
    1 : 'danger',
    2 : 'success'
  }
  return typeMap[status] || 'info'
}

const getWorkOrderStatusLabel = status => {
  // Map work order status values to labels
  const statusMap = {
    0 : 'Pending',
    1 : 'In Progress',
    2 : 'Completed',
    3 : 'Cancelled'
  }
  return statusMap[status] || 'Unknown'
}

// eslint-disable-next-line no-unused-vars
const isTextOverflowing = text => {
  // Simple check - if text is longer than 30 characters, assume it might overflow
  return text && text.length > 30
}

// Event handlers
const handleSearch = debounce( () => {
  setFilter( 'keyword', searchQuery.value )
}, 300 )

const handleEquipmentFilter = () => {
  setFilter( 'equipment_node_id', equipmentFilter.value )
}

const handleStatusFilter = () => {
  setFilter( 'status', statusFilter.value )
}

const toggleFilterVisibility = () => {
  showFilters.value = !showFilters.value
  // Reset all filters when toggling visibility
  searchQuery.value = ''
  equipmentFilter.value = []
  statusFilter.value = null
  clearFilters()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  equipmentFilter.value = []
  statusFilter.value = null
  clearFilters()
}

const handleRequestSelect = async request => {
  selectedRequestId.value = request.id
  await loadRequest( request.id )
}

const handlePageChange = page => {
  currentPage.value = page
  pagination.page = page
  setPage( page )
}

const handlePageSizeChange = size => {
  pageSize.value = size
  setPageSize( size )
}

const handleHeaderAction = async command => {
  switch ( command ) {
    case 'edit':
      openEditDialog()
      break
    case 'approve':
      await handleApprove()
      break
    case 'reject':
      await handleReject()
      break
    case 'createWorkOrder':
      await handleCreateWorkOrder()
      break
    case 'delete':
      await handleDelete()
      break
    default:
      // No action for unknown command
      break
  }
}

const handleApprove = async() => {
  try {
    await ElMessageBox.confirm( 'Approve this maintenance request?', 'Confirm Approval', {
      confirmButtonText : 'Approve',
      cancelButtonText : 'Cancel',
      type : 'success'
    } )

    await approveRequest( selectedRequestId.value )
    ElMessage.success( 'Request approved successfully' )
    selectedRequestId.value = null
    currentRequest.value = null
    await loadRequests()
  } catch ( error ) {
    if ( error !== 'cancel' && error !== 'close' ) {
      ElMessage.error( 'Failed to approve request' )
    }
  }
}

const handleReject = async() => {
  try {
    await ElMessageBox.confirm( 'Reject this maintenance request?', 'Confirm Rejection', {
      confirmButtonText : 'Reject',
      cancelButtonText : 'Cancel',
      type : 'warning',
      confirmButtonClass : 'el-button--danger'
    } )

    await rejectRequest( selectedRequestId.value )
    ElMessage.success( 'Request rejected successfully' )
    selectedRequestId.value = null
    currentRequest.value = null
    await loadRequests()
  } catch ( error ) {
    if ( error !== 'cancel' && error !== 'close' ) {
      ElMessage.error( 'Failed to reject request' )
    }
  }
}

const handleDelete = async() => {
  try {
    await ElMessageBox.confirm(
      'This action will permanently delete this maintenance request. This cannot be undone.',
      'Delete Maintenance Request',
      {
        confirmButtonText : 'Delete',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--danger'
      }
    )

    await deleteRequest( selectedRequestId.value )
    ElMessage.success( 'Request deleted successfully' )
    selectedRequestId.value = null
    currentRequest.value = null
    await loadRequests()
  } catch ( error ) {
    if ( error !== 'cancel' && error !== 'close' ) {
      ElMessage.error( 'Failed to delete request' )
    }
  }
}

const handleCreateWorkOrder = () => {
  router.push( {
    path : '/work-order/table',
    query : {
      action : 'create',
      requestId : selectedRequestId.value
    }
  } )
}

const openCreateDialog = () => {
  createDialogVisible.value = true
}

const openEditDialog = () => {
  editDialogVisible.value = true
}

const handleCreateRequest = async formData => {
  try {
    const createdRequest = await createRequest( formData )
    ElMessage.success( 'Maintenance request created successfully' )
    createDialogVisible.value = false
    await loadRequests()

    // Automatically select the newly created request
    const newRequestId = createdRequest?.id || createdRequest
    if ( newRequestId ) {
      selectedRequestId.value = newRequestId
      await loadRequest( newRequestId )
    }
  } catch ( error ) {
    ElMessage.error( 'Failed to create maintenance request' )
  }
}

const handleUpdateRequest = async formData => {
  try {
    await updateRequest( formData.id, formData )
    ElMessage.success( 'Maintenance request updated successfully' )
    editDialogVisible.value = false
  } catch ( error ) {
    ElMessage.error( 'Failed to update maintenance request' )
  }
}

const navigateToWorkOrder = workOrderId => {
  router.push( {
    path : '/work-order/table',
    query : { workOrderId }
  } )
}

const formatDate = dateString => {
  if ( !dateString ) return 'N/A'
  const date = new Date( dateString )
  const year = date.getFullYear()
  const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
  const day = String( date.getDate() ).padStart( 2, '0' )
  const hours = String( date.getHours() ).padStart( 2, '0' )
  const minutes = String( date.getMinutes() ).padStart( 2, '0' )
  const seconds = String( date.getSeconds() ).padStart( 2, '0' )
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Equipment tree data fetching
const fetchEquipmentTreeData = async() => {
  try {
    const response = await getEquipmentTree()
    const data = response.data?.data || response.data

    const transformEquipmentNode = node => ( {
      value : node.id,
      label : node.name,
      children : node.children?.length > 0 ? node.children.map( transformEquipmentNode ) : undefined
    } )

    if ( Array.isArray( data ) ) {
      equipmentTreeData.value = data.map( transformEquipmentNode )
    } else if ( data?.equipment_nodes ) {
      equipmentTreeData.value = data.equipment_nodes.map( transformEquipmentNode )
    }
  } catch ( error ) {
    // Error handled by equipment API
  }
}

// Dynamic height calculation
const calculateHeight = () => {
  const tagsViewHeight = settingsStore.tagsView ? 34 : 0
  const navbarHeight = 50
  const totalOffset = navbarHeight + tagsViewHeight
  containerHeight.value = `calc(100vh - ${totalOffset}px)`
}

const handleResize = debounce( () => {
  calculateHeight()
}, 100 )

// Lifecycle
onMounted( async() => {
  calculateHeight()
  window.addEventListener( 'resize', handleResize )
  await Promise.all( [loadRequests(), fetchEquipmentTreeData()] )

  // Handle requestId query parameter
  if ( route.query.requestId ) {
    const requestId = Number( route.query.requestId )
    if ( requestId ) {
      selectedRequestId.value = requestId
      await loadRequest( requestId )
    }
  }
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
} )

// Watch for settings changes
watch(
  () => settingsStore.tagsView,
  () => {
    calculateHeight()
  }
)

// Watch for route query parameter changes
watch(
  () => route.query.requestId,
  async newRequestId => {
    if ( newRequestId ) {
      const requestId = Number( newRequestId )
      if ( requestId ) {
        selectedRequestId.value = requestId
        await loadRequest( requestId )
      }
    }
  }
)

// Expose methods for parent component
defineExpose( {
  openCreateDialog
} )

defineOptions( {
  name : 'MaintenanceRequestsView'
} )
</script>

<style scoped>
.maintenance-requests-view {
  display: flex;
  background: #f5f7fa;
}

.left-panel {
  width: 405px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  background: white;
  overflow: hidden;
}

.filters-section {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.filters-collapsed {
  padding-bottom: 0 !important;
}

.search-bar {
  margin-bottom: 12px;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.request-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-container {
  padding: 20px;
}

.empty-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
}

.requests-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.requests-container::-webkit-scrollbar {
  width: 6px;
}

.requests-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.requests-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.requests-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.pagination-container {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e4e7ed;
}

/* Right Panel Styles */
.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-selection-content {
  text-align: center;
  color: #909399;
}

.no-selection-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.request-details {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fixed-header-section {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 12px;
}

.scrollable-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-main {
  flex: 1;
}

.request-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-tag-header {
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-button {
  font-size: 20px;
  padding: 8px;
}

.rotated-icon {
  transform: rotate(90deg);
}

/* Card Components - matching TemplateLibraryView */
.overview-card,
.description-card,
.images-card,
.workorder-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
}

.card-header {
  padding: 8px 24px 16px 24px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-content {
  padding: 12px 24px 12px 24px;
}

/* Tab Content Wrapper */
.tab-content-wrapper {
  width: 100%;
}

.tab-pane-content {
  width: 100%;
  margin-top: 24px;
}

/* Info Values */
.info-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

/* Description Text */
.description-text {
  color: #303133;
  line-height: 1.7;
  font-size: 14px;
}

/* Image Gallery */
.image-gallery {
  display: flex;
  flex-direction: row;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
}

.workorder-image {
  width: 200px;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.filter-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.filter-toggle:hover {
  color: var(--el-color-primary);
}

.filter-toggle.is-active {
  color: var(--el-color-primary);
}

.search-suffix-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.equipment-tree-select) {
  max-height: 500px;
  width: 300px;
}

:deep(.equipment-tree-select .el-select__popper) {
  min-width: 300px;
}

:deep(.el-tree.equipment-tree-select) {
  width: 300px !important;
}

:deep(.el-icon) {
  margin-right: 5px;
}

/* Approve action styling - darker success green */
:deep(.approve-action) {
  color: #529b2e !important;
  font-weight: 500;
}

:deep(.approve-action:hover) {
  background-color: #f0f9eb !important;
  color: #529b2e !important;
}

/* Reject action styling - danger red */
:deep(.reject-action) {
  color: #f56c6c !important;
  font-weight: 500;
}

:deep(.reject-action:hover) {
  background-color: #fef0f0 !important;
  color: #f56c6c !important;
}

/* Delete Item Styles */
:deep(.delete-item) {
  color: var(--el-color-danger) !important;

  .el-icon {
    color: var(--el-color-danger);
  }

  &:hover {
    background-color: var(--el-color-danger-light-9) !important;
  }
}

/* Request Grid Styles - matching WorkOrderDetail */
.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 12px;

  .request-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    background: var(--el-bg-color);
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .request-image,
    .request-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .request-icon {
      background: var(--el-color-primary-light-9);

      .el-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }

      &.workorder-icon {
        background: var(--el-color-primary-light-9);

        .el-icon {
          color: var(--el-color-primary);
        }
      }
    }

    .request-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .request-info {
      flex: 1;
      margin-left: 12px;
      min-width: 0;

      .request-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .request-code {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

/* Request Tooltip Styles */
.request-tooltip {
  padding: 6px 12px;
  background: white !important;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 280px;

  div {
    margin-bottom: 6px;
    color: var(--el-text-color-regular);

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: var(--el-text-color-primary);
      font-weight: 600;
      margin-right: 4px;
    }
  }
}

:deep(.request-tooltip-popper) {
  background: white !important;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>

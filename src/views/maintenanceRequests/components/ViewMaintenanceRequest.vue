<template>
  <div class="view-maintenance-request-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
      <div class="loading-text">Loading maintenance request details...</div>
    </div>

    <!-- Maintenance Request Detail -->
    <div v-else-if="maintenanceRequest" class="request-details">
      <!-- Fixed Header Section -->
      <div class="fixed-header-section">
        <!-- Request Header -->
        <div class="details-header">
          <div class="header-main">
            <h2 class="request-title">
              {{ maintenanceRequest.name }}
              <el-tag type="info" class="status-tag-header"> #{{ maintenanceRequest.id }} </el-tag>
            </h2>
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
                    <span class="info-value">#{{ maintenanceRequest.id }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="Created By">
                    <span class="info-value">{{
                      maintenanceRequest.created_by
                        ? typeof maintenanceRequest.created_by === 'object'
                          ? `${maintenanceRequest.created_by.first_name} ${maintenanceRequest.created_by.last_name}`
                          : maintenanceRequest.created_by
                        : 'N/A'
                    }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="Created At">
                    <span class="info-value">{{ formatDate(maintenanceRequest.created_at) }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item v-if="maintenanceRequest.equipment_node" label="Equipment">
                    <span class="info-value">{{ maintenanceRequest.equipment_node.name }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="Status">
                    <el-tag :type="statusTagType(maintenanceRequest.status)" size="small">
                      {{ statusLabel(maintenanceRequest.status) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item v-if="maintenanceRequest.updated_at" label="Last Updated">
                    <span class="info-value">{{ formatDate(maintenanceRequest.updated_at) }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <!-- Description Card -->
            <div class="description-card" v-if="maintenanceRequest.description">
              <div class="card-header">
                <h3 class="card-title">Description</h3>
              </div>
              <div class="card-content">
                <div class="description-text">
                  {{ maintenanceRequest.description }}
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
                    v-for="workOrder in maintenanceRequest.request_work_orders"
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

    <!-- Error State -->
    <div v-else class="error-container">
      <el-empty description="Maintenance request not found" :image-size="120" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DocumentAdd, Picture } from '@element-plus/icons-vue'
import { useMaintenanceRequests } from '@/composables/maintenanceRequests/useMaintenanceRequests'
import { useTagsViewStore } from '@/store'

// Router
const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

// Composable integration
const { currentRequest, loadRequest } = useMaintenanceRequests()

// Local state
const maintenanceRequest = ref( null )
const loading = ref( true )

// Computed properties
const requestImages = computed( () => {
  if ( !maintenanceRequest.value?.image_list ) return []
  if ( Array.isArray( maintenanceRequest.value.image_list ) ) {
    return maintenanceRequest.value.image_list
  }
  if ( typeof maintenanceRequest.value.image_list === 'string' ) {
    return maintenanceRequest.value.image_list.split( ',' ).filter( Boolean )
  }
  return []
} )

const hasAssociatedWorkOrders = computed( () => {
  return maintenanceRequest.value?.request_work_orders?.length > 0
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
  const statusMap = {
    0 : 'Pending',
    1 : 'In Progress',
    2 : 'Completed',
    3 : 'Cancelled'
  }
  return statusMap[status] || 'Unknown'
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

// Methods
const loadMaintenanceRequest = async() => {
  try {
    loading.value = true
    const requestId = route.params.id

    if ( !requestId ) {
      ElMessage.error( 'Maintenance request ID is missing' )
      loading.value = false
      return
    }

    await loadRequest( requestId )
    maintenanceRequest.value = currentRequest.value

    if ( maintenanceRequest.value ) {
      // Update tags view title with request ID
      tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, `Request - ${requestId}` )
    } else {
      ElMessage.error( 'Failed to load maintenance request details' )
    }
  } catch ( error ) {
    console.error( 'Failed to fetch maintenance request:', error )
    ElMessage.error( 'Failed to load maintenance request details' )
  } finally {
    loading.value = false
  }
}

const navigateToWorkOrder = workOrderId => {
  router.push( {
    path : `/maintenance/work-orders/view/${workOrderId}`
  } )
}

// Lifecycle
onMounted( async() => {
  await loadMaintenanceRequest()
} )

defineOptions( {
  name : 'ViewMaintenanceRequest'
} )
</script>

<style scoped lang="scss">
.view-maintenance-request-wrapper {
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

/* Card Components */
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

.tab-content-wrapper {
  width: 100%;
}

.tab-pane-content {
  width: 100%;
  margin-top: 24px;
}

.info-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

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

/* Request Grid Styles */
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

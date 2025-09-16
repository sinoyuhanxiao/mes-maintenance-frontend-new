<template>
  <div class="work-order-detail" v-if="workOrder">
    <!-- Detail Header -->
    <div class="detail-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <div class="title-row">
              <h2 class="detail-title">{{ workOrder.name }}</h2>
              <span class="work-order-id">#{{ workOrder.id }}</span>
            </div>
            <div class="meta-info">
              <span class="created-date">
                {{ $t('workOrder.form.createdOn') }}: {{ formatDate(workOrder.created_at) }}
              </span>
              <span v-if="workOrder.updated_at" class="updated-date">
                Updated: {{ formatDate(workOrder.updated_at) }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="header-actions">
            <el-dropdown trigger="click" @command="handleHeaderAction">
              <el-button type="text" size="default" class="action-button">
                <el-icon class="rotated-icon"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>
                    {{ $t('workOrder.actions.edit') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="share">
                    <el-icon><Share /></el-icon>
                    {{ $t('workOrder.actions.share') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    {{ $t('workOrder.actions.export') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided class="delete-item">
                    <el-icon><Delete /></el-icon>
                    {{ $t('workOrder.actions.delete') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- General Detail Section -->
    <div class="detail-section">
      <el-descriptions :column="4" class="general-details-descriptions">
        <el-descriptions-item :label="$t('workOrder.table.state')">
          <el-select v-model="localStatus" @change="handleStatusChange" size="small" style="width: 150px">
            <el-option label="Ready" value="Ready" />
            <el-option label="On Hold" value="On Hold" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Completed" value="Completed" />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item v-if="workOrder.code" label="Work Order Code">
          <span class="detail-value work-order-code">{{ workOrder.code }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.priority')">
          <PriorityTag :priority="workOrder.priority" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.assignedTo')">
          <span class="field-value">{{ workOrder.created_by || 'Unassigned' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Updated By">
          <span class="field-value">{{ workOrder.updated_by || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.workType')">
          <WorkTypeTag :work-type="workOrder.work_type" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.category')">
          <CategoryTag :category="workOrder.categories || workOrder.category_list?.[0]" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.estimatedTime')">
          <span class="detail-value">
            {{ workOrder.estimated_minutes ? `${workOrder.estimated_minutes} min` : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="workOrder.vendor_ids?.length" label="Vendors">
          <span class="detail-value">{{ workOrder.vendor_ids.join(', ') }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="workOrder.request" label="Related Request">
          <span class="detail-value linked-value" @click="viewRequest(workOrder.request)">
            {{ workOrder.request.name }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Dates Section -->
    <div class="detail-section dates-section">
      <el-descriptions :column="4" class="dates-descriptions">
        <el-descriptions-item label="Start Date">
          <span class="detail-value">
            {{ workOrder.start_date ? formatDate(workOrder.start_date) : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="End Date">
          <span class="detail-value">
            {{ workOrder.end_date ? formatDate(workOrder.end_date) : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.dueDate')">
          <span class="detail-value" :class="{ overdue: isOverdue }">
            {{ workOrder.due_date ? formatDate(workOrder.due_date) : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="Recurrence Type">
          <span
            class="detail-value"
            :class="{ 'recurrence-clickable': isRecurring }"
            @click="isRecurring ? scrollToScheduleSection() : null"
            :style="{ cursor: isRecurring ? 'pointer' : 'default' }"
          >
            {{ getRecurrenceTypeLabel() }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Description Section -->
    <div class="detail-section" v-if="workOrder.description">
      <el-descriptions :column="1" class="general-details-descriptions">
        <el-descriptions-item :label="$t('workOrder.table.description')">
          <div class="description-content">
            <p>{{ workOrder.description }}</p>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Related Equipment Section -->
    <div class="detail-section" v-if="workOrder.equipment_node_ids?.length">
      <el-divider />
      <h3 class="section-title">Related Equipment</h3>
      <div v-if="loadingEquipment" class="loading-container">
        <el-skeleton :rows="2" animated />
      </div>
      <div v-else-if="hasValidEquipment" class="equipment-grid">
        <el-tooltip
          v-for="equipment in validEquipmentList"
          :key="`equipment-${equipment.id}-${equipment.name}`"
          effect="light"
          placement="top"
          popper-class="equipment-tooltip-popper"
        >
          <template #content>
            <div class="equipment-tooltip">
              <div v-if="equipment.manufacturer"><strong>Manufacturer:</strong> {{ equipment.manufacturer.name }}</div>
              <div v-if="equipment.location?.name"><strong>Location:</strong> {{ equipment.location.name }}</div>
              <div v-if="equipment.person_in_charge">
                <strong>Person in Charge:</strong> {{ equipment.person_in_charge }}
              </div>
              <div v-if="!equipment.manufacturer && !equipment.location?.name && !equipment.person_in_charge">
                No additional details available
              </div>
            </div>
          </template>
          <div class="equipment-card">
            <div class="equipment-image">
              <el-image
                v-if="equipment.image_list?.length"
                :src="equipment.image_list[0]"
                fit="cover"
                class="equipment-thumbnail"
              >
                <template #error>
                  <div class="equipment-icon">
                    <el-icon><Tools /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-else class="equipment-icon">
                <el-icon><Tools /></el-icon>
              </div>
            </div>
            <div class="equipment-info">
              <div class="equipment-name">{{ equipment.name || `Equipment ${equipment.id}` }}</div>
              <div class="equipment-type">{{ equipment.type || equipment.equipment_type || 'Equipment' }}</div>
            </div>
          </div>
        </el-tooltip>
      </div>
      <div v-else class="no-equipment">
        <el-empty description="No equipment details available" :image-size="60" />
      </div>
    </div>

    <!-- Work Order Progress Section -->
    <div class="detail-section" v-if="workOrderProgress">
      <el-divider />
      <h3 class="section-title">Task Progress</h3>
      <div class="progress-section">
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Total Tasks:</span>
            <span class="stat-value">{{ workOrderProgress.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed:</span>
            <span class="stat-value completed">{{ workOrderProgress.completed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Failed:</span>
            <span class="stat-value failed">{{ workOrderProgress.failed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Remaining:</span>
            <span class="stat-value">{{ workOrderProgress.remaining }}</span>
          </div>
        </div>
        <div class="progress-bar-container">
          <el-progress
            :percentage="workOrderProgress.percentage"
            :stroke-width="12"
            :status="workOrderProgress.percentage === 100 ? 'success' : 'primary'"
          />
          <div class="progress-text">
            {{ workOrderProgress.completed }} of {{ workOrderProgress.total }} tasks completed
          </div>
        </div>
      </div>
    </div>

    <!-- Attachments Section - Following equipment details pattern -->
    <div class="detail-section" v-if="hasAttachments || hasFileAttachments">
      <el-divider />

      <!-- Images Section -->
      <div v-if="hasAttachments" class="images-section">
        <el-descriptions :column="1">
          <el-descriptions-item label="Images">
            <div class="image-gallery">
              <el-image
                v-for="(imagePath, index) in workOrder.image_list"
                :key="index"
                :src="imagePath"
                :preview-src-list="workOrder.image_list"
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
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Files Section -->
      <div v-if="hasFileAttachments" class="files-section">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Files">
            <div class="file-list">
              <div v-for="file in processedFileList" :key="file.id || file.name" class="file-item">
                <el-link :href="file.url" target="_blank" :icon="getFileIcon(file.type)" class="file-link">
                  {{ file.name }}
                </el-link>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- Schedule Conditions Section -->
    <div v-if="isRecurring" class="detail-section schedule-conditions-section">
      <el-divider />
      <div class="schedule-header" ref="scheduleSection">
        <h3 class="section-title">{{ $t('workOrder.schedule.title') }}</h3>
        <el-button
          type="default"
          size="small"
          @click="openTimelineModal"
          :title="$t('workOrder.schedule.viewTimeline')"
          class="timeline-button"
        >
          <el-icon><View /></el-icon>
          {{ $t('workOrder.schedule.viewTimeline') }}
        </el-button>
      </div>

      <!-- Schedule Details -->
      <el-descriptions :column="4" class="general-details-descriptions" style="margin-left: 4px !important">
        <el-descriptions-item :label="$t('workOrder.schedule.repeatTypeLabel')">
          <span class="detail-value">{{ $t('workOrder.schedule.timeBased') }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.schedule.frequencyLabel')">
          <span class="detail-value">{{ $t('workOrder.schedule.weeklyPattern') }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.schedule.continuedFromLabel')">
          <span class="detail-value linked-value" @click="navigateToLinkedOrder">Daily Wash - Washin Washer</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Time & Cost Tracking Card -->
    <div class="detail-section time-cost-tracking-card">
      <el-divider />
      <h3 class="section-title">Tracking</h3>

      <!-- Tracking Tabs -->
      <el-tabs v-model="activeTrackingTab" class="tracking-tabs">
        <!-- Tasks Tab -->
        <el-tab-pane label="Tasks" name="tasks">
          <div class="tab-content">
            <div v-if="workOrder.task_list?.length" class="tasks-list">
              <div v-for="(taskId, index) in workOrder.task_list" :key="taskId" class="task-item">
                <div class="task-number">{{ index + 1 }}</div>
                <div class="task-info">
                  <div class="task-id">Task ID: {{ taskId }}</div>
                  <div class="task-status">Status: Pending</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data-placeholder">
              <el-empty description="No Tasks" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>

        <!-- Standards Tab -->
        <el-tab-pane label="Standards" name="standards">
          <div class="tab-content">
            <div v-if="workOrder.standards?.length" class="standards-list">
              <div v-for="standard in workOrder.standards" :key="standard.id" class="standard-item">
                <div class="standard-header">
                  <span class="standard-name">{{ standard.name }}</span>
                  <span class="standard-code">{{ standard.code }}</span>
                </div>
                <div class="standard-description">{{ standard.description }}</div>
              </div>
            </div>
            <div v-else class="no-data-placeholder">
              <el-empty description="No Standards" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>

        <!-- Costs Tab -->
        <el-tab-pane label="Costs" name="costs">
          <div class="tab-content">
            <div class="no-data-placeholder">
              <el-empty description="No Cost Data" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Work Order Timeline Modal -->
    <el-dialog
      v-model="timelineModalVisible"
      :title="$t('workOrder.timeline.title')"
      width="900px"
      :before-close="handleTimelineModalClose"
      class="timeline-modal"
    >
      <Timeline :timeline-events="timelineEvents" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timelineModalVisible = false">{{ $t('workOrder.actions.cancel') }}</el-button>
          <el-button type="primary" @click="exportTimeline">
            <el-icon><Download /></el-icon>
            {{ $t('workOrder.timeline.export') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Modal for Recurring Work Orders -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="Delete Work Order"
      width="480px"
      :before-close="() => (deleteDialogVisible = false)"
      class="delete-dialog"
    >
      <div class="delete-dialog-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <div class="delete-message">
          <h4>This is a recurring work order</h4>
          <p>Choose which work orders you want to delete:</p>
        </div>
      </div>

      <template #footer>
        <div class="delete-dialog-footer">
          <el-button @click="deleteDialogVisible = false" :disabled="deleting"> Cancel </el-button>
          <el-button type="warning" @click="handleDeleteConfirmation('individual')" :loading="deleting">
            <el-icon><DocumentDelete /></el-icon>
            Individual
          </el-button>
          <el-button type="danger" @click="handleDeleteConfirmation('recurrence')" :loading="deleting">
            <el-icon><DocumentDelete /></el-icon>
            Recurrence
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-detail">
    <el-empty :description="$t('workOrder.selectWorkOrder')" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Edit,
  Share,
  Picture,
  Download,
  View,
  MoreFilled,
  Tools,
  Delete,
  Warning,
  Document,
  DocumentDelete,
  VideoCamera,
  Microphone
} from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import { getEquipmentById } from '@/api/equipment'
import { deleteIndividualWorkOrder, deleteRecurrenceWorkOrders } from '@/api/work-order'
import PriorityTag from '../PriorityTag.vue'
import WorkTypeTag from '../WorkTypeTag.vue'
import CategoryTag from '../CategoryTag.vue'
import Timeline from '../Timeline/Timeline.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    default : null
  }
} )

// Emits
const emit = defineEmits( [
  'edit',
  'share',
  'export',
  'status-change',
  'add-parts',
  'add-time',
  'add-costs',
  'view-procedure',
  'add-comment',
  'delete'
] )

// State
const localStatus = ref( '' )
const activeTrackingTab = ref( 'tasks' )
const timelineModalVisible = ref( false )
const equipmentDetails = ref( [] )
const loadingEquipment = ref( false )
const deleteDialogVisible = ref( false )
const deleting = ref( false )
const scheduleSection = ref( null )

// Timeline events data - Empty for now
const timelineEvents = ref( [] )

// Computed
const isOverdue = computed( () => {
  return props.workOrder?.due_date && new Date( props.workOrder.due_date ) < new Date()
} )

const hasAttachments = computed( () => {
  return props.workOrder?.image_list && props.workOrder.image_list.length > 0
} )

const isRecurring = computed( () => {
  // Check if work order has recurrence (not type 1 which means "Does not repeat")
  const recurrenceType = props.workOrder?.recurrence_type

  if ( !recurrenceType ) {
    return false
  }

  // Debug: log the recurrence type for debugging
  console.log( 'IsRecurring check:', recurrenceType )

  // If it has an id, check if it's not 1 ("Does not repeat")
  if ( recurrenceType.id ) {
    return recurrenceType.id !== 1
  }

  // If it's a string, check if it's not "Does not repeat"
  if ( typeof recurrenceType === 'string' ) {
    return recurrenceType.toLowerCase() !== 'does not repeat' && recurrenceType.toLowerCase() !== 'none'
  }

  // If it's an object with name property
  if ( recurrenceType.name ) {
    return recurrenceType.name.toLowerCase() !== 'does not repeat' && recurrenceType.name.toLowerCase() !== 'none'
  }

  return false
} )

const workOrderProgress = computed( () => {
  const progress = props.workOrder?.work_order_progress
  if ( !progress ) return null

  const total = progress.total_task_amount || 0
  const completed = progress.completed_task_amount || 0
  const failed = progress.failed_task_amount || 0
  const percentage = total > 0 ? Math.round( ( completed / total ) * 100 ) : 0

  return {
    total,
    completed,
    failed,
    percentage,
    remaining : total - completed - failed
  }
} )

const hasFileAttachments = computed( () => {
  return props.workOrder?.file_list && props.workOrder.file_list.length > 0
} )

const validEquipmentList = computed( () => {
  if ( !equipmentDetails.value || !Array.isArray( equipmentDetails.value ) ) {
    return []
  }
  return equipmentDetails.value.filter( eq => eq && eq.id && eq.name )
} )

const hasValidEquipment = computed( () => {
  return validEquipmentList.value.length > 0
} )

// Process file list to match equipment details pattern
const processedFileList = computed( () => {
  if ( !props.workOrder?.file_list || !Array.isArray( props.workOrder.file_list ) ) {
    return []
  }

  return props.workOrder.file_list.map( ( url, index ) => {
    const urlParts = url.split( '/' )
    const filename = urlParts[urlParts.length - 1] || `file_${index + 1}`

    // Clean filename by removing timestamp prefixes
    const cleanFilename = filename.replace( /\d{17}/, '' )

    return {
      id : index,
      name : decodeURIComponent( cleanFilename ),
      url,
      type : getFileTypeFromName( cleanFilename )
    }
  } )
} )

// Equipment loading function
const loadEquipmentDetails = async() => {
  if ( !props.workOrder?.equipment_node_ids?.length ) {
    equipmentDetails.value = []
    return
  }

  try {
    loadingEquipment.value = true
    const equipmentPromises = props.workOrder.equipment_node_ids.map( id =>
      getEquipmentById( id ).catch( error => {
        console.warn( `Failed to load equipment ${id}:`, error )
        return null
      } )
    )

    const results = await Promise.all( equipmentPromises )
    equipmentDetails.value = results
      .filter( result => result?.data && result.data.id )
      .map( result => ( {
        ...result.data,
        // Ensure we have fallback values for required fields
        id : result.data.id,
        name : result.data.name || `Equipment ${result.data.id}`,
        manufacturer : result.data.manufacturer || null,
        location : result.data.location || null,
        person_in_charge : result.data.person_in_charge || null,
        image_list : result.data.image_list || [],
        type : result.data.type || result.data.equipment_type || 'Equipment'
      } ) )
  } catch ( error ) {
    console.error( 'Failed to load equipment details:', error )
    equipmentDetails.value = []
  } finally {
    loadingEquipment.value = false
  }
}

// Watchers
watch(
  () => props.workOrder,
  newWorkOrder => {
    if ( newWorkOrder ) {
      localStatus.value = newWorkOrder.state?.name || 'Ready'
      // Load equipment details when work order changes
      loadEquipmentDetails()
    }
  },
  { immediate : true }
)

// Methods
const formatDate = dateString => {
  return convertToLocalTime( dateString )
}

const handleStatusChange = newStatus => {
  emit( 'status-change', { workOrder : props.workOrder, status : newStatus } )
}

const handleHeaderAction = action => {
  switch ( action ) {
    case 'edit':
      emit( 'edit', props.workOrder )
      break
    case 'share':
      emit( 'share', props.workOrder )
      break
    case 'export':
      emit( 'export', props.workOrder )
      break
    case 'delete':
      handleDeleteWorkOrder()
      break
    default:
      console.warn( `Unhandled header action: ${action}` )
  }
}

// Delete methods
const handleDeleteWorkOrder = () => {
  if ( isRecurring.value ) {
    // For recurring work orders, show confirmation dialog with two options
    deleteDialogVisible.value = true
  } else {
    // For non-recurring work orders, show simple confirmation
    ElMessageBox.confirm(
      'This action will permanently delete this work order. This cannot be undone.',
      'Delete Work Order',
      {
        confirmButtonText : 'Delete',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--danger'
      }
    )
      .then( async() => {
        await performDeleteIndividual()
      } )
      .catch( () => {
        // User cancelled
      } )
  }
}

const performDeleteIndividual = async() => {
  try {
    deleting.value = true
    await deleteIndividualWorkOrder( props.workOrder.id )
    ElMessage.success( 'Work order deleted successfully' )
    emit( 'delete', { workOrder : props.workOrder, type : 'individual' } )
  } catch ( error ) {
    console.error( 'Failed to delete work order:', error )
    ElMessage.error( 'Failed to delete work order' )
  } finally {
    deleting.value = false
  }
}

const performDeleteRecurrence = async() => {
  try {
    deleting.value = true
    await deleteRecurrenceWorkOrders( props.workOrder.recurrence_uuid )
    ElMessage.success( 'All recurring work orders deleted successfully' )
    emit( 'delete', { workOrder : props.workOrder, type : 'recurrence' } )
    deleteDialogVisible.value = false
  } catch ( error ) {
    console.error( 'Failed to delete recurring work orders:', error )
    ElMessage.error( 'Failed to delete recurring work orders' )
  } finally {
    deleting.value = false
  }
}

const handleDeleteConfirmation = async type => {
  if ( type === 'individual' ) {
    await performDeleteIndividual()
    deleteDialogVisible.value = false
  } else if ( type === 'recurrence' ) {
    await performDeleteRecurrence()
  }
}

// Timeline modal methods
const openTimelineModal = () => {
  timelineModalVisible.value = true
}

const handleTimelineModalClose = () => {
  timelineModalVisible.value = false
}

const exportTimeline = () => {
  ElMessage.success( 'Timeline export will be implemented by Yellow Guy' )
  timelineModalVisible.value = false
}

const navigateToLinkedOrder = () => {
  ElMessage.info( 'Navigation to linked work order will be implemented by Yellow Guy' )
}

// File helper functions following equipment details pattern
const getFileIcon = fileType => {
  switch ( fileType?.toLowerCase() ) {
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return Picture
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return VideoCamera
    case 'audio':
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return Microphone
    case 'pdf':
    case 'document':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return Document
    case 'download':
    case 'zip':
    case 'rar':
    case '7z':
      return Download
    default:
      return Document
  }
}

const getFileTypeFromName = fileName => {
  if ( !fileName ) return 'document'

  const extension = fileName.split( '.' ).pop()?.toLowerCase()

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg']
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz']

  if ( imageTypes.includes( extension ) ) return 'image'
  if ( videoTypes.includes( extension ) ) return 'video'
  if ( audioTypes.includes( extension ) ) return 'audio'
  if ( archiveTypes.includes( extension ) ) return 'download'

  return 'document'
}

const viewRequest = request => {
  ElMessage.info( `Navigation to request ${request.name} will be implemented` )
}

const getRecurrenceTypeLabel = () => {
  if ( !props.workOrder?.recurrence_type ) {
    return 'Does not repeat'
  }

  // Handle different possible data structures
  const recurrenceType = props.workOrder.recurrence_type

  // Debug: log the recurrence type structure
  console.log( 'Recurrence Type Data:', recurrenceType )

  // If it's an object with name property
  if ( typeof recurrenceType === 'object' && recurrenceType.name ) {
    return recurrenceType.name
  }

  // If it's a string directly
  if ( typeof recurrenceType === 'string' ) {
    return recurrenceType
  }

  // If it has an id property, check if it's not "Does not repeat" (id: 1)
  if ( recurrenceType.id && recurrenceType.id !== 1 ) {
    return recurrenceType.label || recurrenceType.name || 'Recurring'
  }

  return 'Does not repeat'
}

const scrollToScheduleSection = () => {
  if ( scheduleSection.value ) {
    scheduleSection.value.scrollIntoView( { behavior : 'smooth', block : 'start' } )
  } else {
    // Fallback: try to find the schedule section by class
    const scheduleElement = document.querySelector( '.schedule-conditions-section .schedule-header' )
    if ( scheduleElement ) {
      scheduleElement.scrollIntoView( { behavior : 'smooth', block : 'start' } )
    } else {
      console.warn( 'Schedule section not found for scrolling' )
    }
  }
}

defineOptions( {
  name : 'WorkOrderDetail'
} )
</script>

<style scoped lang="scss">
.work-order-detail {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-top: 24px;
  padding: 0 24px 24px 24px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.detail-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;

  .header-main {
    .title-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 8px;

      .detail-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
        line-height: 1.4;
      }

      .work-order-id {
        color: var(--el-color-primary);
        font-weight: 500;
        font-size: 14px;
      }
    }

    .meta-info {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      flex-wrap: wrap;
    }

    .header-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      flex-wrap: wrap;

      .work-order-code {
        color: var(--el-color-success);
        font-weight: 500;
      }

      .linked-value {
        color: var(--el-color-primary);
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--el-color-primary-dark-2);
          text-decoration: underline;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    .action-button {
      padding: 4px;
      color: var(--el-text-color-secondary);

      &:hover {
        color: var(--el-color-primary);
      }

      .rotated-icon {
        transform: rotate(90deg);
      }
    }
  }
}

.detail-section {
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 36px 0px;
  }

  .section-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .field-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }

    .field-value {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  .general-details-descriptions {
    :deep(.el-descriptions__header) {
      margin-bottom: 0;
    }

    :deep(.el-descriptions__body) {
      background: transparent;
    }

    :deep(.el-descriptions__table) {
      border: none;
      border-collapse: separate;
      border-spacing: 0 16px;
      width: 100%;
      table-layout: fixed;
    }

    :deep(.el-descriptions__cell) {
      padding: 0 24px 12px 0;
      border: none;
      vertical-align: top;
      width: 25%;

      &:last-child {
        padding-right: 0;
      }
    }

    :deep(.el-descriptions__label) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
      margin-bottom: 4px;
      display: block;
    }

    :deep(.el-descriptions__content) {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  .work-order-details-descriptions {
    :deep(.el-descriptions__cell) {
      padding: 0 16px 16px 0;

      &:last-child {
        padding-right: 0;
      }
    }
  }

  // Dates section specific styling
  .dates-descriptions {
    :deep(.el-descriptions__table) {
      border: none;
      border-collapse: separate;
      border-spacing: 0 16px;
      width: 100%;
      table-layout: fixed;
      margin-top: -10px;
    }

    :deep(.el-descriptions__cell) {
      padding: 0 24px 0 0;
      border: none;
      vertical-align: top;
      width: 25%;

      &:last-child {
        padding-right: 0;
      }
    }

    :deep(.el-descriptions__label) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
      margin-bottom: 4px;
      display: block;
    }

    :deep(.el-descriptions__content) {
      font-size: 14px;
      color: var(--el-text-color-primary);
      line-height: 1.4;

      .recurrence-clickable {
        color: var(--el-color-primary) !important;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;

        &:hover {
          color: var(--el-color-primary-dark-2) !important;
          text-decoration: underline;
          transform: translateY(-1px);
        }
      }
    }
  }
}

.description-content {
  p {
    margin: 0;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  .detail-item {
    .detail-label {
      display: block;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .detail-value {
      font-size: 14px;
      color: var(--el-text-color-primary);

      &.overdue {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }
  }
}

// Attachments grid styles removed - replaced by el-row/el-col

.attachment-item {
  .attachment-image {
    width: 100%;
    height: 120px;
    border-radius: 6px;
    overflow: hidden;
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 120px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 24px;
  }
}

// Schedule Conditions Section
.schedule-conditions-section {
  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;

    .timeline-button {
      font-size: 13px;
      font-weight: 500;
      padding: 8px 12px;

      &:hover {
        background-color: var(--el-color-primary-light-8);
        border-color: var(--el-color-primary-light-3);
        color: var(--el-color-primary-dark-2);
      }

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

// Timeline Modal Styles
.timeline-modal {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    color: white;
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        font-size: 18px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

// Time & Cost Tracking Card
.time-cost-tracking-card {
  .tracking-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      font-weight: 500;
    }

    .tab-content {
      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .tab-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin: 0;
        }

        .add-edit-link {
          color: var(--el-color-primary);
          font-size: 13px;
          padding: 0;

          &:hover {
            color: var(--el-color-primary-dark-2);
          }
        }
      }
    }
  }
}

// Related Assets Section
.related-assets-section {
  .assets-container {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .asset-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 120px;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .asset-image {
        margin-bottom: 8px;

        .asset-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--el-color-primary-light-9);
          border: 2px solid var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--el-color-primary);
          font-size: 24px;
        }
      }

      .asset-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-align: center;
        line-height: 1.4;
      }
    }
  }
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

// Work Order Progress Styles
.progress-section {
  .progress-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;

      .stat-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);

        &.completed {
          color: var(--el-color-success);
        }

        &.failed {
          color: var(--el-color-danger);
        }
      }
    }
  }

  .progress-bar-container {
    .progress-text {
      text-align: center;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-top: 8px;
    }
  }
}

// Equipment Grid Styles
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 36px;

  .equipment-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    background: var(--el-bg-color);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .equipment-image,
    .equipment-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .equipment-icon {
      background: var(--el-color-primary-light-9);

      .el-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }
    }

    .equipment-thumbnail {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .equipment-info {
      flex: 1;
      margin-left: 12px;

      .equipment-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .equipment-type {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// Equipment Tooltip Styles
.equipment-tooltip {
  padding: 6px 12px;
  background: white !important;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 280px;

  div {
    margin-bottom: 8px;
    color: var(--el-text-color-primary);

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      margin-right: 8px;
      color: var(--el-text-color-regular);
      font-weight: 600;
    }
  }
}

// File Attachments Styles
.attachments-subsection {
  margin-bottom: 24px;
  margin-left: 4px;

  .subsection-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }
}

.file-list {
  .file-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--el-bg-color);

    .file-icon {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: var(--el-color-info-light-9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      .el-icon {
        font-size: 16px;
        color: var(--el-color-info);
      }
    }

    .file-info {
      flex: 1;

      .file-name {
        font-size: 14px;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .file-actions {
        .el-button {
          padding: 0;
          font-size: 12px;
        }
      }
    }
  }
}

// Standards and Tasks Lists
.standards-list,
.tasks-list {
  .standard-item,
  .task-item {
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--el-bg-color);
  }
}

.standards-list {
  .standard-item {
    .standard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .standard-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .standard-code {
        font-size: 12px;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        padding: 2px 8px;
        border-radius: 4px;
      }
    }

    .standard-description {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }
}

.tasks-list {
  .task-item {
    display: flex;
    align-items: center;

    .task-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--el-color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
      margin-right: 12px;
    }

    .task-info {
      flex: 1;

      .task-id {
        font-size: 14px;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .task-status {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// No Data Placeholder
.no-data-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: 200px;
}

.loading-container {
  padding: 20px;
}

.no-equipment {
  padding: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .work-order-detail {
    padding: 16px;
  }

  .detail-header {
    .header-actions {
      align-self: stretch;
    }
  }

  .section-row {
    flex-direction: column;
    gap: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

// Global tooltip styles for equipment tooltips
:deep(.equipment-tooltip-popper) {
  background: white !important;
  border: 1px solid var(--el-border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  padding: 0 !important;

  .el-tooltip__content {
    background: white !important;
    color: var(--el-text-color-primary) !important;
    border-radius: 8px !important;
    padding: 0 !important;
  }

  .el-popper__arrow::before {
    background: white !important;
    border: 1px solid var(--el-border-color) !important;
  }
}

// Delete Item Styles
:deep(.delete-item) {
  color: var(--el-color-danger) !important;

  &:hover {
    background-color: var(--el-color-danger-light-9) !important;
    color: var(--el-color-danger-dark-2) !important;
  }

  .el-icon {
    color: var(--el-color-danger) !important;
  }
}

// Delete Dialog Styles
.delete-dialog {
  :deep(.el-dialog__header) {
    background: var(--el-color-warning-light-9);
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: var(--el-color-warning-dark-2);
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: var(--el-color-warning-dark-2);

        &:hover {
          color: var(--el-color-warning);
        }
      }
    }
  }

  .delete-dialog-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;

    .warning-icon {
      font-size: 32px;
      color: var(--el-color-warning);
      margin-top: 4px;
    }

    .delete-message {
      flex: 1;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.5;
      }
    }
  }

  .delete-dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .el-button {
      padding: 12px 20px;
      font-weight: 500;

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

// Images and Files sections styling - matching equipment details pattern
.images-section,
.files-section {
  margin-bottom: 20px;

  :deep(.el-descriptions) {
    margin: 0;
  }

  :deep(.el-descriptions__cell) {
    padding: 8px 0;
    border: none;
    vertical-align: top;
  }

  :deep(.el-descriptions__label) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: 600;
    margin-bottom: 8px;
    display: block;
  }

  :deep(.el-descriptions__content) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }
}

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
  border-radius: 4px;
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f0f9ff;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  text-decoration: none;
  color: var(--el-color-info);

  &:hover {
    color: var(--el-color-primary-dark-2);
  }
}

:deep(.images-section .el-descriptions__label, .files-section .el-descriptions__label) {
  font-weight: 500;
}

:deep(.el-descriptions__label.el-descriptions__cell:not(.is-bordered-label).is-vertical-label) {
  font-weight: 500;
}
</style>

<template>
  <div class="work-order-edit-enhanced">
    <!-- Edit Header -->
    <div class="edit-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <h2 class="edit-title">{{ editHeaderTitle }}</h2>
            <div class="header-meta" v-if="workOrder">
              <div class="edit-info">
                <el-icon><Edit /></el-icon>
                <span>ID: #{{ workOrder.id }}</span>
              </div>
              <div class="edit-info">
                <el-icon><Calendar /></el-icon>
                <span>Created On: {{ formatDate(workOrder.created_at) }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="header-actions">
            <el-button type="default" @click="handleBackToDetail">
              <el-icon><ArrowLeft /></el-icon>
              {{ $t('workOrder.actions.backToDetail') }}
            </el-button>
            <el-button type="warning" @click="resetForm" plain>
              <el-icon><RefreshLeft /></el-icon>
              {{ $t('workOrder.actions.reset') }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Form Container -->
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="edit-form" v-loading="loading">
      <!-- Task Title -->
      <div class="form-section">
        <el-form-item prop="name">
          <el-input
            v-model="form.name"
            :placeholder="$t('workOrder.create.taskTitlePlaceholder')"
            size="large"
            class="task-title-input"
          />
        </el-form-item>
      </div>

      <!-- Description -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.form.description')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :placeholder="$t('workOrder.create.descriptionPlaceholder')"
            :rows="3"
            resize="vertical"
          />
        </el-form-item>
      </div>

      <!-- Asset Tree Select -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.asset')" prop="equipment_node_ids">
          <el-tree-select
            v-model="form.equipment_node_ids"
            :data="assetTreeData"
            :props="treeProps"
            :placeholder="$t('workOrder.create.assetPlaceholder')"
            check-strictly
            :render-after-expand="false"
            multiple
            filterable
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <!-- Assigned To -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.assignTo')" prop="assignee_ids">
          <el-select
            v-model="form.assignee_ids"
            :placeholder="$t('workOrder.create.assigneePlaceholder')"
            filterable
            multiple
            style="width: 100%"
          >
            <el-option v-for="user in assigneeOptions" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
      </div>

      <!-- Supervisor -->
      <div class="form-section">
        <el-form-item label="Supervisor" prop="approved_by_id">
          <el-select v-model="form.approved_by_id" placeholder="Select Supervisor" filterable style="width: 100%">
            <el-option
              v-for="supervisor in supervisorOptions"
              :key="supervisor.id"
              :label="supervisor.name"
              :value="supervisor.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Tasks -->
      <el-divider />
      <div class="form-section tasks-section">
        <el-form-item>
          <template #label>
            <div class="section-header">
              <span class="section-title">
                <el-icon class="section-icon tasks-icon"><List /></el-icon>
                Tasks
              </span>
              <div v-if="form.tasks.length > 0" class="task-actions">
                <el-button size="default" @click="handleAddTask" :icon="Plus"> Add Task </el-button>
                <el-button size="default" @click="handleDeleteAllTasks" :icon="Delete">
                  Clear All ({{ form.tasks.length }})
                </el-button>
              </div>
            </div>
          </template>
          <div class="tasks-container" :class="{ 'no-tasks': form.tasks.length === 0 }">
            <!-- Empty State -->
            <div v-if="form.tasks.length === 0" class="empty-tasks">
              <div class="empty-content">
                <el-icon class="empty-icon"><DocumentAdd /></el-icon>
                <h4>No Tasks Added</h4>
                <p>Add the task to start building the work order</p>
                <el-button type="primary" @click="handleAddTask">
                  <el-icon><Plus /></el-icon>
                  Add Task
                </el-button>
              </div>
            </div>

            <!-- Tasks List -->
            <div v-else class="tasks-list">
              <MaintenanceSelectedTaskCard
                v-for="task in form.tasks"
                :key="task.id"
                :template="task"
                @selection="handleTaskAction"
                class="task-card"
              />
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- Standards -->
      <el-divider />
      <div class="form-section standards-section">
        <el-form-item>
          <template #label>
            <div class="section-header">
              <span class="section-title">
                <el-icon class="section-icon standards-icon"><DocumentChecked /></el-icon>
                Standards
              </span>
              <div v-if="form.standards.length > 0" class="standards-actions">
                <el-button size="default" @click="handleAddStandard" :icon="Plus"> Add Standard </el-button>
                <el-button size="default" @click="handleDeleteAllStandards" :icon="Delete">
                  Clear All ({{ form.standards.length }})
                </el-button>
              </div>
            </div>
          </template>
          <div class="standards-container" :class="{ 'no-standards': form.standards.length === 0 }">
            <!-- Empty State -->
            <div v-if="form.standards.length === 0" class="empty-standards">
              <div class="empty-content">
                <el-icon class="empty-icon"><Document /></el-icon>
                <h4>No Standards Added</h4>
                <p>Add the standard to ensure work order compliance</p>
                <el-button type="primary" @click="handleAddStandard">
                  <el-icon><Plus /></el-icon>
                  Add Standard
                </el-button>
              </div>
            </div>

            <!-- Standards List -->
            <div v-else class="standards-list">
              <MaintenanceSelectedStandardsCard
                v-for="standard in form.standards"
                :key="standard.id"
                :template="standard"
                @selection="handleStandardAction"
                class="standard-card"
              />
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- Due Date -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.dueDate')" prop="due_date">
          <el-date-picker
            v-model="form.due_date"
            type="datetime"
            :placeholder="$t('workOrder.create.dueDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledDueDates"
          />
          <div v-if="showWorkOrderDuration" class="work-order-duration">
            <el-text type="info" size="small"> Work order duration: {{ formatWorkOrderDuration() }} </el-text>
          </div>
        </el-form-item>
      </div>

      <!-- Start Date -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.startDate')" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="datetime"
            :placeholder="$t('workOrder.create.startDatePlaceholder')"
            style="width: 100%"
            format="MM/DD/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledStartDates"
          />
        </el-form-item>
      </div>

      <!-- End Date -->
      <div class="form-section">
        <el-form-item label="End Date" prop="end_date">
          <el-date-picker
            v-model="form.end_date"
            type="datetime"
            placeholder="Select end date"
            style="width: 100%"
            format="MM/DD/YYYY HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :disabled-date="disabledDueDates"
          />
        </el-form-item>
      </div>

      <!-- Work Type, Priority, and State -->
      <div class="form-section">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item :label="$t('workOrder.create.workType')" prop="work_type_id">
              <el-select
                v-model="form.work_type_id"
                :placeholder="$t('workOrder.create.workTypePlaceholder')"
                style="width: 100%"
              >
                <el-option v-for="type in workTypeOptions" :key="type.id" :label="type.name" :value="type.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('workOrder.create.priority')" prop="priority_id">
              <el-select
                v-model="form.priority_id"
                :placeholder="$t('workOrder.create.priorityPlaceholder')"
                style="width: 100%"
              >
                <el-option
                  v-for="priority in priorityOptions"
                  :key="priority.id"
                  :label="priority.name"
                  :value="priority.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="State" prop="state_id">
              <el-select v-model="form.state_id" placeholder="Select state..." style="width: 100%">
                <el-option v-for="state in stateOptions" :key="state.id" :label="state.name" :value="state.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Recurrence Settings -->
      <div class="form-section">
        <RecurrenceEditor
          v-model:recurrence-setting="form.recurrence_setting"
          :work-order-start-date="form.start_date"
          :work-order-due-date="form.due_date"
        />
      </div>

      <!-- Categories -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.categories')" prop="category_ids">
          <el-select
            v-model="form.category_ids"
            :placeholder="$t('workOrder.create.categoriesPlaceholder')"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Image and File Upload Section -->
      <div class="form-section">
        <el-divider />
        <div class="upload-section">
          <FileUploadMultiple
            @update:imageList="handleImageListUpdate"
            @update:filesList="handleFilesListUpdate"
            :image-label="$t('workOrder.create.imageUpload')"
            :file-label="$t('workOrder.create.fileUpload')"
            upload-type="both"
            :max-images="5"
            :max-files="10"
            :existing-images="existingImages"
            :existing-files="existingFiles"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="form-actions">
        <div class="left-actions">
          <el-button
            @click="logCurrentPayload"
            size="default"
            plain
            :loading="isLoggingInProgress"
            :disabled="isLoggingInProgress"
          >
            {{ isLoggingInProgress ? 'Loading...' : 'Logs' }}
          </el-button>
          <el-button type="primary" @click="submitForm" :loading="loading" class="update-button">
            {{ $t('workOrder.actions.update') }}
          </el-button>
        </div>
      </div>
    </el-form>

    <!-- Add Task Dialog -->
    <el-dialog
      v-model="showAddTaskDialog"
      title="Add New Task"
      width="700px"
      :before-close="handleCloseAddTaskDialog"
      top="5vh"
    >
      <AddTask
        v-if="showAddTaskDialog"
        origin-panel="edit"
        :origin-work-order-id="workOrder?.id"
        @close="closeAddTaskDialog"
        @add-templates="onAddTaskTemplates"
      />
    </el-dialog>

    <!-- Add Standard Dialog -->
    <el-dialog
      v-model="showAddStandardDialog"
      title="Add New Standard"
      width="700px"
      top="5vh"
      :before-close="handleCloseAddStandardDialog"
    >
      <AddStandard v-if="showAddStandardDialog" @close="closeAddStandardDialog" @add-standards="onAddStandards" />
    </el-dialog>

    <!-- Edit Standard Dialog -->
    <EditStandardDialog
      v-if="editingStandard"
      :visible="showEditStandardDialog"
      :standard="editingStandard"
      @update:visible="showEditStandardDialog = false"
      @update:standard="onStandardUpdate"
    />

    <!-- Task Preview Dialog -->
    <el-dialog
      v-model="showTaskPreviewDialog"
      width="700px"
      top="5vh"
      :before-close="handleCloseTaskPreview"
      class="preview-dialog"
    >
      <template #header="{ titleId }">
        <div class="preview-dialog-header">
          <el-button type="text" @click="handleBackToTaskList" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span :id="titleId" class="dialog-title"> Preview: {{ getPreviewTaskTitle() }} </span>
          <el-tooltip content="Interactive Mode" placement="top">
            <el-switch v-model="isTaskInteractive" />
          </el-tooltip>
        </div>
      </template>

      <StepsPreview
        v-if="previewTaskTemplateId"
        :template-id="previewTaskTemplateId"
        :interactive="isTaskInteractive"
        :show-mode-switch="false"
      />
      <StepsPreview
        v-else-if="previewTaskData && previewTaskData.steps"
        :steps="previewTaskData.steps"
        :interactive="isTaskInteractive"
        :show-mode-switch="false"
      />
    </el-dialog>

    <!-- Standard Preview Dialog -->
    <el-dialog
      v-model="showStandardPreviewDialog"
      :title="`Preview: ${previewStandardData?.name || 'Standard'}`"
      width="700px"
      top="5vh"
      class="preview-dialog"
    >
      <StandardsPreview
        v-if="showStandardPreviewDialog && previewStandardData && !previewStandardData.isStandalone"
        :standard-id="previewStandardData.standardId || previewStandardData.id"
      />
      <!-- Standalone Standard Preview -->
      <div
        v-else-if="showStandardPreviewDialog && previewStandardData && previewStandardData.isStandalone"
        class="standalone-standard-preview"
      >
        <div class="standard-details">
          <!-- Fixed Header Section -->
          <div class="fixed-header-section">
            <div class="standard-tabs-header">
              <el-tabs v-model="standalonePreviewTab" class="details-tabs">
                <el-tab-pane label="General" name="general"></el-tab-pane>
                <el-tab-pane label="Standard Rules" name="rules"></el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <!-- Scrollable Content Area -->
          <div class="scrollable-content">
            <div class="tab-content-wrapper">
              <!-- General Tab Content -->
              <div v-if="standalonePreviewTab === 'general'" class="tab-pane-content">
                <div class="overview-card">
                  <div class="card-content">
                    <el-descriptions :column="2" direction="vertical">
                      <el-descriptions-item width="50%" label="Category">
                        {{ previewStandardData.category || 'Uncategorized' }}
                      </el-descriptions-item>
                      <el-descriptions-item width="50%" label="Total Rules">
                        <span class="info-value highlight">{{ previewStandardData.items?.length || 0 }} rules</span>
                      </el-descriptions-item>
                      <el-descriptions-item width="50%" label="Type">
                        <el-tag type="primary" size="small">Work Order Only</el-tag>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </div>

                <div class="description-card" v-if="previewStandardData.description">
                  <div class="card-header">
                    <h3 class="card-title">Description</h3>
                  </div>
                  <div class="card-content">
                    <div class="description-text">
                      {{ previewStandardData.description }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Standard Rules Tab Content -->
              <div v-if="standalonePreviewTab === 'rules'" class="tab-pane-content">
                <div v-if="previewStandardData.items && previewStandardData.items.length > 0" class="rules-list">
                  <div class="card-header">
                    <h3 class="card-title">Standard Rules</h3>
                    <el-tag type="warning" size="small">Read Only</el-tag>
                  </div>
                  <div class="rules-container">
                    <div v-for="(rule, index) in previewStandardData.items" :key="index" class="rule-item">
                      <div class="rule-number">{{ index + 1 }}</div>
                      <div class="rule-content">
                        <div class="rule-text">{{ rule }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-rules">
                  <el-empty description="No rules defined for this standard" :image-size="80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- JSON Debug Drawer -->
    <JsonDebugDrawer
      v-model="showJsonDisplayer"
      :payload-data="currentPayload"
      title="Work Order Edit Payload"
      subtitle="Click 'Debug' to refresh"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  RefreshLeft,
  Plus,
  Delete,
  DocumentAdd,
  Document,
  List,
  DocumentChecked,
  Edit,
  Calendar
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import RecurrenceEditor from '@/views/workOrder/components/RecurrenceEditor.vue'
import MaintenanceSelectedTaskCard from '../../Tables/Cards/MaintenanceSelectedTaskCard.vue'
import MaintenanceSelectedStandardsCard from '../../Tables/Cards/MaintenanceSelectedStandardsCard.vue'
import AddTask from '../../Task/AddTask.vue'
import AddStandard from '../../Standard/AddStandard.vue'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { JsonDebugDrawer, usePayloadLogger, clonePayload, transformPayload } from '@/utils/logs'
import EditStandardDialog from '@/components/TaskLibrary/EditStandardDialog.vue'
import StepsPreview from '@/components/TaskLibrary/StepsPreview.vue'
import StandardsPreview from '@/components/TaskLibrary/StandardsPreview.vue'
import { uploadMultipleToMinio } from '@/api/minio.js'
import {
  getAllWorkTypes,
  getAllPriorities,
  getAllCategories,
  getAllStates,
  getEquipmentNodeTrees,
  updateWorkOrder,
  updateRecurrenceWorkOrders
} from '@/api/work-order'
import { useRouter, useRoute } from 'vue-router'
import { useTaskLibraryStore } from '@/store/modules/taskLibrary'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'
import { createEmptyWorkOrderForm, cloneWorkOrderForm } from './workOrderFormDefaults'
import { DEFAULT_TASK_STATE, buildDisplayTaskFromTemplate } from './taskPayloadHelpers'

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

// Emits
const emit = defineEmits( ['back-to-detail', 'work-order-updated'] )

// Dialog state
const showAddTaskDialog = ref( false )
const showAddStandardDialog = ref( false )
const showEditStandardDialog = ref( false )
const editingStandard = ref( null )

// Preview dialog state
const showTaskPreviewDialog = ref( false )
const showStandardPreviewDialog = ref( false )
const previewTaskTemplateId = ref( null )
const previewTaskData = ref( null )
const previewStandardData = ref( null )
const isTaskInteractive = ref( false )
const standalonePreviewTab = ref( 'general' )

// Stores and utilities
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const taskLibraryStore = useTaskLibraryStore()
const workOrderDraftStore = useWorkOrderDraftStore()
const { currentPayload, showJsonDisplayer, logPayload, closeDebugDrawer } = usePayloadLogger()

// Form refs and loading
const formRef = ref( null )
const loading = ref( false )
const isLoggingInProgress = ref( false )
let logButtonTimeout = null

// Form data - matching API requirements and using same structure as create
const form = reactive( createEmptyWorkOrderForm() )
let isHydratingForm = false

const editHeaderTitle = computed( () => {
  const base = t( 'workOrder.editWorkOrder' )
  const name = form.name || props.workOrder?.name
  return name ? `${base} - ${name}` : base
} )

const createFallbackStep = () => ( {
  name : 'Checklist',
  description : 'Auto-generated step',
  type : 'template',
  required : false,
  remarks : '',
  value : {
    type : 'checkbox',
    value : false,
    require_image : false,
    image : []
  },
  tools : []
} )

const cloneArray = value => ( Array.isArray( value ) ? clonePayload( value ) : [] )

const formatDateTimeForPicker = value => {
  if ( !value ) return null
  const date = new Date( value )
  if ( Number.isNaN( date.getTime() ) ) {
    return null
  }

  const pad = num => String( num ).padStart( 2, '0' )
  const year = date.getFullYear()
  const month = pad( date.getMonth() + 1 )
  const day = pad( date.getDate() )
  const hours = pad( date.getHours() )
  const minutes = pad( date.getMinutes() )
  const seconds = pad( date.getSeconds() )

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const pickRandomOptionId = options => {
  if ( !Array.isArray( options ) || options.length === 0 ) return null
  const randomOption = options[Math.floor( Math.random() * options.length )]
  return randomOption?.id ?? randomOption?.value ?? null
}

const buildExistingTaskId = ( task, index ) => {
  const candidates = [
    task.id,
    task.local_id,
    task.task_id,
    task.taskId,
    task.reference_id,
    task.template_task_id,
    task.template_id,
    task.templateId
  ]

  const rawId = candidates.find( candidate => {
    if ( candidate === undefined || candidate === null ) return false
    const str = String( candidate ).trim()
    return str.length > 0
  } )

  if ( !rawId ) {
    return `existing-task-${index}`
  }

  const base = String( rawId ).trim()
  return base.length > 0 ? base : `existing-task-${index}`
}

const decorateTaskCategory = task => {
  if ( !task || typeof task !== 'object' ) {
    return false
  }

  let changed = false

  if ( task.category && typeof task.category === 'object' ) {
    const fallbackName = task.category.name ?? task.category.label ?? task.category_name ?? ''
    if ( task.category_name !== fallbackName ) {
      task.category_name = fallbackName
      changed = true
    }
  } else if ( typeof task.category === 'string' ) {
    if ( task.category_name !== task.category ) {
      task.category_name = task.category
      changed = true
    }
  }

  if ( task.category && !task.category_name ) {
    const inferred = task.category.name ?? task.category.label ?? ''
    if ( task.category_name !== inferred ) {
      task.category_name = inferred
      changed = true
    }
  }

  return changed
}

const decorateTasksCategories = tasks => {
  if ( !Array.isArray( tasks ) ) return false
  let mutated = false
  tasks.forEach( task => {
    mutated = decorateTaskCategory( task ) || mutated
  } )
  return mutated
}

const buildPayloadFromExistingTask = ( task, workOrderId ) => {
  if ( task && typeof task === 'object' && task.payload && typeof task.payload === 'object' ) {
    const payload = clonePayload( task.payload )

    payload.work_order_id = payload.work_order_id ?? task.work_order_id ?? workOrderId ?? 0
    payload.state = payload.state ?? task.state ?? DEFAULT_TASK_STATE

    if ( !Array.isArray( payload.steps ) || payload.steps.length === 0 ) {
      payload.steps = [createFallbackStep()]
    }

    if ( !payload.time_estimate_sec || payload.time_estimate_sec <= 0 ) {
      const minutes = task.estimated_minutes ?? task.estimatedMinutes ?? 0
      payload.time_estimate_sec = task.time_estimate_sec ?? task.timeEstimateSec ?? minutes * 60
    }

    if ( payload.template_id == null ) {
      payload.template_id = task.template_id ?? task.templateId ?? null
    }

    if ( payload.category_id == null ) {
      payload.category_id = task.category_id ?? task.category?.id ?? null
    }

    if ( payload.category_name == null ) {
      payload.category_name = task.category?.name ?? task.category_name ?? ''
    }

    payload.attachments = cloneArray( payload.attachments || task.attachments || task.file_list )

    return payload
  }

  const steps = Array.isArray( task?.steps ) ? cloneArray( task.steps ) : []
  if ( steps.length === 0 ) {
    steps.push( createFallbackStep() )
  }

  const minutesEstimate = task?.estimated_minutes || task?.estimatedMinutes || 0
  const timeEstimate = task?.time_estimate_sec || task?.timeEstimateSec || minutesEstimate * 60

  return {
    name : task?.name || task?.task_name || task?.task_list_text || `Task`,
    description : task?.description || '',
    time_estimate_sec : timeEstimate,
    steps,
    attachments : cloneArray( task?.attachments || task?.file_list ),
    assignee_ids : cloneArray( task?.assignee_ids ),
    equipment_node_id : task?.equipment_node_id || task?.equipment_node?.id || null,
    location_id : task?.location_id ?? null,
    category_id : task?.category_id ?? task?.category?.id ?? null,
    category_name : task?.category?.name ?? task?.category_name ?? '',
    work_order_id : task?.work_order_id ?? workOrderId ?? 0,
    state : task?.state ?? DEFAULT_TASK_STATE,
    template_id : task?.template_id ?? task?.templateId ?? null
  }
}

const normalizeExistingTasks = ( taskList, workOrderId ) => {
  if ( !Array.isArray( taskList ) ) return []

  return taskList.map( ( rawTask, index ) => {
    if ( rawTask && typeof rawTask === 'object' ) {
      const taskClone = clonePayload( rawTask )
      const payload = buildPayloadFromExistingTask( taskClone, workOrderId )

      const category = taskClone.category
        ? clonePayload( taskClone.category )
        : payload.category_name
          ? {
              id : payload.category_id ?? null,
              name : payload.category_name
            }
          : null

      const estimatedMinutes = (taskClone.estimated_minutes ?? taskClone.estimatedMinutes ?? Math.round((payload.time_estimate_sec || 0) / 60)) || 0

      const displayTask = {
        id : buildExistingTaskId( taskClone, index ),
        name : payload.name || `Task ${index + 1}`,
        description : payload.description || '',
        category,
        category_name : category?.name || taskClone.category_name || payload.category_name || '',
        estimated_minutes : estimatedMinutes,
        templateId : payload.template_id,
        template_id : payload.template_id,
        steps : Array.isArray( payload.steps ) ? payload.steps : [],
        source : taskClone.source || ( payload.template_id ? 'template' : 'adhoc' ),
        payload,
        rawTemplate : taskClone.rawTemplate || taskClone.template || null,
        total_steps : taskClone.total_steps ?? payload.steps?.length ?? 0,
        applicable_assets : Array.isArray( taskClone.applicable_assets )
          ? cloneArray( taskClone.applicable_assets )
          : taskClone.applicable_assets
            ? [String( taskClone.applicable_assets )]
            : []
      }

      decorateTaskCategory( displayTask )
      return displayTask
    }

    const fallbackName = typeof rawTask === 'string' ? rawTask : `Task ${index + 1}`
    const payload = buildPayloadFromExistingTask( { name : fallbackName }, workOrderId )

    return {
      id : `existing-task-${index}`,
      name : fallbackName,
      description : '',
      category : null,
      category_name : '',
      estimated_minutes : Math.round( ( payload.time_estimate_sec || 0 ) / 60 ) || 0,
      templateId : null,
      template_id : null,
      steps : payload.steps,
      source : 'adhoc',
      payload,
      rawTemplate : null,
      total_steps : payload.steps.length,
      applicable_assets : []
    }
  } )
}

// Existing file tracking for edit mode
const existingImages = ref( [] )
const existingFiles = ref( [] )

// Options data
const assigneeOptions = ref( [] )
const supervisorOptions = ref( [] )
const workTypeOptions = ref( [] )
const priorityOptions = ref( [] )
const categoryOptions = ref( [] )
const stateOptions = ref( [] )
const assetTreeData = ref( [] )

// Tree configuration
const treeProps = {
  children : 'children',
  label : 'name',
  value : 'id'
}

// Template update listener
const handleTemplateUpdate = ( updatedTemplate ) => {
  const taskIndex = form.tasks.findIndex( task => task.id === updatedTemplate.id )
  if ( taskIndex !== -1 ) {
    const originalPayload = form.tasks[taskIndex].payload
    const updatedTask = buildDisplayTaskFromTemplate( updatedTemplate )
    updatedTask.payload = { ...originalPayload, ...updatedTask.payload }
    form.tasks.splice( taskIndex, 1, updatedTask )
    nextTick( () => {
      syncTaskPayloads()
    } )
  }
}

// Setup template update listener
onMounted( () => {
  taskLibraryStore.addTemplateUpdateListener( handleTemplateUpdate )
} )

onBeforeUnmount( () => {
  taskLibraryStore.removeTemplateUpdateListener( handleTemplateUpdate )
} )

// Form synchronization functions (copied from WorkOrderCreate)
const syncTaskPayloads = () => {
  form.task_list = form.tasks
    .map( task => clonePayload( task.payload ) )
    .filter( payload => payload && Array.isArray( payload.steps ) && payload.steps.length > 0 )
}

const syncStandards = () => {
  form.standard_list = form.standards.map( standard => ( {
    id : standard.id,
    name : standard.name,
    category : standard.category,
    description : standard.description || '',
    items : Array.isArray( standard.items ) ? [...standard.items] : []
  } ) )
}

// Sync form data when tasks or standards change
const syncFormData = () => {
  if ( isHydratingForm ) return
  syncTaskPayloads()
  syncStandards()
  nextTick( () => {
    isHydratingForm = false
    workOrderDraftStore.saveDraft( form )
  } )
}

watch(
  () => form.tasks,
  () => {
    if ( !isHydratingForm ) {
      decorateTasksCategories( form.tasks )
      syncFormData()
    }
  },
  { deep : true }
)

watch(
  () => form.standards,
  () => {
    if ( !isHydratingForm ) {
      syncFormData()
    }
  },
  { deep : true }
)

// Deep watch for form changes to save draft
watch(
  form,
  () => {
    if ( isHydratingForm ) return
    workOrderDraftStore.saveDraft( form )
  },
  { deep : true }
)

// Date validation functions (copied from WorkOrderCreate)
const disabledDueDates = ( time ) => {
  if ( !form.start_date ) return false
  return time.getTime() < new Date( form.start_date ).getTime()
}

const disabledStartDates = ( time ) => {
  const now = new Date()
  now.setHours( 0, 0, 0, 0 )
  return time.getTime() < now.getTime()
}

// Work order duration calculations
const showWorkOrderDuration = computed( () => {
  return form.start_date && form.due_date
} )

const formatWorkOrderDuration = () => {
  if ( !form.start_date || !form.due_date ) return ''
  const start = new Date( form.start_date )
  const due = new Date( form.due_date )
  const diffMs = due.getTime() - start.getTime()
  const diffDays = Math.ceil( diffMs / ( 1000 * 60 * 60 * 24 ) )

  if ( diffDays === 1 ) {
    return '1 day'
  } else if ( diffDays > 1 ) {
    return `${diffDays} days`
  } else {
    return 'Less than 1 day'
  }
}

// Date formatting utility
const formatDate = ( dateString ) => {
  if ( !dateString ) return 'N/A'
  try {
    return new Date( dateString ).toLocaleDateString()
  } catch ( error ) {
    return 'Invalid Date'
  }
}

// UTC date conversion utility (copied from WorkOrderCreate)
const toUtcIso = ( dateValue ) => {
  if ( !dateValue ) return null
  try {
    const date = new Date( dateValue )
    return date.toISOString()
  } catch ( error ) {
    console.warn( 'Invalid date for UTC conversion:', dateValue )
    return null
  }
}

// Form validation rules (copied and adapted from WorkOrderCreate)
const rules = {
  name : [
    { required : true, message : 'Work order name is required', trigger : 'blur' },
    { min : 3, max : 200, message : 'Name must be between 3 and 200 characters', trigger : 'blur' }
  ],
  equipment_node_ids : [
    { required : true, message : 'Please select at least one asset', trigger : 'change' }
  ],
  assignee_ids : [
    { required : true, message : 'Please assign at least one person', trigger : 'change' }
  ],
  due_date : [
    { required : true, message : 'Due date is required', trigger : 'change' }
  ],
  start_date : [
    { required : true, message : 'Start date is required', trigger : 'change' }
  ],
  end_date : [
    { required : false, validator : ( _, value, callback ) => {
      if ( value && form.start_date && new Date( value ) < new Date( form.start_date ) ) {
        callback( new Error( 'End date must be after start date' ) )
      } else {
        callback()
      }
    }, trigger : 'change' }
  ]
}

// Task management methods (copied from WorkOrderCreate)
const handleAddTask = () => {
  showAddTaskDialog.value = true
}

const closeAddTaskDialog = () => {
  showAddTaskDialog.value = false
}

const handleCloseAddTaskDialog = () => {
  closeAddTaskDialog()
}

const onAddTaskTemplates = ( selectedTemplates ) => {
  if ( !Array.isArray( selectedTemplates ) ) return

  isHydratingForm = true
  selectedTemplates.forEach( template => {
    const displayTask = buildDisplayTaskFromTemplate( template )
    form.tasks.push( displayTask )
  } )

  syncFormData()
  closeAddTaskDialog()
}

const handleTaskAction = ( { action, data } ) => {
  switch ( action ) {
    case 'preview':
      handlePreviewTask( data )
      break
    case 'edit':
      handleEditTask( data )
      break
    case 'delete':
      if ( handleRemoveTask( data ) ) {
        ElMessage.success( `Task "${data?.name || 'Task'}" removed` )
      }
      break
    default:
      console.warn( 'Unknown task action:', action )
  }
}

const handleRemoveTask = task => {
  const index = form.tasks.findIndex( t => t.id === task.id )
  if ( index !== -1 ) {
    form.tasks.splice( index, 1 )
    syncFormData()
    return true
  }
  return false
}

const handlePreviewTask = taskData => {
  if ( !taskData ) {
    ElMessage.warning( 'Unable to preview this task.' )
    return
  }

  const templateId =
    taskData.templateId ||
    taskData.template_id ||
    taskData.payload?.template_id ||
    taskData.rawTemplate?.template_id ||
    taskData.rawTemplate?.id ||
    null

  const isAdhocTask = taskData.source === 'adhoc' || !templateId

  if ( isAdhocTask ) {
    const steps = Array.isArray( taskData.steps ) && taskData.steps.length > 0
      ? taskData.steps
      : Array.isArray( taskData.payload?.steps )
        ? taskData.payload.steps
        : []

    previewTaskData.value = {
      ...taskData,
      steps
    }
    previewTaskTemplateId.value = null
    showTaskPreviewDialog.value = true
    return
  }

  previewTaskTemplateId.value = templateId
  previewTaskData.value = null
  showTaskPreviewDialog.value = true
}

const handleEditTask = async taskData => {
  if ( !taskData ) {
    ElMessage.warning( 'Unable to edit this task.' )
    return
  }

  try {
    loading.value = true

    const originalTemplateId =
      taskData.templateId ||
      taskData.template_id ||
      taskData.payload?.template_id ||
      taskData.rawTemplate?.template_id ||
      taskData.rawTemplate?.id ||
      null

    const isStandaloneTask = taskData.source === 'adhoc' || !originalTemplateId

    if ( !originalTemplateId && !isStandaloneTask ) {
      ElMessage.warning( 'This task does not have an associated template to edit.' )
      return
    }

    const workOrderLabel = form.name || props.workOrder?.name || 'Work Order'
    const workOrderId = props.workOrder?.id ?? workOrderLabel

    workOrderDraftStore.setReturnRoute( route.fullPath )
    workOrderDraftStore.setReturnPanel( 'edit' )
    workOrderDraftStore.setReturnWorkOrderId( props.workOrder?.id ?? null )
    workOrderDraftStore.setShouldOpenCreatePanel( false )

    const baseQuery = {
      fromWorkOrder : 'true',
      workOrderId : String( workOrderId ),
      workOrderName : workOrderLabel,
      taskId : taskData.id,
      returnPanel : 'edit'
    }

    if ( props.workOrder?.id ) {
      baseQuery.returnWorkOrderId = String( props.workOrder.id )
    }

    if ( isStandaloneTask ) {
      await router.push( {
        name : 'TaskDesignerEdit',
        params : { id : 'standalone' },
        query : {
          ...baseQuery,
          standalone : 'true',
          taskData : JSON.stringify( taskData )
        }
      } )
    } else {
      await router.push( {
        name : 'TaskDesignerEdit',
        params : { id : originalTemplateId },
        query : {
          ...baseQuery,
          originalTemplateId
        }
      } )
    }
  } catch ( error ) {
    console.error( 'Failed to open task editor:', error )
    const errorMessage = error.response?.data?.message || error.message || 'Failed to open task editor'
    ElMessage.error( errorMessage )
  } finally {
    loading.value = false
  }
}

const handleDeleteAllTasks = () => {
  ElMessageBox.confirm(
    'Are you sure you want to remove all tasks?',
    'Confirm Remove All Tasks',
    {
      confirmButtonText : 'Remove All',
      cancelButtonText : 'Cancel',
      type : 'warning'
    }
  ).then( () => {
    form.tasks.splice( 0 )
    syncFormData()
    ElMessage.success( 'All tasks removed successfully' )
  } ).catch( () => {
    // User cancelled
  } )
}

// Task preview dialog methods
const handleCloseTaskPreview = () => {
  showTaskPreviewDialog.value = false
  previewTaskTemplateId.value = null
  previewTaskData.value = null
}

const handleBackToTaskList = () => {
  handleCloseTaskPreview()
}

const getPreviewTaskTitle = () => {
  if ( previewTaskData.value ) {
    return previewTaskData.value.name || 'Unnamed Task'
  }

  if ( previewTaskTemplateId.value ) {
    const templateId = previewTaskTemplateId.value
    const task = form.tasks.find( t =>
      t.templateId === templateId ||
      t.template_id === templateId ||
      t.payload?.template_id === templateId ||
      t.id === templateId
    )

    return task?.name || 'Task Preview'
  }

  return 'Task Preview'
}

// Standards management methods (copied from WorkOrderCreate)
const handleAddStandard = () => {
  showAddStandardDialog.value = true
}

const closeAddStandardDialog = () => {
  showAddStandardDialog.value = false
}

const handleCloseAddStandardDialog = () => {
  closeAddStandardDialog()
}

const onAddStandards = ( selectedStandards ) => {
  if ( !Array.isArray( selectedStandards ) ) return

  isHydratingForm = true
  selectedStandards.forEach( standard => {
    form.standards.push( standard )
  } )

  syncFormData()
  closeAddStandardDialog()
}

const handleStandardAction = ( { action, data } ) => {
  switch ( action ) {
    case 'preview':
      handlePreviewStandard( data )
      break
    case 'edit':
      handleEditStandard( data )
      break
    case 'delete':
      if ( handleRemoveStandard( data ) ) {
        ElMessage.success( `Standard "${data?.name || 'Standard'}" removed` )
      }
      break
    default:
      console.warn( 'Unknown standard action:', action )
  }
}

const handleRemoveStandard = standard => {
  const index = form.standards.findIndex( s => s.id === standard.id )
  if ( index !== -1 ) {
    form.standards.splice( index, 1 )
    syncFormData()
    return true
  }
  return false
}

const handlePreviewStandard = ( standard ) => {
  previewStandardData.value = standard
  showStandardPreviewDialog.value = true
}

const handleEditStandard = ( standard ) => {
  editingStandard.value = standard
  showEditStandardDialog.value = true
}

const onStandardUpdate = ( updatedStandard ) => {
  const index = form.standards.findIndex( s => s.id === updatedStandard.id )
  if ( index !== -1 ) {
    form.standards.splice( index, 1, updatedStandard )
    syncFormData()
  }
  showEditStandardDialog.value = false
  editingStandard.value = null
}

const handleDeleteAllStandards = () => {
  ElMessageBox.confirm(
    'Are you sure you want to remove all standards?',
    'Confirm Remove All Standards',
    {
      confirmButtonText : 'Remove All',
      cancelButtonText : 'Cancel',
      type : 'warning'
    }
  ).then( () => {
    form.standards.splice( 0 )
    syncFormData()
    ElMessage.success( 'All standards removed successfully' )
  } ).catch( () => {
    // User cancelled
  } )
}

// File handling methods
const handleImageListUpdate = ( imageList ) => {
  form.image_list = imageList
}

const handleFilesListUpdate = ( filesList ) => {
  form.file_list = filesList
}

const uploadFilesToServer = async() => {
  try {
    const allFiles = [...form.image_list, ...form.file_list]
    if ( allFiles.length === 0 ) return

    const uploadResults = await uploadMultipleToMinio( allFiles )

    // Update form with uploaded file URLs
    form.image_list = uploadResults.images || []
    form.file_list = uploadResults.files || []
  } catch ( error ) {
    console.error( 'File upload failed:', error )
    throw new Error( 'File upload failed. Please try again.' )
  }
}

// Navigation and form reset methods
const handleBackToDetail = () => {
  // Check for unsaved changes
  const hasChanges = checkForUnsavedChanges()

  if ( !hasChanges ) {
    emit( 'back-to-detail' )
    return
  }

  ElMessageBox.confirm(
    'Are you sure you want to leave the form? All unsaved changes will be lost.',
    'Confirm Leave',
    {
      confirmButtonText : 'Leave',
      cancelButtonText : 'Cancel',
      type : 'warning'
    }
  ).then( () => {
    emit( 'back-to-detail' )
  } ).catch( () => {
    // User cancelled
  } )
}

const resetForm = () => {
  ElMessageBox.confirm(
    'Are you sure you want to reset the form? All unsaved changes will be lost.',
    'Confirm Reset',
    {
      confirmButtonText : 'Reset',
      cancelButtonText : 'Cancel',
      type : 'warning'
    }
  ).then( () => {
    resetFormSilent()
  } ).catch( () => {
    // User cancelled
  } )
}

const resetFormSilent = () => {
  // Populate form with original work order data
  populateFormFromWorkOrder( props.workOrder )
}

// Check for unsaved changes
const checkForUnsavedChanges = () => {
  // Simple check - in production you might want more sophisticated change detection
  return form.name !== ( props.workOrder?.name || '' ) ||
         form.description !== ( props.workOrder?.description || '' )
}

// Work order data population for edit mode
const populateFormFromWorkOrder = ( workOrder ) => {
  if ( !workOrder ) return

  isHydratingForm = true

  try {
    form.name = workOrder.name || ''
    form.description = workOrder.description || ''

    const startDateSource = workOrder.start_date || workOrder.start_date_time || workOrder.expected_start_date
    const dueDateSource = workOrder.due_date || workOrder.due_date_time || workOrder.expected_due_date
    const endDateSource = workOrder.end_date || workOrder.end_date_time || workOrder.expected_end_date || dueDateSource

    form.start_date = formatDateTimeForPicker( startDateSource )
    form.due_date = formatDateTimeForPicker( dueDateSource )
    form.end_date = formatDateTimeForPicker( endDateSource )

    form.category_ids = Array.isArray( workOrder.categories )
      ? workOrder.categories.map( c => c.id )
      : cloneArray( workOrder.category_ids )

    form.equipment_node_ids = Array.isArray( workOrder.equipment_nodes )
      ? workOrder.equipment_nodes.map( e => e.id )
      : cloneArray( workOrder.equipment_node_ids )

    form.assignee_ids = Array.isArray( workOrder.assignees )
      ? workOrder.assignees.map( a => a.id )
      : cloneArray( workOrder.assignee_ids )

    form.vendor_ids = cloneArray( workOrder.vendor_ids )

    form.priority_id = workOrder.priority?.id || workOrder.priority_id || null
    form.state_id = workOrder.state?.id || workOrder.state_id || 1
    form.work_type_id = workOrder.work_type?.id || workOrder.work_type_id || null
    form.approved_by_id = workOrder.approved_by?.id || workOrder.approved_by_id || null

    if ( (!Array.isArray( form.assignee_ids ) || form.assignee_ids.length === 0) && assigneeOptions.value.length > 0 ) {
      const randomAssignee = pickRandomOptionId( assigneeOptions.value )
      form.assignee_ids = randomAssignee ? [randomAssignee] : []
    }

    if ( (form.approved_by_id == null || form.approved_by_id === '') && supervisorOptions.value.length > 0 ) {
      const randomSupervisor = pickRandomOptionId( supervisorOptions.value )
      if ( randomSupervisor != null ) {
        form.approved_by_id = randomSupervisor
      }
    }

    if ( (!Array.isArray( form.category_ids ) || form.category_ids.length === 0) && categoryOptions.value.length > 0 ) {
      const randomCategory = pickRandomOptionId( categoryOptions.value )
      form.category_ids = randomCategory != null ? [randomCategory] : []
    }

    const sourceTasks = Array.isArray( workOrder.tasks ) && workOrder.tasks.length > 0
      ? workOrder.tasks
      : Array.isArray( workOrder.task_list )
        ? workOrder.task_list
        : []

    form.tasks = normalizeExistingTasks( sourceTasks, workOrder.id )

    const sourceStandards = Array.isArray( workOrder.standards ) && workOrder.standards.length > 0
      ? workOrder.standards
      : Array.isArray( workOrder.standard_list )
        ? workOrder.standard_list
        : []

    const standardsClone = clonePayload( sourceStandards )
    form.standards = Array.isArray( standardsClone ) ? standardsClone : []

    form.image_list = cloneArray( workOrder.image_list )
    form.file_list = cloneArray( workOrder.file_list )
    existingImages.value = cloneArray( workOrder.image_list )
    existingFiles.value = cloneArray( workOrder.file_list )

    form.recurrence_setting = clonePayload( workOrder.recurrence_setting || {} )
    form.recurrence_setting_request = clonePayload( workOrder.recurrence_setting_request || {
      start_date_time : startDateSource ? formatDateTimeForPicker( startDateSource ) : null,
      end_date_time : endDateSource ? formatDateTimeForPicker( endDateSource ) : null
    } )

    if ( !form.recurrence_setting_request.start_date_time && startDateSource ) {
      form.recurrence_setting_request.start_date_time = formatDateTimeForPicker( startDateSource )
    }
    if ( !form.recurrence_setting_request.end_date_time && endDateSource ) {
      form.recurrence_setting_request.end_date_time = formatDateTimeForPicker( endDateSource )
    }

    decorateTasksCategories( form.tasks )
    syncTaskPayloads()
    syncStandards()
  } finally {
    isHydratingForm = false
  }

  syncFormData()
}

// Load form data from API
const loadFormData = async() => {
  try {
    loading.value = true

    // Load all dropdown options in parallel
    const [
      workTypesResponse,
      prioritiesResponse,
      categoriesResponse,
      statesResponse,
      equipmentResponse
    ] = await Promise.all( [
      getAllWorkTypes(),
      getAllPriorities(),
      getAllCategories(),
      getAllStates(),
      getEquipmentNodeTrees()
    ] )

    // Set options
    workTypeOptions.value = workTypesResponse.data || []
    priorityOptions.value = prioritiesResponse.data || []
    categoryOptions.value = categoriesResponse.data || []
    stateOptions.value = statesResponse.data || []
    assetTreeData.value = equipmentResponse.data || []

    // For now, using mock data for assignees/supervisors
    // In production, these would come from a users API
    assigneeOptions.value = [
      { id : 1, name : 'John Doe' },
      { id : 2, name : 'Jane Smith' },
      { id : 3, name : 'Mike Johnson' }
    ]

    supervisorOptions.value = [
      { id : 1, name : 'Sarah Connor' },
      { id : 2, name : 'James Cameron' },
      { id : 3, name : 'Linda Hamilton' }
    ]

    // Populate form with work order data
    populateFormFromWorkOrder( props.workOrder )
  } catch ( error ) {
    console.error( 'Failed to load form data:', error )
    ElMessage.error( 'Failed to load form data. Please refresh and try again.' )
  } finally {
    loading.value = false
  }
}

// Payload creation (adapted from WorkOrderCreate)
const createWorkOrderPayload = () => {
  const formattedDueDate = toUtcIso( form.due_date )
  const formattedStartDate = toUtcIso( form.start_date )
  const formattedEndDate = toUtcIso( form.end_date )

  const basePayload = {
    name : form.name,
    category_ids : form.category_ids,
    priority_id : form.priority_id,
    state_id : form.state_id,
    work_type_id : form.work_type_id,
    start_date : formattedStartDate,
    due_date : formattedDueDate,
    end_date : formattedEndDate,
    recurrence_setting_request : form.recurrence_setting_request,
    description : form.description || '',
    equipment_node_ids : form.equipment_node_ids,
    assignee_ids : form.assignee_ids,
    approved_by_id : form.approved_by_id,
    vendor_ids : form.vendor_ids || [],
    time_zone : form.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    task_list : form.task_list || [],
    standard_list : form.standard_list || [],
    image_list : form.image_list || [],
    file_list : form.file_list || []
  }

  return basePayload
}

// Payload logging
const logCurrentPayload = () => {
  if ( isLoggingInProgress.value ) return

  isLoggingInProgress.value = true

  if ( logButtonTimeout ) {
    clearTimeout( logButtonTimeout )
  }

  logButtonTimeout = setTimeout( () => {
    isLoggingInProgress.value = false
  }, 500 )

  const rawPayload = createWorkOrderPayload()
  logPayload( rawPayload, 'workOrderEdit', {
    delay : 50,
    showMessage : true
  } )
}

// Main submit function for updating work order
const submitForm = async() => {
  if ( !formRef.value ) return

  try {
    const valid = await formRef.value.validate()
    if ( !valid ) {
      ElMessage.error( t( 'workOrder.messages.validationFailed' ) )
      return
    }

    loading.value = true

    // Upload files to MinIO first if there are any new files
    if ( form.image_list.length > 0 || form.file_list.length > 0 ) {
      await uploadFilesToServer()
    }

    // Prepare dates for backend
    const formattedDueDate = toUtcIso( form.due_date )
    const formattedStartDate = toUtcIso( form.start_date )
    const formattedEndDate = toUtcIso( form.end_date )

    // Ensure start_date_time is set for recurrence
    if ( !form.recurrence_setting_request.start_date_time && formattedStartDate ) {
      form.recurrence_setting_request.start_date_time = formattedStartDate
    }
    if ( !form.recurrence_setting_request.end_date_time && formattedEndDate ) {
      form.recurrence_setting_request.end_date_time = formattedEndDate
    }

    // Ensure derived lists are up to date
    syncTaskPayloads()
    syncStandards()

    // Prepare task list for update
    const taskAddList = Array.isArray( form.task_list ) ? form.task_list : []
    const normalizedTaskAddList = taskAddList.map( task => {
      const payload = clonePayload( task )
      payload.work_order_id = payload.work_order_id ?? props.workOrder.id
      payload.state = payload.state ?? DEFAULT_TASK_STATE
      payload.time_estimate_sec =
        payload.time_estimate_sec && payload.time_estimate_sec > 0 ? payload.time_estimate_sec : 1800
      payload.steps = Array.isArray( payload.steps ) ? payload.steps : []
      return payload
    } )

    // Create base payload
    const basePayload = createWorkOrderPayload()
    const payload = {
      ...basePayload,
      task_list : normalizedTaskAddList,
      recurrence_type : form.recurrence_type || form.recurrence_type_id || 1,
      recurrence_type_id : form.recurrence_type || form.recurrence_type_id || 1
    }

    // Apply final transformation and cleaning
    const finalPayload = transformPayload( payload, 'workOrderUpdate' )

    // Decide which API to call based on work order type
    let response
    if ( props.workOrder.recurrence_uuid ) {
      // Update recurring work orders
      finalPayload.recurrence_uuid = props.workOrder.recurrence_uuid
      response = await updateRecurrenceWorkOrders( finalPayload )
    } else {
      // Update individual work order
      response = await updateWorkOrder( props.workOrder.id, finalPayload )
    }

    // Show success message
    ElMessage.success( 'Work order updated successfully!' )

    // Emit the updated work order
    const updatedWorkOrder = Array.isArray( response.data ) ? response.data[0] : response.data
    emit( 'work-order-updated', updatedWorkOrder )

    // Navigate back to detail view
    emit( 'back-to-detail' )
  } catch ( error ) {
    console.error( 'Failed to update work order:', error )

    let errorMessage = 'Failed to update work order. Please try again.'
    if ( error.response?.data?.message ) {
      errorMessage = error.response.data.message
    } else if ( error.message ) {
      errorMessage = error.message
    }

    ElMessage.error( errorMessage )
  } finally {
    loading.value = false
  }
}

// Initialize component
onMounted( async() => {
  await loadFormData()
} )

// Watch for work order prop changes
watch(
  () => props.workOrder,
  ( newWorkOrder ) => {
    if ( newWorkOrder ) {
      populateFormFromWorkOrder( newWorkOrder )
    }
  },
  { immediate : true }
)
</script>

<style scoped lang="scss">
// Reuse the same styles from WorkOrderCreate with edit-specific modifications
.work-order-edit-enhanced {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-top: 24px;
  padding: 0px 24px 0px 24px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.edit-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;
}

.header-main {
  .edit-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 8px 0;
  }

  .header-meta {
    display: flex;
    gap: 16px;

    .edit-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: var(--el-text-color-regular);

      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.header-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-form {
  padding-bottom: 120px;
}

.form-section {
  margin-bottom: 24px;
}

// Section-specific styling
.tasks-section {
  background: var(--el-fill-color-extra-light);
  border-radius: 6px;
  padding: 12px;
}

.standards-section {
  background: #fbfff9;
  border-radius: 6px;
  padding: 12px;
}

.task-title-input {
  .el-input__inner {
    font-size: 18px;
    font-weight: 500;
  }
}

// Task and Standards sections
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);

    .section-icon {
      font-size: 18px;

      &.tasks-icon {
        color: var(--el-color-primary);
      }

      &.standards-icon {
        color: var(--el-color-success);
      }
    }
  }

  .task-actions, .standards-actions {
    display: flex;
    gap: 5px;
  }
}

.tasks-container, .standards-container {
  margin-top: 16px;
  min-height: 120px;
  flex: 1;

  &.no-tasks, &.no-standards {
    .empty-tasks, .empty-standards {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      border-radius: 8px;

      .empty-content {
        text-align: center;
        color: #909399;

        .empty-icon {
          font-size: 64px;
          color: #c0c4cc;
          margin-bottom: 16px;
        }

        h4 {
          margin: 0 0 0 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-regular);
        }

        p {
          margin: -8px 0 6px 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.tasks-list, .standards-list {
  display: flex;
  flex-direction: column;
}

.task-card, .standard-card {
  width: 100%;
}

// Work order duration display
.work-order-duration {
  margin-top: 8px;

  .el-text {
    font-size: 13px;
  }
}

// Upload section
.upload-section {
  margin-top: 16px;
}

// Form actions
.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  padding: 16px 24px;
  z-index: 100;

  .left-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .update-button {
      min-width: 120px;
    }
  }
}

// Preview dialogs
.preview-dialog {
  .preview-dialog-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .back-button {
      padding: 4px 8px;

      .el-icon {
        font-size: 16px;
      }
    }

    .dialog-title {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

// Standalone standard preview
.standalone-standard-preview {
  .standard-details {
    .fixed-header-section {
      margin-bottom: 20px;

      .standard-tabs-header {
        .details-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 0;
          }
        }
      }
    }

    .scrollable-content {
      max-height: 500px;
      overflow-y: auto;

      .tab-content-wrapper {
        .tab-pane-content {
          .overview-card, .description-card {
            background: var(--el-fill-color-light);
            border-radius: 8px;
            margin-bottom: 16px;

            .card-header {
              padding: 16px 16px 0 16px;

              .card-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
              }
            }

            .card-content {
              padding: 16px;

              .description-text {
                line-height: 1.6;
                color: var(--el-text-color-regular);
              }

              .info-value {
                font-weight: 600;

                &.highlight {
                  color: var(--el-color-primary);
                }
              }
            }
          }

          .rules-list {
            .card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 16px;
              background: var(--el-fill-color-light);
              border-radius: 8px 8px 0 0;

              .card-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
              }
            }

            .rules-container {
              background: white;
              border-radius: 0 0 8px 8px;
              border: 1px solid var(--el-border-color-light);
              border-top: none;

              .rule-item {
                display: flex;
                gap: 12px;
                padding: 16px;
                border-bottom: 1px solid var(--el-border-color-lighter);

                &:last-child {
                  border-bottom: none;
                }

                .rule-number {
                  flex-shrink: 0;
                  width: 24px;
                  height: 24px;
                  background: var(--el-color-primary);
                  color: white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: 600;
                }

                .rule-content {
                  flex: 1;

                  .rule-text {
                    line-height: 1.6;
                    color: var(--el-text-color-regular);
                  }
                }
              }
            }
          }

          .empty-rules {
            padding: 40px;
            text-align: center;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .work-order-edit-enhanced {
    padding: 0px 16px 0px 16px;
  }

  .header-actions {
    .el-button {
      .el-button__text {
        display: none;
      }
    }
  }

  .form-actions {
    padding: 12px 16px;
  }
}
</style>

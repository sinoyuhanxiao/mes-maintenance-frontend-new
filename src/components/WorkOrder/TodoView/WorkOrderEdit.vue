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
                :assignee-options="assigneeOptions"
                @selection="handleTaskAction"
                @assignee-update="handleTaskAssigneeUpdate"
                @open-assignee-dialog="handleOpenAssigneeDialog"
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
          :recurrence-setting="form.recurrence_setting"
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
      <div class="form-actions-fixed">
        <div class="form-actions-content">
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

      <div class="preview-content" v-loading="previewTaskLoading">
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
        <div v-else class="preview-empty">No steps available for preview.</div>
      </div>
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

    <!-- Task Assignee Management Dialog -->
    <el-dialog
      v-model="showTaskAssigneeDialog"
      title="Select Workers"
      width="600px"
      @close="resetTaskAssigneeDialog"
      top="8vh"
    >
      <div class="assignee-picker">
        <!-- Search -->
        <div class="search-section">
          <el-input v-model="userSearchQuery" placeholder="Search users..." clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Available Workers -->
        <div class="available-section">
          <h4>Available Workers</h4>
          <div v-if="filteredAssigneeOptions.length === 0" class="empty-users">
            <el-empty description="No users found" :image-size="60" />
          </div>
          <div v-else class="users-list">
            <div
              v-for="user in filteredAssigneeOptions"
              :key="user.id"
              class="user-item"
              :class="{ selected: isUserSelected(user.id) }"
              @click="toggleUser(user)"
            >
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div v-if="user.email" class="user-email">{{ user.email }}</div>
              </div>
              <div class="user-actions">
                <el-checkbox :model-value="isUserSelected(user.id)" @click.stop @change="toggleUser(user)" />
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Workers -->
        <div v-if="localSelectedTaskAssignees.length > 0" class="selected-section">
          <div class="selected-section-header">
            <h4>Selected Workers ({{ localSelectedTaskAssignees.length }})</h4>
            <el-button type="text" size="small" @click="clearAllAssignees" class="clear-all-btn"> Clear All </el-button>
          </div>
          <div class="selected-users">
            <el-tag
              v-for="user in getSelectedUserObjects()"
              :key="user.id"
              closable
              @close="removeSelectedUser(user.id)"
              class="selected-user-tag"
            >
              {{ user.name }}
            </el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetTaskAssigneeDialog">Cancel</el-button>
          <el-button type="primary" @click="saveTaskAssignees">
            Save Selection ({{ localSelectedTaskAssignees.length }})
          </el-button>
        </span>
      </template>
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
import { ref, reactive, onMounted, onActivated, onBeforeUnmount, watch, nextTick, computed } from 'vue'
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
  Calendar,
  Search
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
import { getTaskEntryById } from '@/api/task-entry'
import { useRouter, useRoute } from 'vue-router'
import { useTaskLibraryStore } from '@/store/modules/taskLibrary'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'
import { createEmptyWorkOrderForm } from './workOrderFormDefaults'
import { DEFAULT_TASK_STATE, buildDisplayTaskFromTemplate } from './taskPayloadHelpers'

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

// Emits
const emit = defineEmits( ['back-to-detail', 'work-order-updated', 'work-order-not-found'] )

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
const previewTaskLoading = ref( false )

// Task assignee dialog state
const showTaskAssigneeDialog = ref( false )
const currentEditingTask = ref( null )
const userSearchQuery = ref( '' )
const localSelectedTaskAssignees = ref( [] )
const standalonePreviewTab = ref( 'general' )

// Stores and utilities
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const taskLibraryStore = useTaskLibraryStore()
const workOrderDraftStore = useWorkOrderDraftStore()
const { currentPayload, showJsonDisplayer, logPayload } = usePayloadLogger()

// Form refs and loading
const formRef = ref( null )
const loading = ref( false )
const isLoggingInProgress = ref( false )
let logButtonTimeout = null

// Form data - matching API requirements and using same structure as create
const form = reactive( createEmptyWorkOrderForm() )
// Add workOrderId field to track current work order for change detection
form.workOrderId = null
let isHydratingForm = false
const hasHydratedFromDraft = ref( false )

// Task and Standard change tracking for proper API integration
const originalTasks = ref( [] )
const originalStandards = ref( [] )
const taskChanges = reactive( {
  added : [],
  updated : [],
  deleted : []
} )
const standardChanges = reactive( {
  added : [],
  updated : [],
  deleted : []
} )

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

const normalizeIdentifier = value => {
  if ( value === undefined || value === null ) return null
  const normalized = String( value ).trim()
  return normalized.length > 0 ? normalized : null
}

const generatedIdPrefixes = ['work-order-task-', 'new-task-', 'existing-task-', 'temp-']

const isGeneratedIdentifier = id => {
  const normalized = normalizeIdentifier( id )
  if ( !normalized ) return false
  const lower = normalized.toLowerCase()
  return generatedIdPrefixes.some( prefix => lower.startsWith( prefix ) )
}

const getTaskIdentityCandidates = task => {
  if ( !task || typeof task !== 'object' ) return []
  const seen = new Set()
  const pushCandidate = candidate => {
    const normalized = normalizeIdentifier( candidate )
    if ( normalized && !seen.has( normalized ) ) {
      seen.add( normalized )
    }
  }

  const payload = task.payload || {}
  ;[
    task.task_id,
    task.taskId,
    task.work_order_task_id,
    task.workOrderTaskId,
    task.id,
    payload.task_id,
    payload.id,
    payload.work_order_task_id
  ].forEach( pushCandidate )

  return Array.from( seen )
}

const findTaskIndexInCollection = ( collection, task ) => {
  if ( !Array.isArray( collection ) || !task ) return -1
  const candidates = getTaskIdentityCandidates( task )
  if ( candidates.length === 0 ) return -1
  const candidateSet = new Set( candidates )
  return collection.findIndex( item => {
    const itemCandidates = getTaskIdentityCandidates( item )
    return itemCandidates.some( candidate => candidateSet.has( candidate ) )
  } )
}

const resolveTaskEntryId = task => {
  const candidates = getTaskIdentityCandidates( task )
  for ( const candidate of candidates ) {
    if ( candidate && !isGeneratedIdentifier( candidate ) ) {
      return candidate
    }
  }
  return null
}

const hasTemplateAssociation = task => {
  if ( !task || typeof task !== 'object' ) return false
  return Boolean(
    task.templateId ||
    task.template_id ||
    task.payload?.template_id ||
    task.rawTemplate?.template_id ||
    task.rawTemplate?.id
  )
}

const isStandaloneTaskRecord = task => {
  if ( !task || typeof task !== 'object' ) return false
  if ( hasTemplateAssociation( task ) ) return false
  if ( task.source && task.source !== 'adhoc' ) return false
  return true
}

const needsStandaloneEntryFetch = task => {
  if ( !isStandaloneTaskRecord( task ) ) return false
  if ( task?.__hasLocalEdits || task?.__entryStepsLoaded ) return false
  return Boolean( resolveTaskEntryId( task ) )
}

const applyStepsToTask = ( targetTask, steps, { markLocalEdit = false, entryId = null } = {} ) => {
  if ( !targetTask || typeof targetTask !== 'object' ) return

  const normalizedSteps = Array.isArray( steps ) && steps.length > 0 ? clonePayload( steps ) : [createFallbackStep()]
  targetTask.steps = clonePayload( normalizedSteps )

  if ( !targetTask.payload || typeof targetTask.payload !== 'object' ) {
    targetTask.payload = {}
  }

  targetTask.payload.steps = clonePayload( normalizedSteps )

  if ( entryId ) {
    const currentId = normalizeIdentifier( targetTask.id )
    if ( !currentId || isGeneratedIdentifier( currentId ) ) {
      targetTask.id = entryId
    }

    const payloadId = normalizeIdentifier( targetTask.payload.id )
    if ( !payloadId || isGeneratedIdentifier( payloadId ) ) {
      targetTask.payload.id = entryId
    }

    const payloadTaskId = normalizeIdentifier( targetTask.payload.task_id )
    if ( !payloadTaskId || isGeneratedIdentifier( payloadTaskId ) ) {
      targetTask.payload.task_id = entryId
    }
  }

  if ( markLocalEdit ) {
    targetTask.__hasLocalEdits = true
  }

  targetTask.__entryStepsLoaded = true
}

const updateTaskStepsInCollection = ( collection, task, steps, entryId = null ) => {
  if ( !Array.isArray( collection ) || !task ) return
  const normalizedSteps = Array.isArray( steps ) && steps.length > 0 ? clonePayload( steps ) : [createFallbackStep()]
  const index = findTaskIndexInCollection( collection, task )
  if ( index === -1 ) return

  const target = collection[index]
  if ( !target || typeof target !== 'object' ) return

  target.steps = clonePayload( normalizedSteps )

  if ( !target.payload || typeof target.payload !== 'object' ) {
    target.payload = {}
  }
  target.payload.steps = clonePayload( normalizedSteps )

  if ( entryId ) {
    const currentId = normalizeIdentifier( target.id )
    if ( !currentId || isGeneratedIdentifier( currentId ) ) {
      target.id = entryId
    }

    const payloadId = normalizeIdentifier( target.payload.id )
    if ( !payloadId || isGeneratedIdentifier( payloadId ) ) {
      target.payload.id = entryId
    }

    const payloadTaskId = normalizeIdentifier( target.payload.task_id )
    if ( !payloadTaskId || isGeneratedIdentifier( payloadTaskId ) ) {
      target.payload.task_id = entryId
    }
  }

  target.__entryStepsLoaded = true
}

const syncOriginalTaskEntrySteps = ( task, steps, entryId = null ) => {
  updateTaskStepsInCollection( originalTasks.value, task, steps, entryId )
  if ( Array.isArray( workOrderDraftStore.originalTasks ) ) {
    updateTaskStepsInCollection( workOrderDraftStore.originalTasks, task, steps, entryId )
  }
}

const ensureStandaloneTaskEntryData = async task => {
  if ( !needsStandaloneEntryFetch( task ) ) {
    const existingSteps = Array.isArray( task?.steps ) && task.steps.length > 0
      ? task.steps
      : task?.payload?.steps || []
    return { steps : existingSteps }
  }

  const entryId = resolveTaskEntryId( task )
  if ( !entryId ) {
    return { steps : task?.steps || [] }
  }

  const response = await getTaskEntryById( entryId )
  const entryData = response?.data ?? response

  if ( !entryData ) {
    throw new Error( 'Missing task entry payload' )
  }

  const entrySteps = Array.isArray( entryData.steps ) ? entryData.steps : []
  applyStepsToTask( task, entrySteps, { entryId } )
  syncOriginalTaskEntrySteps( task, entrySteps, entryId )

  if ( entryData.name && !task.name ) {
    task.name = entryData.name
  }

  if ( entryData.description !== undefined && entryData.description !== null && !task.description ) {
    task.description = entryData.description
  }

  if ( entryData.name ) {
    task.payload.name = entryData.name
  }

  if ( entryData.description !== undefined && entryData.description !== null ) {
    task.payload.description = entryData.description
  }

  return {
    steps : entrySteps,
    entryData
  }
}

// Task change tracking utilities

const getTaskIdentifier = task => {
  return task.id || task.task_id || task.template_id || task.templateId || `temp-${Math.random()}`
}

const findOriginalTask = taskId => {
  return originalTasks.value.find( task => getTaskIdentifier( task ) === taskId )
}

const isTaskModified = ( currentTask, originalTask ) => {
  if ( !originalTask ) return false

  // Compare key properties that indicate a task has been modified
  const compareProps = ['name', 'description', 'estimated_minutes', 'category_id']
  return (
    compareProps.some( prop => currentTask[prop] !== originalTask[prop] ) ||
    JSON.stringify( currentTask.steps || [] ) !== JSON.stringify( originalTask.steps || [] )
  )
}

const calculateTaskChanges = () => {
  // Clear previous changes
  taskChanges.added.length = 0
  taskChanges.updated.length = 0
  taskChanges.deleted.length = 0

  // Find added and updated tasks
  form.tasks.forEach( currentTask => {
    const taskId = getTaskIdentifier( currentTask )
    const originalTask = findOriginalTask( taskId )

    if ( !originalTask ) {
      // New task - add to added list
      taskChanges.added.push( currentTask.payload || currentTask )
    } else if ( isTaskModified( currentTask, originalTask ) ) {
      // Modified task - add to updated list
      const updatePayload = {
        ...( currentTask.payload || currentTask ),
        id : originalTask.id || originalTask.task_id // Ensure we have the original ID for updates
      }
      taskChanges.updated.push( updatePayload )
    }
  } )

  // Find deleted tasks
  originalTasks.value.forEach( originalTask => {
    const taskId = getTaskIdentifier( originalTask )
    const currentTask = form.tasks.find( task => getTaskIdentifier( task ) === taskId )

    if ( !currentTask ) {
      // Task was deleted
      taskChanges.deleted.push( originalTask.id || originalTask.task_id || originalTask.template_id || originalTask.templateId )
    }
  } )
}

// Standard change tracking utilities
const getStandardIdentifier = standard => {
  return standard.id || standard.standard_id || standard.standardId || `temp-${Math.random()}`
}

const findOriginalStandard = standardId => {
  return originalStandards.value.find( standard => getStandardIdentifier( standard ) === standardId )
}

const isStandardModified = ( currentStandard, originalStandard ) => {
  if ( !originalStandard ) return false

  // Compare key properties
  const compareProps = ['name', 'description', 'category']
  return (
    compareProps.some( prop => currentStandard[prop] !== originalStandard[prop] ) ||
    JSON.stringify( currentStandard.items || [] ) !== JSON.stringify( originalStandard.items || [] )
  )
}

const calculateStandardChanges = () => {
  // Clear previous changes
  standardChanges.added.length = 0
  standardChanges.updated.length = 0
  standardChanges.deleted.length = 0

  // Find added and updated standards
  form.standards.forEach( currentStandard => {
    const standardId = getStandardIdentifier( currentStandard )
    const originalStandard = findOriginalStandard( standardId )

    if ( !originalStandard ) {
      // New standard - add to added list
      standardChanges.added.push( {
        ...currentStandard,
        module : 200 // Standard module for work orders
      } )
    } else if ( isStandardModified( currentStandard, originalStandard ) ) {
      // Modified standard - add to updated list
      standardChanges.updated.push( {
        ...currentStandard,
        id : originalStandard.id || originalStandard.standard_id,
        module : 200
      } )
    }
  } )

  // Find deleted standards
  originalStandards.value.forEach( originalStandard => {
    const standardId = getStandardIdentifier( originalStandard )
    const currentStandard = form.standards.find( standard => getStandardIdentifier( standard ) === standardId )

    if ( !currentStandard ) {
      // Standard was deleted
      standardChanges.deleted.push( originalStandard.id || originalStandard.standard_id || originalStandard.standardId )
    }
  } )
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

      const estimatedMinutes =
        ( taskClone.estimated_minutes ??
          taskClone.estimatedMinutes ??
          Math.round( ( payload.time_estimate_sec || 0 ) / 60 ) ) ||
        0

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
const assigneeOptions = ref( [
  { id : 84, name : 'System' },
  { id : 37, name : 'Erik Yu' },
  { id : 43, name : 'Chang Shi' },
  { id : 45, name : 'Maxwell Wang' },
  { id : 46, name : 'Justin Li' },
  { id : 47, name : 'Justin Tung' },
  { id : 48, name : 'Eric Huang' }
] )

const supervisorOptions = ref( [
  { id : 36, name : 'Yao Li' },
  { id : 41, name : 'John Li' }
] )
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

// Template update listener - matches WorkOrderCreate pattern
const handleTemplateUpdate = updatedTemplate => {
  // Find tasks that use this template and update them
  const templateId = updatedTemplate.template_id || updatedTemplate.id

  // Update tasks that match this template
  form.tasks.forEach( ( task, index ) => {
    if ( task.source === 'template' && ( task.templateId === templateId || task.template_id === templateId ) ) {
      const refreshedTask = buildDisplayTaskFromTemplate( updatedTemplate )
      form.tasks[index] = {
        ...task,
        ...refreshedTask,
        id : task.id,
        payload : {
          ...( task.payload || {} ),
          ...refreshedTask.payload
        }
      }
      decorateTaskCategory( form.tasks[index] )
    }
  } )

  // Show notification that tasks were refreshed
  if ( form.tasks.some( task => task.templateId === templateId || task.template_id === templateId ) ) {
    ElMessage.success( `Tasks updated with latest template changes: ${updatedTemplate.name}` )
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
// Form data synchronization for draft saving - Enhanced for edit context
const syncFormData = () => {
  if ( isHydratingForm ) return
  nextTick( () => {
    isHydratingForm = false
    // Use context-aware draft saving for edit mode
    workOrderDraftStore.saveContextAwareDraft( form, 'edit' )
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

// Deep watch for form changes to save draft - Enhanced for edit context
watch(
  form,
  () => {
    if ( isHydratingForm ) return
    workOrderDraftStore.saveContextAwareDraft( form, 'edit' )
  },
  { deep : true }
)

// Date validation functions (copied from WorkOrderCreate)
const disabledDueDates = time => {
  if ( !form.start_date ) return false
  return time.getTime() < new Date( form.start_date ).getTime()
}

const disabledStartDates = time => {
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
const formatDate = dateString => {
  if ( !dateString ) return 'N/A'
  try {
    return new Date( dateString ).toLocaleDateString()
  } catch ( error ) {
    return 'Invalid Date'
  }
}

// UTC date conversion utility (copied from WorkOrderCreate)
const toUtcIso = dateValue => {
  if ( !dateValue ) return null
  try {
    const date = new Date( dateValue )
    return date.toISOString()
  } catch ( error ) {
    return null
  }
}

// Form validation rules (copied and adapted from WorkOrderCreate)
const rules = {
  name : [
    { required : true, message : 'Work order name is required', trigger : 'blur' },
    { min : 3, max : 200, message : 'Name must be between 3 and 200 characters', trigger : 'blur' }
  ],
  equipment_node_ids : [{ required : true, message : 'Please select at least one asset', trigger : 'change' }],
  assignee_ids : [{ required : true, message : 'Please assign at least one person', trigger : 'change' }],
  due_date : [{ required : true, message : 'Due date is required', trigger : 'change' }],
  start_date : [{ required : true, message : 'Start date is required', trigger : 'change' }],
  end_date : [
    {
      required : false,
      validator : ( _, value, callback ) => {
        if ( value && form.start_date && new Date( value ) < new Date( form.start_date ) ) {
          callback( new Error( 'End date must be after start date' ) )
        } else {
          callback()
        }
      },
      trigger : 'change'
    }
  ]
}

// Task management methods (copied from WorkOrderCreate)
const handleAddTask = () => {
  // Sync current form to draft store before opening task dialog
  // This ensures the designer has access to current work order state
  workOrderDraftStore.saveContextAwareDraft( form, 'edit' )
  showAddTaskDialog.value = true
}

const closeAddTaskDialog = () => {
  showAddTaskDialog.value = false
}

const handleCloseAddTaskDialog = () => {
  closeAddTaskDialog()
}

const onAddTaskTemplates = selectedTemplates => {
  if ( !Array.isArray( selectedTemplates ) ) return

  isHydratingForm = true
  selectedTemplates.forEach( template => {
    const displayTask = buildDisplayTaskFromTemplate( template )
    form.tasks.push( displayTask )
  } )

  syncFormData()
  closeAddTaskDialog()
}

const handleTaskAction = async( { action, data } ) => {
  switch ( action ) {
    case 'preview':
      await handlePreviewTask( data )
      break
    case 'edit':
      await handleEditTask( data )
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

const handlePreviewTask = async taskData => {
  if ( !taskData ) {
    ElMessage.warning( 'Unable to preview this task.' )
    return false
  }

  const taskIndex = findTaskIndexInCollection( form.tasks, taskData )
  const targetTask = taskIndex !== -1 ? form.tasks[taskIndex] : taskData

  previewTaskTemplateId.value = null
  previewTaskData.value = null

  if ( needsStandaloneEntryFetch( targetTask ) ) {
    try {
      previewTaskLoading.value = true
      await ensureStandaloneTaskEntryData( targetTask )
    } catch ( error ) {
      ElMessage.error( 'Failed to load task preview.' )
      previewTaskLoading.value = false
      return false
    } finally {
      previewTaskLoading.value = false
    }
  }

  const freshestTask = getMostCurrentTaskData( taskIndex !== -1 ? form.tasks[taskIndex] : targetTask )

  const templateId =
    freshestTask.templateId ||
    freshestTask.template_id ||
    freshestTask.payload?.template_id ||
    freshestTask.rawTemplate?.template_id ||
    freshestTask.rawTemplate?.id ||
    null

  if ( isStandaloneTaskRecord( freshestTask ) || !templateId ) {
    const steps = Array.isArray( freshestTask.steps ) && freshestTask.steps.length > 0
      ? freshestTask.steps
      : Array.isArray( freshestTask.payload?.steps )
        ? freshestTask.payload.steps
        : []

    if ( !Array.isArray( steps ) || steps.length === 0 ) {
      ElMessage.warning( 'No steps available to preview for this task.' )
      return false
    }

    previewTaskData.value = {
      ...freshestTask,
      steps : clonePayload( steps )
    }
    previewTaskTemplateId.value = null
  } else {
    previewTaskTemplateId.value = templateId
    previewTaskData.value = null
  }

  showTaskPreviewDialog.value = true
  return true
}

const getMostCurrentTaskData = taskData => {
  // First, calculate current task changes to ensure task_update_list is up to date
  calculateTaskChanges()

  // Look for the task in task_update_list first (most current version)
  const taskId = getTaskIdentifier( taskData )
  const updatedTask = taskChanges.updated.find( task => getTaskIdentifier( task ) === taskId )

  if ( updatedTask ) {
    // Convert update payload back to display format
    return {
      ...taskData,
      ...updatedTask,
      steps : updatedTask.steps || updatedTask.payload?.steps || taskData.steps || [],
      payload : updatedTask
    }
  }

  // Otherwise return the original task data with steps properly extracted
  return {
    ...taskData,
    steps : taskData.steps || taskData.payload?.steps || []
  }
}

const handleEditTask = async taskData => {
  if ( !taskData ) {
    ElMessage.warning( 'Unable to edit this task.' )
    return false
  }

  const taskIndex = findTaskIndexInCollection( form.tasks, taskData )
  const baseTask = taskIndex !== -1 ? form.tasks[taskIndex] : taskData

  try {
    loading.value = true

    let standaloneEntryId = resolveTaskEntryId( baseTask )

    if ( needsStandaloneEntryFetch( baseTask ) ) {
      try {
        await ensureStandaloneTaskEntryData( baseTask )
        baseTask.__entryStepsLoaded = true
      } catch ( fetchError ) {
        ElMessage.error( 'Failed to load task details for editing.' )
        return false
      }
    }

    // Get the most current version of the task data
    const currentTaskData = getMostCurrentTaskData( taskIndex !== -1 ? form.tasks[taskIndex] : baseTask )

    const originalTemplateId =
      currentTaskData.templateId ||
      currentTaskData.template_id ||
      currentTaskData.payload?.template_id ||
      currentTaskData.rawTemplate?.template_id ||
      currentTaskData.rawTemplate?.id ||
      null

    const isStandaloneTask = currentTaskData.source === 'adhoc' && !originalTemplateId

    if ( !originalTemplateId && !isStandaloneTask ) {
      ElMessage.warning( 'This task does not have an associated template to edit.' )
      return
    }

    const workOrderLabel = form.name || props.workOrder?.name || 'Work Order'
    const workOrderId = props.workOrder?.id ?? workOrderLabel

    // Sync current form to draft store before navigation with edit context
    workOrderDraftStore.saveContextAwareDraft( form, 'edit' )
    workOrderDraftStore.setReturnRoute( route.fullPath )
    workOrderDraftStore.setReturnPanel( 'edit' )
    workOrderDraftStore.setReturnWorkOrderId( props.workOrder?.id ?? null )
    workOrderDraftStore.setShouldOpenCreatePanel( false )

    const taskIdentifier = getTaskIdentifier( currentTaskData )
    if ( !taskIdentifier ) {
      ElMessage.error( 'Unable to edit task: missing task identifier. Please try refreshing and editing again.' )
      return false
    }

    const taskIdentifierString = String( taskIdentifier )

    if ( !standaloneEntryId ) {
      const fallbackId = normalizeIdentifier( taskIdentifierString )
      if ( fallbackId && !isGeneratedIdentifier( fallbackId ) ) {
        standaloneEntryId = fallbackId
      }
    }

    const baseQuery = {
      fromWorkOrder : 'true',
      workOrderId : String( workOrderId ),
      workOrderName : workOrderLabel,
      taskId : taskIdentifierString,
      returnPanel : 'edit'
    }

    if ( props.workOrder?.id ) {
      baseQuery.returnWorkOrderId = String( props.workOrder.id )
    }

    if ( isStandaloneTask ) {
      // Ensure steps are available at the top level for the editor
      // Preserve original task data structure and only overlay necessary updates
      const standaloneTaskData = {
        ...taskData, // Start with original task data to preserve all properties
        ...currentTaskData, // Overlay with any updates from getMostCurrentTaskData
        // Ensure essential properties are preserved
        name : currentTaskData.name || taskData.name,
        description : currentTaskData.description || taskData.description,
        category : currentTaskData.category || taskData.category,
        estimated_minutes : currentTaskData.estimated_minutes || taskData.estimated_minutes,
        equipment_node_id : currentTaskData.equipment_node_id || taskData.equipment_node_id,
        // Ensure steps are available at the top level for the editor
        steps : currentTaskData.steps || currentTaskData.payload?.steps || taskData.steps || []
      }

      // Normalize identifiers so the designer can return updates reliably
      standaloneTaskData.id = taskIdentifierString
      if ( standaloneTaskData.task_id == null ) {
        standaloneTaskData.task_id = taskIdentifierString
      }
      if ( standaloneTaskData.payload && typeof standaloneTaskData.payload === 'object' ) {
        if ( standaloneTaskData.payload.id == null ) {
          standaloneTaskData.payload.id = taskIdentifierString
        }
        if ( standaloneTaskData.payload.task_id == null ) {
          standaloneTaskData.payload.task_id = taskIdentifierString
        }
      }

      if ( standaloneEntryId ) {
        standaloneTaskData.entry_id = standaloneEntryId
      }

      // Validate that essential data is present before navigation
      if ( !standaloneTaskData.name ) {
        ElMessage.error( 'Unable to edit task: missing task name. Please try refreshing and editing again.' )
        return
      }

      if ( !standaloneTaskData.id ) {
        ElMessage.error( 'Unable to edit task: missing task ID. Please try refreshing and editing again.' )
        return
      }

      // Store task data in sessionStorage to avoid URL length limits
      const storageKey = `standalone-task-${standaloneTaskData.id}-${Date.now()}`
      sessionStorage.setItem( storageKey, JSON.stringify( standaloneTaskData ) )
      try {
        sessionStorage.setItem( 'last-standalone-task-key', storageKey )
      } catch ( storageError ) {
        console.warn( 'WorkOrderEdit: Failed to persist last standalone task key', storageError )
      }

      workOrderDraftStore.setPendingStandaloneTask( standaloneTaskData )

      let serializedTaskData = null
      try {
        serializedTaskData = JSON.stringify( standaloneTaskData )
      } catch ( serializeError ) {
        console.warn( 'WorkOrderEdit: Failed to serialize standalone task data for query payload', serializeError )
      }

      const queryPayload = {
        ...baseQuery,
        standalone : 'true',
        taskDataKey : storageKey,
        taskData : serializedTaskData || undefined,
        taskEntryId : standaloneEntryId ? String( standaloneEntryId ) : undefined
      }

      Object.keys( queryPayload ).forEach( key => {
        if ( queryPayload[key] === undefined ) {
          delete queryPayload[key]
        }
      } )

      await router.push( {
        name : 'TaskDesignerEdit',
        params : { id : 'standalone' },
        query : queryPayload
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
    const errorMessage = error.response?.data?.message || error.message || 'Failed to open task editor'
    ElMessage.error( errorMessage )
    return false
  } finally {
    loading.value = false
  }

  return true
}

const handleDeleteAllTasks = () => {
  ElMessageBox.confirm( 'Are you sure you want to remove all tasks?', 'Confirm Remove All Tasks', {
    confirmButtonText : 'Remove All',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      form.tasks.splice( 0 )
      syncFormData()
      ElMessage.success( 'All tasks removed successfully' )
    } )
    .catch( () => {
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
    const task = form.tasks.find(
      t =>
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

const onAddStandards = selectedStandards => {
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

const handlePreviewStandard = standard => {
  previewStandardData.value = standard
  showStandardPreviewDialog.value = true
}

const handleEditStandard = standard => {
  editingStandard.value = standard
  showEditStandardDialog.value = true
}

const onStandardUpdate = updatedStandard => {
  const index = form.standards.findIndex( s => s.id === updatedStandard.id )
  if ( index !== -1 ) {
    form.standards.splice( index, 1, updatedStandard )
    syncFormData()
  }
  showEditStandardDialog.value = false
  editingStandard.value = null
}

const handleDeleteAllStandards = () => {
  ElMessageBox.confirm( 'Are you sure you want to remove all standards?', 'Confirm Remove All Standards', {
    confirmButtonText : 'Remove All',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      form.standards.splice( 0 )
      syncFormData()
      ElMessage.success( 'All standards removed successfully' )
    } )
    .catch( () => {
      // User cancelled
    } )
}

// File handling methods
const handleImageListUpdate = imageList => {
  form.image_list = imageList
}

const handleFilesListUpdate = filesList => {
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

  ElMessageBox.confirm( 'Are you sure you want to leave the form? All unsaved changes will be lost.', 'Confirm Leave', {
    confirmButtonText : 'Leave',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      emit( 'back-to-detail' )
    } )
    .catch( () => {
      // User cancelled
    } )
}

const resetForm = () => {
  ElMessageBox.confirm( 'Are you sure you want to reset the form? All unsaved changes will be lost.', 'Confirm Reset', {
    confirmButtonText : 'Reset',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      resetFormSilent()
    } )
    .catch( () => {
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
  return form.name !== ( props.workOrder?.name || '' ) || form.description !== ( props.workOrder?.description || '' )
}

// Work order data population for edit mode
const populateFormFromWorkOrder = workOrder => {
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

    // Handle categories using the same fallback pattern as WorkOrderDetail.vue
    if ( Array.isArray( workOrder.categories ) && workOrder.categories.length ) {
      form.category_ids = workOrder.categories.map( c => c.id )
    } else if ( Array.isArray( workOrder.category_list ) && workOrder.category_list.length ) {
      form.category_ids = workOrder.category_list.map( c => c.id )
    } else if ( workOrder.category ) {
      // Single category case - convert to array
      const categoryId = typeof workOrder.category === 'object' ? workOrder.category.id : workOrder.category
      form.category_ids = categoryId ? [categoryId] : []
    } else {
      // Fallback to direct category_ids
      form.category_ids = cloneArray( workOrder.category_ids ) || []
    }

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

    if ( ( !Array.isArray( form.assignee_ids ) || form.assignee_ids.length === 0 ) && assigneeOptions.value.length > 0 ) {
      const randomAssignee = pickRandomOptionId( assigneeOptions.value )
      form.assignee_ids = randomAssignee ? [randomAssignee] : []
    }

    if ( ( form.approved_by_id == null || form.approved_by_id === '' ) && supervisorOptions.value.length > 0 ) {
      const randomSupervisor = pickRandomOptionId( supervisorOptions.value )
      if ( randomSupervisor != null ) {
        form.approved_by_id = randomSupervisor
      }
    }

    if ( ( !Array.isArray( form.category_ids ) || form.category_ids.length === 0 ) && categoryOptions.value.length > 0 ) {
      const randomCategory = pickRandomOptionId( categoryOptions.value )
      form.category_ids = randomCategory != null ? [randomCategory] : []
    }

    const sourceTasks =
      Array.isArray( workOrder.tasks ) && workOrder.tasks.length > 0
        ? workOrder.tasks
        : Array.isArray( workOrder.task_list )
          ? workOrder.task_list
          : []

    form.tasks = normalizeExistingTasks( sourceTasks, workOrder.id )

    const sourceStandards =
      Array.isArray( workOrder.standards ) && workOrder.standards.length > 0
        ? workOrder.standards
        : Array.isArray( workOrder.standard_list )
          ? workOrder.standard_list
          : []

    const standardsClone = clonePayload( sourceStandards )
    form.standards = Array.isArray( standardsClone ) ? standardsClone : []

    // Store original tasks and standards for change tracking
    originalTasks.value = clonePayload( form.tasks )
    originalStandards.value = clonePayload( form.standards )

    // Sync original data to draft store for designer navigation consistency
    workOrderDraftStore.originalTasks = clonePayload( form.tasks )
    workOrderDraftStore.originalStandards = clonePayload( form.standards )

    form.image_list = cloneArray( workOrder.image_list )
    form.file_list = cloneArray( workOrder.file_list )
    existingImages.value = cloneArray( workOrder.image_list )
    existingFiles.value = cloneArray( workOrder.file_list )

    // Build recurrence_setting from work order data
    const recurrenceSetting = {}
    if ( workOrder.recurrence_type ) {
      recurrenceSetting.recurrence_type = workOrder.recurrence_type.id
    }

    // For "Does not repeat" type (typically ID 1), use start_date_time and end_date_time
    if ( workOrder.recurrence_type?.id === 1 ) {
      if ( startDateSource ) {
        recurrenceSetting.start_date_time = formatDateTimeForPicker( startDateSource )
      }
      if ( endDateSource ) {
        recurrenceSetting.end_date_time = formatDateTimeForPicker( endDateSource )
      }
    }

    form.recurrence_setting = recurrenceSetting

    // Set recurrence type fields
    if ( workOrder.recurrence_type ) {
      form.recurrence_type = workOrder.recurrence_type.id
      form.recurrence_type_id = workOrder.recurrence_type.id
    }

    form.recurrence_setting_request = clonePayload(
      workOrder.recurrence_setting_request || {
        start_date_time : startDateSource ? formatDateTimeForPicker( startDateSource ) : null,
        end_date_time : endDateSource ? formatDateTimeForPicker( endDateSource ) : null
      }
    )

    if ( !form.recurrence_setting_request.start_date_time && startDateSource ) {
      form.recurrence_setting_request.start_date_time = formatDateTimeForPicker( startDateSource )
    }
    if ( !form.recurrence_setting_request.end_date_time && endDateSource ) {
      form.recurrence_setting_request.end_date_time = formatDateTimeForPicker( endDateSource )
    }

    decorateTasksCategories( form.tasks )
  } finally {
    isHydratingForm = false
  }

  syncFormData()
}

// Task assignee dialog methods (matching tools dialog pattern)
const handleTaskAssigneeUpdate = ( { taskId, assigneeIds, taskData } ) => {
  const taskIndex = form.tasks.findIndex( task => task.id === taskId )
  if ( taskIndex === -1 ) return

  // Update the task's assignee_ids
  if ( form.tasks[taskIndex].payload ) {
    form.tasks[taskIndex].payload.assignee_ids = assigneeIds
  } else {
    form.tasks[taskIndex].assignee_ids = assigneeIds
  }

  syncFormData()

  // Show success message
  const assigneeNames = assigneeOptions.value
    .filter( user => assigneeIds.includes( user.id ) )
    .map( user => user.name )
    .join( ', ' )

  if ( assigneeIds.length === 0 ) {
    ElMessage.success( `Removed all assignees from "${taskData.name}"` )
  } else {
    ElMessage.success( `Updated assignees for "${taskData.name}": ${assigneeNames}` )
  }
}

const handleOpenAssigneeDialog = ( { taskId, taskData, currentAssigneeIds } ) => {
  currentEditingTask.value = taskData
  userSearchQuery.value = ''

  // Initialize local selected assignees with current task assignees
  const assigneeIds = taskData.payload?.assignee_ids || taskData.assignee_ids || []
  localSelectedTaskAssignees.value = [...assigneeIds]

  showTaskAssigneeDialog.value = true
}

const filteredAssigneeOptions = computed( () => {
  if ( !userSearchQuery.value ) {
    return assigneeOptions.value
  }

  const query = userSearchQuery.value.toLowerCase()
  return assigneeOptions.value.filter(
    user => user.name.toLowerCase().includes( query ) || ( user.email && user.email.toLowerCase().includes( query ) )
  )
} )

const isUserSelected = userId => {
  return localSelectedTaskAssignees.value.includes( userId )
}

const toggleUser = user => {
  const isSelected = isUserSelected( user.id )

  if ( isSelected ) {
    removeSelectedUser( user.id )
  } else {
    addSelectedUser( user.id )
  }
}

const addSelectedUser = userId => {
  if ( !localSelectedTaskAssignees.value.includes( userId ) ) {
    localSelectedTaskAssignees.value.push( userId )
  }
}

const removeSelectedUser = userId => {
  localSelectedTaskAssignees.value = localSelectedTaskAssignees.value.filter( id => id !== userId )
}

const clearAllAssignees = () => {
  localSelectedTaskAssignees.value = []
}

const getSelectedUserObjects = () => {
  return localSelectedTaskAssignees.value.map( id => {
    const found = assigneeOptions.value.find( user => user.id === id )
    return found || { id, name : `User #${id}`, email : '' }
  } )
}

const saveTaskAssignees = () => {
  if ( !currentEditingTask.value ) return

  handleTaskAssigneeUpdate( {
    taskId : currentEditingTask.value.id,
    assigneeIds : [...localSelectedTaskAssignees.value],
    taskData : currentEditingTask.value
  } )

  resetTaskAssigneeDialog()
}

const resetTaskAssigneeDialog = () => {
  showTaskAssigneeDialog.value = false
  currentEditingTask.value = null
  localSelectedTaskAssignees.value = []
  userSearchQuery.value = ''
}

// Load form data from API
const loadFormData = async() => {
  try {
    loading.value = true

    // Load all dropdown options in parallel
    const [workTypesResponse, prioritiesResponse, categoriesResponse, statesResponse, equipmentResponse] =
      await Promise.all( [
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

    // For now, using mock data for assignees/supervisors - data already set at component level
    // In production, these would come from a users API

    // Populate form with work order data
    populateFormFromWorkOrder( props.workOrder )
  } catch ( error ) {
    ElMessage.error( 'Failed to load form data. Please refresh and try again.' )
  } finally {
    loading.value = false
  }
}

// Payload creation for work order updates with proper API field mapping
const createWorkOrderPayload = () => {
  const formattedDueDate = toUtcIso( form.due_date )
  const formattedStartDate = toUtcIso( form.start_date )
  const formattedEndDate = toUtcIso( form.end_date )

  // Calculate task and standard changes
  calculateTaskChanges()
  calculateStandardChanges()

  const basePayload = {
    // Core work order fields
    name : form.name,
    description : form.description || '',
    category_ids : form.category_ids || [],
    priority_id : form.priority_id,
    state_id : form.state_id,
    work_type_id : form.work_type_id,

    // Date fields
    start_date : formattedStartDate,
    due_date : formattedDueDate,
    end_date : formattedEndDate,

    // Assignment fields
    assignee_ids : form.assignee_ids || [],
    approved_by_id : form.approved_by_id,

    // Equipment and vendors
    equipment_node_ids : form.equipment_node_ids || [],
    vendor_ids : form.vendor_ids || [],

    // Task management using proper API structure
    task_add_list : taskChanges.added,
    task_update_list : taskChanges.updated,
    task_delete_list : taskChanges.deleted,

    // Standard management using proper API structure
    standard_add_list : standardChanges.added,
    standard_update_list : standardChanges.updated,
    standard_delete_list : standardChanges.deleted,

    // File attachments
    image_list : form.image_list || [],
    file_list : form.file_list || [],

    // Recurrence settings
    recurrence_setting_request : form.recurrence_setting_request || {},
    recurrence_type : form.recurrence_type || form.recurrence_type_id || 1,
    recurrence_type_id : form.recurrence_type || form.recurrence_type_id || 1,

    // System fields
    time_zone : form.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  // Add recurrence_uuid for recurrence updates
  if ( props.workOrder?.recurrence_uuid ) {
    basePayload.recurrence_uuid = props.workOrder.recurrence_uuid
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

    // Ensure recurrence settings are properly populated
    const formattedStartDate = toUtcIso( form.start_date )
    const formattedEndDate = toUtcIso( form.end_date )

    if ( form.recurrence_setting_request ) {
      if ( !form.recurrence_setting_request.start_date_time && formattedStartDate ) {
        form.recurrence_setting_request.start_date_time = formattedStartDate
      }
      if ( !form.recurrence_setting_request.end_date_time && formattedEndDate ) {
        form.recurrence_setting_request.end_date_time = formattedEndDate
      }
    }

    // Create the update payload using our enhanced payload creation function
    const updatePayload = createWorkOrderPayload()

    // Apply transformation for logging and debugging
    const finalPayload = transformPayload( updatePayload, 'workOrderUpdate' )

    // Determine API endpoint based on work order type
    let response
    const hasRecurrenceUuid = props.workOrder?.recurrence_uuid && props.workOrder.recurrence_uuid.trim() !== ''
    const isDoesNotRepeat = props.workOrder?.recurrence_type?.id === 1
    const isRecurrenceWorkOrder = hasRecurrenceUuid && !isDoesNotRepeat

    if ( isRecurrenceWorkOrder ) {
      // Update all work orders in this recurrence
      response = await updateRecurrenceWorkOrders( finalPayload )
    } else {
      // Update individual work order (includes "Does not repeat" cases)
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
    loading.value = false
  } finally {
    loading.value = false
  }
}

// Handle hydrating form from draft store - Enhanced for better context handling
const hydrateFormFromDraft = () => {
  if ( !workOrderDraftStore.hasDraft ) {
    return
  }

  // Be more permissive about context - if we have a draft and we're in WorkOrderEdit, use it
  if ( !workOrderDraftStore.isEditMode && workOrderDraftStore.currentContext !== null ) {
    workOrderDraftStore.setContext( 'edit' )
  }

  isHydratingForm = true

  // Get tasks from draft store
  const draftTasks = workOrderDraftStore.draftForm?.tasks || []
  const draftStandards = workOrderDraftStore.draftForm?.standards || []

  let addedCount = 0
  let updatedCount = 0

  // Process tasks from draft - completely replace the array to ensure reactivity
  if ( draftTasks.length > 0 ) {
    const newTasksArray = []

    // Start with existing tasks
    form.tasks.forEach( existingTask => {
      const taskId = getTaskIdentifier( existingTask )
      const draftUpdate = draftTasks.find( draftTask => getTaskIdentifier( draftTask ) === taskId )

      if ( draftUpdate ) {
        // Task was updated in draft
        newTasksArray.push( {
          ...draftUpdate,
          isFromEdit : true
        } )
        updatedCount++
      } else {
        // Task wasn't modified in draft, keep original
        newTasksArray.push( existingTask )
      }
    } )

    // Add completely new tasks from draft
    draftTasks.forEach( draftTask => {
      const draftId = getTaskIdentifier( draftTask )
      const alreadyExists = form.tasks.some( task => getTaskIdentifier( task ) === draftId )

      if ( !alreadyExists ) {
        newTasksArray.push( {
          ...draftTask,
          isFromEdit : true
        } )
        addedCount++
      }
    } )

    // Replace the entire array to trigger Vue reactivity
    form.tasks.splice( 0, form.tasks.length, ...newTasksArray )
  }

  // Process standards from draft - completely replace the array to ensure reactivity
  if ( draftStandards.length > 0 ) {
    const newStandardsArray = []

    // Start with existing standards
    form.standards.forEach( existingStandard => {
      const standardId = getStandardIdentifier( existingStandard )
      const draftUpdate = draftStandards.find( draftStandard => getStandardIdentifier( draftStandard ) === standardId )

      if ( draftUpdate ) {
        newStandardsArray.push( draftUpdate )
      } else {
        newStandardsArray.push( existingStandard )
      }
    } )

    // Add completely new standards from draft
    draftStandards.forEach( draftStandard => {
      const draftId = getStandardIdentifier( draftStandard )
      const alreadyExists = form.standards.some( standard => getStandardIdentifier( standard ) === draftId )

      if ( !alreadyExists ) {
        newStandardsArray.push( draftStandard )
      }
    } )

    // Replace the entire array to trigger Vue reactivity
    form.standards.splice( 0, form.standards.length, ...newStandardsArray )
  }

  // Ensure categories are decorated
  decorateTasksCategories( form.tasks )

  // Sync form data
  syncFormData()

  // Force Vue reactivity update and UI refresh
  nextTick( () => {
    // Force re-render of both tasks and standards sections by triggering reactivity
    if ( form.tasks.length > 0 ) {
      // Create a completely new array reference to trigger Vue reactivity
      const updatedTasks = [...form.tasks]
      form.tasks.splice( 0, form.tasks.length, ...updatedTasks )
    }

    if ( form.standards.length > 0 ) {
      // Same for standards
      const updatedStandards = [...form.standards]
      form.standards.splice( 0, form.standards.length, ...updatedStandards )
    }

    // Force a full form reactivity update by triggering the watch
    syncFormData()

    // Mark that we've successfully hydrated from draft
    hasHydratedFromDraft.value = true
  } )

  // Restore original task/standard tracking from draft store if available
  if ( workOrderDraftStore.originalTasks && workOrderDraftStore.originalTasks.length > 0 ) {
    originalTasks.value = clonePayload( workOrderDraftStore.originalTasks )
  }
  if ( workOrderDraftStore.originalStandards && workOrderDraftStore.originalStandards.length > 0 ) {
    originalStandards.value = clonePayload( workOrderDraftStore.originalStandards )
  }

  // Don't clear the draft immediately - let the UI render first
  // This will be cleared after the next tick to ensure Vue has processed the changes
  nextTick( () => {
    isHydratingForm = false

    // Wait for Vue to process reactivity updates before clearing draft
    setTimeout( () => {
      workOrderDraftStore.clearDraft()
      workOrderDraftStore.clearReturnContext()
      // Reset the hydration flag after a successful draft clear
      hasHydratedFromDraft.value = false
    }, 100 )
  } )
}

// Initialize component
onMounted( async() => {
  // Set edit mode context before loading any data
  workOrderDraftStore.setEditModeData( props.workOrder )

  await loadFormData()

  // Use nextTick and small delay to ensure draft store is ready
  // This handles the case where we're returning from designer
  nextTick( () => {
    setTimeout( () => {
      // Hydrate form from draft store (this handles tasks from library designer)
      hydrateFormFromDraft()
    }, 150 ) // Slightly longer delay than TodoView context clearing
  } )
} )

// Watch for work order prop changes - but avoid overriding hydrated data
watch(
  () => props.workOrder,
  newWorkOrder => {
    if ( newWorkOrder ) {
      // Check hydration state more reliably
      const workOrderChanged = newWorkOrder.id !== form.workOrderId
      const hasDraftData = workOrderDraftStore.hasDraft
      const hasRecentlyHydrated = hasHydratedFromDraft.value

      // Only populate from work order if:
      // 1. Work order actually changed, OR
      // 2. We haven't recently hydrated from draft AND there's no draft data
      if ( workOrderChanged || ( !hasRecentlyHydrated && !hasDraftData ) ) {
        // Store the work order ID to detect changes
        form.workOrderId = newWorkOrder.id
        populateFormFromWorkOrder( newWorkOrder )
      } else {
        console.log( 'WorkOrderEdit: Skipping populateFormFromWorkOrder - preserving hydrated/draft state' )
      }
    }
  },
  { immediate : true }
)

// Watch for draft store changes - rehydrate when draft becomes available
watch(
  () => workOrderDraftStore.hasDraft,
  hasDraft => {
    if ( hasDraft && workOrderDraftStore.isEditMode ) {
      hydrateFormFromDraft()
    }
  }
)

// Watch route query for returned standalone taskData
const applyStandaloneTaskReturn = returnedTaskData => {
  const taskIdCandidates = new Set()
  if ( returnedTaskData.id != null ) taskIdCandidates.add( String( returnedTaskData.id ) )
  if ( returnedTaskData.task_id != null ) taskIdCandidates.add( String( returnedTaskData.task_id ) )

  const taskIndex = form.tasks.findIndex( task => {
    const existingCandidates = getTaskIdentityCandidates( task ).map( normalizeIdentifier ).filter( Boolean )
    return existingCandidates.some( candidate => taskIdCandidates.has( candidate ) )
  } )

  if ( taskIndex === -1 ) {
    ElMessage.warning( 'Could not find task to update' )
    return
  }

  const existingTask = form.tasks[taskIndex]
  const updatedStepsSource = Array.isArray( returnedTaskData.steps ) && returnedTaskData.steps.length > 0
    ? clonePayload( returnedTaskData.steps )
    : Array.isArray( returnedTaskData.payload?.steps ) && returnedTaskData.payload.steps.length > 0
      ? clonePayload( returnedTaskData.payload.steps )
      : existingTask.steps

  const mergedTask = {
    ...existingTask,
    ...returnedTaskData,
    id : existingTask.id
  }

  if ( updatedStepsSource ) {
    mergedTask.steps = clonePayload( updatedStepsSource )
  }

  if ( returnedTaskData.payload ) {
    mergedTask.payload = {
      ...( existingTask.payload || {} ),
      ...returnedTaskData.payload,
      steps : clonePayload( returnedTaskData.payload.steps || updatedStepsSource || existingTask.payload?.steps || [] )
    }
  } else {
    const fallbackPayloadSteps = updatedStepsSource || existingTask.payload?.steps || []
    mergedTask.payload = {
      ...( existingTask.payload || {} ),
      name : mergedTask.name ?? existingTask.payload?.name,
      description : mergedTask.description ?? existingTask.payload?.description,
      steps : clonePayload( fallbackPayloadSteps )
    }
  }

  mergedTask.__hasLocalEdits = true
  mergedTask.__entryStepsLoaded = true

  form.tasks.splice( taskIndex, 1, mergedTask )
  decorateTaskCategory( form.tasks[taskIndex] )
  syncFormData()

  ElMessage.success( `Task "${returnedTaskData.name || 'Unnamed'}" updated` )
}

watch(
  () => route.query.taskData,
  taskDataJSON => {
    if ( !taskDataJSON ) return
    try {
      const returnedTaskData = JSON.parse( taskDataJSON )
      applyStandaloneTaskReturn( returnedTaskData )
    } catch ( error ) {
      ElMessage.error( 'Failed to process returned task data' )
    } finally {
      router.replace( {
        query : {
          ...route.query,
          taskData : undefined,
          taskId : undefined,
          shouldFetchEntry : undefined,
          taskEntryId : undefined
        }
      } )
    }
  },
  { immediate : true }
)

watch(
  () => route.query.taskDataKey,
  taskDataKey => {
    if ( !taskDataKey ) return
    try {
      const stored = sessionStorage.getItem( taskDataKey )
      if ( stored ) {
        const returnedTaskData = JSON.parse( stored )
        sessionStorage.removeItem( taskDataKey )
        applyStandaloneTaskReturn( returnedTaskData )
      } else {
        console.warn( 'WorkOrderEdit: No session data found for key', taskDataKey )
      }
    } catch ( error ) {
      ElMessage.error( 'Failed to process returned task data' )
    } finally {
      router.replace( {
        query : {
          ...route.query,
          taskDataKey : undefined,
          taskId : undefined,
          shouldFetchEntry : undefined,
          taskEntryId : undefined
        }
      } )
    }
  },
  { immediate : true }
)

// Handle keep-alive component reactivation
onActivated( () => {
  // Re-hydrate if there's a draft available
  if ( workOrderDraftStore.hasDraft && workOrderDraftStore.isEditMode ) {
    hydrateFormFromDraft()
  }

  // Re-register template update listener in case it was lost
  taskLibraryStore.addTemplateUpdateListener( handleTemplateUpdate )
} )
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

  .task-actions,
  .standards-actions {
    display: flex;
    gap: 5px;
  }
}

.tasks-container,
.standards-container {
  margin-top: 16px;
  min-height: 120px;
  flex: 1;

  &.no-tasks,
  &.no-standards {
    .empty-tasks,
    .empty-standards {
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

.tasks-list,
.standards-list {
  display: flex;
  flex-direction: column;
}

.task-card,
.standard-card {
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
.work-order-edit-enhanced {
  .form-actions-fixed {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);
    padding: 10px 24px;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);

    .form-actions-content {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .update-button {
        min-width: 120px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
      }
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

.preview-content {
  min-height: 200px;
}

.preview-empty {
  padding: 16px;
  text-align: center;
  color: var(--el-text-color-secondary);
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
          .overview-card,
          .description-card {
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

  .form-actions-fixed {
    padding: 12px 16px;

    .form-actions-content {
      gap: 8px;

      .update-button {
        padding: 10px 16px;
        font-size: 14px;
        min-width: 100px;
      }
    }
  }
}

/* Task Assignee Dialog Styles (matching tools dialog pattern) */
.assignee-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
}

.search-section {
  margin-bottom: 8px;
}

.selected-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selected-section h4,
.available-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.selected-section-header h4 {
  margin: 0;
}

.clear-all-btn {
  color: #f56c6c;
  font-size: 12px;
  padding: 4px 8px;
}

.clear-all-btn:hover {
  color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
}

.selected-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.selected-user-tag {
  margin: 0;
}

.user-email {
  opacity: 0.7;
  font-size: 11px;
}

.available-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.empty-users {
  text-align: center;
  padding: 40px 20px;
}

.users-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  max-height: 300px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-item:last-child {
  border-bottom: none;
}

.user-item:hover {
  background: #f5f7fa;
}

.user-item.selected {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.user-item .user-email {
  font-size: 12px;
  color: #606266;
}

.user-actions {
  margin-left: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

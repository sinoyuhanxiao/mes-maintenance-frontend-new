<template>
  <div class="work-order-create-enhanced">
    <!-- Create Header -->
    <div class="create-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <h2 class="create-title">
              {{ isRecreation ? 'Recreate Failed Work Order' : $t('workOrder.newWorkOrder') }}
            </h2>
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
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="create-form" v-loading="loading">
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

      <!-- Assignees -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.create.assignTo')" prop="assignee_ids">
          <el-select
            v-model="form.assignee_ids"
            :placeholder="$t('workOrder.create.assigneePlaceholder')"
            filterable
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="assignee in assigneeOptions"
              :key="assignee.id"
              :label="assignee.name"
              :value="assignee.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Approval Template Tree Select -->
      <div class="form-section">
        <el-form-item :label="$t('workOrder.form.approvalTemplate')" prop="approval_id">
          <el-tree-select
            v-model="form.approval_id"
            :data="approvalTreeData"
            :props="approvalTreeProps"
            :placeholder="$t('workOrder.placeholder.selectApprovalTemplate')"
            check-strictly
            :render-after-expand="false"
            filterable
            clearable
            default-expand-all
            style="width: 100%"
          />
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
                <p>Add your first task to start building the work order</p>
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
                :is-recreation="isRecreation"
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
                <p>Add your first standard to ensure work order compliance</p>
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
          v-model:start-date="form.start_date"
          v-model:due-date="form.due_date"
          v-model:recurrence-setting="form.recurrence_setting"
          :work-order-start-date="form.recurrence_setting?.start_date_time || form.start_date"
          :work-order-due-date="form.recurrence_setting?.end_date_time || form.due_date"
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
            @update:removedExistingImages="handleRemovedExistingImages"
            @update:removedExistingFiles="handleRemovedExistingFiles"
            :existing-image-list="existingImages"
            :existing-file-list="existingFiles"
            :image-label="$t('workOrder.create.imageUpload')"
            :file-label="$t('workOrder.create.fileUpload')"
            upload-type="both"
            :max-images="5"
            :max-files="10"
          />
        </div>
      </div>

      <!-- Add Task Dialog -->
      <el-dialog
        v-model="showAddTaskDialog"
        title="Add New Task"
        width="700px"
        :before-close="handleCloseAddTaskDialog"
        top="5vh"
      >
        <AddTask v-if="showAddTaskDialog" @close="closeAddTaskDialog" @add-templates="onAddTaskTemplates" />
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
        :is-work-order-context="true"
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
                    <el-empty description="No standard rules defined yet" :image-size="60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--        <template #footer>-->
        <!--          <div class="standard-dialog-footer">-->
        <!--            <div class="footer-actions">-->
        <!--              <el-button @click="showStandardPreviewDialog = false">Close</el-button>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </template>-->
      </el-dialog>

      <!-- Submit Button - Fixed at bottom -->
      <div class="form-actions-fixed">
        <div class="form-actions-content">
          <el-button type="default" @click="handleCancel" class="cancel-button">
            {{ $t('workOrder.actions.cancel') }}
          </el-button>
          <el-button
            v-show="true"
            type="info"
            @click="logCurrentPayload"
            class="logs-button"
            :loading="isLoggingInProgress"
            :disabled="isLoggingInProgress"
          >
            {{ isLoggingInProgress ? 'Loading...' : 'Logs' }}
          </el-button>
          <el-button type="primary" @click="submitForm" :loading="loading" class="create-button">
            {{ $t('workOrder.actions.create') }}
          </el-button>
        </div>
      </div>
    </el-form>

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
      title="Work Order Payload"
      subtitle="Click 'Logs' to refresh"
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
import { searchUsers } from '@/api/user.js'
import {
  getAllWorkTypes,
  getAllPriorities,
  getAllCategories,
  getAllStates,
  getEquipmentNodeTrees,
  createWorkOrder
} from '@/api/work-order'
import { searchApprovalTree } from '@/api/approval'
import { approveMaintenanceRequest } from '@/api/maintenance-requests'
import { transformEquipmentTree } from '@/utils/equipmentTreeTransform'
import { useRouter, useRoute } from 'vue-router'
import { useTaskLibraryStore } from '@/store/modules/taskLibrary'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'
import { createEmptyWorkOrderForm, cloneWorkOrderForm } from './workOrderFormDefaults'
import { DEFAULT_TASK_STATE, buildDisplayTaskFromTemplate } from './taskPayloadHelpers'
import {
  formatDateTimeForPicker,
  withDefaultTime,
  toLocalIso,
  normalizeDateFields,
  extractWorkOrderDates
} from '@/components/WorkOrder/utils/dateFormatter'

// File tracking refs for recreation flow (matching WorkOrderEdit pattern)
const existingImages = ref( [] )
const existingFiles = ref( [] )
const newImages = ref( [] )
const newFiles = ref( [] )
const newImageUrls = ref( [] )
const newFileUrls = ref( [] )
const removedImageUrls = ref( [] )
const removedFileUrls = ref( [] )

const showAddTaskDialog = ref( false )
const showAddStandardDialog = ref( false )
const showEditStandardDialog = ref( false )
const editingStandard = ref( null )

// Task assignee dialog state
const showTaskAssigneeDialog = ref( false )
const currentEditingTask = ref( null )
const userSearchQuery = ref( '' )
const localSelectedTaskAssignees = ref( [] )

// Preview dialog state
const showTaskPreviewDialog = ref( false )
const showStandardPreviewDialog = ref( false )
const previewTaskTemplateId = ref( null )
const previewTaskData = ref( null )
const previewStandardData = ref( null )
const isTaskInteractive = ref( false )
const standalonePreviewTab = ref( 'general' )

// Centralized payload logging
const { currentPayload, showJsonDisplayer } = usePayloadLogger()

const handleAddStandard = () => {
  showAddStandardDialog.value = true
}

const closeAddStandardDialog = () => {
  showAddStandardDialog.value = false
}

const handleAddTask = () => {
  showAddTaskDialog.value = true
}

// Remove unused CardTable variables - tasks and standards now use direct card stacking

const closeAddTaskDialog = () => {
  showAddTaskDialog.value = false
}

const handleTaskAction = ( { id, action, data } ) => {
  if ( action === 'edit' ) {
    handleEditTask( data )
  } else if ( action === 'preview' ) {
    handlePreviewTask( data )
  } else if ( action === 'delete' ) {
    form.tasks = form.tasks.filter( t => t.id !== id )
    syncTaskPayloads()
    ElMessage.success( `Task "${data.name}" removed` )
  }
}

const handleTaskAssigneeUpdate = ( { taskId, assigneeIds, taskData } ) => {
  const taskIndex = form.tasks.findIndex( t => t.id === taskId )
  if ( taskIndex === -1 ) {
    ElMessage.error( 'Task not found' )
    return
  }

  // Update the task's assignee_ids in both the display data and payload
  form.tasks[taskIndex].assignee_ids = assigneeIds
  if ( form.tasks[taskIndex].payload ) {
    form.tasks[taskIndex].payload.assignee_ids = assigneeIds
  }

  // Sync the payload to ensure it's included in the API call
  syncTaskPayloads()

  // Show success message
  const assigneeNames = assigneeOptions.value
    .filter( user => assigneeIds.includes( user.id ) )
    .map( user => user.name )
    .join( ', ' )

  const message =
    assigneeIds.length === 0
      ? `Removed all assignees from "${taskData.name}"`
      : `Updated assignees for "${taskData.name}": ${assigneeNames}`
  ElMessage.success( message )
}

// Task assignee dialog methods
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

const handleStandardAction = ( { id, action, data } ) => {
  if ( action === 'edit' ) {
    editingStandard.value = data
    showEditStandardDialog.value = true
  } else if ( action === 'preview' ) {
    handlePreviewStandard( data )
  } else if ( action === 'delete' ) {
    form.standards = form.standards.filter( s => s.id !== id )
    syncStandards()
    ElMessage.success( `Standard "${data.name}" removed` )
  }
}

const onStandardUpdate = updatedStandard => {
  const index = form.standards.findIndex( s => s.id === updatedStandard.id )
  if ( index !== -1 ) {
    form.standards.splice( index, 1, updatedStandard )
    syncStandards()
  }
}

const handleCloseAddTaskDialog = done => {
  done()
}

const onAddTaskTemplates = selectedTemplates => {
  if ( !selectedTemplates || selectedTemplates.length === 0 ) {
    return
  }

  const newTasks = selectedTemplates.map( template => buildDisplayTaskFromTemplate( template ) )
  form.tasks.push( ...newTasks )
  decorateTasksCategories( newTasks )
  syncTaskPayloads()

  ElMessage.success(
    `${selectedTemplates.length} task template${selectedTemplates.length > 1 ? 's' : ''} added successfully`
  )

  closeAddTaskDialog()
}

const handleDeleteAllTasks = () => {
  if ( form.tasks.length === 0 ) {
    ElMessage.warning( 'No tasks selected to delete' )
    return
  }

  ElMessageBox.confirm(
    `Are you sure you want to clear all ${form.tasks.length} task${form.tasks.length > 1 ? 's' : ''}?`,
    'Confirm Clear All Tasks',
    {
      confirmButtonText : 'Clear All',
      cancelButtonText : 'Cancel',
      type : 'warning'
    }
  )
    .then( () => {
      form.tasks = []
      syncTaskPayloads()
      ElMessage.success( 'All task selections cleared' )
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}

const onAddStandards = selectedStandards => {
  if ( !selectedStandards || selectedStandards.length === 0 ) {
    return
  }

  // Get the highest existing ID to generate new unique IDs
  const maxId =
    form.standards.length > 0
      ? Math.max( ...form.standards.map( standard => ( typeof standard.id === 'number' ? standard.id : 0 ) ) )
      : 0

  // Transform standard data to match work order format
  const newStandards = selectedStandards.map( ( standard, index ) => {
    const newId = maxId + index + 1
    return {
      ...standard,
      id : newId,
      name : standard.name || standard.title,
      items : standard.items || [],
      standardId : standard.id || standard._id
    }
  } )

  // Append to existing standards
  form.standards.push( ...newStandards )
  syncStandards()

  // Show success message
  ElMessage.success( `${selectedStandards.length} standard${selectedStandards.length > 1 ? 's' : ''} added successfully` )

  // Close the dialog
  closeAddStandardDialog()
}

const handleDeleteAllStandards = () => {
  if ( form.standards.length === 0 ) {
    ElMessage.warning( 'No standards selected to delete' )
    return
  }

  ElMessageBox.confirm(
    `Are you sure you want to clear all ${form.standards.length} standard${form.standards.length > 1 ? 's' : ''}?`,
    'Confirm Clear All Standards',
    {
      confirmButtonText : 'Clear All',
      cancelButtonText : 'Cancel',
      type : 'warning'
    }
  )
    .then( () => {
      form.standards = []
      syncStandards()
      ElMessage.success( 'All standard selections cleared' )
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}

const handleCloseAddStandardDialog = done => {
  done()
}

const handlePreviewTask = taskData => {
  // Check if this is an adhoc task with inline steps
  if ( taskData.source === 'adhoc' && taskData.steps ) {
    previewTaskData.value = taskData
    previewTaskTemplateId.value = null
    showTaskPreviewDialog.value = true
    return
  }

  // For template-based tasks, get the template ID
  const templateId = taskData.templateId || taskData.template_id || taskData.id
  if ( !templateId ) {
    ElMessage.warning( 'Cannot preview this task - no template ID found' )
    return
  }

  previewTaskTemplateId.value = templateId
  previewTaskData.value = null
  showTaskPreviewDialog.value = true
}

const handlePreviewStandard = standardData => {
  previewStandardData.value = standardData
  showStandardPreviewDialog.value = true
}

const handleBackToTaskList = () => {
  showTaskPreviewDialog.value = false
  previewTaskTemplateId.value = null
  previewTaskData.value = null
}

const handleCloseTaskPreview = () => {
  handleBackToTaskList()
}

const getPreviewTaskTitle = () => {
  // If we have task data directly (adhoc task), use its name
  if ( previewTaskData.value ) {
    return previewTaskData.value.name || 'Task'
  }

  // If we have a template ID, find the task in our form.tasks array
  if ( !previewTaskTemplateId.value ) return 'Task'
  const task = form.tasks.find( t => ( t.templateId || t.template_id || t.id ) === previewTaskTemplateId.value )
  return task?.name || 'Task'
}

const handleEditTask = async taskData => {
  try {
    loading.value = true

    // Check if we have the original template ID
    const originalTemplateId = taskData.templateId || taskData.template_id

    // Check if this is a standalone task (adhoc source, no template ID)
    const isStandaloneTask = taskData.source === 'adhoc' && !originalTemplateId

    if ( !originalTemplateId && !isStandaloneTask ) {
      ElMessage.warning( 'This task was created specifically for this work order and cannot be edited as a template.' )
      return
    }

    ElMessage.info( 'Opening template editor...' )

    workOrderDraftStore.setReturnRoute( currentRoute.fullPath )
    workOrderDraftStore.setReturnPanel( 'create' )
    workOrderDraftStore.setReturnWorkOrderId( null )
    workOrderDraftStore.setShouldOpenCreatePanel( true )

    if ( isStandaloneTask ) {
      // For standalone tasks, pass the task data directly via query parameters
      await router.push( {
        name : 'TaskDesignerEdit',
        params : { id : 'standalone' }, // Use 'standalone' as a special identifier
        query : {
          fromWorkOrder : 'true',
          workOrderId : form.name || 'New Work Order',
          workOrderName : form.name || 'New Work Order',
          taskId : taskData.id,
          standalone : 'true',
          taskData : JSON.stringify( taskData ), // Pass the full task data
          returnPanel : 'create'
        }
      } )
    } else {
      // Navigate directly to edit the original template with work order context
      await router.push( {
        name : 'TaskDesignerEdit',
        params : { id : originalTemplateId },
        query : {
          fromWorkOrder : 'true',
          workOrderId : form.name || 'New Work Order',
          workOrderName : form.name || 'New Work Order',
          taskId : taskData.id,
          originalTemplateId,
          returnPanel : 'create'
        }
      } )
    }
  } catch ( error ) {
    console.error( 'Failed to open template editor:', error )
    const errorMessage = error.response?.data?.message || error.message || 'Failed to open task editor'
    ElMessage.error( errorMessage )
  } finally {
    loading.value = false
  }
}

// Props
const props = defineProps( {
  initialRequestData : {
    type : Object,
    default : null
  }
} )

// Emits
const emit = defineEmits( ['back-to-detail', 'work-order-created'] )

const { t } = useI18n()
const router = useRouter()
const currentRoute = useRoute()
const taskLibraryStore = useTaskLibraryStore()
const workOrderDraftStore = useWorkOrderDraftStore()

// Template update listener for refreshing tasks when templates are updated
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

  syncTaskPayloads()

  // Show notification that tasks were refreshed
  if ( form.tasks.some( task => task.templateId === templateId || task.template_id === templateId ) ) {
    // ElMessage.success( `Tasks updated with latest template changes: ${updatedTemplate.name}` )
  }
}

// Component mounted
onMounted( () => {
  // Set create mode context before any operations
  workOrderDraftStore.setCreateMode()

  // Only hydrate from draft if we don't have request data to pre-fill
  if ( !props.initialRequestData ) {
    hydrateFormFromDraft()
  }

  loadFormData()

  // If we have request data, pre-fill after form data is loaded
  if ( props.initialRequestData ) {
    nextTick( () => {
      preFillFromRequestData( props.initialRequestData )
    } )
  }

  // Register template update listener
  taskLibraryStore.addTemplateUpdateListener( handleTemplateUpdate )
} )

// Component unmounted - cleanup listener
onBeforeUnmount( () => {
  taskLibraryStore.removeTemplateUpdateListener( handleTemplateUpdate )
} )

// Form data - matching API requirements
const form = reactive( createEmptyWorkOrderForm() )

let isHydratingForm = false

const syncTaskPayloads = () => {
  const mappedPayloads = form.tasks.map( ( task, index ) => {
    const payload = clonePayload( task.payload )
    return payload
  } )

  // Filter: only require payload to exist, steps can be empty array
  form.task_list = mappedPayloads.filter( payload => payload && typeof payload === 'object' )
}

const syncStandards = () => {
  form.standard_list = form.standards.map( s => {
    // eslint-disable-next-line no-unused-vars
    const { id, standardId, ...rest } = s
    if ( s.isStandalone ) {
      return { ...rest, module : 200 }
    } else {
      return { ...rest, standard_id : standardId, module : 200 }
    }
  } )
}

const resolveCategoryMeta = categoryValue => {
  if ( categoryValue && typeof categoryValue === 'object' ) {
    if ( Object.prototype.hasOwnProperty.call( categoryValue, 'name' ) ) {
      return {
        id : categoryValue.id ?? categoryValue.value ?? null,
        name : categoryValue.name ?? categoryValue.label ?? ''
      }
    }
    if ( Object.prototype.hasOwnProperty.call( categoryValue, 'label' ) ) {
      return {
        id : categoryValue.value ?? null,
        name : categoryValue.label ?? ''
      }
    }
  }

  const categoryId = typeof categoryValue === 'number' ? categoryValue : Number.parseInt( categoryValue, 10 )
  if ( Number.isNaN( categoryId ) ) {
    return null
  }

  const match = categoryOptions.value.find( category => category.id === categoryId )
  if ( match ) {
    return {
      id : match.id,
      name : match.name
    }
  }
  return null
}

const decorateTaskCategory = task => {
  if ( !task ) return false

  const payloadCategoryId = task.payload?.category_id ?? task.payload?.categoryId ?? null
  const meta = resolveCategoryMeta( task.category ?? payloadCategoryId )
  let changed = false

  if ( meta ) {
    const needsCategoryUpdate = !task.category || task.category.id !== meta.id || task.category.name !== meta.name
    if ( needsCategoryUpdate ) {
      task.category = { id : meta.id, name : meta.name }
      changed = true
    }

    if ( task.category_name !== meta.name ) {
      task.category_name = meta.name
      changed = true
    }

    if ( task.payload && task.payload.category_id !== meta.id ) {
      task.payload.category_id = meta.id ?? null
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

const hydrateFormFromDraft = () => {
  isHydratingForm = true
  const source = workOrderDraftStore.hasDraft
    ? cloneWorkOrderForm( workOrderDraftStore.draftForm )
    : createEmptyWorkOrderForm()

  normalizeDateFields( source )
  Object.assign( form, source )
  decorateTasksCategories( form.tasks )
  syncTaskPayloads()
  syncStandards()

  nextTick( () => {
    isHydratingForm = false
    workOrderDraftStore.saveContextAwareDraft( form, 'create' )
  } )
}

// Helper function: Create fallback step when task has no steps
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

// Helper function: Build payload from existing task ensuring steps are populated
const buildPayloadFromExistingTask = ( task, workOrderId ) => {
  // PRIORITY 1: Extract steps from task.steps (from API response)
  // This is the primary source when tasks come from handleRecreate in TodoView
  let steps = []
  if ( Array.isArray( task?.steps ) && task.steps.length > 0 ) {
    steps = clonePayload( task.steps )
  } else if ( task?.payload && Array.isArray( task.payload.steps ) && task.payload.steps.length > 0 ) {
    // PRIORITY 2: Fallback to task.payload.steps if available
    steps = clonePayload( task.payload.steps )
  } else {
    // PRIORITY 3: Create fallback step only if no steps found anywhere
    steps = [createFallbackStep()]
    console.warn( '[buildPayloadFromExistingTask] No steps found, using fallback step' )
  }

  // If task has existing payload structure, use it as base
  if ( task && typeof task === 'object' && task.payload && typeof task.payload === 'object' ) {
    const payload = clonePayload( task.payload )

    payload.work_order_id = payload.work_order_id ?? task.work_order_id ?? workOrderId ?? 0
    payload.state = payload.state ?? task.state ?? DEFAULT_TASK_STATE

    // Override steps with extracted steps (ensuring we use the most recent data)
    payload.steps = steps

    if ( !payload.time_estimate_sec || payload.time_estimate_sec <= 0 ) {
      const minutes = task.estimated_minutes ?? task.estimatedMinutes ?? 0
      payload.time_estimate_sec = minutes > 0 ? minutes * 60 : 1800
    }

    return payload
  }

  // Task doesn't have proper payload structure - build from scratch
  const taskState = task?.state
    ? typeof task.state === 'object'
      ? task.state.id || DEFAULT_TASK_STATE
      : task.state
    : DEFAULT_TASK_STATE

  const payload = {
    name : task?.name || task?.task_name || 'Task',
    description : task?.description || '',
    steps,
    time_estimate_sec : task?.time_estimate_sec || 1800,
    attachments : task?.attachments || task?.file_list || [],
    assignee_ids : task?.assignee_ids || [],
    equipment_node_id : task?.equipment_node_id || null,
    location_id : task?.location_id || null,
    category_id : task?.category_id || task?.category?.id || null,
    category_name : task?.category_name || task?.category?.name || '',
    work_order_id : workOrderId ?? 0,
    state : taskState,
    template_id : task?.template_id || null
  }
  return payload
}

// Helper function: Reset step values for recreation
const resetStepValues = step => {
  if ( !step || !step.value ) return step

  const resetStep = { ...step }
  const stepType = step.value.type

  // Reset remarks
  resetStep.value.remarks = ''

  // Reset Images
  resetStep.value.image = []

  // Reset value based on type
  resetStep.value = { ...step.value }

  switch ( stepType ) {
    case 'inspection':
      resetStep.value.value = true
      break
    case 'checkbox':
    case 'boolean':
      resetStep.value.value = false
      break
    case 'numeric':
    case 'number':
      resetStep.value.value = 0
      break
    case 'text':
      resetStep.value.value = ''
      break
    case 'file':
    case 'attachments':
      resetStep.value.value = []
      resetStep.value.file = []
      break
    default:
      resetStep.value.value = ''
  }

  return resetStep
}

// Helper function: Normalize tasks for recreation (similar to WorkOrderEdit pattern)
const normalizeTasksForRecreation = ( taskList, workOrderId ) => {
  if ( !Array.isArray( taskList ) ) return []
  return taskList
    .map( ( task, index ) => {
      if ( !task || typeof task !== 'object' ) {
        console.warn( '[normalizeTasksForRecreation] Invalid task at index', index, ':', task )
        return null
      }

      // Build the payload ensuring steps are populated
      const payload = buildPayloadFromExistingTask( task, workOrderId )

      // Reset step values and task state for recreation
      payload.state = 5 // Reset state from 12 (Failed) to 5 (Ready)
      if ( Array.isArray( payload.steps ) ) {
        payload.steps = payload.steps.map( step => resetStepValues( step ) )
      }

      const category = task.category
        ? clonePayload( task.category )
        : payload.category_name
          ? {
            id : payload.category_id ?? null,
            name : payload.category_name
          }
          : null

      const estimatedMinutes =
        ( task.estimated_minutes ?? task.estimatedMinutes ?? Math.round( ( payload.time_estimate_sec || 0 ) / 60 ) ) || 0

      const displayTask = {
        id : task.id || `recreate-task-${index}`,
        name : payload.name || `Task ${index + 1}`,
        description : payload.description || '',
        category,
        category_name : category?.name || task.category_name || payload.category_name || '',
        estimated_minutes : estimatedMinutes,
        templateId : payload.template_id,
        template_id : payload.template_id,
        steps : payload.steps, // Use steps from payload which are guaranteed to exist
        source : task.source || ( payload.template_id ? 'template' : 'adhoc' ),
        state : payload.state, // Use reset state (5 - Ready)
        payload,
        rawTemplate : task.rawTemplate || task.template || null,
        total_steps : payload.steps?.length ?? 0,
        applicable_assets : Array.isArray( task.applicable_assets )
          ? task.applicable_assets.slice()
          : task.applicable_assets
            ? [String( task.applicable_assets )]
            : []
      }

      return displayTask
    } )
    .filter( Boolean ) // Remove any null entries
}

// Helper function to convert image_list to array
const parseImageList = imageList => {
  if ( !imageList ) return []
  if ( Array.isArray( imageList ) ) return imageList
  if ( typeof imageList === 'string' ) {
    return imageList.split( ',' ).filter( Boolean )
  }
  return []
}

// Pre-fill form from maintenance request data
const preFillFromRequestData = requestData => {
  if ( !requestData ) return
  isHydratingForm = true

  // Pre-fill basic fields (only if not recreation/copy - those are handled below)
  if ( !requestData.isRecreation && !requestData.isCopy ) {
    if ( requestData.name ) {
      form.name = requestData.name
    }

    if ( requestData.description ) {
      form.description = requestData.description
    }
  }

  // Pre-fill equipment (convert single ID to array for tree-select)
  // Handle both equipment_node object and equipment_node_id
  if ( requestData.equipment_node?.id ) {
    form.equipment_node_ids = [requestData.equipment_node.id]
  } else if ( requestData.equipment_node_id ) {
    form.equipment_node_ids = [requestData.equipment_node_id]
  }

  // Pre-fill existing images
  const parsedImages = parseImageList( requestData.image_list )
  if ( parsedImages.length > 0 ) {
    form.existing_image_list = parsedImages
    existingImages.value = parsedImages
  }

  // Pre-fill request_id to link work order with maintenance request
  // Set request_id if:
  // - Not a recreation AND
  // - Either not a copy, OR it's a copy and user wants to keep the link
  // For work orders: use requestData.request.id (the actual request ID)
  // For direct requests: use requestData.id (when creating from a request)
  if ( !requestData.isRecreation && ( !requestData.isCopy || requestData.keepRequestLink ) ) {
    if ( requestData.request?.id ) {
      // Work order with linked request - use the request's ID
      form.request_id = requestData.request.id
    } else if ( requestData.id && !requestData.code ) {
      // Direct request creation (has id but no work order code)
      form.request_id = requestData.id
    }
  }

  // Handle recreation/copy scenario - prefill comprehensive work order data
  if ( requestData.isRecreation || requestData.isCopy ) {
    // Set parent work order ID for linking (only for recreation)
    if ( requestData.isRecreation && requestData.parent_work_order_id ) {
      form.parent_work_order_id = requestData.parent_work_order_id
    }

    // Set state_id to 5 (Ready) for recreated work orders
    form.state_id = 5

    // Prefill priority and work type - handle both object and ID formats
    if ( requestData.priority ) {
      form.priority_id = typeof requestData.priority === 'object' ? requestData.priority.id : requestData.priority
    } else if ( requestData.priority_id ) {
      form.priority_id = requestData.priority_id
    }

    if ( requestData.work_type ) {
      form.work_type_id = typeof requestData.work_type === 'object' ? requestData.work_type.id : requestData.work_type
    } else if ( requestData.work_type_id ) {
      form.work_type_id = requestData.work_type_id
    }

    if ( requestData.approved_by ) {
      form.approved_by_id =
        typeof requestData.approved_by === 'object' ? requestData.approved_by.id : requestData.approved_by
    } else if ( requestData.approved_by_id ) {
      form.approved_by_id = requestData.approved_by_id
    }

    // Handle approval template (same logic as WorkOrderEdit)
    // Check approval_entry.template_id first, then approval_id, convert to String
    const approvalTemplateId = requestData.approval_entry?.template_id || requestData.approval_id
    form.approval_id = approvalTemplateId ? String( approvalTemplateId ) : null

    if ( Array.isArray( requestData.categories ) && requestData.categories.length ) {
      form.category_ids = requestData.categories.map( c => ( typeof c === 'object' ? c.id : c ) )
    } else if ( Array.isArray( requestData.category_list ) && requestData.category_list.length ) {
      form.category_ids = requestData.category_list.map( c => ( typeof c === 'object' ? c.id : c ) )
    } else if ( requestData.category_ids && Array.isArray( requestData.category_ids ) ) {
      form.category_ids = [...requestData.category_ids]
    }

    // Handle equipment nodes
    if ( Array.isArray( requestData.equipment_nodes ) && requestData.equipment_nodes.length ) {
      form.equipment_node_ids = requestData.equipment_nodes.map( e => ( typeof e === 'object' ? e.id : e ) )
    } else if ( requestData.equipment_node_ids && Array.isArray( requestData.equipment_node_ids ) ) {
      form.equipment_node_ids = [...requestData.equipment_node_ids]
    }

    // Handle assignees - check user_list, assignees, and assignee_ids (same logic as WorkOrderEdit)
    if ( Array.isArray( requestData.user_list ) && requestData.user_list.length > 0 ) {
      form.assignee_ids = requestData.user_list.map( u => u.id )
    } else if ( Array.isArray( requestData.assignees ) && requestData.assignees.length > 0 ) {
      form.assignee_ids = requestData.assignees.map( a => ( typeof a === 'object' ? a.id : a ) )
    } else if ( Array.isArray( requestData.assignee_ids ) && requestData.assignee_ids.length > 0 ) {
      form.assignee_ids = [...requestData.assignee_ids]
    }

    // Handle vendors
    if ( requestData.vendor_ids && Array.isArray( requestData.vendor_ids ) ) {
      form.vendor_ids = [...requestData.vendor_ids]
    }

    // Prefill dates - extract both basic dates and recurrence datetime fields
    const dates = extractWorkOrderDates( requestData )
    form.start_date = dates.start_date
    form.due_date = dates.due_date
    form.end_date = dates.end_date

    // Prefill recurrence settings
    // Extract recurrence_type_id from either recurrence_type_id field or recurrence_type.id
    const recurrenceTypeId = requestData.recurrence_type_id || requestData.recurrence_type?.id
    if ( recurrenceTypeId ) {
      form.recurrence_type_id = recurrenceTypeId
      form.recurrence_type = recurrenceTypeId
    }

    const recurrenceSettingSource =
      requestData.recurrence_setting && typeof requestData.recurrence_setting === 'object'
        ? { ...requestData.recurrence_setting }
        : {}

    const recurrenceRequestSource =
      requestData.recurrence_setting_request && typeof requestData.recurrence_setting_request === 'object'
        ? { ...requestData.recurrence_setting_request }
        : {}

    // Extract recurrence datetime fields - prioritize extracted values from dates object
    // For "Does not repeat" work orders, the datetime is in main start_date/end_date fields
    // Check if recurrence_type is "none" (id=1) and extract datetime from main fields
    const isNonRecurring = requestData.recurrence_type_id === 1 || requestData.recurrence_type?.id === 1

    let rawStartDateTime =
      dates.recurrence_start_date_time ||
      requestData.recurrence_setting_request?.start_date_time ||
      requestData.recurrence_setting?.start_date_time

    let rawEndDateTime =
      dates.recurrence_end_date_time ||
      requestData.recurrence_setting_request?.end_date_time ||
      requestData.recurrence_setting?.end_date_time

    // Fallback: For non-recurring work orders, extract datetime from main start_date/end_date
    if ( isNonRecurring && !rawStartDateTime && requestData.start_date ) {
      rawStartDateTime = formatDateTimeForPicker( requestData.start_date )
    }

    if ( isNonRecurring && !rawEndDateTime ) {
      const endSource = requestData.due_date || requestData.end_date
      if ( endSource ) {
        rawEndDateTime = formatDateTimeForPicker( endSource )
      }
    }

    // Format for display (already formatted by extractWorkOrderDates if present)
    const displayStartDateTime = rawStartDateTime
    const displayEndDateTime = rawEndDateTime

    const requestStartDateTime = rawStartDateTime ? withDefaultTime( rawStartDateTime, '00:00:00' ) : null
    const requestEndDateTime = rawEndDateTime ? withDefaultTime( rawEndDateTime, '23:59:59' ) : null

    if ( displayStartDateTime ) {
      recurrenceSettingSource.start_date_time = displayStartDateTime
    }
    if ( displayEndDateTime ) {
      recurrenceSettingSource.end_date_time = displayEndDateTime
    }

    if ( requestStartDateTime ) {
      recurrenceRequestSource.start_date_time = requestStartDateTime
    } else {
      delete recurrenceRequestSource.start_date_time
    }

    if ( requestEndDateTime ) {
      recurrenceRequestSource.end_date_time = requestEndDateTime
    } else {
      delete recurrenceRequestSource.end_date_time
    }

    // Calculate duration_minutes based on start and end datetime (same logic as RecurrenceEditor)
    if ( rawStartDateTime && rawEndDateTime ) {
      const start = new Date( rawStartDateTime )
      const end = new Date( rawEndDateTime )
      const diffMs = end - start
      const minutes = Math.ceil( diffMs / ( 1000 * 60 ) )
      recurrenceSettingSource.duration_minutes = minutes > 0 ? minutes : 0
      recurrenceRequestSource.duration_minutes = minutes > 0 ? minutes : 0
    } else if ( requestData.recurrence_setting?.duration_minutes ) {
      // Fallback: use existing duration_minutes if available
      recurrenceSettingSource.duration_minutes = requestData.recurrence_setting.duration_minutes
      recurrenceRequestSource.duration_minutes = requestData.recurrence_setting.duration_minutes
    }

    form.recurrence_setting = recurrenceSettingSource
    form.recurrence_setting_request = recurrenceRequestSource

    // Prefill tasks - support both tasks and task_list
    const sourceTasks =
      Array.isArray( requestData.tasks ) && requestData.tasks.length > 0
        ? requestData.tasks
        : Array.isArray( requestData.task_list ) && requestData.task_list.length > 0
          ? requestData.task_list
          : []

    if ( sourceTasks.length > 0 ) {
      // Use normalization function to ensure tasks have proper structure with steps
      form.tasks = normalizeTasksForRecreation( sourceTasks, requestData.parent_work_order_id || requestData.id )
    }

    // Prefill standards - support both standards and standard_list
    const sourceStandards =
      Array.isArray( requestData.standards ) && requestData.standards.length > 0
        ? requestData.standards
        : Array.isArray( requestData.standard_list ) && requestData.standard_list.length > 0
          ? requestData.standard_list
          : []

    if ( sourceStandards.length > 0 ) {
      form.standards = sourceStandards.map( standard => ( { ...standard } ) )
    }

    // Prefill images and files using reactive refs (matching WorkOrderEdit pattern)
    // Set BOTH form fields (for payload) and refs (for component display)
    if ( requestData.image_list && Array.isArray( requestData.image_list ) ) {
      const parsedImages = parseImageList( requestData.image_list )

      // Set form fields for payload (so preview/logging shows correct data)
      form.image_list = parsedImages
      form.existing_image_list = parsedImages

      // Set refs for FileUploadMultiple component
      existingImages.value = parsedImages
    }

    if ( requestData.file_list && Array.isArray( requestData.file_list ) ) {
      // Set form field for payload (so preview/logging shows correct data)
      form.file_list = [...requestData.file_list]

      // Set ref for FileUploadMultiple component
      existingFiles.value = [...requestData.file_list]
    }

    // Apply name and description formatting based on operation type
    if ( requestData.isRecreation ) {
      // Recreate: Add "Work Order Failed:" prefix to name and description
      if ( requestData.name ) {
        const prefix = 'Work Order Failed: '
        form.name = prefix + requestData.name
      }
      if ( requestData.description ) {
        const prefix = 'Work Order Failed: '
        form.description = prefix + requestData.description
      }
    } else if ( requestData.isCopy ) {
      // Copy: Add " (Copy)" suffix to name only
      if ( requestData.name ) {
        const suffix = ' (Copy)'
        form.name = requestData.name + suffix
      }
      if ( requestData.description ) {
        form.description = requestData.description
      }
    }

    syncTaskPayloads()
    syncStandards()
  }

  nextTick( () => {
    isHydratingForm = false
  } )
}

// Watch for initialRequestData changes and pre-fill form
// Note: Initial pre-fill is handled in onMounted after loadFormData
watch(
  () => props.initialRequestData,
  newRequestData => {
    if ( newRequestData ) {
      preFillFromRequestData( newRequestData )
    }
  }
)

watch(
  () => form.tasks,
  () => {
    if ( isHydratingForm ) return
    decorateTasksCategories( form.tasks )
    syncTaskPayloads()
  },
  { deep : true }
)

watch(
  () => form.standards,
  () => {
    if ( isHydratingForm ) return
    syncStandards()
  },
  { deep : true }
)

watch(
  form,
  () => {
    if ( isHydratingForm ) return
    workOrderDraftStore.saveContextAwareDraft( form, 'create' )
  },
  { deep : true }
)

// Custom validation functions
const validateStartDate = ( rule, value, callback ) => {
  // Only validate if recurrence type is not 'none' (i.e., field is visible)
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1
  if ( isNoneRecurrence ) {
    callback()
    return
  }

  if ( !value ) {
    callback( new Error( 'Start date is required' ) )
    return
  }
  callback()
}

const validateDueDate = ( rule, value, callback ) => {
  // Only validate if recurrence type is not 'none' (i.e., field is visible)
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1
  if ( isNoneRecurrence ) {
    callback()
    return
  }

  if ( !value ) {
    callback( new Error( 'Due date is required' ) )
    return
  }

  const dueDate = new Date( withDefaultTime( value, '23:59:59' ) )
  const startDate = form.start_date ? new Date( withDefaultTime( form.start_date, '00:00:00' ) ) : null

  if ( startDate && dueDate <= startDate ) {
    callback( new Error( 'Due date must be after start date' ) )
    return
  }

  // Check if due date is too far in the future (more than 2 years)
  const now = new Date()
  const twoYearsFromNow = new Date( now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000 )
  if ( dueDate > twoYearsFromNow ) {
    callback( new Error( 'Due date cannot be more than 2 years in the future' ) )
    return
  }

  callback()
}

const validateRecurrenceStartTime = ( rule, value, callback ) => {
  // For 'none' recurrence type, just check if value exists
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1

  if ( isNoneRecurrence ) {
    if ( !value ) {
      callback( new Error( 'Start date time is required' ) )
      return
    }
    callback()
    return
  }

  // For recurring types, skip validation (not used)
  callback()
}

const validateRecurrenceEndTime = ( rule, value, callback ) => {
  // For 'none' recurrence type, validate that end time is after start time
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1

  if ( isNoneRecurrence ) {
    if ( !value ) {
      callback( new Error( 'End date time is required' ) )
      return
    }

    const recurrenceSetting = form.recurrence_setting
    if ( recurrenceSetting && recurrenceSetting.start_date_time ) {
      const startTime = new Date( recurrenceSetting.start_date_time )
      const endTime = new Date( value )

      if ( endTime <= startTime ) {
        callback( new Error( 'End date time must be after start date time' ) )
        return
      }
    }

    callback()
    return
  }

  // For recurring types, skip validation (not used)
  callback()
}

const validateRecurrenceStartTimeOnly = ( rule, value, callback ) => {
  // Only validate for recurring types (not 'none')
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1
  if ( isNoneRecurrence ) {
    callback()
    return
  }

  if ( !value ) {
    callback( new Error( 'Start time is required for recurring work orders' ) )
    return
  }
  callback()
}

const validateRecurrenceEndTimeOnly = ( rule, value, callback ) => {
  // Only validate for recurring types (not 'none')
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1
  if ( isNoneRecurrence ) {
    callback()
    return
  }

  if ( !value ) {
    callback( new Error( 'End time is required for recurring work orders' ) )
    return
  }

  const recurrenceSetting = form.recurrence_setting
  if ( !recurrenceSetting || !recurrenceSetting.start_time ) {
    callback()
    return
  }

  // Parse time strings (format: "HH:mm:ss")
  const startTimeStr = recurrenceSetting.start_time
  const endTimeStr = value

  if ( !startTimeStr || !endTimeStr ) {
    callback()
    return
  }

  // Convert time strings to minutes for comparison
  const parseTimeToMinutes = timeStr => {
    const [hours, minutes] = timeStr.split( ':' ).map( Number )
    return hours * 60 + minutes
  }

  const startMinutes = parseTimeToMinutes( startTimeStr )
  const endMinutes = parseTimeToMinutes( endTimeStr )

  if ( endMinutes <= startMinutes ) {
    callback( new Error( 'End time must be after start time' ) )
    return
  }

  callback()
}

// Validation rules
const rules = reactive( {
  name : [{ required : true, message : t( 'workOrder.validation.taskTitleRequired' ), trigger : 'blur' }],
  category_ids : [{ required : true, message : 'At least one category is required', trigger : 'change' }],
  equipment_node_ids : [{ required : true, message : 'At least one equipment is required', trigger : 'change' }],
  work_type_id : [{ required : true, message : t( 'workOrder.validation.workTypeRequired' ), trigger : 'change' }],
  priority_id : [{ required : true, message : t( 'workOrder.validation.priorityRequired' ), trigger : 'change' }],
  start_date : [{ validator : validateStartDate, trigger : 'change' }],
  due_date : [{ validator : validateDueDate, trigger : 'change' }],
  'recurrence_setting.start_date_time' : [{ validator : validateRecurrenceStartTime, trigger : 'change' }],
  'recurrence_setting.end_date_time' : [{ validator : validateRecurrenceEndTime, trigger : 'change' }],
  'recurrence_setting.start_time' : [{ validator : validateRecurrenceStartTimeOnly, trigger : 'change' }],
  'recurrence_setting.end_time' : [{ validator : validateRecurrenceEndTimeOnly, trigger : 'change' }]
} )

// Tree props for tree selects
const treeProps = {
  children : 'children',
  label : 'label',
  value : 'id'
}

// API data options
const priorityOptions = ref( [] )
const workTypeOptions = ref( [] )
const categoryOptions = ref( [] )
const stateOptions = ref( [] )
const assetTreeData = ref( [] )
const approvalTreeData = ref( [] )
const loading = ref( false )

const assigneeOptions = ref( [] )

const supervisorOptions = ref( [] )
const formRef = ref( null )

// Approval tree props for el-tree-select
const approvalTreeProps = {
  children : 'children',
  label : 'label',
  value : 'id',
  disabled : 'disabled'
}

/**
 * Transform approval tree API response into hierarchical tree structure for el-tree-select
 * Structure: Team > Approval Type > Approval Template (only templates are selectable)
 */
const buildApprovalTree = teams => {
  return teams.map( team => {
    const teamNode = {
      id : `team-${team.id}`,
      label : team.name,
      children : [],
      disabled : true // Teams are not selectable
    }

    if ( team.approval_types && Array.isArray( team.approval_types ) ) {
      teamNode.children = team.approval_types.map( type => {
        const typeNode = {
          id : `type-${type.id}`,
          label : type.approval_type,
          children : [],
          disabled : true // Approval types are not selectable
        }

        if ( type.approval_templates && Array.isArray( type.approval_templates ) ) {
          typeNode.children = type.approval_templates.map( template => ( {
            id : template.id, // Use template.id directly as the value
            label : template.name,
            disabled : false // Templates are selectable (leaf nodes)
          } ) )
        }

        return typeNode
      } )
    }

    return teamNode
  } )
}

// Load data from APIs
const loadFormData = async() => {
  try {
    loading.value = true

    const [workTypesRes, prioritiesRes, categoriesRes, statesRes, equipmentRes, usersRes, approvalRes] =
      await Promise.all( [
        getAllWorkTypes(),
        getAllPriorities(),
        getAllCategories(),
        getAllStates(),
        getEquipmentNodeTrees(),
        searchUsers( { status_ids : [1] }, 1, 1000 ),
        searchApprovalTree( {} )
      ] )

    if ( workTypesRes.data ) {
      workTypeOptions.value = workTypesRes.data
    }

    if ( prioritiesRes.data ) {
      priorityOptions.value = prioritiesRes.data
    }

    // Set user options from API
    if ( usersRes?.data?.content ) {
      const users = usersRes.data.content
      assigneeOptions.value = users.map( user => ( {
        id : user.id,
        name : `${user.first_name} ${user.last_name}`
      } ) )

      // Set supervisor options (same as assignee options)
      supervisorOptions.value = assigneeOptions.value
    }

    if ( categoriesRes.data ) {
      categoryOptions.value = categoriesRes.data
    }

    if ( statesRes.data ) {
      stateOptions.value = statesRes.data
    }

    if ( equipmentRes.data ) {
      // Transform equipment tree to exclude tier 5 (parts layer)
      const rawData = Array.isArray( equipmentRes.data ) ? equipmentRes.data : [equipmentRes.data]
      assetTreeData.value = transformEquipmentTree( rawData )
    }

    // Transform and set approval tree data
    if ( approvalRes.data ) {
      const teams = Array.isArray( approvalRes.data ) ? approvalRes.data : approvalRes.data.data || []
      approvalTreeData.value = buildApprovalTree( teams )
    }

    decorateTasksCategories( form.tasks )
  } catch ( error ) {
    console.error( 'WorkOrderCreate: Failed to load form data:', error )
    // Show specific error message if available
    const errorMessage = error.response?.data?.message || error.message || t( 'workOrder.messages.loadDataFailed' )
    ElMessage.error( errorMessage )

    // Disable form if critical data loading fails
    if ( !workTypeOptions.value.length || !priorityOptions.value.length ) {
      ElMessage.warning( t( 'workOrder.messages.criticalDataMissing' ) )
    }
  } finally {
    loading.value = false
  }
}

// Upload handlers following equipment module pattern
const handleImageListUpdate = images => {
  // Track NEW images separately (File objects from FileUploadMultiple component)
  newImages.value = images
}

const handleFilesListUpdate = files => {
  // Track NEW files separately (File objects from FileUploadMultiple component)
  newFiles.value = files
}

const handleRemovedExistingImages = removedUrls => {
  removedImageUrls.value = removedUrls
}

const handleRemovedExistingFiles = removedUrls => {
  removedFileUrls.value = removedUrls
}

// Upload files to MinIO server
const uploadFilesToServer = async() => {
  try {
    // Upload NEW images if they exist
    if ( newImages.value.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( newImages.value )
      const uploadedImages = imageRes.data.uploadedFiles || []
      newImageUrls.value = uploadedImages.map( file => file.url )
    }

    // Upload NEW files if they exist
    if ( newFiles.value.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( newFiles.value )
      const uploadedFiles = fileRes.data.uploadedFiles || []
      newFileUrls.value = uploadedFiles.map( file => file.url )
    }

    return { newImageUrls : newImageUrls.value, newFileUrls : newFileUrls.value }
  } catch ( error ) {
    console.error( 'File upload failed:', error )
    throw new Error( 'File upload failed' )
  }
}

// Helper function to check if the form has meaningful changes
const hasFormChanges = () =>
  [
    form.name?.trim(),
    form.description?.trim(),
    form.tasks.length,
    form.standards.length,
    form.category_ids?.length,
    form.equipment_node_ids?.length,
    form.assignee_ids?.length,
    form.approved_by_id,
    form.work_type_id,
    form.priority_id,
    form.state_id !== 1,
    form.start_date,
    form.due_date,
    form.vendor_ids?.length,
    form.image_list?.length,
    form.file_list?.length
  ].some( Boolean )

const handleBackToDetail = () => {
  if ( !hasFormChanges() ) {
    // No meaningful changes, just close without confirmation
    emit( 'back-to-detail' )
    return
  }

  ElMessageBox.confirm( 'Are you sure you want to leave the form? All unsaved changes will be lost.', 'Confirm Leave', {
    confirmButtonText : 'Leave',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      // Clear the form
      if ( formRef.value ) {
        formRef.value.resetFields()
      }

      isHydratingForm = true
      Object.assign( form, createEmptyWorkOrderForm() )
      syncTaskPayloads()
      syncStandards()
      workOrderDraftStore.clearDraft()

      nextTick( () => {
        isHydratingForm = false
      } )

      // Close the dialog
      emit( 'back-to-detail' )
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}

const handleCancel = () => {
  if ( !hasFormChanges() ) {
    // No meaningful changes, just close without confirmation
    emit( 'back-to-detail' )
    return
  }

  ElMessageBox.confirm( 'Are you sure you want to leave the form? All unsaved changes will be lost.', 'Confirm Leave', {
    confirmButtonText : 'Leave',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      // Clear the form
      if ( formRef.value ) {
        formRef.value.resetFields()
      }

      isHydratingForm = true
      Object.assign( form, createEmptyWorkOrderForm() )
      syncTaskPayloads()
      syncStandards()
      workOrderDraftStore.clearDraft()

      nextTick( () => {
        isHydratingForm = false
      } )

      // Close the dialog
      emit( 'back-to-detail' )
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}

// Silent form reset (used after successful creation)
const resetFormSilent = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }

  isHydratingForm = true
  Object.assign( form, createEmptyWorkOrderForm() )

  // Reset file tracking refs
  existingImages.value = []
  existingFiles.value = []
  newImages.value = []
  newFiles.value = []
  newImageUrls.value = []
  newFileUrls.value = []
  removedImageUrls.value = []
  removedFileUrls.value = []

  syncTaskPayloads()
  syncStandards()
  workOrderDraftStore.clearDraft()

  nextTick( () => {
    isHydratingForm = false
  } )
}

// User-initiated form reset (shows confirmation dialog)
const resetForm = () => {
  ElMessageBox.confirm( 'Are you sure you want to reset the form? All unsaved changes will be lost.', 'Confirm Reset', {
    confirmButtonText : 'Reset',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      resetFormSilent()
      ElMessage.success( t( 'workOrder.messages.formReset' ) )
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}

// Logs button handler (following JsonDebugDrawer documentation pattern)
const isLoggingInProgress = ref( false )

const logCurrentPayload = () => {
  // Prevent rapid clicking
  if ( isLoggingInProgress.value ) {
    return
  }

  isLoggingInProgress.value = true

  try {
    // Create a snapshot of the current payload (does not mutate form)
    const payloadSnapshot = createWorkOrderPayload()

    // Update the payload ref and show the drawer
    currentPayload.value = payloadSnapshot
    showJsonDisplayer.value = true

    // Optional: Log to console for debugging
    console.log( '[Work Order Payload]', payloadSnapshot )
  } finally {
    // Reset loading state
    setTimeout( () => {
      isLoggingInProgress.value = false
    }, 300 )
  }
}

// Create work order payload using centralized utilities
const createWorkOrderPayload = () => {
  // For 'none' recurrence type, use start_date_time and end_date_time from recurrence_setting_request
  // Otherwise, use start_date and due_date from form
  const isNoneRecurrence = form.recurrence_type_id === 1 || form.recurrence_type === 1

  let formattedStartDate, formattedDueDate

  if ( isNoneRecurrence && form.recurrence_setting_request ) {
    // Copy from recurrence_setting_request for 'none' type, but normalize to UTC
    const startDateWithTime = withDefaultTime( form.recurrence_setting_request.start_date_time, '00:00:00' )
    const endDateWithTime = withDefaultTime( form.recurrence_setting_request.end_date_time, '23:59:59' )
    formattedStartDate = toLocalIso( startDateWithTime )
    formattedDueDate = toLocalIso( endDateWithTime )
  } else {
    // Use form fields for recurring types with default times
    // Start date defaults to 00:00:00, due date defaults to 23:59:59
    const startDateWithTime = withDefaultTime( form.start_date, '00:00:00' )
    const dueDateWithTime = withDefaultTime( form.due_date, '23:59:59' )
    formattedStartDate = toLocalIso( startDateWithTime )
    formattedDueDate = toLocalIso( dueDateWithTime )
  }

  // Create a clean copy of recurrence_setting_request without mutating the original form
  const recurrenceSettingPayload = clonePayload( form.recurrence_setting_request ?? {} )

  if ( isNoneRecurrence ) {
    if ( formattedStartDate ) {
      recurrenceSettingPayload.start_date_time = formattedStartDate
    }
    if ( formattedDueDate ) {
      recurrenceSettingPayload.end_date_time = formattedDueDate
    }
  } else {
    // For recurring types, ensure recurrence_setting_request datetimes are converted to UTC
    if ( recurrenceSettingPayload.start_date_time ) {
      recurrenceSettingPayload.start_date_time = toLocalIso(
        withDefaultTime( recurrenceSettingPayload.start_date_time, '00:00:00' )
      )
    }
    if ( recurrenceSettingPayload.end_date_time ) {
      recurrenceSettingPayload.end_date_time = toLocalIso(
        withDefaultTime( recurrenceSettingPayload.end_date_time, '23:59:59' )
      )
    }
  }

  // Create base payload
  const basePayload = {
    // Required fields (per API docs)
    name : form.name,
    category_ids : form.category_ids,
    priority_id : form.priority_id,
    state_id : form.state_id,
    work_type_id : form.work_type_id,
    start_date : formattedStartDate,
    due_date : formattedDueDate,
    recurrence_setting_request : recurrenceSettingPayload,
    task_list : form.task_list,
    time_zone : form.time_zone,
    equipment_node_ids : form.equipment_node_ids,

    // Optional fields (per API docs)
    description : form.description,
    location_id : form.location_id,
    recurrence_uuid : form.recurrence_uuid,
    halt_type : form.halt_type,
    recurrence_type_id : form.recurrence_type || form.recurrence_type_id || 1,
    approved_by_id : form.approved_by_id,
    approval_id : form.approval_id ?? null,
    assignee_ids : form.assignee_ids || [],
    image_list : form.image_list,
    file_list : form.file_list,
    standard_list : form.standard_list || [],
    request_id : form.request_id,
    parent_work_order_id : form.parent_work_order_id,
    vendor_ids : form.vendor_ids
  }

  // Transform and clean payload using centralized utilities
  const transformed = transformPayload( basePayload, 'workOrderCreate' )

  return transformed
}

const isRecreation = computed( () => {
  return !!form.parent_work_order_id
} )

// Watcher to sync recurrence_type from recurrence_setting
watch(
  () => form.recurrence_setting,
  newVal => {
    // Don't run during form hydration/prefill to avoid overwriting data
    if ( isHydratingForm ) {
      return
    }

    if ( newVal && typeof newVal === 'object' ) {
      // The RecurrenceEditor outputs recurrence_type, map it correctly
      form.recurrence_type = newVal.recurrence_type
      form.recurrence_type_id = newVal.recurrence_type

      // Update the recurrence_setting_request
      // RecurrenceEditor emits start_date_time and end_date_time as already-UTC ISO strings
      // Use them directly without re-conversion to avoid double timezone conversion
      const startDateTime =
        newVal.start_date_time || ( form.start_date ? toLocalIso( withDefaultTime( form.start_date, '00:00:00' ) ) : null )
      const endDateTime =
        newVal.end_date_time || ( form.due_date ? toLocalIso( withDefaultTime( form.due_date, '23:59:59' ) ) : null )

      form.recurrence_setting_request = {
        start_date_time : startDateTime,
        end_date_time : endDateTime,
        month_of_year : newVal.month_of_year,
        day_of_month : newVal.day_of_month,
        days_of_week : newVal.days_of_week,
        interval : newVal.interval,
        duration_minutes : newVal.duration_minutes
      }
    }
  },
  { deep : true }
)

// Watcher to trigger due date validation when start date changes
watch(
  () => form.start_date,
  () => {
    // Re-validate due date when start date changes
    nextTick( () => {
      if ( formRef.value && form.due_date ) {
        formRef.value.validateField( 'due_date' )
      }
      // Also re-validate recurrence start time
      if ( formRef.value && form.recurrence_setting && form.recurrence_setting.start_date_time ) {
        formRef.value.validateField( 'recurrence_setting.start_date_time' )
      }
    } )
  }
)

// Watcher to trigger start date validation when due date changes
watch(
  () => form.due_date,
  () => {
    // Re-validate start date when due date changes
    nextTick( () => {
      if ( formRef.value && form.start_date ) {
        formRef.value.validateField( 'start_date' )
      }
      // Also re-validate recurrence end time when due date changes
      if ( formRef.value && form.recurrence_setting && form.recurrence_setting.end_date_time ) {
        formRef.value.validateField( 'recurrence_setting.end_date_time' )
      }
    } )
  }
)

// Watcher to trigger recurrence validation when recurrence settings change
watch(
  () => form.recurrence_setting,
  newVal => {
    if ( newVal && ( newVal.start_date_time || newVal.end_date_time ) ) {
      nextTick( () => {
        if ( formRef.value ) {
          // Validate both recurrence start and end times
          if ( newVal.start_date_time ) {
            formRef.value.validateField( 'recurrence_setting.start_date_time' )
          }
          if ( newVal.end_date_time ) {
            formRef.value.validateField( 'recurrence_setting.end_date_time' )
          }
        }
      } )
    }
  },
  { deep : true }
)

const submitForm = async() => {
  if ( !formRef.value ) return

  try {
    const valid = await formRef.value.validate()
    if ( !valid ) {
      ElMessage.error( t( 'workOrder.messages.validationFailed' ) )
      return
    }

    loading.value = true

    // Upload NEW files to MinIO first if there are any
    if ( newImages.value.length > 0 || newFiles.value.length > 0 ) {
      await uploadFilesToServer()
    }

    // Combine existing files with newly uploaded files (following WorkOrderEdit pattern)
    let finalImageList = [...( existingImages.value || [] ), ...( newImageUrls.value || [] )]
    let finalFileList = [...( existingFiles.value || [] ), ...( newFileUrls.value || [] )]

    // Filter out removed files
    finalImageList = finalImageList.filter( url => !removedImageUrls.value.includes( url ) )
    finalFileList = finalFileList.filter( url => !removedFileUrls.value.includes( url ) )

    // Update form with final file lists
    form.image_list = finalImageList
    form.file_list = finalFileList

    // Prepare properly formatted local datetime strings for backend
    const formattedStartDate = toLocalIso( withDefaultTime( form.start_date, '00:00:00' ) )
    const formattedDueDate = toLocalIso( withDefaultTime( form.due_date, '23:59:59' ) )

    // Ensure recurrence setting defaults exist
    if ( !form.recurrence_setting_request ) {
      form.recurrence_setting_request = {}
    }

    if ( formattedStartDate ) {
      form.recurrence_setting_request.start_date_time = formattedStartDate
    }
    if ( formattedDueDate ) {
      form.recurrence_setting_request.end_date_time = formattedDueDate
    }

    // Ensure we have a valid recurrence_type (default to 1 if not set)
    const recurrenceType = form.recurrence_type || form.recurrence_type_id || 1

    // Ensure derived lists are up to date
    syncTaskPayloads()
    syncStandards()

    // Ensure tasks exist before submitting
    const taskAddList = Array.isArray( form.task_list ) ? form.task_list : []

    if ( taskAddList.length === 0 ) {
      ElMessage.error( 'Please add at least one task before creating the work order.' )
      loading.value = false
      return
    }

    const normalizedTaskAddList = taskAddList.map( task => {
      const payload = clonePayload( task )
      payload.work_order_id = payload.work_order_id ?? 0
      payload.state = payload.state ?? DEFAULT_TASK_STATE
      payload.time_estimate_sec =
        payload.time_estimate_sec && payload.time_estimate_sec > 0 ? payload.time_estimate_sec : 1800
      payload.steps = Array.isArray( payload.steps ) ? payload.steps : []
      // Ensure assignee_ids is properly set
      payload.assignee_ids = Array.isArray( payload.assignee_ids ) ? payload.assignee_ids : []
      return payload
    } )

    if ( normalizedTaskAddList.some( task => !Array.isArray( task.steps ) || task.steps.length === 0 ) ) {
      ElMessage.error( 'Each task must include at least one step.' )
      loading.value = false
      return
    }

    // Create payload using centralized utilities and include normalized task list
    const basePayload = createWorkOrderPayload()
    const payload = {
      ...basePayload,
      task_list : normalizedTaskAddList,
      recurrence_type : recurrenceType,
      recurrence_type_id : recurrenceType
    }

    // Apply final transformation and cleaning
    const finalPayload = transformPayload( payload, 'workOrderCreate' )

    // Call backend API
    const response = await createWorkOrder( finalPayload )

    // If this work order was created from a maintenance request, approve the request
    if ( finalPayload.request_id ) {
      try {
        await approveMaintenanceRequest( finalPayload.request_id )
        console.log( `Maintenance request ${finalPayload.request_id} approved successfully` )
      } catch ( approvalError ) {
        console.error( 'Failed to approve maintenance request:', approvalError )
        // Don't fail the entire operation if approval fails
        ElMessage.warning( 'Work order created, but failed to approve the maintenance request' )
      }
    }

    // Show success message (only once regardless of how many work orders created)
    ElMessage.success( 'Work order created successfully!' )

    // Emit the created work order event once (use the first work order or the single work order)
    const createdWorkOrders = Array.isArray( response.data ) ? response.data : [response.data]

    // Emit only once with the first work order to trigger a single refresh
    if ( createdWorkOrders.length > 0 ) {
      emit( 'work-order-created', createdWorkOrders[0] )
    }

    // Reset form after successful creation
    resetFormSilent()
  } catch ( error ) {
    console.error( 'Failed to create work order:', error )
    const errorMessage = error.response?.data?.message || error.message || t( 'workOrder.messages.createFailed' )
    ElMessage.error( errorMessage )
  } finally {
    loading.value = false
  }
}

defineExpose( {
  hasFormChanges
} )

defineOptions( {
  name : 'WorkOrderCreate'
} )
</script>

<style scoped lang="scss">
.work-order-create-enhanced {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 0px 24px 0px 24px;
  margin-top: 24px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.create-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;

  .header-main {
    .create-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      .create-info {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

// Form styling
.create-form {
  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  // Task title input
  .task-title-input {
    :deep(.el-input__wrapper) {
      font-size: 16px;
      padding: 12px 16px;
    }
  }

  // Upload section styling
  .upload-section {
    .image-uploader {
      margin-bottom: 20px;

      :deep(.el-upload--picture-card) {
        width: 148px;
        height: 148px;
        border: 2px dashed #cce0ff;
        border-radius: 4px;
        background: var(--el-fill-color-lighter);
      }
    }

    .file-uploader {
      :deep(.el-upload-list) {
        margin-top: 10px;
      }
    }
  }

  // Image preview dialog
  .image-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  // Procedure picker
  .procedure-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    background: var(--el-fill-color-lighter);

    .procedure-placeholder {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: var(--el-color-primary);
      font-size: 14px;

      .el-icon {
        font-size: 18px;
      }
    }
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

  // Task and Standard containers
  .tasks-container,
  .standards-container {
    min-height: 120px;
    flex: 1;
  }

  // Direct card stacking lists
  .tasks-list,
  .standards-list {
    display: flex;
    flex-direction: column;
  }

  // Individual card styling
  .task-card,
  .standard-card {
    width: 100%;
  }

  .tasks-container.no-tasks,
  .standards-container.no-standards {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-tasks,
  .empty-standards {
    text-align: center;
    color: #909399;
  }

  .empty-icon {
    font-size: 64px;
    color: #c0c4cc;
  }

  .empty-content {
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

  // Section header with actions
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      gap: 8px;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }

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

  // Task action buttons
  .task-actions {
    display: flex;
    gap: 5px;
  }

  // Standard action buttons
  .standards-actions {
    display: flex;
    gap: 5px;
  }

  // Estimated time inputs
  .input-label {
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  // Recurrence editor styling
  .recurrence-editor {
    .weekly-interval-selection,
    .weekly-selection,
    .monthly-by-date-selection,
    .yearly-selection {
      margin-top: 15px;
    }

    .repeat-interval {
      display: flex;
      align-items: center;
      gap: 8px;

      span {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .weekly-selection {
      :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  // Form actions - Fixed at bottom of parent container
  .form-actions-fixed {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);
    padding: 10px 24px;
    box-shadow: 0 0px 1px rgba(0, 0, 0, 0.1);

    .form-actions-content {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .create-button,
      .cancel-button {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 500;
        min-width: 120px;
      }
    }
  }
}

:deep(.el-form-item--default) {
  margin-bottom: 18px !important;
}

// Preview Dialog Styles
:deep(.el-dialog.preview-dialog) {
  height: 90vh !important;
  display: flex;
  flex-direction: column;
}

.preview-dialog-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: -16px;
  justify-content: space-evenly;
}

.back-button {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  .el-icon {
    font-size: 16px;
    margin-right: 0;
  }
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
}

// TODO: Responsive adjustments

// Standalone Standard Preview Styles (matching StandardsPreview component)
.standalone-standard-preview {
  padding: 0;
  overflow: visible;

  .standard-details {
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

  .details-tabs {
    height: 100%;

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

    :deep(.el-tabs__item.is-top) {
      font-size: 16px;
      width: 50%;
    }

    :deep(.el-tabs__nav.is-top) {
      width: 100%;
    }
  }

  // Card Components - matching StandardsPreview exactly
  .overview-card,
  .description-card {
    background: white;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .card-header {
    padding: 8px 24px 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .card-content {
    padding: 12px 24px 12px 24px;
  }

  .info-value {
    color: #606266;
    font-weight: 200;
    font-size: 14px;
    text-align: right;
    margin-right: 20px;
  }

  .info-value.highlight {
    color: #409eff;
    font-weight: 600;
  }

  // Description Card
  .description-text {
    color: #303133;
    line-height: 1.7;
    font-size: 14px;
    padding: 16px 16px 16px 0px;
    border-radius: 6px;
    max-height: 32vh;
    overflow-y: auto;
  }

  // Rules List - matching StandardsPreview exactly
  .rules-list {
    margin-bottom: 24px;
  }

  .rules-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 24px 24px 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .rule-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.3s ease;
  }

  .rule-item:hover {
    border-color: #409eff;
    background: #f0f7ff;
  }

  .rule-number {
    width: 23px;
    height: 23px;
    background: #409eff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .rule-content {
    flex: 1;
    margin-right: 12px;
  }

  .rule-text {
    color: #303133;
    line-height: 1.6;
    font-size: 14px;
  }

  .empty-rules {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

  // Tab styling matching StandardsPreview
  :deep(.el-tabs__item.is-top) {
    font-size: 16px;
    width: 50%;
  }

  :deep(.el-tabs__nav.is-top) {
    width: 100%;
  }

  // Custom scrollbar for rules container only
  .rules-container::-webkit-scrollbar {
    width: 6px;
  }

  .rules-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .rules-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .rules-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  // Custom scrollbar for description text
  .description-text::-webkit-scrollbar {
    width: 6px;
  }

  .description-text::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .description-text::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .description-text::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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

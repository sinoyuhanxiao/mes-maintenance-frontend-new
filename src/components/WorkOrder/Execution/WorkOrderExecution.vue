<template>
  <div class="work-order-execution">
    <header class="execution-header">
      <div>
        <h2>Execute Work Order Tasks</h2>
        <p class="subtitle">
          {{ workOrder?.description || 'Review steps and submit progress' }}
        </p>
      </div>
      <div class="header-right">
        <el-tag v-if="hasDrafts" type="warning" effect="light">Drafts saved locally — available offline.</el-tag>
        <el-button type="default" @click="handleBackToDetail">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('workOrder.actions.backToDetail') }}
        </el-button>
      </div>
    </header>

    <section class="tasks-summary" v-if="taskCards.length">
      <!-- Filter Bar -->
      <div class="tasks-filter-bar">
        <el-input
          v-model="searchInput"
          placeholder="Search by task name or code"
          clearable
          class="filter-search"
          size="default"
          @input="handleSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="taskFilters.state"
          placeholder="State"
          clearable
          class="filter-select"
          size="default"
        >
          <el-option label="Ready" value="Ready" />
          <el-option label="In progress" value="In progress" />
          <el-option label="Completed" value="Completed" />
          <el-option label="Failed" value="Failed" />
        </el-select>
        <el-select
          v-model="taskFilters.assignee"
          placeholder="Personnel"
          clearable
          class="filter-select"
          size="default"
        >
          <el-option v-for="assignee in uniqueAssignees" :key="assignee" :label="assignee" :value="assignee" />
        </el-select>
        <el-select
          v-model="taskFilters.timeSpent"
          placeholder="Time spent"
          clearable
          class="filter-select"
          size="default"
        >
          <el-option label="Less than 15 min" value="lt15" />
          <el-option label="15 - 30 min" value="15to30" />
          <el-option label="More than 30 min" value="gt30" />
        </el-select>
      </div>

      <!-- Scrollable Tasks List -->
      <div class="tasks-list-container">
        <TaskExecutionSummary
          v-for="(card, index) in filteredTaskCards"
          :key="card.id"
          :task="card.task"
          :progress="card.progress"
          :index="index"
          @select="openTaskDrawer(card.task)"
          @view-log="openTaskLogViewer(card.task)"
        />
      </div>
    </section>
    <el-empty v-else description="No tasks available" :image-size="120" />

    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      size="50%"
      destroy-on-close
      append-to-body
      class="work-order-task-drawer"
    >
      <template #header>
        <div class="drawer-header-container" style="margin-bottom: -32px !important">
          <div class="drawer-header-left">
            <div class="drawer-title">{{ drawerTitle }}</div>
            <div v-if="activeTask" class="task-id-header">ID: {{ activeTask.id || activeTask.task_id || 'N/A' }}</div>
          </div>
          <div v-if="activeTask && activeTask.description" class="drawer-header-description">
            {{ activeTask.description }}
          </div>
        </div>
      </template>

      <div class="task-drawer-content" v-loading="drawerLoading">
        <div v-if="activeTask && !drawerLoading" class="drawer-inner">
          <div class="steps-content">
            <StepsExecution ref="stepsExecutionRef" :steps="activeTask.steps" />
          </div>

          <div class="time-entry-section">
            <div class="time-entry-content">
              <div class="time-entry-label">Time Spent (minutes)</div>
              <el-input-number
                v-model="manualTimeMinutes"
                :min="0"
                :step="5"
                :precision="0"
                placeholder="Enter total time"
                controls-position="right"
              />
            </div>
          </div>

          <div class="task-actions">
            <el-button v-show="false" type="info" @click="handleLogStepValues">Logs</el-button>
            <el-button type="warning" @click="handleSaveDraft" :loading="isSubmitting">Save Draft</el-button>
            <el-button type="primary" @click="handleFinalSubmit" :loading="isSubmitting">Submit</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <JsonDebugDrawer
      v-model="showJsonDisplayer"
      :payload-data="currentPayload"
      title="Task Step Values"
      subtitle="User input values for each step"
    />

    <!-- Task Log Viewer Dialog -->
    <el-dialog
      v-model="showTaskLogDialog"
      :title="`Task Logs: ${selectedTaskForLog?.name || selectedTaskForLog?.task_name || 'Task'}`"
      width="1000px"
      top="10vh"
      class="task-log-dialog"
    >
      <el-tabs v-model="activeLogTab" class="task-log-tabs">
        <!-- Logs Tab -->
        <el-tab-pane label="Logs" name="logs">
          <TaskLogsView
            v-if="showTaskLogDialog && selectedTaskForLog?.id"
            :task-entry-id="selectedTaskForLog.id || selectedTaskForLog.task_entry_id"
            :task="selectedTaskForLog"
            style="height: 53vh !important; overflow-y: auto"
          />
        </el-tab-pane>

        <!-- Steps Tab -->
        <el-tab-pane label="Steps Template" name="steps">
          <StepsPreview
            v-if="showTaskLogDialog && selectedTaskForLog?.steps"
            :steps="selectedTaskForLog.steps"
            :interactive="false"
            :show-mode-switch="false"
            style="height: 54vh !important"
          />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="closeTaskLogViewer">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import TaskExecutionSummary from './TaskExecutionSummary.vue'
import StepsExecution from '@/components/TaskLibrary/StepsExecution.vue'
import TaskLogsView from '@/components/WorkOrder/Logs/TaskLogsView.vue'
import StepsPreview from '@/components/TaskLibrary/StepsPreview.vue'
import { getTaskEntryById, updateTaskEntry } from '@/api/task-entry'
import { JsonDebugDrawer, usePayloadLogger } from '@/utils/logs'
import useUserStore from '@/store/modules/users'

const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

const emit = defineEmits( ['close', 'update:progress', 'back-to-detail'] )

const { t } = useI18n()
const { currentPayload, showJsonDisplayer, logPayload } = usePayloadLogger()
const userStore = useUserStore()

const draftsLoaded = ref( false )
const taskCards = reactive( [] )
const drawerVisible = ref( false )
const activeTask = ref( null )
const drawerLoading = ref( false )
const stepsExecutionRef = ref( null )
const manualTimeMinutes = ref( null )
const isSubmitting = ref( false )
const showTaskLogDialog = ref( false )
const selectedTaskForLog = ref( null )
const activeLogTab = ref( 'logs' )

// Filter state
const taskFilters = ref( {
  search : '',
  state : '',
  assignee : '',
  timeSpent : ''
} )

const searchInput = ref( '' )
let searchDebounceTimer = null

const handleBackToDetail = async() => {
  const shouldLeave = await confirmNavigation()
  if ( shouldLeave ) {
    emit( 'back-to-detail' )
  }
}

// Check if there's work in progress
const hasWorkInProgress = () => {
  // Check if drawer is open
  if ( drawerVisible.value ) {
    return true
  }
  // Check if there are any drafts
  if ( hasDrafts.value ) {
    return true
  }
  return false
}

// Show confirmation dialog before navigation
const confirmNavigation = async() => {
  if ( !hasWorkInProgress() ) {
    return true
  }

  try {
    await ElMessageBox.confirm(
      'You have work in progress. Are you sure you want to leave the execution? Any unsaved changes will be lost.',
      'Confirm Navigation',
      {
        confirmButtonText : 'Yes, Leave',
        cancelButtonText : 'Stay',
        type : 'warning',
        distinguishCancelAndClose : true
      }
    )
    return true
  } catch ( error ) {
    // User clicked cancel or close
    return false
  }
}

const buildTaskList = () => {
  taskCards.splice( 0, taskCards.length )
  const source =
    Array.isArray( props.workOrder?.tasks ) && props.workOrder.tasks.length
      ? props.workOrder.tasks
      : Array.isArray( props.workOrder?.task_list )
        ? props.workOrder.task_list
        : []

  source.forEach( rawTask => {
    const taskId =
      rawTask.id ||
      rawTask.task_id ||
      rawTask.template_id ||
      ( typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random()}` )
    taskCards.push( {
      id : taskId,
      task : rawTask,
      progress : {
        status : 'not_started',
        time_spent : { value : 0, unit : 'minutes' },
        step_progress : {},
        updated_at : ''
      },
      detailsLoaded : false
    } )
  } )
}

const hasDrafts = computed( () =>
  taskCards.some( card => card.progress.status === 'in_progress' && card.progress.updated_at )
)

const drawerTitle = computed( () => activeTask.value?.name || 'Task Details' )

// Unique assignees for filter dropdown
const uniqueAssignees = computed( () => {
  const assigneesSet = new Set()

  taskCards.forEach( card => {
    const personnel = card.task?.personnel
    if ( !personnel ) return

    if ( Array.isArray( personnel ) ) {
      personnel.forEach( p => {
        if ( typeof p === 'string' && p ) assigneesSet.add( p )
        if ( typeof p === 'object' && p.name ) assigneesSet.add( p.name )
      } )
    } else if ( typeof personnel === 'object' && personnel.name ) {
      assigneesSet.add( personnel.name )
    } else if ( typeof personnel === 'string' && personnel ) {
      assigneesSet.add( personnel )
    }
  } )

  return Array.from( assigneesSet ).sort()
} )

// Filtered task cards based on search and filters
const filteredTaskCards = computed( () => {
  // Start with a copy of all task cards
  let filtered = [...taskCards]

  // Filter by search
  if ( taskFilters.value.search ) {
    const searchLower = taskFilters.value.search.toLowerCase()
    filtered = filtered.filter( card => {
      const task = card.task
      const name = task?.name || task?.task_name || task?.label || task?.taskListText || ''
      const id = task?.id || ''
      return name.toLowerCase().includes( searchLower ) || String( id ).toLowerCase().includes( searchLower )
    } )
  }

  // Filter by state
  if ( taskFilters.value.state ) {
    filtered = filtered.filter( card => {
      const stateName = card.task?.state?.name || ''
      return stateName.toLowerCase() === taskFilters.value.state.toLowerCase()
    } )
  }

  // Filter by assignee
  if ( taskFilters.value.assignee ) {
    filtered = filtered.filter( card => {
      const personnel = card.task?.personnel
      if ( !personnel ) return false

      if ( Array.isArray( personnel ) ) {
        return personnel.some( p => {
          const name = typeof p === 'string' ? p : p?.name || ''
          return name === taskFilters.value.assignee
        } )
      } else if ( typeof personnel === 'object' && personnel.name ) {
        return personnel.name === taskFilters.value.assignee
      } else if ( typeof personnel === 'string' ) {
        return personnel === taskFilters.value.assignee
      }

      return false
    } )
  }

  // Filter by time spent
  if ( taskFilters.value.timeSpent ) {
    filtered = filtered.filter( card => {
      const timeTakenSec = card.task?.time_taken_sec || 0
      const minutes = Math.round( timeTakenSec / 60 )

      switch ( taskFilters.value.timeSpent ) {
        case 'lt15':
          return minutes < 15
        case '15to30':
          return minutes >= 15 && minutes <= 30
        case 'gt30':
          return minutes > 30
        default:
          return true
      }
    } )
  }

  return filtered
} )

const loadDrafts = async() => {
  draftsLoaded.value = true
}

const extractTimeTakenMinutes = task => {
  if ( !task ) return null

  const directSeconds = task.time_taken_sec ?? task.time_taken ?? task.timeTakenSec
  if ( typeof directSeconds === 'number' && Number.isFinite( directSeconds ) && directSeconds > 0 ) {
    return directSeconds / 60
  }

  const progressSeconds = task.progress?.time_taken_sec ?? task.progress?.timeTakenSec
  if ( typeof progressSeconds === 'number' && Number.isFinite( progressSeconds ) && progressSeconds > 0 ) {
    return progressSeconds / 60
  }

  const timeSpent = task.progress?.time_spent || task.progress?.timeSpent
  if ( timeSpent && typeof timeSpent === 'object' ) {
    const value = Number( timeSpent.value )
    if ( Number.isFinite( value ) ) {
      const unit = ( timeSpent.unit || '' ).toString().toLowerCase()
      if ( unit.startsWith( 'min' ) ) {
        return value
      }
      if ( unit.startsWith( 'sec' ) ) {
        return value / 60
      }
      if ( unit.startsWith( 'hour' ) ) {
        return value * 60
      }
    }
  }

  const estimateSeconds = task.time_estimate_sec ?? task.timeEstimateSec
  if ( typeof estimateSeconds === 'number' && Number.isFinite( estimateSeconds ) && estimateSeconds > 0 ) {
    return estimateSeconds / 60
  }

  return null
}

const prefillManualTime = () => {
  const minutes = extractTimeTakenMinutes( activeTask.value )
  if ( minutes === null ) {
    manualTimeMinutes.value = null
    return
  }

  manualTimeMinutes.value = Math.max( 0, Math.round( minutes ) )
}

const openTaskDrawer = async task => {
  drawerVisible.value = true
  drawerLoading.value = true
  activeTask.value = null

  try {
    const taskEntryId = task.task_entry_id || task.taskEntryId || task.id || task.task_id

    if ( taskEntryId ) {
      const response = await getTaskEntryById( taskEntryId )
      const taskData = response?.data

      if ( taskData ) {
        activeTask.value = {
          ...task,
          ...taskData,
          steps : Array.isArray( taskData.steps ) && taskData.steps.length ? taskData.steps : task.steps || []
        }
      } else {
        activeTask.value = task
      }
    } else {
      activeTask.value = task
    }

    prefillManualTime()
  } catch ( error ) {
    console.warn( 'Failed to load task entry details:', error )
    activeTask.value = task
    prefillManualTime()
  } finally {
    drawerLoading.value = false
  }
}

const closeDrawer = () => {
  drawerVisible.value = false
  activeTask.value = null
  stepsExecutionRef.value = null
  manualTimeMinutes.value = null
}

const prepareTaskEntryPayload = ( saveAsDraft = false ) => {
  const taskEntryId = activeTask.value?.id || activeTask.value?.task_id || activeTask.value?.task_entry_id

  if ( !taskEntryId ) {
    throw new Error( 'Task entry ID not found' )
  }

  const stepUpdateList = stepsExecutionRef.value?.getExecutionPayload()

  if ( stepUpdateList === null || stepUpdateList === undefined ) {
    throw new Error( 'Failed to collect step values' )
  }

  if ( !saveAsDraft ) {
    const missingSteps = stepsExecutionRef.value?.validateRequiredSteps?.() || []
    if ( missingSteps.length ) {
      throw new Error( `Please complete required steps: ${missingSteps.join( ', ' )}` )
    }
  }

  let minutesValue = Number( manualTimeMinutes.value )
  if ( manualTimeMinutes.value === null || manualTimeMinutes.value === undefined || Number.isNaN( minutesValue ) ) {
    if ( saveAsDraft ) {
      minutesValue = 0
    } else {
      throw new Error( 'Please enter the time spent in minutes.' )
    }
  }

  const timeTakenSec = Math.max( 0, Math.round( minutesValue * 60 ) )
  const userId = userStore.userInfo?.id || userStore.userInfo?.user_id || '999'

  return {
    taskEntryId,
    payload : {
      step_update_list : stepUpdateList,
      time_taken_sec : timeTakenSec,
      submit : !saveAsDraft,
      updated_by : String( userId )
    }
  }
}

const buildDebugPayload = () => {
  const taskEntryId = activeTask.value?.id || activeTask.value?.task_id || activeTask.value?.task_entry_id
  const stepUpdateList = stepsExecutionRef.value?.getExecutionPayload()

  if ( !taskEntryId || !stepUpdateList ) {
    return null
  }

  const minutesValue = Number( manualTimeMinutes.value )
  const timeTakenSec = Number.isNaN( minutesValue ) ? 0 : Math.max( 0, Math.round( minutesValue * 60 ) )
  const userId = userStore.userInfo?.id || userStore.userInfo?.user_id || '999'

  return {
    taskEntryId,
    payload : {
      step_update_list : stepUpdateList,
      time_taken_sec : timeTakenSec,
      submit : false,
      updated_by : String( userId )
    }
  }
}

const handleLogStepValues = () => {
  const debugPayload = buildDebugPayload()
  if ( !debugPayload ) {
    ElMessage.error( 'Unable to prepare payload for logging.' )
    return
  }

  const { taskEntryId, payload } = debugPayload

  console.groupCollapsed( '🧾 WorkOrderExecution: Task payload preview' )
  console.log( 'Task Entry ID:', taskEntryId )
  console.log( 'API Endpoint:', `/api/task/entry/${taskEntryId}` )
  console.log( 'Preview Payload:', payload )
  console.groupEnd()

  logPayload( payload, 'taskEntry', { showMessage : false } )
}

const handleSubmitTask = async( saveAsDraft = false ) => {
  if ( isSubmitting.value ) return

  try {
    const { taskEntryId, payload } = prepareTaskEntryPayload( saveAsDraft )

    const action = saveAsDraft ? 'save as draft' : 'submit'

    console.groupCollapsed( '🧾 WorkOrderExecution: Prepared task entry payload' )
    console.log( 'Task Entry ID:', taskEntryId )
    console.log( 'API Endpoint:', `/api/task/entry/${taskEntryId}` )
    console.log( 'Submit Action:', action )
    console.log( 'Request Payload:', payload )
    console.groupEnd()

    await ElMessageBox.confirm(
      `Are you sure you want to ${action} this task?`,
      'Confirmation',
      {
        confirmButtonText : 'Yes',
        cancelButtonText : 'Cancel',
        type : 'warning'
      }
    )

    isSubmitting.value = true

    const response = await updateTaskEntry( taskEntryId, payload )

    if ( response?.status === 'success' || response?.data ) {
      ElMessage.success( `Task ${saveAsDraft ? 'saved as draft' : 'submitted'} successfully` )
      closeDrawer()
      emit( 'update:progress' )
    } else {
      ElMessage.error( `Failed to ${action} task` )
    }
  } catch ( error ) {
    if ( error !== 'cancel' ) {
      console.error( 'Error submitting task:', error )
      ElMessage.error( error?.message || 'Failed to submit task' )
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleSaveDraft = () => {
  handleSubmitTask( true )
}

const handleFinalSubmit = () => {
  handleSubmitTask( false )
}

const openTaskLogViewer = async task => {
  try {
    const taskEntryId = task.task_entry_id || task.taskEntryId || task.id || task.task_id

    if ( taskEntryId ) {
      const response = await getTaskEntryById( taskEntryId )
      const taskData = response?.data

      if ( taskData ) {
        selectedTaskForLog.value = {
          ...task,
          ...taskData,
          steps : Array.isArray( taskData.steps ) && taskData.steps.length ? taskData.steps : task.steps || []
        }
      } else {
        selectedTaskForLog.value = task
      }
    } else {
      selectedTaskForLog.value = task
    }

    showTaskLogDialog.value = true
    activeLogTab.value = 'logs'
  } catch ( error ) {
    console.warn( 'Failed to load task entry details for log viewer:', error )
    selectedTaskForLog.value = task
    showTaskLogDialog.value = true
    activeLogTab.value = 'logs'
  }
}

const closeTaskLogViewer = () => {
  showTaskLogDialog.value = false
  selectedTaskForLog.value = null
  activeLogTab.value = 'logs'
}

// Handle search input with debounce (300ms)
const handleSearchInput = value => {
  if ( searchDebounceTimer ) {
    clearTimeout( searchDebounceTimer )
  }

  searchDebounceTimer = setTimeout( () => {
    taskFilters.value.search = value
  }, 300 )
}

// Expose method to parent for navigation guard
defineExpose( {
  confirmNavigation
} )

onMounted( async() => {
  buildTaskList()
  await loadDrafts()
} )

watch(
  () => props.workOrder,
  async() => {
    buildTaskList()
    await loadDrafts()
  },
  { deep : true, immediate : true }
)
</script>

<style scoped>
.work-order-execution {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: var(--el-bg-color);
  overflow: hidden;
  gap: 20px;
}

.execution-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.execution-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.tasks-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  min-height: 0;
}

.tasks-filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  background: var(--el-bg-color);
  z-index: 5;
  flex-shrink: 0;
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 150px;
}

.tasks-list-container {
  flex: 1 0 auto;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-right: 8px;
  margin-right: -8px;
  min-height: 0;
  max-height: 90%;
}

.tasks-list-container :deep(.template-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 12px;
}

.tasks-list-container :deep(.template-card:last-child) {
  margin-bottom: 0;
}

.tasks-list-container :deep(.template-card:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Scrollbar styling for tasks list */
.tasks-list-container::-webkit-scrollbar {
  width: 6px;
}

.tasks-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tasks-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tasks-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .tasks-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-search,
  .filter-select {
    width: 100%;
  }
}

.task-drawer-content {
  height: 100%;
  padding: 0;
}

:deep(.el-drawer__body) {
  padding: 0;
  height: 100%;
}

.drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.drawer-header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.drawer-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.task-id-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  margin-top: 2px;
}

.drawer-header-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  padding: 8px 0;
  margin-top: 4px;
  font-style: italic;
}

.steps-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.task-actions {
  padding: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  flex-shrink: 0;
}

.time-entry-section {
  padding: 16px 20px 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--el-bg-color);
}

.time-entry-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-entry-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

header.el-drawer__header {
  margin-bottom: 0 !important;
}

:deep(.el-drawer__body) {
  padding: unset !important;
}

.task-log-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.task-log-tabs {
  :deep(.el-tabs__content) {
    overflow: visible;
  }
}
</style>

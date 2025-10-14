<template>
  <div class="work-order-execution">
    <header class="execution-header">
      <div>
        <h2>{{ workOrder?.name || 'Work Order' }}</h2>
        <p class="subtitle">Execute tasks and record progress</p>
      </div>
      <div class="header-right">
        <el-tag v-if="hasDrafts" type="warning" effect="light">Drafts saved locally — available offline.</el-tag>
        <el-button type="default" @click="handleBackToDetail">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('workOrder.actions.backToDetail') }}
        </el-button>
      </div>
    </header>

    <section class="tasks-summary" v-if="displayCards.length">
      <TaskExecutionSummary
        v-for="(card, index) in displayCards"
        :key="card.id"
        :task="card.task"
        :progress="card.progress"
        :index="index"
        @select="openTaskDrawer(card.task)"
      />
      <el-button v-if="taskCards.length > 3" type="text" class="view-all"> View all tasks </el-button>
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
          <!-- Title and ID on left side -->
          <div class="drawer-header-left">
            <div class="drawer-title">{{ drawerTitle }}</div>
            <div v-if="activeTask" class="task-id-header">ID: {{ activeTask.id || activeTask.task_id || 'N/A' }}</div>
          </div>
          <!-- Description -->
          <div v-if="activeTask && activeTask.description" class="drawer-header-description">
            {{ activeTask.description }}
          </div>
        </div>
      </template>

      <div class="task-drawer-content" v-loading="drawerLoading">
        <div v-if="activeTask && !drawerLoading" class="drawer-inner">
          <!-- Steps Content -->
          <div class="steps-content">
            <StepsPreview :steps="activeTask.steps" :interactive="true" />
          </div>

          <!-- Action Buttons -->
          <div class="task-actions">
            <el-button @click="closeDrawer">Cancel</el-button>
            <el-button type="info" @click="handleLogStepValues">Logs</el-button>
            <el-button type="primary" @click="handleSubmitTask">Submit</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- JSON Debug Drawer -->
    <JsonDebugDrawer
      v-model="showJsonDisplayer"
      :payload-data="currentPayload"
      title="Task Step Values"
      subtitle="User input values for each step"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import TaskExecutionSummary from './TaskExecutionSummary.vue'
import StepsPreview from '@/components/TaskLibrary/StepsPreview.vue'
import { getTaskEntryById } from '@/api/task-entry'
import { JsonDebugDrawer, usePayloadLogger } from '@/utils/logs'

const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

const emit = defineEmits( ['close', 'update:progress', 'back-to-detail'] )

// Handler for back to detail navigation with debug logging
const handleBackToDetail = () => {
  console.log( '🔄 WorkOrderExecution: Back to Detail button clicked' )
  console.log( '🔄 WorkOrderExecution: Emitting back-to-detail event' )
  emit( 'back-to-detail' )
  console.log( '🔄 WorkOrderExecution: back-to-detail event emitted' )
}

// eslint-disable-next-line no-unused-vars
const { t } = useI18n()
const { currentPayload, showJsonDisplayer, logPayload } = usePayloadLogger()

const draftsLoaded = ref( false )
const taskCards = reactive( [] )
const drawerVisible = ref( false )
const activeTask = ref( null )
const drawerLoading = ref( false )

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
computed( () => taskCards.filter( card => card.progress.status === 'completed' ).length )
computed( () => taskCards.filter( card => card.progress.status === 'in_progress' && card.progress.updated_at ).length )
const displayCards = computed( () => taskCards.slice( 0, 3 ) )
const drawerTitle = computed( () => activeTask.value?.name || 'Task Details' )

const loadDrafts = async() => {
  // TODO: Offline storage will be implemented later
  draftsLoaded.value = true
}

const openTaskDrawer = async task => {
  drawerVisible.value = true
  drawerLoading.value = true
  activeTask.value = null

  try {
    // Get task entry ID from various possible locations
    const taskEntryId = task.task_entry_id || task.taskEntryId || task.id || task.task_id

    if ( taskEntryId ) {
      // Fetch full task entry details from backend
      const response = await getTaskEntryById( taskEntryId )
      const taskData = response?.data

      if ( taskData ) {
        activeTask.value = {
          ...task,
          ...taskData,
          steps : Array.isArray( taskData.steps ) && taskData.steps.length ? taskData.steps : task.steps || []
        }
      } else {
        // Fallback to original task data if API call fails
        activeTask.value = task
      }
    } else {
      // Use original task data if no ID available
      activeTask.value = task
    }
  } catch ( error ) {
    console.warn( 'Failed to load task entry details:', error )
    // Fallback to original task data on error
    activeTask.value = task
  } finally {
    drawerLoading.value = false
  }
}

const closeDrawer = () => {
  drawerVisible.value = false
  activeTask.value = null
}

const handleLogStepValues = () => {
  // Collect step values from the DOM
  const stepValues = collectStepValues()

  const payload = {
    taskInfo : {
      id : activeTask.value?.id || activeTask.value?.task_id,
      name : activeTask.value?.name,
      description : activeTask.value?.description
    },
    workOrderInfo : {
      id : props.workOrder?.id,
      name : props.workOrder?.name
    },
    stepValues,
    timestamp : new Date().toISOString(),
    totalSteps : activeTask.value?.steps?.length || 0
  }

  logPayload( payload, 'taskStepValues', {
    taskId : activeTask.value?.id,
    workOrderId : props.workOrder?.id,
    stepCount : Object.keys( stepValues ).length
  } )
}

const collectStepValues = () => {
  const stepValues = {}

  try {
    // Find the steps preview container
    const stepsContainer = document.querySelector( '.drawer-inner .steps-content .steps-preview-container' )
    if ( !stepsContainer ) {
      console.warn( 'Steps preview container not found' )
      return stepValues
    }

    // Find all step components within the preview
    const stepElements = stepsContainer.querySelectorAll( '.preview-step-simple' )

    stepElements.forEach( ( stepElement, index ) => {
      const stepData = collectStepValue( stepElement, index )
      if ( stepData ) {
        stepValues[`step_${index + 1}`] = stepData
      }
    } )

    console.log( 'Collected step values:', stepValues )
    return stepValues
  } catch ( error ) {
    console.error( 'Error collecting step values:', error )
    return stepValues
  }
}

const collectStepValue = ( stepElement, index ) => {
  try {
    const stepInfo = {
      stepIndex : index + 1,
      stepType : 'unknown',
      value : null,
      label : null,
      required : false
    }

    // Try to find step label
    const labelElement = stepElement.querySelector( '.preview-label, .step-label, .checkbox-step-preview label' )
    if ( labelElement ) {
      stepInfo.label = labelElement.textContent?.replace( '*', '' ).trim()
      stepInfo.required = labelElement.textContent?.includes( '*' ) || false
    }

    // Check for different input types and collect values

    // Number input
    const numberInput = stepElement.querySelector( '.el-input-number input' )
    if ( numberInput ) {
      stepInfo.stepType = 'number'
      stepInfo.value = numberInput.value ? parseFloat( numberInput.value ) : null

      // Get unit if available
      const unitLabel = stepElement.querySelector( '.unit-label' )
      if ( unitLabel ) {
        stepInfo.unit = unitLabel.textContent?.trim()
      }

      return stepInfo
    }

    // Checkbox input
    const checkboxInput = stepElement.querySelector( '.el-checkbox input[type="checkbox"]' )
    if ( checkboxInput ) {
      stepInfo.stepType = 'checkbox'
      stepInfo.value = checkboxInput.checked
      return stepInfo
    }

    // Text input/textarea
    const textInput = stepElement.querySelector( '.el-input input, .el-textarea textarea' )
    if ( textInput ) {
      stepInfo.stepType = 'text'
      stepInfo.value = textInput.value
      return stepInfo
    }

    // Inspection/radio buttons
    const inspectionRadio = stepElement.querySelector( 'input[type="radio"]:checked' )
    if ( inspectionRadio ) {
      stepInfo.stepType = 'inspection'
      stepInfo.value = inspectionRadio.value
      return stepInfo
    }

    // File uploads
    const fileUpload = stepElement.querySelector( '.el-upload' )
    if ( fileUpload ) {
      stepInfo.stepType = 'attachment'
      // For file uploads, we can try to get the file list
      const fileList = stepElement.querySelectorAll( '.el-upload-list__item' )
      stepInfo.value = {
        uploadedFiles : fileList.length,
        files : Array.from( fileList ).map( item => {
          const fileName = item.querySelector( '.el-upload-list__item-name' )
          return fileName ? fileName.textContent?.trim() : 'Unknown file'
        } )
      }
      return stepInfo
    }

    // Default case - try to get any input value
    const anyInput = stepElement.querySelector( 'input, textarea, select' )
    if ( anyInput ) {
      stepInfo.stepType = anyInput.type || 'unknown'
      stepInfo.value = anyInput.value
      return stepInfo
    }

    return stepInfo
  } catch ( error ) {
    console.error( `Error collecting value for step ${index + 1}:`, error )
    return {
      stepIndex : index + 1,
      stepType : 'error',
      value : null,
      error : error.message
    }
  }
}

const handleSubmitTask = () => {
  // TODO: Collect step values and submit task
  console.log( 'Submitting task:', activeTask.value )
  // For now, just close the drawer
  closeDrawer()
}

onMounted( async() => {
  buildTaskList()
  await loadDrafts()
} )

watch(
  () => props.workOrder,
  async() => {
    buildTaskList()
    await loadDrafts()
  }
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
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}

.tasks-summary .view-all {
  align-self: flex-start;
  padding: 0;
  font-size: 13px;
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
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  flex-shrink: 0;
}

header.el-drawer__header {
  margin-bottom: 0 !important;
}

:deep(.el-drawer__body) {
  margin-top: 0;
}
</style>

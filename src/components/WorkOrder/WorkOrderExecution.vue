<template>
  <div class="work-order-execution">
    <header class="execution-header">
      <div>
        <h2>{{ workOrder?.name || 'Work Order' }}</h2>
        <p class="subtitle">Execute tasks and record progress</p>
      </div>
      <el-tag v-if="hasDrafts" type="warning" effect="light">Drafts saved locally — available offline.</el-tag>
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
      <el-button v-if="taskCards.length > 3" type="text" class="view-all">
        View all tasks
      </el-button>
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
        <div class="drawer-header-container" style="margin-bottom: -32px !important;">
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
            <StepsPreview
              :steps="activeTask.steps"
              :interactive="true"
            />
          </div>

          <!-- Action Buttons -->
          <div class="task-actions">
            <el-button @click="closeDrawer">Cancel</el-button>
            <el-button type="primary" @click="handleSubmitTask">Submit</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { OfflineStorageService } from './OfflineStorageService'
import TaskExecutionSummary from './TaskExecutionSummary.vue'
import StepsPreview from '@/components/TaskLibrary/StepsPreview.vue'
import { getTaskEntryById } from '@/api/task-entry'

const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

const emit = defineEmits( ['close', 'update:progress'] )

const draftsLoaded = ref( false )
const taskCards = reactive( [] )
const drawerVisible = ref( false )
const activeTask = ref( null )
const drawerLoading = ref( false )

const buildTaskList = () => {
  taskCards.splice( 0, taskCards.length )
  const source = Array.isArray( props.workOrder?.tasks ) && props.workOrder.tasks.length
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

const hasDrafts = computed( () => taskCards.some( card => card.progress.status === 'in_progress' && card.progress.updated_at ) )
const completedCount = computed( () => taskCards.filter( card => card.progress.status === 'completed' ).length )
const draftCount = computed( () => taskCards.filter( card => card.progress.status === 'in_progress' && card.progress.updated_at ).length )
const displayCards = computed( () => taskCards.slice( 0, 3 ) )
const drawerTitle = computed( () => activeTask.value?.name || 'Task Details' )

const workOrderKey = computed( () => String( props.workOrder?.id ?? props.workOrder?.name ?? 'unknown' ) )


const loadDrafts = async() => {
  const drafts = await OfflineStorageService.getDrafts( workOrderKey.value )
  draftsLoaded.value = true
  drafts.forEach( draft => {
    const target = taskCards.find( card => String( card.id ) === String( draft.taskId ) )
    if ( target ) {
      target.progress = {
        status : draft.status === 'draft' ? 'in_progress' : draft.status,
        time_spent : { ...draft.time_spent },
        step_progress : { ...draft.step_progress },
        updated_at : draft.updated_at
      }
    }
  } )
}

const openTaskDrawer = async( task ) => {
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
          steps: Array.isArray( taskData.steps ) && taskData.steps.length ? taskData.steps : task.steps || []
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

const handleSubmitTask = () => {
  // TODO: Collect step values and submit task
  console.log('Submitting task:', activeTask.value)
  // For now, just close the drawer
  closeDrawer()
}

onMounted( async() => {
  buildTaskList()
  await loadDrafts()
} )

watch(
  () => props.workOrder,
  async () => {
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

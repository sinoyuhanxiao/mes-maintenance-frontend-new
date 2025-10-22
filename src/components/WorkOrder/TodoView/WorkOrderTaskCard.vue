<template>
  <div class="template-card">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Task Code + View Icon -->
      <div class="row-1">
        <div style="display: flex; flex-direction: row; align-items: center; gap: 10px">
          <h4 class="card-title" :title="taskLabel">
            {{ taskLabel }}
          </h4>
          <el-icon class="view-icon" @click.stop="handleTaskClick" title="View Logs">
            <View />
          </el-icon>
        </div>
        <div class="right-badges">
          <!--          <el-tag v-if="categoryLabel" size="small" class="tag-item">-->
          <!--            {{ categoryLabel }}-->
          <!--          </el-tag>-->
          <div v-if="taskCode" class="task-code-badge">{{ taskCode }}</div>
        </div>
      </div>

      <!-- Row 2: Task Details -->
      <div class="row-2 task-details">
        <div class="detail-item">
          <span class="detail-label">State:</span>
          <span class="detail-value">
            <el-tag
              v-if="taskState && taskState.toLowerCase() === 'completed'"
              type="success"
              size="small"
              class="tag-item"
            >
              Completed
            </el-tag>
            <el-tag
              v-else-if="taskState && taskState.toLowerCase() === 'failed'"
              type="danger"
              size="small"
              class="tag-item"
            >
              Failed
            </el-tag>
            <el-tag
              v-else-if="taskState && (taskState.toLowerCase() === 'in progress' || taskState.toLowerCase() === 'in-progress' || taskState.toLowerCase() === 'inprogress')"
              type="primary"
              size="small"
              class="tag-item"
            >
              In Progress
            </el-tag>
            <el-tag
              v-else-if="taskState && taskState.toLowerCase() === 'ready'"
              type="info"
              size="small"
              class="tag-item"
            >
              Ready
            </el-tag>
            <template v-else>{{ taskState }}</template>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Progress:</span>
          <span class="detail-value">{{ progressText }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Actual Time:</span>
          <span class="detail-value">
            {{ actualTime }}
            <span v-if="isActualTimeExceeded" class="time-exceeded-indicator">⬆</span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Est. Time:</span>
          <span class="detail-value">{{ estimatedTime }}</span>
        </div>
      </div>

      <!-- Row 3: Personnel -->
      <div class="row-3">
        <div class="detail-item">
          <span class="detail-label">Personnel:</span>
          <span class="detail-value">{{ assignedPersonnel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { View } from '@element-plus/icons-vue'

const props = defineProps( {
  task : {
    type : Object,
    required : true
  }
} )

const emit = defineEmits( ['preview'] )

const taskLabel = computed( () => {
  const task = props.task

  if ( task && typeof task === 'object' ) {
    if ( typeof task.name === 'string' && task.name.trim() ) {
      return task.name
    }

    if ( typeof task.task_name === 'string' && task.task_name.trim() ) {
      return task.task_name
    }

    if ( typeof task.label === 'string' && task.label.trim() ) {
      return task.label
    }

    if ( typeof task.taskListText === 'string' && task.taskListText.trim() ) {
      return task.taskListText
    }

    if ( typeof task.task_list_text === 'string' && task.task_list_text.trim() ) {
      return task.task_list_text
    }

    if ( typeof task.id === 'string' && task.id.trim() ) {
      return task.id
    }

    if ( typeof task.id === 'number' ) {
      return String( task.id )
    }
  }

  if ( typeof task === 'string' || typeof task === 'number' ) {
    return String( task )
  }

  return 'Task'
} )

// eslint-disable-next-line no-unused-vars
const stepsCount = computed( () => props.task?.total_steps || 0 )

// eslint-disable-next-line no-unused-vars
const categoryLabel = computed( () => {
  const category = props.task?.category
  if ( !category ) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
} )

// eslint-disable-next-line no-unused-vars
const equipmentLabel = computed( () => {
  const equipment = props.task?.equipment_node
  if ( !equipment ) return ''
  return typeof equipment === 'object' ? equipment.name : equipment
} )

// eslint-disable-next-line no-unused-vars
const timeEstimate = computed( () => {
  const task = props.task
  if ( task?.time_estimate_sec ) {
    const minutes = Math.round( task.time_estimate_sec / 60 )
    return `${minutes} min`
  }
  if ( task?.estimated_minutes ) {
    return `${task.estimated_minutes} min`
  }
  return ''
} )

const taskState = computed( () => {
  return props.task?.state?.name || '-'
} )

const assignedPersonnel = computed( () => {
  const personnel = props.task?.personnel
  if ( !personnel ) return '-'

  // Handle array of personnel
  if ( Array.isArray( personnel ) ) {
    const names = personnel
      .map( p => {
        if ( typeof p === 'string' ) return p
        if ( typeof p === 'object' && p.name ) return p.name
        return ''
      } )
      .filter( Boolean )
    return names.length > 0 ? names.join( ', ' ) : '-'
  }

  // Handle single personnel object
  if ( typeof personnel === 'object' && personnel.name ) {
    return personnel.name
  }

  // Handle string
  if ( typeof personnel === 'string' ) {
    return personnel
  }

  return '-'
} )

const progressText = computed( () => {
  const completedSteps = props.task?.completed_steps ?? 0
  const totalSteps = props.task?.total_steps ?? 0
  return `${completedSteps} / ${totalSteps} Steps`
} )

const actualTime = computed( () => {
  const timeTakenSec = props.task?.time_taken_sec
  if ( timeTakenSec ) {
    const takenMinutes = Math.round( timeTakenSec / 60 )
    return `${takenMinutes} min`
  }
  return '-'
} )

const estimatedTime = computed( () => {
  const timeEstimateSec = props.task?.time_estimate_sec
  if ( timeEstimateSec ) {
    const estimatedMinutes = Math.round( timeEstimateSec / 60 )
    return `${estimatedMinutes} min`
  }
  return '-'
} )

const taskCode = computed( () => {
  return props.task?.id || ''
} )

const isActualTimeExceeded = computed( () => {
  const timeTakenSec = props.task?.time_taken_sec
  const timeEstimateSec = props.task?.time_estimate_sec

  if ( !timeTakenSec || !timeEstimateSec ) return false

  return timeTakenSec > timeEstimateSec
} )

const handleTaskClick = () => {
  emit( 'preview', props.task )
}

defineOptions( {
  name : 'WorkOrderTaskCard'
} )
</script>

<style scoped>
.template-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
  margin-bottom: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
}

.template-card:last-child {
  margin-bottom: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.row-1 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  line-height: 1.5;
}

.right-badges {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.task-code-badge {
  font-size: 14px;
  font-family: monospace;
  white-space: nowrap;
}

.view-icon {
  font-size: 18px;
  color: var(--el-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-icon:hover {
  color: var(--el-color-primary-dark-2);
  transform: scale(1.1);
}

.row-2.task-details {
  display: flex;
  flex-wrap: wrap;
  padding-top: 4px;
  justify-content: space-between;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: baseline;
}

.detail-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.tag-item {
  --el-tag-border-color: var(--el-border-color-light);
}

.row-3 {
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.time-exceeded-indicator {
  color: var(--el-color-warning);
  font-size: 16px;
}

@media (max-width: 480px) {
  .card-content {
    padding: 12px;
  }
  .card-title {
    font-size: 15px;
  }
  .row-2.task-details {
    gap: 12px;
  }
}
</style>

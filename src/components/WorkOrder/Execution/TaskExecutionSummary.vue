<template>
  <div class="task-summary-card" :class="statusClass" @click="$emit('select')">
    <div class="summary-header">
      <div class="summary-title">
        <h4>{{ task.name || `Task ${indexLabel}` }}</h4>
        <StatusBadge :status="currentStatus" />
      </div>
      <span class="summary-meta">Steps: {{ stepCount }}</span>
    </div>
    <div class="summary-meta-row">
      <span class="meta-label">Assigned To:</span>
      <span class="meta-value">{{ assignee }}</span>
    </div>
    <p v-if="task.description" class="summary-description">{{ task.description }}</p>
    <div class="summary-footer">
      <span class="footer-time">{{ formattedTime }}</span>
      <el-icon class="footer-icon"><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import StatusBadge from '../Display/StatusBadge.vue'

const props = defineProps( {
  task : {
    type : Object,
    required : true
  },
  progress : {
    type : Object,
    default : () => ( { status : 'draft', time_spent : { value : 0, unit : 'minutes' }} )
  },
  index : {
    type : Number,
    default : 0
  }
} )

const indexLabel = computed( () => props.index + 1 )

const stepCount = computed( () => {
  if ( Array.isArray( props.task?.steps ) && props.task.steps.length ) return props.task.steps.length
  if ( Array.isArray( props.task?.payload?.steps ) && props.task.payload.steps.length ) {
    return props.task.payload.steps.length
  }
  if ( Array.isArray( props.task?.task_steps ) && props.task.task_steps.length ) return props.task.task_steps.length
  if ( Array.isArray( props.task?.entries ) && props.task.entries.length ) return props.task.entries.length
  return 0
} )

const statusClass = computed( () => `summary-${currentStatus.value}` )

const currentStatus = computed( () => {
  const status = props.progress?.status
  if ( status === 'draft' ) return 'in_progress'
  if ( status === 'completed' ) return 'completed'
  return status || 'not_started'
} )

const formattedTime = computed( () => {
  const value = props.progress?.time_spent?.value
  const unit = props.progress?.time_spent?.unit
  if ( value && unit ) {
    return `${value} ${unit}`
  }
  return 'No time recorded'
} )

const assignee = computed( () => {
  if ( props.task?.assignees && props.task.assignees.length ) {
    return props.task.assignees.map( person => person.name || person ).join( ', ' )
  }
  if ( props.task?.assignee_ids && props.task.assignee_ids.length ) {
    return `Assignee #${props.task.assignee_ids[0]}`
  }
  const names = ['Alex Martinez', 'Priya Desai', 'Morgan Chen', 'Isabella Fernandez', 'Liam O’Connor', 'Harper Singh']
  return names[Math.floor( Math.random() * names.length )]
} )
</script>

<style scoped>
.task-summary-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-summary-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.summary-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.summary-description {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.summary-meta-row {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: var(--el-color-primary);
}

.meta-label {
  font-weight: 600;
}

.meta-value {
  color: var(--el-color-primary);
}

.summary-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.footer-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.summary-completed {
  border-color: var(--el-color-success);
}

.summary-completed:hover {
  border-color: var(--el-color-success);
}

.summary-in_progress {
  border-color: var(--el-color-warning);
}

.summary-not_started {
  border-color: var(--el-border-color-light);
}
</style>

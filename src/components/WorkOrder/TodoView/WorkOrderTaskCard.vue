<template>
  <div class="work-order-task-card" @click="handleTaskClick">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Preview Icon -->
      <div class="row-1">
        <el-text class="card-title" :title="taskLabel" truncated>
          {{ taskLabel }}
        </el-text>

        <!-- Preview Icon -->
        <el-icon class="preview-icon" title="Click to preview task details">
          <View />
        </el-icon>
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

  if ( typeof task === 'string' || typeof task === 'number' ) {
    return String( task )
  }

  if ( task && typeof task === 'object' ) {
    if ( typeof task.label === 'string' && task.label.trim() ) {
      return task.label
    }

    if ( typeof task.taskListText === 'string' && task.taskListText.trim() ) {
      return task.taskListText
    }

    if ( typeof task.task_list_text === 'string' && task.task_list_text.trim() ) {
      return task.task_list_text
    }

    if ( typeof task.task_name === 'string' && task.task_name.trim() ) {
      return task.task_name
    }

    if ( typeof task.name === 'string' && task.name.trim() ) {
      return task.name
    }

    if ( typeof task.task_id === 'string' && task.task_id.trim() ) {
      return task.task_id
    }

    if ( typeof task.id === 'string' && task.id.trim() ) {
      return task.id
    }

    if ( typeof task.id === 'number' ) {
      return String( task.id )
    }
  }

  return 'Task'
} )

const handleTaskClick = () => {
  emit( 'preview', props.task )
}

defineOptions( {
  name : 'WorkOrderTaskCard'
} )
</script>

<style scoped lang="scss">
.work-order-task-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color);
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &:last-child {
    margin-bottom: 0;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .row-1 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;

      .card-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        flex: 1;
        min-width: 0;
      }

      .preview-icon {
        color: var(--el-color-primary);
        font-size: 18px;
        flex-shrink: 0;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .work-order-task-card {
    padding: 12px;

    .card-content {
      gap: 6px;

      .row-1 {
        .card-title {
          font-size: 14px;
        }

        .preview-icon {
          font-size: 16px;
        }
      }
    }
  }
}
</style>

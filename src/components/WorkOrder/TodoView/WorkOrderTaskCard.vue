<template>
  <div class="work-order-task-card" @click="handleTaskClick">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Preview Icon -->
      <div class="row-1">
        <el-text class="card-title" :title="task.task_name || task.name" truncated>
          {{ task.task_name || task.name }}
        </el-text>

        <!-- Preview Icon -->
        <el-icon class="preview-icon" title="Click to preview task details">
          <View />
        </el-icon>
      </div>

      <!-- Row 2: Tags + Steps -->
      <div class="row-2 card-tags">
        <div class="tags-left">
          <el-tag v-if="categoryLabel" size="small" class="tag-item">
            {{ categoryLabel }}
          </el-tag>

          <el-tag v-if="estimatedTime" size="small" type="warning" class="tag-item">
            {{ estimatedTime }}
          </el-tag>

          <el-tag v-if="statusLabel" size="small" :type="statusType" class="tag-item">
            {{ statusLabel }}
          </el-tag>
        </div>

        <div class="steps-count">{{ stepsCount }} steps</div>
      </div>

      <!-- Row 3: Task Description (if available) -->
      <div v-if="task.description" class="row-3 task-description">
        <el-text class="description-text" :title="task.description" truncated>
          {{ task.description }}
        </el-text>
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

const stepsCount = computed( () => props.task?.steps?.length || 0 )

const categoryLabel = computed( () => {
  const category = props.task?.category
  if ( !category ) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
} )

const estimatedTime = computed( () => {
  const minutes = props.task?.estimated_minutes
  if ( !minutes ) return ''
  return `${minutes} min`
} )

const statusLabel = computed( () => {
  // For now, default to 'Pending' - this can be enhanced based on actual task status
  return 'Pending'
} )

const statusType = computed( () => {
  // Default status type - can be enhanced based on actual status
  return 'info'
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
  margin-bottom: 12px;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
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
        font-size: 16px;
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

    .row-2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;

      .tags-left {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        flex: 1;
        min-width: 0;

        .tag-item {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .steps-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        font-weight: 500;
        flex-shrink: 0;
      }
    }

    .row-3 {
      .description-text {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        line-height: 1.4;
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

      .row-2 {
        .tags-left {
          gap: 4px;

          .tag-item {
            font-size: 11px;
            padding: 1px 4px;
          }
        }

        .steps-count {
          font-size: 11px;
        }
      }

      .row-3 {
        .description-text {
          font-size: 12px;
        }
      }
    }
  }
}
</style>

<template>
  <div class="template-card" @click="handleTaskClick">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Steps -->
      <div class="row-1">
        <h4 class="card-title" :title="taskLabel">
          {{ taskLabel }}
        </h4>
        <div class="steps-count">{{ stepsCount }} steps</div>
      </div>

      <!-- Row 2: Tags -->
      <div class="row-2 card-tags">
        <el-tag v-if="categoryLabel" size="small" class="tag-item">
          {{ categoryLabel }}
        </el-tag>

<!--        <el-tag v-if="equipmentLabel" size="small" type="info" class="tag-item">-->
<!--          {{ equipmentLabel }}-->
<!--        </el-tag>-->

        <el-tag v-if="timeEstimate" size="small" type="warning" class="tag-item">
          {{ timeEstimate }}
        </el-tag>
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

const stepsCount = computed( () => props.task?.total_steps || 0 )

const categoryLabel = computed( () => {
  const category = props.task?.category
  if ( !category ) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
} )

const equipmentLabel = computed( () => {
  const equipment = props.task?.equipment_node
  if ( !equipment ) return ''
  return typeof equipment === 'object' ? equipment.name : equipment
} )

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

const handleTaskClick = () => {
  emit( 'preview', props.task )
}

defineOptions( {
  name : 'WorkOrderTaskCard'
} )
</script>

<style scoped>
.template-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-card:last-child {
  margin-bottom: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
}

.row-1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 12px 0;
}

.card-title {
  margin: 0;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.steps-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.row-2 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 24px;
}

.tag-item {
  --el-tag-border-color: #e4e7ed;
}

@media (max-width: 480px) {
  .card-content {
    padding: 10px 12px;
  }
  .card-title {
    font-size: 15px;
  }
}
</style>

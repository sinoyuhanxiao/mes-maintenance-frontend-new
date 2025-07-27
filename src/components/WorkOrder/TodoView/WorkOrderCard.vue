<template>
  <div
    class="work-order-card"
    :class="{
      selected: isSelected,
      overdue: isOverdue,
      'high-priority': isHighPriority,
    }"
    @click="$emit('select', workOrder)"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="card-id">#{{ workOrder.id }}</div>
      <div class="card-actions">
        <el-dropdown trigger="click" @command="handleAction">
          <el-button type="text" size="small" class="action-button">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                {{ $t('workOrder.actions.edit') }}
              </el-dropdown-item>
              <el-dropdown-item command="view">
                <el-icon><View /></el-icon>
                {{ $t('workOrder.actions.view') }}
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <el-icon><Delete /></el-icon>
                {{ $t('workOrder.actions.delete') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Work Order Title -->
      <h4 class="card-title" :title="workOrder.name">
        {{ workOrder.name }}
      </h4>

      <!-- Requested By -->
      <div class="card-meta">
        <span class="meta-label">{{ $t('workOrder.form.createdBy') }}:</span>
        <span class="meta-value">{{ workOrder.created_by || 'N/A' }}</span>
      </div>

      <!-- Due Date -->
      <div class="card-meta" v-if="workOrder.due_date">
        <span class="meta-label">{{ $t('workOrder.table.dueDate') }}:</span>
        <span class="meta-value" :class="{ 'overdue-text': isOverdue }">
          {{ formatDate(workOrder.due_date) }}
        </span>
      </div>

      <!-- Status and Priority Badges -->
      <div class="card-badges">
        <el-tag :type="getStatusTagType(workOrder.state?.name)" size="small" effect="dark">
          {{ getStatusName(workOrder.state?.name) }}
        </el-tag>

        <el-tag :type="getPriorityTagType(workOrder.priority?.name)" size="small" effect="plain">
          <el-icon style="margin-right: 4px">
            <Flag />
          </el-icon>
          {{ getPriorityName(workOrder.priority?.name) }}
        </el-tag>

        <el-tag v-if="isOverdue" type="danger" size="small" effect="dark">
          {{ $t('workOrder.status.overdue') }}
        </el-tag>
      </div>

      <!-- Thumbnail -->
      <div class="card-thumbnail" v-if="workOrder.image_path && workOrder.image_path.length">
        <el-image :src="workOrder.image_path[0]" fit="cover" :preview-src-list="workOrder.image_path">
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreFilled, Edit, View, Delete, Flag, Picture } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  },
  isSelected : {
    type : Boolean,
    default : false
  }
} )

// Emits
const emit = defineEmits( ['select', 'action'] )

const { t } = useI18n()

// Computed
const isOverdue = computed( () => {
  return props.workOrder.due_date && new Date( props.workOrder.due_date ) < new Date()
} )

const isHighPriority = computed( () => {
  return props.workOrder.priority?.name === 'High' || props.workOrder.priority?.name === 'Urgent'
} )

// Methods
const formatDate = dateString => {
  return convertToLocalTime( dateString )
}

const getStatusTagType = status => {
  switch ( status ) {
    case 'Failed':
      return 'danger'
    case 'Completed':
      return 'success'
    case 'In Progress':
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusName = status => {
  const statusMap = {
    Failed : t( 'workOrder.status.failed' ),
    Completed : t( 'workOrder.status.completed' ),
    'In Progress' : t( 'workOrder.status.inProgress' ),
    Pending : t( 'workOrder.status.pending' )
  }
  return statusMap[status] || status
}

const getPriorityTagType = priority => {
  switch ( priority ) {
    case 'Urgent':
      return 'danger'
    case 'High':
      return 'warning'
    case 'Medium':
      return 'primary'
    case 'Low':
      return 'info'
    default:
      return 'info'
  }
}

const getPriorityName = priority => {
  const priorityMap = {
    Urgent : t( 'workOrder.priority.urgent' ),
    High : t( 'workOrder.priority.high' ),
    Medium : t( 'workOrder.priority.medium' ),
    Low : t( 'workOrder.priority.low' )
  }
  return priorityMap[priority] || priority
}

const handleAction = command => {
  emit( 'action', { action : command, workOrder : props.workOrder } )
}

defineOptions( {
  name : 'WorkOrderCard'
} )
</script>

<style scoped lang="scss">
.work-order-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.overdue {
    border-left: 4px solid var(--el-color-danger);
  }

  &.high-priority {
    border-left: 4px solid var(--el-color-warning);
  }

  &.overdue.high-priority {
    border-left: 4px solid var(--el-color-danger);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .card-id {
    font-weight: 600;
    color: var(--el-color-primary);
    font-size: 14px;
  }

  .action-button {
    padding: 4px;
    color: var(--el-text-color-secondary);

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.card-content {
  .card-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-meta {
    display: flex;
    margin-bottom: 8px;
    font-size: 13px;

    .meta-label {
      color: var(--el-text-color-secondary);
      margin-right: 8px;
      min-width: 60px;
    }

    .meta-value {
      color: var(--el-text-color-primary);

      &.overdue-text {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }
  }

  .card-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 12px 0;

    .el-tag {
      font-size: 11px;
    }
  }

  .card-thumbnail {
    margin-top: 12px;

    .el-image {
      width: 100%;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
    }

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 80px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      font-size: 24px;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .work-order-card {
    padding: 12px;
    margin-bottom: 8px;
  }

  .card-content .card-title {
    font-size: 14px;
  }
}
</style>

<template>
  <div class="work-order-detail" v-if="workOrder">
    <!-- Detail Header -->
    <div class="detail-header">
      <div class="header-main">
        <h2 class="detail-title">{{ workOrder.name }}</h2>
        <div class="header-meta">
          <span class="work-order-id">#{{ workOrder.id }}</span>
          <span class="created-date">
            {{ $t('workOrder.form.createdOn') }}: {{ formatDate(workOrder.created_at) }}
          </span>
        </div>
      </div>

      <div class="header-actions">
        <el-button type="primary" size="small" @click="$emit('edit', workOrder)">
          <el-icon><Edit /></el-icon>
          {{ $t('workOrder.actions.edit') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('share', workOrder)">
          <el-icon><Share /></el-icon>
          {{ $t('workOrder.actions.share') }}
        </el-button>
      </div>
    </div>

    <!-- Status and Priority Section -->
    <div class="detail-section">
      <div class="section-row">
        <div class="field-group">
          <label class="field-label">{{ $t('workOrder.table.state') }}</label>
          <el-select v-model="localStatus" @change="handleStatusChange" size="small" style="width: 150px">
            <el-option label="Open" value="Open" />
            <el-option label="On Hold" value="On Hold" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Done" value="Done" />
          </el-select>
        </div>

        <div class="field-group">
          <label class="field-label">{{ $t('workOrder.table.priority') }}</label>
          <PriorityTag :priority="workOrder.priority" />
        </div>

        <div class="field-group">
          <label class="field-label">{{ $t('workOrder.table.assignedTo') }}</label>
          <span class="field-value">{{ workOrder.created_by || 'Unassigned' }}</span>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <div class="detail-section" v-if="workOrder.description">
      <h3 class="section-title">{{ $t('workOrder.table.description') }}</h3>
      <div class="description-content">
        <p>{{ workOrder.description }}</p>
      </div>
    </div>

    <!-- Work Order Details -->
    <div class="detail-section">
      <h3 class="section-title">{{ $t('workOrder.details.title') }}</h3>
      <div class="details-grid">
        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.workType') }}</label>
          <WorkTypeTag :work-type="workOrder.work_type" />
        </div>

        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.category') }}</label>
          <CategoryTag :category="workOrder.category" />
        </div>

        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.estimatedTime') }}</label>
          <span class="detail-value">
            {{ workOrder.estimated_minutes ? `${workOrder.estimated_minutes} min` : '-' }}
          </span>
        </div>

        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.dueDate') }}</label>
          <span class="detail-value" :class="{ overdue: isOverdue }">
            {{ workOrder.due_date ? formatDate(workOrder.due_date) : '-' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Attachments Section -->
    <div class="detail-section" v-if="hasAttachments">
      <h3 class="section-title">{{ $t('workOrder.attachments.title') }}</h3>
      <div class="attachments-grid">
        <div v-for="(image, index) in workOrder.image_path" :key="index" class="attachment-item">
          <el-image :src="image" fit="cover" :preview-src-list="workOrder.image_path" class="attachment-image">
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </div>

    <!-- Tracking Section -->
    <div class="detail-section">
      <h3 class="section-title">{{ $t('workOrder.tracking.title') }}</h3>
      <div class="tracking-actions">
        <el-button type="default" size="small" @click="$emit('add-parts')">
          <el-icon><Plus /></el-icon>
          {{ $t('workOrder.tracking.addParts') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('add-time')">
          <el-icon><Timer /></el-icon>
          {{ $t('workOrder.tracking.addTime') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('add-costs')">
          <el-icon><Money /></el-icon>
          {{ $t('workOrder.tracking.addCosts') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('view-procedure')">
          <el-icon><Document /></el-icon>
          {{ $t('workOrder.tracking.viewProcedure') }}
        </el-button>
      </div>
    </div>

    <!-- Comments Section -->
    <div class="detail-section">
      <h3 class="section-title">{{ $t('workOrder.comments.title') }}</h3>
      <div class="comments-container">
        <el-input
          v-model="newComment"
          type="textarea"
          :placeholder="$t('workOrder.comments.placeholder')"
          :rows="3"
          class="comment-input"
        />
        <el-button
          type="primary"
          size="small"
          @click="addComment"
          :disabled="!newComment.trim()"
          style="margin-top: 8px"
        >
          {{ $t('workOrder.comments.add') }}
        </el-button>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-detail">
    <el-empty :description="$t('workOrder.selectWorkOrder')" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Edit, Share, Plus, Timer, Money, Document, Picture } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import PriorityTag from '../PriorityTag.vue'
import WorkTypeTag from '../WorkTypeTag.vue'
import CategoryTag from '../CategoryTag.vue'

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    default : null
  }
} )

// Emits
const emit = defineEmits( [
  'edit',
  'share',
  'status-change',
  'add-parts',
  'add-time',
  'add-costs',
  'view-procedure',
  'add-comment'
] )

// State
const localStatus = ref( '' )
const newComment = ref( '' )

// Computed
const isOverdue = computed( () => {
  return props.workOrder?.due_date && new Date( props.workOrder.due_date ) < new Date()
} )

const hasAttachments = computed( () => {
  return props.workOrder?.image_path && props.workOrder.image_path.length > 0
} )

// Watchers
watch(
  () => props.workOrder,
  newWorkOrder => {
    if ( newWorkOrder ) {
      localStatus.value = newWorkOrder.state?.name || 'Open'
    }
  },
  { immediate : true }
)

// Methods
const formatDate = dateString => {
  return convertToLocalTime( dateString )
}

const handleStatusChange = newStatus => {
  emit( 'status-change', { workOrder : props.workOrder, status : newStatus } )
}

const addComment = () => {
  if ( newComment.value.trim() ) {
    emit( 'add-comment', { workOrder : props.workOrder, comment : newComment.value } )
    newComment.value = ''
  }
}

defineOptions( {
  name : 'WorkOrderDetail'
} )
</script>

<style scoped lang="scss">
.work-order-detail {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  .header-main {
    flex: 1;

    .detail-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .header-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      .work-order-id {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.detail-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
  }

  .section-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .field-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }

    .field-value {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }
}

.description-content {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 6px;

  p {
    margin: 0;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  .detail-item {
    .detail-label {
      display: block;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .detail-value {
      font-size: 14px;
      color: var(--el-text-color-primary);

      &.overdue {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }
  }
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;

  .attachment-item {
    .attachment-image {
      width: 100%;
      height: 120px;
      border-radius: 6px;
      overflow: hidden;
    }

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 120px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      font-size: 24px;
    }
  }
}

.tracking-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.comments-container {
  .comment-input {
    width: 100%;
  }
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

// Responsive design
@media (max-width: 768px) {
  .work-order-detail {
    padding: 16px;
  }

  .detail-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      align-self: stretch;
    }
  }

  .section-row {
    flex-direction: column;
    gap: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .tracking-actions {
    flex-direction: column;
  }
}
</style>

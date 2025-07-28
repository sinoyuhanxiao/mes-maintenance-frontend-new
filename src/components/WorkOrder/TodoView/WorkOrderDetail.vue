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
            <el-option label="Ready" value="Ready" />
            <el-option label="On Hold" value="On Hold" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Completed" value="Completed" />
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
        <div v-for="(image, index) in workOrder.image_list" :key="index" class="attachment-item">
          <el-image :src="image" fit="cover" :preview-src-list="workOrder.image_list" class="attachment-image">
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
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
import {
  Edit,
  Share,
  Picture
} from '@element-plus/icons-vue'
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
  return props.workOrder?.image_list && props.workOrder.image_list.length > 0
} )

// Watchers
watch(
  () => props.workOrder,
  newWorkOrder => {
    if ( newWorkOrder ) {
      localStatus.value = newWorkOrder.state?.name || 'Ready'
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
  padding-bottom: 16px;

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
  }

  .section-row {
    display: flex;
    gap: 70px;
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

// Recurrence Info Card
.recurrence-info-card {
  .info-card {
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
    border-radius: 8px;
    padding: 16px;

    .info-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .info-card-icon {
        color: var(--el-color-primary);
        font-size: 18px;
        margin-right: 8px;
      }

      .section-title {
        margin: 0;
        color: var(--el-color-primary);
        font-size: 16px;
      }
    }

    .info-card-content {
      .schedule-line {
        font-size: 14px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// Time & Cost Tracking Card
.time-cost-tracking-card {
  .tracking-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      font-weight: 500;
    }

    .tab-content {
      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .tab-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin: 0;
        }

        .add-edit-link {
          color: var(--el-color-primary);
          font-size: 13px;
          padding: 0;

          &:hover {
            color: var(--el-color-primary-dark-2);
          }
        }
      }

      .parts-cost-table,
      .time-logs-table {
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        overflow: hidden;

        .cost-table,
        .logs-table {
          :deep(.el-table__header) {
            background: var(--el-fill-color-light);
          }

          :deep(.el-table__body) {
            font-size: 13px;
          }

          :deep(.el-table td),
          :deep(.el-table th) {
            padding: 8px 12px;
          }
        }

        .cost-footer {
          background: var(--el-fill-color-lighter);
          padding: 12px 16px;
          border-top: 1px solid var(--el-border-color-light);

          .cost-total {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .cost-label {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .cost-value {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-color-success);
            }
          }
        }
      }

      // Safety Measures Content
      .safety-measures-content {
        .safety-section {
          margin-bottom: 24px;

          .safety-section-title {
            font-size: 15px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin: 0 0 12px 0;
            border-bottom: 1px solid var(--el-border-color-lighter);
            padding-bottom: 4px;
          }

          .safety-checklist {
            .safety-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid var(--el-border-color-lighter);

              &:last-child {
                border-bottom: none;
              }

              .safety-status {
                font-size: 12px;
                font-weight: 500;
                padding: 2px 8px;
                border-radius: 4px;

                &.completed {
                  background: var(--el-color-success-light-9);
                  color: var(--el-color-success);
                }

                &.pending {
                  background: var(--el-color-warning-light-9);
                  color: var(--el-color-warning);
                }
              }
            }
          }

          .ppe-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .ppe-tag {
              margin: 0;
            }
          }

          .safety-notes {
            p {
              margin: 4px 0;
              font-size: 14px;
              line-height: 1.5;
              color: var(--el-text-color-regular);
            }
          }
        }
      }

      // Procedures Content
      .procedures-content {
        .procedure-form {
          .procedure-step {
            border: 1px solid var(--el-border-color-light);
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;

            .step-header {
              background: var(--el-fill-color-light);
              padding: 12px 16px;
              display: flex;
              align-items: center;
              gap: 12px;

              .step-number {
                background: var(--el-color-primary);
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
              }

              .step-title {
                flex: 1;
                margin: 0;
                font-size: 15px;
                font-weight: 500;
                color: var(--el-text-color-primary);
              }
            }

            .step-content {
              padding: 16px;

              .step-description {
                margin: 0 0 16px 0;
                font-size: 14px;
                color: var(--el-text-color-regular);
                line-height: 1.5;
              }

              .inspection-form,
              .measurement-form,
              .replacement-form,
              .calibration-form {
                .form-row {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin-bottom: 12px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  label {
                    min-width: 140px;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--el-text-color-primary);
                  }

                  .unit {
                    font-size: 13px;
                    color: var(--el-text-color-secondary);
                    margin-left: 4px;
                  }

                  .range {
                    font-size: 12px;
                    color: var(--el-text-color-placeholder);
                    margin-left: 8px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Related Assets Section
.related-assets-section {
  .assets-container {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .asset-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 120px;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .asset-image {
        margin-bottom: 8px;

        .asset-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--el-color-primary-light-9);
          border: 2px solid var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--el-color-primary);
          font-size: 24px;
        }
      }

      .asset-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-align: center;
        line-height: 1.4;
      }
    }
  }
}

// Asset Tree Modal
.asset-tree-content {
  position: relative;
  padding: 20px 0;

  .tree-level {
    margin-bottom: 32px;

    .level-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--el-border-color-light);
    }

    .equipment-node {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      background: var(--el-bg-color);
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--el-color-primary);
      }

      .node-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: var(--el-fill-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        color: var(--el-text-color-secondary);

        &.highlighted {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          border: 2px solid var(--el-color-primary);
        }
      }

      .node-info {
        flex: 1;

        .node-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .node-type {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }

        .node-status {
          display: flex;
          align-items: center;
        }
      }

      &.parent-node {
        background: var(--el-color-info-light-9);
        border-color: var(--el-color-info-light-7);
      }

      &.current-node {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        border-width: 2px;
      }

      &.sub-node {
        background: var(--el-fill-color-lighter);
      }
    }

    &.subcomponents-level {
      .subcomponents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;

        .equipment-node {
          margin-bottom: 0;
        }
      }
    }
  }

  .tree-connections {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;

    .connection-line {
      position: absolute;
      background: var(--el-color-primary-light-7);

      &.parent-to-current {
        width: 2px;
        height: 40px;
        left: 50%;
        top: 120px;
        transform: translateX(-50%);
      }

      &.current-to-subs {
        width: 2px;
        height: 40px;
        left: 50%;
        top: 280px;
        transform: translateX(-50%);
      }
    }
  }
}

// Modal styles
.modal-content {
  padding: 20px 0;
  text-align: center;
  color: var(--el-text-color-secondary);

  p {
    margin: 8px 0;
    line-height: 1.6;
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

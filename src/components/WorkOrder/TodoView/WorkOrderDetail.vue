<template>
  <div class="work-order-detail" v-if="workOrder">
    <!-- Detail Header -->
    <div class="detail-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <h2 class="detail-title">{{ workOrder.name }}</h2>
            <div class="header-meta">
              <span class="work-order-id">#{{ workOrder.id }}</span>
              <span class="created-date">
                {{ $t('workOrder.form.createdOn') }}: {{ formatDate(workOrder.created_at) }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="header-actions">
            <el-dropdown trigger="click" @command="handleHeaderAction">
              <el-button type="text" size="small" class="action-button">
                <el-icon class="rotated-icon"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>
                    {{ $t('workOrder.actions.edit') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="share">
                    <el-icon><Share /></el-icon>
                    {{ $t('workOrder.actions.share') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="export" divided>
                    <el-icon><Download /></el-icon>
                    {{ $t('workOrder.actions.export') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- General Detail Section -->
    <div class="detail-section">
      <el-descriptions :column="4" class="general-details-descriptions">
        <el-descriptions-item :label="$t('workOrder.table.state')">
          <el-select v-model="localStatus" @change="handleStatusChange" size="small" style="width: 150px">
            <el-option label="Ready" value="Ready" />
            <el-option label="On Hold" value="On Hold" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Completed" value="Completed" />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.priority')">
          <PriorityTag :priority="workOrder.priority" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.assignedTo')">
          <span class="field-value">{{ workOrder.created_by || 'Unassigned' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Supervisor">
          <span class="field-value">Erik Yu</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.workType')">
          <WorkTypeTag :work-type="workOrder.work_type" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.category')">
          <CategoryTag :category="workOrder.category" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.estimatedTime')">
          <span class="detail-value">
            {{ workOrder.estimated_minutes ? `${workOrder.estimated_minutes} min` : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.dueDate')">
          <span class="detail-value" :class="{ overdue: isOverdue }">
            {{ workOrder.due_date ? formatDate(workOrder.due_date) : '-' }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Description Section -->
    <div class="detail-section" v-if="workOrder.description">
      <el-descriptions :column="1" class="general-details-descriptions">
        <el-descriptions-item :label="$t('workOrder.table.description')">
          <div class="description-content">
            <p>{{ workOrder.description }}</p>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Attachments Section -->
    <div class="detail-section" v-if="hasAttachments">
      <el-divider />
      <h3 class="section-title">{{ $t('workOrder.attachments.title') }}</h3>
      <el-row :gutter="12">
        <el-col :span="6" v-for="(image, index) in workOrder.image_list" :key="index">
          <div class="attachment-item">
            <el-image :src="image" fit="cover" :preview-src-list="workOrder.image_list" class="attachment-image">
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Schedule Conditions Section -->
    <div v-if="isRecurring" class="detail-section schedule-conditions-section">
      <!-- Schedule Conditions Card -->
      <div class="schedule-conditions-card">
        <!-- Header -->
        <div class="schedule-header">
          <div class="header-left">
            <h3 class="schedule-title">{{ $t('workOrder.schedule.title') }}</h3>
          </div>
          <el-button
            type="default"
            size="small"
            @click="openTimelineModal"
            :title="$t('workOrder.schedule.viewTimeline')"
            class="timeline-button"
          >
            <el-icon><View /></el-icon>
            {{ $t('workOrder.schedule.viewTimeline') }}
          </el-button>
        </div>

        <!-- Content Grid -->
        <div class="schedule-content-grid">
          <!-- Repeat Type -->
          <div class="data-section">
            <div class="data-label">{{ $t('workOrder.schedule.repeatTypeLabel') }}</div>
            <div class="data-value">{{ $t('workOrder.schedule.timeBased') }}</div>
          </div>

          <!-- Frequency -->
          <div class="data-section">
            <div class="data-label">{{ $t('workOrder.schedule.frequencyLabel') }}</div>
            <div class="data-value">{{ $t('workOrder.schedule.weeklyPattern') }}</div>
          </div>

          <!-- Continued From -->
          <div class="data-section">
            <div class="data-label">{{ $t('workOrder.schedule.continuedFromLabel') }}</div>
            <div class="data-value linked-value" @click="navigateToLinkedOrder">Daily Wash - Washin Washer</div>
          </div>

          <!-- Weekly Pattern -->
          <div class="data-section weekly-pattern-section">
            <div class="data-label">{{ $t('workOrder.schedule.weeklyPatternLabel') }}</div>
            <div class="day-indicators">
              <div v-for="day in weekDays" :key="day.name" class="day-indicator" :class="{ active: day.active }">
                {{ day.name.charAt(0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Time & Cost Tracking Card -->
    <div class="detail-section time-cost-tracking-card">
      <el-divider />
      <h3 class="section-title">Tracking</h3>

      <!-- Tracking Tabs -->
      <el-tabs v-model="activeTrackingTab" class="tracking-tabs">
        <!-- Combined Costs Tab -->
        <el-tab-pane label="Costs" name="costs">
          <div class="tab-content">
            <div class="no-data-placeholder">
              <el-empty description="No Data" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>

        <!-- Safety Measures Tab -->
        <el-tab-pane label="Safety Measures" name="safetyMeasures">
          <div class="tab-content">
            <div class="no-data-placeholder">
              <el-empty description="No Data" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>

        <!-- Procedures Tab -->
        <el-tab-pane label="Procedures" name="procedures">
          <div class="tab-content">
            <div class="no-data-placeholder">
              <el-empty description="No Data" :image-size="120" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Work Order Timeline Modal -->
    <el-dialog
      v-model="timelineModalVisible"
      :title="$t('workOrder.timeline.title')"
      width="900px"
      :before-close="handleTimelineModalClose"
      class="timeline-modal"
    >
      <Timeline :timeline-events="timelineEvents" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timelineModalVisible = false">{{ $t('workOrder.actions.cancel') }}</el-button>
          <el-button type="primary" @click="exportTimeline">
            <el-icon><Download /></el-icon>
            {{ $t('workOrder.timeline.export') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-detail">
    <el-empty :description="$t('workOrder.selectWorkOrder')" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Edit, Share, Picture, Download, View, MoreFilled } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import PriorityTag from '../PriorityTag.vue'
import WorkTypeTag from '../WorkTypeTag.vue'
import CategoryTag from '../CategoryTag.vue'
import Timeline from '../Timeline/Timeline.vue'
import { ElMessage } from 'element-plus'

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
  'export',
  'status-change',
  'add-parts',
  'add-time',
  'add-costs',
  'view-procedure',
  'add-comment'
] )

// State
const localStatus = ref( '' )
const activeTrackingTab = ref( 'costs' )
const timelineModalVisible = ref( false )

// Week days for schedule display
const weekDays = ref( [
  { name : 'Mon', active : false },
  { name : 'Tue', active : true },
  { name : 'Wed', active : false },
  { name : 'Thu', active : false },
  { name : 'Fri', active : true },
  { name : 'Sat', active : true },
  { name : 'Sun', active : false }
] )

// Timeline events data - Empty for now
const timelineEvents = ref( [] )

// Computed
const isOverdue = computed( () => {
  return props.workOrder?.due_date && new Date( props.workOrder.due_date ) < new Date()
} )

const hasAttachments = computed( () => {
  return props.workOrder?.image_list && props.workOrder.image_list.length > 0
} )

const isRecurring = computed( () => {
  // Check if work order has recurrence (not type 1 which means "Does not repeat")
  return props.workOrder?.recurrence_type?.id && props.workOrder.recurrence_type.id !== 1
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

const handleHeaderAction = action => {
  switch ( action ) {
    case 'edit':
      emit( 'edit', props.workOrder )
      break
    case 'share':
      emit( 'share', props.workOrder )
      break
    case 'export':
      emit( 'export', props.workOrder )
      break
    default:
      console.warn( `Unhandled header action: ${action}` )
  }
}

// Timeline modal methods
const openTimelineModal = () => {
  timelineModalVisible.value = true
}

const handleTimelineModalClose = () => {
  timelineModalVisible.value = false
}

const exportTimeline = () => {
  ElMessage.success( 'Timeline export will be implemented by Yellow Guy' )
  timelineModalVisible.value = false
}

const navigateToLinkedOrder = () => {
  ElMessage.info( 'Navigation to linked work order will be implemented by Yellow Guy' )
}

defineOptions( {
  name : 'WorkOrderDetail'
} )
</script>

<style scoped lang="scss">
.work-order-detail {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-top: 24px;
  padding: 0 24px 24px 24px;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.detail-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;

  .header-main {
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
    justify-content: flex-end;

    .action-button {
      padding: 4px;
      color: var(--el-text-color-secondary);

      &:hover {
        color: var(--el-color-primary);
      }

      .rotated-icon {
        transform: rotate(90deg);
      }
    }
  }
}

.detail-section {
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
  }

  .section-row {
    display: flex;
    gap: 12px;
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

  .general-details-descriptions {
    :deep(.el-descriptions__header) {
      margin-bottom: 0;
    }

    :deep(.el-descriptions__body) {
      background: transparent;
    }

    :deep(.el-descriptions__table) {
      border: none;
      border-collapse: separate;
      border-spacing: 0 16px;
    }

    :deep(.el-descriptions__cell) {
      padding: 0 70px 0 0;
      border: none;
      vertical-align: top;

      &:last-child {
        padding-right: 0;
      }
    }

    :deep(.el-descriptions__label) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
      margin-bottom: 4px;
      display: block;
    }

    :deep(.el-descriptions__content) {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  .work-order-details-descriptions {
    :deep(.el-descriptions__cell) {
      padding: 0 16px 16px 0;

      &:last-child {
        padding-right: 0;
      }
    }
  }
}

.description-content {
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

// Attachments grid styles removed - replaced by el-row/el-col

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

// Schedule Conditions Section
.schedule-conditions-section {
  margin-top: 24px;
  .schedule-conditions-card {
    background: var(--el-bg-color);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .schedule-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .timeline-button {
        font-size: 13px;
        font-weight: 500;
        padding: 12px 14px;

        &:hover {
          background-color: var(--el-color-primary-light-8);
          border-color: var(--el-color-primary-light-3);
          color: var(--el-color-primary-dark-2);
        }

        .el-icon {
          margin-right: 6px;
        }
      }
    }

    .schedule-content-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      align-items: start;

      @media (max-width: 1023px) {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .data-section {
        &.weekly-pattern-section {
          @media (min-width: 1024px) {
            text-align: right;
          }
        }

        .data-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .data-value {
          font-size: 14px;
          color: var(--el-text-color-primary);
          font-weight: 500;
          padding-top: 2px;

          &.linked-value {
            color: var(--el-color-primary);
            cursor: pointer;
            transition: color 0.2s ease;

            &:hover {
              color: var(--el-color-primary-dark-2);
              text-decoration: underline;
            }
          }
        }

        .day-indicators {
          display: flex;
          gap: 6px;
          justify-content: flex-start;

          @media (max-width: 1023px) {
            justify-content: center;
          }

          @media (min-width: 1024px) {
            justify-content: flex-end;
          }

          .day-indicator {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            transition: all 0.2s ease;

            &.active {
              background-color: var(--el-color-primary);
              color: white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            &:not(.active) {
              background-color: var(--el-fill-color-light);
              color: var(--el-text-color-secondary);
              border: 1px solid var(--el-border-color-lighter);
            }
          }
        }
      }
    }
  }
}

// Timeline Modal Styles
.timeline-modal {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    color: white;
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        font-size: 18px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
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

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

// No Data Placeholder
.no-data-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: 200px;
}

@media (max-width: 768px) {
  .work-order-detail {
    padding: 16px;
  }

  .detail-header {
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
}
</style>

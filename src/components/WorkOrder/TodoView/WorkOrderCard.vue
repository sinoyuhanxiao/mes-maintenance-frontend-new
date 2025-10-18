<template>
  <div
    class="work-order-card"
    :class="{
      selected: isSelected,
      incomplete: isIncomplete,
      'high-priority': isHighPriority,
      'failed-effect': isFailed && settingsStore.failedWorkOrderEffect,
      'pending-approval': isPendingApproval,
    }"
    @click="$emit('select', workOrder)"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="card-id">#{{ workOrder.id }}</div>
      <div class="card-actions" v-show="false">
        <el-dropdown trigger="click" @command="handleAction">
          <el-button type="text" size="small" class="action-button">
            <el-icon class="rotated-icon"><MoreFilled /></el-icon>
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
              <StartWorkOrderAction
                :work-order="workOrder"
                @start="() => emit('action', { action: 'start', workOrder })"
                :disabled="true"
              />
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
      <!-- Main Content Area -->
      <div class="content-main">
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
          <span class="meta-value" :class="{ 'incomplete-text': isIncomplete }">
            {{ formatDate(workOrder.due_date) }}
          </span>
        </div>

        <!-- Status and Priority Badges -->
        <div class="card-badges">
          <el-tag
            :type="isPendingApproval ? 'success' : getStatusTagType(workOrder.state?.name)"
            :effect="workOrder.state?.name === 'Incomplete' || isPendingApproval ? 'dark' : 'plain'"
          >
            {{ getStatusName(workOrder.state?.name) }}
          </el-tag>
          <el-tag :type="getPriorityTagType(workOrder.priority?.name)" effect="plain">
            <el-icon style="margin: 0 0 4px 0">
              <Flag />
            </el-icon>
            {{ getPriorityName(workOrder.priority?.name) }}
          </el-tag>
          <RecurrenceTag
            v-if="workOrder.recurrence_type && workOrder.recurrence_type.id !== 1"
            :recurrence-type="workOrder.recurrence_type"
          />

          <!--          <el-tag v-if="isIncomplete" type="danger" size="small" effect="dark">-->
          <!--            {{ $t('workOrder.status.incomplete') }}-->
          <!--          </el-tag>-->
        </div>
      </div>

      <!-- Circular Thumbnail on Right -->
      <div class="card-thumbnail-circle" v-if="workOrder.image_list && workOrder.image_list.length">
        <el-image
          :src="workOrder.image_list[0]"
          fit="cover"
          :preview-src-list="workOrder.image_list"
          class="circular-image"
          :z-index="2000"
          preview-teleported
        >
          <template #error>
            <div class="image-slot-circle">
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
import StartWorkOrderAction from '@/components/WorkOrder/Actions/StartWorkOrderAction.vue'
import RecurrenceTag from '@/components/WorkOrder/Display/RecurrenceTag.vue'
import { convertToLocalTime } from '@/utils/datetime'
import { useSettingsStore } from '@/store'

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
const settingsStore = useSettingsStore()

// Computed
const isIncomplete = computed( () => {
  return props.workOrder.state?.id === 13 || props.workOrder.state?.name === 'Incomplete'
} )

const isFailed = computed( () => {
  return props.workOrder.state?.name === 'Failed'
} )

const isHighPriority = computed( () => {
  return props.workOrder.priority?.name === 'High' || props.workOrder.priority?.name === 'Urgent'
} )

const isPendingApproval = computed( () => {
  return props.workOrder.state?.id === 14
} )

// Methods
const formatDate = dateString => {
  return convertToLocalTime( dateString )
}

const getStatusTagType = status => {
  switch ( status ) {
    case 'Failed':
      return 'danger'
    case 'Incomplete':
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
      return 'primary'
    case 'Medium':
      return 'warning'
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
  margin-bottom: 4px;
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

  &.incomplete {
    border-left: 2px solid var(--el-color-danger);
  }

  //&.high-priority {
  //  border-left: 2px solid var(--el-color-warning);
  //}

  //&.incomplete.high-priority {
  //  border-left: 2px solid var(--el-color-danger);
  //}

  // Cyberpunk-style visual effect for failed work orders - FAILURE emphasis
  &.failed-effect {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(245, 108, 108, 0.18), rgba(255, 77, 79, 0.12), rgba(0, 0, 0, 0.08));
    border: 3px solid transparent;
    background-clip: padding-box;

    // FAILURE warning stripes
    background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(245, 108, 108, 0.08) 10px,
        rgba(245, 108, 108, 0.08) 20px
      ),
      linear-gradient(135deg, rgba(245, 108, 108, 0.18), rgba(255, 77, 79, 0.12), rgba(0, 0, 0, 0.08));

    // Aggressive animated danger border with red dominance
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      padding: 3px;
      background: linear-gradient(
        90deg,
        var(--el-color-danger),
        rgba(245, 108, 108, 0.9),
        #ff0000,
        var(--el-color-danger),
        rgba(245, 108, 108, 0.9),
        #ff0000
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: dangerBorderPulse 2s linear infinite;
      background-size: 400% 100%;
      pointer-events: none;
      filter: brightness(1.2) saturate(1.4);
    }

    // Strong danger-dominant glows - immediate "FAILURE" recognition
    &:hover {
      box-shadow: 0 0 40px var(--el-color-danger), 0 0 80px rgba(245, 108, 108, 0.9), 0 0 120px rgba(255, 77, 79, 0.6),
        inset 0 0 40px rgba(245, 108, 108, 0.3);
    }

    &.selected {
      box-shadow: 0 0 50px var(--el-color-danger), 0 0 100px rgba(245, 108, 108, 1), 0 0 150px rgba(255, 77, 79, 0.7),
        0 0 30px rgba(64, 158, 255, 0.4), inset 0 0 50px rgba(245, 108, 108, 0.4);
    }

    // Card header - full danger mode
    .card-header {
      background: linear-gradient(90deg, var(--el-color-danger), rgba(245, 108, 108, 0.8), var(--el-color-danger));
      background-size: 200% 100%;
      animation: headerDangerFlow 3s linear infinite;
      margin: -16px -16px 12px -16px;
      padding: 12px 16px;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 4px 15px rgba(245, 108, 108, 0.6);

      .card-id {
        color: #fff;
        font-weight: 700;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(245, 108, 108, 1);
        font-size: 16px;
        letter-spacing: 1px;
      }
    }

    // Strong glitch effect on title - emphasizes failure
    .card-title {
      position: relative;
      color: var(--el-color-danger) !important;
      font-weight: 700 !important;
      animation: failureGlitch 3s infinite;
      text-shadow: 0 0 10px rgba(245, 108, 108, 0.8), 0 0 20px rgba(255, 77, 79, 0.6);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      filter: contrast(1.2);
    }

    // Make all text danger-tinted
    .card-meta,
    .meta-label,
    .meta-value {
      color: var(--el-color-danger);
      font-weight: 500;
    }

    .card-badges {
      .el-tag {
        position: relative;
        background: linear-gradient(135deg, var(--el-color-danger), #ff0000, var(--el-color-danger)) !important;
        background-size: 200% 200%;
        border: 2px solid #ff0000 !important;
        color: #fff !important;
        font-weight: 700 !important;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 6px 16px !important;
        box-shadow: 0 0 15px rgba(245, 108, 108, 0.9), 0 0 30px rgba(255, 77, 79, 0.7),
          inset 0 0 10px rgba(255, 255, 255, 0.3);
        animation: dangerBadgePulse 1.5s ease-in-out infinite, badgeGlitch 4s infinite;
        filter: saturate(1.5) brightness(1.1);

        // Glitch overlay
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(255, 255, 255, 0.1) 1px,
            rgba(255, 255, 255, 0.1) 2px
          );
          pointer-events: none;
        }

        // Neon border effect
        &::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, #ff0000, #ff6b6b, #ff0000, #ff6b6b);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: badgeBorderFlow 2s linear infinite;
          background-size: 300% 300%;
        }
      }
    }
  }
}

// Aggressive danger border pulse
@keyframes dangerBorderPulse {
  0% {
    background-position: 0% 50%;
    filter: brightness(1.2) saturate(1.4);
  }
  50% {
    background-position: 100% 50%;
    filter: brightness(1.5) saturate(1.6);
  }
  100% {
    background-position: 0% 50%;
    filter: brightness(1.2) saturate(1.4);
  }
}

// Glitchy scanline movement
@keyframes scanlineGlitch {
  0% {
    transform: translateY(0);
    opacity: 0.8;
  }
  45% {
    transform: translateY(90%);
    opacity: 0.8;
  }
  50% {
    transform: translateY(90%);
    opacity: 0.3;
  }
  55% {
    transform: translateY(95%);
    opacity: 0.9;
  }
  100% {
    transform: translateY(100%);
    opacity: 0.8;
  }
}

// Strong failure glitch effect
@keyframes failureGlitch {
  0%,
  85%,
  100% {
    text-shadow: 0 0 10px rgba(245, 108, 108, 0.8);
    transform: translate(0, 0);
  }
  87% {
    text-shadow: 3px 0 0 var(--el-color-danger), -3px 0 0 rgba(255, 0, 0, 0.8), 0 0 15px rgba(245, 108, 108, 1);
    transform: translate(-2px, 0);
  }
  89% {
    text-shadow: -3px 0 0 var(--el-color-danger), 3px 0 0 rgba(255, 0, 0, 0.8), 0 0 15px rgba(245, 108, 108, 1);
    transform: translate(2px, 0);
  }
  91% {
    text-shadow: 2px 0 0 var(--el-color-danger), -2px 0 0 rgba(255, 0, 0, 0.8);
    transform: translate(1px, 0);
  }
}

// Badge pulse for extra attention
@keyframes badgePulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(245, 108, 108, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 108, 108, 0.9);
  }
}

// Danger badge intense pulse
@keyframes dangerBadgePulse {
  0%,
  100% {
    box-shadow: 0 0 15px rgba(245, 108, 108, 0.9), 0 0 30px rgba(255, 77, 79, 0.7),
      inset 0 0 10px rgba(255, 255, 255, 0.3);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 0 25px rgba(245, 108, 108, 1), 0 0 50px rgba(255, 77, 79, 0.9), 0 0 75px rgba(255, 0, 0, 0.5),
      inset 0 0 15px rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
}

// Badge glitch effect
@keyframes badgeGlitch {
  0%,
  90%,
  100% {
    background-position: 0% 50%;
  }
  92% {
    background-position: 100% 50%;
    filter: saturate(2) brightness(1.3);
  }
  94% {
    background-position: 50% 50%;
    filter: saturate(1.5) brightness(1.1);
  }
}

// Badge border flow
@keyframes badgeBorderFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// Header danger flow
@keyframes headerDangerFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
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
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .content-main {
    flex: 1;
    min-width: 0; // Prevents flex item from overflowing

    .card-title {
      font-size: 17px;
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

        &.incomplete-text {
          color: var(--el-color-danger);
          font-weight: 500;
        }
      }
    }

    .card-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 12px 0 0 0;

      .el-tag {
        font-size: 11px;
      }
    }
  }

  .card-thumbnail-circle {
    flex-shrink: 0;
    width: 80px;
    height: 80px;

    .circular-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--el-border-color-lighter);
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        border-color: var(--el-color-primary);
        transform: scale(1.05);
      }

      // Only apply border-radius to the image container, not the preview
      :deep(.el-image__inner) {
        border-radius: 50%;
        object-fit: cover;
      }

      // Ensure preview functionality works correctly
      :deep(.el-image__preview) {
        border-radius: 0 !important;
      }
    }

    .image-slot-circle {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80px;
      height: 80px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      font-size: 24px;
      border-radius: 50%;
      border: 2px solid var(--el-border-color-lighter);
    }
  }
}

@media (max-width: 768px) {
  .work-order-card {
    padding: 12px;
    margin-bottom: 8px;
  }

  .card-content {
    gap: 12px;

    .content-main .card-title {
      font-size: 14px;
    }

    .card-thumbnail-circle {
      width: 60px;
      height: 60px;

      .circular-image {
        width: 60px;
        height: 60px;
      }

      .image-slot-circle {
        width: 60px;
        height: 60px;
        font-size: 20px;
      }
    }
  }
}

// Global styles to ensure image preview works correctly
:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}

:deep(.el-image-viewer__mask) {
  z-index: 2999 !important;
}

// Ensure the preview image is not affected by circular styling
:deep(.el-image-viewer__canvas) {
  .el-image-viewer__img {
    border-radius: 0 !important;
  }
}

.rotated-icon {
  display: inline-block;
  transform: rotate(90deg);
}
</style>

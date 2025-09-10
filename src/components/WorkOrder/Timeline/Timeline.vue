<template>
  <div class="timeline-content">
    <!-- Stats Bar Header -->
    <div class="timeline-stats-bar">
      <div class="filter-controls">
        <div class="date-range-filter">
          <label class="filter-label">{{ $t('workOrder.timeline.timeRange') }}</label>
          <el-date-picker
            v-model="timelineFilter.dateRange"
            type="daterange"
            :range-separator="$t('workOrder.timeline.to')"
            :start-placeholder="$t('workOrder.timeline.startDate')"
            :end-placeholder="$t('workOrder.timeline.endDate')"
            size="small"
            class="date-range-picker"
          />
        </div>
        <el-button type="primary" size="small" @click="applyTimelineFilter" class="apply-filter-btn">
          {{ $t('workOrder.timeline.apply') }}
        </el-button>
      </div>

      <div class="metrics-group">
        <div class="metric-item">
          <span class="metric-value">{{ filteredTimelineEvents.length }}</span>
          <span class="metric-label">{{ $t('workOrder.timeline.totalEvents') }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-value">{{ averageTimeConsumed }}</span>
          <span class="metric-label">{{ $t('workOrder.timeline.avgTimeConsumed') }}</span>
        </div>
      </div>
    </div>

    <!-- Timeline Body -->
    <div class="timeline-body">
      <el-timeline class="work-order-timeline">
        <el-timeline-item
          v-for="event in filteredTimelineEvents"
          :key="event.id"
          :timestamp="event.timestamp"
          :type="event.type"
          :color="event.color"
          :icon="event.icon"
          placement="top"
          :hollow="event.hollow"
          size="large"
        >
          <div class="event-card">
            <div class="event-header">
              <h5 class="event-title">{{ event.title }}</h5>
              <div class="event-badges">
                <el-tag :type="getStatusTagType(event.status)" size="small">
                  {{ event.status }}
                </el-tag>
                <el-tag v-if="isEventOverdue(event)" type="danger" size="small" class="overdue-badge">
                  {{ $t('workOrder.timeline.overdue') }}
                </el-tag>
              </div>
            </div>

            <p class="event-description">{{ event.description }}</p>

            <div class="event-details">
              <div class="detail-item" v-if="event.duration">
                <span class="detail-label">{{ $t('workOrder.timeline.duration') }}:</span>
                <span class="detail-value">{{ event.duration }}</span>
              </div>

              <div class="detail-item" v-if="event.assignees && event.assignees.length > 0">
                <span class="detail-label">{{ $t('workOrder.timeline.assignees') }}:</span>
                <div class="assignees-list">
                  <el-avatar
                    v-for="assignee in event.assignees.slice(0, 2)"
                    :key="assignee.id"
                    :size="24"
                    :src="assignee.avatar"
                    class="assignee-avatar"
                  >
                    {{ assignee.name.charAt(0) }}
                  </el-avatar>
                  <span v-if="event.assignees.length > 2" class="overflow-indicator">
                    +{{ event.assignees.length - 2 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  timelineEvents: {
    type: Array,
    default: () => [],
  },
})

// Timeline filter state
const timelineFilter = ref({
  dateRange: null,
})

// Timeline filtering and computed properties
const filteredTimelineEvents = computed(() => {
  if (!timelineFilter.value.dateRange) {
    return props.timelineEvents
  }

  const [startDate, endDate] = timelineFilter.value.dateRange
  return props.timelineEvents.filter(event => {
    const eventDate = new Date(event.timestamp)
    return eventDate >= startDate && eventDate <= endDate
  })
})

const averageTimeConsumed = computed(() => {
  const completedEvents = filteredTimelineEvents.value.filter(event => event.status === 'Completed' && event.duration)

  if (completedEvents.length === 0) return '0h 0m'

  const totalMinutes = completedEvents.reduce((total, event) => {
    const duration = event.duration
    const hours = parseInt(duration.match(/(\d+)h/)?.[1] || '0')
    const minutes = parseInt(duration.match(/(\d+)m/)?.[1] || '0')
    return total + hours * 60 + minutes
  }, 0)

  const avgMinutes = Math.round(totalMinutes / completedEvents.length)
  const hours = Math.floor(avgMinutes / 60)
  const mins = avgMinutes % 60

  return `${hours}h ${mins}m`
})

const applyTimelineFilter = () => {
  ElMessage.success('Timeline filter applied')
}

const getStatusTagType = status => {
  const statusMap = {
    Completed: 'success',
    'In Progress': 'primary',
    Pending: 'info',
  }
  return statusMap[status] || 'info'
}

const isEventOverdue = event => {
  if (!event.plannedEnd || !event.actualEnd) return false
  return new Date(event.actualEnd) > new Date(event.plannedEnd)
}

defineOptions({
  name: 'Timeline',
})
</script>

<style scoped lang="scss">
.timeline-content {
  .timeline-stats-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-light);

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 16px;

      .date-range-filter {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-label {
          font-size: 14px;
          color: var(--el-text-color-primary);
          font-weight: 500;
          white-space: nowrap;
        }

        .date-range-picker {
          width: 280px;
        }
      }

      .apply-filter-btn {
        white-space: nowrap;
      }
    }

    .metrics-group {
      display: flex;
      gap: 32px;

      .metric-item {
        text-align: center;

        .metric-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--el-color-primary);
          line-height: 1;
        }

        .metric-label {
          display: block;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
  }

  .timeline-body {
    .work-order-timeline {
      padding: 24px;
      max-height: 500px;
      overflow-y: auto;

      :deep(.el-timeline-item__timestamp) {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        font-weight: 500;
      }

      :deep(.el-timeline-item__node) {
        border-width: 3px;
      }

      :deep(.el-timeline-item__wrapper) {
        padding-left: 32px;
      }

      .event-card {
        background: white;
        border: 1px solid var(--el-border-color-light);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .event-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            flex: 1;
          }

          .event-badges {
            display: flex;
            gap: 8px;
            flex-shrink: 0;

            .overdue-badge {
              margin-left: 4px;
            }
          }
        }

        .event-description {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;

            .detail-label {
              font-size: 13px;
              color: var(--el-text-color-secondary);
              font-weight: 500;
              min-width: 80px;
            }

            .detail-value {
              font-size: 13px;
              color: var(--el-text-color-primary);
              font-weight: 500;
            }

            .assignees-list {
              display: flex;
              align-items: center;
              gap: 8px;

              .assignee-avatar {
                border: 2px solid var(--el-border-color-light);
                font-size: 12px;
                font-weight: 600;
              }

              .overflow-indicator {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                background: var(--el-fill-color-light);
                padding: 4px 8px;
                border-radius: 12px;
                border: 1px solid var(--el-border-color-light);
              }
            }
          }
        }
      }
    }
  }
}
</style>

<template>
  <div v-if="loading" class="timeline-loading">
    <el-skeleton :rows="10" animated />
  </div>
  <div v-else class="timeline-content">
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
      </div>

      <div class="metrics-group">
        <div class="metric-item">
          <span class="metric-value">{{ totalElements }}</span>
          <span class="metric-label">Total WOs</span>
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
          :type="isCurrentWorkOrder(event) ? 'success' : event.type"
          :color="isCurrentWorkOrder(event) ? 'var(--el-color-success)' : event.color"
          :icon="event.icon"
          placement="top"
          :hollow="event.hollow"
          size="large"
          :class="{ 'current-work-order': isCurrentWorkOrder(event) }"
        >
          <div class="event-card" :class="{ 'current-work-order-card': isCurrentWorkOrder(event) }">
            <div class="event-header">
              <div class="title-section">
                <h5 class="event-title">{{ event.title }}</h5>
                <span class="work-order-id">#{{ event.id }}</span>
                <el-tag v-if="isCurrentWorkOrder(event)" type="success" size="small" class="current-badge" plain>
                  {{ $t('workOrder.timeline.current') }}
                </el-tag>
              </div>
              <div class="event-badges">
                <el-tag :type="getStatusTagType(event.status)" size="small">
                  {{ event.status }}
                </el-tag>
                <el-tag v-if="event.taskCount !== undefined" type="success" size="small">
                  {{ event.taskCount }} {{ $t('workOrder.timeline.tasks') }}
                </el-tag>
                <el-tag v-if="isEventOverdue(event)" type="danger" size="small" class="overdue-badge">
                  {{ $t('workOrder.timeline.overdue') }}
                </el-tag>
              </div>
            </div>

            <p class="event-description">{{ event.description }}</p>

            <div class="event-details">
              <div class="detail-column">
                <div class="detail-item" v-if="event.dueDate">
                  <span class="detail-label">{{ $t('workOrder.table.dueDate') }}:</span>
                  <span class="detail-value" :class="{ 'overdue-text': event.isOverdue }">
                    {{ formatDateTime(event.dueDate) }}
                  </span>
                </div>

                <div class="detail-item" v-if="event.category">
                  <span class="detail-label">{{ $t('workOrder.table.category') }}:</span>
                  <span class="detail-value">{{ getCategoryName(event.category) }}</span>
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
                      {{ assignee.name ? assignee.name.charAt(0).toUpperCase() : '?' }}
                    </el-avatar>
                    <span v-if="event.assignees.length > 2" class="overflow-indicator">
                      +{{ event.assignees.length - 2 }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-column">
                <div class="detail-item" v-if="event.priority">
                  <span class="detail-label">{{ $t('workOrder.table.priority') }}:</span>
                  <span
                    class="detail-value priority-tag"
                    :class="getPriorityClass(event.priority)"
                    :style="{ color: getPriorityColor(event.priority?.name) }"
                  >
                    <el-icon :style="{ color: getPriorityColor(event.priority?.name), marginRight: '4px' }">
                      <Flag />
                    </el-icon>
                    {{ getPriorityName(event.priority) }}
                  </span>
                </div>

                <div class="detail-item" v-if="event.estimatedTime">
                  <span class="detail-label">{{ $t('workOrder.table.estimatedTime') }}:</span>
                  <span class="detail-value">{{ event.estimatedTime }}</span>
                </div>

                <div class="detail-item" v-if="event.actualTimeConsumed">
                  <span class="detail-label">Actual Time Consumed:</span>
                  <span class="detail-value">{{ event.actualTimeConsumed }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- Pagination -->
    <div class="timeline-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalElements"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Flag } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import { getPriorityColor } from '@/utils/general'

// Props
const props = defineProps( {
  loading : {
    type : Boolean,
    default : false
  },
  timelineEvents : {
    type : Array,
    default : () => []
  },
  currentWorkOrderId : {
    type : [String, Number],
    default : null
  },
  currentPage : {
    type : Number,
    default : 1
  },
  pageSize : {
    type : Number,
    default : 10
  },
  totalElements : {
    type : Number,
    default : 0
  },
  sortField : {
    type : String,
    default : 'createdAt'
  },
  sortDirection : {
    type : String,
    default : 'DESC'
  }
} )

// Emits
const emit = defineEmits( ['page-change', 'page-size-change', 'sort-change'] )

// Timeline filter state
const timelineFilter = ref( {
  dateRange : null
} )

// Timeline filtering and computed properties
const filteredTimelineEvents = computed( () => {
  if ( !timelineFilter.value.dateRange ) {
    return props.timelineEvents
  }

  const [startDate, endDate] = timelineFilter.value.dateRange
  return props.timelineEvents.filter( event => {
    const eventDate = new Date( event.timestamp )
    return eventDate >= startDate && eventDate <= endDate
  } )
} )

const averageTimeConsumed = computed( () => {
  const completedEvents = filteredTimelineEvents.value.filter( event => event.status === 'Completed' && event.duration )

  if ( completedEvents.length === 0 ) return '0h 0m'

  const totalMinutes = completedEvents.reduce( ( total, event ) => {
    const duration = event.duration
    const hours = parseInt( duration.match( /(\d+)h/ )?.[1] || '0' )
    const minutes = parseInt( duration.match( /(\d+)m/ )?.[1] || '0' )
    return total + hours * 60 + minutes
  }, 0 )

  const avgMinutes = Math.round( totalMinutes / completedEvents.length )
  const hours = Math.floor( avgMinutes / 60 )
  const mins = avgMinutes % 60

  return `${hours}h ${mins}m`
} )

const getStatusTagType = status => {
  const statusMap = {
    Completed : 'success',
    'In Progress' : 'primary',
    Pending : 'info'
  }
  return statusMap[status] || 'info'
}

const isEventOverdue = event => {
  if ( !event.plannedEnd || !event.actualEnd ) return false
  return new Date( event.actualEnd ) > new Date( event.plannedEnd )
}

const formatDateTime = dateString => {
  return dateString ? convertToLocalTime( dateString ) : '-'
}

const getCategoryName = category => {
  if ( !category ) return '-'
  if ( typeof category === 'string' ) return category
  if ( category.name ) return category.name
  return category.id ? `Category ${category.id}` : '-'
}

const getPriorityName = priority => {
  if ( !priority ) return '-'
  if ( typeof priority === 'string' ) return priority
  if ( priority.name ) return priority.name
  return priority.id ? `Priority ${priority.id}` : '-'
}

const getPriorityClass = priority => {
  const name = priority?.name?.toLowerCase()
  return {
    'priority-urgent' : name === 'urgent',
    'priority-high' : name === 'high',
    'priority-medium' : name === 'medium',
    'priority-low' : name === 'low'
  }
}

const isCurrentWorkOrder = event => {
  return props.currentWorkOrderId && event.id && String( event.id ) === String( props.currentWorkOrderId )
}

// Pagination handlers
const handlePageChange = newPage => {
  emit( 'page-change', newPage )
}

const handlePageSizeChange = newSize => {
  emit( 'page-size-change', newSize )
}

defineOptions( {
  name : 'Timeline'
} )
</script>

<style scoped lang="scss">
.timeline-loading {
  padding: 20px 24px;
  min-height: calc(45vh + 160px);
  display: flex;
  align-items: center;
  justify-content: center;
}

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
          margin-right: 6px;
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
          letter-spacing: 0.5px;
        }
      }
    }
  }

  .timeline-body {
    .work-order-timeline {
      padding: 24px;
      height: 45vh;
      overflow-y: auto;

      :deep(.el-timeline-item__timestamp) {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        font-weight: 500;
      }

      :deep(.el-timeline-item__node) {
        border-width: 3px;

        .el-icon {
          font-size: 18px;
        }
      }

      // Larger icon for current work order
      :deep(.current-work-order .el-timeline-item__node) {
        .el-icon {
          font-size: 20px;
        }
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

        &.current-work-order-card {
          border: 1px solid var(--el-color-success);
          box-shadow: 0 2px 8px rgba(103, 194, 58, 0.15);

          &:hover {
            box-shadow: 0 4px 16px rgba(103, 194, 58, 0.25);
          }
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 16px;

          .title-section {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;

            .event-title {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              min-width: 0;
            }

            .work-order-id {
              flex-shrink: 0;
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-secondary);
              margin-left: 8px;
            }

            .current-badge {
              flex-shrink: 0;
              font-weight: 500;
            }
          }

          .event-badges {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
            align-items: center;

            .overdue-badge {
              margin-left: 0;
            }
          }
        }

        .event-description {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .event-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;

          .detail-column {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

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

              &.overdue-text {
                color: var(--el-color-danger);
                font-weight: 600;
              }

              &.priority-tag {
                display: flex;
                align-items: center;
                font-weight: 400;
                font-size: 13px;

                &.priority-urgent {
                  color: #f56c6c;
                }

                &.priority-high {
                  color: #409eff;
                }

                &.priority-medium {
                  color: #e6a23c;
                }

                &.priority-low {
                  color: #909399;
                }
              }
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

  .timeline-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 24px;
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-light);

    :deep(.el-pagination) {
      --el-pagination-button-disabled-bg-color: transparent;
    }
  }
}
</style>

<template>
  <div class="task-logs-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-alert type="error" :closable="false" :title="error" show-icon />
    </div>

    <!-- Empty State -->
    <div v-else-if="!logs.length && !failureReason" class="empty-container">
      <el-empty description="No logs available for this task" :image-size="100" />
    </div>

    <!-- Split-Pane Layout -->
    <div v-else class="split-pane-container">
      <!-- Left Pane: Logs List -->
      <div class="left-pane">
        <!-- Failure Reason Alert (Top Priority) -->
        <div v-if="failureReason" class="failure-reason-container">
          <el-alert
            type="error"
            :closable="false"
            show-icon
            class="failure-alert"
          >
            <template #title>
              <div class="failure-title">Failure Reason</div>
            </template>
            <div class="failure-content">{{ failureReason }}</div>
          </el-alert>
        </div>

        <!-- Logs List -->
        <div class="logs-list">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-item"
            :class="{ active: selectedLog?.id === log.id }"
            @click="handleLogClick(log)"
          >
            <div class="log-content">
              <div class="log-row">
                <span class="log-label">Change:</span>
                <span class="log-value">{{ log.change || '-' }}</span>
              </div>
              <div class="log-row">
                <span class="log-label">User:</span>
                <span class="log-value">{{ log.user || '-' }}</span>
              </div>
              <div class="log-row">
                <span class="log-label">Time:</span>
                <span class="log-value">{{ formatTimestamp(log.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Pane: Populated Steps Preview -->
      <div v-if="selectedLog" class="right-pane">
        <div class="right-pane-header">
          <h3 class="preview-title">{{ selectedLog.task?.name || 'Task Snapshot' }}</h3>
        </div>
        <div class="right-pane-content">
          <StepsPreviewPopulated
            v-if="selectedLog.task?.steps"
            :steps="selectedLog.task.steps"
          />
          <el-empty
            v-else
            description="No step data available"
            :image-size="80"
          />
        </div>
      </div>

      <!-- Placeholder when no log selected -->
      <div v-else class="right-pane right-pane-placeholder">
        <el-empty
          description="Select a log entry to view step details"
          :image-size="100"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { getTaskLogsByTaskId } from '@/api/task-entry'
import { convertToLocalTime } from '@/utils/datetime'
import { ElMessage } from 'element-plus'
import StepsPreviewPopulated from '@/components/TaskLibrary/StepsPreviewPopulated.vue'

const props = defineProps( {
  taskEntryId : {
    type : String,
    required : true
  },
  task : {
    type : Object,
    default : null
  }
} )

// State
const loading = ref( false )
const error = ref( null )
const logs = ref( [] )
const selectedLog = ref( null )

// Computed property for failure reason
const failureReason = computed( () => {
  return props.task?.failure_reason || ''
} )

// Fetch logs from API
const fetchLogs = async() => {
  if ( !props.taskEntryId ) {
    error.value = 'Task entry ID is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await getTaskLogsByTaskId( props.taskEntryId )
    console.log( 'Task logs response:', response )

    // Backend returns { status, message, data: [...] }
    logs.value = response?.data || []

    console.log( 'Logs value:', logs.value )

    // Sort logs by time (newest first), fallback to array index if time is null
    logs.value.sort( ( a, b ) => {
      const timeA = a.time || 0
      const timeB = b.time || 0
      return timeB - timeA
    } )
  } catch ( err ) {
    console.error( 'Failed to fetch task logs:', err )
    error.value = 'Failed to load task logs. Please try again.'
    logs.value = []
  } finally {
    loading.value = false
  }
}

// Format timestamp to readable format
const formatTimestamp = timestamp => {
  if ( !timestamp ) return '-'

  // Convert Unix timestamp (seconds) to ISO string for convertToLocalTime
  const date = new Date( timestamp * 1000 )
  return convertToLocalTime( date.toISOString() )
}

// Handle log item click
const handleLogClick = log => {
  if ( log && log.task ) {
    selectedLog.value = log
  } else {
    ElMessage.warning( 'No step data available for this log entry.' )
  }
}

// Clear selection
const clearSelection = () => {
  selectedLog.value = null
}

// Watch for taskEntryId changes
watch(
  () => props.taskEntryId,
  newId => {
    if ( newId ) {
      fetchLogs()
    }
  },
  { immediate : true }
)

defineOptions( {
  name : 'TaskLogsView'
} )
</script>

<style scoped lang="scss">
.task-logs-view {
  min-height: 200px;
  padding: 8px 0;
  height: 100%;
}

.loading-container,
.error-container,
.empty-container {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-container {
  :deep(.el-alert) {
    width: 100%;
  }
}

// Split-Pane Layout
.split-pane-container {
  display: flex;
  gap: 16px;
  height: 53vh;
  overflow: hidden;
}

.left-pane {
  flex: 0 0 37.5%; // 3/8 of total width
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-pane {
  flex: 1; // Takes remaining space (5/8)
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--el-border-color);
  padding-left: 16px;
  overflow: hidden;
}

.right-pane-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
}

.right-pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 12px;
}

.preview-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.close-preview-btn {
  padding: 4px;

  &:hover {
    color: var(--el-color-danger);
  }
}

.right-pane-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  padding-right: 4px;
}

.failure-reason-container {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.failure-alert {
  :deep(.el-alert__content) {
    width: 100%;
  }
}

.failure-title {
  font-size: 15px;
  font-weight: 600;
}

.failure-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.log-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
  padding: 12px 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-fill-color-light);
  }

  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  }
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.log-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  min-width: 60px;
}

.log-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  flex: 1;
}

// Scrollbar styling
.logs-list::-webkit-scrollbar,
.right-pane-content::-webkit-scrollbar {
  width: 6px;
}

.logs-list::-webkit-scrollbar-track,
.right-pane-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.logs-list::-webkit-scrollbar-thumb,
.right-pane-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.logs-list::-webkit-scrollbar-thumb:hover,
.right-pane-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 480px) {
  .task-logs-view {
    padding: 4px 0;
  }

  .split-pane-container {
    flex-direction: column;
    height: auto;
  }

  .left-pane {
    flex: 1 1 auto;
    max-height: 40vh;
  }

  .right-pane {
    flex: 1 1 auto;
    border-left: none;
    border-top: 1px solid var(--el-border-color);
    padding-left: 0;
    padding-top: 16px;
  }

  .log-item {
    padding: 10px 12px;
  }

  .log-row {
    flex-direction: column;
    gap: 4px;
  }

  .log-label {
    min-width: auto;
  }
}
</style>

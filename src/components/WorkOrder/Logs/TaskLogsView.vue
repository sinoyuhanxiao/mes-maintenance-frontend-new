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

    <!-- Logs List -->
    <div v-else class="logs-list">
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

      <!-- Regular Logs -->
      <div v-for="log in logs" :key="log.id" class="log-item">
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getTaskLogsByTaskId } from '@/api/task-entry'
import { convertToLocalTime } from '@/utils/datetime'
import { ElMessage } from 'element-plus'

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

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 53vh !important;
  overflow-y: auto;
}

.failure-reason-container {
  margin-bottom: 4px;
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

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-fill-color-light);
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

@media (max-width: 480px) {
  .task-logs-view {
    padding: 4px 0;
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

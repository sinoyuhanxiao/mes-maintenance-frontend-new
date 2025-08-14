<template>
  <div class="activity-panel">
    <!-- Tab Bar -->
    <el-tabs v-model="activeTab" class="activity-tabs">
      <el-tab-pane :label="$t('workOrder.activity.tabs.comments')" name="comments" />
      <el-tab-pane :label="$t('workOrder.activity.tabs.history')" name="history" />
    </el-tabs>

    <!-- Comment Section -->
    <div v-if="activeTab === 'comments'" class="comment-section">
      <!-- Comment Composer -->
      <div class="composer">
        <el-input
          v-model="newComment"
          type="textarea"
          :placeholder="$t('workOrder.activity.composer.placeholder')"
          :autosize="{ minRows: 2, maxRows: 4 }"
          class="comment-textarea"
        />
        <div class="composer-actions">
          <el-button type="primary" size="small" @click="submitComment" :disabled="!newComment.trim()">
            {{ $t('workOrder.comments.add') }}
          </el-button>
        </div>
      </div>

      <!-- Comment List -->
      <div class="comment-list">
        <div v-for="comment in mockComments" :key="comment.id" class="comment-card">
          <div class="comment-header">
            <div class="author-info">
              <div class="avatar">{{ comment.author.avatar.text }}</div>
              <div class="author-details">
                <span class="author-name">{{ comment.author.name }}</span>
                <span class="comment-meta">
                  {{ formatTimestamp(comment.meta.timestamp) }}
                </span>
              </div>
            </div>
          </div>
          <div class="comment-body">{{ comment.body.content }}</div>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div v-if="activeTab === 'history'" class="history-section">
      <div v-for="event in mockHistoryEvents" :key="event.id" class="history-event">
        <div class="event-header">
          <div class="author-info">
            <div class="avatar" :style="{ background: event.author.avatar.background }">
              {{ event.author.avatar.text || event.author.avatar.icon }}
            </div>
            <div class="event-details">
              <span class="author-name">{{ event.author.name }}</span>
              <span class="event-title" v-html="event.title"></span>
              <span class="event-meta">{{ formatTimestamp(event.meta.timestamp) }}</span>
            </div>
          </div>
        </div>
        <div v-if="event.diff" class="event-diff">
          <div v-for="(diff, index) in event.diff" :key="index" class="diff-item">
            <span class="diff-field">{{ diff.field }}:</span>
            <span class="diff-from">{{ diff.from.label || diff.from }}</span>
            <span class="diff-arrow">→</span>
            <span class="diff-to">{{ diff.to.label || diff.to }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
// const props = defineProps( {
//   workOrder : {
//     type : Object,
//     default : null
//   }
// } )

// Emits
const emit = defineEmits( ['add-comment'] )

// State
const activeTab = ref( 'comments' )
const newComment = ref( '' )

// Mock data
const mockComments = ref( [
  {
    id : 'cmt-001',
    author : {
      name : 'Erik Yu',
      avatar : { text : 'EY', background : '#34C759' }
    },
    meta : { timestamp : '2025-04-23T10:31:00-07:00' },
    body : { content : 'Fixed conveyor alignment issue; see new photos.' }
  },
  {
    id : 'cmt-002',
    author : {
      name : 'Yao Li',
      avatar : { text : 'YL', background : '#0EA5E9' }
    },
    meta : { timestamp : '2025-04-22T14:15:00-07:00' },
    body : { content : 'Maintenance completed successfully. All systems operational.' }
  }
] )

const mockHistoryEvents = ref( [
  {
    id : 'hst-101',
    author : {
      name : 'Eric Yellow',
      avatar : { text : 'EY', background : '#df9d39' }
    },
    title : t( 'workOrder.activity.history.statusChanged' ),
    meta : { timestamp : '2025-04-23T13:27:00-07:00' },
    diff : [
      {
        field : 'Status',
        from : { label : 'TO DO' },
        to : { label : 'DONE' }
      }
    ]
  },
  {
    id : 'hst-102',
    author : {
      name : 'John Li',
      avatar : { text : 'JL', background : '#A855F7' }
    },
    title : 'updated the Priority',
    meta : { timestamp : '2025-04-22T06:00:00-07:00' },
    diff : [{ field : 'Priority', from : 'Medium', to : 'High' }]
  }
] )

// Methods
const submitComment = () => {
  if ( newComment.value.trim() ) {
    emit( 'add-comment', { comment : newComment.value } )
    newComment.value = ''
  }
}

// const handleCommentAction = ( action, commentId ) => {
//   console.log( `Action ${action} on comment ${commentId}` )
// }

const formatTimestamp = timestamp => {
  return new Date( timestamp ).toLocaleString()
}
</script>

<style scoped>
.activity-panel {
  background: #ffffff;
  border-radius: 6px;
  height: 600px;
}

.activity-tabs {
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.activity-tabs :deep(.el-tabs__header) {
  margin: 0 0 16px 0;
}

.activity-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.activity-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
}

.activity-tabs :deep(.el-tabs__item.is-active) {
  color: #1f2937;
}

/* Comment Section */
.comment-section {
  display: flex;
  flex-direction: column;
}

.composer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
}

.comment-textarea :deep(.el-textarea__inner) {
  font-size: 14px;
  line-height: 20px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 12px 16px;
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-card {
  padding: 20px 0;
  border-bottom: 1px solid #f3f4f6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #34c759;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.comment-meta {
  font-size: 12px;
  color: #6b7280;
}

.edited-indicator {
  font-style: italic;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 8px;
}

.action-icon {
  margin-right: 4px;
}

.comment-body {
  font-size: 14px;
  line-height: 20px;
  color: #374151;
  margin-left: 40px;
}

/* History Section */
.history-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.history-event {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-header {
  display: flex;
  align-items: center;
}

.event-details {
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 14px;
  color: #374151;
  margin: 2px 0;
}

.event-meta {
  font-size: 12px;
  color: #6b7280;
}

.event-diff {
  margin-left: 40px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 4px;
  border-left: 3px solid #e5e7eb;
}

.diff-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.diff-field {
  font-weight: 600;
  color: #374151;
}

.diff-from {
  color: #ef4444;
  text-decoration: line-through;
}

.diff-arrow {
  color: #6b7280;
}

.diff-to {
  color: #22c55e;
  font-weight: 600;
}
</style>

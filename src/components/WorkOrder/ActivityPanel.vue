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

        <!-- Attachment Section -->
        <div v-if="attachmentFiles.length > 0" class="attachment-preview">
          <div class="attachment-header">
            <el-icon><Paperclip /></el-icon>
            <span>{{ attachmentFiles.length }} file(s) attached</span>
          </div>
          <div class="attachment-list">
            <div v-for="(file, index) in attachmentFiles" :key="index" class="attachment-item">
              <el-icon><Document /></el-icon>
              <span class="attachment-name">{{ file.name }}</span>
              <el-button type="text" size="small" @click="removeAttachment(index)" class="remove-btn">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="composer-actions">
          <div class="attachment-upload">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleAttachmentChange"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip"
            >
              <el-button type="text" size="small" class="attachment-btn">
                <el-icon><Paperclip /></el-icon>
                Attach Files
              </el-button>
            </el-upload>
          </div>
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
              <div class="avatar" :style="{ background: comment.author.avatar.background }">
                {{ comment.author.avatar.text }}
              </div>
              <div class="author-details">
                <span class="author-name">{{ comment.author.name }}</span>
                <span class="comment-meta">
                  {{ formatTimestamp(comment.meta.timestamp) }}
                  <el-tag
                    v-if="comment.type"
                    :type="getCommentTypeColor(comment.type)"
                    size="small"
                    class="comment-type-tag"
                  >
                    {{ comment.type }}
                  </el-tag>
                </span>
              </div>
            </div>
          </div>
          <div class="comment-body">{{ comment.body.content }}</div>

          <!-- Comment Attachments -->
          <div v-if="comment.attachments && comment.attachments.length > 0" class="comment-attachments">
            <div class="attachments-header">
              <el-icon><Paperclip /></el-icon>
              <span>{{ comment.attachments.length }} attachment(s)</span>
            </div>
            <div class="attachments-grid">
              <div v-for="attachment in comment.attachments" :key="attachment.id" class="attachment-card">
                <div class="attachment-icon">
                  <el-icon v-if="attachment.type === 'image'"><Picture /></el-icon>
                  <el-icon v-else-if="attachment.type === 'document'"><Document /></el-icon>
                  <el-icon v-else><Folder /></el-icon>
                </div>
                <div class="attachment-info">
                  <span class="attachment-filename">{{ attachment.name }}</span>
                  <span class="attachment-size">{{ attachment.size }}</span>
                </div>
                <el-button type="text" size="small" @click="downloadAttachment(attachment)" class="download-btn">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div v-if="activeTab === 'history'" class="history-section">
      <el-timeline class="work-order-timeline">
        <el-timeline-item
          v-for="event in mockHistoryEvents"
          :key="event.id"
          :timestamp="formatTimestamp(event.meta.timestamp)"
          :type="event.type"
          :color="event.color"
          :icon="event.icon"
          placement="top"
          :hollow="event.hollow"
          size="large"
        >
          <div class="timeline-card">
            <div class="timeline-header">
              <div class="timeline-author">
                <div class="avatar" :style="{ background: event.author.avatar.background }">
                  {{ event.author.avatar.text }}
                </div>
                <div class="author-info">
                  <span class="author-name">{{ event.author.name }}</span>
                  <span class="event-action">{{ event.action }}</span>
                </div>
              </div>
              <el-tag v-if="event.category" :type="getCategoryColor(event.category)" size="small">
                {{ event.category }}
              </el-tag>
            </div>

            <div class="timeline-content">
              <p class="event-description">{{ event.description }}</p>

              <!-- Changes/Diff Display -->
              <div v-if="event.changes && event.changes.length > 0" class="event-changes">
                <div class="changes-header">
                  <el-icon><Edit /></el-icon>
                  <span>Changes made:</span>
                </div>
                <div class="changes-list">
                  <div v-for="(change, index) in event.changes" :key="index" class="change-item">
                    <span class="change-field">{{ change.field }}:</span>
                    <span class="change-from">{{ change.from }}</span>
                    <el-icon class="change-arrow"><ArrowRight /></el-icon>
                    <span class="change-to">{{ change.to }}</span>
                  </div>
                </div>
              </div>

              <!-- Additional Details -->
              <div v-if="event.details" class="event-details">
                <div v-for="(detail, key) in event.details" :key="key" class="detail-item">
                  <span class="detail-label">{{ key }}:</span>
                  <span class="detail-value">{{ detail }}</span>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Paperclip,
  Document,
  Close,
  Picture,
  Folder,
  Download,
  Edit,
  ArrowRight,
  Plus,
  User,
  Setting,
  Clock,
} from '@element-plus/icons-vue'

// Emits
const emit = defineEmits(['add-comment'])

// State
const activeTab = ref('comments')
const newComment = ref('')
const attachmentFiles = ref([])

// GPT generated mock comments
const mockComments = ref([
  {
    id: 'cmt-001',
    author: {
      name: 'Erik Yu',
      avatar: { text: 'EY', background: '#34C759' },
    },
    meta: { timestamp: '2025-04-23T10:31:00-07:00' },
    body: { content: 'Fixed conveyor alignment issue; see new photos attached.' },
    type: 'Update',
    attachments: [
      { id: 'att-001', name: 'conveyor_before.jpg', type: 'image', size: '2.1 MB' },
      { id: 'att-002', name: 'conveyor_after.jpg', type: 'image', size: '1.8 MB' },
    ],
  },
  {
    id: 'cmt-002',
    author: {
      name: 'Yao Li',
      avatar: { text: 'YL', background: '#0EA5E9' },
    },
    meta: { timestamp: '2025-04-22T14:15:00-07:00' },
    body: { content: 'Maintenance completed successfully. All systems operational.' },
    type: 'Completion',
  },
  {
    id: 'cmt-003',
    author: {
      name: 'Sarah Wilson',
      avatar: { text: 'SW', background: '#F59E0B' },
    },
    meta: { timestamp: '2025-04-22T09:45:00-07:00' },
    body: { content: 'Found issue with bearing housing. Uploading inspection report and ordering replacement parts.' },
    type: 'Issue',
    attachments: [
      { id: 'att-003', name: 'bearing_inspection_report.pdf', type: 'document', size: '452 KB' },
      { id: 'att-004', name: 'parts_order_form.pdf', type: 'document', size: '128 KB' },
    ],
  },
  {
    id: 'cmt-004',
    author: {
      name: 'Mike Johnson',
      avatar: { text: 'MJ', background: '#8B5CF6' },
    },
    meta: { timestamp: '2025-04-21T16:20:00-07:00' },
    body: { content: 'Starting preventive maintenance. Equipment is now offline as scheduled.' },
    type: 'Status',
  },
  {
    id: 'cmt-005',
    author: {
      name: 'David Chen',
      avatar: { text: 'DC', background: '#EF4444' },
    },
    meta: { timestamp: '2025-04-21T08:30:00-07:00' },
    body: { content: 'Safety inspection completed. Added safety checklist and procedure updates.' },
    type: 'Safety',
    attachments: [{ id: 'att-005', name: 'safety_checklist_updated.docx', type: 'document', size: '86 KB' }],
  },
])

// Enhanced Mock History Events with 7 total events for timeline
const mockHistoryEvents = ref([
  {
    id: 'hst-101',
    author: {
      name: 'Erik Yu',
      avatar: { text: 'EY', background: '#34C759' },
    },
    action: 'marked as completed',
    description: 'Work order has been completed successfully with all maintenance tasks finished.',
    meta: { timestamp: '2025-04-23T13:27:00-07:00' },
    type: 'success',
    color: '#67c23a',
    icon: Clock,
    category: 'Status',
    changes: [
      { field: 'Status', from: 'In Progress', to: 'Completed' },
      { field: 'Completion Rate', from: '85%', to: '100%' },
    ],
    details: {
      Duration: '2 hours 15 minutes',
      'Final Cost': '$347.00',
    },
  },
  {
    id: 'hst-102',
    author: {
      name: 'Sarah Wilson',
      avatar: { text: 'SW', background: '#F59E0B' },
    },
    action: 'updated priority level',
    description: 'Priority increased due to critical equipment status and production impact.',
    meta: { timestamp: '2025-04-22T11:30:00-07:00' },
    type: 'warning',
    color: '#e6a23c',
    icon: Edit,
    category: 'Priority',
    changes: [
      { field: 'Priority', from: 'Medium', to: 'High' },
      { field: 'Due Date', from: '04/25/2025', to: '04/23/2025' },
    ],
  },
  {
    id: 'hst-103',
    author: {
      name: 'Mike Johnson',
      avatar: { text: 'MJ', background: '#8B5CF6' },
    },
    action: 'started work',
    description: 'Maintenance work has begun. Equipment taken offline for scheduled maintenance.',
    meta: { timestamp: '2025-04-21T16:20:00-07:00' },
    type: 'primary',
    color: '#409eff',
    icon: Clock,
    category: 'Status',
    changes: [
      { field: 'Status', from: 'Ready', to: 'In Progress' },
      { field: 'Assigned To', from: 'Unassigned', to: 'Mike Johnson' },
    ],
    details: {
      'Start Time': '4:20 PM',
      'Estimated Duration': '3 hours',
    },
  },
  {
    id: 'hst-104',
    author: {
      name: 'David Chen',
      avatar: { text: 'DC', background: '#EF4444' },
    },
    action: 'added safety requirements',
    description: 'Updated safety procedures and added required PPE checklist for this maintenance task.',
    meta: { timestamp: '2025-04-21T14:45:00-07:00' },
    type: 'info',
    color: '#909399',
    icon: Setting,
    category: 'Safety',
    details: {
      'PPE Required': 'Safety glasses, hard hat, steel-toe boots',
      'Lockout Required': 'Yes',
      'Permit Required': 'No',
    },
  },
  {
    id: 'hst-105',
    author: {
      name: 'Yao Li',
      avatar: { text: 'YL', background: '#0EA5E9' },
    },
    action: 'assigned technician',
    description: 'Work order assigned to maintenance team lead based on expertise and availability.',
    meta: { timestamp: '2025-04-21T09:15:00-07:00' },
    type: 'primary',
    color: '#409eff',
    icon: User,
    category: 'Assignment',
    changes: [
      { field: 'Assigned To', from: 'Unassigned', to: 'Mike Johnson' },
      { field: 'Team', from: 'None', to: 'Mechanical Maintenance' },
    ],
  },
  {
    id: 'hst-106',
    author: {
      name: 'System',
      avatar: { text: 'SYS', background: '#6B7280' },
    },
    action: 'scheduled automatically',
    description: 'Work order automatically generated based on preventive maintenance schedule.',
    meta: { timestamp: '2025-04-21T08:00:00-07:00' },
    type: 'info',
    color: '#909399',
    icon: Plus,
    category: 'Creation',
    details: {
      Trigger: 'Preventive Maintenance Schedule',
      Frequency: 'Monthly',
      'Next Due': '05/21/2025',
    },
  },
  {
    id: 'hst-107',
    author: {
      name: 'Erik Yu',
      avatar: { text: 'EY', background: '#34C759' },
    },
    action: 'created work order',
    description: 'Initial work order created for steam peeler monthly maintenance as per maintenance schedule.',
    meta: { timestamp: '2025-04-20T17:30:00-07:00' },
    type: 'success',
    color: '#67c23a',
    icon: Plus,
    category: 'Creation',
    details: {
      'Work Order ID': 'WO-2025-001247',
      Equipment: 'Steam Peeler - SP-001',
      Type: 'Preventive Maintenance',
    },
  },
])

// Methods
const submitComment = () => {
  if (newComment.value.trim()) {
    const commentData = {
      comment: newComment.value,
      attachments: attachmentFiles.value,
    }
    emit('add-comment', commentData)
    newComment.value = ''
    attachmentFiles.value = []
    ElMessage.success('Comment added successfully')
  }
}

const handleAttachmentChange = (file, fileList) => {
  // Add the new file to our local array
  if (file.raw) {
    attachmentFiles.value.push(file.raw)
  }
}

const removeAttachment = index => {
  attachmentFiles.value.splice(index, 1)
}

const downloadAttachment = attachment => {
  ElMessage.info(`Downloading ${attachment.name}...`)
  // TODO: this would trigger a file download
}

const getCommentTypeColor = type => {
  const typeColors = {
    Update: 'primary',
    Completion: 'success',
    Issue: 'danger',
    Status: 'info',
    Safety: 'warning',
  }
  return typeColors[type] || 'info'
}

const getCategoryColor = category => {
  const categoryColors = {
    Status: 'success',
    Priority: 'warning',
    Safety: 'danger',
    Assignment: 'primary',
    Creation: 'info',
  }
  return categoryColors[category] || 'info'
}

const formatTimestamp = timestamp => {
  return new Date(timestamp).toLocaleString()
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
  justify-content: space-between;
  align-items: center;
}

.attachment-upload {
  .attachment-btn {
    color: var(--el-color-primary);
    padding: 4px 8px;

    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }
}

/* Attachment Preview */
.attachment-preview {
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;

  .attachment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: var(--el-bg-color);
      border-radius: 4px;

      .attachment-name {
        flex: 1;
        font-size: 12px;
        color: var(--el-text-color-primary);
      }

      .remove-btn {
        padding: 2px;
        color: var(--el-color-danger);
      }
    }
  }
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
  display: flex;
  align-items: center;
  gap: 8px;

  .comment-type-tag {
    margin-left: 4px;
  }
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

/* Comment Attachments */
.comment-attachments {
  margin-left: 40px;
  margin-top: 12px;

  .attachments-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }

  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;

    .attachment-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--el-fill-color-lighter);
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color-light);
        border-color: var(--el-color-primary);
      }

      .attachment-icon {
        color: var(--el-color-primary);
        font-size: 16px;
      }

      .attachment-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .attachment-filename {
          font-size: 12px;
          color: var(--el-text-color-primary);
          font-weight: 500;
        }

        .attachment-size {
          font-size: 11px;
          color: var(--el-text-color-secondary);
        }
      }

      .download-btn {
        padding: 4px;
        color: var(--el-color-primary);
      }
    }
  }
}

/* History Section with Timeline */
.history-section {
  .work-order-timeline {
    padding: 0;

    :deep(.el-timeline-item__timestamp) {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }

    :deep(.el-timeline-item__node) {
      border-width: 3px;
    }

    :deep(.el-timeline-item__wrapper) {
      padding-left: 28px;
    }

    .timeline-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .timeline-author {
          display: flex;
          align-items: center;
          gap: 12px;

          .author-info {
            display: flex;
            flex-direction: column;

            .author-name {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }

            .event-action {
              font-size: 13px;
              color: var(--el-text-color-regular);
              margin-top: 2px;
            }
          }
        }
      }

      .timeline-content {
        .event-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }

        .event-changes {
          background: var(--el-fill-color-lighter);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;

          .changes-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          }

          .changes-list {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .change-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;

              .change-field {
                font-weight: 500;
                color: var(--el-text-color-primary);
                min-width: 80px;
              }

              .change-from {
                color: var(--el-color-danger);
                text-decoration: line-through;
                background: var(--el-color-danger-light-9);
                padding: 2px 6px;
                border-radius: 3px;
              }

              .change-arrow {
                color: var(--el-text-color-secondary);
                font-size: 12px;
              }

              .change-to {
                color: var(--el-color-success);
                font-weight: 500;
                background: var(--el-color-success-light-9);
                padding: 2px 6px;
                border-radius: 3px;
              }
            }
          }
        }

        .event-details {
          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            font-size: 13px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            &:last-child {
              border-bottom: none;
            }

            .detail-label {
              font-weight: 500;
              color: var(--el-text-color-secondary);
            }

            .detail-value {
              color: var(--el-text-color-primary);
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>

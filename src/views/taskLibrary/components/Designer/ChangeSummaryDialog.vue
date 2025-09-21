<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="val => $emit('close')"
    title="Confirm Changes"
    width="40%"
    :before-close="handleClose"
    class="change-summary-dialog"
  >
    <div class="dialog-content">
      <!-- No Changes State -->
      <div v-if="!hasAnyChanges" class="no-changes">
        <el-icon class="no-changes-icon"><InfoFilled /></el-icon>
        <h3>No Changes Detected</h3>
        <p>No modifications were made to this task template.</p>
      </div>

      <!-- Changes Summary -->
      <div v-else class="changes-summary">
        <div class="summary-header">
          <p style="font-size: 15px">Review the following modifications before saving:</p>
        </div>

        <!-- Metadata Changes -->
        <div v-if="changes.metadata.length > 0" class="change-section">
          <div class="section-header">
            <el-icon class="section-icon"><Edit /></el-icon>
            <h4>Template Information</h4>
            <el-tag size="default"
type="warning"
effect="plain"
style="font-size: 14px"
              >{{ changes.metadata.length }} change(s)</el-tag
            >
          </div>
          <div class="changes-list">
            <div v-for="change in changes.metadata" :key="change.field" class="change-item metadata-change">
              <div class="change-label">{{ change.label }}</div>
              <div class="change-values">
                <div class="original-value">
                  <span class="value-label">From:</span>
                  <span class="value">{{ change.original }}</span>
                </div>
                <el-icon class="arrow-icon"><Right /></el-icon>
                <div class="current-value">
                  <span class="value-label">To:</span>
                  <span class="value">{{ change.current }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Steps Added -->
        <div v-if="changes.steps_added.length > 0" class="change-section">
          <div class="section-header">
            <el-icon class="section-icon"><Plus /></el-icon>
            <h4>Steps Added</h4>
            <el-tag size="default"
effect="plain"
style="font-size: 14px"
              >{{ changes.steps_added.length }} step(s)</el-tag
            >
          </div>
          <div class="changes-list">
            <div v-for="step in changes.steps_added" :key="step.step_id" class="change-item step-added">
              <div class="step-info">
                <div class="step-number" :style="getStepNumberStyle(step.type)">
                  {{ getStepPosition(step.step_id) }}
                </div>
                <div class="step-details">
                  <div class="step-name">{{ step.label }}</div>
                  <div class="step-meta">{{ capitalizeFirst(step.type) }} step • Position {{ step.position }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Steps Modified -->
        <div v-if="changes.steps_modified.length > 0" class="change-section">
          <div class="section-header">
            <el-icon class="section-icon"><Edit /></el-icon>
            <h4>Steps Modified</h4>
            <el-tag size="default"
effect="plain"
style="font-size: 14px"
              >{{ changes.steps_modified.length }} step(s)</el-tag
            >
          </div>
          <div class="changes-list">
            <div v-for="step in changes.steps_modified" :key="step.step_id" class="change-item step-modified">
              <div class="step-info">
                <div class="step-number" :style="getStepNumberStyle(step.type)">
                  {{ getStepPosition(step.step_id) }}
                </div>
                <div class="step-details">
                  <div class="step-name">{{ step.label }}</div>
                  <div class="step-changes">
                    <div v-for="change in step.changes" :key="change.field" class="step-change-detail">
                      <span class="change-field">{{ change.label }}:</span>
                      <span class="change-from">{{ change.original }}</span>
                      <el-icon class="arrow-mini"><Right /></el-icon>
                      <span class="change-to">{{ change.current }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Steps Deleted -->
        <div v-if="changes.steps_deleted.length > 0" class="change-section">
          <div class="section-header">
            <el-icon class="section-icon"><Delete /></el-icon>
            <h4>Steps Deleted</h4>
            <el-tag size="default"
type="danger"
effect="plain"
style="font-size: 14px"
              >{{ changes.steps_deleted.length }} step(s)</el-tag
            >
          </div>
          <div class="changes-list">
            <div v-for="step in changes.steps_deleted" :key="step.step_id" class="change-item step-deleted">
              <div class="step-info">
                <div class="step-number deleted" :style="getStepNumberStyle(step.type)">
                  {{ getStepPosition(step.step_id) }}
                </div>
                <div class="step-details">
                  <div class="step-name deleted">{{ step.label }}</div>
                  <div class="step-meta">
                    {{ capitalizeFirst(step.type) }} step • Was at position {{ step.position }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Steps Reordered -->
        <div v-if="changes.steps_reordered.length > 0" class="change-section">
          <div class="section-header">
            <el-icon class="section-icon"><Sort /></el-icon>
            <h4>Steps Reordered</h4>
            <el-tag size="default"
effect="plain"
style="font-size: 14px"
              >{{ changes.steps_reordered.length }} step(s)</el-tag
            >
          </div>
          <div class="changes-list">
            <div v-for="step in changes.steps_reordered" :key="step.step_id" class="change-item step-reordered">
              <div class="step-info">
                <div class="step-number" :style="getStepNumberStyle(getStepType(step.step_id))">
                  {{ getStepPosition(step.step_id) }}
                </div>
                <div class="step-details">
                  <div class="step-name">{{ step.label }}</div>
                  <div class="step-position-change">
                    <span>Position {{ step.original_position }}</span>
                    <el-icon class="arrow-mini"><Right /></el-icon>
                    <span>Position {{ step.new_position }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading"> Cancel </el-button>
        <el-button v-if="hasAnyChanges" type="primary" @click="handleConfirm" :loading="loading">
          <el-icon><Check /></el-icon>
          Save Changes
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Plus, Delete, Sort, Right, Check, Close, InfoFilled } from '@element-plus/icons-vue'

// Props
const props = defineProps( {
  visible : {
    type : Boolean,
    default : false
  },
  changes : {
    type : Object,
    default : () => ( {
      metadata : [],
      steps_added : [],
      steps_modified : [],
      steps_deleted : [],
      steps_reordered : []
    } )
  },
  loading : {
    type : Boolean,
    default : false
  },
  currentSteps : {
    type : Array,
    default : () => []
  }
} )

// Emits
const emit = defineEmits( ['confirm', 'cancel', 'close'] )

// Computed properties
const hasAnyChanges = computed( () => {
  return (
    props.changes.metadata.length > 0 ||
    props.changes.steps_added.length > 0 ||
    props.changes.steps_modified.length > 0 ||
    props.changes.steps_deleted.length > 0 ||
    props.changes.steps_reordered.length > 0
  )
} )

// Step type utilities
const getStepTypeColor = type => {
  const colors = {
    inspection : '#67c23a',
    checkbox : '#409eff',
    number : '#e6a23c',
    text : '#909399',
    attachments : '#849aec',
    service : '#df869d'
  }
  return colors[type] || '#c0c4cc'
}

const getStepNumberStyle = type => {
  const color = getStepTypeColor( type )
  return {
    backgroundColor : 'white',
    color,
    border : `2px solid ${color}`
  }
}

const getStepPosition = stepId => {
  // Find the step in currentSteps and return its position (1-indexed)
  const stepIndex = props.currentSteps.findIndex( s => s.step_id === stepId )
  return stepIndex !== -1 ? stepIndex + 1 : '?'
}

const getStepType = stepId => {
  const step = props.currentSteps.find( s => s.step_id === stepId )
  return step?.type || 'text'
}

const capitalizeFirst = str => {
  return str.charAt( 0 ).toUpperCase() + str.slice( 1 )
}

// Event handlers
const handleClose = done => {
  if ( props.loading ) {
    return
  }
  if ( typeof done === 'function' ) {
    done()
  }
  emit( 'close' )
}

const handleConfirm = () => {
  emit( 'confirm' )
}

const handleCancel = () => {
  emit( 'cancel' )
}

defineOptions( {
  name : 'ChangeSummaryDialog'
} )
</script>

<style scoped>
.change-summary-dialog {
  --el-dialog-content-font-size: 14px;
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
}

/* No changes state */
.no-changes {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.no-changes-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.no-changes h3 {
  margin: 0 0 8px 0;
  color: #606266;
  font-weight: 600;
}

.no-changes p {
  margin: 0;
  color: #909399;
}

/* Changes summary */
.changes-summary {
  padding: 0;
}

.summary-header {
  margin-bottom: 24px;
}

.summary-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.summary-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* Change sections */
.change-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  margin-right: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.section-icon {
  font-size: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

/* Changes list */
.changes-list {
  display: flex;
  flex-direction: column;
  margin-right: 12px;
  gap: 8px;
}

.change-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s ease;
}

.change-item:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

/* Metadata changes */
.metadata-change .change-label {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.change-values {
  margin-left: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.original-value,
.current-value {
  display: flex;
  align-items: center;
  gap: 4px;
}

.value-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.original-value .value {
  background: #fef0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.current-value .value {
  color: var(--el-color-success);
  font-weight: 500;
  background: #f0f9ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 15px;
}

.arrow-icon {
  color: #c0c4cc;
  font-size: 12px;
}

/* Step changes */
.step-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 550;
  font-size: 14px;
}

.step-number.deleted {
  opacity: 0.5;
  position: relative;
}

.step-number.deleted::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 2px;
  right: 2px;
  height: 2px;
  background: #f56c6c;
  border-radius: 1px;
}

.step-details {
  flex: 1;
}

.step-name {
  font-weight: 550;
  color: #303133;
  margin-bottom: 4px;
}

.step-name.deleted {
  text-decoration: line-through;
  opacity: 0.6;
}

.step-meta {
  font-size: 13px;
  color: #909399;
}

.step-changes {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-change-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.change-field {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.change-from {
  color: var(--el-color-info);
  background: #f1eded;
  padding: 1px 6px;
  border-radius: 3px;
}

.change-to {
  color: #67c23a;
  background: #f0f9ff;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 15px;
}

.arrow-mini {
  color: #c0c4cc;
  font-size: 10px;
}

.step-position-change {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
}

/* Dialog footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Scrollbar styling */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 768px) {
  .change-summary-dialog {
    --el-dialog-width: 95%;
  }

  .change-values {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .step-info {
    flex-direction: column;
    gap: 8px;
  }

  .step-type-indicator {
    align-self: flex-start;
  }
}

/* Animation */
.change-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-tag {
  margin-right: 12px;
}
</style>

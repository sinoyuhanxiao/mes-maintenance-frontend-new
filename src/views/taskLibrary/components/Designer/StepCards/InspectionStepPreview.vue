<template>
  <div class="inspection-step-preview">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'Inspection Result' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
    <div class="inspection-options">
      <el-button-group style="width: 100%">
        <el-button
          v-for="option in ['pass', 'fail']"
          :key="option"
          :type="getOptionType(option)"
          :class="['inspection-option', `option-${option}`]"
          :disabled="!interactive"
          style="width: 50%"
          @click="interactive && setInspectionResult(option)"
        >
          <el-icon>
            <Check v-if="option === 'pass'" />
            <Close v-if="option === 'fail'" />
          </el-icon>
          {{ getOptionLabel(option) }}
        </el-button>
      </el-button-group>
    </div>
    <!-- Remarks textarea - shown when Failed is selected in interactive mode -->
    <div v-if="currentResult === 'fail' && interactive" class="remarks-section">
      <div class="remarks-label-required">
        <span class="required-asterisk">*</span>
        Remarks
      </div>
      <el-input
        v-model="remarks"
        type="textarea"
        :rows="3"
        placeholder="Please enter remarks explaining why this inspection failed (required)"
        :disabled="!interactive"
        class="remarks-textarea"
      />
    </div>
    <!-- Remarks display - shown in read-only mode when there are remarks -->
    <div v-else-if="currentResult === 'fail' && !interactive && remarks" class="remarks-display">
      <div class="remarks-label">Remarks:</div>
      <div class="remarks-content">{{ remarks }}</div>
    </div>
    <div v-if="step.config?.require_comment_on_fail" class="config-note">
      <el-icon><InfoFilled /></el-icon>
      Comment required on fail
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { InfoFilled, Check, Close } from '@element-plus/icons-vue'

// eslint-disable-next-line no-unused-vars
const emit = defineEmits(['value-change', 'update:modelValue'])

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
  previewMode: {
    type: Boolean,
    default: true,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [Boolean, String, null],
    default: null,
  },
})

// Reactive state for user input
// Default to 'pass' in preview modes when no explicit result is provided
const currentResult = ref(null)
const remarks = ref('')

const mapModelToResult = value => {
  if (value === true) return 'pass'
  if (value === false) return 'fail'
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'pass' || normalized === 'fail') {
      return normalized
    }
  }
  return value ?? null
}

const mapResultToBoolean = result => {
  if (result === 'pass') return true
  if (result === 'fail') return false
  return null
}

// Watch for prop changes to sync initial values
watch(
  () => [props.modelValue, props.step?.config?.result, props.step?.config?.remarks],
  ([modelValue, configResult, configRemarks]) => {
    const mapped = mapModelToResult(modelValue ?? configResult)
    currentResult.value = mapped ?? (props.previewMode ? 'pass' : null)

    // Initialize remarks from config if available
    if (configRemarks !== undefined && configRemarks !== null) {
      remarks.value = String(configRemarks)
      console.log('[InspectionStepPreview] Updated remarks from config:', remarks.value)
    }
  },
  { immediate: true }
)

const getOptionLabel = option => {
  const labels = {
    pass: 'Pass',
    fail: 'Fail',
  }
  return labels[option] || option
}

const getOptionType = option => {
  if (currentResult.value === option) {
    return option === 'pass' ? 'success' : 'danger'
  }
  return '' // Use default button styling (no type) for unselected buttons
}

const setInspectionResult = result => {
  if (props.interactive) {
    currentResult.value = result
    // Clear remarks when switching to "pass"
    if (result === 'pass') {
      remarks.value = ''
    }
    // Emit the updated value
    emitValue()
  }
}

const emitValue = () => {
  if (!props.interactive) return

  const booleanValue = mapResultToBoolean(currentResult.value)

  // For inspection steps, emit an object with both value and remarks
  const inspectionData = {
    value: booleanValue,
    remarks: currentResult.value === 'fail' ? remarks.value : '',
  }

  emit('value-change', inspectionData)
  emit('update:modelValue', booleanValue)
}

watch(currentResult, () => {
  if (props.interactive) {
    emitValue()
  }
})

// Watch remarks changes and emit them
watch(remarks, () => {
  if (props.interactive && currentResult.value === 'fail') {
    emitValue()
  }
})
</script>

<style scoped>
.inspection-step-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.required-asterisk {
  color: #f56c6c;
  font-weight: 600;
  margin-right: 4px;
  font-size: 20px;
}

.inspection-options {
  margin-bottom: 8px;
}

.inspection-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.config-note {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.step-description {
  font-size: 12px;
  color: #666;
  font-style: italic;
  line-height: 1.4;
  margin-bottom: 8px;
  padding: 6px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.remarks-section {
  margin-top: 8px;
}

.remarks-label-required {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
}

.remarks-textarea {
  width: 100%;
}

.remarks-textarea :deep(.el-textarea__inner) {
  border-color: #f56c6c;
  resize: vertical;
}

.remarks-textarea :deep(.el-textarea__inner::placeholder) {
  color: #909399;
  font-size: 13px;
}

.remarks-display {
  margin-top: 8px;
  padding: 12px;
  background: #fff3f3;
  border: 1px solid #fbd4d4;
  border-radius: 4px;
}

.remarks-label {
  font-size: 13px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 6px;
}

.remarks-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

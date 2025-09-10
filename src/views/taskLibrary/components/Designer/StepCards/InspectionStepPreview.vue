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
})

// Reactive state for user input
// Default to 'pass' in preview modes when no explicit result is provided
const currentResult = ref(props.step?.config?.result ?? (props.previewMode ? 'pass' : null))

// Watch for prop changes to sync initial values
watch(
  () => props.step?.config?.result,
  newValue => {
    if (!props.interactive) {
      currentResult.value = newValue ?? (props.previewMode ? 'pass' : null)
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
  }
}
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
</style>

<template>
  <div class="text-step-preview">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'Text Input' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
    <el-input
      v-model="currentValue"
      :type="step.config?.multiline ? 'textarea' : 'text'"
      :rows="step.config?.multiline ? 3 : 1"
      :placeholder="step.placeholder || 'Enter text here...'"
      :maxlength="step.config?.max_length"
      :show-word-limit="step.config?.input_style?.show_word_limit !== false"
      :clearable="step.config?.input_style?.clearable !== false"
      :size="step.config?.input_style?.size || 'default'"
      :disabled="!interactive"
    />
    <div v-if="step.config?.max_length" class="config-note">
      <el-icon><InfoFilled /></el-icon>
      Maximum {{ step.config.max_length }} characters
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

// eslint-disable-next-line no-unused-vars
const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  previewMode : {
    type : Boolean,
    default : true
  },
  interactive : {
    type : Boolean,
    default : false
  }
} )

// Reactive state for user input
const currentValue = ref( props.step.config?.default || '' )

// Watch for prop changes to sync initial values
watch(
  () => props.step.config?.default,
  newValue => {
    if ( !props.interactive ) {
      currentValue.value = newValue || ''
    }
  },
  { immediate : true }
)
</script>

<style scoped>
.text-step-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

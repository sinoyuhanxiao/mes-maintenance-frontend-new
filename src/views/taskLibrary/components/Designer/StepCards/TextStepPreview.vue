<template>
  <div class="text-step-preview" :class="{ 'execution-mode': executionMode }">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'Text Input' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
    <el-input
      v-model="currentValue"
      :type="inputType"
      :rows="inputRows"
      :autosize="inputAutosize"
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
import { computed, ref, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

// eslint-disable-next-line no-unused-vars
const emit = defineEmits( ['value-change', 'update:modelValue'] )

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
  },
  modelValue : {
    type : [String, Number, null],
    default : ''
  },
  executionMode : {
    type : Boolean,
    default : false
  }
} )

// Reactive state for user input
const currentValue = ref( props.step.config?.default ?? props.step.config?.default_value ?? '' )

// Debug logging
console.log( '[TextStepPreview] Step:', props.step )
console.log( '[TextStepPreview] Config:', props.step.config )
console.log( '[TextStepPreview] Default value:', props.step.config?.default )
console.log( '[TextStepPreview] Default_value:', props.step.config?.default_value )
console.log( '[TextStepPreview] Initial currentValue:', currentValue.value )

// Watch for prop changes to sync initial values
watch(
  () => props.modelValue,
  newValue => {
    if ( newValue === null || newValue === undefined ) {
      const fallback = props.step.config?.default ?? props.step.config?.default_value
      currentValue.value = fallback !== undefined ? String( fallback ) : ''
    } else {
      currentValue.value = String( newValue )
    }
  },
  { immediate : true }
)

// Watch for step.config changes (for populated previews where config is set after mount)
watch(
  () => [props.step.config?.default, props.step.config?.default_value, props.interactive],
  ( [defaultVal, defaultValueVal, interactive] ) => {
    // In non-interactive mode (logs view), always use config values
    // In interactive mode, only use config if modelValue is not set
    const shouldUseConfig = !interactive || !props.modelValue || props.modelValue === ''

    if ( shouldUseConfig ) {
      const fallback = defaultVal ?? defaultValueVal
      if ( fallback !== undefined && fallback !== null ) {
        currentValue.value = String( fallback )
        console.log( '[TextStepPreview] Updated from config watch:', currentValue.value )
      }
    }
  },
  { immediate : true }
)

watch( currentValue, newValue => {
  if ( !props.interactive ) return
  const valueToEmit = newValue ?? ''
  emit( 'value-change', valueToEmit )
  emit( 'update:modelValue', valueToEmit )
} )

const inputType = computed( () => {
  if ( props.executionMode ) {
    return 'textarea'
  }
  // When not interactive (read-only preview), always use textarea for better readability
  if ( !props.interactive ) {
    return 'textarea'
  }
  return props.step.config?.multiline ? 'textarea' : 'text'
} )

const inputRows = computed( () => {
  if ( props.executionMode ) {
    return 2
  }
  // When not interactive (read-only preview), use 3 rows minimum for readability
  if ( !props.interactive ) {
    return 3
  }
  return props.step.config?.multiline ? props.step.config?.rows || 3 : 1
} )

const inputAutosize = computed( () => {
  if ( props.executionMode ) {
    return { minRows : 2, maxRows : 4 }
  }
  return props.step.config?.autosize
} )
</script>

<style scoped>
.text-step-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-step-preview.execution-mode :deep(.el-textarea__inner) {
  min-height: 56px;
  resize: vertical;
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

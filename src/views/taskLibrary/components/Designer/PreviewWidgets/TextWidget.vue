<template>
  <div class="text-widget">
    <div class="widget-content">
      <div v-if="step.ui.description" class="step-description">
        {{ step.ui.description }}
      </div>

      <div class="text-input-container">
        <el-input
          v-model="textValue"
          :type="inputType"
          :rows="rows"
          :maxlength="maxLength"
          :placeholder="placeholder"
          :disabled="!interactive"
          :show-word-limit="!!maxLength"
          class="text-input"
        />
      </div>

      <div v-if="step.ui.validation_pattern" class="validation-info">
        <div class="validation-display">
          <el-icon><DocumentChecked /></el-icon>
          <span class="validation-text">Format: {{ getPatternDescription() }}</span>
        </div>

        <div v-if="hasValidationError" class="validation-error">
          <el-icon><Warning /></el-icon>
          Input does not match required format
        </div>
      </div>

      <div v-if="step.ui.examples && step.ui.examples.length > 0" class="examples-section">
        <div class="examples-label">Examples:</div>
        <div class="examples-list">
          <span
            v-for="(example, index) in step.ui.examples"
            :key="index"
            class="example-item"
            @click="useExample(example)"
          >
            {{ example }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DocumentChecked, Warning } from '@element-plus/icons-vue'

const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  interactive : {
    type : Boolean,
    default : false
  },
  config : {
    type : Object,
    default : () => ( {
      placeholderField : 'placeholder',
      rows : 3
    } )
  }
} )

const textValue = ref( props.step.ui.default || '' )

const inputType = computed( () => {
  return props.step.ui.multiline ? 'textarea' : 'text'
} )

const rows = computed( () => {
  if ( props.step.ui.multiline ) {
    return props.step.ui.rows || props.config.rows || 3
  }
  return undefined
} )

const placeholder = computed( () => {
  const placeholderField = props.config.placeholderField || 'placeholder'
  return props.step.ui[placeholderField] || 'Enter text...'
} )

const maxLength = computed( () => {
  return props.step.ui.max_length || null
} )

const hasValidationError = computed( () => {
  if ( !props.step.ui.validation_pattern || !textValue.value ) {
    return false
  }

  try {
    const regex = new RegExp( props.step.ui.validation_pattern )
    return !regex.test( textValue.value )
  } catch {
    return false
  }
} )

const getPatternDescription = () => {
  const pattern = props.step.ui.validation_pattern

  // Common pattern descriptions
  const descriptions = {
    '^[A-Za-z]+$' : 'Letters only',
    '^[0-9]+$' : 'Numbers only',
    '^[A-Za-z0-9]+$' : 'Letters and numbers only',
    '^[A-Za-z\\s]+$' : 'Letters and spaces only',
    '^\\d{4}-\\d{2}-\\d{2}$' : 'Date format (YYYY-MM-DD)',
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' : 'Email address',
    '^\\+?[1-9]\\d{1,14}$' : 'Phone number'
  }

  return descriptions[pattern] || pattern || 'Custom format'
}

const useExample = example => {
  if ( props.interactive ) {
    textValue.value = example
  }
}
</script>

<style scoped>
.text-widget {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.2s;
}

.text-widget:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.step-description {
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.text-input-container {
  margin-bottom: 16px;
}

.text-input {
  width: 100%;
}

.validation-info {
  margin-bottom: 8px;
}

.validation-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.validation-text {
  color: #606266;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  font-size: 12px;
  background: #fef0f0;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #fbc4c4;
}

.examples-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #7dd3fc;
}

.examples-label {
  font-size: 13px;
  color: #0369a1;
  font-weight: 600;
  margin-bottom: 8px;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.example-item {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #475569;
  border: 1px solid #cbd5e0;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.example-item:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
}
</style>

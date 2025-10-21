<template>
  <div class="number-step-preview">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'Number Input' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
    <div class="number-input-preview">
      <el-input-number
        v-model="currentValue"
        :precision="step.config?.decimal_places || 0"
        :disabled="!interactive"
        style="width: 100%"
      />
      <span v-if="step.config?.unit" class="unit-label">{{ step.config.unit }}</span>
    </div>
    <div v-if="step.config?.limits && formatLimitsText(step.config.limits) !== 'No limits set'" class="limits-info">
      <el-icon><InfoFilled /></el-icon>
      Range: {{ formatLimitsText(step.config.limits, step.config?.unit) }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { formatLimitsText } from 'src/views/taskLibrary/utils/stepTransforms'

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
    type : [Number, String, null],
    default : null
  }
} )

// Reactive state for user input
const currentValue = ref( props.step.config?.default || 0 )

// Watch for prop changes to sync initial values
watch(
  () => props.modelValue,
  newValue => {
    if ( newValue === null || newValue === undefined || newValue === '' ) {
      const fallback = props.step.config?.default ?? props.step.config?.default_value
      currentValue.value = fallback !== undefined ? fallback : 0
    } else {
      const numeric = Number( newValue )
      if ( Number.isFinite( numeric ) ) {
        currentValue.value = numeric
      } else {
        const fallback = props.step.config?.default ?? props.step.config?.default_value
        currentValue.value = fallback !== undefined ? fallback : 0
      }
    }
  },
  { immediate : true }
)

watch( currentValue, newValue => {
  if ( !props.interactive ) return
  const numeric = newValue === null || newValue === undefined || newValue === '' ? null : Number( newValue )
  const valueToEmit = Number.isFinite( numeric ) ? numeric : null
  emit( 'value-change', valueToEmit )
  emit( 'update:modelValue', valueToEmit )
} )
</script>

<style scoped>
.number-step-preview {
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

.number-input-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.unit-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.limits-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
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

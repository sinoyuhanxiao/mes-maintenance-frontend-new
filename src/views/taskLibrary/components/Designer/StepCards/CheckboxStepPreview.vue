<template>
  <div class="checkbox-step-preview">
    <el-checkbox v-model="currentValue" :disabled="!interactive" :size="step.config?.element_size || 'default'">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'Confirmation required' }}
    </el-checkbox>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
    type : [Boolean, String, Number],
    default : undefined
  }
} )

// Reactive state for user input
const currentValue = ref( props.step.config?.default || false )

// Watch for prop changes to sync initial values
watch(
  () => props.modelValue,
  newValue => {
    if ( newValue === undefined ) {
      const fallback = props.step.config?.default
      currentValue.value = fallback !== undefined ? Boolean( fallback ) : false
    } else {
      currentValue.value = Boolean( newValue )
    }
  },
  { immediate : true }
)

watch( currentValue, newValue => {
  if ( !props.interactive ) return
  const booleanValue = Boolean( newValue )
  emit( 'value-change', booleanValue )
  emit( 'update:modelValue', booleanValue )
} )
</script>

<style scoped>
.checkbox-step-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.required-asterisk {
  color: #f56c6c;
  font-weight: 600;
  margin-right: 4px;
  font-size: 20px;
}

.preview-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.step-description {
  font-size: 12px;
  color: #666;
  font-style: italic;
  line-height: 1.4;
  margin-top: 8px;
  padding: 6px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>

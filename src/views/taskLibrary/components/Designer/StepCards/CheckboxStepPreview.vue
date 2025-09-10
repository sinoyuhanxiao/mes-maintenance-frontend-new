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
const currentValue = ref(props.step.config?.default || false)

// Watch for prop changes to sync initial values
watch(
  () => props.step.config?.default,
  newValue => {
    if (!props.interactive) {
      currentValue.value = newValue || false
    }
  },
  { immediate: true }
)
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

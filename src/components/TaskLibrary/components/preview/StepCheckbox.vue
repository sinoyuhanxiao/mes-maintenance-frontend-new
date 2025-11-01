<template>
  <div class="step-checkbox">
    <el-checkbox
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      {{ step.label || step.name || 'Confirmation required' }}
    </el-checkbox>
    <div v-if="step.description" class="step-description">
      {{ step.description }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  step: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [Boolean, String],
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.step-checkbox {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  padding: 6px 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
</style>

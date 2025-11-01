<template>
  <div class="step-numeric">
    <el-input-number
      :model-value="modelValue"
      :disabled="disabled"
      :min="step.config?.min"
      :max="step.config?.max"
      :precision="step.config?.precision || 0"
      :step="step.config?.step || 1"
      size="small"
      @update:model-value="$emit('update:modelValue', $event)"
    />
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
    type: [Number, String],
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.step-numeric {
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

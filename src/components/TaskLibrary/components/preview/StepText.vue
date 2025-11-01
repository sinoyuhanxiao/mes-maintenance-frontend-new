<template>
  <div class="step-text">
    <el-input
      :model-value="modelValue"
      :disabled="disabled"
      :type="step.config?.multiline ? 'textarea' : 'text'"
      :rows="step.config?.rows || 3"
      :placeholder="step.config?.placeholder || 'Enter text...'"
      size="small"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div v-if="step.description" class="step-description">
      {{ step.description }}
    </div>
  </div>
</template>

<script setup>
defineProps( {
  step : {
    type : Object,
    required : true
  },
  modelValue : {
    type : String,
    default : ''
  },
  disabled : {
    type : Boolean,
    default : false
  }
} )

defineEmits( ['update:modelValue'] )
</script>

<style scoped>
.step-text {
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

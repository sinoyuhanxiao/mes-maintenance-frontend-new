<template>
  <div class="attachment-step-preview">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'File Upload' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
.attachment-step-preview {
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

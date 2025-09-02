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
        :model-value="step.config?.default || 0"
        :precision="step.config?.decimal_places || 0"
        disabled
        style="width: 100%"
      />
      <span v-if="step.config?.unit" class="unit-label">{{ step.config.unit }}</span>
    </div>
    <div v-if="step.config?.limits" class="limits-info">
      <el-icon><InfoFilled /></el-icon>
      Range: {{ step.config.limits.lower || 'No min' }} - {{ step.config.limits.upper || 'No max' }}
      {{ step.config.unit || '' }}
    </div>
  </div>
</template>

<script setup>
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
  }
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

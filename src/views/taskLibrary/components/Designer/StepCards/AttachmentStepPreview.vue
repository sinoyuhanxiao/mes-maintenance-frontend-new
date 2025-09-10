<template>
  <div class="attachment-step-preview">
    <div class="preview-label">
      <span v-if="step.required" class="required-asterisk">*</span>{{ step.label || 'File Upload' }}:
    </div>
    <div v-if="step.description && step.description.trim()" class="step-description">
      {{ step.description }}
    </div>
    <div class="upload-preview" :class="{ interactive }">
      <el-upload
        class="upload-demo"
        drag
        :disabled="!interactive"
        :show-file-list="false"
        :list-type="step.config?.upload_style?.list_type || 'picture-card'"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">Add images or files</div>
      </el-upload>
    </div>
    <div class="upload-config">
      <div class="config-item">
        <el-icon><Files /></el-icon>
        Max {{ step.config?.max_files || 5 }} files
      </div>
      <div class="config-item">
        <el-icon><DocumentAdd /></el-icon>
        {{ (step.config?.allow_types || ['image', 'pdf']).join(', ') }}
      </div>
      <div class="config-item">
        <el-icon><DataAnalysis /></el-icon>
        Max {{ step.config?.max_file_size_mb || 25 }}MB per file
      </div>
    </div>
  </div>
</template>

<script setup>
import { UploadFilled, Files, DocumentAdd, DataAnalysis } from '@element-plus/icons-vue'

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

.upload-preview:not(.interactive) {
  pointer-events: none;
}

.upload-config {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

:deep(.el-upload-dragger) {
  border: 2px dashed #d3d3d3 !important;
  background-color: #fafafa !important;
  width: 100%;
}

:deep(.el-upload__text) {
  color: #c0c4cc !important;
}

:deep(.el-icon--upload) {
  color: #c0c4cc !important;
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

.upload-demo {
  height: 200px;
}

:deep(.upload-demo .el-upload) {
  width: 100%;
}

:deep(.attachment-step-preview .upload-preview .upload-demo .el-upload--picture-card) {
  height: 100% !important;
}

:deep(.attachment-step-preview .el-upload-dragger) {
  height: 100% !important;
}
</style>

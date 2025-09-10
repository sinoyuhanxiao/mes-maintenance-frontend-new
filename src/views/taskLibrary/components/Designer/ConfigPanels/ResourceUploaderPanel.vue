<template>
  <el-dialog
    :model-value="visible"
    title="Upload Resources"
    width="600px"
    @update:model-value="$emit('close')"
    @close="$emit('close')"
    top="8vh"
  >
    <div class="resource-uploader">
      <!-- Upload Area -->
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">Add images or files</div>
          <template #tip>
            <div class="el-upload__tip">Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (max 25MB each)</div>
          </template>
        </el-upload>
      </div>

      <!-- File List -->
      <div v-if="fileList.length > 0" class="files-section">
        <h4>Files to Upload ({{ fileList.length }})</h4>
        <div class="files-list">
          <div
            v-for="(file, index) in fileList"
            :key="index"
            class="file-item"
            :class="{ uploading: file.uploading, error: file.error }"
          >
            <div class="file-info">
              <div class="file-icon">
                <el-icon>
                  <component :is="getFileIcon(file.name)" />
                </el-icon>
              </div>
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
                <div v-if="file.error" class="file-error">{{ file.error }}</div>
              </div>
            </div>

            <div class="file-actions">
              <div v-if="file.uploading" class="upload-progress">
                <el-progress :percentage="file.progress || 0" :stroke-width="4" status="success" />
              </div>
              <el-button v-else type="text" size="small" @click="removeFile(index)" class="remove-button">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Existing Resources -->
      <div v-if="existingResources.length > 0" class="existing-section">
        <h4>Current Resources</h4>
        <div class="existing-list">
          <div v-for="resource in existingResources" :key="resource.id" class="existing-item">
            <div class="resource-info">
              <div class="resource-icon">
                <el-icon>
                  <component :is="getFileIcon(resource.name)" />
                </el-icon>
              </div>
              <div class="resource-details">
                <div class="resource-name">{{ resource.name }}</div>
                <div class="resource-url">
                  <a :href="resource.url" target="_blank" class="resource-link"> View Resource </a>
                </div>
              </div>
            </div>
            <el-button type="text" size="small" @click="removeExistingResource(resource.id)" class="remove-button">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="fileList.length === 0 && existingResources.length === 0" class="empty-state">
        <el-empty description="No resources added yet" :image-size="60" />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('close')">Cancel</el-button>
        <el-button
          type="primary"
          @click="handleSave"
          :loading="uploading"
          :disabled="fileList.length === 0 && existingResources.length === 0"
        >
          {{ uploading ? 'Uploading...' : 'Save Resources' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { UploadFilled, Close, Document, Picture, Files } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadResource } from '@/api/task-library'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  stepId: {
    type: String,
    required: true,
  },
  existingResources: {
    type: Array,
    default: () => [],
  },
  uploading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'close'])

const uploadRef = ref(null)
const fileList = ref([])
// TODO: fix the bug for resources
// eslint-disable-next-line vue/no-dupe-keys
const existingResources = ref([])

// Watch for existing resources
watch(
  () => props.existingResources,
  resources => {
    existingResources.value = [...resources]
  },
  { immediate: true }
)

const handleFileChange = (file, fileListParam) => {
  // Add file to our local list
  fileList.value.push({
    name: file.name,
    size: file.size,
    file: file.raw,
    uploading: false,
    progress: 0,
    error: null,
  })
}

const beforeUpload = file => {
  const maxSize = 25 * 1024 * 1024 // 25MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ]

  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('Unsupported file type. Please upload PDF, DOC, DOCX, or image files.')
    return false
  }

  if (file.size > maxSize) {
    ElMessage.error('File size cannot exceed 25MB.')
    return false
  }

  return false // Prevent auto upload
}

const removeFile = index => {
  fileList.value.splice(index, 1)
}

const removeExistingResource = resourceId => {
  existingResources.value = existingResources.value.filter(r => r.id !== resourceId)
}

const handleSave = async () => {
  try {
    const uploadedResources = []

    // Upload new files
    for (let i = 0; i < fileList.value.length; i++) {
      const fileItem = fileList.value[i]
      fileItem.uploading = true
      fileItem.progress = 0

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          if (fileItem.progress < 90) {
            fileItem.progress += 10
          }
        }, 100)

        const response = await uploadResource(fileItem.file, props.stepId)

        clearInterval(progressInterval)
        fileItem.progress = 100

        uploadedResources.push(response.data)
      } catch (error) {
        fileItem.error = 'Upload failed'
        fileItem.uploading = false
        console.error('Upload failed:', error)
      }
    }

    // Combine existing and newly uploaded resources
    const allResources = [...existingResources.value, ...uploadedResources]

    emit('save', props.stepId, allResources)
  } catch (error) {
    ElMessage.error('Failed to upload resources')
    console.error('Upload failed:', error)
  }
}

const getFileIcon = fileName => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return Document
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return Picture
    default:
      return Files
  }
}

const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Clear file list when dialog closes
watch(
  () => props.visible,
  isVisible => {
    if (!isVisible) {
      fileList.value = []
    }
  }
)
</script>

<style scoped>
.resource-uploader {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 500px;
}

.upload-section {
  margin-bottom: 8px;
}

.files-section h4,
.existing-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.files-list,
.existing-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.file-item,
.existing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child,
.existing-item:last-child {
  border-bottom: none;
}

.file-item.uploading {
  background: #f0f7ff;
}

.file-item.error {
  background: #fef0f0;
}

.file-info,
.resource-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon,
.resource-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 16px;
}

.file-details,
.resource-details {
  flex: 1;
}

.file-name,
.resource-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size,
.resource-url {
  font-size: 12px;
  color: #606266;
}

.file-error {
  font-size: 12px;
  color: #f56c6c;
}

.resource-link {
  color: #409eff;
  text-decoration: none;
}

.resource-link:hover {
  text-decoration: underline;
}

.file-actions {
  margin-left: 12px;
  display: flex;
  align-items: center;
}

.upload-progress {
  width: 100px;
}

.remove-button {
  color: #f56c6c;
}

.remove-button:hover {
  color: #f78989;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-upload-dragger) {
  padding: 40px;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}
</style>

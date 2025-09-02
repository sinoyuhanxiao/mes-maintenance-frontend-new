<template>
  <div class="files-widget">
    <div class="widget-content">
      <div v-if="step.ui.description" class="step-description">
        {{ step.ui.description }}
      </div>

      <div class="upload-section">
        <el-upload
          v-model:file-list="fileList"
          :disabled="!interactive"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :multiple="allowMultiple"
          :accept="acceptTypes"
          :limit="maxFiles"
          list-type="picture-card"
          class="file-uploader"
        >
          <el-icon><Plus /></el-icon>
          <template #tip>
            <div class="upload-tip">
              {{ getUploadTip() }}
            </div>
          </template>
        </el-upload>
      </div>

      <div v-if="uploadConstraints.length > 0" class="constraints-info">
        <div class="constraints-header">
          <el-icon><InfoFilled /></el-icon>
          File Requirements:
        </div>
        <ul class="constraints-list">
          <li v-for="constraint in uploadConstraints" :key="constraint">
            {{ constraint }}
          </li>
        </ul>
      </div>

      <div v-if="step.ui.capture_from_camera && interactive" class="camera-section">
        <el-button type="primary" @click="captureFromCamera" :icon="Camera" size="small"> Take Photo </el-button>
      </div>

      <div v-if="existingAttachments.length > 0" class="existing-files">
        <div class="existing-header">
          <el-icon><Paperclip /></el-icon>
          Current Attachments:
        </div>
        <div class="existing-list">
          <div v-for="file in existingAttachments" :key="file.id" class="existing-file">
            <div class="file-info">
              <el-icon>
                <component :is="getFileIcon(file.type)" />
              </el-icon>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="file-actions">
              <el-button type="text" size="small" @click="viewFile(file)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button v-if="interactive" type="text" size="small" @click="removeFile(file.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Plus,
  InfoFilled,
  Camera,
  Paperclip,
  View,
  Delete,
  Document,
  Picture,
  Film,
  VideoCamera
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  interactive : {
    type : Boolean,
    default : false
  },
  config : {
    type : Object,
    default : () => ( {
      acceptImages : true,
      acceptDocuments : true
    } )
  }
} )

const fileList = ref( [] )
const existingAttachments = ref( props.step.ui.existing_files || [] )

const allowMultiple = computed( () => {
  return ( props.step.ui.max_files || 1 ) > 1
} )

const maxFiles = computed( () => {
  return props.step.ui.max_files || 5
} )

const acceptTypes = computed( () => {
  const types = []

  if ( props.config.acceptImages ) {
    types.push( '.jpg', '.jpeg', '.png', '.gif', '.webp' )
  }

  if ( props.config.acceptDocuments ) {
    types.push( '.pdf', '.doc', '.docx', '.txt' )
  }

  if ( props.step.ui.allow_types ) {
    const allowedTypes = props.step.ui.allow_types
    if ( allowedTypes.includes( 'video' ) ) {
      types.push( '.mp4', '.avi', '.mov', '.wmv' )
    }
    if ( allowedTypes.includes( 'audio' ) ) {
      types.push( '.mp3', '.wav', '.ogg' )
    }
  }

  return types.join( ',' )
} )

const uploadConstraints = computed( () => {
  const constraints = []

  if ( maxFiles.value > 1 ) {
    constraints.push( `Maximum ${maxFiles.value} files` )
  }

  if ( props.step.ui.max_file_size_mb ) {
    constraints.push( `Max size: ${props.step.ui.max_file_size_mb}MB per file` )
  }

  const acceptedFormats = []
  if ( props.config.acceptImages ) acceptedFormats.push( 'Images' )
  if ( props.config.acceptDocuments ) acceptedFormats.push( 'Documents' )
  if ( props.step.ui.allow_types?.includes( 'video' ) ) acceptedFormats.push( 'Videos' )

  if ( acceptedFormats.length > 0 ) {
    constraints.push( `Accepted: ${acceptedFormats.join( ', ' )}` )
  }

  return constraints
} )

const getUploadTip = () => {
  if ( !props.interactive ) {
    return 'Preview mode - uploads disabled'
  }

  const parts = []
  if ( allowMultiple.value ) {
    parts.push( `Up to ${maxFiles.value} files` )
  } else {
    parts.push( 'Single file' )
  }

  if ( props.step.ui.max_file_size_mb ) {
    parts.push( `max ${props.step.ui.max_file_size_mb}MB each` )
  }

  return parts.join( ', ' )
}

const handleFileChange = ( file, fileListParam ) => {
  if ( !props.interactive ) return

  console.log( 'File added:', file.name )
  // Handle file validation and processing
}

const beforeUpload = file => {
  if ( !props.interactive ) return false

  const maxSize = ( props.step.ui.max_file_size_mb || 25 ) * 1024 * 1024

  if ( file.size > maxSize ) {
    ElMessage.error( `File size cannot exceed ${props.step.ui.max_file_size_mb || 25}MB` )
    return false
  }

  return false // Prevent auto upload in preview
}

const captureFromCamera = () => {
  // In a real implementation, this would open camera interface
  ElMessage.info( 'Camera capture would be available in the actual application' )
}

const viewFile = file => {
  // Open file viewer
  if ( file.url ) {
    window.open( file.url, '_blank' )
  }
}

const removeFile = fileId => {
  existingAttachments.value = existingAttachments.value.filter( f => f.id !== fileId )
}

const getFileIcon = fileType => {
  if ( fileType?.startsWith( 'image/' ) ) return Picture
  if ( fileType?.startsWith( 'video/' ) ) return VideoCamera
  if ( fileType?.startsWith( 'audio/' ) ) return Film
  return Document
}

const formatFileSize = bytes => {
  if ( !bytes ) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor( Math.log( bytes ) / Math.log( k ) )

  return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) ) + ' ' + sizes[i]
}
</script>

<style scoped>
.files-widget {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.2s;
}

.files-widget:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.step-description {
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.upload-section {
  margin-bottom: 16px;
}

.file-uploader :deep(.el-upload--picture-card) {
  width: 60px;
  height: 60px;
  line-height: 60px;
}

.upload-tip {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  text-align: center;
}

.constraints-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #7dd3fc;
  margin-bottom: 16px;
}

.constraints-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0369a1;
  font-weight: 600;
  margin-bottom: 8px;
}

.constraints-list {
  margin: 0;
  padding-left: 16px;
  color: #606266;
  font-size: 11px;
}

.camera-section {
  margin-bottom: 16px;
}

.existing-files {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.existing-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
  font-weight: 600;
  margin-bottom: 12px;
}

.existing-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.existing-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
}

.existing-file:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-name {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

.file-size {
  font-size: 11px;
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 4px;
}

.file-actions .el-button {
  padding: 2px 4px;
}
</style>

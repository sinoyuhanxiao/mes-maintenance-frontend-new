<template>
  <div class="upload-editor">
    <!-- Image Upload Field -->
    <el-form-item v-if="showImages" :label="imageLabel" label-position="top">
      <el-upload
        v-loading="uploading"
        class="upload-demo"
        action="#"
        list-type="picture-card"
        :auto-upload="false"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleImageRemove"
        :file-list="imageList"
        :on-change="handleImageChange"
        :before-upload="beforeImageUpload"
        accept="image/*"
        :disabled="isImageLimitReached"
      >
        <el-icon v-if="!isImageLimitReached"><Plus /></el-icon>
        <div v-else class="upload-limit-text">Limit reached ({{ imageList.length }}/{{ maxImages }})</div>

        <template #file="{ file }">
          <div>
            <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
            <span class="el-upload-list__item-actions">
              <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                <el-icon><ZoomIn /></el-icon>
              </span>
              <span class="el-upload-list__item-delete" @click="handleDownload(file)">
                <el-icon><Download /></el-icon>
              </span>
              <span class="el-upload-list__item-delete" @click="handleImageRemove(file)">
                <el-icon><Delete /></el-icon>
              </span>
            </span>
          </div>
        </template>
      </el-upload>

      <!-- Image count display -->
      <div v-if="maxImages > 0" class="upload-count">Images: {{ imageList.length }}/{{ maxImages }}</div>

      <el-dialog v-model="dialogVisible" :width="'80%'" :top="'5vh'" append-to-body destroy-on-close>
        <div class="image-wrapper">
          <img :src="dialogImageUrl" alt="Preview Image" class="preview-image" />
        </div>
      </el-dialog>
    </el-form-item>

    <!-- File Upload Field -->
    <el-form-item v-if="showFiles" :label="fileLabel" label-position="top">
      <el-upload
        class="upload-demo"
        action="#"
        list-type="text"
        :auto-upload="false"
        :on-remove="handleFileRemove"
        :file-list="fileList"
        :on-change="handleFileChange"
        :before-upload="beforeFileUpload"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.json,.xml,.ppt,.pptx"
        :disabled="isFileLimitReached"
      >
        <el-button size="small" type="success" :disabled="isFileLimitReached">
          {{ isFileLimitReached ? `Limit Reached (${fileList.length}/${maxFiles})` : 'Click to Upload' }}
        </el-button>
      </el-upload>

      <!-- File count display -->
      <div v-if="maxFiles > 0" class="upload-count">Files: {{ fileList.length }}/{{ maxFiles }}</div>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus, ZoomIn, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps( {
  imageLabel : {
    type : String,
    default : 'Upload Images'
  },
  fileLabel : {
    type : String,
    default : 'Upload Files'
  },
  uploadType : {
    type : String,
    default : 'both', // 'images', 'files', 'both'
    validator : value => ['images', 'files', 'both'].includes( value )
  },
  maxImages : {
    type : Number,
    default : 0 // 0 means no limit
  },
  maxFiles : {
    type : Number,
    default : 0 // 0 means no limit
  }
} )

const imageList = ref( [] )
const dialogVisible = ref( false )
const dialogImageUrl = ref( '' )
const uploading = ref( false )
const fileList = ref( [] )

const emit = defineEmits( ['update:imageList', 'update:filesList'] )

// Computed properties
const showImages = computed( () => props.uploadType === 'both' || props.uploadType === 'images' )
const showFiles = computed( () => props.uploadType === 'both' || props.uploadType === 'files' )
const isImageLimitReached = computed( () => props.maxImages > 0 && imageList.value.length >= props.maxImages )
const isFileLimitReached = computed( () => props.maxFiles > 0 && fileList.value.length >= props.maxFiles )

// Before upload validators
const beforeImageUpload = file => {
  if ( props.maxImages > 0 && imageList.value.length >= props.maxImages ) {
    ElMessage.warning( `Maximum ${props.maxImages} images allowed` )
    return false
  }
  return true
}

const beforeFileUpload = file => {
  if ( props.maxFiles > 0 && fileList.value.length >= props.maxFiles ) {
    ElMessage.warning( `Maximum ${props.maxFiles} files allowed` )
    return false
  }
  return true
}

const handleFileChange = ( file, newFileList ) => {
  // Check file limit
  if ( props.maxFiles > 0 && newFileList.length > props.maxFiles ) {
    ElMessage.warning( `Maximum ${props.maxFiles} files allowed` )
    newFileList = newFileList.slice( 0, props.maxFiles )
  }

  const readerPromises = newFileList.map( uploadedFile => {
    return new Promise( resolve => {
      if ( !uploadedFile.uid ) {
        uploadedFile.uid = Date.now().toString()
      }

      if ( !uploadedFile.raw ) {
        resolve( uploadedFile )
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        uploadedFile.url = e.target.result
        resolve( uploadedFile )
      }
      reader.readAsDataURL( uploadedFile.raw )
    } )
  } )

  Promise.all( readerPromises ).then( resolvedList => {
    fileList.value = resolvedList
  } )
}

const handleFileRemove = file => {
  const index = fileList.value.findIndex( item => item.uid === file.uid )
  if ( index !== -1 ) {
    fileList.value.splice( index, 1 )
  }
}

const handlePictureCardPreview = file => {
  if ( file.url ) {
    dialogImageUrl.value = file.url
    dialogVisible.value = true
  }
}

const handleImageRemove = file => {
  const index = imageList.value.findIndex( item => item.uid === file.uid )
  if ( index !== -1 ) {
    imageList.value.splice( index, 1 )
  }
}

const handleImageChange = ( file, uploadFileList ) => {
  // Check image limit
  if ( props.maxImages > 0 && uploadFileList.length > props.maxImages ) {
    ElMessage.warning( `Maximum ${props.maxImages} images allowed` )
    uploadFileList = uploadFileList.slice( 0, props.maxImages )
  }

  const readerPromises = uploadFileList.map( uploadedFile => {
    return new Promise( resolve => {
      if ( !uploadedFile.uid ) {
        uploadedFile.uid = Date.now().toString()
      }

      if ( !uploadedFile.raw ) {
        resolve( uploadedFile )
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        uploadedFile.url = e.target.result
        resolve( uploadedFile )
      }
      reader.readAsDataURL( uploadedFile.raw )
    } )
  } )

  Promise.all( readerPromises ).then( resolvedList => {
    imageList.value = resolvedList
  } )
}

const handleDownload = file => {
  if ( file.url ) {
    const link = document.createElement( 'a' )
    link.href = file.url
    link.download = file.name || 'downloaded_file.png'
    document.body.appendChild( link )
    link.click()
    document.body.removeChild( link )
  }
}

watch(
  imageList,
  newList => {
    const fileArray = newList.map( file => file.raw ).filter( file => file instanceof File )
    emit( 'update:imageList', fileArray )
  },
  { deep : true }
)

watch(
  fileList,
  newList => {
    const fileArray = newList.map( file => file.raw ).filter( file => file instanceof File )
    emit( 'update:filesList', fileArray )
  },
  { deep : true }
)
</script>

<style scoped>
.upload-editor {
  margin-top: 20px;
  width: 700px;
  max-width: 100%;
  overflow: hidden;
}

.upload-demo {
  width: 100%;
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-count {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.upload-limit-text {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 10px;
}

:deep(.el-upload--picture-card.is-disabled) {
  cursor: not-allowed;
  opacity: 0.6;
}

:deep(.el-upload--picture-card.is-disabled:hover) {
  border-color: #d9d9d9;
}

:deep(.el-upload-list--picture-card) {
  overflow: visible;
}

:deep(.el-upload-list__item) {
  overflow: hidden;
  border-radius: 6px;
}

:deep(.el-upload-list__item:hover .el-upload-list__item-actions) {
  opacity: 1;
}
</style>

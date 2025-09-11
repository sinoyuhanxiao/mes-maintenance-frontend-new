<template>
  <div class="upload-editor">
    <!-- Image Upload Field -->
    <el-form-item v-if="showImages" :label="imageLabel" :label-position="titleLabelPosition">
      <el-upload
        v-loading="uploading"
        class="upload-demo"
        action="#"
        list-type="picture-card"
        :auto-upload="false"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleImageRemove"
        :file-list="combinedImageList"
        :on-change="handleImageChange"
        :before-upload="beforeImageUpload"
        accept="image/*"
        :disabled="isImageLimitReached"
      >
        <el-icon v-if="!isImageLimitReached"><Plus /></el-icon>
        <div v-else class="upload-limit-text">Limit reached ({{ combinedImageList.length }}/{{ maxImages }})</div>

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
      <div v-if="maxImages > 0" class="upload-count">Images: {{ combinedImageList.length }}/{{ maxImages }}</div>

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
        :file-list="combinedFileList"
        :on-change="handleFileChange"
        :before-upload="beforeFileUpload"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.json,.xml,.ppt,.pptx"
        :disabled="isFileLimitReached"
      >
        <el-button size="small" type="success" :disabled="isFileLimitReached">
          {{ isFileLimitReached ? `Limit Reached (${combinedFileList.length}/${maxFiles})` : 'Click to Upload' }}
        </el-button>
      </el-upload>

      <!-- File count display -->
      <div v-if="maxFiles > 0" class="upload-count">Files: {{ combinedFileList.length }}/{{ maxFiles }}</div>
    </el-form-item>

    <!--    <el-button type="primary" size="small" @click="logEmitInfo"> Log Emitted Info </el-button>-->
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Download, Delete } from '@element-plus/icons-vue'

const imageList = ref( [] )
const dialogVisible = ref( false )
const dialogImageUrl = ref( '' )
const uploading = ref( false )
const fileList = ref( [] )
const removedExistingImages = ref( [] )
const removedExistingFiles = ref( [] )

const props = defineProps( {
  existingImageList : {
    type : Array,
    default : () => []
  },
  existingFileList : {
    type : Array,
    default : () => []
  },
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
    default : 'both' // 'both', 'images', 'files'
  },
  maxImages : {
    type : Number,
    default : 0 // 0 means no limit
  },
  maxFiles : {
    type : Number,
    default : 0 // 0 means no limit
  },
  titleLabelPosition : { type : String, default : 'right' }
} )

const emit = defineEmits( [
  'update:imageList',
  'update:filesList',
  'update:removedExistingImages',
  'update:removedExistingFiles'
] )

// Show/hide sections based on uploadType
const showImages = computed( () => {
  return props.uploadType === 'both' || props.uploadType === 'images'
} )

const showFiles = computed( () => {
  return props.uploadType === 'both' || props.uploadType === 'files'
} )

// Check if limits are reached
const isImageLimitReached = computed( () => {
  return props.maxImages > 0 && combinedImageList.value.length >= props.maxImages
} )

const isFileLimitReached = computed( () => {
  return props.maxFiles > 0 && combinedFileList.value.length >= props.maxFiles
} )

// const logEmitInfo = () => {
//   console.log(
//     'New image File[] to emit:',
//     imageList.value.map( f => f.raw ).filter( f => f instanceof File )
//   )
//   console.log(
//     'New file File[] to emit:',
//     fileList.value.map( f => f.raw ).filter( f => f instanceof File )
//   )
//   console.log( 'Removed existing image URLs:', removedExistingImages.value )
//   console.log( 'Removed existing file URLs:', removedExistingFiles.value )
// }

// Computed to combine existing and new images/files for display
const combinedImageList = computed( () => {
  const existing = props.existingImageList
    .filter( url => !removedExistingImages.value.includes( url ) )
    .map( ( url, index ) => ( {
      uid : `existing-image-${index}`,
      name : `existing-image-${index}`,
      url,
      status : 'success',
      isExisting : true
    } ) )

  return [...existing, ...imageList.value]
} )

const combinedFileList = computed( () => {
  const existing = props.existingFileList
    .filter( url => !removedExistingFiles.value.includes( url ) )
    .map( ( url, index ) => {
      // Extract filename from URL
      const filename = url.split( '/' ).pop() || `existing-file-${index}`
      return {
        uid : `existing-file-${index}`,
        name : filename,
        url,
        status : 'success',
        isExisting : true
      }
    } )
  return [...existing, ...fileList.value]
} )

const handleFileChange = ( file, newFileList ) => {
  // Only process new files (files with raw property) and filter out existing files
  // Also filter out any files that might be from removed existing files
  const newFiles = newFileList.filter( uploadedFile => {
    // Must have raw property (new upload)
    if ( !uploadedFile.raw ) return false

    // Must not be marked as existing
    if ( uploadedFile.isExisting ) return false

    // Must not be in the removed list (extra safety check)
    if ( uploadedFile.url && removedExistingFiles.value.includes( uploadedFile.url ) ) return false

    return true
  } )

  const readerPromises = newFiles.map( uploadedFile => {
    return new Promise( resolve => {
      if ( !uploadedFile.uid ) {
        uploadedFile.uid = Date.now().toString()
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
    // Final safety check - ensure no existing files sneak into new list
    const cleanedList = resolvedList.filter( file => !file.isExisting && !removedExistingFiles.value.includes( file.url ) )
    fileList.value = cleanedList
  } )
}

const handleFileRemove = file => {
  if ( file.isExisting ) {
    // Handle removal of existing file
    if ( !removedExistingFiles.value.includes( file.url ) ) {
      removedExistingFiles.value.push( file.url )
    }
  } else {
    // Handle removal of newly uploaded file
    const index = fileList.value.findIndex( item => item.uid === file.uid )
    if ( index !== -1 ) {
      fileList.value.splice( index, 1 )
    }
  }
}

const handlePictureCardPreview = file => {
  if ( file.url ) {
    dialogImageUrl.value = file.url
    dialogVisible.value = true
  }
}

const handleImageRemove = file => {
  if ( file.isExisting ) {
    // Handle removal of existing image
    if ( !removedExistingImages.value.includes( file.url ) ) {
      removedExistingImages.value.push( file.url )
    }
  } else {
    // Handle removal of newly uploaded image
    const index = imageList.value.findIndex( item => item.uid === file.uid )
    if ( index !== -1 ) {
      imageList.value.splice( index, 1 )
    }
  }
}

const handleImageChange = ( file, uploadFileList ) => {
  // Only process new files (files with raw property) and filter out existing files
  // Also filter out any files that might be from removed existing images
  const newFiles = uploadFileList.filter( uploadedFile => {
    // Must have raw property (new upload)
    if ( !uploadedFile.raw ) return false

    // Must not be marked as existing
    if ( uploadedFile.isExisting ) return false

    // Must not be in the removed list (extra safety check)
    if ( uploadedFile.url && removedExistingImages.value.includes( uploadedFile.url ) ) return false

    return true
  } )

  const readerPromises = newFiles.map( uploadedFile => {
    return new Promise( resolve => {
      if ( !uploadedFile.uid ) {
        uploadedFile.uid = Date.now().toString()
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
    // Final safety check - ensure no existing files sneak into new list
    const cleanedList = resolvedList.filter( file => !file.isExisting && !removedExistingImages.value.includes( file.url ) )
    imageList.value = cleanedList
  } )
}

// Upload validation functions
const beforeImageUpload = file => {
  const isValidType = file.type.startsWith( 'image/' )
  if ( !isValidType ) {
    ElMessage.error( 'Only image files are allowed!' )
    return false
  }

  if ( props.maxImages > 0 && combinedImageList.value.length >= props.maxImages ) {
    ElMessage.error( `Maximum ${props.maxImages} images allowed!` )
    return false
  }

  return true
}

const beforeFileUpload = file => {
  const allowedTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.zip',
    '.rar',
    '.csv',
    '.json',
    '.xml',
    '.ppt',
    '.pptx'
  ]
  const fileExtension = '.' + file.name.split( '.' ).pop().toLowerCase()
  const isValidType = allowedTypes.includes( fileExtension )

  if ( !isValidType ) {
    ElMessage.error( 'File type not allowed!' )
    return false
  }

  if ( props.maxFiles > 0 && combinedFileList.value.length >= props.maxFiles ) {
    ElMessage.error( `Maximum ${props.maxFiles} files allowed!` )
    return false
  }

  return true
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

watch(
  removedExistingImages,
  list => {
    console.log( 'Emitting removedExistingImages list:', list.slice() )
    emit( 'update:removedExistingImages', list.slice() )
  },
  { deep : true }
)

watch(
  removedExistingFiles,
  list => {
    console.log( 'Emitting removedExistingFiles list:', list.slice() )
    emit( 'update:removedExistingFiles', list.slice() )
  },
  { deep : true }
)

// Reset removed items when component reinitializes
const resetRemovedItems = () => {
  removedExistingImages.value = []
  removedExistingFiles.value = []
}

// Clear any existing files that might have accidentally been added to new file lists
const clearExistingFromNewLists = () => {
  // Remove any existing files that got into imageList
  imageList.value = imageList.value.filter( file => !file.isExisting )
  // Remove any existing files that got into fileList
  fileList.value = fileList.value.filter( file => !file.isExisting )
}

const resetNewFileLists = () => {
  imageList.value = []
  fileList.value = []
}

// Watch for changes in existing props to reset removed items
watch(
  () => [props.existingImageList, props.existingFileList],
  () => {
    resetRemovedItems()
    clearExistingFromNewLists()
  },
  { deep : true }
)

// Initialize existing files on mount or when props change
onMounted( () => {
  // Reset removed items on mount
  resetRemovedItems()
  clearExistingFromNewLists()

  // Initialize with existing data if provided
  if ( props.existingImageList.length > 0 || props.existingFileList.length > 0 ) {
    console.log( 'Initialized with existing files:', {
      images : props.existingImageList,
      files : props.existingFileList
    } )
  }
} )

// Expose reset function for parent components
defineExpose( {
  resetRemovedItems,
  clearExistingFromNewLists,
  resetNewFileLists
} )
</script>

<style scoped>
.upload-editor {
  width: 100%;
}

.upload-demo {
  width: 100%;
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>

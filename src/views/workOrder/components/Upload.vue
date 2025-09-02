<template>
  <div class="upload-editor">
    <el-form-item label="图片上传" prop="upload">
      <el-upload
        v-loading="uploading"
        class="upload-demo"
        action="#"
        list-type="picture-card"
        :auto-upload="false"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :file-list="fileList"
        :on-change="handleChange"
        :on-progress="handleBeforeUpload"
        accept="image/*"
      >
        <el-icon><Plus /></el-icon>

        <!-- File Item Template (Add Download Button Here) -->
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
              <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                <el-icon><Delete /></el-icon>
              </span>
            </span>
          </div>
        </template>
      </el-upload>

      <el-dialog fullscreen v-model="dialogVisible" append-to-body>
        <div class="image-wrapper">
          <img :src="dialogImageUrl" alt="Preview Image" />
        </div>
      </el-dialog>
    </el-form-item>

    <!-- 文件上传 Field -->
    <el-form-item label="文件上传" prop="upload">
      <el-upload
        class="upload-demo"
        action="#"
        list-type="text"
        :auto-upload="false"
        :on-remove="handleFileRemove"
        :file-list="fileFileList"
        :on-change="handleFileChange"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.json,.xml,.ppt,.pptx"
      >
        <el-button size="small" type="success">点击上传</el-button>
      </el-upload>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const fileList = ref( [] )
const dialogVisible = ref( false )
const dialogImageUrl = ref( '' )
const uploading = ref( false )
const fileFileList = ref( [] )

defineProps( {
  imageList : {
    type : Array,
    default : () => []
  },
  filesList : {
    type : Array,
    default : () => []
  }
} )

const emit = defineEmits( ['update:imageList', 'update:filesList'] )

const handleFileChange = ( file, newFileList ) => {
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
    fileFileList.value = resolvedList
  } )
}

const handleFileRemove = file => {
  const index = fileFileList.value.findIndex( item => item.uid === file.uid )
  if ( index !== -1 ) {
    fileFileList.value.splice( index, 1 )
    fileFileList.value = JSON.parse( JSON.stringify( fileFileList.value ) ) // Trigger reactivity
  } else {
    console.error( 'File not found in fileFileList.' )
  }
}

const handlePictureCardPreview = file => {
  if ( file.url ) {
    dialogImageUrl.value = file.url
    dialogVisible.value = true
  } else {
    console.error( 'Invalid image URL. Please check the file object:', file )
  }
}

const handleRemove = file => {
  const index = fileList.value.findIndex( item => item.uid === file.uid )
  if ( index !== -1 ) {
    fileList.value.splice( index, 1 )
    // Trigger reactivity properly
    fileList.value = JSON.parse( JSON.stringify( fileList.value ) )
  } else {
    console.error( 'File not found in fileList.' )
  }
}

const handleChange = ( file, uploadFileList ) => {
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
    fileList.value = resolvedList
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
  } else {
    console.error( 'File URL not available for download.' )
  }
}

const handleBeforeUpload = file => {
  uploading.value = true // Optionally, you can trigger a loading state here
  return true // Return true to proceed with the upload, false to cancel
}

watch(
  fileList,
  newList => {
    const fileArray = newList.map( file => file.raw ).filter( file => file instanceof File )
    emit( 'update:imageList', fileArray )
  },
  { deep : true }
)

watch(
  fileFileList,
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
}

.upload-demo {
  width: 100%;
}

.image-wrapper {
  display: flex;
  justify-content: center; /* Horizontally center */
  align-items: center; /* Vertically center */
  height: 100%; /* Make sure it occupies full height of the dialog */
}
</style>

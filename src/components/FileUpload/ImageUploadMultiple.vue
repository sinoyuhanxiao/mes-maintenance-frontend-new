<template>
  <div class="upload-editor">
    <el-form-item label="Image Upload" label-position="top">
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
        accept="image/*"
      >
        <el-icon><Plus /></el-icon>

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

      <el-dialog fullscreen v-model="dialogVisible" append-to-body>
        <div class="image-wrapper">
          <img :src="dialogImageUrl" alt="Preview Image" />
        </div>
      </el-dialog>
    </el-form-item>

    <!-- File Upload Field -->
    <el-form-item label="File Upload" label-position="top">
      <el-upload
        class="upload-demo"
        action="#"
        list-type="text"
        :auto-upload="false"
        :on-remove="handleFileRemove"
        :file-list="fileList"
        :on-change="handleFileChange"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.json,.xml,.ppt,.pptx"
      >
        <el-button size="small" type="success">Click to Upload</el-button>
      </el-upload>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, ZoomIn, Download, Delete } from '@element-plus/icons-vue'

const imageList = ref( [] )
const dialogVisible = ref( false )
const dialogImageUrl = ref( '' )
const uploading = ref( false )
const fileList = ref( [] )

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

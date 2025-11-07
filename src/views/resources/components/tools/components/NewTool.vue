<template>
  <div class="add-new-tool">
    <div class="general-information">
      <el-form ref="formRef" :model="inputData" :rules="rules" :label-position="labelPosition" label-width="auto">
        <!-- Row 1: Tool Name + Tool Code -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Tool Name"
              prop="name"
              :rules="[
                { required: true, message: 'Tool Name is required' },
                { type: 'string', message: 'Tool Name must be a string' },
              ]"
            >
              <el-input v-model="inputData.name" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Code" prop="code" :rules="[{ required: true, message: 'Code is required' }]">
              <el-input v-model="inputData.code" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 2: Category -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category" prop="tool_class_id">
              <el-select v-model="inputData.tool_class_id" filterable clearable style="width: 100%">
                <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 3: Description (full width) -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description" prop="description">
              <el-input v-model="inputData.description" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Upload Section -->
      <div class="file-upload">
        <FileUploadMultiple
            @update:imageList="handleImageListUpdate"
            @update:removedExistingImages="handleRemovedExistingImages"
            :existing-image-list="existingImages"
            image-label="Images"
            upload-type="images"
            :max-images="1"
        />
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="createTool">Create</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getAllToolClasses } from '@/api/resources'
import FileUploadMultiple from '../../../../../components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '@/api/minio'
import { ElMessage } from 'element-plus'

const emit = defineEmits( ['createTool', 'cancel', 'close'] )
const formRef = ref( null )
const labelPosition = ref( 'top' )

const toolClasses = ref( [] )
// Images states
const existingImages = ref( [] )
const newImages = ref( [] )
const newImageUrls = ref( [] )
const removedImageUrls = ref( [] )

const inputData = ref( {
  id : null,
  name : '',
  description : '',
  tool_class_id : null,
  code : '',
  image_list : [] // can contain existing URLs or new UploadFile objects
} )

async function getToolClasses() {
  try {
    const response = await getAllToolClasses()
    toolClasses.value = response?.data || []
  } catch {
    toolClasses.value = []
  }
}
getToolClasses()

const rules = reactive( {
  name : [{ required : true, message : 'Please input Tool Name', trigger : 'blur' }],
  code : [{ required : true, message : 'Please input Tool Code', trigger : 'blur' }],
  tool_class_id : [{ required : true, message : 'Please select Tool Class', trigger : 'change' }]
} )

// Upload files to MinIO server
const uploadFilesToServer = async() => {
  try {
    // Upload NEW images if they exist
    if ( newImages.value.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( newImages.value )
      const uploadedImages = imageRes.data.uploadedFiles || []
      newImageUrls.value = uploadedImages.map( file => file.url )
    }

    return { newImageUrls : newImageUrls.value }
  } catch ( error ) {
    console.error( 'File upload failed:', error )
    throw new Error( 'File upload failed' )
  }
}

const handleImageListUpdate = images => {
  // Track NEW images separately (File objects from FileUploadMultiple component)
  newImages.value = images
}

const handleRemovedExistingImages = removedUrls => {
  removedImageUrls.value = removedUrls
}

const createTool = async() => {
  try {
    if ( !formRef.value ) {
      return
    }
    await formRef.value.validate( async valid => {
      if ( !valid ) {
        return
      }

      // Upload new files to MinIO
      if ( newImages.value.length > 0 ) {
        await uploadFilesToServer()
      }

      // Combine existing files with newly uploaded files
      let finalImageList = [...( existingImages.value || [] ), ...( newImageUrls.value || [] )]

      // Filter out removed files
      finalImageList = finalImageList.filter( url => !removedImageUrls.value.includes( url ) )

      const payload = {
        ...inputData.value,
        image_list : finalImageList
      }

      // 2) emit a clean payload (URLs only for images)
      emit( 'createTool', payload )

      // 3) reset + close
      resetForm()
      emit( 'close' )
    } )
  } catch ( e ) {
    ElMessage.error( `Failed to create tool: ${e?.message || 'Unknown error'}` )
  }
}

const handleCancel = () => {
  emit( 'cancel' )
  emit( 'close' )
}

const resetForm = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }

  existingImages.value = []

  inputData.value = {
    id : null,
    name : '',
    description : '',
    tool_class_id : null,
    code : '',
    image_list : []
  }
}
</script>

<style scoped>
.add-new-tool {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.general-information {
  margin-top: 16px;
}

.file-upload {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.el-form-item) {
  width: 100%;
}
</style>

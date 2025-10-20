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
              <el-input v-model="inputData.name" clearable placeholder="Enter Tool Name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Tool Code" prop="code" :rules="[{ required: true, message: 'Tool Code is required' }]">
              <el-input v-model="inputData.code" clearable placeholder="Enter Tool Code" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 2: Category + Manufacturer -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tool Class" prop="tool_class_id">
              <el-select
                v-model="inputData.tool_class_id"
                filterable
                clearable
                placeholder="Select Tool Class"
                style="width: 100%"
              >
                <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Manufacturer" prop="manufacturer">
              <el-input v-model="inputData.manufacturer" clearable placeholder="Enter Manufacturer" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 3: Description (full width) -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="inputData.description"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="Describe the tool"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Upload Section -->
      <div class="file-upload">
        <FileUploadMultiple @update:imageList="handleImageListUpdate" upload-type="images" :max-images="1" />
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
import { getAllToolClasses } from '../../../../api/resources'
import FileUploadMultiple from '../../../../components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '../../../../api/minio'

const emit = defineEmits( ['createTool', 'cancel', 'close'] )
const formRef = ref( null )
const labelPosition = ref( 'top' )

const toolClasses = ref( [] )

const inputData = ref( {
  id : null,
  name : '',
  description : '',
  tool_class_id : null,
  code : '',
  manufacturer : '',
  image_list : []
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

const handleImageListUpdate = images => {
  inputData.value.image_list = images || []
}

const uploadFilesToServer = async() => {
  try {
    if ( Array.isArray( inputData.value.image_list ) && inputData.value.image_list.length > 0 ) {
      const needsUpload = inputData.value.image_list.some( f => typeof f !== 'string' )
      if ( needsUpload ) {
        const imageRes = await uploadMultipleToMinio( inputData.value.image_list )
        const uploaded = imageRes?.data?.uploadedFiles || []
        inputData.value.image_list = uploaded.map( file => file.url )
      }
    }
  } catch {
    throw new Error( 'File upload failed' )
  }
}

const createTool = async() => {
  if ( !formRef.value ) return
  await formRef.value.validate( async valid => {
    if ( !valid ) return
    await uploadFilesToServer()
    emit( 'createTool', { ...inputData.value } )
    resetForm()
    emit( 'close' )
  } )
}

const handleCancel = () => {
  emit( 'cancel' )
  emit( 'close' )
}

const resetForm = () => {
  if ( formRef.value ) formRef.value.resetFields()
  inputData.value = {
    id : null,
    name : '',
    description : '',
    tool_class_id : null,
    code : '',
    manufacturer : '',
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

<template>
  <div class="edit-tool">
    <div class="general-information">
      <el-form ref="formRef" :model="formData" :rules="rules" :label-position="labelPosition" label-width="auto">
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
              <el-input v-model="formData.name" clearable placeholder="Please input Tool Name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Code" prop="code" :rules="[{ required: true, message: 'Please input Tool Code' }]">
              <el-input v-model="formData.code" clearable placeholder="Please input Tool Code" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 2: Category + Manufacturer (text input to keep simple) -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category" prop="tool_class_id">
              <el-select
                v-model="formData.tool_class_id"
                filterable
                clearable
                placeholder="Select Tool Category"
                style="width: 100%"
              >
                <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Manufacturer" prop="manufacturer">
              <el-input v-model="formData.manufacturer" clearable placeholder="Enter Manufacturer" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 3: Description (full width) -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 8 }"
                placeholder="Please Describe Tool"
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
        <el-button @click="emit('close')">Cancel</el-button>
        <el-button type="primary" @click="onSubmit" :loading="submitLoading">Update</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllToolClasses } from '@/api/resources'
import { uploadMultipleToMinio } from '@/api/minio'
import FileUploadMultiple from '../../../../components/FileUpload/FileUploadMultiple.vue'

const props = defineProps( { data : Object } )
const emit = defineEmits( ['editTool', 'close'] )

const formRef = ref( null )
const labelPosition = ref( 'top' )
const submitLoading = ref( false )

const toolClasses = ref( [] )

// Make an editable copy of incoming data (avoid mutating prop directly)
const formData = reactive( {
  id : null,
  name : '',
  code : '',
  description : '',
  tool_class_id : null,
  manufacturer : '',
  image_list : [] // array of URLs or File objects (from uploader)
} )

watch(
  () => props.data,
  v => {
    if ( !v ) return
    Object.assign( formData, {
      id : v.id ?? null,
      name : v.name ?? '',
      code : v.code ?? '',
      description : v.description ?? '',
      tool_class_id : v.tool_class_id ?? v.tool_class?.id ?? null,
      manufacturer : v.manufacturer ?? '',
      image_list : Array.isArray( v.image_list ) ? [...v.image_list] : v.image_list ? [v.image_list] : []
    } )
  },
  { immediate : true, deep : true }
)

async function getToolClasses() {
  try {
    const res = await getAllToolClasses()
    toolClasses.value = res?.data || []
  } catch {
    toolClasses.value = []
  }
}
getToolClasses()

const rules = reactive( {
  name : [{ required : true, message : 'Please input Name', trigger : 'blur' }],
  code : [{ required : true, message : 'Please enter Code', trigger : 'blur' }],
  tool_class_id : [{ required : true, message : 'Please select Tool Class', trigger : 'change' }]
} )

const handleImageListUpdate = images => {
  formData.image_list = images || []
}

const needsUpload = arr => Array.isArray( arr ) && arr.some( it => typeof it !== 'string' )

const uploadImagesIfNeeded = async() => {
  if ( !Array.isArray( formData.image_list ) || formData.image_list.length === 0 ) return
  if ( !needsUpload( formData.image_list ) ) return
  const imageRes = await uploadMultipleToMinio( formData.image_list )
  const uploaded = imageRes?.data?.uploadedFiles || []
  formData.image_list = uploaded.map( f => f.url )
}

const onSubmit = async() => {
  if ( !formRef.value ) return
  const valid = await formRef.value.validate().catch( () => false )
  if ( !valid ) return

  submitLoading.value = true
  try {
    await uploadImagesIfNeeded()
    emit( 'editTool', { ...formData } )
  } catch ( e ) {
    ElMessage.error( `Failed to update: ${e?.message || 'Unknown error'}` )
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.edit-tool {
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

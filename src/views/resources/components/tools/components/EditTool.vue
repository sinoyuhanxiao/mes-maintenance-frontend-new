<template>
  <div class="edit-tool">
    <div class="general-information">
      <el-form ref="formRef" :model="localForm" :rules="rules" :label-position="labelPosition" label-width="auto">
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
              <el-input v-model="localForm.name" clearable placeholder="Please input Tool Name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Code" prop="code" :rules="[{ required: true, message: 'Please input Tool Code' }]">
              <el-input v-model="localForm.code" clearable placeholder="Please input Tool Code" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 2: Category -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category" prop="tool_class_id">
              <el-select
                v-model="localForm.tool_class_id"
                filterable
                clearable
                placeholder="Select Tool Category"
                style="width: 100%"
              >
                <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Row 3: Description -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="localForm.description"
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
        <el-button
          @click="
            () => {
              emit('cancel')
              emit('close')
            }
          "
          >Cancel</el-button
        >

        <el-button type="primary" @click="onSubmit" :loading="submitLoading">Update</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllToolClasses } from '@/api/resources'
import { uploadMultipleToMinio } from '@/api/minio'
import FileUploadMultiple from '../../../../../components/FileUpload/FileUploadMultiple.vue'

const props = defineProps( { data : Object } )

const formRef = ref( null )
const labelPosition = ref( 'top' )
const submitLoading = ref( false )

const toolClasses = ref( [] )
// inside <script setup>
const emit = defineEmits( ['editTool', 'close', 'cancel'] )

// Images states
const existingImages = ref( [] )
const newImages = ref( [] )
const newImageUrls = ref( [] )
const removedImageUrls = ref( [] )

const localForm = reactive( {
  id : null,
  name : '',
  code : '',
  description : '',
  tool_class_id : null,
  image_list : []
} )

/** Prefill from props.data (same style as Location/Vendor) */
watch(
  () => props.data,
  async v => {
    if ( !v ) {
      return
    }

    existingImages.value = v.image_list

    localForm.id = v.id ?? null
    localForm.name = v.name ?? ''
    localForm.code = v.code ?? ''
    localForm.description = v.description ?? ''
    localForm.tool_class_id = v.tool_class_id ?? v.tool_class?.id ?? null

    // keep URLs; clear per-session state
    localForm.image_list = v.image_list

    await nextTick()
  },
  { immediate : true, deep : true }
)

/** Validation */
const rules = reactive( {
  name : [{ required : true, message : 'Please input Name', trigger : 'blur' }],
  code : [{ required : true, message : 'Please enter Code', trigger : 'blur' }],
  tool_class_id : [{ required : true, message : 'Please select Tool Class', trigger : 'change' }]
} )

/** Data sources */
async function getToolClasses() {
  try {
    const res = await getAllToolClasses()
    toolClasses.value = res?.data || []
  } catch {
    toolClasses.value = []
  }
}

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

/** Submit */
const onSubmit = async() => {
  submitLoading.value = true

  try {
    if ( !formRef.value ) {
      return
    }

    const valid = await formRef.value.validate().catch( () => false )

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
      id : localForm.id,
      name : localForm.name,
      code : localForm.code,
      description : localForm.description,
      tool_class_id : localForm.tool_class_id,
      image_list : finalImageList
    }
    emit( 'editTool', payload )
  } catch ( e ) {
    ElMessage.error( `Failed to update: ${e?.message || 'Unknown error'}` )
  } finally {
    submitLoading.value = false
  }
}

onMounted( async() => {
  await getToolClasses()
} )

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

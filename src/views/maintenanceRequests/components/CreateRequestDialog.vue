<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    title="Create Request"
    width="600px"
    :before-close="handleFormCancel"
  >
    <el-form :model="formData" :rules="formRules" ref="requestForm" label-width="120px" style="margin-right: 16px">
      <el-form-item label="Name" prop="name">
        <el-input v-model="formData.name" placeholder="Enter request name" />
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="Describe the maintenance issue or request"
        />
      </el-form-item>

      <el-form-item label="Equipment" prop="equipment_node_id">
        <el-tree-select
          v-model="formData.equipment_node_id"
          :data="equipmentTreeData"
          placeholder="Select equipment"
          filterable
          check-strictly
          node-key="value"
          :props="{ children: 'children', label: 'label' }"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Images" prop="image_list">
        <FileUploadMultiple
          ref="fileUploadRef"
          upload-type="images"
          image-label=""
          title-label-position="top"
          :max-images="3"
          @update:imageList="handleImageListUpdate"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleFormCancel">Cancel</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="loading" :disabled="!isFormValid">
          Create Request
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '@/api/minio.js'

const props = defineProps( {
  visible : {
    type : Boolean,
    default : false
  },
  equipmentTreeData : {
    type : Array,
    default : () => []
  },
  loading : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['update:visible', 'submit'] )

// Form state
const requestForm = ref( null )
const fileUploadRef = ref( null )
const uploadedImageFiles = ref( [] )
const formData = ref( {
  name : '',
  description : '',
  equipment_node_id : null,
  image_list : []
} )

// Form validation rules
const formRules = {
  name : [
    { required : true, message : 'Please enter request name', trigger : 'blur' },
    { min : 2, max : 100, message : 'Name should be between 2 and 100 characters', trigger : 'blur' }
  ]
}

// Computed
const isFormValid = computed( () => {
  return formData.value.name && formData.value.name.length >= 2
} )

// Image upload handling
const handleImageListUpdate = imageFiles => {
  // Store the File[] array from FileUploadMultiple component
  uploadedImageFiles.value = imageFiles
}

// Dialog handlers
const handleClose = value => {
  emit( 'update:visible', value )
}

const handleFormCancel = () => {
  resetForm()
  emit( 'update:visible', false )
}

// Upload files to MinIO and return URLs
const uploadFilesToMinio = async() => {
  if ( uploadedImageFiles.value.length === 0 ) {
    return []
  }

  try {
    const imageRes = await uploadMultipleToMinio( uploadedImageFiles.value )
    const uploadedFiles = imageRes.data.uploadedFiles || []
    return uploadedFiles.map( file => file.url )
  } catch ( error ) {
    throw new Error( 'File upload to MinIO failed' )
  }
}

const handleFormSubmit = async() => {
  if ( !requestForm.value ) return

  try {
    await requestForm.value.validate()

    // Upload images to MinIO and get URLs
    const imageUrls = await uploadFilesToMinio()

    // Prepare submission data with URLs instead of base64
    const submitData = {
      name : formData.value.name,
      description : formData.value.description,
      equipment_node_id : formData.value.equipment_node_id,
      image_list : imageUrls
    }

    emit( 'submit', submitData )
  } catch ( error ) {
    if ( error.message.includes( 'MinIO' ) ) {
      ElMessage.error( 'Failed to upload images. Please try again.' )
    } else {
      ElMessage.warning( 'Please fill in all required fields' )
    }
  }
}

const resetForm = () => {
  formData.value = {
    name : '',
    description : '',
    equipment_node_id : null,
    image_list : []
  }
  uploadedImageFiles.value = []
  if ( requestForm.value ) {
    requestForm.value.clearValidate()
  }
  // Clear the file upload component's image list
  if ( fileUploadRef.value ) {
    fileUploadRef.value.resetNewFileLists()
  }
}

// Watch for dialog close to reset form
watch(
  () => props.visible,
  newVal => {
    if ( !newVal ) {
      resetForm()
    }
  }
)

defineOptions( {
  name : 'CreateRequestDialog'
} )
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    title="Edit Request"
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
          :existing-image-list="existingImages"
          @update:imageList="handleImageListUpdate"
          @update:removedExistingImages="handleRemovedImagesUpdate"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleFormCancel">Cancel</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="loading" :disabled="!isFormValid">
          Update Request
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

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  equipmentTreeData: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  requestData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'submit'])

// Form state
const requestForm = ref(null)
const fileUploadRef = ref(null)
const uploadedImageFiles = ref([])
const removedExistingImages = ref([])
const existingImages = ref([])
const formData = ref({
  name: '',
  description: '',
  equipment_node_id: null,
  image_list: [],
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: 'Please enter request name', trigger: 'blur' },
    { min: 2, max: 100, message: 'Name should be between 2 and 100 characters', trigger: 'blur' },
  ],
  equipment_node_id: [{ required: true, message: 'Please select equipment', trigger: 'change' }],
}

// Computed
const isFormValid = computed(() => {
  return formData.value.name && formData.value.name.length >= 2 && formData.value.equipment_node_id !== null
})

// Image upload handling
const handleImageListUpdate = imageFiles => {
  // Store the File[] array from FileUploadMultiple component (new images)
  uploadedImageFiles.value = imageFiles
}

const handleRemovedImagesUpdate = removedUrls => {
  // Store the removed existing image URLs
  removedExistingImages.value = removedUrls
}

// Dialog handlers
const handleClose = value => {
  emit('update:visible', value)
}

const handleFormCancel = () => {
  resetForm()
  emit('update:visible', false)
}

// Upload new files to MinIO and return URLs
const uploadFilesToMinio = async () => {
  if (uploadedImageFiles.value.length === 0) {
    return []
  }

  try {
    const imageRes = await uploadMultipleToMinio(uploadedImageFiles.value)
    const uploadedFiles = imageRes.data.uploadedFiles || []
    return uploadedFiles.map(file => file.url)
  } catch (error) {
    throw new Error('File upload to MinIO failed')
  }
}

const handleFormSubmit = async () => {
  if (!requestForm.value) return

  try {
    await requestForm.value.validate()

    // Upload new images to MinIO and get URLs
    const newImageUrls = await uploadFilesToMinio()

    // Combine existing images (not removed) with new images
    const keptExistingImages = existingImages.value.filter(url => !removedExistingImages.value.includes(url))
    const finalImageList = [...keptExistingImages, ...newImageUrls]

    // Prepare submission data
    const submitData = {
      id: props.requestData.id,
      name: formData.value.name,
      description: formData.value.description,
      equipment_node_id: formData.value.equipment_node_id,
      image_list: finalImageList,
      status: props.requestData.status, // Keep existing status
    }

    emit('submit', submitData)
  } catch (error) {
    if (error.message && error.message.includes('MinIO')) {
      ElMessage.error('Failed to upload images. Please try again.')
    } else {
      ElMessage.warning('Please fill in all required fields')
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    equipment_node_id: null,
    image_list: [],
  }
  uploadedImageFiles.value = []
  removedExistingImages.value = []
  existingImages.value = []
  if (requestForm.value) {
    requestForm.value.clearValidate()
  }
  // Clear the file upload component's image list
  if (fileUploadRef.value) {
    fileUploadRef.value.resetNewFileLists()
    fileUploadRef.value.resetRemovedItems()
  }
}

const initializeForm = () => {
  if (props.requestData) {
    formData.value = {
      name: props.requestData.name || '',
      description: props.requestData.description || '',
      equipment_node_id: props.requestData.equipment_node?.id || props.requestData.equipment_node_id || null,
      image_list: props.requestData.image_list || [],
    }

    // Parse existing images
    if (Array.isArray(props.requestData.image_list)) {
      existingImages.value = props.requestData.image_list
    } else if (typeof props.requestData.image_list === 'string') {
      existingImages.value = props.requestData.image_list.split(',').filter(Boolean)
    } else {
      existingImages.value = []
    }

    // Reset removed images tracking
    removedExistingImages.value = []
    uploadedImageFiles.value = []
  }
}

// Watch for dialog open to initialize form
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      initializeForm()
    } else {
      resetForm()
    }
  }
)

defineOptions({
  name: 'EditRequestDialog',
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

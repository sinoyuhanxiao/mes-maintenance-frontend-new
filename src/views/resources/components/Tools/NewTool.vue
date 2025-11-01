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

        <!-- Row 2: Category + Manufacturer -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category" prop="tool_class_id">
              <el-select v-model="inputData.tool_class_id" filterable clearable style="width: 100%">
                <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Manufacturer" prop="manufacturer">
              <el-input v-model="inputData.manufacturer" clearable />
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
          image-label="Upload Image"
          upload-type="images"
          :max-images="1"
          @update:imageList="handleImageListUpdate"
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
import FileUploadMultiple from '../../../../components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '@/api/minio'

const emit = defineEmits(['createTool', 'cancel', 'close'])
const formRef = ref(null)
const labelPosition = ref('top')

const toolClasses = ref([])

const inputData = ref({
  id: null,
  name: '',
  description: '',
  tool_class_id: null,
  code: '',
  manufacturer: '',
  image_list: [], // can contain existing URLs or new UploadFile objects
})

async function getToolClasses() {
  try {
    const response = await getAllToolClasses()
    toolClasses.value = response?.data || []
  } catch {
    toolClasses.value = []
  }
}
getToolClasses()

const rules = reactive({
  name: [{ required: true, message: 'Please input Tool Name', trigger: 'blur' }],
  code: [{ required: true, message: 'Please input Tool Code', trigger: 'blur' }],
  tool_class_id: [{ required: true, message: 'Please select Tool Class', trigger: 'change' }],
})

/** Element Plus UploadFile -> real File[] */
const toRealFiles = arr =>
  Array.isArray(arr)
    ? arr.map(x => (x instanceof File ? x : x?.raw instanceof File ? x.raw : null)).filter(Boolean)
    : []

/** normalize various API response shapes to URLs */
const extractUploadedUrls = resp => {
  const list = resp?.uploadedFiles ?? resp?.data?.uploadedFiles ?? resp?.data?.data?.uploadedFiles ?? resp?.files ?? []
  return (Array.isArray(list) ? list : []).map(f => f?.url || f?.fileUrl || f?.location || f?.path).filter(Boolean)
}

const handleImageListUpdate = images => {
  // Keep whatever the child gives (URLs or UploadFile objects)
  inputData.value.image_list = Array.isArray(images) ? images : []
}

const uploadFilesToServer = async () => {
  // Split into existing URLs + new Files
  const urlsKept = (inputData.value.image_list || []).filter(x => typeof x === 'string')
  const newFiles = toRealFiles(inputData.value.image_list)

  if (newFiles.length) {
    const imageRes = await uploadMultipleToMinio(newFiles)
    const uploadedUrls = extractUploadedUrls(imageRes)
    inputData.value.image_list = [...urlsKept, ...uploadedUrls]
  } else {
    // Only existing URLs; keep as is
    inputData.value.image_list = urlsKept
  }
}

const createTool = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return

    // 1) upload new files (if any) -> image_list becomes URLs
    await uploadFilesToServer()

    // 2) emit a clean payload (URLs only for images)
    emit('createTool', { ...inputData.value })

    // 3) reset + close
    resetForm()
    emit('close')
  })
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  inputData.value = {
    id: null,
    name: '',
    description: '',
    tool_class_id: null,
    code: '',
    manufacturer: '',
    image_list: [],
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

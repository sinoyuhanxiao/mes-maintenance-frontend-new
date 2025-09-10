<template>
  <el-card>
    <div class="details-layout">
      <div>
        <el-text tag="b">General Details</el-text>
        <hr />
      </div>
      <el-form ref="formRef" :model="inputData" :rules="rules" label-width="120px">
        <el-form-item style="flex: 1" label="Tool Name" prop="name"
          ><el-input
            clearable
            v-model="inputData.name"
            placeholder="Please input Tool Name"
            style="width: 99%"
          ></el-input
        ></el-form-item>

        <!-- Code Input -->
        <el-form-item style="flex: 1" label="Tool Code" prop="code"
          ><el-input
            clearable
            v-model="inputData.code"
            placeholder="Please input Tool Code"
            style="width: 99%"
          ></el-input
        ></el-form-item>

        <el-form-item style="flex: 1" label="Description" prop="description"
          ><el-input
            clearable
            v-model="inputData.description"
            placeholder="Please Describe Tool"
            style="width: 99%"
            type="textarea"
          ></el-input
        ></el-form-item>

        <!-- Category Input  -->
        <el-form-item label="Tool Class" prop="tool_class_id">
          <el-select v-model="inputData.tool_class_id" style="width: 99%">
            <el-option v-for="item in toolClasses" :key="item.id" :label="item.name" :value="item.id">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-text tag="b">Upload Image(s)</el-text>
        <hr />
        <FileUploadMultiple @update:imageList="handleImageListUpdate" upload-type="images" :max-images="1" />
      </el-form>
      <!-- Submit Button  -->
    </div>
    <div class="submit-button" @click="createTool">
      <el-form-item><el-button type="primary">Create Tool</el-button></el-form-item>
    </div>
  </el-card>
  <!-- <h1>{{ inputData }}</h1> -->
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getAllToolClasses } from '../../../../api/resources'
import FileUploadMultiple from '../../../../components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '../../../../api/minio'

const formRef = ref(null)
const uploadedImages = ref([])

const emit = defineEmits(['createTool'])

const toolClasses = ref(null)

const inputData = ref({
  id: null,
  name: null,
  description: null,
  tool_class_id: null,
  code: null,
  image_list: null,
})

async function getToolClasses() {
  const response = await getAllToolClasses()

  toolClasses.value = response.data
}

getToolClasses()

// Form rules
const rules = reactive({
  name: [{ required: true, message: 'Please input Name', trigger: 'blur' }],
  code: [{ required: true, message: 'Please enter Code', trigger: 'change' }],
  tool_class_id: [{ required: true, message: 'Please select Tool Class', trigger: 'change' }],
})

const handleImageListUpdate = images => {
  uploadedImages.value = images
  inputData.value.image_list = images
  console.log(images)
}

const uploadFilesToServer = async () => {
  try {
    let uploadedImages = []

    if (inputData.value.image_list.length > 0) {
      const imageRes = await uploadMultipleToMinio(inputData.value.image_list)
      uploadedImages = imageRes.data.uploadedFiles || []
      console.log(uploadedImages)
      inputData.value.image_list = uploadedImages.map(file => file.url)
    }

    return { uploadedImages }
  } catch (err) {
    throw new Error('File upload failed')
  }
}

const createTool = async () => {
  if (!formRef.value) return
  await uploadFilesToServer()
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      emit('createTool', inputData.value)
      resetForm()
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
  /* max-height: 580px; */
}

.details-panel {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  flex: 1;
  gap: 1rem;
}

.displays {
  margin-top: 10px;
}

.form-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.form-section .el-form-item {
  width: 50vw;
}

.submit-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
}

@media (max-width: 1600px) {
  .details-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    /* height: 420px; */
  }
}
</style>

<template>
  <el-card>
    <div class="details-layout">
      <div>
        <el-text tag="b">General Details</el-text>
        <hr />
      </div>
      <el-form ref="formRef" :model="inputData" :rules="rules" label-width="120px">
        <el-form-item style="flex: 1" label="Part Name" prop="name"
          ><el-input
            clearable
            v-model="inputData.name"
            placeholder="Please input Part Name"
            style="width: 99%"
          ></el-input
        ></el-form-item>

        <!-- Category Input  -->
        <el-form-item label="Category" prop="spare_parts_class_id">
          <el-select v-model="inputData.spare_parts_class_id" style="width: 99%">
            <el-option v-for="item in sparePartClasses" :key="item.id" :label="item.name" :value="item.id">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Manufactuer Input  -->
        <el-form-item label="Manufacturer" prop="manufacturer_id">
          <el-select v-model="inputData.manufacturer_id" style="width: 99%">
            <el-option v-for="item in manufacturers" :key="item.id" :label="item.name" :value="item.id">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Description Input -->
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="inputData.description"
            style="width: 99%"
            :rows="3"
            type="textarea"
            placeholder="Please Describe the Issue"
          />
        </el-form-item>

        <el-text tag="b">Specifications</el-text>
        <hr />

        <!-- Code Inputs -->
        <div class="form-section">
          <el-form-item label="Material Code" prop="code"
            ><el-input
              clearable
              v-model="inputData.code"
              placeholder="Please input Material Code"
              style="width: 99%"
            ></el-input
          ></el-form-item>
        </div>
        <div class="form-section">
          <el-form-item label="Inventory Code" prop="universal_code"
            ><el-input
              clearable
              v-model="inputData.universal_code"
              placeholder="Please input Inventory Code"
              style="width: 99%"
            ></el-input
          ></el-form-item>
        </div>

        <div class="form-section">
          <el-form-item label="Units" prop="quantity_uom_id">
            <el-select v-model="inputData.quantity_uom_id" style="width: 99%">
              <el-option v-for="item in units" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <!-- Inventory Details Inputs -->
        <div class="displays">
          <el-text tag="b">Stock Keeping</el-text>
          <hr />
          <div class="form-section">
            <el-form-item label="Min Stock" prop="minimum_stock_level">
              <el-input-number
                clearable
                v-model="inputData.minimum_stock_level"
                placeholder="Please input Min Stock"
                :precision="1"
                :step="1"
                :min="0"
                :max="inputData.maximum_stock_level"
                style="width: 98%"
              >
              </el-input-number>
            </el-form-item>
            <el-form-item label="Max Stock" prop="maximum_stock_level">
              <el-input-number
                clearable
                v-model="inputData.maximum_stock_level"
                placeholder="Please input Max Stock"
                :precision="1"
                :step="1"
                :min="inputData.minimum_stock_level"
                style="width: 98%"
              >
              </el-input-number>
            </el-form-item>
          </div>
          <div class="form-section">
            <el-form-item label="Current Stock" prop="current_stock">
              <el-input-number
                clearable
                v-model="inputData.current_stock"
                placeholder="Please input Current Stock"
                :precision="1"
                :step="1"
                :min="0"
                style="width: 98%"
              >
              </el-input-number>
            </el-form-item>
            <el-form-item label="Reorder Point" prop="reorder_point">
              <el-input-number
                clearable
                v-model="inputData.reorder_point"
                placeholder="Please input Reorder Point"
                :precision="1"
                :step="1"
                :min="inputData.minimum_stock_level"
                :max="inputData.maximum_stock_level"
                style="width: 98%"
              >
              </el-input-number>
            </el-form-item>
          </div>
        </div>

        <el-text tag="b">Upload Image(s)</el-text>
        <hr />
        <FileUploadMultiple
          @update:imageList="handleImageListUpdate"
          @update:fileList="handleFilesListUpdate"
          upload-type="both"
          :max-images="5"
          :max-files="5"
        />
      </el-form>
      <!-- Submit Button  -->
    </div>
    <div class="submit-button" @click="createPart(ruleFormRef)">
      <el-form-item><el-button type="primary">Create Spare Part</el-button></el-form-item>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getAllSparePartClasses, createSparePart } from '../../../api/resources'
import { getUnitByType } from '../../../api/common'
import { ElMessage } from 'element-plus'
import { uploadMultipleToMinio } from '../../../api/minio'
import FileUploadMultiple from '../../../components/FileUpload/FileUploadMultiple.vue'

const formRef = ref(null)
const ruleFormRef = ref()
const emit = defineEmits(['createPart'])

const sparePartClasses = ref([])
const uploadedImages = ref([])
const uploadedFiles = ref([])
const manufacturers = ref([
  {
    id: 1,
    name: 'FPS',
  },
])
const units = ref([])

async function getAllData() {
  const response = await getAllSparePartClasses()
  const unitResponse = await getUnitByType(15)

  sparePartClasses.value = response.data
  units.value = unitResponse.data
}

getAllData()

const inputData = ref({
  id: null,
  name: null,
  spare_parts_class_id: null,
  description: null,
  code: null,
  priority: null,
  quantity_uom_id: null,
  image_list: [],
  file_list: [],
  reorder_point: 0,
  maximum_stock_level: 1,
  minimum_stock_level: 0,
  current_stock: 0,
  universal_code: null,
  status: 1,
  inventory_requests: [],
  manufacturer_id: null,
})

// Form rules
const rules = reactive({
  name: [{ required: true, message: 'Please input Request Title', trigger: 'blur' }],
  description: [
    {
      required: true,
      message: 'Please fill in Description',
      trigger: 'blur',
    },
  ],
  code: [{ required: true, message: 'Please enter Material Code', trigger: 'blur' }],
  universal_code: [{ required: true, message: 'Please enter Material Code', trigger: 'blur' }],
  spare_parts_class_id: [{ required: true, message: 'Please select Category', trigger: 'blur' }],
  manufacturer_id: [{ required: true, message: 'Please select Manufacturer>', trigger: 'blur' }],
  quantity_uom_id: [{ required: true, message: 'Please select Units>', trigger: 'blur' }],
  current_stock: [{ required: true, message: 'Please enter Current Stock', trigger: 'blur' }],
  minimum_stock_level: [{ required: true, message: 'Please enter Min Stock', trigger: 'blur' }],
  maximum_stock_level: [{ required: true, message: 'Please enter Max Stock', trigger: 'blur' }],
  reorder_point: [{ required: true, message: 'Please enter Reorder Point', trigger: 'blur' }],
})

const handleImageListUpdate = images => {
  uploadedImages.value = images
  inputData.value.image_list = images
}

const handleFilesListUpdate = files => {
  uploadedFiles.value = files
  inputData.value.file_list = files
}

const uploadFilesToServer = async () => {
  try {
    let uploadedImages = []

    if (inputData.value.image_list.length > 0) {
      const imageRes = await uploadMultipleToMinio(inputData.value.image_list)
      uploadedImages = imageRes.data.uploadedFiles || []
      inputData.value.image_list = uploadedImages.map(file => file.url)
    }

    if (inputData.value.file_list.length > 0) {
      const fileRes = await uploadMultipleToMinio(inputData.value.file_list)
      uploadedFiles.value = fileRes.data.uploadedFiles || []
      inputData.value.file_list = uploadedFiles.value.map(file => file.url)
    }

    return { uploadedImages }
  } catch (err) {
    throw new Error('File upload failed')
  }
}

const partCreated = part => {
  ElMessage({
    message: 'Part Created: ' + part,
    type: 'success',
  })
}

const createPart = async () => {
  if (!formRef.value) return
  await uploadFilesToServer()
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('Part created: ', inputData.value)
      emit('createPart', createSparePart(inputData.value))
      partCreated(inputData.value.name)
      resetForm()
      // inputData.value = {
      //   id : null,
      //   name : null,
      //   spare_parts_class_id : null,
      //   description : null,
      //   code : null,
      //   priority : null,
      //   quantity_uom_id : null,
      //   image_list : [],
      //   file_list : [],
      //   reorder_point : 0,
      //   maximum_stock_level : 1,
      //   minimum_stock_level : 0,
      //   current_stock : 0,
      //   universal_code : null,
      //   created_by : null,
      //   updated_by : null,
      //   status : 1,
      //   inventory_requests : [],
      //   manufacturer_id : null
      // }
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

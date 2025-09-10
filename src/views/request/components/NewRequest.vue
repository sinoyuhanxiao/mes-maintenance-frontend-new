<template>
  <el-card>
    <div class="details-layout">
      <div>
        <el-text tag="b">Details</el-text>
        <hr />
      </div>
      <el-form ref="formRef" :model="inputData" :rules="rules" label-width="120px">
        <el-form-item label="Request Title" prop="name"
          ><el-input clearable v-model="inputData.name" placeholder="Please Input Title" style="width: 98%"></el-input
        ></el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="inputData.description"
            style="width: 98%"
            :rows="3"
            type="textarea"
            placeholder="Please Describe the Issue"
          />
        </el-form-item>

        <!-- Asset Selections  -->
        <el-text tag="b">Asset</el-text>
        <hr />
        <div class="asset-container">
          <el-form-item label="Related Assets" prop="equipment_node_id">
            <el-select v-model="nodeData.p_id" style="width: 100%" placeholder="Production Line (Tier 1)">
              <el-option v-for="item in productionLines" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="nodeData.p_id" prop="equipment_group_id">
            <el-select v-model="nodeData.eg_id" style="width: 100%" placeholder="Equipment Group (Tier 2)">
              <el-option v-for="item in equipmentGroups" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="nodeData.eg_id" prop="equipment_id">
            <el-select v-model="nodeData.e_id" style="width: 100%" placeholder="Equipment (Tier 3)">
              <el-option v-for="item in equipment" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="nodeData.e_id" prop="component_id">
            <el-select v-model="nodeData.c_id" style="width: 100%" placeholder="Component (Tier 4)">
              <el-option v-for="item in components" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-text tag="b">Upload Image(s)</el-text>
        <hr />
        <FileUploadMultiple @update:imageList="handleImageListUpdate" upload-type="images" :max-images="5" />
      </el-form>
    </div>
    <!-- Submit Button  -->
    <div class="submit-button" @click="submitRequest(ruleFormRef)">
      <el-form-item><el-button type="primary">Submit Request</el-button></el-form-item>
    </div>
  </el-card>
  <!-- <h1>{{ inputData }}</h1> -->
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import {
  productionLineTypeId,
  equipmentGroupTypeId,
  equipmentTypeId,
  componentTypeId,
  getEquipmentNodes,
} from '../../../api/equipment'
import { createRequest } from '../../../api/requests'
import { ElMessage } from 'element-plus'
import { uploadMultipleToMinio } from '../../../api/minio'
import FileUploadMultiple from '../../../components/FileUpload/FileUploadMultiple.vue'

const formRef = ref(null)
const ruleFormRef = ref(null)
const emit = defineEmits(['submitRequest'])

const productionLines = ref(null)
const equipmentGroups = ref(null)
const equipment = ref(null)
const components = ref(null)

async function getNodeData() {
  const pResponse = await getEquipmentNodes(1, 100, 'name', 'ASC', { node_type_ids: [productionLineTypeId] })
  const egResponse = await getEquipmentNodes(1, 100, 'name', 'ASC', {
    parent_ids: [nodeData.value.p_id],
    node_type_ids: [equipmentGroupTypeId],
  })
  const eResponse = await getEquipmentNodes(1, 100, 'name', 'ASC', {
    parent_ids: [nodeData.value.eg_id],
    node_type_ids: [equipmentTypeId],
  })
  const cResponse = await getEquipmentNodes(1, 100, 'name', 'ASC', {
    parent_ids: [nodeData.value.e_id],
    node_type_ids: [componentTypeId],
  })

  productionLines.value = pResponse.data.content
  equipmentGroups.value = egResponse.data.content
  equipment.value = eResponse.data.content
  components.value = cResponse.data.content
}

getNodeData()

const inputData = ref({
  id: null,
  name: null,
  description: null,
  equipment_node_id: null,
  image_list: null,
  work_order_id: null,
})

const nodeData = ref({
  p_id: null,
  eg_id: null,
  e_id: null,
  c_id: null,
})

const uploadedImages = ref([])

watch(
  nodeData,
  newVal => {
    const preferredId = [newVal.c_id, newVal.e_id, newVal.eg_id, newVal.p_id].find(id => id != null)

    if (preferredId != null) {
      inputData.value.equipment_node_id = preferredId
    }
  },
  { deep: true }
)

watch(
  nodeData,
  newVal => {
    getNodeData()
  },
  { deep: true }
)

// Form rules
const rules = reactive({
  name: [{ required: true, message: 'Please input Request Title', trigger: 'blur' }],
  description: [
    {
      required: true,
      message: 'Please fill in Description',
      trigger: 'change',
    },
  ],
  equipment_node_id: [{ required: true, message: 'Please select Production Line' }],
  equipment_group_id: [{ required: false }],
  equipment_id: [{ required: false }],
  component_id: [{ required: false }],
})

const requestSubmitted = request => {
  ElMessage({
    message: 'Request Submitted: ' + request,
    type: 'success',
  })
}

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
      console.log(inputData.value)
    }

    return { uploadedImages }
  } catch (err) {
    throw new Error('File upload failed')
  }
}

const submitRequest = async () => {
  if (!formRef.value) return
  await uploadFilesToServer()
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('request submitted: ', inputData.value)
      emit('submitRequest', createRequest(inputData.value))
      requestSubmitted(inputData.value.name)
      resetForm()
      // inputData.value = {
      //   name : null,
      //   description : null,
      //   equipment_node_id : null,
      //   image_list : null,
      //   work_order_id : null
      // }
      // nodeData.value = {
      //   p_id : null,
      //   eg_id : null,
      //   e_id : null,
      //   c_id : null
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
  /* max-height: 510px; */
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

.submit-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
}

.asset-container {
  border-radius: 10px;
  margin: 5px;
  padding: 5px;
}

@media (max-width: 1600px) {
  .details-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    /* height: 350px; */
  }
}
</style>

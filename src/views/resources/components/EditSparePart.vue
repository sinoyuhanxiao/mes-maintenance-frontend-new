<template>
  <div>
    <el-card>
      <el-text tag="b" size="large">Edit Spare Part</el-text>
      <div class="details-layout">
        <div>
          <el-text tag="b">General Details</el-text>
          <hr />
        </div>
        <el-form ref="ruleFormRef" :model="inputData" :rules="rules" label-width="120px">
          <el-form-item style="flex: 1" label="Part Name" prop="name"
            ><el-input
              clearable
              v-model="inputData.name"
              placeholder="Please input Part Name"
              style="width: 98%"
            ></el-input
          ></el-form-item>

          <!-- Category Input  -->
          <el-form-item label="Category" prop="spare_parts_class_id">
            <el-select v-model="inputData.spare_parts_class_id" style="width: 98%">
              <el-option v-for="item in sparePartClasses" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>

          <!-- Manufactuer Input  -->
          <el-form-item label="Manufacturer" prop="manufacturer_id">
            <el-select v-model="inputData.manufacturer_id" style="width: 98%">
              <el-option v-for="item in manufacturers" :key="item.id" :label="item.name" :value="item.id">
                {{ item.name }}
              </el-option>
            </el-select>
          </el-form-item>

          <!-- Description Input -->
          <el-form-item label="Description" prop="description">
            <el-input
              v-model="inputData.description"
              style="width: 98%"
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
                style="width: 98%"
              ></el-input
            ></el-form-item>
          </div>
          <div class="form-section">
            <el-form-item label="Inventory Code" prop="universal_code"
              ><el-input
                clearable
                v-model="inputData.universal_code"
                placeholder="Please input Inventory Code"
                style="width: 98%"
              ></el-input
            ></el-form-item>
          </div>

          <div class="form-section">
            <el-form-item label="Units" prop="quantity_uom_id">
              <el-select v-model="inputData.quantity_uom_id" style="width: 98%">
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
            image-label="Upload Images"
            :max-images="5"
            :max-files="5"
          />
        </el-form>
      </div>
      <!-- Buttons -->
      <div class="submit-button">
        <el-form-item
          ><el-button type="primary" @click="updatePart(ruleFormRef)"
            ><el-icon><Finished /></el-icon>Save</el-button
          ></el-form-item
        >
        <el-form-item
          ><el-button type="info" @click="() => emit('cancel')"
            ><el-icon><Close /></el-icon>Cancel</el-button
          ></el-form-item
        >
      </div>
    </el-card>
  </div>
  <!-- <h1>{{ inputData }}</h1> -->
  <h1>{{ inputData.image_path }}</h1>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getAllSparePartClasses, updateSparePart } from '../../../api/resources'
import { getUnitByType } from '../../../api/common'
import { Finished, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FileUploadMultiple from '../../../components/FileUpload/FileUploadMultiple.vue'

// import Save

const props = defineProps({
  data: Object,
})

const ruleFormRef = ref()
const emit = defineEmits(['updatePart', 'cancel'])

const sparePartClasses = ref([])
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
  id: props.data.id,
  name: props.data.name,
  spare_parts_class_id: props.data.spare_parts_class.id,
  description: props.data.description,
  code: props.data.code,
  priority: null,
  quantity_uom_id: props.data.quantity_uom.id,
  image_list: props.data.image_list,
  file_list: props.data.file_list,
  reorder_point: props.data.reorder_point,
  maximum_stock_level: props.data.maximum_stock_level,
  minimum_stock_level: props.data.minimum_stock_level,
  current_stock: props.data.current_stock,
  universal_code: props.data.universal_code,
  status: 1,
  inventory_requests: [],
  manufacturer_id: props.data.manufacturer.id,
})

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
  code: [{ required: true, message: 'Please enter Material Code', trigger: 'change' }],
  universal_code: [{ required: true, message: 'Please enter Material Code', trigger: 'change' }],
  spare_parts_class_id: [{ required: true, message: 'Please select Category', trigger: 'change' }],
  manufacturer_id: [{ required: true, message: 'Please select Manufacturer>', trigger: 'change' }],
  quantity_uom_id: [{ required: true, message: 'Please select Units>', trigger: 'change' }],
  current_stock: [{ required: true, message: 'Please enter Current Stock', trigger: 'change' }],
  minimum_stock_level: [{ required: true, message: 'Please enter Min Stock', trigger: 'change' }],
  maximum_stock_level: [{ required: true, message: 'Please enter Max Stock', trigger: 'change' }],
  reorder_point: [{ required: true, message: 'Please enter Reorder Point', trigger: 'change' }],
})

const partEdited = part => {
  ElMessage({
    message: 'Part Updated: ' + part,
    type: 'success',
  })
}

const updatePart = async formEl => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      emit('updatePart', updateSparePart(inputData.value.id, inputData.value))
      partEdited(inputData.value.name)
    }
  })
}
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
  max-height: 628px;
  margin-top: 10px;
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
  align-items: center;
}

.form-section .el-form-item {
  width: 100vw;
}

.submit-button {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 10px;
  gap: 1rem;
}

@media (max-width: 1600px) {
  .details-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    height: 412px;
  }
}
</style>

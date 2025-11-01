<template>
  <el-card>
    <div class="details-layout">
      <div>
        <el-text tag="b">Vendor Part Details</el-text>
        <hr />
      </div>

      <el-descriptions class="descriptions" :column="1">
        <el-descriptions-item label="Part Name:">{{ sparePartData.name }}</el-descriptions-item>
        <el-descriptions-item label="Vendor:">{{ vendorData.name }}</el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" :model="inputData" :rules="rules" label-width="150px">
        <!-- Code Input -->
        <el-form-item style="flex: 1" label="Ordering Code" prop="order_code"
          ><el-input
            clearable
            v-model="inputData.order_code"
            placeholder="Please input Ordering Code"
            style="width: 99%"
          ></el-input
        ></el-form-item>

        <el-form-item style="flex: 1" label="Unit Price" prop="unit_price"
          ><el-input
            clearable
            v-model="inputData.unit_price"
            placeholder="Please Input Unit Price"
            style="width: 99%"
            type="number"
          ></el-input
        ></el-form-item>

        <!-- Category Input  -->
        <el-form-item label="Currency" prop="price_uom_id">
          <el-select v-model="inputData.price_uom_id" style="width: 99%">
            <el-option v-for="item in price_units" :key="item.id" :label="item.name" :value="item.id">
              {{ item.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item style="flex: 1" label="Lead Time (Days)" prop="lead_time_days"
          ><el-input
            clearable
            v-model="inputData.lead_time_days"
            placeholder="Please Input Lead Time in Days"
            style="width: 99%"
            type="number"
          ></el-input
        ></el-form-item>
      </el-form>
      <!-- Submit Button  -->
    </div>
    <div>
      <el-form-item><el-button @click="addVendor" type="primary">Add Vendor</el-button></el-form-item>
    </div>
  </el-card>
  <!-- <el-text>{{ existingVendors }}</el-text> -->
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getUnitByType } from '../../../../api/common'
import { ElMessage } from 'element-plus'
import { updateSparePart } from '../../../../api/resources'

const props = defineProps({
  vendor: Object,
  sparePart: Object,
})

const formRef = ref(null)
const sparePartData = ref(props.sparePart)
const vendorData = ref(props.vendor)
const price_units = ref(null)

const existingVendors = ref(
  props.sparePart?.spare_part_vendors?.map(v => ({
    vendor_id: v.vendor?.id ?? null,
    order_code: v.order_code ?? null,
    lead_time_days: v.lead_time_days ?? null,
    unit_price: v.unit_price ?? null,
    price_uom_id: v.price_uom?.id ?? null,
  })) ?? []
)

watch(
  () => props,
  () => {
    vendorData.value = props.vendor
    sparePartData.value = props.sparePart
  },
  { deep: true }
)

const emit = defineEmits(['addVendor'])

async function getUnits() {
  const response = await getUnitByType(11)

  price_units.value = response.data
}

getUnits()

const inputData = ref({
  vendor_id: props.vendor.id,
  order_code: null,
  unit_price: null,
  lead_time_days: null,
  price_uom_id: null,
})

// Form rules
const rules = reactive({
  order_code: [{ required: true, message: 'Please enter Ordering Code', trigger: 'blur' }],
  unit_price: [{ required: true, message: 'Please enter Unit Price', trigger: 'blur' }],
  price_uom_id: [{ required: true, message: 'Please select Currency', trigger: 'blur' }],
  lead_time_days: [{ required: true, message: 'Please enter Lead Time', trigger: 'blur' }],
})

const vendorAdded = vendor => {
  ElMessage({
    message: 'Spare Part Vendor Added: ' + vendor,
    type: 'success',
  })
}

const addVendor = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    existingVendors.value.push(inputData.value)

    const newSparePartVendor = await updateSparePart(props.sparePart.id, {
      code: props.sparePart.code,
      vendor_requests: existingVendors.value,
    })
    if (newSparePartVendor) {
      emit('addVendor', newSparePartVendor.data)
      vendorAdded(props.vendor.name)
      resetForm()
    }
  } catch (err) {
    console.error('Creation of Spare Part Vendor Failed', err)
  }
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
  gap: 0.6rem;
  overflow-y: auto;
  /* max-height: 500px; */
  /* height: 385px; */
}

.descriptions {
  margin: 10px;
}
</style>

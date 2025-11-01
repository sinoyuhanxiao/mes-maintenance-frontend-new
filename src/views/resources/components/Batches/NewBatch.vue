<template>
  <el-card>
    <div class="main-container-b">
      <div>
        <el-text>Part Name: {{ props.sparePart.name }}</el-text>
      </div>
      <el-form ref="formRef" :rules="rules">
        <el-form-item label="Batch Number:" prop="batch_number">
          <el-input v-model="form.batch_number"></el-input>
        </el-form-item>
        <el-form-item v-if="selectedLocation" label="Current Selection:" style="font-weight: bold">
          <el-text>{{ selectedLocation.name }}</el-text>
        </el-form-item>
        <el-form-item label="Location:" prop="location_id">
          <el-tree style="max-width: 600px" :data="locations" :props="defaultProps" @node-click="handleNodeClick" />
        </el-form-item>
      </el-form>
      <el-button @click="createBatch" type="primary">Create</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, defineEmits, reactive, watch } from 'vue'
import { getLocationTree, getLocationById } from '../../../../api/location'
import { createInventory } from '../../../../api/resources'

const props = defineProps({
  sparePart: Object,
})

const formRef = reactive(null)

const locations = ref([])

const emit = defineEmits(['newBatch'])

const selectedLocation = ref(null)

const form = reactive({
  location_id: null,
  unit_in_stock: 0,
  material_id: props.sparePart.id,
  inventory_type_id: 3,
  batch_number: null,
})

// Form rules
const rules = reactive({
  location_id: [{ required: true, message: 'Please select location', trigger: 'blur' }],
  batch_number: [{ required: true, message: 'Please enter batch number', trigger: 'blur' }],
})

async function getLocationData() {
  const response = await getLocationTree()

  locations.value = response.data
  console.log(locations.value)
}

getLocationData()

watch(
  () => form.location_id,
  async newVal => {
    const response = await getLocationById(newVal)
    selectedLocation.value = response.data
  }
)

const defaultProps = {
  children: 'children',
  label: 'name',
}

const handleNodeClick = data => {
  form.location_id = data.id
  console.log(form.location_id)
}

async function createBatch() {
  const response = await createInventory(form)

  emit('newBatch', response)
  resetForm()
}

const resetForm = () => {
  if (formRef) {
    formRef.resetFields()
  }
}
</script>

<style scoped>
.main-container-b {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
</style>

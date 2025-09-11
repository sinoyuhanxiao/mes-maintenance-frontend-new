<template>
  <el-card>
    <div class="main-container-b">
      <div>
        <el-text tag="b">Part Name: {{ props.sparePart.name }}</el-text>
      </div>
      <el-form ref="formRef" :rules="rules">
        <el-form-item label="Batch Number:" prop="batch_number">
          <el-input v-model="form.batch_number"></el-input>
        </el-form-item>
        <el-form-item label="Units in Stock:" prop="unit_in_stock">
          <el-input type="number" v-model="form.unit_in_stock" min="0"></el-input>
        </el-form-item>
        <el-form-item v-if="selectedLocation" label="Current Selection:" style="font-weight: bold">
          <el-text>{{ selectedLocation.name }}</el-text>
        </el-form-item>
        <el-form-item label="Location:" prop="location_id">
          <el-tree style="max-width: 600px" :data="locations" :props="defaultProps" @node-click="handleNodeClick" />
        </el-form-item>
      </el-form>
      <el-button @click="updateBatch" type="primary">Update</el-button>
    </div>
  </el-card>
  <!-- <el-text>{{ form }}</el-text> -->
</template>

<script setup>
import { ref, defineEmits, reactive, onMounted, watch } from 'vue'
import { getLocationById, getLocationTree } from '../../../../api/location'
import { updateInventory } from '../../../../api/resources'
import { ElMessage } from 'element-plus'

const props = defineProps( {
  sparePart : Object,
  data : Object
} )

const formRef = ref( null )

const locations = ref( [] )

const emit = defineEmits( ['updateBatch'] )

const selectedLocation = ref( null )

const form = reactive( {
  location_id : null,
  unit_in_stock : null,
  material_id : props.sparePart.id,
  inventory_type_id : 3,
  batch_number : null
} )

// Form rules
const rules = reactive( {
  location_id : [{ required : true, message : 'Please select location', trigger : 'blur' }],
  batch_number : [{ required : true, message : 'Please enter batch number', trigger : 'blur' }],
  unit_in_stock : [{ required : true, message : 'Please enter units in stock', trigger : 'blur' }]
} )

async function getLocationData() {
  const response = await getLocationTree()

  locations.value = response.data
  console.log( locations.value )
}

onMounted( async() => {
  await getLocationData() // wait until locations are loaded
  console.log( 'IN THE ON MOUNT' )

  form.batch_number = props.data.batch_number
  form.location_id = props.data.location_id
  form.unit_in_stock = props.data.unit_in_stock
} )

watch(
  () => props.data,
  async newVal => {
    form.batch_number = newVal.batch_number
    form.location_id = newVal.location_id
    form.unit_in_stock = newVal.unit_in_stock
  },
  { deep : true }
)

watch(
  () => form.location_id,
  async newVal => {
    if ( newVal ) {
      const response = await getLocationById( newVal )
      selectedLocation.value = response.data
    }
  }
)

const defaultProps = {
  children : 'children',
  label : 'name'
}

const handleNodeClick = data => {
  form.location_id = data.id
  console.log( form.location_id )
}

const failedUpdate = error => {
  ElMessage.error( error )
}

async function updateBatch() {
  try {
    const response = await updateInventory( props.data.id, form )
    console.log( response )

    emit( 'updateBatch', response )
    resetForm()
  } catch ( err ) {
    console.error( 'Error updating batch:', err.message )
    failedUpdate( err.message )
  }
}

const resetForm = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
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

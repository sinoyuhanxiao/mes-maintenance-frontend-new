<template>
  <div class="add-new-site">
    <div class="general-information">
      <el-form ref="formRef" :label-position="labelPosition" label-width="auto" :model="formData">
        <!-- Site Name -->
        <el-form-item
          label="Site Name"
          prop="name"
          :rules="[
            { required: true, message: 'Site name is required' },
            { type: 'string', message: 'Site name must be a string' },
          ]"
        >
          <el-input v-model="formData.name" />
        </el-form-item>

        <!-- Site Code -->
        <el-form-item label="Site Code" prop="code" :rules="[{ required: true, message: 'Site code is required' }]">
          <el-input v-model="formData.code" />
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading"> Confirm </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getEquipmentNodes, createNewNode } from '@/api/equipment.js'

const formRef = ref( null )
const labelPosition = ref( 'top' )
const filterText = ref( '' )
const selectedNodeId = ref( null )
const submitLoading = ref( false )

const sequenceOrders = ref( [] )

// Keep prop signature similar to other add components
const props = defineProps( {
  parentId : { type : [Number, String], default : null }, // parent (e.g. root or company id)
  productionLineId : { type : [Number, String], default : null },
  productionLineName : { type : String, default : '' },
  lockProductionLine : { type : Boolean, default : false }
} )

const emit = defineEmits( ['close', 'cancel', 'success'] )

const formData = reactive( {
  name : '',
  code : '',
  parentId : props.parentId,
  sequenceOrder : 1
} )

/* Keep parentId in sync when props change */
watch(
  () => props.parentId,
  ( newParentId, oldParentId ) => {
    if ( newParentId !== oldParentId && newParentId !== null ) {
      formData.parentId = newParentId
      resetFormData()
      fetchSiteMeta()
    }
  }
)

/* ====== Submit ====== */
const handleConfirm = async() => {
  if ( !formRef.value ) return

  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true

  try {
    const submissionData = {
      name : formData.name,
      code : formData.code,
      node_type_id : 2, // 🔹 Tier 0 (Site) – adjust if your backend uses a different ID
      parent_id : formData.parentId, // parent (e.g. root/company)
      sequence_order : Number( formData.sequenceOrder )
    }

    const response = await createNewNode( submissionData )
    ElMessage.success( 'Site created successfully!' )

    resetForm()
    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    ElMessage.error( `Failed to create site: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

function resetFormData() {
  if ( formRef.value ) formRef.value.resetFields()

  Object.assign( formData, {
    name : '',
    code : '',
    parentId : props.parentId,
    sequenceOrder : 1
  } )

  selectedNodeId.value = null
  filterText.value = ''
}

function resetForm() {
  resetFormData()
  fetchSiteMeta()
}

function handleCancel() {
  resetForm()
  emit( 'close' )
  emit( 'cancel' )
}

async function fetchSiteMeta() {
  if ( !props.parentId ) return

  try {
    // Fetch existing sites under this parent to compute next sequence_order
    const response = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [2], // 🔹 Site nodes
      parent_ids : [props.parentId]
    } )

    const content = response.data?.content || []
    const sequenceOrdersArray = content
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )

    sequenceOrders.value = sequenceOrdersArray
    const maxSequence = sequenceOrdersArray.length > 0 ? Math.max( ...sequenceOrdersArray ) : 0
    const nextSequence = maxSequence + 1
    const maxAllowed = sequenceOrdersArray.length + 1
    formData.sequenceOrder = Math.min( nextSequence, maxAllowed )
  } catch ( err ) {
    ElMessage.error( 'Failed to load site metadata' )
  }
}

onMounted( () => {
  if ( props.parentId ) fetchSiteMeta()
} )
</script>

<style scoped>
.add-new-site {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.general-information {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 16px;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #d9ecff !important;
}
</style>

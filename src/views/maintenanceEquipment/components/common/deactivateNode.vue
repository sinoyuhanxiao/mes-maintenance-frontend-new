<template>
  <div class="deactivate-container">
    <el-alert
      title="Delete Equipment Node"
      type="warning"
      :closable="false"
      show-icon
    >
      <el-text>Are you sure you want to delete this equipment node?</el-text>
      <br /><br />
      <el-text>
        <strong>Warning:</strong> This action cannot be undone. All associated data,
        sub-items, work orders, and tasks will be permanently removed.
      </el-text>
    </el-alert>

    <el-divider />

    <div v-if="nodeData">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Name">{{ nodeData.name || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="Code">{{ nodeData.code || 'N/A' }}</el-descriptions-item>
        <el-descriptions-item label="Children">{{ childrenCount }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider />

    <el-checkbox v-model="confirmDeletion" size="large">
      <el-text>I understand that this action is permanent and cannot be undone</el-text>
    </el-checkbox>

    <el-divider />

    <div class="button-group">
      <el-button @click="handleCancel" :disabled="submitting">
        Cancel
      </el-button>
      <el-button
        type="danger"
        @click="handleConfirm"
        :loading="submitting"
        :disabled="!confirmDeletion"
      >
        Delete Equipment Node
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deactivateEquipmentNode, getEquipmentById, getEquipmentSubtree } from '@/api/equipment.js'

const props = defineProps( {
  equipmentId : {
    type : [Number, String],
    required : true
  }
} )

const emit = defineEmits( ['close', 'success'] )

const confirmDeletion = ref( false )
const submitting = ref( false )
const nodeData = ref( null )
const childrenCount = ref( 0 )

// Fetch equipment data to show in confirmation
const fetchEquipmentData = async() => {
  if ( !props.equipmentId ) return

  try {
    const response = await getEquipmentById( props.equipmentId )
    nodeData.value = response.data
  } catch ( error ) {
    console.error( 'Error fetching equipment data:', error )
    ElMessage.error( 'Failed to load equipment details' )
  }
}

// Fetch children count
const fetchChildrenCount = async() => {
  if ( !props.equipmentId ) return

  try {
    const response = await getEquipmentSubtree( props.equipmentId )
    const children = response.data?.children || []
    childrenCount.value = children.length
  } catch ( error ) {
    console.error( 'Error fetching children count:', error )
    childrenCount.value = 0
  }
}

// Handle confirm deletion
const handleConfirm = async() => {
  if ( !confirmDeletion.value ) {
    ElMessage.warning( 'Please confirm that you understand this action is permanent' )
    return
  }

  try {
    // Double confirmation with message box
    await ElMessageBox.confirm(
      'This will permanently delete the equipment node and all associated data. Continue?',
      'Final Confirmation',
      {
        confirmButtonText : 'Delete',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--danger'
      }
    )

    submitting.value = true

    // Call the deactivate API with detailed logging
    console.log( 'Calling deactivateEquipmentNode with ID:', props.equipmentId )
    const response = await deactivateEquipmentNode( props.equipmentId )
    console.log( 'API response:', response )

    ElMessage.success( 'Equipment node deleted successfully!' )

    emit( 'success', props.equipmentId )
    emit( 'close' )
  } catch ( error ) {
    if ( error === 'cancel' ) {
      // User cancelled the confirmation dialog
      return
    }

    console.error( 'Full error object:', error )
    console.error( 'Error response:', error.response )
    console.error( 'Error message:', error.message )
    console.error( 'Error status:', error.response?.status )
    console.error( 'Error data:', error.response?.data )

    // More specific error message
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    ElMessage.error( `Failed to delete equipment node: ${errorMessage}` )
  } finally {
    submitting.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  emit( 'close' )
}

onMounted( () => {
  fetchEquipmentData()
  fetchChildrenCount()
} )

// Watch for equipmentId changes and refetch data
watch( () => props.equipmentId, ( newId, oldId ) => {
  if ( newId && newId !== oldId ) {
    // Reset data first
    nodeData.value = null
    childrenCount.value = 0
    confirmDeletion.value = false

    // Fetch new data
    fetchEquipmentData()
    fetchChildrenCount()
  }
}, { immediate : false } )
</script>

<style scoped>
.deactivate-container {
  padding: 20px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

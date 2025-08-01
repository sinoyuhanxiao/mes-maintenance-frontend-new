<template>
  <div class="add-new-t2">
    <div class="general-information">
      <el-form ref="formRef" :label-position="labelPosition" label-width="auto" :model="formData">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Equipment Group Name"
              prop="name"
              :rules="[
                { required: true, message: 'Equipment Group name is required'},
                { type: 'string', message: 'Equipment Group name must be a string'}
              ]"
            >
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Equipment Group Code"
              prop="code"
              :rules="[
                { required: true, message: 'Equipment Group code is required'},
              ]"
            >
              <el-input v-model="formData.code" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item
          label="Location"
          prop="selectedLocationId"
          :rules="[
            { required: true, message: 'Location is required'},
          ]"
        >
          <div class="tree-container">
            <el-input
              v-model="filterText"
              placeholder="Search locations"
              style="width: 100%; margin-bottom: 10px"
              clearable
            />
            <div v-if="loading" class="tree-loading">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              Loading locations...
            </div>
            <div v-else-if="error" class="tree-error">
              <el-alert :title="error" type="error" show-icon :closable="false" />
            </div>
            <el-tree
              v-else
              :data="treeData"
              :props="treeProps"
              node-key="id"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              :current-node-key="selectedNodeId"
              :highlight-current="true"
              ref="treeRef"
              @node-click="handleNodeClick"
              class="location-tree"
            >
            </el-tree>
          </div>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Production Line"
              prop="equipmentId"
              :rules="[
                { required: true, message: 'Production Line name is required'},
              ]"
            >
              <el-select
                v-model="formData.equipmentId"
                placeholder="Select production line"
                filterable
                clearable
                style="width: 100%"
                :loading="productionLineLoading"
              >
                <el-option v-for="line in productionLines" :key="line.id" :label="line.name" :value="line.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Sequence Order"
              prop="sequenceOrder"
              :rules="[
                { required: true, message: 'Sequence Order is required'},
                { type: 'number', message: 'Sequence Order must be a number', transform: (value) => Number(value) }
              ]"
            >
              <el-input-number v-model="formData.sequenceOrder" :min="1" :max="maxSequenceOrder" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="file-upload">
        <ImageUploadMultiple @update:imageList="handleImageListUpdate" @update:filesList="handleFilesListUpdate" />
      </div>
      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading">Confirm</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getLocationTree } from '@/api/location.js'
import { getEquipmentNodes, createNewNode } from '@/api/equipment.js'
import { uploadMultipleToMinio } from '@/api/minio.js'
import ImageUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'

const formRef = ref( null )
const labelPosition = ref( 'top' )
const treeData = ref( [] )
const loading = ref( false )
const error = ref( null )
const filterText = ref( '' )
const treeRef = ref( null )
const selectedNodeId = ref( null )
const submitLoading = ref( false )
const productionLines = ref( [] )
const productionLineLoading = ref( false )
const sequenceOrders = ref( [] )
const uploadedImages = ref( [] )
const uploadedFiles = ref( [] )

const props = defineProps( {
  parentId : {
    type : [Number, String],
    default : null
  }
} )

const emit = defineEmits( ['close', 'cancel', 'success'] )

const formData = reactive( {
  name : '',
  code : '',
  description : '',
  parent_id : props.parentId,
  selectedLocationId : null,
  equipmentId : null,
  sequenceOrder : 1,
  image_list : [],
  files_list : []
} )

const treeProps = {
  children : 'children',
  label : 'name'
}

const handleImageListUpdate = images => {
  uploadedImages.value = images
  formData.image_list = images
}

const handleFilesListUpdate = files => {
  uploadedFiles.value = files
  formData.files_list = files
}

const uploadFilesToServer = async() => {
  try {
    let uploadedImages = []
    let uploadedFiles = []

    if ( formData.image_list.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( formData.image_list )
      uploadedImages = imageRes.data.uploadedFiles || []
      formData.image_list = uploadedImages.map( file => file.url )
    }

    if ( formData.files_list.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( formData.files_list )
      uploadedFiles = fileRes.data.uploadedFiles || []
      formData.files_list = uploadedFiles.map( file => file.url )
    }

    return { uploadedImages, uploadedFiles }
  } catch ( err ) {
    throw new Error( 'File upload failed' )
  }
}

const handleConfirm = async() => {
  if ( !formRef.value ) return

  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true

  try {
    if ( formData.image_list.length > 0 || formData.files_list.length > 0 ) {
      await uploadFilesToServer()
    }

    const submissionData = {
      name : formData.name,
      code : formData.code,
      description : formData.description,
      node_type_id : 4,
      parent_id : formData.parent_id,
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : formData.image_list,
      files_list : formData.files_list
    }

    const response = await createNewNode( submissionData )
    ElMessage.success( 'Equipment group created successfully!' )

    resetForm()
    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    ElMessage.error( `Failed to create equipment group: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }

  Object.assign( formData, {
    name : '',
    code : '',
    description : '',
    parent_id : props.parentId,
    selectedLocationId : null,
    equipmentId : null,
    sequenceOrder : 1,
    image_list : [],
    files_list : []
  } )

  selectedNodeId.value = null
  uploadedImages.value = []
  uploadedFiles.value = []
  fetchProductionLines()
}

const handleCancel = () => {
  resetForm()
  emit( 'close' )
  emit( 'cancel' )
}

const fetchProductionLines = async() => {
  productionLineLoading.value = true
  try {
    // Fetch production lines for the dropdown
    const productionLinesResponse = await getEquipmentNodes( 1, 10, 'sequenceOrder', 'ASC', {
      node_type_ids : [3]
    } )

    console.log( '=== PRODUCTION LINES API RESPONSE ===' )
    console.log( 'Production lines response:', productionLinesResponse )

    const productionLinesContent = productionLinesResponse.data?.content || []
    console.log( 'Production lines for dropdown:', productionLinesContent )
    productionLines.value = productionLinesContent

    // Fetch equipment groups to calculate sequence order
    const equipmentGroupsResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [4],
      parent_ids : [props.parentId]
    } )

    console.log( '=== EQUIPMENT GROUPS API RESPONSE ===' )
    console.log( 'Equipment groups response:', equipmentGroupsResponse )

    const equipmentGroupsContent = equipmentGroupsResponse.data?.content || []
    console.log( 'Equipment groups for sequence calculation:', equipmentGroupsContent )

    const sequenceOrdersArray = equipmentGroupsContent
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )

    console.log( 'Raw sequence orders from equipment groups:', equipmentGroupsContent.map( item => item.sequence_order ) )
    console.log( 'Filtered valid sequence orders:', sequenceOrdersArray )

    sequenceOrders.value = sequenceOrdersArray

    const maxSequenceOrder = sequenceOrdersArray.length > 0 ? Math.max( ...sequenceOrdersArray ) : 0
    const nextSequenceOrder = maxSequenceOrder + 1
    const maxAllowedSequence = sequenceOrdersArray.length + 1

    console.log( 'Max sequence order found:', maxSequenceOrder )
    console.log( 'Next sequence order calculated:', nextSequenceOrder )
    console.log( 'Array size:', sequenceOrdersArray.length )
    console.log( 'Max allowed sequence order:', maxAllowedSequence )

    // Set sequence order, but cap it at the maximum allowed
    const finalSequenceOrder = nextSequenceOrder > maxAllowedSequence ? maxAllowedSequence : nextSequenceOrder

    console.log( 'Final sequence order (after max check):', finalSequenceOrder )
    console.log( '=== END DEBUG ===' )

    formData.sequenceOrder = finalSequenceOrder
  } catch ( err ) {
    console.error( 'Fetch error:', err )
    console.error( 'Error details:', {
      message : err.message,
      stack : err.stack,
      response : err.response
    } )
    ElMessage.error( 'Failed to load production lines' )
  } finally {
    productionLineLoading.value = false
  }
}

const maxSequenceOrder = computed( () => {
  const calculatedMax = sequenceOrders.value.length + 1
  return Math.max( calculatedMax, formData.sequenceOrder || 1 )
} )

const fetchLocationTree = async() => {
  loading.value = true
  error.value = null
  try {
    const response = await getLocationTree()

    let dataArray
    if ( response.data?.data ) {
      dataArray = response.data.data
    } else if ( Array.isArray( response.data ) ) {
      dataArray = response.data
    } else if ( response.data ) {
      dataArray = [response.data]
    } else {
      dataArray = []
    }

    treeData.value = dataArray
  } catch ( err ) {
    error.value = err.message || 'Failed to load location tree'
    ElMessage.error( 'Failed to load location tree' )
  } finally {
    loading.value = false
  }
}

watch( filterText, val => {
  treeRef.value?.filter( val )
} )

const filterNode = ( value, data ) => {
  if ( !value ) return true
  return data.name.toLowerCase().includes( value.toLowerCase() )
}

const handleNodeClick = ( data, node ) => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id
}

onMounted( () => {
  fetchLocationTree()
  fetchProductionLines()
} )
</script>

<style scoped>
.add-new-t2 {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.general-information {
  margin-top: 16px;
}

.tree-container {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  width: 100%;
  overflow-y: auto;
  background: #fafafa;
}

.tree-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  justify-content: center;
  color: var(--el-text-color-secondary);
}

.tree-error {
  padding: 8px;
}

.location-tree {
  width: 100%;
  background: #fafafa;
}

.file-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dialog-footer {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

:deep(.el-tree-node__content:hover) {
  background-color: #d9ecff;
}

:deep(.el-tree-node__content.is-current) {
  background-color: #d9ecff !important;
  font-weight: 500;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #d9ecff !important;
}
</style>

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
                { required: true, message: 'Equipment Group name is required' },
                { type: 'string', message: 'Equipment Group name must be a string' },
              ]"
            >
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Equipment Group Code"
              prop="code"
              :rules="[{ required: true, message: 'Equipment Group code is required' }]"
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
          :rules="[{ required: true, message: 'Location is required' }]"
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
              :rules="[{ required: true, message: 'Production Line name is required' }]"
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
                { required: true, message: 'Sequence Order is required' },
                { type: 'number', message: 'Sequence Order must be a number', transform: value => Number(value) },
              ]"
            >
              <el-input-number v-model="formData.sequenceOrder" :min="1" :max="maxSequenceOrder" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-divider />
      <div class="file-upload">
        <FileUploadMultiple
          @update:imageList="handleExplosionViewUpdate"
          image-label="Upload Exploded View"
          upload-type="images"
          :max-images="1"
        />
      </div>
      <el-divider />
      <div class="file-upload">
        <FileUploadMultiple
          @update:imageList="handleImageListUpdate"
          @update:filesList="handleFilesListUpdate"
          upload-type="both"
          :max-images="5"
          :max-files="5"
        />
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
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'

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
const uploadedExplosionView = ref( [] )

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
  parentId : props.parentId,
  selectedLocationId : null,
  equipmentId : null,
  sequenceOrder : 1,
  imageList : [],
  explodedViewDrawing : [],
  filesList : []
} )

watch(
  () => props.parentId,
  ( newParentId, oldParentId ) => {
    if ( newParentId !== oldParentId && newParentId !== null ) {
      formData.parentId = newParentId
      resetFormData()
      fetchProductionLines()
    }
  },
  { immediate : false }
)

const treeProps = {
  children : 'children',
  label : 'name'
}

const handleImageListUpdate = images => {
  uploadedImages.value = images
  formData.imageList = images
}

const handleExplosionViewUpdate = images => {
  uploadedExplosionView.value = images
  formData.explodedViewDrawing = images
}

const handleFilesListUpdate = files => {
  uploadedFiles.value = files
  formData.filesList = files
}

const uploadFilesToServer = async() => {
  try {
    let uploadedImages = []
    let uploadedExplosionView = []
    let uploadedFiles = []

    if ( formData.imageList.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( formData.imageList )
      uploadedImages = imageRes.data.uploadedFiles || []
      formData.imageList = uploadedImages.map( file => file.url )
    }

    if ( formData.explodedViewDrawing.length > 0 ) {
      const explosionRes = await uploadMultipleToMinio( formData.explodedViewDrawing )
      uploadedExplosionView = explosionRes.data.uploadedFiles || []
      formData.explodedViewDrawing = uploadedExplosionView.map( file => file.url )
    }

    if ( formData.filesList.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( formData.filesList )
      uploadedFiles = fileRes.data.uploadedFiles || []
      formData.filesList = uploadedFiles.map( file => file.url )
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
    if ( formData.imageList.length > 0 || formData.filesList.length > 0 ) {
      await uploadFilesToServer()
    }

    const submissionData = {
      name : formData.name,
      code : formData.code,
      description : formData.description,
      node_type_id : 4,
      parent_id : formData.parentId,
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : formData.imageList,
      exploded_view_drawing : formData.explodedViewDrawing,
      file_list : formData.filesList
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

const resetFormData = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }

  Object.assign( formData, {
    name : '',
    code : '',
    description : '',
    parentId : props.parentId,
    selectedLocationId : null,
    equipmentId : null,
    sequenceOrder : 1,
    imageList : [],
    explodedViewDrawing : [],
    filesList : []
  } )

  selectedNodeId.value = null
  uploadedImages.value = []
  uploadedExplosionView.value = []
  uploadedFiles.value = []
}

const resetForm = () => {
  resetFormData()
  fetchProductionLines()
}

const handleCancel = () => {
  resetForm()
  emit( 'close' )
  emit( 'cancel' )
}

const fetchProductionLines = async() => {
  if ( !props.parentId ) {
    return
  }

  productionLineLoading.value = true
  try {
    const productionLinesResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [3]
    } )

    const productionLinesContent = productionLinesResponse.data?.content || []
    productionLines.value = productionLinesContent

    const equipmentGroupsResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [4],
      parent_ids : [props.parentId]
    } )

    const equipmentGroupsContent = equipmentGroupsResponse.data?.content || []

    const sequenceOrdersArray = equipmentGroupsContent
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )

    sequenceOrders.value = sequenceOrdersArray

    const maxSequenceOrder = sequenceOrdersArray.length > 0 ? Math.max( ...sequenceOrdersArray ) : 0
    const nextSequenceOrder = maxSequenceOrder + 1
    const maxAllowedSequence = sequenceOrdersArray.length + 1

    const finalSequenceOrder = nextSequenceOrder > maxAllowedSequence ? maxAllowedSequence : nextSequenceOrder

    formData.sequenceOrder = finalSequenceOrder
  } catch ( err ) {
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
  if ( props.parentId ) {
    fetchProductionLines()
  }
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

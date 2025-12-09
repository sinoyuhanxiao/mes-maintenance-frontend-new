<template>
  <div class="edit-equipment-group">
    <div v-if="dataLoading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      Loading equipment data...
    </div>
    <div v-else class="general-information">
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
              @clear="onClearSearch"
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
              prop="parentId"
              :rules="[{ required: true, message: 'Production Line is required' }]"
            >
              <el-select
                v-model="formData.parentId"
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

      <!-- Exploded view (single image UI, but submit as array) -->
      <el-divider />
      <div class="file-upload">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item>
            <FileUploadMultiple
              upload-type="images"
              :max-images="1"
              :existingImageList="formData.explodedViewDrawing ? [formData.explodedViewDrawing] : []"
              @update:imageList="handleExplosionUpdate"
              @update:removedExistingImages="handleExplosionRemoved"
              :title-label-position="labelPosition"
              image-label="Upload Exploded View"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Regular images/files -->
      <div class="file-upload">
        <FileUploadMultiple
          @update:filesList="handleFileUpdate('filesList', $event)"
          @update:removedExistingFiles="handleFileUpdate('removeFile', $event)"
          upload-type="files"
          :max-files="5"
          :existingFileList="formData.filesList"
          :title-label-position="labelPosition"
        />
      </div>

      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading">Update</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getLocationTree } from '@/api/location.js'
import { getEquipmentNodes, editEquipmentNode, getEquipmentById } from '@/api/equipment.js'
import { uploadMultipleToMinio, deleteObjectList } from '@/api/minio.js'
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
const dataLoading = ref( false )
const newImages = ref( [] )
const newFiles = ref( [] )
const removedImages = ref( [] )
const removedFiles = ref( [] )
const newImageUrls = ref( [] )
const newFileUrls = ref( [] )

// Exploded view (single in UI)
const newExplosion = ref( [] ) // Files selected (max 1)
const removedExplosion = ref( [] ) // Removed existing URL(s)
const newExplosionUrl = ref( '' ) // Uploaded URL

const props = defineProps( {
  equipmentId : {
    type : [Number, String],
    required : true
  }
} )

const emit = defineEmits( ['close', 'cancel', 'success'] )

const formData = reactive( {
  name : '',
  code : '',
  description : '',
  parentId : null,
  selectedLocationId : null,
  sequenceOrder : 1,
  imageList : [],
  filesList : [],
  explodedViewDrawing : '' // single string locally
} )

const treeProps = {
  children : 'children',
  label : 'name'
}

const resetFileState = () => {
  newImages.value = []
  newFiles.value = []
  removedImages.value = []
  removedFiles.value = []
  newImageUrls.value = []
  newFileUrls.value = []

  newExplosion.value = []
  removedExplosion.value = []
  newExplosionUrl.value = ''
}

/* ====== Search input helpers ====== */
const onClearSearch = () => {
  // Only clear search text; keep the current selection
}

/* ====== Tree helpers (leaf-only label mirroring) ====== */
const setCurrentTreeNode = async locationId => {
  if ( !treeRef.value || !locationId ) return
  try {
    await nextTick()
    if ( treeData.value.length === 0 ) return
    const idNum = Number( locationId )
    treeRef.value.setCurrentKey( idNum )
    const node = treeRef.value.getNode( idNum )
    if ( !node ) return
    let parentNode = node.parent
    while ( parentNode && parentNode.key !== undefined ) {
      parentNode.expanded = true
      parentNode = parentNode.parent
    }
    formData.selectedLocationId = idNum
    selectedNodeId.value = idNum

    // leaf-only in the search bar
    filterText.value = node.label || ''

    if ( formRef.value ) {
      await nextTick()
      formRef.value.clearValidate( 'selectedLocationId' )
    }
  } catch {}
}

const fetchEquipmentData = async() => {
  if ( !props.equipmentId ) return
  dataLoading.value = true
  try {
    const response = await getEquipmentById( props.equipmentId )
    const equipment = response.data
    const actualData = equipment.data || equipment

    resetFileState()

    formData.name = actualData.name || ''
    formData.code = actualData.code || ''
    formData.description = actualData.description || ''
    formData.parentId = actualData.parent_id || actualData.parent_equipment_node_id
    formData.selectedLocationId = actualData.location_id
    formData.sequenceOrder = actualData.sequence_order || 1
    formData.imageList = actualData.image_list || []
    formData.filesList = actualData.file_list || []

    // Normalize exploded view (string or array) -> single string locally
    {
      const ev = actualData.exploded_view_drawing
      formData.explodedViewDrawing = Array.isArray( ev ) ? ev[0] || '' : ev || ''
    }

    selectedNodeId.value = actualData.location?.id || actualData.location_id

    // If tree is already loaded, reflect leaf name immediately
    if ( treeData.value.length > 0 && selectedNodeId.value ) {
      const n = treeRef.value?.getNode?.( Number( selectedNodeId.value ) )
      filterText.value = n?.label || ''
    }

    return actualData
  } catch ( err ) {
    ElMessage.error( 'Failed to load equipment details' )
    throw err
  } finally {
    dataLoading.value = false
  }
}

const fetchLocationTree = async() => {
  loading.value = true
  error.value = null
  try {
    const response = await getLocationTree()
    let dataArray
    if ( response.data?.data ) dataArray = response.data.data
    else if ( Array.isArray( response.data ) ) dataArray = response.data
    else if ( response.data ) dataArray = [response.data]
    else dataArray = []
    treeData.value = dataArray
    return dataArray
  } catch ( err ) {
    error.value = err.message || 'Failed to load location tree'
    ElMessage.error( 'Failed to load location tree' )
    throw err
  } finally {
    loading.value = false
  }
}

const initializeTreeSelection = async equipmentData => {
  if ( !equipmentData ) return
  const locationId = equipmentData.location?.id || equipmentData.location_id
  if ( !locationId ) return
  await nextTick()
  if ( treeRef.value && treeData.value.length > 0 ) {
    await setCurrentTreeNode( locationId ) // also mirrors leaf label into filterText
  }
}

function handleExplosionUpdate( files ) {
  newExplosion.value = files || []
}
function handleExplosionRemoved( urls ) {
  removedExplosion.value = urls || []
}

const handleFileUpdate = ( type, data ) => {
  switch ( type ) {
    case 'imageList':
      newImages.value = data
      break
    case 'filesList':
      newFiles.value = data
      break
    case 'removeImage':
      removedImages.value = data
      break
    case 'removeFile':
      removedFiles.value = data
      break
    default:
      break
  }
}

const uploadFilesToServer = async() => {
  try {
    if ( newImages.value.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( newImages.value )
      newImageUrls.value = imageRes.data.uploadedFiles?.map( file => file.url ) || []
    }
    if ( newFiles.value.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( newFiles.value )
      newFileUrls.value = fileRes.data.uploadedFiles?.map( file => file.url ) || []
    }
    // exploded single
    if ( newExplosion.value.length > 0 ) {
      const expRes = await uploadMultipleToMinio( newExplosion.value )
      const up = expRes?.data?.uploadedFiles || []
      newExplosionUrl.value = up[0]?.url || ''
    }
  } catch {
    throw new Error( 'File upload failed' )
  }
}

const handleConfirm = async() => {
  if ( !formRef.value ) return
  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true
  try {
    let finalImageList = formData.imageList || []
    let finalFilesList = formData.filesList || []
    let finalExploded = formData.explodedViewDrawing || ''

    if ( newImages.value.length > 0 || newFiles.value.length > 0 || newExplosion.value.length > 0 ) {
      await uploadFilesToServer()
    }

    finalImageList = [...( finalImageList || [] ), ...( newImageUrls.value || [] )]
    finalFilesList = [...( finalFilesList || [] ), ...( newFileUrls.value || [] )]

    finalImageList = finalImageList.filter( url => !removedImages.value.includes( url ) )
    finalFilesList = finalFilesList.filter( url => !removedFiles.value.includes( url ) )

    // exploded: remove or replace
    if ( removedExplosion.value?.length && finalExploded && removedExplosion.value.includes( finalExploded ) ) {
      finalExploded = ''
    }
    if ( newExplosionUrl.value ) {
      finalExploded = newExplosionUrl.value
    }

    const submissionData = {
      name : formData.name,
      code : formData.code,
      description : formData.description,
      node_type_id : 4,
      parent_id : formData.parentId,
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : finalImageList,
      file_list : finalFilesList,
      // Backend expects List<String>
      exploded_view_drawing : finalExploded ? [finalExploded] : []
    }

    const response = await editEquipmentNode( props.equipmentId, submissionData )
    ElMessage.success( 'Equipment group updated successfully!' )

    if ( removedImages.value.length > 0 || removedFiles.value.length > 0 || removedExplosion.value.length > 0 ) {
      const removedUrls = [...removedImages.value, ...removedFiles.value, ...removedExplosion.value]
      Promise.resolve().then( async() => {
        try {
          const deleteResponse = await deleteObjectList( {
            bucketName : 'sv-file-bucket',
            objectUrls : removedUrls
          } )
          if ( deleteResponse.status === 0 ) {
            ElMessage.success( 'Old files deleted successfully!' )
          }
        } catch {}
      } )
    }

    resetFileState()
    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    ElMessage.error( `Failed to update equipment group: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  resetFileState()
  emit( 'close' )
  emit( 'cancel' )
}

const fetchProductionLines = async() => {
  if ( !formData.parentId ) return
  productionLineLoading.value = true
  try {
    const productionLinesResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [3]
    } )
    const productionLinesContent = productionLinesResponse.data?.content || []
    productionLines.value = productionLinesContent

    const equipmentGroupsResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [4],
      parent_ids : [formData.parentId]
    } )
    const equipmentGroupsContent = equipmentGroupsResponse.data?.content || []
    const otherEquipmentGroups = equipmentGroupsContent.filter( item => item.id !== parseInt( props.equipmentId ) )
    const sequenceOrdersArray = otherEquipmentGroups
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )
    sequenceOrders.value = sequenceOrdersArray
  } catch {
    ElMessage.error( 'Failed to load production lines' )
  } finally {
    productionLineLoading.value = false
  }
}

const maxSequenceOrder = computed( () => {
  const calculatedMax = sequenceOrders.value.length + 1
  return Math.max( calculatedMax, formData.sequenceOrder || 1 )
} )

watch( filterText, val => {
  treeRef.value?.filter( val )
} )

const filterNode = ( value, data ) => {
  if ( !value ) return true
  return data.name.toLowerCase().includes( value.toLowerCase() )
}

const handleNodeClick = async( data, node ) => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id

  // leaf-only display
  filterText.value = data.name || ''

  await nextTick()
  if ( formRef.value ) {
    formRef.value.validateField( 'selectedLocationId' )
  }
}

watch(
  () => formData.parentId,
  ( newParentId, oldParentId ) => {
    if ( newParentId && newParentId !== oldParentId ) {
      fetchProductionLines()
    }
  },
  { immediate : false }
)

watch( treeData, async newTreeData => {
  if ( newTreeData.length > 0 && selectedNodeId.value ) {
    await nextTick()
    await setCurrentTreeNode( selectedNodeId.value ) // also mirrors into filterText
  }
} )

watch(
  () => formData.selectedLocationId,
  async( newLocationId, oldLocationId ) => {
    if ( newLocationId && newLocationId !== oldLocationId ) {
      selectedNodeId.value = newLocationId
      if ( treeData.value.length > 0 ) {
        await nextTick()
        await setCurrentTreeNode( newLocationId ) // also mirrors into filterText
      }
    }
  }
)

onMounted( async() => {
  try {
    resetFileState()
    const [equipmentData] = await Promise.all( [fetchEquipmentData(), fetchLocationTree()] )
    if ( equipmentData ) {
      await initializeTreeSelection( equipmentData )
      if ( equipmentData.parent_id || equipmentData.parent_equipment_node_id ) {
        await fetchProductionLines()
      }
    }
  } catch {}
} )

watch(
  () => props.equipmentId,
  ( newId, oldId ) => {
    if ( newId && newId !== oldId ) {
      resetFileState()
      Object.assign( formData, {
        name : '',
        code : '',
        description : '',
        parentId : null,
        selectedLocationId : null,
        sequenceOrder : 1,
        imageList : [],
        filesList : [],
        explodedViewDrawing : ''
      } )
      selectedNodeId.value = null
      fetchEquipmentData()
    }
  },
  { immediate : false }
)
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 40px;
  justify-content: center;
  color: var(--el-text-color-secondary);
}

.edit-equipment-group {
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
  width: 100%;
}

.dialog-footer {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 10px;
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

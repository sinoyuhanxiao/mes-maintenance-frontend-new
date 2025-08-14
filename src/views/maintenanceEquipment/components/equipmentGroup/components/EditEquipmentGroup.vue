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
      <el-divider />
      <div class="file-upload">
        <FileUploadMultiple
          @update:imageList="handleFileUpdate('imageList', $event)"
          @update:filesList="handleFileUpdate('filesList', $event)"
          @remove-existing-image="handleFileUpdate('removeImage', $event)"
          @remove-existing-file="handleFileUpdate('removeFile', $event)"
          upload-type="both"
          :max-images="5"
          :max-files="5"
          :existingImageList="formData.imageList"
          :existingFileList="formData.filesList"
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
const newImages = ref( [] ) // File Objects
const newFiles = ref( [] ) // File Objects
const removedImages = ref( [] ) // URLs
const removedFiles = ref( [] ) // URLs
const newImageUrls = ref( [] ) // URLs
const newFileUrls = ref( [] ) // URLs

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
  filesList : []
} )

const treeProps = {
  children : 'children',
  label : 'name'
}

// Add this function to reset all file-related state
const resetFileState = () => {
  newImages.value = []
  newFiles.value = []
  removedImages.value = []
  removedFiles.value = []
  newImageUrls.value = []
  newFileUrls.value = []
}

const setCurrentTreeNode = async locationId => {
  if ( !treeRef.value || !locationId ) {
    return
  }

  try {
    await nextTick()

    // Ensure tree is fully rendered and has data
    if ( treeData.value.length === 0 ) {
      console.warn( 'Tree data not loaded yet' )
      return
    }

    // Set the current node
    treeRef.value.setCurrentKey( locationId )

    // Double-check if the node exists in the tree
    const node = treeRef.value.getNode( locationId )
    if ( !node ) {
      console.warn( `Node with id ${locationId} not found in tree` )
      return
    }

    // Expand parent nodes to make the selected node visible
    let parentNode = node.parent
    while ( parentNode && parentNode.key !== undefined ) {
      parentNode.expanded = true
      parentNode = parentNode.parent
    }

    // Ensure the form data is in sync
    formData.selectedLocationId = locationId

    // Clear any validation errors for the location field
    if ( formRef.value ) {
      await nextTick()
      formRef.value.clearValidate( 'selectedLocationId' )
    }

    console.log( `Successfully set tree node to: ${locationId}` )
  } catch ( error ) {
    console.error( 'Error setting current tree node:', error )
  }
}

// Updated fetchEquipmentData with proper reset
const fetchEquipmentData = async() => {
  if ( !props.equipmentId ) return

  dataLoading.value = true
  try {
    const response = await getEquipmentById( props.equipmentId )
    const equipment = response.data
    const actualData = equipment.data || equipment

    // Reset file state first to prevent duplication
    resetFileState()

    // Populate form with existing data
    formData.name = actualData.name || ''
    formData.code = actualData.code || ''
    formData.description = actualData.description || ''
    formData.parentId = actualData.parent_id || actualData.parent_equipment_node_id
    formData.selectedLocationId = actualData.location_id
    formData.sequenceOrder = actualData.sequence_order || 1
    formData.imageList = actualData.image_list || []
    formData.filesList = actualData.file_list || []

    // Store the location info for later tree initialization
    selectedNodeId.value = actualData.location?.id || actualData.location_id

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

  // Wait for tree to be fully rendered
  await nextTick()

  // Set the tree node - the watchers will handle retries if needed
  if ( treeRef.value && treeData.value.length > 0 ) {
    await setCurrentTreeNode( locationId )
  }
}

const handleFileUpdate = ( type, data ) => {
  switch ( type ) {
    case 'imageList':
      newImages.value = data
      console.log( 'New images:', newImages.value ) // Debugging log
      break

    case 'filesList':
      newFiles.value = data
      console.log( 'New files:', newFiles.value ) // Debugging log
      break

    case 'removeImage':
      removedImages.value = data
      console.log( 'Removed images:', removedImages.value ) // Debugging log
      break

    case 'removeFile':
      removedFiles.value = data
      console.log( 'Removed files:', removedFiles.value ) // Debugging log
      break

    default:
      break
  }
}

const uploadFilesToServer = async() => {
  try {
    // Upload new images if any
    if ( newImages.value.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( newImages.value )
      newImageUrls.value = imageRes.data.uploadedFiles?.map( file => file.url ) || []
    }

    // Upload new files if any
    if ( newFiles.value.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( newFiles.value )
      newFileUrls.value = fileRes.data.uploadedFiles?.map( file => file.url ) || []
    }
  } catch ( err ) {
    throw new Error( 'File upload failed' )
  }
}

// Updated handleConfirm with proper state cleanup
const handleConfirm = async() => {
  if ( !formRef.value ) return

  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true

  try {
    let finalImageList = formData.imageList || []
    let finalFilesList = formData.filesList || []

    // Upload new files if there are any
    if ( newImages.value.length > 0 || newFiles.value.length > 0 ) {
      await uploadFilesToServer()
    }

    // Combine existing files with newly uploaded ones
    finalImageList = [...( finalImageList || [] ), ...( newImageUrls.value || [] )]
    finalFilesList = [...( finalFilesList || [] ), ...( newFileUrls.value || [] )]

    // Filter out removed items
    finalImageList = finalImageList.filter( imageUrl => !removedImages.value.includes( imageUrl ) )

    finalFilesList = finalFilesList.filter( fileUrl => !removedFiles.value.includes( fileUrl ) )

    const submissionData = {
      name : formData.name,
      code : formData.code,
      description : formData.description,
      node_type_id : 4,
      parent_id : formData.parentId,
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : finalImageList,
      file_list : finalFilesList
    }

    const response = await editEquipmentNode( props.equipmentId, submissionData )
    ElMessage.success( 'Equipment group updated successfully!' )

    console.log( 'images removed', removedImages.value )
    console.log( 'files removed', removedFiles.value )
    if ( removedImages.value.length > 0 || removedFiles.value.length > 0 ) {
      const removedUrls = [...removedImages.value, ...removedFiles.value]
      console.log( 'removedUrls:', removedUrls ) // This will have a value
      try {
        const deleteResponse = await deleteObjectList( {
          bucketName : 'sv-file-bucket',
          objectUrls : removedUrls
        } )

        console.log( 'delete response:', deleteResponse ) // This will have a value
        ElMessage.success( 'Old files deleted successfully!' )
      } catch ( error ) {
        // 🎯 THIS contains your API response structure
        console.log( 'Server response:', error.response.data )

        // Your API schema:
        console.log( 'Timestamp:', error.response.data.timestamp )
        console.log( 'API Status:', error.response.data.status ) // 0 = success, >0 = error
        console.log( 'Message:', error.response.data.message )
        console.log( 'Data:', error.response.data.data )
      }
    }

    // Reset file state after successful submission
    resetFileState()

    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    console.error( 'Error in handleConfirm:', error )
    ElMessage.error( `Failed to update equipment group: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

// Updated handleCancel with state reset
const handleCancel = () => {
  // Reset file state when canceling
  resetFileState()

  emit( 'close' )
  emit( 'cancel' )
}

const fetchProductionLines = async() => {
  if ( !formData.parentId ) {
    return
  }

  productionLineLoading.value = true
  try {
    // Fetch production lines for the dropdown
    const productionLinesResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [3]
    } )

    const productionLinesContent = productionLinesResponse.data?.content || []
    productionLines.value = productionLinesContent

    // Fetch equipment groups to calculate sequence order (excluding current item)
    const equipmentGroupsResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [4],
      parent_ids : [formData.parentId]
    } )

    const equipmentGroupsContent = equipmentGroupsResponse.data?.content || []

    // Filter out current equipment being edited
    const otherEquipmentGroups = equipmentGroupsContent.filter( item => item.id !== parseInt( props.equipmentId ) )

    const sequenceOrdersArray = otherEquipmentGroups
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )

    sequenceOrders.value = sequenceOrdersArray
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

watch( filterText, val => {
  treeRef.value?.filter( val )
} )

const filterNode = ( value, data ) => {
  if ( !value ) return true
  return data.name.toLowerCase().includes( value.toLowerCase() )
}

// Enhanced handleNodeClick with proper validation
const handleNodeClick = async( data, node ) => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id

  // Wait for next tick to ensure reactive updates are processed
  await nextTick()

  // Trigger validation for the location field
  if ( formRef.value ) {
    formRef.value.validateField( 'selectedLocationId' )
  }
}

// Watch for parentId changes and refresh production lines
watch(
  () => formData.parentId,
  ( newParentId, oldParentId ) => {
    if ( newParentId && newParentId !== oldParentId ) {
      fetchProductionLines()
    }
  },
  { immediate : false }
)

// Add a watcher to handle tree initialization when tree data loads
watch( treeData, async newTreeData => {
  if ( newTreeData.length > 0 && selectedNodeId.value ) {
    await nextTick()
    await setCurrentTreeNode( selectedNodeId.value )
  }
} )

// Enhanced watcher for selectedLocationId
watch(
  () => formData.selectedLocationId,
  async( newLocationId, oldLocationId ) => {
    if ( newLocationId && newLocationId !== oldLocationId ) {
      selectedNodeId.value = newLocationId

      // Only try to update tree if it's loaded
      if ( treeData.value.length > 0 ) {
        await nextTick()
        await setCurrentTreeNode( newLocationId )
      }
    }
  }
)

// Updated onMounted function
onMounted( async() => {
  try {
    // Reset file state when component mounts
    resetFileState()

    // Load equipment data and tree data in parallel
    const [equipmentData] = await Promise.all( [fetchEquipmentData(), fetchLocationTree()] )

    // Initialize tree selection after both are loaded
    if ( equipmentData ) {
      await initializeTreeSelection( equipmentData )

      // Fetch production lines if we have a parent ID
      if ( equipmentData.parent_id || equipmentData.parent_equipment_node_id ) {
        await fetchProductionLines()
      }
    }
  } catch ( error ) {
    console.error( 'Error during component initialization:', error )
  }
} )

// Updated equipmentId watcher with proper reset
watch(
  () => props.equipmentId,
  ( newId, oldId ) => {
    if ( newId && newId !== oldId ) {
      // Reset ALL state when equipmentId changes
      resetFileState()

      // Reset form first
      Object.assign( formData, {
        name : '',
        code : '',
        description : '',
        parentId : null,
        selectedLocationId : null,
        sequenceOrder : 1,
        imageList : [],
        filesList : []
      } )
      selectedNodeId.value = null

      // Fetch new data
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

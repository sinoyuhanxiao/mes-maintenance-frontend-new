<template>
  <div class="edit-equipment">
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
              label="Equipment Name"
              prop="name"
              :rules="[
                { required: true, message: 'Equipment name is required' },
                { type: 'string', message: 'Equipment name must be a string' },
              ]"
            >
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Equipment Code"
              prop="code"
              :rules="[{ required: true, message: 'Equipment code is required' }]"
            >
              <el-input v-model="formData.code" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Model" prop="serialNumber">
              <el-input v-model="formData.serialNumber" placeholder="Enter equipment model" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PLC" prop="plc">
              <el-input v-model="formData.plc" placeholder="Enter PLC information" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Power"
              prop="power"
              :rules="[
                { type: 'number', message: 'Power must be a number', transform: value => Number(value) },
                { validator: validatePowerInteger, trigger: 'blur' },
              ]"
            >
              <el-input-number
                v-model="formData.power"
                placeholder="Enter power specifications"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Install Date" prop="installationDate">
              <el-date-picker
                v-model="formData.installationDate"
                type="date"
                placeholder="Select installation date"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
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
          @update:removedExistingImages="handleFileUpdate('removeImage', $event)"
          @update:removedExistingFiles="handleFileUpdate('removeFile', $event)"
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
const newImages = ref( [] )
const newFiles = ref( [] )
const removedImages = ref( [] )
const removedFiles = ref( [] )
const newImageUrls = ref( [] )
const newFileUrls = ref( [] )

const props = defineProps( {
  equipmentId : {
    type : [Number, String],
    required : true
  }
} )

const emit = defineEmits( ['close', 'cancel', 'success'] )

const validatePowerInteger = ( rule, value, callback ) => {
  if ( value !== null && value !== undefined && value !== '' ) {
    if ( !Number.isInteger( value ) || value < 0 ) {
      callback( new Error( 'Power must be a positive integer' ) )
    } else {
      callback()
    }
  } else {
    callback()
  }
}

const formData = reactive( {
  name : '',
  code : '',
  description : '',
  serialNumber : '',
  plc : '',
  power : null,
  installationDate : null,
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

    if ( treeData.value.length === 0 ) {
      return
    }

    treeRef.value.setCurrentKey( locationId )

    const node = treeRef.value.getNode( locationId )
    if ( !node ) {
      return
    }

    let parentNode = node.parent
    while ( parentNode && parentNode.key !== undefined ) {
      parentNode.expanded = true
      parentNode = parentNode.parent
    }

    formData.selectedLocationId = locationId

    if ( formRef.value ) {
      await nextTick()
      formRef.value.clearValidate( 'selectedLocationId' )
    }
  } catch ( error ) {
    // Silent error handling
  }
}

const formatDateForDisplay = dateString => {
  if ( !dateString ) return null

  try {
    // Handle ISO datetime string (e.g., "2025-08-03T00:00:00Z")
    const date = new Date( dateString )

    // Check if date is valid
    if ( isNaN( date.getTime() ) ) return null

    // Format as YYYY-MM-DD for the date picker
    return date.toISOString().split( 'T' )[0]
  } catch ( error ) {
    return null
  }
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
    formData.serialNumber = actualData.serial_number || ''
    formData.plc = actualData.plc || ''
    formData.power = actualData.power || null
    formData.installationDate = formatDateForDisplay( actualData.installation_date )
    formData.parentId = actualData.parent_id || actualData.parent_equipment_node_id
    formData.selectedLocationId = actualData.location_id
    formData.sequenceOrder = actualData.sequence_order || 1
    formData.imageList = actualData.image_list || []
    formData.filesList = actualData.file_list || []

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

  await nextTick()

  if ( treeRef.value && treeData.value.length > 0 ) {
    await setCurrentTreeNode( locationId )
  }
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
    let finalImageList = formData.imageList || []
    let finalFilesList = formData.filesList || []

    if ( newImages.value.length > 0 || newFiles.value.length > 0 ) {
      await uploadFilesToServer()
    }

    finalImageList = [...( finalImageList || [] ), ...( newImageUrls.value || [] )]
    finalFilesList = [...( finalFilesList || [] ), ...( newFileUrls.value || [] )]

    finalImageList = finalImageList.filter( imageUrl => !removedImages.value.includes( imageUrl ) )
    finalFilesList = finalFilesList.filter( fileUrl => !removedFiles.value.includes( fileUrl ) )

    const submissionData = {
      name : formData.name,
      code : formData.code,
      description : formData.description,
      serial_number : formData.serialNumber,
      plc : formData.plc,
      power : formData.power,
      installation_date : formData.installationDate ? `${formData.installationDate}T00:00:00Z` : null,
      parent_id : formData.parentId,
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : finalImageList,
      file_list : finalFilesList
    }

    const response = await editEquipmentNode( props.equipmentId, submissionData )
    ElMessage.success( 'Equipment updated successfully!' )

    if ( removedImages.value.length > 0 || removedFiles.value.length > 0 ) {
      const removedUrls = [...removedImages.value, ...removedFiles.value]

      Promise.resolve().then( async() => {
        try {
          const deleteResponse = await deleteObjectList( {
            bucketName : 'sv-file-bucket',
            objectUrls : removedUrls
          } )

          if ( deleteResponse.status === 0 ) {
            ElMessage.success( 'Old files deleted successfully!' )
          }
        } catch ( error ) {
          // Silent fail
        }
      } )
    }

    resetFileState()

    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    ElMessage.error( `Failed to update equipment: ${error.message}` )
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
  if ( !formData.parentId ) {
    return
  }

  productionLineLoading.value = true
  try {
    const productionLinesResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [4]
    } )

    const productionLinesContent = productionLinesResponse.data?.content || []
    productionLines.value = productionLinesContent

    const equipmentResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [5],
      parent_ids : [formData.parentId]
    } )

    const equipmentContent = equipmentResponse.data?.content || []

    const otherEquipment = equipmentContent.filter( item => item.id !== parseInt( props.equipmentId ) )

    const sequenceOrdersArray = otherEquipment
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

const handleNodeClick = async( data, node ) => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id

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
    await setCurrentTreeNode( selectedNodeId.value )
  }
} )

watch(
  () => formData.selectedLocationId,
  async( newLocationId, oldLocationId ) => {
    if ( newLocationId && newLocationId !== oldLocationId ) {
      selectedNodeId.value = newLocationId

      if ( treeData.value.length > 0 ) {
        await nextTick()
        await setCurrentTreeNode( newLocationId )
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
  } catch ( error ) {
    // Silent error handling
  }
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
        serialNumber : '',
        plc : '',
        power : null,
        installationDate : null,
        parentId : null,
        selectedLocationId : null,
        sequenceOrder : 1,
        imageList : [],
        filesList : []
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

.edit-equipment {
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

<template>
  <div class="edit-sub-equipment">
    <div v-if="dataLoading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      Loading sub equipment data...
    </div>

    <div v-else class="general-information">
      <el-form
        ref="formRef"
        :label-position="labelPosition"
        label-width="auto"
        :model="formData"
        :validate-on-rule-change="false"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Sub Equipment Name"
              prop="name"
              :rules="[
                { required: true, message: 'Sub Equipment name is required' },
                { type: 'string', message: 'Sub Equipment name must be a string' },
              ]"
            >
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="Sub Equipment Code"
              prop="code"
              :rules="[{ required: true, message: 'Sub Equipment code is required' }]"
            >
              <el-input v-model="formData.code" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Model" prop="model">
          <el-input v-model="formData.model" placeholder="Enter sub equipment model" />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>

        <!-- Location -->
        <el-form-item
          label="Location"
          prop="selectedLocationId"
          :rules="[{ validator: validateLocation, trigger: ['change', 'blur'] }]"
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
              :current-node-key="Number(selectedNodeId)"
              :highlight-current="true"
              ref="treeRef"
              @node-click="handleNodeClick"
              class="location-tree"
            />
          </div>

          <!-- Hidden input ensures Element Plus sees a real v-model control under this form-item -->
          <el-input v-model="formData.selectedLocationId" type="text" style="display: none" @change="() => {}" />
        </el-form-item>

        <el-form-item
          label="Sequence Order"
          prop="sequenceOrder"
          :rules="[
            { required: true, message: 'Sequence Order is required' },
            { validator: validateSequence, trigger: ['change', 'blur'] },
          ]"
        >
          <el-input-number v-model="formData.sequenceOrder" :min="1" :max="maxSequenceOrder" style="width: 100%" />
        </el-form-item>
      </el-form>

      <!-- Exploded view (single image) -->
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
              image-label="Upload Exploded View"
              title-label-position="top"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Regular images/files -->
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
const sequenceOrders = ref( [] )
const dataLoading = ref( false )
const newImages = ref( [] )
const newFiles = ref( [] )
const removedImages = ref( [] )
const removedFiles = ref( [] )
const newImageUrls = ref( [] )
const newFileUrls = ref( [] )

const dataReady = ref( false ) // ensure tree + data resolved before we rely on selection

// exploded view
const newExplosion = ref( [] )
const removedExplosion = ref( [] )
const newExplosionUrl = ref( '' )

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
  model : '',
  description : '',
  parentId : null,
  selectedLocationId : null,
  sequenceOrder : 1,
  imageList : [],
  filesList : [],
  explodedViewDrawing : ''
} )

const treeProps = {
  children : 'children',
  label : 'name'
}

/** ---------------- Validators ---------------- */
const validateLocation = ( _rule, value, callback ) => {
  const num = Number( value )
  if ( value === null || value === undefined || value === '' || Number.isNaN( num ) ) {
    callback( new Error( 'Location is required' ) )
  } else {
    callback()
  }
}

const validateSequence = ( _rule, value, callback ) => {
  const num = Number( value )
  if ( Number.isNaN( num ) || num < 1 ) callback( new Error( 'Sequence Order must be a positive number' ) )
  else callback()
}

/** ---------------- Helpers ---------------- */
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

const setCurrentTreeNode = async locationId => {
  if ( !treeRef.value || locationId == null ) return
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
    // synchronize the form model
    formData.selectedLocationId = idNum
    selectedNodeId.value = idNum
    await nextTick()
    formRef.value?.clearValidate( 'selectedLocationId' )
  } catch {}
}

/** ---------------- Data fetch ---------------- */
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
    formData.model = actualData.model || actualData.serial_number || ''
    formData.description = actualData.description || ''

    formData.parentId = actualData.parent_id ?? actualData.parent_equipment_node_id ?? null
    formData.parentId = formData.parentId != null ? Number( formData.parentId ) : null

    // set both right away
    const locId = actualData.location?.id ?? actualData.location_id ?? null
    formData.selectedLocationId = locId != null ? Number( locId ) : null
    selectedNodeId.value = locId != null ? Number( locId ) : null

    formData.sequenceOrder = actualData.sequence_order != null ? Number( actualData.sequence_order ) : 1

    formData.imageList = actualData.image_list || []
    formData.filesList = actualData.file_list || []

    const ev = actualData.exploded_view_drawing
    formData.explodedViewDrawing = Array.isArray( ev ) ? ev[0] || '' : ev || ''

    return actualData
  } catch ( err ) {
    ElMessage.error( 'Failed to load sub equipment details' )
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

/** ---------------- File handlers ---------------- */
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
      newImageUrls.value = imageRes.data.uploadedFiles?.map( f => f.url ) || []
    }
    if ( newFiles.value.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( newFiles.value )
      newFileUrls.value = fileRes.data.uploadedFiles?.map( f => f.url ) || []
    }
    if ( newExplosion.value.length > 0 ) {
      const expRes = await uploadMultipleToMinio( newExplosion.value )
      const up = expRes?.data?.uploadedFiles || []
      newExplosionUrl.value = up[0]?.url || ''
    }
  } catch {
    throw new Error( 'File upload failed' )
  }
}

/** ---------------- UI handlers ---------------- */
const handleNodeClick = async data => {
  const idNum = Number( data.id )
  selectedNodeId.value = idNum
  formData.selectedLocationId = idNum
  await nextTick()
  formRef.value?.validateField( 'selectedLocationId' )
}

watch( filterText, val => {
  treeRef.value?.filter( val )
} )

const filterNode = ( value, data ) => {
  if ( !value ) return true
  return data.name.toLowerCase().includes( value.toLowerCase() )
}

watch( treeData, async newTreeData => {
  if ( newTreeData.length > 0 && selectedNodeId.value != null ) {
    await setCurrentTreeNode( selectedNodeId.value )
  }
} )

/** ---------------- Submit ---------------- */
const handleConfirm = async() => {
  if ( !formRef.value ) return

  // make 100% sure the model is in sync before validating
  await nextTick()
  if ( !formData.selectedLocationId && selectedNodeId.value != null ) {
    formData.selectedLocationId = Number( selectedNodeId.value )
  }
  await formRef.value.clearValidate( ['selectedLocationId'] )

  const isValid = await formRef.value.validate() // Promise<boolean> in Element Plus
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

    finalImageList = finalImageList.filter( u => !removedImages.value.includes( u ) )
    finalFilesList = finalFilesList.filter( u => !removedFiles.value.includes( u ) )

    if ( removedExplosion.value?.length && removedExplosion.value.includes( finalExploded ) ) {
      finalExploded = ''
    }
    if ( newExplosionUrl.value ) {
      finalExploded = newExplosionUrl.value
    }

    const locationIdNum = Number( formData.selectedLocationId )

    const submissionData = {
      name : formData.name,
      code : formData.code,
      serial_number : formData.model,
      description : formData.description,
      parent_id : formData.parentId != null ? Number( formData.parentId ) : null,
      location_id : locationIdNum,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : finalImageList,
      file_list : finalFilesList,
      exploded_view_drawing : finalExploded ? [finalExploded] : []
    }

    console.debug( 'Submitting location_id:', typeof submissionData.location_id, submissionData.location_id )

    const response = await editEquipmentNode( props.equipmentId, submissionData )
    ElMessage.success( 'Sub Equipment updated successfully!' )

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
    ElMessage.error( `Failed to update sub equipment: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

/** ---------------- Other ---------------- */
const handleCancel = () => {
  resetFileState()
  emit( 'close' )
  emit( 'cancel' )
}

const fetchSequenceOrders = async() => {
  if ( !formData.parentId ) return
  try {
    const equipmentResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [6],
      parent_ids : [formData.parentId]
    } )
    const equipmentContent = equipmentResponse.data?.content || []
    const otherEquipment = equipmentContent.filter( item => item.id !== parseInt( props.equipmentId ) )
    const sequenceOrdersArray = otherEquipment
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )
    sequenceOrders.value = sequenceOrdersArray
  } catch {
    ElMessage.error( 'Failed to load sequence orders' )
  }
}

const maxSequenceOrder = computed( () => {
  const calculatedMax = sequenceOrders.value.length + 1
  return Math.max( calculatedMax, formData.sequenceOrder || 1 )
} )

onMounted( async() => {
  try {
    resetFileState()
    // Ensure we fetch both and then set the current node deterministically
    const [equipmentData] = await Promise.all( [fetchEquipmentData(), fetchLocationTree()] )
    if ( formData.selectedLocationId != null ) {
      await setCurrentTreeNode( formData.selectedLocationId )
    }
    if ( equipmentData && ( equipmentData.parent_id || equipmentData.parent_equipment_node_id ) ) {
      await fetchSequenceOrders()
    }
    dataReady.value = true
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
        model : '',
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
.edit-sub-equipment {
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

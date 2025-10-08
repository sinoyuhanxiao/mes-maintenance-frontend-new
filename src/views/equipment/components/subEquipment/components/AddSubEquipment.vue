<template>
  <div class="add-new-t4">
    <div class="general-information">
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
        <!-- Location (prefilled from parent; user may change) -->
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

          <!-- Hidden input to make Element Plus validation reliably see a value -->
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
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getLocationTree } from '@/api/location.js'
import { getEquipmentNodes, createNewNode, getEquipmentById } from '@/api/equipment.js'
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
  model : '',
  description : '',
  parentId : props.parentId,
  selectedLocationId : null,
  sequenceOrder : 1,
  imageList : [],
  explodedViewDrawing : [],
  filesList : []
} )

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

/** ---------------- Tree config ---------------- */
const treeProps = {
  children : 'children',
  label : 'name'
}

/** ---------------- File handlers ---------------- */
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
    let uploadedImagesRes = []
    let uploadedExplosionViewRes = []
    let uploadedFilesRes = []

    if ( formData.imageList.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( formData.imageList )
      uploadedImagesRes = imageRes.data.uploadedFiles || []
      formData.imageList = uploadedImagesRes.map( file => file.url )
    }

    if ( formData.explodedViewDrawing.length > 0 ) {
      const explosionRes = await uploadMultipleToMinio( formData.explodedViewDrawing )
      uploadedExplosionViewRes = explosionRes.data.uploadedFiles || []
      formData.explodedViewDrawing = uploadedExplosionViewRes.map( file => file.url )
    }

    if ( formData.filesList.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( formData.filesList )
      uploadedFilesRes = fileRes.data.uploadedFiles || []
      formData.filesList = uploadedFilesRes.map( file => file.url )
    }

    return { uploadedImagesRes, uploadedExplosionViewRes, uploadedFilesRes }
  } catch {
    throw new Error( 'File upload failed' )
  }
}

/** ---------------- Location tree helpers ---------------- */
const setCurrentTreeNode = async locationId => {
  if ( !treeRef.value || locationId == null ) return
  await nextTick()
  if ( treeData.value.length === 0 ) return
  const idNum = Number( locationId )
  treeRef.value.setCurrentKey( idNum )
  const node = treeRef.value.getNode( idNum )
  if ( !node ) return
  // expand parents
  let parentNode = node.parent
  while ( parentNode && parentNode.key !== undefined ) {
    parentNode.expanded = true
    parentNode = parentNode.parent
  }
  // sync model + highlight
  formData.selectedLocationId = idNum
  selectedNodeId.value = idNum
  await nextTick()
  formRef.value?.clearValidate( 'selectedLocationId' )
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
const handleNodeClick = data => {
  const idNum = Number( data.id )
  selectedNodeId.value = idNum
  formData.selectedLocationId = idNum
  nextTick( () => {
    formRef.value?.validateField( 'selectedLocationId' )
  } )
}

/** ---------------- Parent prefill ---------------- */
const prefillLocationFromParent = async() => {
  if ( !props.parentId ) return
  try {
    const res = await getEquipmentById( props.parentId )
    const raw = res.data?.data || res.data || {}
    const parentLocId =
      raw.location?.id != null ? Number( raw.location.id ) : raw.location_id != null ? Number( raw.location_id ) : null

    // Only prefill if user hasn’t chosen anything yet
    if ( parentLocId != null && formData.selectedLocationId == null ) {
      formData.selectedLocationId = parentLocId
      selectedNodeId.value = parentLocId
      if ( treeData.value.length > 0 ) {
        await setCurrentTreeNode( parentLocId )
      }
    }
  } catch {
    // silently ignore; location can still be chosen manually
  }
}

/** ---------------- Sequence order ---------------- */
const fetchSequenceOrders = async() => {
  if ( !props.parentId ) return
  try {
    const equipmentGroupsResponse = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [6],
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
  } catch {
    ElMessage.error( 'Failed to load sequence orders' )
  }
}
const maxSequenceOrder = computed( () => {
  const calculatedMax = sequenceOrders.value.length + 1
  return Math.max( calculatedMax, formData.sequenceOrder || 1 )
} )

/** ---------------- Error sanitization helpers ---------------- */
function extractErrorText( err ) {
  const parts = []
  if ( err?.response?.data ) {
    parts.push( typeof err.response.data === 'string' ? err.response.data : JSON.stringify( err.response.data ) )
  }
  if ( err?.message ) parts.push( err.message )
  return parts.join( ' ' ).toLowerCase()
}

function isDuplicateError( err ) {
  const t = extractErrorText( err )
  return (
    err?.response?.status === 409 ||
    t.includes( 'duplicate key value' ) ||
    t.includes( 'unique constraint' ) ||
    t.includes( 'already exists' ) ||
    t.includes( 'conflict' ) ||
    t.includes( 'constraint [equipment_node_unique]' ) ||
    t.includes( 'equipment_node_unique' )
  )
}

function friendlyCreateError( err ) {
  if ( isDuplicateError( err ) ) {
    return { title : 'Duplicate code. Please choose another.' }
  }
  if ( err?.response?.status === 400 ) {
    return { title : 'Invalid data', message : 'Please check the form and try again.' }
  }
  if ( err?.response?.status === 403 ) {
    return { title : 'Permission denied', message : 'You do not have permission to perform this action.' }
  }
  if ( extractErrorText( err ).includes( 'network' ) ) {
    return { title : 'Network error', message : 'Please check your connection and try again.' }
  }
  return { title : 'Error', message : 'Failed to create sub equipment. Please try again.' + err }
}

/** ---------------- Submit ---------------- */
const handleConfirm = async() => {
  if ( !formRef.value ) return

  // Force sync before validation
  await nextTick()
  if ( !formData.selectedLocationId && selectedNodeId.value != null ) {
    formData.selectedLocationId = Number( selectedNodeId.value )
  }
  await formRef.value.clearValidate( ['selectedLocationId'] )

  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true
  try {
    if ( formData.imageList.length > 0 || formData.filesList.length > 0 || formData.explodedViewDrawing.length > 0 ) {
      await uploadFilesToServer()
    }

    const submissionData = {
      name : formData.name,
      code : ( formData.code || '' ).trim(),
      serial_number : formData.model,
      description : formData.description,
      node_type_id : 6,
      parent_id : formData.parentId != null ? Number( formData.parentId ) : null,
      location_id : formData.selectedLocationId != null ? Number( formData.selectedLocationId ) : null,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : formData.imageList,
      exploded_view_drawing : formData.explodedViewDrawing,
      file_list : formData.filesList
    }

    // If your axios wrapper supports silencing global toasts, pass a flag:
    // const response = await createNewNode(submissionData, { meta: { silent: true } })
    const response = await createNewNode( submissionData )

    ElMessage.success( 'Sub Equipment created successfully!' )

    // extract new node id robustly
    const newId = response?.data?.id ?? response?.data?.data?.id ?? response?.id ?? response?.data?.content?.id ?? null

    emit( 'success', {
      id : newId != null ? Number( newId ) : null,
      parentId : submissionData.parent_id,
      locationId : submissionData.location_id
    } )

    emit( 'close' )
    resetForm()
  } catch ( error ) {
    // Close any toast opened by global interceptors to avoid double messages
    ElMessage.closeAll()

    const { title, message } = friendlyCreateError( error )

    // If it’s a duplicate, nudge to Code field
    if ( isDuplicateError( error ) ) {
      await nextTick()
      formRef.value?.scrollToField?.( 'code' )
    }

    // Show a single, friendly toast (no raw SQL)
    ElMessage.error( `${title}: ${message}` )

    return
  } finally {
    submitLoading.value = false
  }
}

/** ---------------- Reset / Cancel ---------------- */
const resetFormData = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }
  Object.assign( formData, {
    name : '',
    code : '',
    model : '',
    description : '',
    parentId : props.parentId,
    selectedLocationId : null,
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
  fetchSequenceOrders()
}
const handleCancel = () => {
  resetForm()
  emit( 'close' )
  emit( 'cancel' )
}

/** ---------------- Reactivity ---------------- */
watch(
  () => props.parentId,
  async( newParentId, oldParentId ) => {
    if ( newParentId !== oldParentId && newParentId !== null ) {
      formData.parentId = newParentId
      resetFormData()
      await fetchSequenceOrders()
      await prefillLocationFromParent()
      if ( formData.selectedLocationId != null && treeData.value.length > 0 ) {
        await setCurrentTreeNode( formData.selectedLocationId )
      }
    }
  },
  { immediate : false }
)

watch( treeData, async newTree => {
  if ( newTree.length > 0 && formData.selectedLocationId != null ) {
    await setCurrentTreeNode( formData.selectedLocationId )
  }
} )

/** ---------------- Mount ---------------- */
onMounted( async() => {
  await fetchLocationTree()
  if ( props.parentId ) {
    await Promise.all( [fetchSequenceOrders(), prefillLocationFromParent()] )
  }
  if ( formData.selectedLocationId != null ) {
    await setCurrentTreeNode( formData.selectedLocationId )
  }
} )
</script>

<style scoped>
.add-new-t4 {
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

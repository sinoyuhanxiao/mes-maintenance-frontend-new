<template>
  <div class="add-new-t2">
    <div class="general-information">
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
              <el-input v-model="formData.name" placeholder="Enter equipment name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Equipment Code"
              prop="code"
              :rules="[{ required: true, message: 'Equipment code is required' }]"
            >
              <el-input v-model="formData.code" placeholder="Enter a unique code" />
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

        <!-- Location -->
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
            />
          </div>
        </el-form-item>

        <!-- Production Line (T1) -->
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
                :filterable="!lockProductionLine"
                :clearable="!lockProductionLine"
                :disabled="lockProductionLine"
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
          title-label-position="top"
        />
      </div>

      <div class="file-upload">
        <FileUploadMultiple @update:filesList="handleFilesListUpdate" upload-type="files" :max-files="5" />
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

/* ---------- refs & state ---------- */
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

/* ---------- props ---------- */
const props = defineProps( {
  parentId : { type : [Number, String], default : null }, // T2 id
  productionLineId : { type : [Number, String], default : null }, // T1 id to prefill & lock
  lockProductionLine : { type : Boolean, default : true } // if true, the select is disabled
} )

const emit = defineEmits( ['close', 'cancel', 'success'] )

/* ---------- validators ---------- */
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

/* ---------- form model ---------- */
const formData = reactive( {
  name : '',
  code : '',
  description : '',
  serialNumber : '',
  plc : '',
  power : null,
  installationDate : null,
  parentId : props.parentId, // T2 id
  selectedLocationId : null,
  equipmentId : props.lockProductionLine ? props.productionLineId : null, // T1 id
  sequenceOrder : 1,
  imageList : [],
  explodedViewDrawing : [],
  filesList : []
} )

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

  // sync model
  formData.selectedLocationId = idNum
  selectedNodeId.value = idNum

  // show only the leaf name (last tier), same as T4 behavior
  filterText.value = node.data?.name || node.label || ''
}

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
      } else {
        // tree not ready yet – at least store something in the search box
        filterText.value = String( parentLocId )
      }
    }
  } catch {
    // silently ignore; user can still pick manually
  }
}

/* ---------- watches ---------- */
watch(
  () => props.parentId,

  async( newVal, oldVal ) => {
    if ( newVal !== oldVal ) {
      formData.parentId = newVal
      resetFormData()
      await fetchProductionLines()
      await prefillLocationFromParent()
      if ( formData.selectedLocationId != null && treeData.value.length > 0 ) {
        await setCurrentTreeNode( formData.selectedLocationId )
      }
    }
  }
)

watch(
  () => props.productionLineId,
  newVal => {
    if ( props.lockProductionLine ) {
      formData.equipmentId = newVal
    }
  }
)

/* ---------- location tree ---------- */
const treeProps = { children : 'children', label : 'name' }

watch( filterText, val => {
  treeRef.value?.filter( val )
} )

const filterNode = ( value, data ) => {
  if ( !value ) return true
  return data.name.toLowerCase().includes( value.toLowerCase() )
}

/* Show picked node name (or full path) in the search bar */
const onClearSearch = () => {
  // Only clear search text; keep selection.
  // If you want to also clear selection on clear:
  // selectedNodeId.value = null
  // formData.selectedLocationId = null
}

const handleNodeClick = data => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id

  // Leaf name only:
  // filterText.value = data.name || ''

  // Full path (fallback to leaf if path not found):
  filterText.value = data.name || ''
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

    // If we already know a location (from parent prefill), highlight & show it
    if ( formData.selectedLocationId != null ) {
      await setCurrentTreeNode( formData.selectedLocationId )
    }
  } catch ( err ) {
    error.value = err.message || 'Failed to load location tree'
    ElMessage.error( 'Failed to load location tree' )
  } finally {
    loading.value = false
  }
}

/* ---------- production lines (T1) & sequence for T3 ---------- */
const fetchProductionLines = async() => {
  productionLineLoading.value = true
  try {
    // T1 = Production Lines
    const res = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', { node_type_ids : [3] } )
    productionLines.value = res.data?.content || []

    // compute next sequence among T3 (node_type_id 5) under current T2 parent
    if ( props.parentId ) {
      const resT3 = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
        node_type_ids : [5],
        parent_ids : [props.parentId]
      } )
      const seq = ( resT3.data?.content || [] ).map( i => i.sequence_order ).filter( n => n != null && !isNaN( n ) )
      const next = ( seq.length ? Math.max( ...seq ) : 0 ) + 1
      formData.sequenceOrder = Math.min( next, seq.length + 1 )
      sequenceOrders.value = seq
    }
  } finally {
    productionLineLoading.value = false
  }
}

/* ---------- computed ---------- */
const maxSequenceOrder = computed( () => {
  const calculatedMax = sequenceOrders.value.length + 1
  return Math.max( calculatedMax, formData.sequenceOrder || 1 )
} )

/* ---------- uploads ---------- */

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
    let upImages = []
    let upExplosion = []
    let upFiles = []

    if ( formData.imageList.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( formData.imageList )
      upImages = imageRes.data.uploadedFiles || []
      formData.imageList = upImages.map( file => file.url )
    }

    if ( formData.explodedViewDrawing.length > 0 ) {
      const explosionRes = await uploadMultipleToMinio( formData.explodedViewDrawing )
      upExplosion = explosionRes.data.uploadedFiles || []
      formData.explodedViewDrawing = upExplosion.map( file => file.url )
    }

    if ( formData.filesList.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( formData.filesList )
      upFiles = fileRes.data.uploadedFiles || []
      formData.filesList = upFiles.map( file => file.url )
    }

    return { upImages, upFiles }
  } catch {
    throw new Error( 'File upload failed' )
  }
}

/* ---------- submit ---------- */
const handleConfirm = async() => {
  if ( !formRef.value ) return
  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true
  try {
    if ( formData.imageList.length > 0 || formData.filesList.length > 0 || formData.explodedViewDrawing.length > 0 ) {
      await uploadFilesToServer()
    }

    const submissionData = {
      name : formData.name,
      code : formData.code,
      description : formData.description,
      serial_number : formData.serialNumber,
      plc : formData.plc,
      power : formData.power,
      installation_date : formData.installationDate ? `${formData.installationDate}T00:00:00Z` : null,
      node_type_id : 5, // T3
      parent_id : formData.parentId, // T2 parent
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder ),
      image_list : formData.imageList,
      exploded_view_drawing : formData.explodedViewDrawing,
      file_list : formData.filesList
    }

    const response = await createNewNode( submissionData )
    ElMessage.success( 'Equipment created successfully!' )

    resetForm()
    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    ElMessage.error( `Failed to create equipment: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

/* ---------- resets ---------- */
const resetFormData = () => {
  if ( formRef.value ) formRef.value.resetFields()

  Object.assign( formData, {
    name : '',
    code : '',
    description : '',
    serialNumber : '',
    plc : '',
    power : null,
    installationDate : null,
    parentId : props.parentId,
    selectedLocationId : null,
    equipmentId : props.lockProductionLine ? props.productionLineId : null,
    sequenceOrder : 1,
    imageList : [],
    explodedViewDrawing : [],
    filesList : []
  } )

  selectedNodeId.value = null
  uploadedImages.value = []
  uploadedExplosionView.value = []
  uploadedFiles.value = []
  filterText.value = '' // clear search bar display
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

/* ---------- mount ---------- */
onMounted( async() => {
  if ( props.lockProductionLine ) {
    formData.equipmentId = props.productionLineId
  }

  await fetchLocationTree()
  await fetchProductionLines()

  // Prefill location from parent T2 (same behavior as T4)
  await prefillLocationFromParent()

  if ( formData.selectedLocationId != null ) {
    await setCurrentTreeNode( formData.selectedLocationId )
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

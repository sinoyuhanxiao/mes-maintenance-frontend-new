<template>
  <div class="add-new-t2">
    <div class="general-information">
      <el-form :label-position="labelPosition" label-width="auto" :model="formData">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Equipment Group Name">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Equipment Group Code">
              <el-input v-model="formData.code" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Location">
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
            <el-form-item label="Production Line">
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
            <el-form-item label="Sequence Order">
              <el-input v-model="formData.sequenceOrder" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="file-upload">
        <ImageUploadMultiple @update:imageList="handleImageListUpdate" @update:filesList="handleFilesListUpdate" />
      </div>
      <div class="dialog-footer">
        <el-button @click="handleCancel"> Cancel </el-button>
        <el-button
          type="warning"
          @click="handleTestUpload"
          :loading="testUploadLoading"
          :disabled="formData.image_list.length === 0 && formData.files_list.length === 0"
        >
          Test Upload
        </el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading"> Confirm </el-button>
      </div>

      <!-- Debug info - remove later -->
      <div v-if="formData.equipmentId" class="selected-info">
        <el-text><strong>Selected Production Line:</strong> {{ selectedProductionLineName }}</el-text>
      </div>
      <div v-if="formData.equipmentId" class="selected-info">
        <el-text><strong>Selected Production Line ID:</strong> {{ formData.equipmentId }}</el-text>
      </div>
      <div v-if="formData.equipmentId" class="selected-info">
        <el-text><strong>Sequence Order:</strong> {{ sequenceOrders }}</el-text>
      </div>

      <!-- File upload debug info -->
      <div v-if="formData.image_list.length > 0" class="selected-info">
        <el-text><strong>Images:</strong> {{ formData.image_list.length }} files</el-text>
        <div v-if="typeof formData.image_list[0] === 'string'" class="url-list">
          <div v-for="(url, index) in formData.image_list" :key="index" class="url-item">📷 {{ url }}</div>
        </div>
      </div>
      <div v-if="formData.files_list.length > 0" class="selected-info">
        <el-text><strong>Documents:</strong> {{ formData.files_list.length }} files</el-text>
        <div v-if="typeof formData.files_list[0] === 'string'" class="url-list">
          <div v-for="(url, index) in formData.files_list" :key="index" class="url-item">📄 {{ url }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getLocationTree } from '@/api/location.js'
import { getEquipmentNodes } from '@/api/equipment.js'
import { uploadMultipleToMinio } from '@/api/minio.js'
import ImageUploadMultiple from '@/components/FileUpload/ImageUploadMultiple.vue'

const labelPosition = ref( 'top' )
const treeData = ref( [] )
const loading = ref( false )
const error = ref( null )
const filterText = ref( '' )
const treeRef = ref( null )
const selectedNodeId = ref( null )
const submitLoading = ref( false )
const testUploadLoading = ref( false )

const productionLines = ref( [] )
const productionLineLoading = ref( false )
const sequenceOrders = ref( [] )

// File upload state
const uploadedImages = ref( [] )
const uploadedFiles = ref( [] )

const formData = reactive( {
  name : '',
  code : '',
  description : '',
  selectedLocationId : null,
  equipmentId : null,
  sequenceOrder : '',
  // Store file arrays for upload and URLs after upload
  image_list : [],
  files_list : []
} )

const treeProps = {
  children : 'children',
  label : 'name'
}

const selectedProductionLineName = computed( () => {
  const selectedLine = productionLines.value.find( line => line.id === formData.equipmentId )
  return selectedLine?.name || ''
} )

// Handle image uploads from ImageUploadMultiple component
const handleImageListUpdate = images => {
  uploadedImages.value = images
  formData.image_list = images
}

// Handle file uploads from ImageUploadMultiple component
const handleFilesListUpdate = files => {
  uploadedFiles.value = files
  formData.files_list = files
}

// Test upload function - separate from form submission
const handleTestUpload = async() => {
  if ( formData.image_list.length === 0 && formData.files_list.length === 0 ) {
    ElMessage.warning( 'Please select some files to test upload!' )
    return
  }

  testUploadLoading.value = true

  try {
    // Create copies of file arrays for testing (don't modify original)
    const testImageList = [...formData.image_list]
    const testFilesList = [...formData.files_list]

    let uploadedImages = []
    let uploadedFiles = []

    // Upload images if they exist
    if ( testImageList.length > 0 ) {
      console.log( 'Testing image upload...', testImageList )
      const imageRes = await uploadMultipleToMinio( testImageList )
      uploadedImages = imageRes.data.uploadedFiles || []
      console.log( 'Test Images uploaded successfully:', uploadedImages )
    }

    // Upload files if they exist
    if ( testFilesList.length > 0 ) {
      console.log( 'Testing file upload...', testFilesList )
      const fileRes = await uploadMultipleToMinio( testFilesList )
      uploadedFiles = fileRes.data.uploadedFiles || []
      console.log( 'Test Files uploaded successfully:', uploadedFiles )
    }

    // Show success message with counts
    const totalUploaded = uploadedImages.length + uploadedFiles.length
    ElMessage.success( `Test upload successful! ${totalUploaded} files uploaded.` )

    // Log the URLs for testing
    const imageUrls = uploadedImages.map( file => file.url )
    const fileUrls = uploadedFiles.map( file => file.url )

    console.log( 'Test Image URLs:', imageUrls )
    console.log( 'Test File URLs:', fileUrls )
    console.log( 'Upload Summary:', {
      totalFiles : totalUploaded,
      images : uploadedImages.length,
      documents : uploadedFiles.length,
      imageUrls,
      fileUrls
    } )
  } catch ( error ) {
    console.error( 'Test upload failed:', error )
    ElMessage.error( `Test upload failed: ${error.message}` )
  } finally {
    testUploadLoading.value = false
  }
}

// Upload files to MinIO - adapted from your reference function
const uploadFilesToServer = async() => {
  try {
    let uploadedImages = []
    let uploadedFiles = []

    // Upload images if they exist
    if ( formData.image_list.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( formData.image_list )
      uploadedImages = imageRes.data.uploadedFiles || []
      console.log( 'Images uploaded successfully:', uploadedImages )
      formData.image_list = uploadedImages.map( file => file.url )
    }

    // Upload files if they exist
    if ( formData.files_list.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( formData.files_list )
      uploadedFiles = fileRes.data.uploadedFiles || []
      console.log( 'Files uploaded successfully:', uploadedFiles )
      formData.files_list = uploadedFiles.map( file => file.url )
    }

    console.log( 'Current image list after upload:', formData.image_list )
    console.log( 'Current file list after upload:', formData.files_list )

    ElMessage.success( 'Files uploaded successfully!' )

    return { uploadedImages, uploadedFiles }
  } catch ( err ) {
    console.error( 'File upload failed:', err )
    throw new Error( 'File upload failed' )
  }
}

// Handle form submission
const handleConfirm = async() => {
  submitLoading.value = true

  try {
    // Upload files first
    await uploadFilesToServer()

    // Now submit your main form data
    // At this point, formData.image_list and formData.files_list contain URLs
    console.log( 'Form data to submit:', formData )

    // Example API call (replace with your actual endpoint):
    // await createEquipmentGroup( formData )

    ElMessage.success( 'Equipment group created successfully!' )

    // Reset form or navigate away
    // resetForm()
  } catch ( error ) {
    console.error( 'Submission failed:', error )
    ElMessage.error( 'Failed to create equipment group. Please try again.' )
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  // Handle cancel logic - reset form or navigate away
  console.log( 'Cancel clicked' )
}

const fetchProductionLines = async() => {
  productionLineLoading.value = true
  try {
    const response = await getEquipmentNodes( 1, 10, 'sequenceOrder', 'ASC', {
      node_type_ids : [3]
    } )

    const content = response.data?.content || []
    productionLines.value = content

    const sequenceOrdersArray = content
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )

    sequenceOrders.value = sequenceOrdersArray

    const maxSequenceOrder = sequenceOrdersArray.length > 0 ? Math.max( ...sequenceOrdersArray ) : 0
    const nextSequenceOrder = maxSequenceOrder + 1

    formData.sequenceOrder = nextSequenceOrder.toString()
  } catch ( err ) {
    console.error( 'Failed to load production lines:', err )
  } finally {
    productionLineLoading.value = false
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
  } catch ( err ) {
    error.value = err.message || 'Failed to load location tree'
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
  console.log( 'Location node clicked:', data )

  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id

  console.log( 'Selected location ID:', data.id )
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
  max-height: 300px;
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

.selected-info {
  margin-top: 20px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #e0f3ff;
  border-radius: 4px;
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

.url-list {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.url-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  word-break: break-all;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 3px;
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

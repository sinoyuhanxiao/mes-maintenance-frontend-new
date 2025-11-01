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
              @clear="onClearSearch"
            />

            <div v-if="loading" class="tree-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Production Line"
              prop="equipmentId"
              :rules="[{ required: true, message: 'Production Line is required' }]"
            >
              <el-select
                v-model="formData.equipmentId"
                :placeholder="lockProductionLine ? '' : 'Select production line'"
                :filterable="!lockProductionLine"
                :clearable="!lockProductionLine"
                :disabled="lockProductionLine"
                style="width: 100%"
                :loading="productionLineLoading"
              >
                <!-- Locked: show only the chosen line -->
                <el-option
                  v-if="lockProductionLine && productionLineId"
                  :label="productionLineName || 'Selected line'"
                  :value="productionLineId"
                />
                <!-- Unlocked: normal list -->
                <template v-else>
                  <el-option v-for="line in productionLines" :key="line.id" :label="line.name" :value="line.id" />
                </template>
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
          :title-label-position="labelPosition"
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
          :title-label-position="labelPosition"
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

const formRef = ref(null)
const labelPosition = ref('top')
const treeData = ref([])
const loading = ref(false)
const error = ref(null)
const filterText = ref('')
const treeRef = ref(null)
const selectedNodeId = ref(null)
const submitLoading = ref(false)
const productionLines = ref([])
const productionLineLoading = ref(false)
const sequenceOrders = ref([])
const uploadedImages = ref([])
const uploadedFiles = ref([])
const uploadedExplosionView = ref([])

const props = defineProps({
  parentId: { type: [Number, String], default: null }, // clicked node id (parent for the new T2)
  productionLineId: { type: [Number, String], default: null }, // T1 id (prefilled)
  productionLineName: { type: String, default: '' }, // T1 label (display)
  lockProductionLine: { type: Boolean, default: false }, // lock select when true
})

const emit = defineEmits(['close', 'cancel', 'success'])

const formData = reactive({
  name: '',
  code: '',
  description: '',
  parentId: props.parentId,
  selectedLocationId: null,
  equipmentId: props.lockProductionLine ? props.productionLineId : null, // prefill if locked
  sequenceOrder: 1,
  imageList: [],
  explodedViewDrawing: [],
  filesList: [],
})

/* Keep parentId & productionLine in sync when props change */
watch(
  () => props.parentId,
  (newParentId, oldParentId) => {
    if (newParentId !== oldParentId && newParentId !== null) {
      formData.parentId = newParentId
      // do NOT clear prefilled production line if locked
      resetFormData({ keepLockedT1: true })
      fetchProductionMeta() // sequence + (maybe) lines
    }
  }
)

watch(
  () => props.productionLineId,
  v => {
    if (props.lockProductionLine) {
      formData.equipmentId = v ?? null
    }
  },
  { immediate: true }
)

/* ====== Location tree ====== */
const treeProps = { children: 'children', label: 'name' }

watch(filterText, val => treeRef.value?.filter(val))
const filterNode = (value, data) => !value || data.name.toLowerCase().includes(value.toLowerCase())

const handleNodeClick = data => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id

  // 👇 Add this line to show the selected location in the search bar
  filterText.value = data.name || ''

  // (Optional) if you want to show full path like "Plant A / Line 2 / Station 5":
  // filterText.value = getPathLabelById(data.id) || data.name || ''
}

// Add helpers (below other refs)
const onClearSearch = () => {
  // Keep filter behavior the same; don't change selection on clear.
  // If you also want to clear selection when the user clears the search:
  // selectedNodeId.value = null
  // formData.selectedLocationId = null
}

function findPathById(nodes, targetId, path = []) {
  for (const n of nodes || []) {
    const nextPath = [...path, n]
    if (n.id === targetId) return nextPath
    if (n.children?.length) {
      const hit = findPathById(n.children, targetId, nextPath)
      if (hit) return hit
    }
  }
  return null
}

function getPathLabelById(id) {
  const path = findPathById(treeData.value, id)
  return path ? path.map(n => n.name).join(' / ') : ''
}

/* ====== File uploads ====== */
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

const uploadFilesToServer = async () => {
  try {
    let uploadedImages = []
    let uploadedExplosionView = []
    let uploadedFiles = []

    if (formData.imageList.length > 0) {
      const imageRes = await uploadMultipleToMinio(formData.imageList)
      uploadedImages = imageRes.data.uploadedFiles || []
      formData.imageList = uploadedImages.map(file => file.url)
    }

    if (formData.explodedViewDrawing.length > 0) {
      const explosionRes = await uploadMultipleToMinio(formData.explodedViewDrawing)
      uploadedExplosionView = explosionRes.data.uploadedFiles || []
      formData.explodedViewDrawing = uploadedExplosionView.map(file => file.url)
    }

    if (formData.filesList.length > 0) {
      const fileRes = await uploadMultipleToMinio(formData.filesList)
      uploadedFiles = fileRes.data.uploadedFiles || []
      formData.filesList = uploadedFiles.map(file => file.url)
    }

    return { uploadedImages, uploadedFiles }
  } catch (err) {
    throw new Error('File upload failed')
  }
}

const handleConfirm = async () => {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid) return

  submitLoading.value = true

  try {
    if (formData.imageList.length > 0 || formData.filesList.length > 0 || formData.explodedViewDrawing.length > 0) {
      await uploadFilesToServer()
    }

    // Safety: coerce any objects from the upload component into URL strings
    const toUrlArray = arr => (arr || []).map(x => (typeof x === 'string' ? x : x?.url)).filter(Boolean)

    const image_list = toUrlArray(formData.imageList)
    const exploded_view_drawing = toUrlArray(formData.explodedViewDrawing)
    const file_list = toUrlArray(formData.filesList)

    const submissionData = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      node_type_id: 4, // Tier 2 type id
      parent_id: formData.parentId, // parent from props
      location_id: formData.selectedLocationId,
      sequence_order: Number(formData.sequenceOrder),
      image_list,
      exploded_view_drawing,
      file_list,
    }

    const response = await createNewNode(submissionData)
    ElMessage.success('Equipment group created successfully!')

    resetForm()
    emit('close')
    emit('success', response.data)
  } catch (error) {
    ElMessage.error(`Failed to create equipment group: ${error.message}`)
  } finally {
    submitLoading.value = false
  }
}

function resetFormData({ keepLockedT1 = false } = {}) {
  if (formRef.value) formRef.value.resetFields()

  Object.assign(formData, {
    name: '',
    code: '',
    description: '',
    parentId: props.parentId,
    selectedLocationId: null,
    equipmentId:
      keepLockedT1 && props.lockProductionLine
        ? props.productionLineId
        : props.lockProductionLine
        ? props.productionLineId
        : null,
    sequenceOrder: 1,
    imageList: [],
    explodedViewDrawing: [],
    filesList: [],
  })

  selectedNodeId.value = null
  uploadedImages.value = []
  uploadedExplosionView.value = []
  uploadedFiles.value = []
  filterText.value = ''
}

function resetForm() {
  resetFormData({ keepLockedT1: true })
  fetchProductionMeta()
}

function handleCancel() {
  resetForm()
  emit('close')
  emit('cancel')
}

async function fetchProductionMeta() {
  if (!props.parentId) return

  productionLineLoading.value = true
  try {
    // When unlocked, fetch the selectable production lines (T1)
    if (!props.lockProductionLine) {
      const productionLinesResponse = await getEquipmentNodes(1, 100, 'sequenceOrder', 'ASC', { node_type_ids: [3] })
      productionLines.value = productionLinesResponse.data?.content || []
    } else {
      productionLines.value = []
    }

    // Always fetch existing T2 under the chosen parent to compute next sequence
    const equipmentGroupsResponse = await getEquipmentNodes(1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids: [4],
      parent_ids: [props.parentId],
    })
    const equipmentGroupsContent = equipmentGroupsResponse.data?.content || []
    const sequenceOrdersArray = equipmentGroupsContent
      .map(item => item.sequence_order)
      .filter(order => order !== null && order !== undefined && !isNaN(order))

    sequenceOrders.value = sequenceOrdersArray
    const maxSequenceOrder = sequenceOrdersArray.length > 0 ? Math.max(...sequenceOrdersArray) : 0
    const nextSequenceOrder = maxSequenceOrder + 1
    const maxAllowedSequence = sequenceOrdersArray.length + 1
    formData.sequenceOrder = Math.min(nextSequenceOrder, maxAllowedSequence)
  } catch (err) {
    ElMessage.error('Failed to load production line metadata')
  } finally {
    productionLineLoading.value = false
  }
}

const maxSequenceOrder = computed(() => {
  const calculatedMax = sequenceOrders.value.length + 1
  return Math.max(calculatedMax, formData.sequenceOrder || 1)
})

/* ====== Location tree fetch ====== */
// After fetching the tree, if something is already selected, show it in the search bar
const fetchLocationTree = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getLocationTree()
    let dataArray
    if (response.data?.data) dataArray = response.data.data
    else if (Array.isArray(response.data)) dataArray = response.data
    else if (response.data) dataArray = [response.data]
    else dataArray = []
    treeData.value = dataArray

    // If there’s a preselected location, mirror it into the search bar
    if (formData.selectedLocationId) {
      filterText.value = getPathLabelById(formData.selectedLocationId)
      selectedNodeId.value = formData.selectedLocationId
      // Ensure tree highlights the current node if needed
      // nextTick(() => treeRef.value?.setCurrentKey?.(selectedNodeId.value))
    }
  } catch (err) {
    error.value = err.message || 'Failed to load location tree'
    ElMessage.error('Failed to load location tree')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLocationTree()
  if (props.parentId) fetchProductionMeta()
})
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

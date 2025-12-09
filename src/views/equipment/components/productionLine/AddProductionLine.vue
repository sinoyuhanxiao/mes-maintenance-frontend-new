<template>
  <div class="add-new-t1">
    <div class="general-information">
      <el-form ref="formRef" :label-position="labelPosition" label-width="auto" :model="formData">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="Production Line Name"
              prop="name"
              :rules="[
                { required: true, message: 'Production Line name is required' },
                { type: 'string', message: 'Production Line name must be a string' },
              ]"
            >
              <el-input v-model="formData.name" placeholder="Enter production line name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="Production Line Code"
              prop="code"
              :rules="[{ required: true, message: 'Production Line code is required' }]"
            >
              <el-input v-model="formData.code" placeholder="Enter a unique code" />
            </el-form-item>
          </el-col>
        </el-row>

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
      </el-form>

      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading">Confirm</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getLocationTree } from '@/api/location.js'
import { getEquipmentNodes, createNewNode } from '@/api/equipment.js'

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

// Keep prop signature similar to AddEquipmentGroup, but we only really use parentId here.
const props = defineProps( {
  parentId : { type : [Number, String], default : null }, // parent site id
  productionLineId : { type : [Number, String], default : null },
  productionLineName : { type : String, default : '' },
  lockProductionLine : { type : Boolean, default : false }
} )

const emit = defineEmits( ['close', 'cancel', 'success'] )

const formData = reactive( {
  name : '',
  code : '',
  parentId : props.parentId,
  selectedLocationId : null,
  sequenceOrder : 1
} )

/* Keep parentId in sync when props change */
watch(
  () => props.parentId,
  ( newParentId, oldParentId ) => {
    if ( newParentId !== oldParentId && newParentId !== null ) {
      formData.parentId = newParentId
      resetFormData()
      fetchProductionMeta()
    }
  }
)

/* ====== Location tree ====== */
const treeProps = { children : 'children', label : 'name' }

watch( filterText, val => treeRef.value?.filter( val ) )
const filterNode = ( value, data ) => !value || data.name.toLowerCase().includes( value.toLowerCase() )

const handleNodeClick = data => {
  selectedNodeId.value = data.id
  formData.selectedLocationId = data.id
  filterText.value = data.name || ''
}

const onClearSearch = () => {
  // keep selection as-is when clearing search text
}

function findPathById( nodes, targetId, path = [] ) {
  for ( const n of nodes || [] ) {
    const nextPath = [...path, n]
    if ( n.id === targetId ) return nextPath
    if ( n.children?.length ) {
      const hit = findPathById( n.children, targetId, nextPath )
      if ( hit ) return hit
    }
  }
  return null
}

function getPathLabelById( id ) {
  const path = findPathById( treeData.value, id )
  return path ? path.map( n => n.name ).join( ' / ' ) : ''
}

/* ====== Submit ====== */
const handleConfirm = async() => {
  if ( !formRef.value ) return

  const isValid = await formRef.value.validate()
  if ( !isValid ) return

  submitLoading.value = true

  try {
    const submissionData = {
      name : formData.name,
      code : formData.code,
      node_type_id : 3, // Tier 1 (Production Line)
      parent_id : formData.parentId, // parent site
      location_id : formData.selectedLocationId,
      sequence_order : Number( formData.sequenceOrder )
    }

    const response = await createNewNode( submissionData )
    ElMessage.success( 'Production line created successfully!' )

    resetForm()
    emit( 'close' )
    emit( 'success', response.data )
  } catch ( error ) {
    ElMessage.error( `Failed to create production line: ${error.message}` )
  } finally {
    submitLoading.value = false
  }
}

function resetFormData() {
  if ( formRef.value ) formRef.value.resetFields()

  Object.assign( formData, {
    name : '',
    code : '',
    parentId : props.parentId,
    selectedLocationId : null,
    sequenceOrder : 1
  } )

  selectedNodeId.value = null
  filterText.value = ''
}

function resetForm() {
  resetFormData()
  fetchProductionMeta()
}

function handleCancel() {
  resetForm()
  emit( 'close' )
  emit( 'cancel' )
}

async function fetchProductionMeta() {
  if ( !props.parentId ) return

  try {
    // For Tier 1: fetch existing production lines under this site to compute next sequence_order
    const response = await getEquipmentNodes( 1, 100, 'sequenceOrder', 'ASC', {
      node_type_ids : [3], // T1 nodes
      parent_ids : [props.parentId]
    } )

    const content = response.data?.content || []
    const sequenceOrdersArray = content
      .map( item => item.sequence_order )
      .filter( order => order !== null && order !== undefined && !isNaN( order ) )

    sequenceOrders.value = sequenceOrdersArray
    const maxSequence = sequenceOrdersArray.length > 0 ? Math.max( ...sequenceOrdersArray ) : 0
    const nextSequence = maxSequence + 1
    const maxAllowed = sequenceOrdersArray.length + 1
    formData.sequenceOrder = Math.min( nextSequence, maxAllowed )
  } catch ( err ) {
    ElMessage.error( 'Failed to load production line metadata' )
  }
}

/* ====== Location tree fetch ====== */
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

    if ( formData.selectedLocationId ) {
      filterText.value = getPathLabelById( formData.selectedLocationId )
      selectedNodeId.value = formData.selectedLocationId
    }
  } catch ( err ) {
    error.value = err.message || 'Failed to load location tree'
    ElMessage.error( 'Failed to load location tree' )
  } finally {
    loading.value = false
  }
}

onMounted( () => {
  fetchLocationTree()
  if ( props.parentId ) fetchProductionMeta()
} )
</script>

<style scoped>
.add-new-t1 {
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

.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 16px;
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

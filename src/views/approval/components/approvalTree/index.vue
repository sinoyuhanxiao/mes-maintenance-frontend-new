<template>
  <div class="tree-container">
    <div class="tree-toolbar">
      <el-input v-model="filterText" placeholder="Search by name" clearable class="tree-search" />
      <el-button class="edit-toggle" :type="isEditMode ? 'success' : 'primary'" @click="isEditMode = !isEditMode">
        {{ isEditMode ? 'Done' : 'Edit' }}
      </el-button>
    </div>
    <el-tree
      v-loading="loading"
      style="max-width: 600px"
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span>{{ node.label }}</span>
          <div v-if="isEditMode">
            <el-button v-if="node.level === 1" type="primary" link @click.stop="append(data)"> Add </el-button>
            <el-button style="margin-left: 4px" type="danger" link @click.stop="remove(node, data)"> Delete </el-button>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- Approval Hierarchy Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="Create Approval Hierarchy"
      width="900px"
      height="300px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <AddApprovalType
        :selected-department-id="selectedDepartmentId"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { searchDepartments } from '@/api/department'
import AddApprovalType from '../approvalDesigner/components/addApprovalType.vue'

// Define emits
const emit = defineEmits( ['node-selected'] )

const handleNodeClick = data => {
  if ( !isEditMode.value ) {
    console.log( 'Selected node:', data )
    emit( 'node-selected', data.id )
    console.log( 'Emitted node-selected with ID:', data.id )
  }
}

const filterText = ref( '' )
const isEditMode = ref( false )
const loading = ref( false )
const treeData = ref( [] )
const dialogVisible = ref( false )
const selectedDepartmentId = ref( null )

const defaultProps = {
  children : 'children',
  label : 'label'
}

/**
 * Add a new child node - opens dialog
 */
const append = data => {
  selectedDepartmentId.value = data.id
  dialogVisible.value = true
}

/**
 * Remove a node
 */
const remove = ( node, data ) => {
  const parent = node.parent
  const children = parent?.data.children || parent?.data
  const index = children.findIndex( d => d.id === data.id )
  children.splice( index, 1 )
  treeData.value = [...treeData.value]

  // TODO: Call API to delete department
  // deleteDepartment(data.id)
}

/**
 * Handle form submission
 */
const handleFormSubmit = async formData => {
  console.log( 'Form submitted:', formData )

  // TODO: Call API to create approval hierarchy
  // try {
  //   await createApprovalHierarchy(formData)
  //   ElMessage.success('Approval hierarchy created successfully')
  //   dialogVisible.value = false
  //   // Optionally refresh the tree or update specific node
  // } catch (error) {
  //   console.error('Failed to create approval hierarchy:', error)
  //   ElMessage.error('Failed to create approval hierarchy')
  // }

  // For now, just close the dialog
  dialogVisible.value = false
}

/**
 * Handle form cancel
 */
const handleFormCancel = () => {
  dialogVisible.value = false
}

/**
 * Handle dialog close
 */
const handleDialogClose = () => {
  selectedDepartmentId.value = null
}

/**
 * Transform flat department list into hierarchical tree structure
 */
const buildTree = departments => {
  const map = {}
  const roots = []

  departments.forEach( dept => {
    map[dept.id] = {
      ...dept,
      label : dept.name,
      children : []
    }
  } )

  departments.forEach( dept => {
    if ( dept.parentId && map[dept.parentId] ) {
      map[dept.parentId].children.push( map[dept.id] )
    } else {
      roots.push( map[dept.id] )
    }
  } )

  const cleanTree = nodes => {
    nodes.forEach( node => {
      if ( node.children.length === 0 ) {
        delete node.children
      } else {
        cleanTree( node.children )
      }
    } )
  }
  cleanTree( roots )

  return roots
}

/**
 * Fetch departments from API
 */
const fetchDepartments = async() => {
  loading.value = true
  try {
    const searchPayload = filterText.value ? { name : filterText.value } : {}
    const response = await searchDepartments( searchPayload, 1, 1000, 'name', 'ASC' )

    const departments = response.data?.content || response.data || []
    treeData.value = buildTree( departments )
  } catch ( error ) {
    console.error( 'Failed to fetch departments:', error )
    treeData.value = []
  } finally {
    loading.value = false
  }
}

// Watch for filter text changes with debounce
let searchTimeout
watch( filterText, newVal => {
  clearTimeout( searchTimeout )
  searchTimeout = setTimeout( () => {
    fetchDepartments()
  }, 300 )
} )

// Initial load
onMounted( () => {
  fetchDepartments()
} )
</script>

<style scoped>
.tree-container {
  max-width: 620px;
  background-color: #fafafa;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-tree {
  background-color: #fafafa;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.tree-toolbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin: 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* Dialog content styling */
:deep(.el-dialog__body) {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;
}
</style>

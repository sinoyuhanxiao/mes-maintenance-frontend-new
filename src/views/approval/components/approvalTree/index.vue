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
          <el-tooltip :content="node.label" placement="top" :disabled="node.label.length < 30">
            <span class="tree-node-label">{{ node.label }}</span>
          </el-tooltip>
          <div v-if="isEditMode" class="tree-node-actions">
            <!-- Add button only on level 2 (Approval Type) -->
            <el-button v-if="node.level === 2" type="primary" link @click.stop="append(data)"> Add </el-button>
            <!-- Delete button only on level 3 (Approval Template) -->
            <el-button
              v-if="node.level === 3"
              style="margin-left: 4px"
              type="danger"
              link
              @click.stop="remove(node, data)"
            >
              Delete
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- Approval Hierarchy Dialog -->
    <el-dialog
      v-if="dialogVisible"
      v-model="dialogVisible"
      title="Create Approval Template"
      width="900px"
      top="5vh"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <AddApprovalType
        :selected-approval-type-id="selectedApprovalTypeId"
        :approval-type-info="selectedApprovalTypeInfo"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getApprovalTree, deleteApprovalTemplate } from '@/api/approval'
import AddApprovalType from '../approvalDesigner/components/addApprovalType.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Define emits
const emit = defineEmits( ['node-selected'] )

const handleNodeClick = data => {
  if ( !isEditMode.value ) {
    console.log( 'Selected node:', data )
    // Only emit if it's an approval template (level 3)
    if ( data.type === 'approval_template' ) {
      emit( 'node-selected', data.originalId )
      console.log( 'Emitted approval template ID:', data.originalId )
    }
  }
}

const filterText = ref( '' )
const isEditMode = ref( false )
const loading = ref( false )
const treeData = ref( [] )
const dialogVisible = ref( false )
const selectedApprovalTypeId = ref( null )
const selectedApprovalTypeInfo = ref( null )

// let id = 1000

const defaultProps = {
  children : 'children',
  label : 'label'
}

/**
 * Add a new child node - opens dialog
 */
const append = data => {
  // Extract the approval type ID when adding to an approval type node
  if ( data.type === 'approval_type' ) {
    selectedApprovalTypeId.value = data.originalId
    selectedApprovalTypeInfo.value = {
      approvalType : data.label,
      departmentId : data.departmentId,
      departmentName : getDepartmentName( data.departmentId )
    }
    dialogVisible.value = true
  }
}

/**
 * Get department name from tree data by ID
 */
const getDepartmentName = departmentId => {
  const dept = treeData.value.find( d => d.originalId === departmentId )
  return dept ? dept.name : 'Unknown Department'
}

/**
 * Remove a node
 */
const remove = async( _node, data ) => {
  // Only allow deleting approval templates (level 3)
  if ( data.type !== 'approval_template' ) {
    ElMessage.warning( 'Only approval templates can be deleted' )
    return
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${data.label}"? This action cannot be undone.`,
      'Confirm Delete',
      {
        confirmButtonText : 'Delete',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--danger'
      }
    )

    // Call API to delete the approval template
    await deleteApprovalTemplate( data.originalId )

    ElMessage.success( 'Approval template deleted successfully' )

    // Refresh the tree to reflect the deletion
    await fetchApprovalTree()
  } catch ( error ) {
    if ( error !== 'cancel' ) {
      console.error( 'Failed to delete approval template:', error )
      ElMessage.error( 'Failed to delete approval template' )
    }
  }
}

/**
 * Handle form submission
 */
const handleFormSubmit = async formData => {
  console.log( 'Form submitted:', formData )
  // Close the dialog
  dialogVisible.value = false
  // Refresh the tree to show the new template
  await fetchApprovalTree()
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
  // Reset immediately to prevent stacking
  selectedApprovalTypeId.value = null
  selectedApprovalTypeInfo.value = null
}

/**
 * Transform API response into hierarchical tree structure
 * Structure: Department > Approval Type > Approval Template
 */
const buildTree = departments => {
  return departments.map( dept => {
    const deptNode = {
      id : `dept-${dept.id}`,
      label : dept.name,
      name : dept.name,
      code : dept.code,
      type : 'department',
      originalId : dept.id
    }

    // Add approval types as children
    if ( dept.approval_types && dept.approval_types.length > 0 ) {
      deptNode.children = dept.approval_types.map( approvalType => {
        const typeNode = {
          id : `type-${approvalType.id}`,
          label : approvalType.approval_type,
          type : 'approval_type',
          originalId : approvalType.id,
          departmentId : dept.id
        }

        // Add approval templates as children of approval type
        if ( approvalType.approval_templates && approvalType.approval_templates.length > 0 ) {
          typeNode.children = approvalType.approval_templates.map( template => ( {
            id : `template-${template.id}`,
            label : template.name,
            type : 'approval_template',
            originalId : template.id,
            approvalTypeId : approvalType.id,
            departmentId : dept.id,
            ...template
          } ) )
        }

        return typeNode
      } )
    }

    return deptNode
  } )
}

/**
 * Fetch approval tree from API
 */
const fetchApprovalTree = async() => {
  loading.value = true
  try {
    const response = await getApprovalTree()

    // Handle the response structure from the API
    let departments = []
    if ( Array.isArray( response.data ) ) {
      departments = response.data
    } else if ( response.data?.data && Array.isArray( response.data.data ) ) {
      departments = response.data.data
    }

    treeData.value = buildTree( departments )
  } catch ( error ) {
    console.error( 'Failed to fetch approval tree:', error )
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
    fetchApprovalTree()
  }, 300 )
} )

// Initial load
onMounted( () => {
  fetchApprovalTree()
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
  gap: 8px;
  min-width: 0;
}

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  cursor: pointer;
}

.tree-node-actions {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
}
</style>

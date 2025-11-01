<template>
  <div class="approval-designer">
    <!-- Show edit form when editing -->
    <editApprovalType
      v-if="isEditing"
      :approval-hierarchy-id="selectedApprovalId"
      @back="handleBackToList"
      @submit="handleEditSubmit"
      @cancel="handleBackToList"
    />

    <!-- Show normal view when not editing -->
    <div v-else>
      <!-- Show only title when no template is selected -->
      <div v-if="!approvalData.id" class="no-selection">
        <el-text size="large">{{ approvalData.title }}</el-text>
      </div>

      <!-- Show full details when template is selected -->
      <div v-else>
        <div class="approval-designer-header">
          <el-text size="large">{{ approvalData.title || 'Approval Hierarchy' }}</el-text>
          <el-dropdown class="kebab-dropdown" @click.stop>
            <el-icon class="kebab-icon">
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleEdit">Edit</el-dropdown-item>
                <el-dropdown-item divided @click="handleDelete">Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-divider></el-divider>
        <div class="approval-designer-info">
          <el-descriptions :column="2" direction="vertical">
            <el-descriptions-item label="Approval Type">{{ approvalData.approvalType }}</el-descriptions-item>
            <el-descriptions-item label="Title">{{ approvalData.title }}</el-descriptions-item>
            <el-descriptions-item label="Description" :span="2">
              {{ approvalData.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <el-divider></el-divider>
        <div class="approval-designer-steps">
          <el-steps :active="approvalData.approvalSteps.length" align-center>
            <el-step
              v-for="(step, index) in approvalData.approvalSteps"
              :key="step.id"
              :title="`Step ${index + 1}`"
              :description="getStepDescription(step)"
            />
          </el-steps>
        </div>
        <el-divider></el-divider>
        <div class="approval-designer-list">
          <approvalStepCard
            v-for="(step, index) in approvalData.approvalSteps"
            :key="step.id"
            :step-number="index + 1"
            :step-data="step"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import approvalStepCard from './components/approvalStepCard.vue'
import editApprovalType from './components/editApprovalType.vue'
import { MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getApprovalTemplateById } from '@/api/approval'
import { getRoleId } from '@/api/rbac'
import { getUserById } from '@/api/user'

const props = defineProps({
  selectedTemplateId: {
    type: [String, Number],
    default: null,
  },
})

const isEditing = ref(false)
const selectedApprovalId = ref(null)

// Cache for roles and users
const rolesCache = ref(new Map())
const usersCache = ref(new Map())

// Approval data
const approvalData = ref({
  id: 1,
  approvalType: 'Work Order',
  title: 'Work Order Approval Flow',
  description: 'This is a sample approval flow for work orders.',
  approvalSteps: [
    {
      id: 1,
      approverType: 'role',
      approverName: 'Team Lead',
      requiresApproval: true,
      approvalAmount: '1000',
    },
    {
      id: 2,
      approverType: 'individual',
      approverName: 'Jane Smith',
      requiresApproval: true,
      approvalAmount: '5000',
    },
    {
      id: 3,
      approverType: 'role',
      approverName: 'Director',
      requiresApproval: false,
      approvalAmount: '',
    },
  ],
})

/**
 * Get step description including approver name and threshold value
 */
const getStepDescription = step => {
  const approverName = step.approverName || 'No approver assigned'

  if (step.requiresApproval && step.approvalAmount) {
    return `${approverName} (≥ $${step.approvalAmount})`
  }

  return approverName
}

/**
 * Fetch and cache a role by ID
 */
const fetchRoleById = async roleId => {
  if (rolesCache.value.has(roleId)) {
    return rolesCache.value.get(roleId)
  }

  try {
    const response = await getRoleId(roleId)
    const role = response.data?.data || response.data || {}
    const roleName = role.name || role.roleName || `Role ID: ${roleId}`
    rolesCache.value.set(roleId, roleName)
    return roleName
  } catch (error) {
    console.error(`Failed to fetch role ${roleId}:`, error)
    return `Role ID: ${roleId}`
  }
}

/**
 * Fetch and cache a user by ID
 */
const fetchUserById = async userId => {
  if (usersCache.value.has(userId)) {
    return usersCache.value.get(userId)
  }

  try {
    const response = await getUserById(userId)
    const user = response.data?.data || response.data || {}
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `User ID: ${userId}`
    usersCache.value.set(userId, fullName)
    return fullName
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error)
    return `User ID: ${userId}`
  }
}

/**
 * Fetch approval template data by ID
 */
const fetchApprovalTemplate = async templateId => {
  if (!templateId) {
    // Reset to empty state if no template selected
    approvalData.value = {
      id: null,
      approvalType: '',
      title: 'Select an approval template',
      description: '',
      approvalSteps: [],
    }
    return
  }

  try {
    const response = await getApprovalTemplateById(templateId)
    console.log('Approval template data:', response)

    // Transform API response to match component structure
    const template = response.data?.data || response.data || {}

    // Fetch approver names for all steps
    const stepsWithNames = await Promise.all(
      (template.approval_steps || []).map(async (step, index) => {
        let approverName = 'N/A'

        if (step.type === 'role' && step.role_id) {
          approverName = await fetchRoleById(step.role_id)
        } else if (step.type === 'individual' && step.user_id) {
          approverName = await fetchUserById(step.user_id)
        }

        return {
          id: index + 1,
          approverType: step.type || 'N/A',
          approverName,
          requiresApproval: step.threshold !== null && step.threshold !== undefined,
          approvalAmount: step.threshold?.toString() || '',
        }
      })
    )

    approvalData.value = {
      id: template.id,
      approvalType: template.approval_type?.approval_type || 'N/A',
      title: template.name || 'Untitled',
      description: template.description || 'No description available',
      approvalSteps: stepsWithNames,
    }
  } catch (error) {
    console.error('Failed to fetch approval template:', error)
    ElMessage.error('Failed to load approval template')
  }
}

// Watch for changes in selectedTemplateId
watch(
  () => props.selectedTemplateId,
  (newId, oldId) => {
    console.log('Template ID changed from', oldId, 'to', newId)
    fetchApprovalTemplate(newId)
  },
  { immediate: true }
)

const handleEdit = () => {
  console.log('Edit clicked')
  selectedApprovalId.value = approvalData.value.id
  isEditing.value = true
  console.log('isEditing:', isEditing.value)
  console.log('selectedApprovalId:', selectedApprovalId.value)
}

const handleDelete = () => {
  console.log('Delete clicked')
  ElMessageBox.confirm('Are you sure you want to delete this approval hierarchy?', 'Confirm Delete', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(() => {
      // TODO: Call API to delete approval hierarchy
      ElMessage.success('Approval hierarchy deleted successfully')
    })
    .catch(() => {
      ElMessage.info('Delete cancelled')
    })
}

const handleBackToList = () => {
  isEditing.value = false
  selectedApprovalId.value = null
  // TODO: Reload approval data
}

const handleEditSubmit = formData => {
  console.log('Edit submitted:', formData)
  approvalData.value = formData
  handleBackToList()
}
</script>

<style scoped>
.approval-designer {
  flex: 0;
  display: flex-start;
  flex-direction: column;
  overflow-y: none;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #909399;
}

.approval-designer-header {
  flex: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.kebab-dropdown {
  flex-shrink: 0;
}
.kebab-icon {
  transform: rotate(90deg);
  cursor: pointer;
  border-radius: 4px;
  color: #409eff;
  font-size: 18px;
}
.approval-designer-info {
  flex: 0;
  display: flex-start;
  flex-direction: column;
  margin-bottom: 10px;
}
.approval-designer-steps {
  flex: 0;
  display: flex;
  flex-direction: column;
}
.approval-designer-list {
  flex: 0;
  display: flex;
  flex-direction: column;
}
</style>

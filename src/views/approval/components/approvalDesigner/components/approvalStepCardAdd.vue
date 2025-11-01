<template>
  <div class="approval-class-card">
    <div class="card-number">
      <div class="circle">{{ stepNumber }}</div>
    </div>
    <div class="card-info">
      <div class="card-column">
        <div class="card-field">
          <el-text class="field-label-approver">Approver Type:</el-text>
          <el-select
            v-model="localStepData.approverType"
            placeholder="Select type"
            size="small"
            style="width: 150px"
            @change="handleApproverTypeChange"
          >
            <el-option label="Role" value="role" />
            <el-option label="Individual" value="individual" />
          </el-select>
        </div>
        <div class="card-field">
          <el-text class="field-label-approver">
            {{
              localStepData.approverType === 'role'
                ? 'Role:'
                : localStepData.approverType === 'individual'
                ? 'Individual:'
                : 'Approver:'
            }}
          </el-text>
          <el-select
            v-model="localStepData.approverId"
            :placeholder="`Select ${localStepData.approverType || 'approver'}`"
            size="small"
            style="width: 150px"
            :disabled="!localStepData.approverType"
            @change="handleApproverChange"
          >
            <el-option v-for="option in approverOptions" :key="option.id" :label="option.name" :value="option.id" />
          </el-select>
        </div>
      </div>
      <div class="card-column">
        <div class="card-field">
          <el-text class="field-label-value">Requires Approval Starting At:</el-text>
          <el-checkbox v-model="localStepData.requiresApproval" @change="handleUpdate" />
        </div>
        <div class="card-field">
          <el-text class="field-label-value">Value:</el-text>
          <el-input
            v-model="localStepData.approvalAmount"
            :disabled="!localStepData.requiresApproval"
            placeholder="0"
            size="small"
            style="width: 80px"
            @input="handleUpdate"
          >
            <template #prefix>$</template>
          </el-input>
        </div>
      </div>
    </div>
    <div class="card-actions">
      <div class="move-buttons">
        <el-button type="primary" size="small" :icon="ArrowUp" circle :disabled="isFirst" @click="handleMoveUp" />
        <el-button type="primary" size="small" :icon="ArrowDown" circle :disabled="isLast" @click="handleMoveDown" />
        <el-button type="danger" size="small" :icon="Delete" circle @click="handleRemove" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { searchRoles } from '@/api/rbac'
import { searchUsers } from '@/api/user'

const props = defineProps({
  stepNumber: {
    type: Number,
    default: 1,
  },
  stepData: {
    type: Object,
    default: () => ({
      approverType: '',
      approverId: null,
      approverName: '',
      requiresApproval: false,
      approvalAmount: '',
    }),
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update', 'remove', 'move-up', 'move-down'])

// Local copy of step data for v-model binding
const localStepData = ref({
  approverType: props.stepData.approverType || '',
  approverId: props.stepData.approverId || null,
  approverName: props.stepData.approverName || '',
  requiresApproval: props.stepData.requiresApproval || false,
  approvalAmount: props.stepData.approvalAmount || '',
})

// Roles data from API
const roles = ref([])

// Individuals data from API
const individuals = ref([])

// Fetch roles from API
const fetchRoles = async () => {
  try {
    const response = await searchRoles({
      module: 'Maintenance',
      status_ids: [1],
    })

    // Extract roles from response
    const rolesData = response.data?.data?.content || response.data?.content || []
    roles.value = rolesData.map(role => ({
      id: role.id,
      name: role.name || role.roleName || 'Unknown Role',
    }))
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    roles.value = []
  }
}

// Fetch users from API
const fetchUsers = async () => {
  try {
    const response = await searchUsers({
      department_ids: [1],
    })

    // Extract users from response
    const usersData = response.data?.data?.content || response.data?.content || []
    individuals.value = usersData.map(user => ({
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown User',
    }))
  } catch (error) {
    console.error('Failed to fetch users:', error)
    individuals.value = []
  }
}

// Computed property for approver options based on type
const approverOptions = computed(() => {
  if (localStepData.value.approverType === 'role') {
    return roles.value
  } else if (localStepData.value.approverType === 'individual') {
    return individuals.value
  }
  return []
})

// Watch for prop changes (in case parent updates the data)
watch(
  () => props.stepData,
  newVal => {
    localStepData.value = {
      approverType: newVal.approverType || '',
      approverId: newVal.approverId || null,
      approverName: newVal.approverName || '',
      requiresApproval: newVal.requiresApproval || false,
      approvalAmount: newVal.approvalAmount || '',
    }
  },
  { deep: true }
)

// Handle approver type change
const handleApproverTypeChange = () => {
  // Reset approver selection when type changes
  localStepData.value.approverId = null
  localStepData.value.approverName = ''
  handleUpdate()
}

// Handle approver selection change
const handleApproverChange = () => {
  // Find the selected approver name
  const selectedApprover = approverOptions.value.find(option => option.id === localStepData.value.approverId)
  if (selectedApprover) {
    localStepData.value.approverName = selectedApprover.name
  }
  handleUpdate()
}

// Emit update to parent
const handleUpdate = () => {
  emit('update', localStepData.value)
}

// Emit remove event
const handleRemove = () => {
  emit('remove')
}

// Emit move up event
const handleMoveUp = () => {
  emit('move-up')
}

// Emit move down event
const handleMoveDown = () => {
  emit('move-down')
}

// Fetch roles and users on component mount
onMounted(() => {
  fetchRoles()
  fetchUsers()
})
</script>

<style scoped>
.approval-class-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin: 5px;
  width: 95%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  background-color: white;
}

.card-number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #409eff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.field-label-approver {
  white-space: nowrap;
  width: 100px;
}

.field-label-value {
  white-space: nowrap;
  width: 190px;
}

.card-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.move-buttons {
  display: flex;
  flex-direction: row;
}
</style>

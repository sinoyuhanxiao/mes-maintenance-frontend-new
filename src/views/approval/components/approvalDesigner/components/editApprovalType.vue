<template>
  <div class="approval-designer">
    <div class="approval-designer-header">
      <el-button :icon="ArrowLeft" @click="handleBack">Back</el-button>
      <el-text size="large">Edit Approval Hierarchy</el-text>
      <div></div>
    </div>
    <el-divider></el-divider>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" label-position="top">
      <div class="approval-designer-info">
        <el-form-item label="Department" prop="departmentId">
          <el-input v-model="formData.departmentName" disabled placeholder="Department name" />
        </el-form-item>

        <el-form-item label="Approval Type" prop="approvalType">
          <el-input
            v-model="formData.approvalType"
            placeholder="Enter approval type (e.g., Work Order, Purchase Request)"
          />
        </el-form-item>

        <el-form-item label="Title" prop="title">
          <el-input v-model="formData.title" placeholder="Enter approval flow title" />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="Enter description" />
        </el-form-item>
      </div>

      <el-divider></el-divider>

      <div class="approval-designer-steps">
        <div class="steps-header">
          <el-text size="default" style="font-weight: 500">Approval Steps</el-text>
          <el-button type="primary" size="small" @click="addApprovalStep"> Add Step </el-button>
        </div>

        <!-- Live Preview -->
        <div v-if="formData.approvalSteps.length > 0" class="steps-preview">
          <el-steps :key="stepsKey" :active="activeStepIndex" align-center>
            <el-step
              v-for="(step, index) in formData.approvalSteps"
              :key="step.id"
              :title="`Step ${index + 1}`"
              :description="step.approvingRole || 'No role assigned'"
            />
          </el-steps>
        </div>

        <div class="approval-designer-list">
          <approvalStepCard
            v-for="(step, index) in formData.approvalSteps"
            :key="step.id"
            :step-number="index + 1"
            :step-data="step"
            :is-first="index === 0"
            :is-last="index === formData.approvalSteps.length - 1"
            @update="updateStep(index, $event)"
            @remove="removeStep(index)"
            @move-up="moveStepUp(index)"
            @move-down="moveStepDown(index)"
          />

          <el-empty
            v-if="formData.approvalSteps.length === 0"
            description="No approval steps added yet"
            :image-size="100"
          />
        </div>
      </div>

      <el-divider></el-divider>

      <div class="approval-designer-actions">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit"> Update Approval Hierarchy </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import approvalStepCard from './approvalStepCardAdd.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  approvalHierarchyId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['back', 'submit', 'cancel'])

// Form reference
const formRef = ref(null)

// Steps key for forcing re-render
const stepsKey = ref(0)

// Loading state
const loading = ref(false)

// Form data
const formData = reactive({
  id: null,
  departmentId: null,
  departmentName: '',
  approvalType: '',
  title: '',
  description: '',
  approvalSteps: [],
})

// Form validation rules
const formRules = {
  departmentId: [{ required: true, message: 'Please select a department', trigger: 'change' }],
  approvalType: [
    { required: true, message: 'Please enter approval type', trigger: 'blur' },
    { min: 2, max: 50, message: 'Approval type should be between 2 and 50 characters', trigger: 'blur' },
  ],
  title: [
    { required: true, message: 'Please enter a title', trigger: 'blur' },
    { min: 3, max: 100, message: 'Title should be between 3 and 100 characters', trigger: 'blur' },
  ],
  description: [{ max: 500, message: 'Description should not exceed 500 characters', trigger: 'blur' }],
}

// Computed property for active step
const activeStepIndex = computed(() => {
  return formData.approvalSteps.length
})

// Step counter for unique IDs
let stepIdCounter = 0

// Load existing approval hierarchy data
const loadApprovalHierarchy = async () => {
  loading.value = true
  try {
    // Mock data for now
    const data = {
      id: props.approvalHierarchyId,
      departmentId: 1,
      departmentName: 'Engineering Department',
      approvalType: 'Work Order',
      title: 'Work Order Approval Flow',
      description: 'This is a sample approval flow for work orders.',
      approvalSteps: [
        {
          id: 1,
          stepName: 'Step 1',
          approverType: 'role',
          approverId: 1,
          approverName: 'Team Lead',
          requiresApproval: true,
          approvalAmount: '1000',
          description: 'Team lead approval',
        },
        {
          id: 2,
          stepName: 'Step 2',
          approverType: 'individual',
          approverId: 102,
          approverName: 'Jane Smith',
          requiresApproval: true,
          approvalAmount: '5000',
          description: 'Manager approval',
        },
      ],
    }

    // Populate form data
    formData.id = data.id
    formData.departmentId = data.departmentId
    formData.departmentName = data.departmentName
    formData.approvalType = data.approvalType
    formData.title = data.title
    formData.description = data.description
    formData.approvalSteps = data.approvalSteps

    // Set counter to highest ID
    stepIdCounter = Math.max(...data.approvalSteps.map(s => s.id), 0)
  } catch (error) {
    console.error('Failed to load approval hierarchy:', error)
    ElMessage.error('Failed to load approval hierarchy data')
  } finally {
    loading.value = false
  }
}

// Add a new approval step
const addApprovalStep = () => {
  formData.approvalSteps.push({
    id: ++stepIdCounter,
    stepName: `Step ${formData.approvalSteps.length + 1}`,
    approverType: '',
    approverId: null,
    approverName: '',
    requiresApproval: false,
    approvalAmount: '',
    description: '',
  })
  stepsKey.value++
}
// Update a step
const updateStep = (index, updatedData) => {
  formData.approvalSteps[index] = { ...formData.approvalSteps[index], ...updatedData }
  stepsKey.value++
}

// Remove a step
const removeStep = index => {
  formData.approvalSteps.splice(index, 1)
  stepsKey.value++
}

// Move step up
const moveStepUp = index => {
  if (index > 0) {
    const temp = formData.approvalSteps[index]
    formData.approvalSteps[index] = formData.approvalSteps[index - 1]
    formData.approvalSteps[index - 1] = temp
    stepsKey.value++
  }
}

// Move step down
const moveStepDown = index => {
  if (index < formData.approvalSteps.length - 1) {
    const temp = formData.approvalSteps[index]
    formData.approvalSteps[index] = formData.approvalSteps[index + 1]
    formData.approvalSteps[index + 1] = temp
    stepsKey.value++
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (formData.approvalSteps.length === 0) {
      ElMessage.warning('Please add at least one approval step')
      return
    }

    // TODO: Call API to update approval hierarchy
    // await updateApprovalHierarchy(formData.id, formData)

    // Emit the form data to parent component
    emit('submit', formData)

    ElMessage.success('Approval hierarchy updated successfully')
  } catch (error) {
    ElMessage.error('Please fill in all required fields')
  }
}

// Handle cancel
const handleCancel = () => {
  emit('cancel')
}

// Handle back button
const handleBack = () => {
  emit('back')
}

// Load data on mount
onMounted(() => {
  loadApprovalHierarchy()
})
</script>

<style scoped>
.approval-designer {
  display: flex;
  flex-direction: column;
}

.approval-designer-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 20px;
}

.approval-designer-info {
  display: flex;
  flex-direction: column;
}

.approval-designer-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.steps-preview {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
}

.approval-designer-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
}

.approval-designer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>

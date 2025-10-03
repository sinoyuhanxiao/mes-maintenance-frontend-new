<template>
  <div class="approval-designer">
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
          <el-steps :active="formData.approvalSteps.length" align-center>
            <el-step
              v-for="(step, index) in formData.approvalSteps"
              :key="step.id"
              :title="step.stepName || `Step ${index + 1}`"
              :description="step.description || 'No description'"
            />
          </el-steps>
        </div>

        <div class="approval-designer-list">
          <approvalStepCard
            v-for="(step, index) in formData.approvalSteps"
            :key="step.id"
            :step-number="index + 1"
            :step-data="step"
            :is-edit-mode="true"
            @update="updateStep(index, $event)"
            @remove="removeStep(index)"
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
        <el-button type="primary" @click="handleSubmit"> Create Approval Hierarchy </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import approvalStepCard from './approvalStepCardAdd.vue'
import { ElMessage } from 'element-plus'

const props = defineProps( {
  selectedDepartmentId : {
    type : [String, Number],
    default : null
  }
} )

const emit = defineEmits( ['submit', 'cancel'] )

// Form reference
const formRef = ref( null )

// Form data
const formData = reactive( {
  departmentId : props.selectedDepartmentId || null,
  approvalType : '',
  title : '',
  description : '',
  approvalSteps : []
} )

// Form validation rules
const formRules = {
  departmentId : [{ required : true, message : 'Please select a department', trigger : 'change' }],
  approvalType : [{ required : true, message : 'Please select approval type', trigger : 'change' }],
  title : [
    { required : true, message : 'Please enter a title', trigger : 'blur' },
    { min : 3, max : 100, message : 'Title should be between 3 and 100 characters', trigger : 'blur' }
  ],
  description : [{ max : 500, message : 'Description should not exceed 500 characters', trigger : 'blur' }]
}

// Step counter for unique IDs
let stepIdCounter = 0

// Add a new approval step
const addApprovalStep = () => {
  formData.approvalSteps.push( {
    id : ++stepIdCounter,
    stepName : `Step ${formData.approvalSteps.length + 1}`,
    approver : null,
    approverType : 'user', // 'user', 'role', 'group'
    description : '',
    isOptional : false,
    timeoutDays : null
  } )
}

// Update a step
const updateStep = ( index, updatedData ) => {
  formData.approvalSteps[index] = { ...formData.approvalSteps[index], ...updatedData }
}

// Remove a step
const removeStep = index => {
  formData.approvalSteps.splice( index, 1 )
}

// Handle form submission
const handleSubmit = async() => {
  try {
    await formRef.value.validate()

    if ( formData.approvalSteps.length === 0 ) {
      ElMessage.warning( 'Please add at least one approval step' )
      return
    }

    // Emit the form data to parent component
    emit( 'submit', formData )

    ElMessage.success( 'Approval hierarchy created successfully' )
  } catch ( error ) {
    ElMessage.error( 'Please fill in all required fields' )
  }
}

// Handle cancel
const handleCancel = () => {
  emit( 'cancel' )
}
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

<template>
  <div class="approval-designer">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" label-position="top">
      <div class="approval-designer-info">
        <el-form-item label="Department">
          <el-input :value="approvalTypeInfo.departmentName || 'N/A'" disabled />
        </el-form-item>

        <el-form-item label="Approval Type">
          <el-input :value="approvalTypeInfo.approvalType || 'N/A'" disabled />
        </el-form-item>

        <el-form-item label="Template Name" prop="title">
          <el-input v-model="formData.title" placeholder="Enter approval template name" />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Enter description (optional)"
          />
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
              :description="getStepDescription(step)"
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
        <el-button type="primary" @click="handleSubmit"> Create Approval Template </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import approvalStepCard from './approvalStepCardAdd.vue'
import { ElMessage } from 'element-plus'
import { createApprovalTemplate } from '@/api/approval'

const props = defineProps( {
  selectedApprovalTypeId : {
    type : [String, Number],
    default : null
  },
  approvalTypeInfo : {
    type : Object,
    default : () => ( {} )
  }
} )

const emit = defineEmits( ['submit', 'cancel'] )

// Form reference
const formRef = ref( null )

// Steps key for forcing re-render
const stepsKey = ref( 0 )

// Form data
const formData = reactive( {
  approvalTypeId : props.selectedApprovalTypeId || null,
  title : '',
  description : '',
  approvalSteps : []
} )

// Form validation rules
const formRules = {
  title : [
    { required : true, message : 'Please enter a template name', trigger : 'blur' },
    { min : 3, max : 100, message : 'Template name should be between 3 and 100 characters', trigger : 'blur' }
  ],
  description : [{ max : 500, message : 'Description should not exceed 500 characters', trigger : 'blur' }]
}

// Computed property for active step
const activeStepIndex = computed( () => {
  return formData.approvalSteps.length
} )

// Get step description including approver name and threshold value
const getStepDescription = step => {
  const approverName = step.approverName || 'No approver assigned'

  if ( step.requiresApproval && step.approvalAmount ) {
    return `${approverName} (≥ $${step.approvalAmount})`
  }

  return approverName
}

// Step counter for unique IDs
let stepIdCounter = 0

const addApprovalStep = () => {
  formData.approvalSteps.push( {
    id : ++stepIdCounter,
    stepName : `Step ${formData.approvalSteps.length + 1}`,
    approverType : '',
    approverId : null,
    approverName : '',
    requiresApproval : false,
    approvalAmount : '',
    description : ''
  } )
  stepsKey.value++
}

// Update a step
const updateStep = ( index, updatedData ) => {
  formData.approvalSteps[index] = { ...formData.approvalSteps[index], ...updatedData }
  stepsKey.value++
}

// Remove a step
const removeStep = index => {
  formData.approvalSteps.splice( index, 1 )
  stepsKey.value++
}

// Move step up
const moveStepUp = index => {
  if ( index > 0 ) {
    const temp = formData.approvalSteps[index]
    formData.approvalSteps[index] = formData.approvalSteps[index - 1]
    formData.approvalSteps[index - 1] = temp
    stepsKey.value++
  }
}

// Move step down
const moveStepDown = index => {
  if ( index < formData.approvalSteps.length - 1 ) {
    const temp = formData.approvalSteps[index]
    formData.approvalSteps[index] = formData.approvalSteps[index + 1]
    formData.approvalSteps[index + 1] = temp
    stepsKey.value++
  }
}

// Handle form submission
const handleSubmit = async() => {
  try {
    await formRef.value.validate()

    if ( formData.approvalSteps.length === 0 ) {
      ElMessage.warning( 'Please add at least one approval step' )
      return
    }

    // Transform form data to API format
    const requestBody = {
      name : formData.title,
      description : formData.description || '',
      approval_type_id : formData.approvalTypeId,
      approval_steps : formData.approvalSteps.map( ( step, index ) => ( {
        sequence : index + 1,
        type : step.approverType, // 'role' or 'individual'
        role_id : step.approverType === 'role' ? step.approverId : null,
        user_id : step.approverType === 'individual' ? step.approverId : null,
        threshold : step.requiresApproval && step.approvalAmount ? Number( step.approvalAmount ) : null,
        approved : false,
        signature : ''
      } ) )
    }

    console.log( 'Submitting approval template:', requestBody )

    // Call the API
    const response = await createApprovalTemplate( requestBody )
    console.log( 'API Response:', response )

    ElMessage.success( 'Approval template created successfully' )

    // Emit success to parent component
    emit( 'submit', response.data )
  } catch ( error ) {
    console.error( 'Failed to create approval template:', error )
    ElMessage.error( error.message || 'Failed to create approval template' )
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

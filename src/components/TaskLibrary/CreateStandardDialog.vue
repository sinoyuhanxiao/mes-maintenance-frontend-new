<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    :title="isEditMode ? 'Edit Standard' : 'Create Standard'"
    width="600px"
    :before-close="handleFormCancel"
  >
    <el-form :model="formData" :rules="formRules" ref="standardForm" label-width="100px" style="margin-right: 16px">
      <el-form-item label="Title" prop="name">
        <el-input v-model="formData.name" placeholder="Enter standard title" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="Enter detailed description of the standard"
        />
      </el-form-item>
      <el-form-item label="Category" prop="category">
        <el-select v-model="formData.category" placeholder="Select a category" style="width: 100%">
          <el-option label="Food Safety" value="food-safety" />
          <el-option label="General" value="general" />
        </el-select>
      </el-form-item>

      <!-- Rules Management Section -->
      <el-form-item label="Rules" v-if="formData.items && formData.items.length > 0">
        <div class="dialog-rules-section" style="width: 100%">
          <div class="dialog-rules-list">
            <div class="dialog-rules-container">
              <div v-for="(rule, index) in formData.items" :key="index" class="rule-item">
                <div class="rule-number">{{ index + 1 }}</div>
                <div class="rule-content">
                  <div class="rule-text" v-if="editingRuleIndex === null || editingRuleIndex !== index">
                    {{ rule }}
                  </div>
                  <el-input
                    v-else
                    v-model="editingRuleText"
                    @keyup.enter="saveRuleInForm(index)"
                    placeholder="Enter rule text"
                    autosize
                  />
                </div>
                <div class="rule-actions">
                  <template v-if="editingRuleIndex === index">
                    <el-button type="text" size="default" @click="saveRuleInForm(index)" title="Save">
                      <el-icon><Check /></el-icon>
                    </el-button>
                    <el-button type="text" size="default" @click="cancelRuleEditInForm" title="Cancel">
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button type="text" size="default" @click="editRuleInForm(index, rule)" title="Edit">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      type="text"
                      size="default"
                      @click="deleteRuleFromForm(index)"
                      title="Delete"
                      class="delete-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- Always visible Add Rule Button -->
      <el-form-item>
        <el-button type="primary" size="default" @click="addNewRuleToForm" plain>
          <el-icon><Plus /></el-icon>
          Rule
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleFormCancel">Cancel</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="loading" :disabled="!isFormValid">
          {{ isEditMode ? 'Update' : 'Create' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Plus, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps( {
  visible : {
    type : Boolean,
    default : false
  },
  isEditMode : {
    type : Boolean,
    default : false
  },
  initialData : {
    type : Object,
    default : () => ( {
      name : '',
      description : '',
      category : '',
      items : []
    } )
  },
  loading : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['close', 'submit'] )

// Form state
const standardForm = ref( null )
const isFormValid = ref( false )
const formData = ref( {
  name : '',
  description : '',
  category : '',
  items : []
} )

// Rule editing state
const editingRuleIndex = ref( null )
const editingRuleText = ref( '' )

// Form validation rules
const formRules = {
  name : [
    { required : true, message : 'Please enter standard title', trigger : 'blur' },
    { min : 2, max : 100, message : 'Title should be between 2 and 100 characters', trigger : 'blur' }
  ],
  category : [{ required : true, message : 'Please choose a category', trigger : 'blur' }]
}

// Helper function to reset form data
const resetFormData = () => {
  formData.value.name = props.initialData?.name || ''
  formData.value.description = props.initialData?.description || ''
  formData.value.category = props.initialData?.category || ''
  formData.value.items = props.initialData?.items ? [...props.initialData.items] : []
}

// Watch for prop changes
watch(
  () => props.visible,
  newValue => {
    if (newValue) {
      // Reset form data when dialog opens
      resetFormData()
      editingRuleIndex.value = null
      editingRuleText.value = ''

      // Reset validation on open for new forms
      nextTick(() => {
        standardForm.value?.clearValidate()
      })
    }
  },
  { immediate: true }
)


// Watch for form changes to validate
watch(
  formData,
  () => {
    // Simple validation - check required fields
    isFormValid.value = !!( formData.value.name?.trim() && formData.value.category )
  },
  { deep : true, immediate : true }
)

// Dialog event handlers
const handleClose = value => {
  if ( !value ) {
    handleFormCancel()
  }
}

const handleFormCancel = () => {
  formData.value = {
    name : '',
    description : '',
    category : '',
    items : []
  }
  editingRuleIndex.value = null
  editingRuleText.value = ''
  emit( 'close' )
}

const handleFormSubmit = async() => {
  if ( !standardForm.value ) return

  try {
    const valid = await standardForm.value.validate()
    if ( valid ) {
      console.log( 'Dialog submitting formData:', formData.value )
      emit( 'submit', { ...formData.value } )
    }
  } catch ( error ) {
    console.error( 'Validation failed:', error )
  }
}

// Rule management functions
const addNewRuleToForm = () => {
  // If there's a rule being edited, check if it has unsaved text
  if ( editingRuleIndex.value !== null ) {
    // Check if the editing rule has text that needs to be saved
    if ( editingRuleText.value && editingRuleText.value.trim() !== '' ) {
      // Auto-save the current rule before adding a new one
      saveRuleInForm( editingRuleIndex.value )
    } else {
      // If current rule is empty, just return without adding new rule
      return
    }
  }

  editingRuleIndex.value = formData.value.items.length
  editingRuleText.value = ''
  formData.value.items.push( '' )
}

const editRuleInForm = ( index, rule ) => {
  editingRuleIndex.value = index
  editingRuleText.value = rule
}

const cancelRuleEditInForm = () => {
  if ( editingRuleIndex.value === null ) return

  const isEmptyRule = formData.value.items[editingRuleIndex.value] === ''

  if ( isEmptyRule ) {
    // Remove empty rule completely
    formData.value.items.splice( editingRuleIndex.value, 1 )
  }

  editingRuleIndex.value = null
  editingRuleText.value = ''
}

const saveRuleInForm = index => {
  if ( editingRuleText.value.trim() === '' ) {
    // Remove empty rule completely
    formData.value.items.splice( index, 1 )
    editingRuleIndex.value = null
    editingRuleText.value = ''
    return
  }

  formData.value.items[index] = editingRuleText.value.trim()
  editingRuleIndex.value = null
  editingRuleText.value = ''
}

const deleteRuleFromForm = async index => {
  try {
    await ElMessageBox.confirm( 'Are you sure you want to delete this rule?', 'Confirm Deletion', {
      confirmButtonText : 'Delete',
      cancelButtonText : 'Cancel',
      type : 'warning'
    } )

    formData.value.items.splice( index, 1 )
  } catch ( error ) {
    // User cancelled, do nothing
  }
}

defineOptions( {
  name : 'CreateStandardDialog'
} )
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Dialog Rules Section Styles (matching StandardsLibraryView exactly)
.dialog-rules-section {
  max-height: 300px;
  overflow-y: auto;
}

.dialog-rules-list {
  padding: 0px;
}

.dialog-rules-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-rules-section .rule-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  transition: all 0.3s ease;
}

.dialog-rules-section .rule-item:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.dialog-rules-section .rule-number {
  width: 20px;
  height: 20px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.dialog-rules-section .rule-content {
  flex: 1;
  margin-right: 8px;
  max-width: 70%;
}

.dialog-rules-section .rule-text {
  color: #303133;
  line-height: 1.5;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-rules-section .rule-actions {
  display: flex;
  gap: 2px;
}

.dialog-rules-section::-webkit-scrollbar {
  width: 6px;
}

.dialog-rules-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-rules-section::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-rules-section::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #f78989;
}

:deep(.el-form-item--default) {
  margin-bottom: 20px !important;
}

:deep(.rule-content > .el-input > .el-input__wrapper) {
  border: 0;
}
</style>

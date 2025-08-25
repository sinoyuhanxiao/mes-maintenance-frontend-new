<template>
  <div
    class="base-step-card"
    :class="{
      focused: isFocused,
      required: localStep.required,
      [`step-type-${localStep.type}`]: true,
    }"
    :data-step-id="step.step_id"
    @click="$emit('focus', step.step_id)"
  >
    <!-- Step Header -->
    <div class="step-header">
      <div class="step-number">{{ stepIndex + 1 }}</div>
      <div class="step-info">
        <div class="step-type-badge">
          {{ getStepTypeLabel(localStep.type) }}
        </div>
      </div>
      <div class="step-actions">
        <el-dropdown trigger="click" @command="handleAction" @click.stop>
          <el-button type="text" size="small" class="action-button">
            <el-icon class="dropdown-icon"><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="description">
                <el-icon><Edit /></el-icon>
                {{ (showDescriptionEdit || localStep.description) ? 'Remove Description' : 'Add Description' }}
              </el-dropdown-item>
              <el-dropdown-item command="preview">
                <el-icon><View /></el-icon>
                {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
              </el-dropdown-item>
              <el-dropdown-item command="tools">
                <el-icon><Tools /></el-icon>
                Tools
              </el-dropdown-item>
              <el-dropdown-item command="resources">
                <el-icon><Folder /></el-icon>
                Resources
              </el-dropdown-item>
              <el-dropdown-item command="duplicate" divided>
                <el-icon><DocumentCopy /></el-icon>
                Duplicate
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Step Label -->
      <div class="step-label-section">
        <el-input
          v-model="localStep.label"
          placeholder="Enter step label"
          @input="handleLabelChange"
          @blur="saveChanges"
          class="step-label-input"
        />
        <el-select
          v-model="localStep.type"
          placeholder="Select type"
          @change="handleTypeChange"
          class="step-type-dropdown"
        >
          <el-option
            v-for="stepType in stepTypes"
            :key="stepType.type"
            :label="stepType.name"
            :value="stepType.type"
          >
            <div class="type-option">
              <div class="type-option-color" :style="{ backgroundColor: stepType.color }"></div>
              <span class="type-option-name">{{ stepType.name }}</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- Step Description (only show when editing or has content) -->
      <div v-if="showDescriptionEdit || localStep.description" class="step-description-section">
        <el-input
          v-model="localStep.description"
          type="textarea"
          :rows="2"
          placeholder="Add step description (optional)"
          @input="handleDescriptionChange"
          @blur="handleDescriptionBlur"
          class="step-description-input"
        />
      </div>

      <!-- Step Configuration Preview -->
      <div v-if="showPreview" class="step-config-preview">
        <!-- Step Component Preview -->
        <div class="step-preview-container">
          <component
            :is="getStepComponent(localStep.type)"
            :step="localStep"
            :preview-mode="true"
            @update="handleStepUpdate"
          />

          <!-- Upload Image Button (always visible) -->
          <div class="upload-image-section">
            <el-button type="info" size="small" disabled>
              <span v-if="localStep.required_image" class="required-asterisk">*</span>
              <el-icon><Upload /></el-icon>
              Upload Image
            </el-button>
          </div>
        </div>
      </div>

      <!-- Step Options -->
      <div class="step-options">
        <div class="checkbox-group">
          <el-checkbox v-model="localStep.required" @change="handleRequiredChange"> Required step </el-checkbox>
          <el-checkbox v-model="localStep.required_image" @change="handleRequiredImageChange"> Required image </el-checkbox>
        </div>

        <div class="step-meta">
          <el-button
            v-if="localStep.relevant_tools?.length > 0"
            type="info"
            size="small"
            plain
            @click.stop="handleAction('tools')"
            class="meta-button"
          >
            <el-icon><Tools /></el-icon>
            {{ localStep.relevant_tools.length }} tool(s)
          </el-button>
          <el-button
            v-if="localStep.relevant_resources?.length > 0"
            type="warning"
            size="small"
            plain
            @click.stop="handleAction('resources')"
            class="meta-button"
          >
            <el-icon><Folder /></el-icon>
            {{ localStep.relevant_resources.length }} resource(s)
          </el-button>
        </div>
      </div>
    </div>

    <!-- Drag Handle -->
    <div class="drag-handle">
      <el-icon><Rank /></el-icon>
    </div>

    <!-- Delete Button -->
    <div class="delete-button" @click.stop="emit('delete', step.step_id)">
      <el-icon><Delete /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { MoreFilled, Setting, Tools, Folder, DocumentCopy, Delete, Rank, Edit, View, Upload } from '@element-plus/icons-vue'

// Import step type components (we'll create these later)
import InspectionStepPreview from './InspectionStepPreview.vue'
import CheckboxStepPreview from './CheckboxStepPreview.vue'
import NumberStepPreview from './NumberStepPreview.vue'
import TextStepPreview from './TextStepPreview.vue'
import AttachmentStepPreview from './AttachmentStepPreview.vue'

const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  stepIndex : {
    type : Number,
    required : true
  },
  isFocused : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['focus', 'update', 'delete', 'configure', 'duplicate'] )

// Local reactive copy of step for editing
const localStep = reactive( { ...props.step } )
const showDescriptionEdit = ref( false )
const showPreview = ref( false )

// Step types for dropdown
const stepTypes = [
  {
    type: 'inspection',
    name: 'Inspection',
    color: '#67c23a'
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    color: '#409eff'
  },
  {
    type: 'number',
    name: 'Number',
    color: '#e6a23c'
  },
  {
    type: 'text',
    name: 'Text',
    color: '#909399'
  },
  {
    type: 'attachments',
    name: 'Files',
    color: '#93a7f0'
  }
]

// Watch for external changes to step
watch(
  () => props.step,
  newStep => {
    Object.assign( localStep, newStep )
  },
  { deep : true }
)

// Event handlers
const handleAction = command => {
  switch ( command ) {
    case 'description':
      if (showDescriptionEdit.value || localStep.description) {
        // Remove description
        localStep.description = ''
        showDescriptionEdit.value = false
        saveChanges()
      } else {
        // Add description
        showDescriptionEdit.value = true
      }
      break
    case 'preview':
      showPreview.value = !showPreview.value
      break
    case 'tools':
      emit( 'configure', props.step.step_id, 'tools' )
      break
    case 'resources':
      emit( 'configure', props.step.step_id, 'resources' )
      break
    case 'duplicate':
      emit( 'duplicate', props.step.step_id )
      break
  }
}

const handleLabelChange = () => {
  // Debounced update will be handled in saveChanges
}

const handleDescriptionChange = () => {
  // Debounced update will be handled in saveChanges
}

const handleDescriptionBlur = () => {
  saveChanges()
  if ( !localStep.description ) {
    showDescriptionEdit.value = false
  }
}

const handleRequiredChange = () => {
  saveChanges()
}

const handleRequiredImageChange = () => {
  saveChanges()
}

const handleStepUpdate = updates => {
  Object.assign( localStep, updates )
  saveChanges()
}

const handleTypeChange = (newType) => {
  const oldType = localStep.type

  if (oldType === newType) return

  // Preserve basic properties that work across all types
  const preservedData = {
    step_id: localStep.step_id,
    label: localStep.label,
    description: localStep.description,
    required: localStep.required,
    required_image: localStep.required_image,
    relevant_tools: localStep.relevant_tools,
    relevant_resources: localStep.relevant_resources,
    type: newType
  }

  // Reset type-specific config but preserve what makes sense
  const baseConfig = {}

  // Try to preserve some compatible configurations
  if (localStep.config) {
    // Preserve common configs that might work across types
    if (localStep.config.default && (newType === 'text' || newType === 'number')) {
      baseConfig.default = localStep.config.default
    }
  }

  // Update the local step
  Object.assign(localStep, {
    ...preservedData,
    config: baseConfig
  })

  // Save changes immediately
  saveChanges()
}

const saveChanges = () => {
  emit( 'update', props.step.step_id, { ...localStep } )
}

// Helper functions
const getStepTypeLabel = type => {
  const labels = {
    inspection : 'Inspection',
    checkbox : 'Checkbox',
    number : 'Number',
    text : 'Text',
    attachments : 'Files'
  }
  return labels[type] || type
}

const getStepTypeColor = type => {
  const colors = {
    inspection : '#67c23a',
    checkbox : '#409eff',
    number : '#e6a23c',
    text : '#909399',
    attachments : '#93a7f0'
  }
  return colors[type] || '#c0c4cc'
}

const getStepComponent = type => {
  const components = {
    inspection : InspectionStepPreview,
    checkbox : CheckboxStepPreview,
    number : NumberStepPreview,
    text : TextStepPreview,
    attachments : AttachmentStepPreview
  }
  return components[type] || 'div'
}
</script>

<style scoped>
.base-step-card {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.base-step-card:hover {
  border: 2px solid var(--step-type-color);
  box-shadow: 0 2px 8px rgba(var(--step-type-color-rgb), 0.1);
}

.base-step-card.focused {
  border: 2px solid var(--step-type-color);
  box-shadow: 0 4px 12px rgba(var(--step-type-color-rgb), 0.15);
  background: rgba(var(--step-type-color-rgb), 0.03);
}

.base-step-card.required {
  //border-left: 4px solid #f56c6c;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: white;
  color: var(--step-type-color);
  border-radius: 50%;
  border: 2px solid var(--step-type-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-type-badge {
  color: var(--step-type-color);
  background-color: white;
  padding: 2px 0px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
}

.step-actions {
  flex-shrink: 0;
}

.action-button {
  padding: 4px;
  color: #909399;
}

.action-button:hover {
  color: #409eff;
}

.dropdown-icon {
  transform: rotate(90deg);
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-label-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.step-label-section .step-label-input {
  flex: 1;
  font-weight: 500;
}

.step-label-section .step-label-input :deep(.el-input__inner) {
  font-weight: 500;
  font-size: 16px;
}

.step-label-section .step-label-input :deep(.el-input__wrapper) {
  transition: border-color 0.2s ease;
}

.step-label-section .step-label-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-label-section .step-type-dropdown {
  flex: 1;
  min-width: 0;
}

.step-label-section .step-type-dropdown :deep(.el-select__wrapper) {
  transition: border-color 0.2s ease;
}

.step-label-section .step-type-dropdown :deep(.el-select__wrapper.is-focused) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-description-section .step-description-input :deep(.el-textarea__inner) {
  transition: border-color 0.2s ease;
}

.step-description-section .step-description-input :deep(.el-textarea__inner:focus) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-config-preview {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.step-preview-container {
  position: relative;
}

.upload-image-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}

.upload-image-section .required-asterisk {
  color: #f56c6c;
  font-weight: 600;
  margin-right: 2px;
}

.step-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.checkbox-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* Checkbox styling to match step type colors */
.checkbox-group :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--step-type-color);
  border-color: var(--step-type-color);
}

.checkbox-group :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--step-type-color);
}

.checkbox-group :deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  border-color: var(--step-type-color);
}

.step-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meta-button {
  height: 24px;
  font-size: 11px;
  padding: 0 8px;
}

.meta-button .el-icon {
  margin-right: 4px;
}

.drag-handle {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  color: #c0c4cc;
  cursor: grab;
  padding: 4px;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.base-step-card:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  color: var(--step-type-color, var(--el-color-primary));
}

.drag-handle:active {
  cursor: grabbing;
  color: var(--step-type-color, var(--el-color-primary));
}

.delete-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  font-size: 14px;
}

.delete-button:hover {
  color: var(--el-color-danger);
  transform: scale(1.1);
}

/* Step type specific styling */
.step-type-inspection {
  --step-type-color: #67c23a;
  --step-type-color-rgb: 103, 194, 58;
  border-left: 2px solid var(--step-type-color);
}

.step-type-checkbox {
  --step-type-color: #409eff;
  --step-type-color-rgb: 64, 158, 255;
  border-left: 2px solid var(--step-type-color);
}

.step-type-number {
  --step-type-color: #e6a23c;
  --step-type-color-rgb: 230, 162, 60;
  border-left: 2px solid var(--step-type-color);
}

.step-type-text {
  --step-type-color: #909399;
  --step-type-color-rgb: 144, 147, 153;
  border-left: 2px solid var(--step-type-color);
}

.step-type-attachments {
  --step-type-color: #93a7f0;
  --step-type-color-rgb: 172, 136, 252;
  border-left: 2px solid var(--step-type-color);
}

/* Custom dropdown option styling */
.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.type-option-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-option-name {
  font-size: 14px;
  font-weight: 500;
}
</style>

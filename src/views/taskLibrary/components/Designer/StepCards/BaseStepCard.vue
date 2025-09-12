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
          <el-button type="text" size="medium" class="action-button">
            <el-icon class="dropdown-icon"><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="description">
                <el-icon><Edit /></el-icon>
                {{ showDescriptionEdit || localStep.description ? 'Remove Description' : 'Add Description' }}
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
              <el-dropdown-item v-if="localStep.type === 'number'" command="limitations">
                <el-icon><Setting /></el-icon>
                {{ hasLimitations ? 'Remove Range' : 'Add Range' }}
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
            :disabled="stepType.disabled"
          >
            <div class="type-option">
              <div class="type-option-color" :style="{ backgroundColor: stepType.color }"></div>
              <span class="type-option-name">{{ stepType.name }}</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- Number Limitations Section (only for number type) -->
      <div v-if="localStep.type === 'number' && hasLimitations" class="step-limitations-section">
        <div class="limitations-content">
          <el-icon><Setting /></el-icon>
          <span class="limitations-text">Range: {{ getLimitationsText() }}</span>
          <el-button
            type="text"
            size="default"
            @click.stop="emit('configure', props.step.step_id, 'limits')"
            class="edit-limitations-btn"
          >
            Edit
          </el-button>
        </div>
      </div>

      <!-- Service Configuration Section (only for service type) -->
      <div v-if="localStep.type === 'service'" class="step-service-section">
        <el-select
          :model-value="localStep.config?.service_type || 'Replace'"
          @update:model-value="val => updateServiceConfig('service_type', val)"
          placeholder="Service Type"
          class="service-type-select"
        >
          <el-option label="Replace" value="Replace" />
          <el-option label="Repair" value="Repair" />
        </el-select>
        <el-select
          :model-value="localStep.config?.device_tag || 'P100016'"
          @update:model-value="val => updateServiceConfig('device_tag', val)"
          placeholder="Device Tag"
          class="device-tag-select"
        >
          <el-option label="P100016" value="P100016" />
          <el-option label="CE79950" value="CE79950" />
          <el-option label="P100004" value="P100004" />
        </el-select>
        <el-input-number
          :model-value="localStep.config?.quantity || 1"
          @update:model-value="val => updateServiceConfig('quantity', val)"
          :min="1"
          :max="999"
          :step="1"
          :precision="0"
          class="quantity-input"
        >
          <template #suffix>
            <span>Qty</span>
          </template>
        </el-input-number>
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

          <!-- Preview Bottom Section (show if required image is checked OR tools exist) -->
          <div
            v-if="localStep.required_image || (localStep.relevant_tools && localStep.relevant_tools.length > 0)"
            class="preview-bottom-section"
          >
            <!-- Upload Image Button -->
            <div v-if="localStep.required_image" class="preview-upload-section">
              <el-button type="info" size="small" disabled>
                <span class="required-asterisk">*</span>
                <el-icon><Upload /></el-icon>
                Upload Image
              </el-button>
            </div>

            <!-- Show Tools Button -->
            <div v-if="localStep.relevant_tools && localStep.relevant_tools.length > 0" class="preview-tools-section">
              <el-button
                disabled
                size="small"
                plain
                @click="showToolsPreview = !showToolsPreview"
                class="tools-toggle-btn"
              >
                <el-icon><Tools /></el-icon>
                {{ showToolsPreview ? 'Hide Tools' : 'Show Tools' }} ({{ localStep.relevant_tools.length }})
              </el-button>
            </div>
          </div>

          <!-- Tools List (expandable section) -->
          <div
            v-if="showToolsPreview && localStep.relevant_tools && localStep.relevant_tools.length > 0"
            class="preview-tools-list"
          >
            <div class="tools-list-header">
              <h4>Required Tools</h4>
            </div>
            <div class="tools-list-content">
              <div v-for="tool in localStep.relevant_tools" :key="tool.tool_id || tool.id" class="tool-item">
                <el-icon><Tools /></el-icon>
                <span class="tool-name">{{ tool.name || 'Unnamed Tool' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Options -->
      <div class="step-options">
        <div class="checkbox-group">
          <el-checkbox v-model="localStep.required" @change="handleRequiredChange"> Required step </el-checkbox>
          <el-checkbox v-model="localStep.required_image" @change="handleRequiredImageChange">
            Required image
          </el-checkbox>
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
    <div
      class="delete-button"
      @click.stop="emit('delete', step.step_id)"
      @mouseenter="isDeleteHovered = true"
      @mouseleave="isDeleteHovered = false"
    >
      <el-icon v-if="isDeleteHovered"><DeleteFilled /></el-icon>
      <el-icon v-else><Delete /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import {
  MoreFilled,
  Setting,
  Tools,
  Folder,
  DocumentCopy,
  Delete,
  Rank,
  Edit,
  View,
  Upload,
  DeleteFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Import step type components (we'll create these later)
import InspectionStepPreview from './InspectionStepPreview.vue'
import CheckboxStepPreview from './CheckboxStepPreview.vue'
import NumberStepPreview from './NumberStepPreview.vue'
import TextStepPreview from './TextStepPreview.vue'
import AttachmentStepPreview from './AttachmentStepPreview.vue'
import ServiceStepPreview from './ServiceStepPreview.vue'
import { formatLimitsText } from 'src/views/taskLibrary/utils/stepTransforms'

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

// Initialize service config if needed
if ( localStep.type === 'service' ) {
  if ( !localStep.config ) {
    localStep.config = {}
  }
  // Ensure all service config properties exist
  if ( !localStep.config.service_type ) {
    localStep.config.service_type = 'Replace'
  }
  if ( !localStep.config.device_tag ) {
    localStep.config.device_tag = 'P100016'
  }
  if ( !localStep.config.quantity ) {
    localStep.config.quantity = 1
  }
  if ( !localStep.config.status ) {
    localStep.config.status = 'fail'
  }
}

const showDescriptionEdit = ref( false )
const showPreview = ref( false )
const isDeleteHovered = ref( false )
const showToolsPreview = ref( false )

// Computed property to check if step has limitations
const hasLimitations = computed( () => {
  return (
    localStep.config?.limits &&
    ( localStep.config.limits.lower !== undefined || localStep.config.limits.upper !== undefined )
  )
} )

// Step types for dropdown
const stepTypes = [
  {
    type : 'inspection',
    name : 'Inspection',
    color : '#67c23a'
  },
  {
    type : 'checkbox',
    name : 'Checkbox',
    color : '#409eff'
  },
  {
    type : 'number',
    name : 'Number',
    color : '#e6a23c'
  },
  {
    type : 'text',
    name : 'Text',
    color : '#909399'
  },
  {
    type : 'attachments',
    name : 'Files',
    color : '#849aec'
  },
  {
    type : 'service',
    name : 'Service',
    color : '#df869d',
    disabled : true
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
      if ( showDescriptionEdit.value || localStep.description ) {
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
    case 'limitations':
      if ( hasLimitations.value ) {
        // Remove limitations
        handleRemoveLimitations()
      } else {
        // Add/edit limitations
        emit( 'configure', props.step.step_id, 'limits' )
      }
      break
    case 'duplicate':
      emit( 'duplicate', props.step.step_id )
      break
    default:
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

const updateServiceConfig = ( key, value ) => {
  if ( !localStep.config ) {
    localStep.config = {}
  }
  localStep.config[key] = value
  saveChanges()
}

const handleStepUpdate = updates => {
  Object.assign( localStep, updates )
  saveChanges()
}

const handleTypeChange = newType => {
  const baseConfig = {}
  if ( localStep.config ) {
    if ( localStep.config.default && ( newType === 'text' || newType === 'number' ) ) {
      baseConfig.default = localStep.config.default
    }
  }

  // Update config for new type
  if ( newType === 'service' ) {
    localStep.config = {
      service_type : 'Replace',
      device_tag : 'P100016',
      quantity : 1,
      status : 'fail',
      ...baseConfig
    }
  } else {
    localStep.config = baseConfig
  }
  saveChanges()
}

const handleRemoveLimitations = () => {
  // Remove limitations from the step config
  if ( localStep.config ) {
    delete localStep.config.limits
    // If config becomes empty, remove it entirely
    if ( Object.keys( localStep.config ).length === 0 ) {
      localStep.config = undefined
    }
  }
  saveChanges()
  ElMessage.success( 'Number limitations removed successfully' )
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
    attachments : 'Files',
    service : 'Service'
  }
  return labels[type] || type
}

const getLimitationsText = () => {
  return formatLimitsText( localStep.config?.limits, localStep.config?.unit )
}

const getStepComponent = type => {
  const components = {
    inspection : InspectionStepPreview,
    checkbox : CheckboxStepPreview,
    number : NumberStepPreview,
    text : TextStepPreview,
    attachments : AttachmentStepPreview,
    service : ServiceStepPreview
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
  margin-bottom: 16px;
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
  flex: 0 1 65%;
}

.step-label-section .step-label-input :deep(.el-input__inner) {
  font-weight: normal;
  font-size: 14px;
}

.step-label-section .step-label-input :deep(.el-input__wrapper) {
  transition: border-color 0.2s ease;
}

.step-label-section .step-label-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-label-section .step-type-dropdown {
  flex: 0 1 35%;
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
  padding: 16px;
  background: #f8f9fb;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  margin-top: 4px;
}

.step-preview-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-bottom-section {
  display: flex;
  align-items: center;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid #e8eaed;
  min-height: 32px;
}

.preview-upload-section {
  display: flex;
  align-items: center;
}

.preview-upload-section .el-button {
  font-size: 12px;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
  background: #ffffff;
  color: #6b7280;
}

.preview-upload-section .required-asterisk {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
  margin-right: 4px;
}

/* Tools Preview Section */
.preview-tools-section {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.tools-toggle-btn {
  font-size: 12px;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
}

.preview-tools-list {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.tools-list-header {
  margin-bottom: 8px;
}

.tools-list-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.tools-list-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8f9fb;
  border-radius: 4px;
  font-size: 12px;
}

.tool-item .el-icon {
  color: #409eff;
  font-size: 14px;
  margin-right: 0;
}

.tool-name {
  color: #303133;
  font-weight: 500;
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
  margin-right: 20px;
  display: flex;
  gap: 5px;
  align-items: center;
}

.meta-button {
  height: 24px;
  font-size: 12px;
  padding: 12px;
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
  color: var(--step-type-color);
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
  --step-type-color: #849aec;
  --step-type-color-rgb: 147, 167, 240;
  border-left: 2px solid var(--step-type-color);
}

.step-type-service {
  --step-type-color: #df869d;
  --step-type-color-rgb: 254, 107, 144;
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

/* Step Limitations Section */
.step-limitations-section {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
}

.limitations-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.limitations-content .el-icon {
  color: #606266;
  font-size: 16px;
}

.limitations-text {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  flex: 1;
}

.edit-limitations-btn {
  font-size: 13px;
  padding: 2px 6px;
  height: auto;
  color: var(--step-type-color);
  margin-left: auto;
}

.edit-limitations-btn:hover {
  color: var(--step-type-color);
  background: rgba(var(--step-type-color-rgb), 0.1);
}

/* Service Configuration Section */
.step-service-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-type-select {
  flex: 0 1 30%;
  min-width: 100px;
}

.device-tag-select {
  flex: 0 1 35%;
  min-width: 120px;
}

.quantity-input {
  flex: 0 1 35%;
  min-width: 80px;
}

.service-status-group {
  flex: 0 1 25%;
  display: flex;
}

.service-status-button {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 6px;
  flex: 1;
}

.service-status-button .el-icon {
  font-size: 12px;
}

/* Service step focus colors */
.step-service-section .service-type-select :deep(.el-select__wrapper.is-focused) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-service-section .device-tag-select :deep(.el-select__wrapper.is-focused) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-service-section .quantity-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-service-section .quantity-input :deep(.el-input__wrapper.is-focused) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

.step-service-section .quantity-input :deep(.el-input-number__decrease):hover,
.step-service-section .quantity-input :deep(.el-input-number__increase):hover {
  color: var(--step-type-color) !important;
}

.step-service-section .quantity-input :deep(.el-input-number__decrease):active,
.step-service-section .quantity-input :deep(.el-input-number__increase):active {
  color: var(--step-type-color) !important;
}

.step-service-section .quantity-input:hover :deep(.el-input__wrapper) {
  border-color: var(--step-type-color) !important;
}

.step-service-section .quantity-input:focus-within :deep(.el-input__wrapper) {
  border-color: var(--step-type-color) !important;
  box-shadow: 0 0 0 1px var(--step-type-color) inset !important;
}

/* Global icon spacing for all Task Library buttons */
:deep(.el-button .el-icon) {
  margin-right: 3px !important;
  margin-bottom: 1px !important;
}
</style>

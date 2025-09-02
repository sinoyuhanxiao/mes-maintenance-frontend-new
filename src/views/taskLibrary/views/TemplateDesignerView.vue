<template>
  <div class="template-designer-view" :style="{ height: containerHeight }">
    <!-- Designer Header -->
    <div class="designer-header">
      <div class="header-left">
        <el-button type="text" @click="handleBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="header-title">
          <h1>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h1>
          <div v-if="currentTemplate" class="template-status">
            <el-tag :type="getStatusType(currentTemplate.status)" size="small">
              {{ currentTemplate.status }}
            </el-tag>
            <span v-if="hasUnsavedChanges" class="unsaved-indicator">
              <el-icon><Warning /></el-icon>
              Unsaved changes
            </span>
          </div>
        </div>
      </div>
      <div class="header-actions">
<!--        <el-button @click="handlePreview" :disabled="!isTemplateValid">-->
        <el-button @click="handlePreview" :disabled="true">
          <el-icon><View /></el-icon>
          Preview
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" disabled>
          <el-icon><Check /></el-icon>
          {{ isEditing ? 'Save Changes' : 'Save Task' }}
        </el-button>
        <el-button
          v-if="currentTemplate && currentTemplate.status !== 'published'"
          type="success"
          @click="handlePublish"
          :disabled="!isTemplateValid"
          :loading="publishing"
        >
          <el-icon><Upload /></el-icon>
          Publish
        </el-button>
      </div>
    </div>

    <!-- Designer Content -->
    <div class="designer-content">
      <!-- Left Panel - Template Metadata -->
      <div class="left-panel">
        <el-card class="metadata-card">
          <template #header>
            <span class="card-title">Task Information</span>
          </template>

          <el-form
            ref="metadataFormRef"
            :model="templateForm"
            :rules="metadataRules"
            label-position="top"
            class="metadata-form"
          >
            <el-form-item label="Task Name" prop="name" required>
              <el-input v-model="templateForm.name" placeholder="Enter task name" @input="markAsChanged" />
            </el-form-item>

            <el-form-item label="Description" prop="description">
              <el-input
                v-model="templateForm.description"
                type="textarea"
                :rows="3"
                placeholder="Describe what this task is for"
                @input="markAsChanged"
              />
            </el-form-item>

            <el-form-item label="Category" prop="category" required>
              <el-select
                v-model="templateForm.category"
                placeholder="Select category"
                style="width: 100%"
                @change="markAsChanged"
              >
                <el-option label="Preventive Maintenance" value="PM" />
                <el-option label="Inspection" value="Inspection" />
                <el-option label="Repair" value="Repair" />
                <el-option label="Calibration" value="Calibration" />
                <el-option label="Safety Check" value="Safety" />
                <el-option label="Other" value="Other" />
              </el-select>
            </el-form-item>

            <el-form-item label="Estimated Time (minutes)" prop="estimated_minutes" required>
              <el-input-number
                v-model="templateForm.estimated_minutes"
                :min="1"
                :max="480"
                style="width: 100%"
                @change="markAsChanged"
              />
            </el-form-item>

            <el-form-item label="Applicable Assets" prop="applicable_assets">
              <el-select
                v-model="templateForm.applicable_assets"
                multiple
                placeholder="Select applicable assets"
                style="width: 100%"
                @change="markAsChanged"
              >
                <!-- These would come from equipment API -->
                <el-option label="Freezer #1" value="asset:freezer#1" />
                <el-option label="Freezer #2" value="asset:freezer#2" />
                <el-option label="Conveyor Belt A" value="asset:conveyor#a" />
                <el-option label="Pump System" value="asset:pump#1" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Template Validation & Usage Tips -->
        <el-card v-if="validationErrors.length > 0 || templateForm.steps.length > 0" class="validation-card">
          <template #header>
            <div class="card-header-with-toggle">
              <span class="card-title">
                {{ showComponentTips ? 'Component Usage Tips' : 'Validation Issues' }}
              </span>
              <el-tooltip
                :content="showComponentTips ? 'Switch to Validation Issues' : 'Switch to Component Usage Tips'"
                placement="top"
              >
                <el-button
                  type="text"
                  size="small"
                  @click="showComponentTips = !showComponentTips"
                  class="toggle-button"
                >
                  <el-icon><Switch /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>

          <!-- Validation Issues View -->
          <div v-if="!showComponentTips">
            <ul v-if="validationErrors.length > 0" class="validation-list">
              <li v-for="error in validationErrors" :key="error" class="validation-error">
                {{ error }}
              </li>
            </ul>
            <div v-else class="no-issues">
              <el-icon class="success-icon"><CircleCheck /></el-icon>
              <span>No validation issues found</span>
            </div>
          </div>

          <!-- Component Usage Tips View -->
          <div v-else>
            <div v-if="focusedStepType" class="tips-list">
              <div class="tip-item" :style="{ borderLeftColor: stepTypeColors[focusedStepType] }">
                <div class="tip-type" :style="{ color: stepTypeColors[focusedStepType] }">
                  {{ focusedStepType.charAt(0).toUpperCase() + focusedStepType.slice(1) }} Step:
                </div>
                <div class="tip-description">{{ componentUsageTips[focusedStepType] }}</div>
              </div>
            </div>
            <div v-else class="no-tips">
              <span>Select a step to see its usage tip</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Center Panel - Steps Designer -->
      <div class="center-panel">
        <div class="steps-header">
          <div class="steps-title">
            <h3>Procedure Designer</h3>
            <span class="steps-count">{{ templateForm.steps.length }} steps</span>
          </div>
          <div class="steps-actions">
            <el-tooltip content="Clear all steps" placement="top">
              <el-button
                type="text"
                size="small"
                @click="handleResetSteps"
                :disabled="templateForm.steps.length === 0"
                class="reset-steps-btn"
              >
                <el-icon><RefreshLeft /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <div class="steps-container" :class="{ 'no-steps': templateForm.steps.length === 0 }">
          <!-- Empty State -->
          <div v-if="templateForm.steps.length === 0" class="empty-steps">
            <div class="empty-content">
              <el-icon class="empty-icon"><DocumentAdd /></el-icon>
              <h4>No Steps Added</h4>
              <p>Add your first step to start building the procedure</p>
              <el-button type="primary" @click="handleAddStep('inspection')">
                <el-icon><Plus /></el-icon>
                Add First Step
              </el-button>
            </div>
          </div>

          <!-- Steps List -->
          <div v-else class="steps-list">
            <VueDraggable
              v-model="templateForm.steps"
              class="steps-container"
              :component-data="{
                tag: 'div',
                type: 'transition-group',
                name: 'step-card',
              }"
              item-key="step_id"
              :animation="200"
              :delay="0"
              :disabled="false"
              handle=".drag-handle"
              ghost-class="step-ghost"
              chosen-class="step-chosen"
              drag-class="step-drag"
              @start="handleVueDragStart"
              @end="handleVueDragEnd"
              @change="handleVueDragChange"
            >
              <template #item="{ element: step, index }">
                <BaseStepCard
                  :step="step"
                  :step-index="index"
                  :is-focused="designerState.focused_step_id === step.step_id"
                  @focus="handleStepFocus"
                  @update="handleStepUpdate"
                  @delete="handleStepDelete"
                  @configure="handleStepConfigure"
                  @duplicate="handleStepDuplicate"
                />
              </template>
            </VueDraggable>
          </div>
        </div>
      </div>

      <!-- Right Panel - Floating Actions -->
      <div class="right-panel">
        <!-- Floating Panel for adding/managing steps -->
        <FloatingPanel
          v-if="designerState.floating_panel.visible"
          :mode="designerState.floating_panel.mode"
          :steps="stepsForPanel"
          :ui-hints="floatingPanelUiHints"
          :interactions="floatingPanelInteractions"
          :enabled-bulk-actions="enabledBulkActions"
          @add-step="handleAddStep"
          @toggle-mode="toggleFloatingPanelMode"
          @set-mode="handleSetMode"
          @reorder-steps="handleReorderSteps"
          @bulk-action="handleBulkAction"
          @inline-rename="handleInlineRename"
        />
      </div>
    </div>

    <!-- Configuration Dialogs -->
    <NumberLimitsPanel
      v-if="designerState.dialogs.number_limits.visible"
      :visible="designerState.dialogs.number_limits.visible"
      :step-id="designerState.dialogs.number_limits.for_step_id"
      :initial-data="designerState.dialogs.number_limits.form_data"
      @save="handleNumberLimitsSave"
      @close="closeNumberLimitsDialog"
    />

    <ToolPickerPanel
      v-if="designerState.dialogs.relevant_tools_picker.visible"
      :visible="designerState.dialogs.relevant_tools_picker.visible"
      :step-id="designerState.dialogs.relevant_tools_picker.for_step_id"
      :selected-tools="designerState.dialogs.relevant_tools_picker.selected_tools"
      @save="handleToolsSave"
      @close="closeToolsDialog"
    />

    <ResourceUploaderPanel
      v-if="designerState.dialogs.resource_uploader.visible"
      :visible="designerState.dialogs.resource_uploader.visible"
      :step-id="designerState.dialogs.resource_uploader.for_step_id"
      :existing-resources="designerState.dialogs.resource_uploader.form_data?.existing_resources || []"
      @save="handleResourcesSave"
      @close="closeResourcesDialog"
    />

    <!-- Preview Dialog -->
    <PreviewDialog
      :visible="showPreviewDialog"
      :template="templateForm"
      :dialog-config="previewDialogConfig"
      :header-config="previewHeaderConfig"
      :toolbar-config="previewToolbarConfig"
      :layout-config="previewLayoutConfig"
      :content-config="previewContentConfig"
      :footer-config="previewFooterConfig"
      @open="handlePreviewOpen"
      @close="handlePreviewClose"
      @print="handlePreviewPrint"
    />

    <!-- Unsaved Changes Dialog -->
    <el-dialog
      :model-value="showUnsavedDialog"
      @update:model-value="val => (showUnsavedDialog = val)"
      title="Unsaved Changes"
      width="450px"
      :before-close="handleUnsavedDialogClose"
    >
      <p>You have unsaved changes. What would you like to do?</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="discardChanges">Discard</el-button>
          <el-button @click="showUnsavedDialog = false">Cancel</el-button>
          <el-button type="primary" @click="saveAndContinue">Continue</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  Upload,
  View,
  Warning,
  DocumentAdd,
  Plus,
  Switch,
  CircleCheck,
  RefreshLeft
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// Using native HTML5 drag and drop instead of vuedraggable
import { useTaskLibrary } from '@/composables/useTaskLibrary'
import { useTemplateDesigner } from '@/composables/useTemplateDesigner'
import { useAppStore, useSettingsStore } from '@/store'
import VueDraggable from 'vuedraggable'
import BaseStepCard from '../components/Designer/StepCards/BaseStepCard.vue'
import FloatingPanel from '../components/Designer/FloatingPanel.vue'
import NumberLimitsPanel from '../components/Designer/ConfigPanels/NumberLimitsPanel.vue'
import ToolPickerPanel from '../components/Designer/ConfigPanels/ToolPickerPanel.vue'
import ResourceUploaderPanel from '../components/Designer/ConfigPanels/ResourceUploaderPanel.vue'
import PreviewDialog from '../components/Designer/PreviewDialog.vue'

const route = useRoute()
const router = useRouter()

const {
  currentTemplate,
  loadTemplate,
  createTemplate,
  updateTemplate,
  publishTemplate,
  validateTemplate,
  isTemplateValid
} = useTaskLibrary()

const {
  designerState,
  setFocusedStep,
  toggleFloatingPanelMode,
  setFloatingPanelMode,
  openNumberLimitsDialog,
  closeNumberLimitsDialog,
  openToolsDialog,
  closeToolsDialog,
  openResourcesDialog,
  closeResourcesDialog,
  resetDesignerState
} = useTemplateDesigner()

const appStore = useAppStore()
const settingsStore = useSettingsStore()

// Local state
const metadataFormRef = ref( null )
const templateForm = ref( {
  name : '',
  description : '',
  category : '',
  estimated_minutes : 30,
  applicable_assets : [],
  steps : []
} )

const hasUnsavedChanges = ref( false )
const saving = ref( false )
const publishing = ref( false )
const showUnsavedDialog = ref( false )
const pendingNavigation = ref( null )
const originalSidebarState = ref( null )
const showComponentTips = ref( false )

// Dynamic height calculation state
const navbarHeight = ref( 50 ) // Fallback to default navbar height
const tagsViewHeight = ref( 34 ) // Fallback to default tags-view height
const containerHeight = computed( () => {
  const totalFixedHeight = navbarHeight.value + tagsViewHeight.value
  // Ensure minimum height values for fallback
  const safeHeight = totalFixedHeight > 0 ? totalFixedHeight : 84
  return `calc(100vh - ${safeHeight + 2}px)`
} )

// Preview dialog state
const showPreviewDialog = ref( false )

// Computed properties
const isEditing = computed( () => !!route.params.id )
const validationErrors = computed( () => validateTemplate( templateForm.value ) )

// Component usage tips by step type, hardcoded for now.
const componentUsageTips = computed( () => {
  const tips = {
    inspection :
      'Perfect for equipment condition verification with pass/fail outcomes, commonly used in safety checks and quality control procedures.',
    checkbox :
      'Ideal for simple yes/no confirmations, compliance checklists, and ensuring critical steps are acknowledged before proceeding.',
    number :
      'Essential for recording measurements, sensor readings, and quantitative data with optional unit specifications and validation limits.',
    text : 'Best for capturing detailed observations, technician notes, and contextual information that structured data cannot represent.',
    attachments :
      'Critical for visual documentation, before/after photos, and creating comprehensive maintenance records for compliance and audit trails.',
    service :
      'Designed for maintenance operations requiring specific device tag identification and service type specification, supporting Replace and Repair workflows with quantity tracking.'
  }
  return tips
} )

// Step type colors matching BaseStepCard
const stepTypeColors = computed( () => {
  const colors = {
    inspection : '#67c23a',
    checkbox : '#409eff',
    number : '#e6a23c',
    text : '#909399',
    attachments : '#849aec',
    service : '#df869d'
  }
  return colors
} )

const focusedStepType = computed( () => {
  if ( !designerState.value.focused_step_id ) return null
  const focusedStep = templateForm.value.steps.find( step => step.step_id === designerState.value.focused_step_id )
  return focusedStep?.type || null
} )

// FloatingPanel computed properties
const stepsForPanel = computed( () => {
  const result = templateForm.value.steps.map( step => ( {
    id : step.step_id,
    order : step.order,
    type : step.type,
    title : step.label || `Untitled ${step.type} step`,
    required : step.required || false
  } ) )
  return result
} )

const floatingPanelUiHints = computed( () => ( {
  showCheckboxes : true,
  showDragHandles : true,
  showStepNumbers : true,
  showTypeIcons : true,
  showBulkToolbarOnSelect : true,
  rowDensity : 'compact'
} ) )

const floatingPanelInteractions = computed( () => ( {
  allowMultiSelect : true,
  allowGroupDrag : true,
  allowInlineRename : true,
  confirmOnDelete : true
} ) )

const enabledBulkActions = computed( () => ['duplicate', 'mark_required', 'mark_optional', 'delete'] )

// Preview dialog configuration
const previewDialogConfig = computed( () => ( {
  title : 'Preview Procedure',
  width : '70%',
  fullscreen : false,
  closeOnClickModal : true,
  appendToBody : true,
  customClass : 'template-preview-dialog'
} ) )

const previewHeaderConfig = computed( () => ( {
  showSubtitle : true,
  showMeta : true,
  metaFields : ['category', 'estimated_minutes', 'applicable_assets']
} ) )

const previewToolbarConfig = computed( () => ( {
  showStepNumbersToggle : true,
  showViewportSwitcher : true,
  viewportOptions : ['desktop', 'mobile'],
  interactionMode : 'static'
} ) )

const previewLayoutConfig = computed( () => ( {
  sectionCollapsible : true,
  sectionsInitiallyExpanded : true,
  showStepNumbers : true,
  requiredMark : '*',
  density : 'comfortable'
} ) )

const previewContentConfig = computed( () => ( {
  grouping : 'by_section_field',
  sectionTitleField : 'section',
  unknownSectionTitle : 'General',
  widgets : {
    inspection : {
      options : ['pass', 'flag', 'fail'],
      buttonStyle : 'pill'
    },
    checkbox : {
      stackDirection : 'vertical'
    },
    number : {
      showUnits : true,
      showLimits : true,
      unitsField : 'unit',
      limitsField : 'limits'
    },
    text : {
      placeholderField : 'placeholder',
      rows : 3
    },
    files : {
      acceptImages : true,
      acceptDocuments : true
    }
  }
} ) )

const previewFooterConfig = computed( () => ( {
  showClose : true,
  showPrint : false
} ) )

// Form validation rules
const metadataRules = {
  name : [
    { required : true, message : 'Task name is required', trigger : 'blur' },
    { min : 3, max : 200, message : 'Name should be 3-200 characters', trigger : 'blur' }
  ],
  category : [{ required : true, message : 'Category is required', trigger : 'change' }],
  estimated_minutes : [
    { required : true, message : 'Estimated time is required', trigger : 'change' },
    { type : 'number', min : 1, message : 'Time must be at least 1 minute', trigger : 'change' }
  ]
}

// Event handlers
const handleBack = () => {
  const navigateBack = () => {
    // Restore original sidebar state if it was originally open
    if ( originalSidebarState.value && !appStore.sidebar.opened ) {
      appStore.TOGGLE_SIDEBAR()
    }
    router.push( { name : 'TaskLibrary' } )
  }

  if ( hasUnsavedChanges.value ) {
    pendingNavigation.value = navigateBack
    showUnsavedDialog.value = true
  } else {
    navigateBack()
  }
}

const handleSave = async() => {
  try {
    await metadataFormRef.value.validate()

    saving.value = true

    if ( isEditing.value ) {
      await updateTemplate( templateForm.value )
    } else {
      const newTemplate = await createTemplate( templateForm.value )
      // Navigate to edit mode for the new template
      router.replace( {
        name : 'TaskDesignerEdit',
        params : { id : newTemplate.template_id }
      } )
    }

    hasUnsavedChanges.value = false
    ElMessage.success( 'Task saved successfully' )
  } catch ( error ) {
    if ( error.fields ) {
      ElMessage.error( 'Please fix validation errors before saving' )
    } else {
      ElMessage.error( 'Failed to save task' )
    }
  } finally {
    saving.value = false
  }
}

const handlePublish = async() => {
  if ( !isTemplateValid.value ) {
    ElMessage.error( 'Please fix all validation issues before publishing' )
    return
  }

  try {
    await ElMessageBox.confirm( 'Publishing will make this task available for use. Are you sure?', 'Publish Task', {
      confirmButtonText : 'Publish',
      cancelButtonText : 'Cancel',
      type : 'warning'
    } )

    publishing.value = true

    // Save first if there are unsaved changes
    if ( hasUnsavedChanges.value ) {
      await handleSave()
    }

    await publishTemplate( currentTemplate.value.template_id )
    ElMessage.success( 'Task published successfully' )
  } catch ( error ) {
    if ( error !== 'cancel' ) {
      ElMessage.error( 'Failed to publish task' )
    }
  } finally {
    publishing.value = false
  }
}

const handlePreview = () => {
  showPreviewDialog.value = true
}

const markAsChanged = () => {
  hasUnsavedChanges.value = true
}

// Step management
const handleStepFocus = stepId => {
  setFocusedStep( stepId )
}

const handleResetSteps = async() => {
  try {
    await ElMessageBox.confirm(
      'This will remove all procedure steps. This action cannot be undone.',
      'Clear All Steps',
      {
        confirmButtonText : 'Continue',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--primary'
      }
    )

    // Clear all steps
    templateForm.value.steps = []
    markAsChanged()
    ElMessage.success( 'All steps have been cleared' )
  } catch ( error ) {
    // User cancelled - do nothing
  }
}

const handleAddStep = stepType => {
  const newStep = {
    step_id : `step-${Date.now()}`,
    order : templateForm.value.steps.length + 1,
    type : stepType,
    label : `New ${stepType} step`,
    description : '',
    required : false,
    required_image : false,
    relevant_resources : [],
    relevant_tools : [],
    config : getDefaultStepConfig( stepType )
  }

  templateForm.value.steps.push( newStep )
  markAsChanged()

  // Focus the new step
  setFocusedStep( newStep.step_id )
}

const handleStepUpdate = ( stepId, updates ) => {
  const stepIndex = templateForm.value.steps.findIndex( s => s.step_id === stepId )
  if ( stepIndex !== -1 ) {
    // Use Object.assign to ensure reactivity
    Object.assign( templateForm.value.steps[stepIndex], updates )

    // Force reactivity by creating a new array reference if the change includes type
    if ( updates.type ) {
      templateForm.value.steps = [...templateForm.value.steps]
    }

    markAsChanged()
  }
}

const handleStepDelete = async stepId => {
  try {
    await ElMessageBox.confirm( 'Are you sure you want to delete this step?', 'Delete Step', {
      confirmButtonText : 'Delete',
      cancelButtonText : 'Cancel',
      type : 'warning'
    } )

    templateForm.value.steps = templateForm.value.steps.filter( s => s.step_id !== stepId )

    // Reorder remaining steps
    templateForm.value.steps.forEach( ( step, index ) => {
      step.order = index + 1
    } )

    markAsChanged()

    // Clear focus if deleted step was focused
    if ( designerState.value.focused_step_id === stepId ) {
      setFocusedStep( null )
    }
  } catch ( error ) {
    // User cancelled
  }
}

const handleStepDuplicate = stepId => {
  // Find the original step
  const originalStepIndex = templateForm.value.steps.findIndex( s => s.step_id === stepId )
  if ( originalStepIndex === -1 ) return

  const originalStep = templateForm.value.steps[originalStepIndex]

  // Create a complete copy of the step
  const duplicatedStep = {
    ...originalStep,
    step_id : `step-${Date.now()}`,
    label : `${originalStep.label} (Copy)`,
    // Deep copy complex objects to avoid reference issues
    config : originalStep.config ? JSON.parse( JSON.stringify( originalStep.config ) ) : {},
    relevant_tools : originalStep.relevant_tools ? [...originalStep.relevant_tools] : [],
    relevant_resources : originalStep.relevant_resources ? [...originalStep.relevant_resources] : []
  }

  // Insert the duplicated step right after the original step
  templateForm.value.steps.splice( originalStepIndex + 1, 0, duplicatedStep )

  // Reorder all steps
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  markAsChanged()

  // Focus the newly created duplicate step
  setFocusedStep( duplicatedStep.step_id )
}

const handleStepConfigure = ( stepId, configType ) => {
  const step = templateForm.value.steps.find( s => s.step_id === stepId )
  if ( !step ) return

  switch ( configType ) {
    case 'limits':
      openNumberLimitsDialog( stepId, step.config.limits || {} )
      break
    case 'tools':
      // Extract tool IDs if passing objects, otherwise pass the array as-is
      // eslint-disable-next-line no-case-declarations
      const toolIds =
        Array.isArray( step.relevant_tools ) &&
        step.relevant_tools.length > 0 &&
        typeof step.relevant_tools[0] === 'object'
          ? step.relevant_tools.map( tool => tool.tool_id )
          : step.relevant_tools || []
      openToolsDialog( stepId, toolIds )
      break
    case 'resources':
      openResourcesDialog( stepId, step.relevant_resources || [] )
      break
    default:
      console.warn( 'Unknown config type:', configType )
      break
  }
}

// VueDraggable event handlers
const handleVueDragStart = evt => {
  // Optional: Add any start logic here
}

const handleVueDragEnd = evt => {
  // Update step orders after drag ends
  updateStepOrders()
  markAsChanged()
}

const handleVueDragChange = evt => {
  // Vue draggable automatically updates the v-model (templateForm.steps)
  // We just need to update step orders
  updateStepOrders()
}

// Helper function to update step orders
const updateStepOrders = () => {
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )
}

// FloatingPanel event handlers
const handleReorderSteps = ( { stepId, sourceIndex, targetIndex } ) => {
  if ( sourceIndex === targetIndex ) return

  const steps = [...templateForm.value.steps]
  const stepToMove = steps[sourceIndex]

  // Remove from source position
  steps.splice( sourceIndex, 1 )

  // Insert at target position
  steps.splice( targetIndex, 0, stepToMove )

  // Update step orders
  steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  templateForm.value.steps = steps
  markAsChanged()
}

const handleBulkAction = async( { action, stepIds } ) => {
  const stepIndices = stepIds
    .map( id => templateForm.value.steps.findIndex( s => s.step_id === id ) )
    .filter( index => index !== -1 )

  switch ( action ) {
    case 'duplicate':
      // eslint-disable-next-line no-case-declarations
      const duplicatedSteps = stepIndices.map( index => {
        const originalStep = templateForm.value.steps[index]
        return {
          ...originalStep,
          step_id : `step-${Date.now()}-${Math.random().toString( 36 ).substr( 2, 9 )}`,
          label : `${originalStep.label} (Copy)`,
          order : templateForm.value.steps.length + 1
        }
      } )
      templateForm.value.steps.push( ...duplicatedSteps )
      break

    case 'mark_required':
      stepIndices.forEach( index => {
        templateForm.value.steps[index].required = true
      } )
      break

    case 'mark_optional':
      stepIndices.forEach( index => {
        templateForm.value.steps[index].required = false
      } )
      break

    case 'delete':
      // Confirm deletion
      try {
        await ElMessageBox.confirm(
          `Are you sure you want to delete ${stepIds.length} step(s)? This action cannot be undone.`,
          'Delete Steps',
          {
            confirmButtonText : 'Delete',
            cancelButtonText : 'Cancel',
            type : 'warning'
          }
        )

        // Remove steps in reverse order to maintain indices
        const sortedIndices = stepIndices.sort( ( a, b ) => b - a )
        sortedIndices.forEach( index => {
          templateForm.value.steps.splice( index, 1 )
        } )
      } catch ( error ) {
        // User cancelled, do nothing
        return
      }
      break
    default:
      console.warn( 'Unknown bulk action:', action )
      break
  }

  // Reorder all steps
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  markAsChanged()
}

const handleInlineRename = stepId => {
  // Focus the step for inline editing
  setFocusedStep( stepId )

  // Find the step card and focus its label input
  setTimeout( () => {
    const stepCard = document.querySelector( `[data-step-id="${stepId}"] .step-label-input input` )
    if ( stepCard ) {
      stepCard.focus()
      stepCard.select()
    }
  }, 100 )
}

const handleSetMode = mode => {
  setFloatingPanelMode( mode )
}

// Configuration dialog handlers
const handleNumberLimitsSave = ( stepId, limitsData ) => {
  handleStepUpdate( stepId, {
    config : {
      ...templateForm.value.steps.find( s => s.step_id === stepId )?.config,
      limits : limitsData
    }
  } )
  closeNumberLimitsDialog()
}

const handleToolsSave = ( stepId, selectedTools ) => {
  handleStepUpdate( stepId, {
    relevant_tools : selectedTools
  } )
  closeToolsDialog()
}

const handleResourcesSave = ( stepId, resources ) => {
  handleStepUpdate( stepId, {
    relevant_resources : resources
  } )
  closeResourcesDialog()
}

// Unsaved changes handling
const handleUnsavedDialogClose = () => {
  showUnsavedDialog.value = false
  pendingNavigation.value = null
}

const discardChanges = () => {
  hasUnsavedChanges.value = false
  showUnsavedDialog.value = false
  if ( pendingNavigation.value ) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

const saveAndContinue = async() => {
  try {
    await handleSave()
    showUnsavedDialog.value = false
    if ( pendingNavigation.value ) {
      pendingNavigation.value()
      pendingNavigation.value = null
    }
  } catch ( error ) {
    // Save failed, keep dialog open
  }
}

// Dynamic height calculation functions
const calculateDynamicHeights = () => {
  nextTick( () => {
    // Get navbar element
    const navbarEl = document.querySelector( '.navbar' )
    if ( navbarEl && navbarEl.offsetHeight > 0 ) {
      navbarHeight.value = navbarEl.offsetHeight
    }

    // Get tags-view-container element - only count height if TagsView is enabled
    const tagsViewEl = document.querySelector( '#tags-view-container' )
    if ( settingsStore.tagsView && tagsViewEl && tagsViewEl.offsetHeight > 0 ) {
      tagsViewHeight.value = tagsViewEl.offsetHeight
    } else {
      tagsViewHeight.value = 0 // Set to 0 when TagsView is disabled
    }
  } )
}

// Handle window resize to recalculate heights
const handleResize = () => {
  calculateDynamicHeights()
}

// Utility functions
const getDefaultStepConfig = stepType => {
  const configs = {
    inspection : {
      kind : 'inspection',
      choices : ['pass', 'fail'],
      default : 'pass',
      require_comment_on_fail : false,
      require_photo_on_fail : false
    },
    checkbox : {
      kind : 'checkbox',
      default : false
    },
    number : {
      kind : 'number',
      unit : '',
      decimal_places : 0,
      limits : null
    },
    text : {
      kind : 'text',
      multiline : true,
      max_length : 1000
    },
    attachments : {
      kind : 'attachments',
      allow_types : ['image', 'pdf'],
      max_files : 5,
      max_file_size_mb : 25,
      capture_from_camera : true
    },
    service : {
      kind : 'service',
      service_type : 'Replace',
      device_tag : 'P100016',
      quantity : 1
    }
  }

  return configs[stepType] || {}
}

const getStatusType = status => {
  switch ( status ) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
}

// Initialize template data
const initializeTemplate = async() => {
  if ( isEditing.value ) {
    try {
      const template = await loadTemplate( route.params.id )
      templateForm.value = { ...template }
    } catch ( error ) {
      ElMessage.error( 'Failed to load task' )
      router.push( { name : 'TaskLibrary' } )
    }
  } else {
    // Initialize new template
    templateForm.value = {
      name : '',
      description : '',
      category : '',
      estimated_minutes : 30,
      applicable_assets : [],
      steps : []
    }
  }
}

// Lifecycle hooks
onMounted( () => {
  // Store original sidebar state and collapse it
  originalSidebarState.value = appStore.sidebar.opened
  if ( appStore.sidebar.opened ) {
    appStore.CLOSE_SIDEBAR( false )
  }

  // Calculate dynamic heights
  calculateDynamicHeights()

  // Add resize listener
  window.addEventListener( 'resize', handleResize )

  initializeTemplate()
} )

onBeforeUnmount( () => {
  // Remove resize listener
  window.removeEventListener( 'resize', handleResize )

  // Restore original sidebar state if it was originally open
  if ( originalSidebarState.value && !appStore.sidebar.opened ) {
    appStore.TOGGLE_SIDEBAR()
  }

  resetDesignerState()
} )

onActivated( () => {
  // Recalculate heights when component is activated
  calculateDynamicHeights()
} )

onDeactivated( () => {} )

// Preview dialog event handlers
const handlePreviewOpen = () => {
  // Handle preview opened event
}

const handlePreviewClose = () => {
  showPreviewDialog.value = false
}

const handlePreviewPrint = () => {
  window.print()
}

// Watch for route changes
watch(
  () => route.params.id,
  ( newId, oldId ) => {
    // Only reinitialize if we're actually changing between different templates
    if ( newId !== oldId ) {
      if ( hasUnsavedChanges.value ) {
        pendingNavigation.value = () => initializeTemplate()
        showUnsavedDialog.value = true
      } else {
        initializeTemplate()
      }
    }
  }
)

// Watch for TagsView setting changes
watch(
  () => settingsStore.tagsView,
  () => {
    // Recalculate heights when TagsView is toggled
    calculateDynamicHeights()
  },
  { immediate : false }
)

defineOptions( {
  name : 'TaskDesigner'
} )
</script>

<style scoped>
.template-designer-view {
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  color: #606266;
}

.header-title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.template-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.unsaved-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.designer-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 320px;
  padding: 10px;
  overflow-y: auto;
  background: #f5f7fa;
}

/* Consistent scroll bar styling */
.left-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-left: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
}

.right-panel {
  width: 360px;
  padding: 10px;
  background: #f5f7fa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metadata-card,
.validation-card {
  margin-bottom: 16px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.error-icon {
  color: #f56c6c;
  margin-right: 4px;
}

.metadata-form .el-form-item {
  margin-bottom: 18px;
}

.validation-list {
  margin: 0;
  padding-left: 10px;
}

.validation-error {
  color: #f56c6c;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.steps-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.steps-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.steps-actions {
  display: flex;
  align-items: center;
}

.reset-steps-btn {
  color: #909399;
  font-size: 16px;
  padding: 4px;
  margin: 0;
}

.reset-steps-btn:hover:not(.is-disabled) {
  color: #f56c6c;
  background-color: #fef0f0;
}

.reset-steps-btn.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.steps-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.steps-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.steps-container {
  flex: 1;
  overflow: hidden;
}

.steps-container.no-steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-steps {
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-content h4 {
  margin: 0 0 8px 0;
  color: #606266;
}

.empty-content p {
  margin: 0 0 16px 0;
  color: #909399;
}

.steps-list {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.steps-list::-webkit-scrollbar {
  width: 6px;
}

.steps-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.steps-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.steps-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.steps-container {
  display: flex;
  flex-direction: column;
}

/* VueDraggable styles */
.step-ghost {
  opacity: 0.5;
}

.step-chosen {
  border-color: var(--el-color-primary);
}

.step-drag {
  opacity: 0.8;
}

/* Step card transition animations */
.step-card-move,
.step-card-enter-active,
.step-card-leave-active {
  transition: all 0.3s ease;
}

.step-card-enter-from,
.step-card-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.step-card-leave-active {
  position: absolute;
}

/* Step card drag over state */
.base-step-card.drag-over {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive design */
@media (max-width: 1200px) {
  .left-panel {
    width: 280px;
  }

  .right-panel {
    width: 320px;
  }
}

@media (max-width: 992px) {
  .designer-content {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    height: auto;
    max-height: 200px;
  }

  .center-panel {
    border: none;
  }
}

/* Global icon spacing for all Task Library buttons */
:deep(.el-button .el-icon) {
  margin-right: 3px !important;
  margin-bottom: 1px !important;
}

/* Card header with toggle button */
.card-header-with-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.toggle-button {
  font-size: 16px;
  padding: 4px 8px;
  color: #909399;
  position: relative;
  left: 10px;
}

.toggle-button:hover {
  color: #409eff;
}

.info-icon {
  color: #409eff;
  margin-right: 4px;
}

.success-icon {
  color: #67c23a;
  margin-right: 4px;
}

.no-issues {
  display: flex;
  align-items: center;
  color: #67c23a;
  font-size: 13px;
  padding: 8px 0;
}

.no-tips {
  color: #909399;
  font-size: 13px;
  font-style: italic;
  padding: 8px 0;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 4px;
  border-left: 2px solid;
  margin-bottom: 2px;
}

.tip-type {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
  text-transform: capitalize;
}

.tip-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
</style>

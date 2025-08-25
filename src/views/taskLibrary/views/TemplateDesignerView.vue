<template>
  <div class="template-designer-view">
    <!-- Designer Header -->
    <div class="designer-header">
      <div class="header-left">
        <el-button type="text" @click="handleBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          Back to Library
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
        <el-button @click="handlePreview" :disabled="!isTemplateValid">
          <el-icon><View /></el-icon>
          Preview
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
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

        <!-- Template Validation -->
        <el-card v-if="validationErrors.length > 0" class="validation-card">
          <template #header>
            <span class="card-title">
              <el-icon class="error-icon"><Warning /></el-icon>
              Validation Issues
            </span>
          </template>
          <ul class="validation-list">
            <li v-for="error in validationErrors" :key="error" class="validation-error">
              {{ error }}
            </li>
          </ul>
        </el-card>
      </div>

      <!-- Center Panel - Steps Designer -->
      <div class="center-panel">
        <div class="steps-header">
          <div class="steps-title">
            <h3>Procedure Steps</h3>
            <span class="steps-count">{{ templateForm.steps.length }} steps</span>
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
                name: 'step-card'
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
      @update:model-value="(val) => showUnsavedDialog = val"
      title="Unsaved Changes"
      width="400px"
      :before-close="handleUnsavedDialogClose"
    >
      <p>You have unsaved changes. What would you like to do?</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="discardChanges">Discard Changes</el-button>
          <el-button @click="showUnsavedDialog = false">Cancel</el-button>
          <el-button type="primary" @click="saveAndContinue">Save & Continue</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, Upload, View, Warning, DocumentAdd, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// Using native HTML5 drag and drop instead of vuedraggable
import { useTaskLibrary } from '@/composables/useTaskLibrary'
import { useTemplateDesigner } from '@/composables/useTemplateDesigner'
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
  showFloatingPanel,
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

// Preview dialog state
const showPreviewDialog = ref( false )

// Computed properties
const isEditing = computed( () => !!route.params.id )
const validationErrors = computed( () => validateTemplate( templateForm.value ) )

// FloatingPanel computed properties
const stepsForPanel = computed( () => {
  return templateForm.value.steps.map( step => ( {
    id : step.step_id,
    order : step.order,
    type : step.type,
    title : step.label || `Untitled ${step.type} step`,
    required : step.required || false
  } ) )
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
  if ( hasUnsavedChanges.value ) {
    pendingNavigation.value = () => router.push( { name : 'TaskLibrary' } )
    showUnsavedDialog.value = true
  } else {
    router.push( { name : 'TaskLibrary' } )
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
    await ElMessageBox.confirm(
      'Publishing will make this task available for use. Are you sure?',
      'Publish Task',
      {
        confirmButtonText : 'Publish',
        cancelButtonText : 'Cancel',
        type : 'warning'
      }
    )

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
    templateForm.value.steps[stepIndex] = {
      ...templateForm.value.steps[stepIndex],
      ...updates
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

const handleStepDuplicate = ( stepId ) => {
  // Find the original step
  const originalStepIndex = templateForm.value.steps.findIndex( s => s.step_id === stepId )
  if ( originalStepIndex === -1 ) return

  const originalStep = templateForm.value.steps[originalStepIndex]
  
  // Create a complete copy of the step
  const duplicatedStep = {
    ...originalStep,
    step_id: `step-${Date.now()}`,
    label: `${originalStep.label} (Copy)`,
    // Deep copy complex objects to avoid reference issues
    config: originalStep.config ? JSON.parse(JSON.stringify(originalStep.config)) : {},
    relevant_tools: originalStep.relevant_tools ? [...originalStep.relevant_tools] : [],
    relevant_resources: originalStep.relevant_resources ? [...originalStep.relevant_resources] : []
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
      const toolIds = Array.isArray(step.relevant_tools) && step.relevant_tools.length > 0 && typeof step.relevant_tools[0] === 'object'
        ? step.relevant_tools.map(tool => tool.tool_id)
        : step.relevant_tools || []
      openToolsDialog( stepId, toolIds )
      break
    case 'resources':
      openResourcesDialog( stepId, step.relevant_resources || [] )
      break
  }
}

// VueDraggable event handlers
const handleVueDragStart = (evt) => {
  console.log('Drag started:', evt)
  // Optional: Add any start logic here
}

const handleVueDragEnd = (evt) => {
  console.log('Drag ended:', evt)
  // Update step orders after drag ends
  updateStepOrders()
  markAsChanged()
}

const handleVueDragChange = (evt) => {
  console.log('Drag change:', evt)
  // Vue draggable automatically updates the v-model (templateForm.steps)
  // We just need to update step orders
  updateStepOrders()
}

// Helper function to update step orders
const updateStepOrders = () => {
  templateForm.value.steps.forEach((step, index) => {
    step.order = index + 1
  })
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

const handleBulkAction = async ( { action, stepIds } ) => {
  const stepIndices = stepIds.map( id =>
    templateForm.value.steps.findIndex( s => s.step_id === id )
  ).filter( index => index !== -1 )

  switch ( action ) {
    case 'duplicate':
      const duplicatedSteps = stepIndices.map( index => {
        const originalStep = templateForm.value.steps[index]
        return {
          ...originalStep,
          step_id : `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )

        // Remove steps in reverse order to maintain indices
        const sortedIndices = stepIndices.sort((a, b) => b - a)
        sortedIndices.forEach(index => {
          templateForm.value.steps.splice(index, 1)
        })
      } catch (error) {
        // User cancelled, do nothing
        return
      }
      break
  }

  // Reorder all steps
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  markAsChanged()
}

const handleInlineRename = ( stepId ) => {
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

const handleSetMode = ( mode ) => {
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
  initializeTemplate()
} )

onBeforeUnmount( () => {
  resetDesignerState()
} )

// Preview dialog event handlers
const handlePreviewOpen = () => {
  // Handle preview opened event
  console.log('Preview dialog opened')
}

const handlePreviewClose = () => {
  showPreviewDialog.value = false
}


const handlePreviewPrint = () => {
  console.log('Print preview')
  window.print()
}

// Watch for route changes
watch(
  () => route.params.id,
  () => {
    if ( hasUnsavedChanges.value ) {
      pendingNavigation.value = () => initializeTemplate()
      showUnsavedDialog.value = true
    } else {
      initializeTemplate()
    }
  }
)
</script>

<style scoped>
.template-designer-view {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
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
  padding: 16px;
  overflow-y: auto;
  background: #f5f7fa;
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
  padding: 16px;
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
  padding-left: 20px;
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
}

.steps-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
</style>

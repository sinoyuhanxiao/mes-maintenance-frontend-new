import { computed } from 'vue'
import { useTemplateDesignerStore } from '@/store/modules/templateDesigner'

export function useTemplateDesigner() {
  const store = useTemplateDesignerStore()

  // Reactive state
  const designerState = computed( () => ( {
    focused_step_id : store.focused_step_id,
    dragging : store.dragging,
    floating_panel : store.floating_panel,
    dialogs : store.dialogs,
    validation : store.validation,
    ui_preferences : store.ui_preferences
  } ) )

  // Focus management
  const setFocusedStep = stepId => {
    store.setFocusedStep( stepId )
  }

  const clearFocus = () => {
    store.clearFocus()
  }

  const isStepFocused = stepId => {
    return store.isStepFocused( stepId )
  }

  // Drag and drop
  const startDrag = stepId => {
    store.startDrag( stepId )
  }

  const updateDragTarget = stepId => {
    store.updateDragTarget( stepId )
  }

  const endDrag = () => {
    store.endDrag()
  }

  const isDragging = computed( () => store.isDragging )

  // Floating panel management
  const showFloatingPanel = () => {
    store.showFloatingPanel()
  }

  const hideFloatingPanel = () => {
    store.hideFloatingPanel()
  }

  const toggleFloatingPanel = () => {
    store.toggleFloatingPanel()
  }

  const setFloatingPanelMode = mode => {
    store.setFloatingPanelMode( mode )
  }

  const toggleFloatingPanelMode = () => {
    const currentMode = store.floating_panel.mode
    const newMode = currentMode === 'add_step' ? 'reorder_steps' : 'add_step'
    store.setFloatingPanelMode( newMode )
  }

  // Dialog management
  const openDialog = ( dialogName, stepId = null, initialData = {} ) => {
    store.openDialog( dialogName, stepId, initialData )
  }

  const closeDialog = dialogName => {
    store.closeDialog( dialogName )
  }

  const isDialogOpen = dialogName => {
    return store.isDialogOpen( dialogName )
  }

  const setDialogLoading = ( dialogName, loading ) => {
    store.setDialogLoading( dialogName, loading )
  }

  // Specific dialog helpers
  const openNumberLimitsDialog = ( stepId, initialData = {} ) => {
    store.openDialog( 'number_limits', stepId, initialData )
  }

  const closeNumberLimitsDialog = () => {
    store.closeDialog( 'number_limits' )
  }

  const openToolsDialog = ( stepId, selectedTools = [] ) => {
    store.openDialog( 'relevant_tools_picker', stepId, { selected_tools : selectedTools } )
  }

  const closeToolsDialog = () => {
    store.closeDialog( 'relevant_tools_picker' )
  }

  const openResourcesDialog = ( stepId, existingResources = [] ) => {
    store.openDialog( 'resource_uploader', stepId, { existing_resources : existingResources } )
  }

  const closeResourcesDialog = () => {
    store.closeDialog( 'resource_uploader' )
  }

  // Tools management
  const setSelectedTools = tools => {
    store.setSelectedTools( tools )
  }

  const addSelectedTool = tool => {
    store.addSelectedTool( tool )
  }

  const removeSelectedTool = toolId => {
    store.removeSelectedTool( toolId )
  }

  // Resource upload management
  const setUploadProgress = progress => {
    store.setUploadProgress( progress )
  }

  const setUploading = uploading => {
    store.setUploading( uploading )
  }

  // Validation management
  const setValidationError = ( stepId, errors ) => {
    store.setValidationError( stepId, errors )
  }

  const clearValidationErrors = ( stepId = null ) => {
    store.clearValidationErrors( stepId )
  }

  const hasValidationErrors = computed( () => store.hasValidationErrors )

  const getStepErrors = stepId => {
    return store.getStepErrors( stepId )
  }

  const setDirty = ( dirty = true ) => {
    store.setDirty( dirty )
  }

  // UI preferences
  const updatePreference = ( key, value ) => {
    store.updatePreference( key, value )
  }

  const toggleCompactMode = () => {
    store.toggleCompactMode()
  }

  const toggleStepNumbers = () => {
    store.toggleStepNumbers()
  }

  // Reset state
  const resetDesignerState = () => {
    store.resetDesignerState()
  }

  // Step validation helpers
  const validateStep = step => {
    const errors = []

    if ( !step.label || step.label.trim().length === 0 ) {
      errors.push( 'Step label is required' )
    }

    if ( step.label && step.label.length > 200 ) {
      errors.push( 'Step label must be 200 characters or less' )
    }

    // Type-specific validation
    switch ( step.type ) {
      case 'inspection':
        if ( !step.config?.choices || step.config.choices.length === 0 ) {
          errors.push( 'Inspection step must have choices defined' )
        }
        break

      case 'number':
        if ( step.config?.limits ) {
          const { lower, upper } = step.config.limits
          if ( lower !== undefined && upper !== undefined && lower >= upper ) {
            errors.push( 'Lower limit must be less than upper limit' )
          }
        }
        break

      case 'text':
        if ( step.config?.max_length && step.config.max_length <= 0 ) {
          errors.push( 'Text maximum length must be greater than 0' )
        }
        break

      case 'attachments':
        if ( step.config?.max_files && step.config.max_files <= 0 ) {
          errors.push( 'Maximum files must be greater than 0' )
        }
        if ( step.config?.max_file_size_mb && step.config.max_file_size_mb <= 0 ) {
          errors.push( 'Maximum file size must be greater than 0' )
        }
        break

      case 'service':
        if ( !step.config?.service_type ) {
          errors.push( 'Service type must be specified' )
        }
        if ( !step.config?.device_tag ) {
          errors.push( 'Device tag must be specified' )
        }
        if ( step.config?.quantity && ( step.config.quantity < 1 || step.config.quantity > 999 ) ) {
          errors.push( 'Quantity must be between 1 and 999' )
        }
        break

      default:
        // No specific validation for other step types
        break
    }

    return errors
  }

  const validateAllSteps = steps => {
    const allErrors = {}

    steps.forEach( step => {
      const errors = validateStep( step )
      if ( errors.length > 0 ) {
        allErrors[step.step_id] = errors
      }
    } )

    return allErrors
  }

  // Auto-save functionality
  const enableAutoSave = ( saveFunction, interval = 30000 ) => {
    if ( !designerState.value.ui_preferences.auto_save ) {
      return null
    }

    return setInterval( () => {
      if ( designerState.value.validation.dirty ) {
        saveFunction()
      }
    }, interval )
  }

  const disableAutoSave = intervalId => {
    if ( intervalId ) {
      clearInterval( intervalId )
    }
  }

  // Step operations helpers
  const reorderSteps = ( steps, fromIndex, toIndex ) => {
    const reorderedSteps = [...steps]
    const [movedStep] = reorderedSteps.splice( fromIndex, 1 )
    reorderedSteps.splice( toIndex, 0, movedStep )

    // Update order property
    reorderedSteps.forEach( ( step, index ) => {
      step.order = index + 1
    } )

    return reorderedSteps
  }

  const duplicateStep = step => {
    return {
      ...step,
      step_id : `step-${Date.now()}`,
      label : `${step.label} (Copy)`,
      order : step.order + 1
    }
  }

  const getStepTypeIcon = type => {
    const icons = {
      inspection : 'CheckCircle',
      checkbox : 'Square',
      number : 'Calculator',
      text : 'Edit',
      attachments : 'Paperclip',
      service : 'Tools'
    }
    return icons[type] || 'Circle'
  }

  const getStepTypeColor = type => {
    const colors = {
      inspection : '#67c23a',
      checkbox : '#409eff',
      number : '#e6a23c',
      text : '#909399',
      attachments : '#849aec',
      service : '#df869d'
    }
    return colors[type] || '#c0c4cc'
  }

  return {
    // State
    designerState,

    // Focus management
    setFocusedStep,
    clearFocus,
    isStepFocused,

    // Drag and drop
    startDrag,
    updateDragTarget,
    endDrag,
    isDragging,

    // Floating panel
    showFloatingPanel,
    hideFloatingPanel,
    toggleFloatingPanel,
    setFloatingPanelMode,
    toggleFloatingPanelMode,

    // Dialog management
    openDialog,
    closeDialog,
    isDialogOpen,
    setDialogLoading,

    // Specific dialogs
    openNumberLimitsDialog,
    closeNumberLimitsDialog,
    openToolsDialog,
    closeToolsDialog,
    openResourcesDialog,
    closeResourcesDialog,

    // Tools management
    setSelectedTools,
    addSelectedTool,
    removeSelectedTool,

    // Resource upload
    setUploadProgress,
    setUploading,

    // Validation
    setValidationError,
    clearValidationErrors,
    hasValidationErrors,
    getStepErrors,
    setDirty,
    validateStep,
    validateAllSteps,

    // UI preferences
    updatePreference,
    toggleCompactMode,
    toggleStepNumbers,

    // Utilities
    resetDesignerState,
    enableAutoSave,
    disableAutoSave,
    reorderSteps,
    duplicateStep,
    getStepTypeIcon,
    getStepTypeColor
  }
}

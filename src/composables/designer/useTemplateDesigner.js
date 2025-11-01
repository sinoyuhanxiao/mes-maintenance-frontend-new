import { computed } from 'vue'
import { useTemplateDesignerStore } from '@/store/modules/templateDesigner'

export function useTemplateDesigner() {
  const store = useTemplateDesignerStore()

  // Reactive state
  const designerState = computed(() => ({
    focused_step_id: store.focused_step_id,
    dragging: store.dragging,
    floating_panel: store.floating_panel,
    dialogs: store.dialogs,
    validation: store.validation,
    ui_preferences: store.ui_preferences,
  }))

  // Focus management
  const setFocusedStep = stepId => {
    store.setFocusedStep(stepId)
  }

  const clearFocus = () => {
    store.clearFocus()
  }

  const isStepFocused = stepId => {
    return store.isStepFocused(stepId)
  }

  // Drag and drop
  const startDrag = stepId => {
    store.startDrag(stepId)
  }

  const updateDragTarget = stepId => {
    store.updateDragTarget(stepId)
  }

  const endDrag = () => {
    store.endDrag()
  }

  const isDragging = computed(() => store.isDragging)

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
    store.setFloatingPanelMode(mode)
  }

  const toggleFloatingPanelMode = () => {
    const currentMode = store.floating_panel.mode
    const newMode = currentMode === 'add_step' ? 'reorder_steps' : 'add_step'
    store.setFloatingPanelMode(newMode)
  }

  // Dialog management
  const openDialog = (dialogName, stepId = null, initialData = {}) => {
    store.openDialog(dialogName, stepId, initialData)
  }

  const closeDialog = dialogName => {
    store.closeDialog(dialogName)
  }

  const isDialogOpen = dialogName => {
    return store.isDialogOpen(dialogName)
  }

  const setDialogLoading = (dialogName, loading) => {
    store.setDialogLoading(dialogName, loading)
  }

  // Specific dialog helpers
  const openNumberLimitsDialog = (stepId, initialData = {}) => {
    store.openDialog('number_limits', stepId, initialData)
  }

  const closeNumberLimitsDialog = () => {
    store.closeDialog('number_limits')
  }

  const openToolsDialog = (stepId, selectedTools = []) => {
    store.openDialog('relevant_tools_picker', stepId, { selected_tools: selectedTools })
  }

  const closeToolsDialog = () => {
    store.closeDialog('relevant_tools_picker')
  }

  const openResourcesDialog = (stepId, existingResources = []) => {
    store.openDialog('resource_uploader', stepId, { existing_resources: existingResources })
  }

  const closeResourcesDialog = () => {
    store.closeDialog('resource_uploader')
  }

  // Change summary dialog helpers
  const openChangeSummaryDialog = changes => {
    store.openChangeSummaryDialog(changes)
  }

  const closeChangeSummaryDialog = () => {
    store.closeChangeSummaryDialog()
  }

  const setChangeSummaryLoading = loading => {
    store.setChangeSummaryLoading(loading)
  }

  // Tools management
  const setSelectedTools = tools => {
    store.setSelectedTools(tools)
  }

  const addSelectedTool = tool => {
    store.addSelectedTool(tool)
  }

  const removeSelectedTool = toolId => {
    store.removeSelectedTool(toolId)
  }

  // Resource upload management
  const setUploadProgress = progress => {
    store.setUploadProgress(progress)
  }

  const setUploading = uploading => {
    store.setUploading(uploading)
  }

  // Validation management
  const setValidationError = (stepId, errors) => {
    store.setValidationError(stepId, errors)
  }

  const clearValidationErrors = (stepId = null) => {
    store.clearValidationErrors(stepId)
  }

  const hasValidationErrors = computed(() => store.hasValidationErrors)

  const getStepErrors = stepId => {
    return store.getStepErrors(stepId)
  }

  const setDirty = (dirty = true) => {
    store.setDirty(dirty)
  }

  // UI preferences
  const updatePreference = (key, value) => {
    store.updatePreference(key, value)
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

    if (!step.label || step.label.trim().length === 0) {
      errors.push('Step label is required')
    }

    if (step.label && step.label.length > 200) {
      errors.push('Step label must be 200 characters or less')
    }

    // Type-specific validation
    switch (step.type) {
      case 'inspection':
        if (!step.config?.choices || step.config.choices.length === 0) {
          errors.push('Inspection step must have choices defined')
        }
        break

      case 'number':
        if (step.config?.limits) {
          const { lower, upper } = step.config.limits
          if (lower !== undefined && upper !== undefined && lower >= upper) {
            errors.push('Lower limit must be less than upper limit')
          }
        }
        break

      case 'text':
        if (step.config?.max_length && step.config.max_length <= 0) {
          errors.push('Text maximum length must be greater than 0')
        }
        break

      case 'attachments':
        if (step.config?.max_files && step.config.max_files <= 0) {
          errors.push('Maximum files must be greater than 0')
        }
        if (step.config?.max_file_size_mb && step.config.max_file_size_mb <= 0) {
          errors.push('Maximum file size must be greater than 0')
        }
        break

      case 'service':
        if (!step.config?.service_type) {
          errors.push('Service type must be specified')
        }
        if (!step.config?.device_tag) {
          errors.push('Device tag must be specified')
        }
        if (step.config?.quantity && (step.config.quantity < 1 || step.config.quantity > 999)) {
          errors.push('Quantity must be between 1 and 999')
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

    steps.forEach(step => {
      const errors = validateStep(step)
      if (errors.length > 0) {
        allErrors[step.step_id] = errors
      }
    })

    return allErrors
  }

  // Auto-save functionality
  const enableAutoSave = (saveFunction, interval = 30000) => {
    if (!designerState.value.ui_preferences.auto_save) {
      return null
    }

    return setInterval(() => {
      if (designerState.value.validation.dirty) {
        saveFunction()
      }
    }, interval)
  }

  const disableAutoSave = intervalId => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  }

  // Step operations helpers
  const reorderSteps = (steps, fromIndex, toIndex) => {
    const reorderedSteps = [...steps]
    const [movedStep] = reorderedSteps.splice(fromIndex, 1)
    reorderedSteps.splice(toIndex, 0, movedStep)

    // Update order property
    reorderedSteps.forEach((step, index) => {
      step.order = index + 1
    })

    return reorderedSteps
  }

  const duplicateStep = step => {
    return {
      ...step,
      step_id: `step-${Date.now()}`,
      label: `${step.label} (Copy)`,
      order: step.order + 1,
    }
  }

  const getStepTypeIcon = type => {
    const icons = {
      inspection: 'CheckCircle',
      checkbox: 'Square',
      number: 'Calculator',
      text: 'Edit',
      attachments: 'Paperclip',
      service: 'Tools',
    }
    return icons[type] || 'Circle'
  }

  const getStepTypeColor = type => {
    const colors = {
      inspection: '#67c23a',
      checkbox: '#409eff',
      number: '#e6a23c',
      text: '#909399',
      attachments: '#849aec',
      service: '#df869d',
    }
    return colors[type] || '#c0c4cc'
  }

  // Change detection utilities
  const generateChangesSummary = (originalTemplate, currentTemplate, referenceData = {}) => {
    const changes = {
      metadata: [],
      steps_added: [],
      steps_modified: [],
      steps_deleted: [],
      steps_reordered: [],
    }

    // Compare metadata changes
    const metadataFields = [
      { key: 'name', label: 'Task Name' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'estimated_minutes', label: 'Estimated Time' },
      { key: 'applicable_assets', label: 'Applicable Assets' },
    ]

    metadataFields.forEach(field => {
      const original = originalTemplate[field.key]
      const current = currentTemplate[field.key]

      if (JSON.stringify(original) !== JSON.stringify(current)) {
        changes.metadata.push({
          field: field.key,
          label: field.label,
          original: formatValue(original, field.key, referenceData),
          current: formatValue(current, field.key, referenceData),
        })
      }
    })

    // Detect step changes
    const originalSteps = originalTemplate.steps || []
    const currentSteps = currentTemplate.steps || []
    const originalStepsMap = new Map(originalSteps.map(step => [step.step_id, step]))
    const currentStepsMap = new Map(currentSteps.map(step => [step.step_id, step]))

    // Find added steps
    currentSteps.forEach(step => {
      if (!originalStepsMap.has(step.step_id)) {
        changes.steps_added.push({
          step_id: step.step_id,
          label: step.label,
          type: step.type,
          position: step.order,
        })
      }
    })

    // Find deleted steps
    originalSteps.forEach(step => {
      if (!currentStepsMap.has(step.step_id)) {
        changes.steps_deleted.push({
          step_id: step.step_id,
          label: step.label,
          type: step.type,
          position: step.order,
        })
      }
    })

    // Find modified steps
    currentSteps.forEach(currentStep => {
      const originalStep = originalStepsMap.get(currentStep.step_id)
      if (originalStep) {
        const stepChanges = []

        // Compare basic properties
        const stepFields = [
          { key: 'label', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'required', label: 'Required' },
          { key: 'required_image', label: 'Image Required' },
          { key: 'type', label: 'Type' },
        ]

        stepFields.forEach(field => {
          if (originalStep[field.key] !== currentStep[field.key]) {
            stepChanges.push({
              field: field.key,
              label: field.label,
              original: formatValue(originalStep[field.key], field.key, referenceData),
              current: formatValue(currentStep[field.key], field.key, referenceData),
            })
          }
        })

        // Compare config
        if (JSON.stringify(originalStep.config) !== JSON.stringify(currentStep.config)) {
          stepChanges.push({
            field: 'config',
            label: 'Configuration',
            original: 'Modified',
            current: 'Modified',
          })
        }

        // Compare tools
        if (JSON.stringify(originalStep.relevant_tools) !== JSON.stringify(currentStep.relevant_tools)) {
          stepChanges.push({
            field: 'relevant_tools',
            label: 'Tools',
            original: `${(originalStep.relevant_tools || []).length} tools`,
            current: `${(currentStep.relevant_tools || []).length} tools`,
          })
        }

        if (stepChanges.length > 0) {
          changes.steps_modified.push({
            step_id: currentStep.step_id,
            label: currentStep.label,
            type: currentStep.type,
            changes: stepChanges,
          })
        }
      }
    })

    // Detect step reordering
    if (originalSteps.length === currentSteps.length) {
      const originalOrder = originalSteps.map(s => s.step_id)
      const currentOrder = currentSteps.map(s => s.step_id)

      if (JSON.stringify(originalOrder) !== JSON.stringify(currentOrder)) {
        // Find which steps moved
        const reorderedSteps = []
        currentSteps.forEach((step, index) => {
          const originalIndex = originalSteps.findIndex(s => s.step_id === step.step_id)
          if (originalIndex !== -1 && originalIndex !== index) {
            reorderedSteps.push({
              step_id: step.step_id,
              label: step.label,
              original_position: originalIndex + 1,
              new_position: index + 1,
            })
          }
        })
        changes.steps_reordered = reorderedSteps
      }
    }

    return changes
  }

  // Helper function to format values for display
  const formatValue = (value, fieldKey = '', referenceData = {}) => {
    if (value === null || value === undefined) return 'None'

    // Handle Category ID to Name transformation
    if (fieldKey === 'category') {
      if (typeof value === 'number' && referenceData.categories) {
        const category = referenceData.categories.find(cat => cat.value === value || cat.id === value)
        return category ? category.label : `Category ID: ${value}`
      }
      if (typeof value === 'string' && value.trim() === '') return 'None'
      return value.toString()
    }

    // Handle Applicable Assets ID to Name transformation
    if (fieldKey === 'applicable_assets') {
      if (Array.isArray(value)) {
        if (value.length === 0) return 'None'

        if (referenceData.equipmentTree && referenceData.equipmentTree.length > 0) {
          // Transform IDs to names using equipment tree data
          const assetNames = value
            .map(assetId => {
              const asset = findAssetInTree(referenceData.equipmentTree, assetId)
              if (asset) {
                return asset.label
              } else {
                // Fallback: try to find by converting types
                const numericId = parseInt(assetId)
                if (!isNaN(numericId)) {
                  const assetByNumId = findAssetInTree(referenceData.equipmentTree, numericId)
                  return assetByNumId ? assetByNumId.label : `Asset ID: ${assetId}`
                }
                return `Asset ID: ${assetId}`
              }
            })
            .filter(Boolean) // Remove any null/undefined entries

          return assetNames.length > 0 ? assetNames.join(', ') : 'None'
        } else {
          // Fallback when no equipment tree data
          return `${value.length} asset(s)`
        }
      }
      // Handle single value (might be from API as single equipment_node_id)
      if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
        if (referenceData.equipmentTree && referenceData.equipmentTree.length > 0) {
          const asset = findAssetInTree(referenceData.equipmentTree, value)
          return asset ? asset.label : `Asset ID: ${value}`
        } else {
          return `Asset ID: ${value}`
        }
      }
      return 'None'
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return 'None'
      return value.join(', ')
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') {
      if (fieldKey === 'estimated_minutes') return `${value} minutes`
      return value.toString()
    }
    if (typeof value === 'string' && value.trim() === '') return 'None'
    return value.toString()
  }

  // Helper function to find asset in equipment tree recursively
  const findAssetInTree = (treeData, assetId) => {
    if (!Array.isArray(treeData)) return null

    for (const node of treeData) {
      // Try different ID matching strategies
      if (
        node.value === assetId ||
        node.id === assetId ||
        parseInt(node.value) === parseInt(assetId) ||
        parseInt(node.id) === parseInt(assetId)
      ) {
        return node
      }

      if (node.children && node.children.length > 0) {
        const found = findAssetInTree(node.children, assetId)
        if (found) return found
      }
    }
    return null
  }

  // Check if there are any changes
  const hasChanges = changes => {
    return (
      changes.metadata.length > 0 ||
      changes.steps_added.length > 0 ||
      changes.steps_modified.length > 0 ||
      changes.steps_deleted.length > 0 ||
      changes.steps_reordered.length > 0
    )
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
    openChangeSummaryDialog,
    closeChangeSummaryDialog,
    setChangeSummaryLoading,

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
    getStepTypeColor,

    // Change detection
    generateChangesSummary,
    hasChanges,
  }
}

import { defineStore } from 'pinia'

export const useTemplateDesignerStore = defineStore( 'templateDesigner', {
  state : () => ( {
    focused_step_id : null,
    dragging : {
      is_dragging : false,
      source_step_id : null,
      target_step_id : null
    },
    floating_panel : {
      visible : true,
      mode : 'add_step' // 'add_step' or 'reorder_steps' two settings
    },
    dialogs : {
      number_limits : {
        visible : false,
        for_step_id : null,
        loading : false,
        form_data : {}
      },
      relevant_tools_picker : {
        visible : false,
        for_step_id : null,
        selected_tools : [],
        loading : false
      },
      resource_uploader : {
        visible : false,
        for_step_id : null,
        upload_progress : 0,
        uploading : false,
        form_data : {}
      }
    },
    validation : {
      errors : {},
      is_valid : true,
      dirty : false
    },
    ui_preferences : {
      theme : 'light',
      compact_mode : false,
      show_step_numbers : true,
      auto_save : true
    }
  } ),

  getters : {
    isStepFocused : state => stepId => {
      return state.focused_step_id === stepId
    },

    hasValidationErrors : state => {
      return Object.keys( state.validation.errors ).length > 0
    },

    getStepErrors : state => stepId => {
      return state.validation.errors[stepId] || []
    },

    isDragging : state => {
      return state.dragging.is_dragging
    },

    isDialogOpen : state => dialogName => {
      return state.dialogs[dialogName]?.visible || false
    }
  },

  actions : {
    // Focus management
    setFocusedStep( stepId ) {
      this.focused_step_id = stepId
    },

    clearFocus() {
      this.focused_step_id = null
    },

    // Drag and drop management
    startDrag( stepId ) {
      this.dragging.is_dragging = true
      this.dragging.source_step_id = stepId
      this.dragging.target_step_id = null
    },

    updateDragTarget( stepId ) {
      this.dragging.target_step_id = stepId
    },

    endDrag() {
      this.dragging.is_dragging = false
      this.dragging.source_step_id = null
      this.dragging.target_step_id = null
    },

    // Floating panel management
    setFloatingPanelMode( mode ) {
      this.floating_panel.mode = mode
    },

    toggleFloatingPanel() {
      this.floating_panel.visible = !this.floating_panel.visible
    },

    showFloatingPanel() {
      this.floating_panel.visible = true
    },

    hideFloatingPanel() {
      this.floating_panel.visible = false
    },

    // Dialog management
    openDialog( dialogName, stepId = null, initialData = {} ) {
      if ( this.dialogs[dialogName] ) {
        this.dialogs[dialogName].visible = true
        this.dialogs[dialogName].for_step_id = stepId

        // Handle specific dialog types
        // eslint-disable-next-line default-case
        switch ( dialogName ) {
          case 'number_limits':
            this.dialogs[dialogName].form_data = { ...initialData }
            break
          case 'relevant_tools_picker':
            this.dialogs[dialogName].selected_tools = [...( initialData.selected_tools || [] )]
            break
          case 'resource_uploader':
            this.dialogs[dialogName].upload_progress = 0
            this.dialogs[dialogName].uploading = false
            this.dialogs[dialogName].form_data = { ...initialData }
            break
        }
      }
    },

    closeDialog( dialogName ) {
      if ( this.dialogs[dialogName] ) {
        this.dialogs[dialogName].visible = false
        this.dialogs[dialogName].for_step_id = null
        this.dialogs[dialogName].loading = false

        // Reset specific dialog state
        // eslint-disable-next-line default-case
        switch ( dialogName ) {
          case 'number_limits':
            this.dialogs[dialogName].form_data = {}
            break
          case 'relevant_tools_picker':
            this.dialogs[dialogName].selected_tools = []
            break
          case 'resource_uploader':
            this.dialogs[dialogName].upload_progress = 0
            this.dialogs[dialogName].uploading = false
            this.dialogs[dialogName].form_data = {}
            break
        }
      }
    },

    setDialogLoading( dialogName, loading ) {
      if ( this.dialogs[dialogName] ) {
        this.dialogs[dialogName].loading = loading
      }
    },

    // Tools picker specific actions
    setSelectedTools( tools ) {
      this.dialogs.relevant_tools_picker.selected_tools = [...tools]
    },

    addSelectedTool( tool ) {
      if ( !this.dialogs.relevant_tools_picker.selected_tools.includes( tool.tool_id ) ) {
        this.dialogs.relevant_tools_picker.selected_tools.push( tool.tool_id )
      }
    },

    removeSelectedTool( toolId ) {
      this.dialogs.relevant_tools_picker.selected_tools = this.dialogs.relevant_tools_picker.selected_tools.filter(
        id => id !== toolId
      )
    },

    // Resource uploader specific actions
    setUploadProgress( progress ) {
      this.dialogs.resource_uploader.upload_progress = progress
    },

    setUploading( uploading ) {
      this.dialogs.resource_uploader.uploading = uploading
    },

    // Validation management
    setValidationError( stepId, errors ) {
      if ( errors && errors.length > 0 ) {
        this.validation.errors[stepId] = errors
      } else {
        delete this.validation.errors[stepId]
      }
      this.updateValidationStatus()
    },

    clearValidationErrors( stepId = null ) {
      if ( stepId ) {
        delete this.validation.errors[stepId]
      } else {
        this.validation.errors = {}
      }
      this.updateValidationStatus()
    },

    updateValidationStatus() {
      this.validation.is_valid = Object.keys( this.validation.errors ).length === 0
    },

    setDirty( dirty = true ) {
      this.validation.dirty = dirty
    },

    // UI preferences
    updatePreference( key, value ) {
      this.ui_preferences[key] = value
    },

    toggleCompactMode() {
      this.ui_preferences.compact_mode = !this.ui_preferences.compact_mode
    },

    toggleStepNumbers() {
      this.ui_preferences.show_step_numbers = !this.ui_preferences.show_step_numbers
    },

    // Reset all state
    resetDesignerState() {
      this.focused_step_id = null
      this.dragging = {
        is_dragging : false,
        source_step_id : null,
        target_step_id : null
      }
      this.validation = {
        errors : {},
        is_valid : true,
        dirty : false
      }

      // Close all dialogs
      Object.keys( this.dialogs ).forEach( dialogName => {
        this.closeDialog( dialogName )
      } )
    }
  }
} )

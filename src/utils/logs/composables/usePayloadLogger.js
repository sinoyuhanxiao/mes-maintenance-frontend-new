import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * Centralized payload logging composable
 * Provides a reusable interface for logging payloads across different forms and components
 */
export function usePayloadLogger() {
  // State
  const currentPayload = ref( null )
  const showJsonDisplayer = ref( false )
  const isLogging = ref( false )

  // Configuration for different form types
  const formConfigs = ref( {
    workOrder : {
      title : 'Work Order Payload',
      subtitle : "Click 'Logs' to refresh",
      buttonSelectors : [
        'div.form-actions-fixed > div.form-actions-content > button.el-button',
        'button.create-button',
        'button[type="submit"]',
        '.submit-button'
      ]
    },
    template : {
      title : 'Template Payload',
      subtitle : "Click 'Logs' to refresh",
      buttonSelectors : ['button.submit-button', 'button[type="submit"]', '.form-actions button.primary']
    },
    standard : {
      title : 'Standard Payload',
      subtitle : "Click 'Logs' to refresh",
      buttonSelectors : ['button.submit-button', 'button[type="submit"]', '.form-actions button.primary']
    },
    generic : {
      title : 'Form Payload',
      subtitle : "Click 'Logs' to refresh",
      buttonSelectors : ['button[type="submit"]', 'button.submit-button', 'button.primary', '.form-actions button']
    }
  } )

  /**
   * Find and return the first available submit button element
   * @param {string} formType - The type of form (workOrder, template, standard, generic)
   * @param {Element} container - Optional container to search within
   * @returns {Element|null} - The found button element or null
   */
  const findSubmitButton = ( formType = 'generic', container = document ) => {
    const config = formConfigs.value[formType] || formConfigs.value.generic

    for ( const selector of config.buttonSelectors ) {
      const button = container.querySelector( selector )
      if ( button ) {
        return button
      }
    }

    return null
  }

  /**
   * Get configuration for a specific form type
   * @param {string} formType - The type of form
   * @returns {Object} - Configuration object
   */
  const getFormConfig = ( formType = 'generic' ) => {
    return formConfigs.value[formType] || formConfigs.value.generic
  }

  /**
   * Log payload and display in debug drawer
   * @param {Object} payload - The payload to log
   * @param {string} formType - The type of form (optional)
   * @param {Object} options - Additional options
   */
  const logPayload = async( payload, formType = 'generic', options = {} ) => {
    try {
      isLogging.value = true

      // Clone the payload to prevent mutations
      const clonedPayload = payload ? JSON.parse( JSON.stringify( payload ) ) : null

      // Update current payload
      currentPayload.value = clonedPayload

      // Show debug drawer with a small delay to prevent conflicts
      setTimeout( () => {
        showJsonDisplayer.value = true
        isLogging.value = false
      }, options.delay || 50 )

      // Optional success message
      if ( options.showMessage !== false ) {
        ElMessage.success( 'Payload logged successfully' )
      }

      return clonedPayload
    } catch ( error ) {
      console.error( 'Failed to log payload:', error )
      ElMessage.error( 'Failed to log payload' )
      isLogging.value = false
      return null
    }
  }

  /**
   * Close the debug drawer
   */
  const closeDebugDrawer = () => {
    showJsonDisplayer.value = false
  }

  /**
   * Clear the current payload
   */
  const clearPayload = () => {
    currentPayload.value = null
  }

  /**
   * Copy payload to clipboard
   */
  const copyPayloadToClipboard = async() => {
    try {
      if ( !currentPayload.value ) {
        ElMessage.warning( 'No payload to copy' )
        return false
      }

      const jsonString = JSON.stringify( currentPayload.value, null, 2 )
      await navigator.clipboard.writeText( jsonString )
      ElMessage.success( 'Payload copied to clipboard!' )
      return true
    } catch ( error ) {
      console.error( 'Failed to copy to clipboard:', error )
      ElMessage.error( 'Failed to copy to clipboard' )
      return false
    }
  }

  /**
   * Add click listener to submit button for automatic payload logging
   * @param {Object} payloadRef - Reactive reference to the payload
   * @param {string} formType - The type of form
   * @param {Element} container - Optional container to search within
   */
  const attachPayloadLogger = ( payloadRef, formType = 'generic', container = document ) => {
    const button = findSubmitButton( formType, container )

    if ( button ) {
      const handleClick = () => {
        logPayload( payloadRef.value, formType )
      }

      // Remove existing listener if any
      button.removeEventListener( 'click', handleClick )
      // Add new listener
      button.addEventListener( 'click', handleClick )

      return () => button.removeEventListener( 'click', handleClick )
    }

    return null
  }

  /**
   * Auto-detect form type based on current route or component
   * @param {Object} route - Vue router route object
   * @returns {string} - Detected form type
   */
  const detectFormType = route => {
    if ( !route ) return 'generic'

    const path = route.path.toLowerCase()
    const name = route.name?.toLowerCase() || ''

    if ( path.includes( 'work-order' ) || name.includes( 'workorder' ) ) {
      return 'workOrder'
    } else if ( path.includes( 'template' ) || name.includes( 'template' ) ) {
      return 'template'
    } else if ( path.includes( 'standard' ) || name.includes( 'standard' ) ) {
      return 'standard'
    }

    return 'generic'
  }

  // Computed properties
  const hasPayload = computed( () => currentPayload.value !== null )
  const payloadFieldCount = computed( () => {
    return currentPayload.value ? Object.keys( currentPayload.value ).length : 0
  } )

  return {
    // State
    currentPayload,
    showJsonDisplayer,
    isLogging,

    // Configuration
    formConfigs,

    // Methods
    logPayload,
    closeDebugDrawer,
    clearPayload,
    copyPayloadToClipboard,
    findSubmitButton,
    getFormConfig,
    attachPayloadLogger,
    detectFormType,

    // Computed
    hasPayload,
    payloadFieldCount
  }
}

export default usePayloadLogger

/**
 * Error Handling Composable
 * Provides centralized error handling and user feedback
 */
import { ref } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useErrorHandler() {
  const { t } = useI18n()
  const loading = ref( false )
  const error = ref( null )

  /**
   * Handle API errors with user-friendly messages
   * @param {Error} err - The error object
   * @param {string} context - Context where error occurred
   * @param {Object} options - Additional options
   */
  const handleError = ( err, context = 'general', options = {} ) => {
    console.error( `Error in ${context}:`, err )

    error.value = err
    loading.value = false

    const { showNotification = false, showMessage = true, customMessage = null, duration = 3000 } = options

    let message = customMessage

    if ( !message ) {
      // Determine error message based on error type and context
      if ( err.response ) {
        const status = err.response.status
        switch ( status ) {
          case 400:
            message = t( 'errors.badRequest' )
            break
          case 401:
            message = t( 'errors.unauthorized' )
            break
          case 403:
            message = t( 'errors.forbidden' )
            break
          case 404:
            message = t( 'errors.notFound' )
            break
          case 422:
            message = t( 'errors.validationError' )
            break
          case 500:
            message = t( 'errors.serverError' )
            break
          default:
            message = t( 'errors.unknownError' )
        }
      } else if ( err.code === 'NETWORK_ERROR' ) {
        message = t( 'errors.networkError' )
      } else {
        message = err.message || t( 'errors.unknownError' )
      }
    }

    // Show user feedback
    if ( showNotification ) {
      ElNotification( {
        title : t( 'common.error' ),
        message,
        type : 'error',
        duration
      } )
    } else if ( showMessage ) {
      ElMessage.error( {
        message,
        duration
      } )
    }

    return { error : err, message }
  }

  /**
   * Handle async operations with loading state and error handling
   * @param {Function} asyncFn - The async function to execute
   * @param {Object} options - Options for error handling
   */
  const handleAsync = async( asyncFn, options = {} ) => {
    const {
      loadingRef = loading,
      context = 'async operation',
      onSuccess = null,
      onError = null,
      ...errorOptions
    } = options

    try {
      loadingRef.value = true
      error.value = null

      const result = await asyncFn()

      if ( onSuccess ) {
        onSuccess( result )
      }

      return result
    } catch ( err ) {
      const errorResult = handleError( err, context, errorOptions )

      if ( onError ) {
        onError( errorResult )
      }

      throw err
    } finally {
      loadingRef.value = false
    }
  }

  /**
   * Show confirmation dialog before executing dangerous operations
   * @param {Object} options - Confirmation options
   */
  const confirmAction = async( options = {} ) => {
    const {
      title = t( 'common.confirm' ),
      message = t( 'common.confirmMessage' ),
      confirmButtonText = t( 'common.confirm' ),
      cancelButtonText = t( 'common.cancel' ),
      type = 'warning'
    } = options

    try {
      await ElMessageBox.confirm( message, title, {
        confirmButtonText,
        cancelButtonText,
        type
      } )
      return true
    } catch {
      return false
    }
  }

  /**
   * Show success message
   * @param {string} message - Success message
   * @param {Object} options - Message options
   */
  const showSuccess = ( message, options = {} ) => {
    const { showNotification = false, duration = 2000 } = options

    if ( showNotification ) {
      ElNotification( {
        title : t( 'common.success' ),
        message,
        type : 'success',
        duration
      } )
    } else {
      ElMessage.success( {
        message,
        duration
      } )
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Retry mechanism for failed operations
   * @param {Function} operation - The operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   */
  const retry = async( operation, maxRetries = 3, delay = 1000 ) => {
    let lastError

    for ( let i = 0; i <= maxRetries; i++ ) {
      try {
        return await operation()
      } catch ( err ) {
        lastError = err

        if ( i === maxRetries ) {
          throw err
        }

        // Wait before retrying
        await new Promise( resolve => setTimeout( resolve, delay ) )
      }
    }

    throw lastError
  }

  return {
    loading,
    error,
    handleError,
    handleAsync,
    confirmAction,
    showSuccess,
    clearError,
    retry
  }
}

/**
 * Form Error Handling Composable
 * Specialized error handling for form validation
 */
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler()

  const fieldErrors = ref( {} )

  /**
   * Handle form validation errors
   * @param {Object} errors - Validation errors object
   */
  const handleValidationErrors = errors => {
    fieldErrors.value = {}

    if ( errors && typeof errors === 'object' ) {
      Object.keys( errors ).forEach( field => {
        const error = errors[field]
        if ( Array.isArray( error ) ) {
          fieldErrors.value[field] = error[0]
        } else {
          fieldErrors.value[field] = error
        }
      } )
    }
  }

  /**
   * Clear field errors
   * @param {string|Array} fields - Field name(s) to clear
   */
  const clearFieldErrors = ( fields = null ) => {
    if ( !fields ) {
      fieldErrors.value = {}
    } else if ( Array.isArray( fields ) ) {
      fields.forEach( field => {
        delete fieldErrors.value[field]
      } )
    } else {
      delete fieldErrors.value[fields]
    }
  }

  /**
   * Get error message for a specific field
   * @param {string} field - Field name
   */
  const getFieldError = field => {
    return fieldErrors.value[field] || null
  }

  /**
   * Check if field has error
   * @param {string} field - Field name
   */
  const hasFieldError = field => {
    return !!fieldErrors.value[field]
  }

  return {
    fieldErrors,
    handleValidationErrors,
    clearFieldErrors,
    getFieldError,
    hasFieldError,
    handleError
  }
}

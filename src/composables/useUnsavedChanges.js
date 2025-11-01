import { ref, watch, computed } from 'vue'
import { isEqual, cloneDeep } from 'lodash-es'

/**
 * Composable for tracking unsaved changes in forms
 * @param {Object} initialData - The initial form data
 * @param {Object} currentData - The current form data (reactive)
 * @returns {Object} - Methods and state for managing unsaved changes
 */
export function useUnsavedChanges(initialData, currentData) {
  const initialFormData = ref(cloneDeep(initialData))
  const hasUnsavedChanges = ref(false)
  const pendingNavigation = ref(null)

  // Track if current data differs from initial data
  const hasChanges = computed(() => {
    return !isEqual(initialFormData.value, currentData.value)
  })

  // Update hasUnsavedChanges when form data changes
  watch(
    hasChanges,
    newValue => {
      hasUnsavedChanges.value = newValue
    },
    { deep: true, immediate: true }
  )

  // Reset the initial data (useful after saving or when starting fresh)
  const resetInitialData = newData => {
    initialFormData.value = cloneDeep(newData || currentData.value)
    hasUnsavedChanges.value = false
  }

  // Mark changes as saved (without changing the current data)
  const markAsSaved = () => {
    initialFormData.value = cloneDeep(currentData.value)
    hasUnsavedChanges.value = false
  }

  // Set pending navigation action
  const setPendingNavigation = navigationFn => {
    pendingNavigation.value = navigationFn
  }

  // Execute pending navigation
  const executePendingNavigation = () => {
    if (pendingNavigation.value && typeof pendingNavigation.value === 'function') {
      pendingNavigation.value()
      pendingNavigation.value = null
    }
  }

  // Clear pending navigation
  const clearPendingNavigation = () => {
    pendingNavigation.value = null
  }

  return {
    hasUnsavedChanges,
    hasChanges,
    resetInitialData,
    markAsSaved,
    setPendingNavigation,
    executePendingNavigation,
    clearPendingNavigation,
  }
}

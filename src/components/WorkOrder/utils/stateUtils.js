/**
 * Utility functions for work order state management
 * Provides consistent state color mapping and display logic
 */

/**
 * Get the semantic color type for a work order state
 * Maps all possible work order states to Element Plus tag types
 *
 * @param {string|number} state - State name or ID
 * @returns {string} Element Plus tag type (success, warning, danger, info, primary)
 */
export const getStateTagType = state => {
  // Handle both state name and state object
  const stateName = typeof state === 'object' ? state?.name : state

  if ( !stateName ) return 'info'

  switch ( stateName ) {
    // Active/Success states - green
    case 'Ready':
    case 'Completed':
      return 'success'

    // In Progress - primary blue
    case 'In Progress':
    case 'In progress':
      return 'primary'

    // Warning states - orange/yellow
    case 'Pending':
    case 'Held':
    case 'Suspended':
    case 'Pending Approval':
      return 'warning'

    // Critical/Error states - red
    case 'Failed':
    case 'Incomplete':
    case 'Aborted':
      return 'danger'

    // Neutral/Info states - gray
    case 'Forecast':
    case 'Released':
    case 'Closed':
    case 'Cancelled':
    default:
      return 'info'
  }
}

/**
 * Get the tag effect for a work order state
 * Determines whether to use 'dark', 'light', or 'plain' effect
 *
 * @param {string|number} state - State name or ID
 * @returns {string} Element Plus tag effect
 */
export const getStateTagEffect = state => {
  const stateName = typeof state === 'object' ? state?.name : state

  if ( !stateName ) return 'plain'

  // Use dark effect for critical/attention-needed states
  switch ( stateName ) {
    case 'Incomplete':
    case 'Pending Approval':
      return 'dark'
    default:
      return 'plain'
  }
}

/**
 * Get a descriptive label for the state
 * Can be extended with i18n support
 *
 * @param {string|number} state - State name or ID
 * @returns {string} Display label for the state
 */
export const getStateLabel = state => {
  const stateName = typeof state === 'object' ? state?.name : state
  return stateName || '-'
}

/**
 * Check if a state is a terminal state (no further action expected)
 *
 * @param {string|number} state - State name or ID
 * @returns {boolean} True if state is terminal
 */
export const isTerminalState = state => {
  const stateName = typeof state === 'object' ? state?.name : state
  const terminalStates = ['Completed', 'Closed', 'Aborted', 'Cancelled']
  return terminalStates.includes( stateName )
}

/**
 * Check if a state indicates a problem or failure
 *
 * @param {string|number} state - State name or ID
 * @returns {boolean} True if state indicates a problem
 */
export const isProblemState = state => {
  const stateName = typeof state === 'object' ? state?.name : state
  const problemStates = ['Failed', 'Incomplete', 'Aborted']
  return problemStates.includes( stateName )
}

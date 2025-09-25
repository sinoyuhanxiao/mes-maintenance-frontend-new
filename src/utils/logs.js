import { ref } from 'vue'

/**
 * Composable for payload logging and debugging
 * @returns {Object} - Payload logging utilities
 */
export const usePayloadLogger = () => {
  const currentPayload = ref(null)
  const showJsonDisplayer = ref(false)

  const logPayload = (payload, context = 'default', metadata = {}) => {
    // Store only the clean payload for the drawer
    const cleanPayload = clonePayload(payload)
    currentPayload.value = cleanPayload
    showJsonDisplayer.value = true

    // Log enriched payload to console for development
    const enrichedPayload = {
      timestamp: new Date().toISOString(),
      context,
      metadata,
      data: cleanPayload
    }
    console.log(`[${context}] Payload Debug:`, enrichedPayload)
  }

  const closeDebugDrawer = () => {
    showJsonDisplayer.value = false
  }

  return {
    currentPayload,
    showJsonDisplayer,
    logPayload,
    closeDebugDrawer
  }
}

/**
 * Deep clone payload data
 * @param {any} payload - Data to clone
 * @returns {any} - Cloned data
 */
export const clonePayload = (payload) => {
  if (payload === null || payload === undefined) {
    return payload
  }

  if (typeof payload !== 'object') {
    return payload
  }

  if (payload instanceof Date) {
    return new Date(payload.getTime())
  }

  if (Array.isArray(payload)) {
    return payload.map(item => clonePayload(item))
  }

  const cloned = {}
  for (const key in payload) {
    if (payload.hasOwnProperty(key)) {
      cloned[key] = clonePayload(payload[key])
    }
  }

  return cloned
}

/**
 * Transform payload for different contexts
 * @param {Object} payload - Original payload
 * @param {string} context - Transformation context
 * @returns {Object} - Transformed payload
 */
export const transformPayload = (payload, context = 'default') => {
  const transformed = clonePayload(payload)

  // Add transformation metadata
  transformed._transform = {
    context,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }

  // Context-specific transformations
  switch (context) {
    case 'workOrderCreate':
      transformed._context = 'Work Order Creation'
      break
    case 'workOrderUpdate':
      transformed._context = 'Work Order Update'
      break
    case 'workOrderEdit':
      transformed._context = 'Work Order Edit'
      break
    default:
      transformed._context = 'Generic'
  }

  return transformed
}

// Export the advanced JsonDebugDrawer component
export { default as JsonDebugDrawer } from '@/utils/logs/components/JsonDebugDrawer.vue'
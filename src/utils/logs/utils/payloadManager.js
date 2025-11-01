/**
 * Centralized payload management utility
 * Provides a single source of truth for payload operations across the application
 */

/**
 * Deep clone a payload object to prevent mutations
 * @param {Object} payload - The payload to clone
 * @returns {Object} - Cloned payload
 */
export const clonePayload = payload => {
  if (!payload) return {}

  try {
    return JSON.parse(JSON.stringify(payload))
  } catch (error) {
    console.error('Failed to clone payload:', error)
    return {}
  }
}

/**
 * Merge multiple payloads with deep cloning
 * @param {...Object} payloads - Payloads to merge
 * @returns {Object} - Merged payload
 */
export const mergePayloads = (...payloads) => {
  return payloads.reduce((merged, payload) => {
    if (!payload) return merged

    const cloned = clonePayload(payload)
    return { ...merged, ...cloned }
  }, {})
}

/**
 * Clean payload by removing null/undefined values
 * @param {Object} payload - Payload to clean
 * @param {Object} options - Cleaning options
 * @returns {Object} - Cleaned payload
 */
export const cleanPayload = (payload, options = {}) => {
  const {
    removeNull = true,
    removeUndefined = true,
    removeEmptyStrings = false,
    removeEmptyArrays = false,
    removeEmptyObjects = false,
    requiredFields = [],
  } = options

  if (!payload || typeof payload !== 'object') return {}

  const cleaned = clonePayload(payload)

  Object.keys(cleaned).forEach(key => {
    const value = cleaned[key]
    const isRequired = requiredFields.includes(key)

    // Handle required fields with defaults
    if (isRequired && (value === null || value === undefined)) {
      if (key === 'category_ids' || key === 'equipment_node_ids') {
        cleaned[key] = []
      } else if (key === 'task_add_list') {
        cleaned[key] = []
      } else if (key === 'recurrence_setting_request') {
        cleaned[key] = {}
      }
      return
    }

    // Remove based on conditions
    if (
      (removeNull && value === null) ||
      (removeUndefined && value === undefined) ||
      (removeEmptyStrings && value === '') ||
      (removeEmptyArrays && Array.isArray(value) && value.length === 0) ||
      (removeEmptyObjects &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
    ) {
      delete cleaned[key]
    }
  })

  return cleaned
}

/**
 * Validate payload structure against a schema
 * @param {Object} payload - Payload to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
export const validatePayload = (payload, schema) => {
  const errors = []
  const warnings = []

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object')
    return { isValid: false, errors, warnings }
  }

  if (!schema || typeof schema !== 'object') {
    warnings.push('No validation schema provided')
    return { isValid: true, errors, warnings }
  }

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    schema.required.forEach(field => {
      if (!(field in payload) || payload[field] === null || payload[field] === undefined) {
        errors.push(`Required field '${field}' is missing or null`)
      }
    })
  }

  // Check field types
  if (schema.fields && typeof schema.fields === 'object') {
    Object.keys(schema.fields).forEach(field => {
      if (field in payload) {
        const expectedType = schema.fields[field]
        const actualValue = payload[field]
        const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue

        if (expectedType !== actualType && actualValue !== null) {
          warnings.push(`Field '${field}' expected type '${expectedType}', got '${actualType}'`)
        }
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Transform payload for different API endpoints
 * @param {Object} payload - Source payload
 * @param {string} transformType - Type of transformation
 * @returns {Object} - Transformed payload
 */
export const transformPayload = (payload, transformType) => {
  if (!payload) return {}

  const cloned = clonePayload(payload)

  switch (transformType) {
    case 'workOrderCreate':
      return transformWorkOrderPayload(cloned)
    case 'templateCreate':
      return transformTemplatePayload(cloned)
    case 'standardCreate':
      return transformStandardPayload(cloned)
    default:
      return cloned
  }
}

/**
 * Transform payload for work order creation
 * @param {Object} payload - Work order payload
 * @returns {Object} - Transformed payload
 */
const transformWorkOrderPayload = payload => {
  // Ensure required arrays exist
  if (!payload.category_ids) payload.category_ids = []
  if (!payload.equipment_node_ids) payload.equipment_node_ids = []
  if (!payload.task_add_list) payload.task_add_list = []

  // Transform task_add_list
  if (Array.isArray(payload.task_add_list)) {
    payload.task_add_list = payload.task_add_list.map(task => {
      const normalizedTask = clonePayload(task)
      normalizedTask.work_order_id = normalizedTask.work_order_id ?? 0
      normalizedTask.state = normalizedTask.state ?? 'pending'
      normalizedTask.time_estimate_sec =
        normalizedTask.time_estimate_sec && normalizedTask.time_estimate_sec > 0
          ? normalizedTask.time_estimate_sec
          : 1800
      normalizedTask.steps = Array.isArray(normalizedTask.steps) ? normalizedTask.steps : []
      return normalizedTask
    })
  }

  // Clean up null/undefined values with required field handling
  return cleanPayload(payload, {
    requiredFields: ['category_ids', 'equipment_node_ids', 'task_add_list', 'recurrence_setting_request'],
  })
}

/**
 * Transform payload for template creation
 * @param {Object} payload - Template payload
 * @returns {Object} - Transformed payload
 */
const transformTemplatePayload = payload => {
  // Ensure steps array exists
  if (!payload.steps) payload.steps = []

  // Transform steps if needed
  if (Array.isArray(payload.steps)) {
    payload.steps = payload.steps.map(step => {
      const normalizedStep = clonePayload(step)
      // Add any template-specific step transformations here
      return normalizedStep
    })
  }

  return cleanPayload(payload)
}

/**
 * Transform payload for standard creation
 * @param {Object} payload - Standard payload
 * @returns {Object} - Transformed payload
 */
const transformStandardPayload = payload => {
  // Ensure items array exists
  if (!payload.items) payload.items = []

  // Transform items if needed
  if (Array.isArray(payload.items)) {
    payload.items = payload.items.map(item => {
      const normalizedItem = clonePayload(item)
      // Add any standard-specific item transformations here
      return normalizedItem
    })
  }

  return cleanPayload(payload)
}

/**
 * Get payload size information
 * @param {Object} payload - Payload to analyze
 * @returns {Object} - Size information
 */
export const getPayloadInfo = payload => {
  if (!payload) {
    return {
      fieldCount: 0,
      sizeBytes: 0,
      sizeKB: 0,
      depth: 0,
    }
  }

  const jsonString = JSON.stringify(payload)
  const sizeBytes = new Blob([jsonString]).size

  const getDepth = (obj, currentDepth = 0) => {
    if (typeof obj !== 'object' || obj === null) return currentDepth

    const depths = Object.values(obj).map(value => getDepth(value, currentDepth + 1))
    return Math.max(currentDepth, ...depths)
  }

  return {
    fieldCount: Object.keys(payload).length,
    sizeBytes,
    sizeKB: Math.round((sizeBytes / 1024) * 100) / 100,
    depth: getDepth(payload),
  }
}

/**
 * Compare two payloads and return differences
 * @param {Object} payload1 - First payload
 * @param {Object} payload2 - Second payload
 * @returns {Object} - Comparison result
 */
export const comparePayloads = (payload1, payload2) => {
  const differences = []
  const allKeys = new Set([...Object.keys(payload1 || {}), ...Object.keys(payload2 || {})])

  allKeys.forEach(key => {
    const val1 = payload1?.[key]
    const val2 = payload2?.[key]

    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      differences.push({
        key,
        payload1Value: val1,
        payload2Value: val2,
        type: val1 === undefined ? 'added' : val2 === undefined ? 'removed' : 'modified',
      })
    }
  })

  return {
    areEqual: differences.length === 0,
    differences,
    differenceCount: differences.length,
  }
}

// Validation schemas for common payload types
export const payloadSchemas = {
  workOrder: {
    required: ['name', 'category_ids', 'equipment_node_ids'],
    fields: {
      name: 'string',
      description: 'string',
      category_ids: 'array',
      equipment_node_ids: 'array',
      task_add_list: 'array',
      due_date: 'string',
      start_date: 'string',
      priority: 'string',
      recurrence_setting_request: 'object',
    },
  },
  template: {
    required: ['name', 'steps'],
    fields: {
      name: 'string',
      description: 'string',
      steps: 'array',
      category: 'string',
      time_estimate_sec: 'number',
    },
  },
  standard: {
    required: ['name', 'items'],
    fields: {
      name: 'string',
      description: 'string',
      items: 'array',
      category: 'string',
    },
  },
}

export default {
  clonePayload,
  mergePayloads,
  cleanPayload,
  validatePayload,
  transformPayload,
  getPayloadInfo,
  comparePayloads,
  payloadSchemas,
}

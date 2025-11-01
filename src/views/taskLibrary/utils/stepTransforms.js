/**
 * Utility helpers for Template Designer step data transformations.
 * Provides functions to map, transform, and format step configuration data
 * between backend API and designer formats.
 */

export const getDefaultStepConfig = stepType => {
  const configs = {
    inspection: {
      kind: 'inspection',
      choices: ['pass', 'fail'],
      default: 'pass',
      require_comment_on_fail: false,
      require_photo_on_fail: false,
    },
    checkbox: {
      kind: 'checkbox',
      default: false,
    },
    number: {
      kind: 'number',
      unit: '',
      decimal_places: 0,
      limits: null,
      default_value: 0,
    },
    text: {
      kind: 'text',
      multiline: true,
      max_length: 1000,
      default_value: '',
    },
    attachments: {
      kind: 'attachments',
      allow_types: ['image', 'pdf'],
      max_files: 5,
      max_file_size_mb: 10,
    },
    // service type is disabled temporarily
    // service: {
    //   kind: 'service',
    //   service_type: 'Replace',
    //   device_tag: 'P100016',
    //   quantity: 1,
    // },
  }

  return configs[stepType] || {}
}

/**
 * Maps a backend API step type to the corresponding designer step type.
 * @param {string} apiType - The step type string from the backend API.
 * @returns {string} The mapped designer step type.
 */
export const mapApiStepTypeToDesigner = apiType => {
  const typeMap = {
    numeric: 'number',
    boolean: 'checkbox',
    checkbox: 'checkbox',
    text: 'text',
    file: 'attachments',
    inspection: 'inspection',
    service: 'service',
  }
  return typeMap[apiType] || 'text'
}

export const transformApiToolsToDesigner = apiTools => {
  if (!Array.isArray(apiTools)) return []
  return apiTools.map(tool => ({
    tool_id: tool.id,
    name: tool.name || 'Unnamed Tool',
  }))
}

export const transformApiStepConfigToDesigner = (stepType, apiValue) => {
  const baseConfig = {
    required_image: Boolean(apiValue.require_image),
  }

  switch (stepType) {
    case 'number':
      return {
        ...baseConfig,
        kind: 'number',
        unit: apiValue.unit || '',
        decimal_places: apiValue.decimal_places || 0,
        default_value: typeof apiValue.value === 'number' ? apiValue.value : 0,
        limits: transformLimitsFromBackend(apiValue.numeric_limit_bounds),
      }

    case 'checkbox':
      return {
        ...baseConfig,
        kind: 'checkbox',
        default: Boolean(apiValue.value),
      }

    case 'text':
      return {
        ...baseConfig,
        kind: 'text',
        multiline: true,
        max_length: 1000,
        default_value: String(apiValue.value || ''),
      }

    case 'inspection':
      return {
        ...baseConfig,
        kind: 'inspection',
        choices: ['pass', 'fail'],
        default: apiValue.value ? 'pass' : 'fail',
        require_comment_on_fail: false,
        require_photo_on_fail: false,
      }

    case 'attachments':
      return {
        ...baseConfig,
        kind: 'attachments',
        allow_types: ['image', 'pdf'],
        max_files: 5,
        max_file_size_mb: 10,
      }

    default:
      return baseConfig
  }
}

export const transformApiStepToDesignerStep = (apiStep, index) => {
  const stepValue = apiStep.value || {}
  const stepType = mapApiStepTypeToDesigner(stepValue.type)

  return {
    step_id: apiStep.id || apiStep._id || `step-${Date.now()}-${index}`,
    order: index + 1,
    type: stepType,
    label: apiStep.name || `Step ${index + 1}`,
    description: apiStep.description || '',
    required: Boolean(apiStep.required),
    required_image: Boolean(stepValue.require_image),
    relevant_tools: transformApiToolsToDesigner(apiStep.tools || []),
    relevant_resources: apiStep.relevant_resources || [],
    config: transformApiStepConfigToDesigner(stepType, stepValue),
  }
}

export const transformApplicableAssets = equipmentNodeId => {
  // Return the single ID directly, not as an array
  return equipmentNodeId || null
}

// Transform NumberLimitsPanel format to backend API format
export const transformLimitsToBackend = limitsData => {
  if (!limitsData || (limitsData.lower === null && limitsData.upper === null)) {
    return {
      lower_limit_exclusive: null,
      lower_limit_inclusive: null,
      upper_limit_exclusive: null,
      upper_limit_inclusive: null,
      equal_to: null,
    }
  }

  const result = {
    lower_limit_exclusive: null,
    lower_limit_inclusive: null,
    upper_limit_exclusive: null,
    upper_limit_inclusive: null,
    equal_to: null,
  }

  // Handle lower limit
  if (limitsData.lower !== null && limitsData.lower !== undefined) {
    if (limitsData.inclusive?.lower) {
      result.lower_limit_inclusive = limitsData.lower
    } else {
      result.lower_limit_exclusive = limitsData.lower
    }
  }

  // Handle upper limit
  if (limitsData.upper !== null && limitsData.upper !== undefined) {
    if (limitsData.inclusive?.upper) {
      result.upper_limit_inclusive = limitsData.upper
    } else {
      result.upper_limit_exclusive = limitsData.upper
    }
  }

  return result
}

// Transform backend API format to NumberLimitsPanel format
export const transformLimitsFromBackend = backendLimits => {
  if (!backendLimits) {
    return {
      lower: null,
      upper: null,
      inclusive: {
        lower: true,
        upper: true,
      },
    }
  }

  const result = {
    lower: null,
    upper: null,
    inclusive: {
      lower: true,
      upper: true,
    },
  }

  // Handle lower limits
  if (backendLimits.lower_limit_inclusive !== null && backendLimits.lower_limit_inclusive !== undefined) {
    result.lower = backendLimits.lower_limit_inclusive
    result.inclusive.lower = true
  } else if (backendLimits.lower_limit_exclusive !== null && backendLimits.lower_limit_exclusive !== undefined) {
    result.lower = backendLimits.lower_limit_exclusive
    result.inclusive.lower = false
  }

  // Handle upper limits
  if (backendLimits.upper_limit_inclusive !== null && backendLimits.upper_limit_inclusive !== undefined) {
    result.upper = backendLimits.upper_limit_inclusive
    result.inclusive.upper = true
  } else if (backendLimits.upper_limit_exclusive !== null && backendLimits.upper_limit_exclusive !== undefined) {
    result.upper = backendLimits.upper_limit_exclusive
    result.inclusive.upper = false
  }

  // Handle equal_to (special case - treat as both inclusive limits)
  if (backendLimits.equal_to !== null && backendLimits.equal_to !== undefined) {
    result.lower = backendLimits.equal_to
    result.upper = backendLimits.equal_to
    result.inclusive.lower = true
    result.inclusive.upper = true
  }

  return result
}

/**
 * Formats number limits as a human-readable string for display.
 * @param {Object} limits - The limits object with `lower`, `upper`, and `inclusive` properties.
 * @param {number|string} [limits.lower] - The lower bound value.
 * @param {number|string} [limits.upper] - The upper bound value.
 * @param {Object} [limits.inclusive] - Inclusivity flags for bounds.
 * @param {boolean} [limits.inclusive.lower] - Whether the lower bound is inclusive.
 * @param {boolean} [limits.inclusive.upper] - Whether the upper bound is inclusive.
 * @param {string} [unit=''] - The unit to display with the limits.
 * @returns {string} The formatted limits string, or 'No limits set' if not defined.
 */
export const formatLimitsText = (limits, unit = '') => {
  if (!limits) return 'No limits set'

  const lower = limits.lower
  const upper = limits.upper
  const lowerIncl = limits.inclusive?.lower !== false
  const upperIncl = limits.inclusive?.upper !== false
  const unitText = unit ? ' ' + unit : ''

  let text = ''

  if (lower !== null && lower !== undefined) {
    text += `${lowerIncl ? '≥' : '>'} ${lower}${unitText}`
  }

  if (upper !== null && upper !== undefined) {
    if (text) text += ' and '
    text += `${upperIncl ? '≤' : '<'} ${upper}${unitText}`
  }

  return text || 'No limits set'
}

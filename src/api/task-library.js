import http from '@/utils/request'
import { transformLimitsToBackend } from '@/views/taskLibrary/utils/stepTransforms'

// Transform frontend template data to backend API format
const transformTemplateForBackend = frontendData => {
  // Validate input
  if ( !frontendData || typeof frontendData !== 'object' ) {
    throw new Error( 'Invalid template data provided for transformation' )
  }

  // Transform steps from frontend format to backend format
  const transformedSteps = ( frontendData.steps || [] )
    .map( step => {
      if ( !step || typeof step !== 'object' ) {
        return null
      }

      // Create the base step structure
      const backendStep = {
        name : step.label || step.name || 'Untitled Step',
        description : step.description || '',
        type : 'template', // All steps are template type for creation
        required : Boolean( step.required ),
        remarks : step.remarks || ''
      }

      // Add tools if they exist
      if ( step.relevant_tools && Array.isArray( step.relevant_tools ) && step.relevant_tools.length > 0 ) {
        backendStep.tools = step.relevant_tools
          .map( tool => {
            if ( typeof tool === 'object' && tool.tool_id ) {
              return { id : parseInt( tool.tool_id ) || 0 }
            } else if ( typeof tool === 'object' && tool.id ) {
              return { id : parseInt( tool.id ) || 0 }
            } else {
              return { id : parseInt( tool ) || 0 }
            }
          } )
          .filter( tool => tool.id > 0 ) // Remove invalid tool IDs
      }

      // Transform step value based on frontend step type
      // Backend expects these exact type IDs: [checkbox, file, inspection, numeric, service, text]
      const stepConfig = step.config || {}
      switch ( step.type ) {
        case 'number':
          backendStep.value = {
            type : 'numeric',
            value : parseFloat( stepConfig.default_value ) || 0,
            numeric_limit_bounds : transformLimitsToBackend( stepConfig.limits ),
            require_image : Boolean( step.required_image ),
            image : []
          }
          break

        case 'checkbox':
          backendStep.value = {
            type : 'checkbox', // Backend expects 'checkbox' for checkbox steps
            value : Boolean( stepConfig.default ),
            require_image : Boolean( step.required_image ),
            image : []
          }
          break

        case 'text':
          backendStep.value = {
            type : 'text',
            value : String( stepConfig.default_value || '' ),
            require_image : Boolean( step.required_image ),
            image : []
          }
          break

        case 'inspection':
          backendStep.value = {
            type : 'inspection',
            value : stepConfig.default === 'pass',
            remarks : '',
            require_image : Boolean( step.required_image ),
            image : []
          }
          break

        case 'attachments':
          backendStep.value = {
            type : 'file',
            file : []
          }
          break

        default:
          backendStep.value = {
            type : 'checkbox', // Default to checkbox type instead of boolean
            value : false,
            require_image : Boolean( step.required_image ),
            image : []
          }
      }

      return backendStep
    } )
    .filter( Boolean ) // Remove any null steps

  // Build the backend payload
  const backendPayload = {
    name : frontendData.name,
    description : frontendData.description || '',
    time_estimate_sec : frontendData.estimated_minutes ? frontendData.estimated_minutes * 60 : 1800,
    steps : transformedSteps
  }

  // Add equipment_node_id if applicable_assets contains a numeric ID
  if ( frontendData.applicable_assets ) {
    if ( typeof frontendData.applicable_assets === 'number' ) {
      backendPayload.equipment_node_id = frontendData.applicable_assets
    } else if ( typeof frontendData.applicable_assets === 'string' && !isNaN( frontendData.applicable_assets ) ) {
      backendPayload.equipment_node_id = parseInt( frontendData.applicable_assets )
    } else if ( Array.isArray( frontendData.applicable_assets ) && frontendData.applicable_assets.length > 0 ) {
      // Fallback for legacy array format - take the first asset
      const firstAsset = frontendData.applicable_assets[0]
      if ( typeof firstAsset === 'number' ) {
        backendPayload.equipment_node_id = firstAsset
      } else if ( typeof firstAsset === 'string' && !isNaN( firstAsset ) ) {
        backendPayload.equipment_node_id = parseInt( firstAsset )
      }
    }
  }

  // Add category_id - handle both string names and numeric IDs
  if ( frontendData.category ) {
    // If it's already a number, use it directly
    const categoryId = parseInt( frontendData.category )
    if ( !isNaN( categoryId ) && categoryId > 0 ) {
      backendPayload.category_id = categoryId
    } else {
      // Map category names to IDs (simplified mapping)
      const categoryMap = {
        'Preventive Maintenance' : 1,
        'Preventative Maintenance' : 1,
        PM : 1,
        Inspection : 2,
        Repair : 3,
        'Corrective Maintenance' : 3,
        Calibration : 4,
        'Safety Check' : 5,
        Safety : 5,
        Other : 6,
        General : 6
      }

      backendPayload.category_id = categoryMap[frontendData.category] || 6 // Default to 'Other'
    }
  } else {
    backendPayload.category_id = 6 // Default to 'Other' if no category
  }

  return backendPayload
}

/**
 * Search task templates with pagination and filtering.
 * @param {number} page - Page number
 * @param {number} size - Items per page
 * @param {string} sortField - Sort field
 * @param {string} direction - Sort direction (ASC/DESC)
 * @param {Object} filter - Filter criteria
 * @returns {Promise} API response with paginated templates
 */
export const searchTaskTemplates = ( page = 1, size = 10, sortField = 'createdAt', direction = 'DESC', filter = {} ) => {
  return http.request( {
    method : 'post',
    url : '/task/templates/search',
    params : {
      page,
      size,
      sortField,
      direction
    },
    data : filter
  } )
}

/**
 * Fetch a task template by its ID.
 * @param {string} id - Template ID
 * @returns {Promise} API response with template data
 */
export const getTaskTemplateById = id => {
  return http.request( {
    method : 'get',
    url : `/task/template/${id}`
  } )
}

// Transform frontend template data for PATCH update operations
const transformTemplateForUpdate = ( frontendData, originalTemplate ) => {
  // Validate input
  if ( !frontendData || typeof frontendData !== 'object' ) {
    throw new Error( 'Invalid template data provided for update transformation' )
  }

  const updatePayload = {}

  // Update basic metadata fields
  if ( frontendData.name !== undefined ) {
    updatePayload.name = frontendData.name
  }

  if ( frontendData.description !== undefined ) {
    updatePayload.description = frontendData.description
  }

  if ( frontendData.estimated_minutes !== undefined ) {
    updatePayload.time_estimate_sec = frontendData.estimated_minutes * 60
  }

  // Handle equipment_node_id
  if ( frontendData.applicable_assets !== undefined ) {
    if ( frontendData.applicable_assets === null || frontendData.applicable_assets === '' ) {
      updatePayload.equipment_node_id = null
    } else if ( typeof frontendData.applicable_assets === 'number' ) {
      updatePayload.equipment_node_id = frontendData.applicable_assets
    } else if ( typeof frontendData.applicable_assets === 'string' && !isNaN( frontendData.applicable_assets ) ) {
      updatePayload.equipment_node_id = parseInt( frontendData.applicable_assets )
    } else if ( Array.isArray( frontendData.applicable_assets ) && frontendData.applicable_assets.length > 0 ) {
      // Fallback for legacy array format - take the first asset
      const firstAsset = frontendData.applicable_assets[0]
      if ( typeof firstAsset === 'number' ) {
        updatePayload.equipment_node_id = firstAsset
      } else if ( typeof firstAsset === 'string' && !isNaN( firstAsset ) ) {
        updatePayload.equipment_node_id = parseInt( firstAsset )
      }
    } else if ( Array.isArray( frontendData.applicable_assets ) && frontendData.applicable_assets.length === 0 ) {
      updatePayload.equipment_node_id = null
    }
  }

  // Handle category_id
  if ( frontendData.category ) {
    const categoryId = parseInt( frontendData.category )
    if ( !isNaN( categoryId ) && categoryId > 0 ) {
      updatePayload.category_id = categoryId
    } else {
      // Map category names to IDs (simplified mapping)
      const categoryMap = {
        'Preventive Maintenance' : 1,
        'Preventative Maintenance' : 1,
        PM : 1,
        Inspection : 2,
        Repair : 3,
        'Corrective Maintenance' : 3,
        Calibration : 4,
        'Safety Check' : 5,
        Safety : 5,
        Other : 6,
        General : 6
      }
      updatePayload.category_id = categoryMap[frontendData.category] || 6
    }
  }

  // Handle steps - determine what steps are added, updated, or deleted
  const currentSteps = frontendData.steps || []
  const originalSteps = ( originalTemplate && originalTemplate.steps ) || []

  // Create maps for easier comparison
  const originalStepsMap = new Map()
  originalSteps.forEach( step => {
    // Handle different ID field names from API
    const stepId = step.id || step._id || step.step_id
    if ( stepId ) {
      originalStepsMap.set( stepId, step )
    }
  } )

  const currentStepsMap = new Map()
  currentSteps.forEach( step => {
    const stepId = step.step_id
    if ( stepId && !stepId.startsWith( 'step-' ) ) {
      // Only map steps with real backend IDs
      currentStepsMap.set( stepId, step )
    }
  } )

  // Initialize step operation lists
  updatePayload.step_add_list = []
  updatePayload.step_update_list = []
  updatePayload.step_delete_list = []

  // Process current steps to identify adds and updates
  currentSteps.forEach( step => {
    const stepId = step.step_id

    if ( !stepId || stepId.startsWith( 'step-' ) ) {
      // New step (temporary frontend ID) - add to step_add_list
      const newStep = transformStepForBackend( step, false ) // false = no ID needed for new steps
      updatePayload.step_add_list.push( newStep )
    } else if ( originalStepsMap.has( stepId ) ) {
      // Existing step - add to step_update_list
      const updateStep = transformStepForBackend( step, true ) // true = include ID for updates
      // Validate step ID before setting
      if ( stepId && stepId !== 'null' && stepId !== 'undefined' ) {
        // The transformStepForBackend already sets the id field, so just add to list
        updatePayload.step_update_list.push( updateStep )
      }
    }
  } )

  // Find deleted steps
  originalSteps.forEach( originalStep => {
    const stepId = originalStep.id || originalStep._id || originalStep.step_id
    if ( stepId && !currentStepsMap.has( stepId ) ) {
      // Step was deleted - validate the ID before adding
      if ( stepId && stepId !== 'null' && stepId !== 'undefined' ) {
        updatePayload.step_delete_list.push( stepId )
      }
    }
  } )

  return updatePayload
}

// Transform a single step for backend submission
const transformStepForBackend = ( step, includeId = false ) => {
  if ( !step || typeof step !== 'object' ) {
    throw new Error( 'Invalid step data provided for transformation' )
  }

  const backendStep = {
    name : step.label || step.name || 'Untitled Step',
    description : step.description || '',
    type : 'template',
    required : Boolean( step.required ),
    remarks : step.remarks || ''
  }

  // Include ID for updates - use 'id' field for backend compatibility
  if ( includeId && ( step.step_id || step.id || step._id ) ) {
    backendStep.id = step.step_id || step.id || step._id
  }

  // Add tools if they exist
  if ( step.relevant_tools && Array.isArray( step.relevant_tools ) && step.relevant_tools.length > 0 ) {
    backendStep.tools = step.relevant_tools
      .map( tool => {
        if ( typeof tool === 'object' && tool.tool_id ) {
          return { id : parseInt( tool.tool_id ) || 0 }
        } else if ( typeof tool === 'object' && tool.id ) {
          return { id : parseInt( tool.id ) || 0 }
        } else {
          return { id : parseInt( tool ) || 0 }
        }
      } )
      .filter( tool => tool.id > 0 )
  }

  // Transform step value based on frontend step type
  const stepConfig = step.config || {}
  switch ( step.type ) {
    case 'number':
      backendStep.value = {
        type : 'numeric',
        value : parseFloat( stepConfig.default_value ) || 0,
        numeric_limit_bounds : transformLimitsToBackend( stepConfig.limits ),
        require_image : Boolean( step.required_image ),
        image : []
      }
      break

    case 'checkbox':
      backendStep.value = {
        type : 'checkbox', // Backend expects 'checkbox' for checkbox steps
        value : Boolean( stepConfig.default ),
        require_image : Boolean( step.required_image ),
        image : []
      }
      break

    case 'text':
      backendStep.value = {
        type : 'text',
        value : String( stepConfig.default_value || '' ),
        require_image : Boolean( step.required_image ),
        image : []
      }
      break

    case 'inspection':
      backendStep.value = {
        type : 'inspection',
        value : stepConfig.default === 'pass',
        remarks : '',
        require_image : Boolean( step.required_image ),
        image : []
      }
      break

    case 'attachments':
      backendStep.value = {
        type : 'file',
        file : []
      }
      break

    default:
      backendStep.value = {
        type : 'checkbox', // Default to checkbox type instead of boolean
        value : false,
        require_image : Boolean( step.required_image ),
        image : []
      }
  }

  return backendStep
}

/**
 * Update a task template by its ID.
 * @param {string} id - Template ID
 * @param {Object} frontendData - Template data
 * @param {Object} originalTemplate - Original template for comparison
 * @returns {Promise} API response with updated template
 */
export const updateTaskTemplate = ( id, frontendData, originalTemplate = null ) => {
  // Validate template ID
  if ( !id || id === 'undefined' || id === 'null' ) {
    throw new Error( `Invalid template ID provided: ${id}` )
  }

  const backendPayload = transformTemplateForUpdate( frontendData, originalTemplate )

  return http.request( {
    method : 'patch',
    url : `/task/template/${id}`,
    data : backendPayload
  } )
}

/**
 * Create a new task template.
 * @param {Object} frontendData - Template data
 * @returns {Promise} API response with created template
 */
export const createTaskTemplate = frontendData => {
  const backendPayload = transformTemplateForBackend( frontendData )

  return http.request( {
    method : 'post',
    url : '/task/template',
    data : backendPayload
  } )
}

/**
 * Delete a task template by its ID.
 * @param {string} id - Template ID
 * @returns {Promise} API response confirming deletion
 */
export const deleteTaskTemplate = id => {
  return http.request( {
    method : 'delete',
    url : `/task/template/${id}`
  } )
}

// Legacy functions for backward compatibility
export const getTemplates = async params => {
  return { data : [], total : 0 }
}

export const getTemplate = async id => {
  return { data : null }
}

export const createTemplate = async data => {
  return {
    data : {
      template_id : Date.now().toString(),
      id : Date.now().toString(),
      ...data,
      status : 'draft',
      created_at : new Date().toISOString(),
      updated_at : new Date().toISOString(),
      steps : []
    }
  }
}

export const updateTemplate = async( id, data ) => {
  // return http.request({ method: 'put', url: `/maintenance-library/templates/${id}`, data })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : {
      template_id : id,
      ...data,
      updated_at : new Date().toISOString()
    }
  }
}

export const deleteTemplate = async id => {
  // return http.request({ method: 'delete', url: `/maintenance-library/templates/${id}` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return { success : true }
}

// Additional operations
export const publishTemplate = async id => {
  // return http.request({ method: 'post', url: `/maintenance-library/templates/${id}/publish` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return { data : { template_id : id, status : 'published' }}
}

// Keep this here as extensible for the future
export const getTemplateVersions = async id => {
  // return http.request({ method: 'get', url: `/maintenance-library/templates/${id}/versions` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : [{ version : '1.0', created_at : '2025-08-20T10:00:00Z' }]
  }
}

// Tools and resources (for step configuration)
export const getAvailableTools = async() => {
  await new Promise( resolve => setTimeout( resolve, 300 ) )
  return {
    data : [
      { tool_id : 't-001', name : 'Flashlight', spec : 'Yellow LED Flashlight' },
      { tool_id : 't-002', name : 'Thermometer', spec : 'King Digital -50°C to 150°C' },
      { tool_id : 't-003', name : 'Multimeter', spec : 'King Digital Multimeter' },
      { tool_id : 't-004', name : 'Screwdriver Set', spec : 'Hurry Phillips and Flathead' },
      { tool_id : 't-005', name : 'Wrench Set', spec : 'Adjustable Wrench Set for Peach Brother' }
    ]
  }
}

export const uploadResource = async( file, stepId ) => {
  await new Promise( resolve => setTimeout( resolve, 1000 ) )
  return {
    data : {
      id : `r-${Date.now()}`,
      name : file.name,
      url : `https://cdn.example.com/files/${file.name}`,
      mime : file.type
    }
  }
}

// standards CRUD operations
export const getStandards = async params => {
  try {
    // Using http.request for real API calls
    const response = await http.request( {
      method : 'get',
      url : '/library/standards',
      params
    } )
    return {
      data : response.data?.data || response.data,
      total : response.data?.total || response.data?.length || 0
    }
  } catch ( error ) {
    console.error( 'Failed to fetch standards:', error )
    throw error
  }
}

export const getStandard = async id => {
  try {
    const response = await http.request( {
      method : 'get',
      url : `/library/standard/${id}`
    } )
    return { data : response.data }
  } catch ( error ) {
    console.error( 'Failed to fetch standard:', error )
    throw error
  }
}

export const createStandard = async data => {
  try {
    const response = await http.request( {
      method : 'post',
      url : '/library/standard',
      data
    } )
    return { data : response.data }
  } catch ( error ) {
    console.error( 'Failed to create standard:', error )
    throw error
  }
}

export const updateStandard = async( id, data ) => {
  try {
    const response = await http.request( {
      method : 'put',
      url : '/library/standard',
      data : { _id : id, ...data }
    } )
    return { data : response.data }
  } catch ( error ) {
    console.error( 'Failed to update standard:', error )
    throw error
  }
}

export const deleteStandard = async id => {
  try {
    await http.request( {
      method : 'delete',
      url : `/library/standard/${id}`
    } )
    return { success : true }
  } catch ( error ) {
    console.error( 'Failed to delete standard:', error )
    throw error
  }
}

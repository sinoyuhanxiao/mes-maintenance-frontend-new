import http from '@/utils/request'
import { transformTemplateForBackend, transformTemplateForUpdate } from '@/views/taskLibrary/utils/templateTransforms'
import { getAvailableTools, uploadResource } from '@/views/taskLibrary/utils/mockData'

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

// TODO: Re-export mock functions for backward compatibility (will do this in future)
export { getAvailableTools, uploadResource }

// standards CRUD operations
/**
 * Search standards with pagination and filtering.
 * @param {Object} filter - Filter criteria (e.g., keyword, category)
 * @param {Object} pagination - Pagination and sorting options
 * @param {number} [pagination.page] - Page number
 * @param {number} [pagination.size] - Items per page
 * @param {string} [pagination.sortField] - Field to sort by
 * @param {string} [pagination.direction] - Sort direction (ASC/DESC)
 * @returns {Promise} API response with paginated standards
 */
export const searchStandards = async( filter = {}, pagination = {} ) => {
  return http.request( {
    method : 'post',
    url : '/library/standards/search',
    params : {
      page : pagination.page,
      size : pagination.size,
      sortField : pagination.sortField,
      direction : pagination.direction
    },
    data : {
      keyword : filter.keyword?.trim(),
      category : filter.category?.trim()
    }
  } )
}

/**
 * Fetch a standard by its ID.
 * @param {string} id - Standard ID
 * @returns {Promise<Object>} API response with standard data
 */
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

/**
 * Create a new standard.
 * @param {Object} data - Standard data to create.
 * @returns {Promise<Object>} API response with created standard data.
 */
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

/**
 * Update a standard by its ID.
 * @param {string} id - The ID of the standard to update.
 * @param {Object} data - The updated standard data.
 * @returns {Promise<Object>} API response with updated standard data.
 */
export const updateStandard = async( id, data ) => {
  try {
    const response = await http.request({
      method: 'put',
      url: '/library/standard',
      data: { _id: id, ...data },
    })
    return { data: response.data }
  } catch (error) {
    console.error('Failed to update standard:', error)
    throw error
  }
}

/**
 * Delete a standard by its ID.
 * @param {string} id - The ID of the standard to delete.
 * @returns {Promise<{success: boolean}>} API response indicating success.
 */
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

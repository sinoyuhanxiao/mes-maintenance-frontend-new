import http from '@/utils/request'

/**
 * Fetch approval tree.
 * @returns {Promise} API response with approval tree.
 */
export const getApprovalTree = () => {
  return http.request( {
    method : 'get',
    url : '/approval/tree'
  } )
}

/**
 * Fetch approval types.
 * @returns {Promise} API response with approval types.
 */
export const getAllApprovalTypes = () => {
  return http.request( {
    method : 'get',
    url : '/approval/type'
  } )
}

/**
 * Get approval template by ID.
 * @param {number} id - approval template ID.
 * @returns {Promise<any>} API response
 */
export const getApprovalTemplateById = id => {
  return http.request( {
    method : 'get',
    url : `/approval/template/${id}`
  } )
}

/**
 * Create a new approval tree.
 * @param {Object} data - Approval tree payload.
 * @returns {Promise<any>} API response
 */
export const createApprovalTemplate = data => {
  return http.request( {
    method : 'post',
    url : '/approval/template',
    data
  } )
}

/**
 * Delete Approval Tempalate.
 * @param {number} id - Approval template ID.
 * @returns {Promise<any>} API response
 */
export const deleteApprovalTemplate = id => {
  return http.request( {
    method : 'delete',
    url : `/approval/template/${id}`
  } )
}

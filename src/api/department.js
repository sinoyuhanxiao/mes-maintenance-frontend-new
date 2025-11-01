// src/api/department.js
import http from '@/utils/request'
import ENV_CONFIG from '@/utils/env'

const USER_CLIENT_URL = ENV_CONFIG.USER_CLIENT_URL

/**
 * Search departments with filters and pagination.
 * @param {Object} search - DepartmentQueryRequest payload.
 * @param {number} page
 * @param {number} size
 * @param {string} sortField
 * @param {"ASC"|"DESC"} direction
 * @returns {Promise<any>} API response with PagingResult<DepartmentDTO>
 */
export const searchDepartments = (search = {}, page = 1, size = 10, sortField = 'createdAt', direction = 'DESC') => {
  return http.request({
    method: 'post',
    url: '/department/search',
    baseURL: USER_CLIENT_URL,
    data: search,
    params: { page, size, sortField, direction },
  })
}

export const getDepartmentById = id => {
  return http.request({
    method: 'get',
    url: `/department/${id}`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Create a new department.
 * @param {Object} data - DepartmentRequest payload.
 * @returns {Promise<any>} API response with DepartmentDTO
 */
export const createDepartment = data => {
  return http.request({
    method: 'post',
    url: '/department',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Update an existing department.
 * @param {number} id - Department ID.
 * @param {Object} data - DepartmentUpdateRequest payload.
 * @returns {Promise<any>} API response with DepartmentDTO
 */
export const updateDepartment = (id, data) => {
  return http.request({
    method: 'patch',
    url: `/department/${id}`,
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Activate a department.
 * @param {number} id - Department ID.
 * @returns {Promise<any>} API response
 */
export const activateDepartment = id => {
  return http.request({
    method: 'post',
    url: `/department/${id}/activate`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Deactivate a department.
 * @param {number} id - Department ID.
 * @returns {Promise<any>} API response
 */
export const deactivateDepartment = id => {
  return http.request({
    method: 'post',
    url: `/department/${id}/deactivate`,
    baseURL: USER_CLIENT_URL,
  })
}

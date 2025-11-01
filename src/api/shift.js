import http from '@/utils/request'
import ENV_CONFIG from '@/utils/env'

const USER_CLIENT_URL = ENV_CONFIG.USER_CLIENT_URL

/**
 * Search shifts with filters and pagination.
 * @param {Object} search - ShiftQueryRequest payload.
 * @param {number} page
 * @param {number} size
 * @param {string} sortField
 * @param {"ASC"|"DESC"} direction
 * @returns {Promise} API response with PagingResult<ShiftDTO>
 */
export const searchShifts = (search = {}, page = 1, size = 10, sortField = 'createdAt', direction = 'DESC') => {
  return http.request({
    method: 'post',
    url: '/shift/search',
    baseURL: USER_CLIENT_URL,
    data: search,
    params: { page, size, sortField, direction },
  })
}

/**
 * Get a shift by ID.
 * @param {number} id - Shift ID.
 * @returns {Promise} API response with ShiftDTO.
 */
export const getShiftById = id => {
  return http.request({
    method: 'get',
    url: `/shift/${id}`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Create a new shift.
 * @param {Object} data - ShiftDTO payload.
 * @returns {Promise} API response with created ShiftDTO.
 */
export const createShift = data => {
  return http.request({
    method: 'post',
    url: '/shift',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Update an existing shift.
 * @param {number} id - Shift ID.
 * @param {Object} data - ShiftUpdateRequest payload.
 * @returns {Promise} API response with updated ShiftDTO.
 */
export const updateShift = (id, data) => {
  return http.request({
    method: 'patch',
    url: `/shift/${id}`,
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Activate a shift.
 * @param {number} id - Shift ID.
 * @returns {Promise} API response (Void).
 */
export const activateShift = id => {
  return http.request({
    method: 'post',
    url: `/shift/${id}/activate`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Deactivate a shift.
 * @param {number} id - Shift ID.
 * @returns {Promise} API response (Void).
 */
export const deactivateShift = id => {
  return http.request({
    method: 'post',
    url: `/shift/${id}/deactivate`,
    baseURL: USER_CLIENT_URL,
  })
}

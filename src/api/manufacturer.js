// src/api/manufacturer.js
import http from '@/utils/request'

/**
 * Search manufacturers with filters and pagination.
 * @param {Object} search - Manufacturer search payload.
 * @param {number} page - Page number (default 1)
 * @param {number} size - Page size (default 10)
 * @param {string} sortField - Sort field (default "createdAt")
 * @param {"ASC"|"DESC"} direction - Sort direction (default "DESC")
 * @returns {Promise<any>} API response with PagingResult<ManufacturerDTO>
 *
 * Request body example:
 * {
 *   "keyword": "string",
 *   "status_ids": [0]
 * }
 */
export const searchManufacturers = ( search = {}, page = 1, size = 10, sortField = 'createdAt', direction = 'DESC' ) => {
  return http.request( {
    method : 'post',
    url : '/manufacture/search',
    data : search,
    params : { page, size, sortField, direction }
  } )
}

/**
 * Get manufacturer by ID.
 * @param {number|string} id - Manufacturer ID.
 * @returns {Promise<any>} API response with ManufacturerDTO
 */
export const getManufacturerById = id => {
  return http.request( {
    method : 'get',
    url : `/manufacture/${id}`
  } )
}

/**
 * Create a new manufacturer.
 * @param {Object} data - Manufacturer creation payload.
 * @example
 * {
 *   "name": "string",
 *   "code": "string",
 *   "description": "string",
 *   "website": "https://example.com",
 *   "country": "string",
 *   "image_list": ["string"],
 *   "file_list": ["string"],
 *   "email": "string",
 *   "phone_number": "+17786664444"
 * }
 * @returns {Promise<any>} API response with ManufacturerDTO
 */
export const createManufacturer = data => {
  return http.request( {
    method : 'post',
    url : '/manufacture',
    data
  } )
}

/**
 * Update an existing manufacturer.
 * @param {number|string} id - Manufacturer ID.
 * @param {Object} data - Manufacturer update payload.
 * @returns {Promise<any>} API response with ManufacturerDTO
 */
export const updateManufacturer = ( id, data ) => {
  return http.request( {
    method : 'post', // API uses POST for update
    url : `/manufacture/${id}`,
    data
  } )
}

/**
 * Deactivate a manufacturer.
 * @param {number|string} id - Manufacturer ID.
 * @returns {Promise<any>} API response
 */
export const deactivateManufacturer = id => {
  return http.request( {
    method : 'post',
    url : `/manufacture/${id}/deactivate`
  } )
}

/**
 * Activate a manufacturer.
 * @param {number|string} id - Manufacturer ID.
 * @returns {Promise<any>} API response
 */
export const activateManufacturer = id => {
  return http.request( {
    method : 'post',
    url : `/manufacture/${id}/activate`
  } )
}

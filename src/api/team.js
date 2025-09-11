import http from '@/utils/request'
import ENV_CONFIG from '@/utils/env'

const USER_CLIENT_URL = ENV_CONFIG.USER_CLIENT_URL
/**
 * Search teams with filters and pagination.
 * @param {Object} search - TeamQueryRequest payload.
 * @param {number} page
 * @param {number} size
 * @param {string} sortField
 * @param {"ASC"|"DESC"} direction
 * @returns {Promise} API response with PagingResult<TeamDTO>
 */
export const searchTeams = ( search = {}, page = 1, size = 10, sortField = 'createdAt', direction = 'DESC' ) => {
  return http.request( {
    method : 'post',
    url : '/team/search',
    baseURL : USER_CLIENT_URL,
    data : search,
    params : { page, size, sortField, direction }
  } )
}

/**
 * Get a team by ID.
 * @param {number} id - Team ID.
 * @returns {Promise} API response with TeamDTO.
 */
export const getTeamById = id => {
  return http.request( {
    method : 'get',
    url : `/team/${id}`,
    baseURL : USER_CLIENT_URL
  } )
}

/**
 * Create a new team.
 * @param {Object} data - TeamRequest payload.
 * @returns {Promise} API response with created TeamDTO.
 */
export const createTeam = data => {
  return http.request( {
    method : 'post',
    url : '/team',
    baseURL : USER_CLIENT_URL,
    data
  } )
}

/**
 * Update an existing team.
 * @param {number} id - Team ID.
 * @param {Object} data - TeamUpdateRequest payload.
 * @returns {Promise} API response with updated TeamDTO.
 */
export const updateTeam = ( id, data ) => {
  return http.request( {
    method : 'patch',
    url : `/team/${id}`,
    baseURL : USER_CLIENT_URL,
    data
  } )
}
/**
 * Activate a team.
 * @param {number} id - Team ID.
 * @returns {Promise} API response (Void).
 */
export const activateTeam = id => {
  return http.request( {
    method : 'post',
    url : `/team/${id}/activate`,
    baseURL : USER_CLIENT_URL
  } )
}

/**
 * Deactivate a team.
 * @param {number} id - Team ID.
 * @returns {Promise} API response (Void).
 */
export const deactivateTeam = id => {
  return http.request( {
    method : 'post',
    url : `/team/${id}/deactivate`,
    baseURL : USER_CLIENT_URL
  } )
}

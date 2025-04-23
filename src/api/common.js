import api from './api'

const BASE_URL = '/api/common'

/**
 * Fetch all work types.
 * @returns {Promise} API response with work types.
 */
export const getAllWorkTypes = () => {
  return api.get( `${BASE_URL}/work-type` )
}

/**
 * Fetch all states.
 * @returns {Promise} API response with states.
 */
export const getAllStates = () => {
  return api.get( `${BASE_URL}/state` )
}

/**
 * Fetch all recurrence types.
 * @returns {Promise} API response with recurrence types.
 */
export const getAllRecurrenceTypes = () => {
  return api.get( `${BASE_URL}/recurrence-type` )
}

/**
 * Fetch all priorities.
 * @returns {Promise} API response with priorities.
 */
export const getAllPriorities = () => {
  return api.get( `${BASE_URL}/priority` )
}

/**
 * Fetch all categories.
 * @returns {Promise} API response with categories.
 */
export const getAllCategories = () => {
  return api.get( `${BASE_URL}/category` )
}

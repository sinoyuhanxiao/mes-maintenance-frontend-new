import http from '@/utils/request'

/**
 * Fetch all work types.
 * @returns {Promise} API response with work types.
 */
export const getAllWorkTypes = () => {
  return http.request({
    method: 'get',
    url: '/common/work-type',
  })
}

/**
 * Fetch all states.
 * @returns {Promise} API response with states.
 */
export const getAllStates = () => {
  return http.request({
    method: 'get',
    url: '/common/state',
  })
}

/**
 * Fetch all recurrence types.
 * @returns {Promise} API response with recurrence types.
 */
export const getAllRecurrenceTypes = () => {
  return http.request({
    method: 'get',
    url: '/common/recurrence-type',
  })
}

/**
 * Fetch all priorities.
 * @returns {Promise} API response with priorities.
 */
export const getAllPriorities = () => {
  return http.request({
    method: 'get',
    url: '/common/priority',
  })
}

/**
 * Fetch all categories.
 * @returns {Promise} API response with categories.
 */
export const getAllCategories = () => {
  return http.request({
    method: 'get',
    url: '/common/category',
  })
}

/**
 * Fetch unit by type.
 * @param { number } id - Unit type id
 * @returns {Promise} API response with units of a given type.
 */
export const getUnitByType = (id = 1) => {
  return http.request({
    method: 'get',
    url: `/common/unit_type/${id}`,
  })
}

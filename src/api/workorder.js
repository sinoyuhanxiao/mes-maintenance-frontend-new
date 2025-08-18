import http from '@/utils/request'

/**
 * Fetch all work orders with pagination and sorting.
 * @param {number} page - The page number to fetch.
 * @param {number} size - The number of items per page.
 * @param {string} sortField - The field to sort by (e.g., "createdAt").
 * @param {string} direction - Sorting direction ("ASC" or "DESC").
 * @param {Object} filters - Additional filters to apply.
 * @returns {Promise} API response with the list of all work orders.
 */
export const getAllWorkOrders = ( page = 1, size = 10, sortField = 'createdAt', direction = 'DESC', filters = {} ) => {
  return http.request( {
    method : 'post',
    url : '/work-order/search',
    params : {
      page,
      size,
      sortField,
      direction
    },
    data : {
      latest_per_recurrence : true,
      ...filters
    }
  } )
}

/**
 * Fetch work orders by recurrence ID.
 * @param {string} recurrenceId - The recurrence UUID.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @returns {Promise} API response containing work orders.
 */
export const getWorkOrdersByRecurrence = (
  recurrenceId,
  page = 1,
  size = 10,
  sortField = 'createdAt',
  direction = 'DESC'
) => {
  return http.request( {
    method : 'get',
    url : `/work-order/recurrence/${recurrenceId}`,
    params : {
      page,
      size,
      sortField,
      direction
    }
  } )
}

/**
 * Create a new work order (or multiple) based on recurrence and provided payload.
 * @param {Object} data - The request payload containing full work order info.
 * @returns {Promise} API response from the server.
 */
export const createWorkOrder = data => {
  return http.request( {
    method : 'post',
    url : '/work-order',
    data
  } )
}

/**
 * Fetch a work order by its ID.
 * @param {string} id - The ID of the work order to fetch.
 * @returns {Promise} API response containing the work order data.
 */
export const getWorkOrderById = id => {
  return http.request( {
    method : 'get',
    url : `/work-order/${id}`
  } )
}

// API functions for work order creation form data
/**
 * Fetch all work types.
 * @returns {Promise} API response with work types.
 */
export const getAllWorkTypes = () => {
  return http.request( {
    method : 'get',
    url : '/common/work-type'
  } )
}

/**
 * Fetch all priorities.
 * @returns {Promise} API response with priorities.
 */
export const getAllPriorities = () => {
  return http.request( {
    method : 'get',
    url : '/common/priority'
  } )
}

/**
 * Fetch all categories.
 * @returns {Promise} API response with categories.
 */
export const getAllCategories = () => {
  return http.request( {
    method : 'get',
    url : '/common/category'
  } )
}

/**
 * Fetch all states.
 * @returns {Promise} API response with states.
 */
export const getAllStates = () => {
  return http.request( {
    method : 'get',
    url : '/common/state'
  } )
}

/**
 * Fetch all recurrence types.
 * @returns {Promise} API response with recurrence types.
 */
export const getAllRecurrenceTypes = () => {
  return http.request( {
    method : 'get',
    url : '/common/recurrence-type'
  } )
}

/**
 * Fetch all location node trees.
 * @returns {Promise} API response with location node trees.
 */
export const getLocationNodeTrees = () => {
  return http.request( {
    method : 'get',
    url : '/location/node-trees'
  } )
}

/**
 * Fetch all equipment node trees.
 * @returns {Promise} API response with equipment node trees.
 */
export const getEquipmentNodeTrees = () => {
  return http.request( {
    method : 'get',
    url : '/equipment/node-trees'
  } )
}

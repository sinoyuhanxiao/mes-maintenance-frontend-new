import http from '@/utils/request'

/**
 * Search work orders with pagination.
 * @param {number} page - The page number to fetch.
 * @param {number} size - The number of items per page.
 * @param {string} sortField - The field to sort by (e.g., "createdAt").
 * @param {string} direction - Sorting direction ("ASC" or "DESC").
 * @returns {Promise} API response with the list of all found work orders.
 */
export const searchWorkOrders = (
  page = 1,
  size = 10,
  sortField = 'createdAt',
  direction = 'DESC',
  search = { latest_per_recurrence : true }
) => {
  return http.request( {
    method : 'post',
    url : '/work-order/search',
    params : {
      page,
      size,
      sortField,
      direction
    },
    data : search
  } )
}

/**
 * Search work orders using complex filters.
 *
 * @param {Object} filter - The WorkOrderQueryRequest payload.
 * @returns {Promise} API response with filtered and paginated work orders.
 */
export const searchWorkOrdersByList = ( filter = {} ) => {
  return http.request( {
    method : 'post',
    url : '/work-order/list-search',
    data : filter,
    params : {}
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
 * Update an individual work order by its ID.
 * @param {number} id - The ID of the work order to update.
 * @param {Object} data - The request payload containing updated work order info.
 * @returns {Promise} API response from the server.
 */
export const updateWorkOrder = ( id, data ) => {
  return http.request( {
    method : 'patch',
    url : `/work-order/${id}`,
    data
  } )
}

/**
 * Update all work orders associated with a recurrence UUID.
 * @param {Object} data - The request payload containing updated work order info and recurrence_uuid.
 * @returns {Promise} API response from the server.
 */
export const updateRecurrenceWorkOrders = data => {
  return http.request( {
    method : 'patch',
    url : '/work-order/recurrence',
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
 * Fetch all equipment node trees.
 * @returns {Promise} API response with equipment node trees.
 */
export const getEquipmentNodeTrees = () => {
  return http.request( {
    method : 'get',
    url : '/equipment/node-trees'
  } )
}

/**
 * Delete an individual work order by its ID.
 * @param {number} id - The ID of the work order to delete.
 * @returns {Promise} API response containing the deleted work order data.
 */
export const deleteIndividualWorkOrder = id => {
  return http.request( {
    method : 'delete',
    url : `/work-order/delete-individual/${id}`
  } )
}

/**
 * Delete all work orders associated with a recurrence ID.
 * @param {string} recurrenceId - The recurrence UUID to identify the group of work orders to delete.
 * @returns {Promise} API response containing the list of deleted work orders.
 */
export const deleteRecurrenceWorkOrders = recurrenceId => {
  return http.request( {
    method : 'delete',
    url : `/work-order/delete-recurrence/${recurrenceId}`
  } )
}

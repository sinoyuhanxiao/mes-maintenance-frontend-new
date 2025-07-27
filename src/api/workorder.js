import http from '@/utils/request'

/**
 * Fetch all work orders with pagination and sorting.
 * @param {number} page - The page number to fetch.
 * @param {number} size - The number of items per page.
 * @param {string} sortField - The field to sort by (e.g., "createdAt").
 * @param {string} direction - Sorting direction ("ASC" or "DESC").
 * @returns {Promise} API response with the list of all work orders.
 */
export const getAllWorkOrders = ( page = 1, size = 10, sortField = 'createdAt', direction = 'DESC' ) => {
  return http.request( {
    method : 'get',
    url : '/work-order',
    data : {
      page,
      size,
      sortField,
      direction
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
    data : {
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

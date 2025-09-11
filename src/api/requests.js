import http from '@/utils/request'

/**
 * Fetch all requests
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @param {object} search - Filter object
 * @returns {Promise} API response with the list of all requests.
 */
export const searchMaintenanceRequests = (
  page = 1,
  size = 10,
  sortField = 'createdAt',
  direction = 'DESC',
  search = {}
) => {
  console.log( {
    page,
    size,
    sortField,
    direction,
    search
  } )
  return http.request( {
    method : 'post',
    url : `/maintenance_request/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : search
  } )
}

/**
 * Create request
 * @param {string} name - Title of request
 * @param {string} description - Description of request
 * @param {list} image_path - List of images
 * @param {number} production_line_id - Production line id
 * @param {number} equipment_group_id - Equipment group id
 * @param {number} equipment_id - Equipment id
 * @param {number} work_order_id - Work order id
 * @returns {Promise} API response with newly created request
 */
export const createRequest = data => {
  console.log( data )
  return http.request( {
    method : 'post',
    url : '/maintenance_request',
    data
  } )
}

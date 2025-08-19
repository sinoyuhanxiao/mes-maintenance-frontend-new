import http from '@/utils/request'

/**
 * Fetch all vendors.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @returns {Promise} API response with vendors.
 */
export const searchVendors = ( page = 1, size = 10, sortField = 'name', direction = 'ASC', search = {} ) => {
  console.log( search )
  return http.request( {
    method : 'post',
    url : `/vendor/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : {
      search
    }
  } )
}

import http from '@/utils/request'

/**
 * Get location path by ID
 * @param {number} locationId - The location ID
 * @returns {Promise} API response with location path
 */
export const getLocationPathById = locationId => {
  console.log( 'API function called with locationId:', locationId )
  return http.request( {
    method : 'get',
    url : `/location/node-path/${locationId}`
  } )
}

/**
 * Fetch location tree.
 * @returns {Promise} API response with location tree nodes.
 */
export const getLocationTree = () => {
  return http.request( {
    method : 'get',
    url : '/location/node-trees'
  } )
}

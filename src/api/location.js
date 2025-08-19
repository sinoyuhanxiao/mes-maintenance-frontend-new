import http from '@/utils/request'

/**
 * Get location path by ID
 * @param {number} locationId - The location ID
 * @returns {Promise} API response with location path
 */
export const getLocationPathById = locationId => {
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

/**
 * Fetch all location by id.
 * @param { number } id - Location id
 * @returns {Promise} API response with location.
 */
export const getLocationById = id => {
  console.log( 'API URL: ', `/location/${id}` )
  console.log(
    http.request( {
      method : 'get',
      url : `/location/${id}`
    } )
  )
  return http.request( {
    method : 'get',
    url : `/location/${id}`
  } )
}

// export const getLocationById = id => http.request( { method : 'get', url : `/location/${id}` } )

export const createLocation = payload => http.request( { method : 'post', url : '/location', data : payload } )

export const updateLocationById = ( id, data ) => http.request( { method : 'patch', url : `/location/${id}`, data } )

export const deactivateLocation = id => http.request( { method : 'post', url : `/location/${id}/deactivate` } )

export const activateLocation = id => http.request( { method : 'post', url : `/location/${id}/activate` } )

export const getLocationTypes = () => http.request( { method : 'get', url : '/location/location-type' } )

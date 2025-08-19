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
    method : 'post'
  } )
}

/**
 * New, general search API (recommended).
 * Usage:
 *   searchVendorsGeneral({ keyword: 'acme', status: 'active' }, { page: 1, size: 20, sortField: 'createdAt', direction: 'DESC' })
 */
export const searchVendorsGeneral = ( data = {}, params = {} ) => {
  const { keyword = '', ...filters } = data
  const { page = 1, size = 10, sortField = 'name', direction = 'ASC' } = params

  return http.request( {
    method : 'post',
    url : '/vendor/search',
    data : { keyword, ...filters },
    params : { page : Number( page ), size : Number( size ), sortField, direction : String( direction ).toUpperCase() }
  } )
}

// CRUD
export const getVendorById = id => http.request( { method : 'get', url : `/vendor/${id}` } )

export const createVendor = payload => http.request( { method : 'post', url : '/vendor', data : payload } )

export const updateVendor = ( id, payload ) => http.request( { method : 'patch', url : `/vendor/${id}`, data : payload } )

export const deleteVendor = id => http.request( { method : 'delete', url : `/vendor/${id}` } )

// Status actions (your API uses POST for deactivating)
export const deactivateVendor = id => http.request( { method : 'post', url : `/vendor/${id}/deactivate` } )

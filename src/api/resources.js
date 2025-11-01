import http from '@/utils/request'

/**
 * Fetch all spare parts.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @param {object} search - Search filter
 * @returns {Promise} API response with the list of all spare parts.
 */
export const searchSpareParts = ( page = 1, size = 10, sortField = 'name', direction = 'ASC', search = {} ) => {
  console.log(
    http.request( {
      method : 'post',
      url : `/resource/spare-parts/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
      data : search
    } )
  )
  return http.request( {
    method : 'post',
    url : `/resource/spare-parts/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : search
  } )
}

/**
 * Fetch all spare part classes.
 * @returns {Promise} API response with the list of all spare part classes.
 */
export const getAllSparePartClasses = () => {
  console.log(
    http.request( {
      method : 'get',
      url : '/resource/spare-part-class'
    } )
  )
  return http.request( {
    method : 'get',
    url : '/resource/spare-part-class'
  } )
}

// Fetch one spare part by ID (returns axios response)
export const getSparePartById = id => {
  return http.request( {
    method : 'get',
    url : `/resource/spare-part/${id}`
  } )
}

/**
 * Create spare part
 * @param {string} name - Name of part
 * @param {string} description - Description of part
 * @param {list} image_path - List of images
 * @param {number} spare_parts_class_id - Category id
 * @param {number} reorder_point - Reorder point
 * @param {number} minimum_stock_level - Min stock level
 * @param {number} maximum_stock_level - Max stock level
 * @param {number} current_stock - Current stock
 * @param {string} universal_code - Inventory code
 * @param {number} manufacturer_id - Manufacturer id
 * @returns {Promise} API response with newly created spare part
 */
export const createSparePart = data => {
  return http.request( {
    method : 'post',
    url : '/resource/spare-part',
    data
  } )
}

/**
 * Edit spare part
 * @param {number} id - id of part
 * @param {string} name - Name of part
 * @param {string} description - Description of part
 * @param {list} image_path - List of images
 * @param {number} spare_parts_class_id - Category id
 * @param {number} reorder_point - Reorder point
 * @param {number} minimum_stock_level - Min stock level
 * @param {number} maximum_stock_level - Max stock level
 * @param {number} current_stock - Current stock
 * @param {string} universal_code - Inventory code
 * @param {number} manufacturer_id - Manufacturer id
 * @returns {Promise} API response with edited spare part
 */
export const updateSparePart = ( id, update ) => {
  console.log( update )
  return http.request( {
    method : 'patch',
    url : `/resource/spare-part?id=${id}`,
    data : update
  } )
}

// Tool APIs

/**
 * Fetch all tool classes.
 * @returns {Promise} API response with the list of all tool classes
 */
export const getAllToolClasses = () => {
  console.log(
    http.request( {
      method : 'get',
      url : '/resource/tools-class'
    } )
  )
  return http.request( {
    method : 'get',
    url : '/resource/tools-class'
  } )
}

/**
 * Search tools.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @param {object} search - Search filter
 * @returns {Promise} API response with the list of tools.
 */
export const searchTools = ( page = 1, size = 20, sortField = 'name', direction = 'ASC', search = {} ) => {
  console.log(
    http.request( {
      method : 'post',
      url : `/resource/tool/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
      data : search
    } )
  )
  return http.request( {
    method : 'post',
    url : `/resource/tool/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : search
  } )
}

/**
 * Create tool
 * @param {object} - Tool creation data
 * @returns {Promise} API response with newly created tool
 */
export const createTool = data => {
  return http.request( {
    method : 'post',
    url : '/resource/tool/create',
    data
  } )
}

/**
 * Edit tool
 * @param {object} - Tool data for update
 * @returns {Promise} API response with edited tool
 */
export const updateTool = update => {
  return http.request( {
    method : 'patch',
    url : '/resource/tool/update',
    data : update
  } )
}

/**
 * Delete spare part
 * @param {number} id - Spare part ID
 * @returns {Promise} Nothing
 */
export const deleteSparePart = id => {
  return http.request( {
    method : 'delete',
    url : `/resource/spare-parts/${id}`
  } )
}

// api/resources.js
export const deleteTool = async id => {
  // ✅ match your backend's URL (note the /api prefix!)
  const url = `/api/resource/tool/delete/${encodeURIComponent( id )}`

  try {
    const res = await fetch( url, {
      method : 'DELETE',
      headers : { Accept : '*/*' }
    } )

    if ( res.status === 404 ) {
      // Optional: treat already-deleted items as success
      console.warn( `Tool ${id} not found (already deleted).` )
      return null
    }

    if ( !res.ok ) {
      const text = await res.text().catch( () => '' )
      throw new Error( text || res.statusText || `HTTP ${res.status}` )
    }

    // 204 success → no content
    return null
  } catch ( err ) {
    console.error( 'deleteTool error:', err )
    throw err
  }
}

// Inventory APIs
/**
 * Create inventory
 * @param {object} - Inventory creation data
 * @returns {Promise} API response with newly created Inventory
 */
export const createInventory = data => {
  return http.request( {
    method : 'post',
    url : '/inventory',
    data
  } )
}

/**
 * Edit inventory
 * @param {object} - Inventory data for update
 * @returns {Promise} API response with edited inventory
 */
export const updateInventory = ( id, update ) => {
  return http.request( {
    method : 'patch',
    url : `/inventory/${id}`,
    data : update
  } )
}

/**
 * Search inventory.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @param {object} search - Search filter
 * @returns {Promise} API response with the list of inventory.
 */
export const searchInventory = ( page = 1, size = 20, sortField = 'id', direction = 'ASC', search = {} ) => {
  return http.request( {
    method : 'post',
    url : `/inventory/search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : search
  } )
}

/**
 * Transfer Inventory
 * @param {object} - Inventory Transfer data
 * @returns {Promise} API response with transfer target Inventory
 */
export const transferInventory = transfer => {
  console.log( transfer )
  return http.request( {
    method : 'put',
    url : '/inventory/transfer',
    data : transfer
  } )
}

// Inventory Transaction Logs
/**
 * Search inventory transaction logs.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @param {object} search - Search filter
 * @returns {Promise} API response with the list of inventory transaction logs.
 */
export const searchInventoryTransactionLogs = (
  page = 1,
  size = 50,
  sortField = 'allocatedAt',
  direction = 'DESC',
  search = {}
) => {
  console.log( search )
  return http.request( {
    method : 'post',
    url : `/inventory/transaction-log?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : search
  } )
}

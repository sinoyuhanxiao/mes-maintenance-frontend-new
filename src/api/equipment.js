import http from '@/utils/request'

/**
 * Fetch all production lines.
 * @returns {Promise} API response with production lines.
 */
export const getAllProductionLines = () => {
  return http.request( {
    method : 'get',
    url : '/equipment/production-lines'
  } )
}

/**
 * Fetch equipment groups by production line ID.
 * @param {number} productionLineId - The production line ID.
 * @returns {Promise} API response with equipment groups.
 */
export const getEquipmentGroups = productionLineId => {
  return http.request( {
    method : 'post',
    url : '/equipment/equipment-groups',
    data : {
      production_line_ids : [productionLineId] // 需要数组格式
      // equipment_group_ids : [0],
      // equipment_ids : [0],
      // component_ids : [0],
      // location_ids : [0],
      // vendor_ids : [0]
    }
  } )
}

/**
 * Fetch equipments by equipment group ID.
 * @param {number} equipmentGroupId - The equipment group ID.
 * @returns {Promise} API response with equipments.
 */
export const getEquipments = equipmentGroupId => {
  return http.request( {
    method : 'get',
    url : '/equipment/equipment',
    data : { equipmentGroupId }
  } )
}

/**
 * Fetch equipment components by equipment ID.
 * @param {number} equipmentId - The equipment ID.
 * @returns {Promise} API response with equipment components.
 */
export const getEquipmentComponents = equipmentId => {
  return http.request( {
    method : 'get',
    url : '/equipment/equipment-component',
    data : { equipmentId }
  } )
}

/**
 * Fetch equipment tree.
 * @returns {Promise} API response with equipment tree nodes.
 */
export const getEquipmentTree = () => {
  return http.request( {
    method : 'get',
    url : '/equipment/node-trees'
  } )
}

/**
 * Fetch equipment subtree tree.
 * @param {number} equipmentId - The equipment ID.
 * @returns {Promise} API response with equipment Subtree nodes.
 */
export const getEquipmentSubtree = equipmentId => {
  return http.request( {
    method : 'get',
    url : `/equipment/node-subtree/${equipmentId}`
  } )
}

/**
 * Fetch equipment node by equipment ID.
 * @param {number} equipmentId - The equipment ID.
 * @returns {Promise} API response with equipment details.
 */
export const getEquipmentById = equipmentId => {
  return http.request( {
    method : 'get',
    url : `/equipment/equipment-node/${equipmentId}`
  } )
}

/**
 * Search equipment with pagination.
 * @param {number} page - The page number.
 * @param {number} size - Number of results per page.
 * @param {string} sortField - Field to sort by.
 * @param {string} direction - Sort direction ("ASC" or "DESC").
 * @param {object} search - Search filter
 * @returns {Promise} API response with the list of all Euipment.
 */
export const getEquipmentNodes = ( page = 1, size = 10, sortField = 'name', direction = 'ASC', search = {} ) => {
  return http.request( {
    method : 'post',
    url : `/equipment/node-search?page=${page}&size=${size}&sortField=${sortField}&direction=${direction}`,
    data : search
  } )
}

/**
 * Fetch equipment node by equipment ID.
 * @param {object} equipmentInfo - The equipment information payload.
 * @returns {Promise} API response with equipment details.
 */
export const createNewNode = equipmentInfo => {
  return http.request( {
    method : 'post',
    url : `/equipment/equipment-node`,
    data : equipmentInfo
  } )
}

/**
 * Edit equipment node by equipment ID and data.
 * @param {number} equipmentId - The equipment  ID.
 * @param {object} equipmentInfo - The equipment info to be edited.
 * @returns {Promise} API response with equipment details.
 */
export const editEquipmentNode = ( equipmentId, equipmentInfo ) => {
  return http.request( {
    method : 'patch',
    url : `/equipment/equipment-node/${equipmentId}`,
    data : equipmentInfo
  } )
}

/**
 * Deactivate equipment node by equipment ID.
 * @param {number} equipmentId - The equipment ID.
 * @returns {Promise} API response with status.
 */
export const deactivateEquipmentNode = equipmentId => {
  return http.request( {
    method : 'post',
    url : `/equipment/equipment-node/${equipmentId}/deactivate`
  } )
}

import http from '@/utils/request'

export const productionLineTypeId = 3
export const equipmentGroupTypeId = 4
export const equipmentTypeId = 5
export const componentTypeId = 6

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
 * Search equipment nodes by criteria.
 * @param {Object} searchCriteria - Search criteria object.
 * @returns {Promise} API response with equipment nodes.
 */
export const searchEquipmentNodes = searchCriteria => {
  return http.request( {
    method : 'post',
    url : '/equipment/node-search',
    data : searchCriteria
  } )
}

/**
 * Patch an existing equipment diagram.
 * @param {Object} payload - The diagram creation payload with pins.
 * @param {Number} diagramId - The equipment diagram to patch
 * @returns {Promise} API response with the updated diagram.
 */
export const patchEquipmentDiagram = ( diagramId, payload ) => {
  return http.request( {
    method : 'patch',
    url : `/equipment/equipment-diagram/update?diagramId=${diagramId}`,
    data : payload
  } )
}

/**
 * Get equipment diagram by ID.
 * @param {Number} diagramId - The equipment diagram ID to be fetched
 * @returns {Promise} API response with the equipment diagram.
 */
export const getEquipmentDiagram = diagramId => {
  return http.request( {
    method : 'get',
    url : '/equipment/equipment-diagram',
    data : { diagramId }
  } )
}

/**
 * Create a new equipment diagram.
 * @param {Object} payload - The diagram creation payload with pins.
 * @param {Number} equipmentNodeId - The equipment node to be associated with this diagram
 * @returns {Promise} API response with the created diagram.
 */
export const createEquipmentDiagram = async( payload, equipmentNodeId ) => {
  const requestBody = {
    equipment_node_id : equipmentNodeId,
    pins : payload.pins
  }

  return http.request( {
    method : 'post',
    url : '/equipment/equipment-diagram/create',
    data : requestBody,
    headers : { 'Content-Type' : 'application/json' }
  } )
}

/**
 * Update equipment node's diagram_id field.
 * @param {number} equipmentNodeId - The equipment node ID.
 * @param {string} diagramId - The diagram ID to associate.
 * @returns {Promise} API response.
 */
export const updateEquipmentNodeDiagramId = ( equipmentNodeId, diagramId ) => {
  const requestData = {
    diagram_id : diagramId
  }

  return http.request( {
    method : 'patch',
    url : `/equipment/equipment-node/${equipmentNodeId}`,
    data : requestData
  } )
}

/**
 * Update equipment node's exploded view drawing.
 * @param {number} equipmentNodeId - The equipment node ID.
 * @param {string} imageUrl - The URL of the new image.
 * @returns {Promise} API response.
 */
export const updateEquipmentNodeImage = ( equipmentNodeId, imageUrl ) => {
  const requestData = {
    exploded_view_drawing : [imageUrl]
  }

  return http.request( {
    method : 'patch',
    url : `/equipment/equipment-node/${equipmentNodeId}`,
    data : requestData
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

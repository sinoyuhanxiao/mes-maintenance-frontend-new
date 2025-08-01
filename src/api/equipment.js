import http from '@/utils/request'

/**
 * Fetch all production lines.
 * @returns {Promise} API response with production lines.
 */
export const getAllProductionLines = () => {
  return http.request({
    method: 'get',
    url: '/equipment/production-lines',
  })
}

/**
 * Fetch equipment groups by production line ID.
 * @param {number} productionLineId - The production line ID.
 * @returns {Promise} API response with equipment groups.
 */
export const getEquipmentGroups = productionLineId => {
  return http.request({
    method: 'post',
    url: '/equipment/equipment-groups',
    data: {
      production_line_ids: [productionLineId], // 需要数组格式
      // equipment_group_ids : [0],
      // equipment_ids : [0],
      // component_ids : [0],
      // location_ids : [0],
      // vendor_ids : [0]
    },
  })
}

/**
 * Fetch equipments by equipment group ID.
 * @param {number} equipmentGroupId - The equipment group ID.
 * @returns {Promise} API response with equipments.
 */
export const getEquipments = equipmentGroupId => {
  return http.request({
    method: 'get',
    url: '/equipment/equipment',
    data: { equipmentGroupId },
  })
}

/**
 * Fetch equipment components by equipment ID.
 * @param {number} equipmentId - The equipment ID.
 * @returns {Promise} API response with equipment components.
 */
export const getEquipmentComponents = equipmentId => {
  return http.request({
    method: 'get',
    url: '/equipment/equipment-component',
    data: { equipmentId },
  })
}

import api from './api'

const BASE_URL = '/api/equipment'

export const getAllProductionLines = () => {
  return api.get( `${BASE_URL}/production_lines` )
}

export const getEquipmentGroups = ( productionLineId ) => {
  return api.post( `${BASE_URL}/equipment_groups`, {
    production_line_ids : [productionLineId] // 需要数组格式
    // equipment_group_ids : [0],
    // equipment_ids : [0],
    // component_ids : [0],
    // location_ids : [0],
    // vendor_ids : [0]
  } )
}

export const getEquipments = ( equipmentGroupId ) => {
  return api.get( `${BASE_URL}/equipment`, {
    params : { equipmentGroupId }
  } )
}

export const getEquipmentComponents = ( equipmentId ) => {
  return api.get( `${BASE_URL}/equipment_component`, {
    params : { equipmentId }
  } )
}

import axios from 'axios'

const maintenanceManagement = axios.create( {
  baseURL : 'http://localhost:3002'
} )

const generalCommon = axios.create( {
  baseURL : 'http://localhost:3003'
} )

export const getWorkTypes = ( filter = '' ) => {
  return maintenanceManagement.get( `/work_type${filter}` )
}

export const getPriorities = ( filter = '' ) => {
  return generalCommon.get( `/priority${filter}` )
}

// 你可以在 PostgREST.js 或单独的文件中定义这个方法：
export const getEquipmentGroups = ( productionLineId ) => {
  return axios.get( `http://localhost:3002/equipment_group?production_line_id=eq.${productionLineId}` )
}

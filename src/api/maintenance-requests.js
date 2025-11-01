import http from '@/utils/request'

/**
 * Search maintenance requests with pagination and filters
 */
export const searchMaintenanceRequests = (
  page = 1,
  size = 10,
  sortField = 'createdAt',
  direction = 'DESC',
  searchPayload = {}
) => {
  return http.request({
    method: 'post',
    url: '/maintenance_request/search',
    params: { page, size, sortField, direction },
    data: searchPayload,
  })
}

/**
 * Get maintenance request by ID
 */
export const getMaintenanceRequestById = id => {
  return http.request({
    method: 'get',
    url: `/maintenance_request/${id}`,
  })
}

/**
 * Get maintenance requests by personnel ID
 */
export const getMaintenanceRequestsByPersonnel = personnelId => {
  return http.request({
    method: 'get',
    url: `/maintenance_request/personnel/${personnelId}`,
  })
}

/**
 * Create new maintenance request
 */
export const createMaintenanceRequest = data => {
  return http.request({
    method: 'post',
    url: '/maintenance_request',
    data: {
      name: data.name,
      image_list: data.image_list || [],
      description: data.description,
      equipment_node_id: data.equipment_node_id,
      work_order_id: data.work_order_id,
      created_by: data.created_by,
    },
  })
}

/**
 * Approve maintenance request
 */
export const approveMaintenanceRequest = id => {
  return http.request({
    method: 'put',
    url: `/maintenance_request/approve/${id}`,
  })
}

/**
 * Reject maintenance request
 */
export const rejectMaintenanceRequest = id => {
  return http.request({
    method: 'put',
    url: `/maintenance_request/reject/${id}`,
  })
}

/**
 * Update maintenance request
 */
export const updateMaintenanceRequest = (id, data) => {
  return http.request({
    method: 'patch',
    url: `/maintenance_request/${id}`,
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      image_list: data.image_list || [],
      file_list: data.file_list || [],
      equipment_node_id: data.equipment_node_id,
      work_order_id: data.work_order_id,
    },
  })
}

/**
 * Delete maintenance request (if needed)
 */
export const deleteMaintenanceRequest = id => {
  return http.request({
    method: 'delete',
    url: `/maintenance_request/${id}`,
  })
}

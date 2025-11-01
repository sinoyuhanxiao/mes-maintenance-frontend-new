// src/api/rbac.js
import http from '@/utils/request'
import ENV_CONFIG from '@/utils/env'

const USER_CLIENT_URL = ENV_CONFIG.USER_CLIENT_URL

/**
 * Search roles with filters and pagination.
 * @param {Object} search - RoleQueryRequest payload.
 * @param {number} page
 * @param {number} size
 * @param {string} sortField
 * @param {"ASC"|"DESC"} direction
 * @returns {Promise} API response with PagingResult<RoleDTO>
 */
export const searchRoles = (search = {}, page = 1, size = 10, sortField = 'createdAt', direction = 'DESC') => {
  return http.request({
    method: 'post',
    url: '/rbac/search/role',
    baseURL: USER_CLIENT_URL,
    data: search,
    params: { page, size, sortField, direction },
  })
}

/**
 * Create a new role.
 * @param {Object} data - RoleRequest payload.
 * @returns {Promise} API response (Void).
 */
export const createRole = data => {
  return http.request({
    method: 'post',
    url: '/rbac/role',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Update an existing role.
 * @param {number} id - Role ID.
 * @param {Object} data - RoleUpdateRequest payload.
 * @returns {Promise} API response with updated RoleDTO.
 */
export const updateRole = (id, data) => {
  return http.request({
    method: 'patch',
    url: `/rbac/role/${id}`,
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Create a new permission.
 * @param {Object} data - PermissionRequest payload.
 * @returns {Promise} API response (Void).
 */
export const createPermission = data => {
  return http.request({
    method: 'post',
    url: '/rbac/permission',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Grant roles to users.
 * @param {Object} data - GrantRoleRequest { userIds: [], roleIds: [] }.
 */
export const grantRoles = data => {
  return http.request({
    method: 'post',
    url: '/rbac/role/grant',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Revoke roles from users.
 * @param {Object} data - GrantRoleRequest { userIds: [], roleIds: [] }.
 */
export const revokeRoles = data => {
  return http.request({
    method: 'delete',
    url: '/rbac/role/revoke',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Grant permissions to roles.
 * @param {Object} data - GrantRolePermissionRequest { roleIds: [], permissionIds: [] }.
 */
export const grantPermissions = data => {
  return http.request({
    method: 'post',
    url: '/rbac/permission/grant',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Revoke permissions from roles.
 * @param {Object} data - GrantRolePermissionRequest { roleIds: [], permissionIds: [] }.
 */
export const revokePermissions = data => {
  return http.request({
    method: 'delete',
    url: '/rbac/permission/revoke',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Disable users.
 * @param {Array<number>} userIds
 */
export const disableUsers = userIds => {
  return http.request({
    method: 'post',
    url: '/rbac/users/disable',
    baseURL: USER_CLIENT_URL,
    data: userIds,
  })
}

/**
 * Enable users.
 * @param {Array<number>} userIds
 */
export const enableUsers = userIds => {
  return http.request({
    method: 'post',
    url: '/rbac/users/enable',
    baseURL: USER_CLIENT_URL,
    data: userIds,
  })
}

/**
 * Disable roles.
 * @param {Array<number>} roleIds
 */
export const disableRoles = roleIds => {
  return http.request({
    method: 'post',
    url: '/rbac/roles/disable',
    baseURL: USER_CLIENT_URL,
    data: roleIds,
  })
}

/**
 * Enable roles.
 * @param {Array<number>} roleIds
 */
export const enableRoles = roleIds => {
  return http.request({
    method: 'post',
    url: '/rbac/roles/enable',
    baseURL: USER_CLIENT_URL,
    data: roleIds,
  })
}

/**
 * Get users by role ID.
 */
export const getUsersByRoleId = (id, page = 1, size = 10, sortField = 'username', direction = 'ASC') => {
  return http.request({
    method: 'get',
    url: '/rbac/role/users',
    baseURL: USER_CLIENT_URL,
    params: { id, page, size, sortField, direction },
  })
}

/**
 * Get permissions by role ID.
 */
export const getPermissionsByRoleId = roleId => {
  return http.request({
    method: 'get',
    url: `/rbac/role/${roleId}/permissions`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Get roles by user ID.
 */
export const getRolesByUserId = userId => {
  return http.request({
    method: 'get',
    url: `/rbac/user/${userId}/roles`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Get role by role ID.
 */
export const getRoleId = roleId => {
  return http.request({
    method: 'get',
    url: `/rbac/${roleId}`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Get roles by permission ID.
 */
export const getRolesByPermissionId = permissionId => {
  return http.request({
    method: 'get',
    url: `/rbac/permission/${permissionId}/roles`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Get permissions by user ID.
 */
export const getPermissionsByUserId = userId => {
  return http.request({
    method: 'get',
    url: `/rbac/user/${userId}/permissions`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Reset user permissions.
 */
export const resetUserPermissions = userId => {
  return http.request({
    method: 'post',
    url: `/rbac/permissions/reset/${userId}`,
    baseURL: USER_CLIENT_URL,
  })
}

import http from '@/utils/request'
import ENV_CONFIG from '@/utils/env'

const USER_CLIENT_URL = ENV_CONFIG.USER_CLIENT_URL

// Cognito authentication related

function storeTokens(tokenData) {
  const at = tokenData.access_token ?? tokenData.accessToken
  const rt = tokenData.refresh_token ?? tokenData.refreshToken
  const it = tokenData.id_token ?? tokenData.idToken
  if (at) localStorage.setItem('access_token', at)
  if (rt) localStorage.setItem('refresh_token', rt)
  if (it) localStorage.setItem('id_token', it)
}

/**
 * Handle Cognito callback and store tokens
 * @param {string} code
 * @returns {Promise<object>} response payload
 */
export async function callback(code) {
  const res = await http.request({
    method: 'post',
    url: `${USER_CLIENT_URL}/auth/callback`,
    //    withCredentials : true,
    data: { code },
  })
  if (res?.data) storeTokens(res.data)
  return res
}

/**
 * Refresh tokens using stored refresh_token
 * @returns {Promise<object>} response payload
 */
export async function refresh() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const res = await http.request({
    method: 'post',
    url: `${USER_CLIENT_URL}/auth/refresh`,
    //    withCredentials : true,
    data: { refresh_token: refreshToken },
  })
  if (res?.data) storeTokens(res.data)
  return res
}

/*
 * Logout current session.
 * @returns {Promise<any>}
 */
export function logout() {
  http.request({
    method: 'post',
    //    withCredentials : true,
    url: `${USER_CLIENT_URL}/auth/logout`,
  })
}

// User management interface
/**
 * Get all users (paginated).
 */
export const getAllUsers = (page = 1, size = 1000, sortField = 'username', direction = 'ASC') => {
  return http.request({
    url: '/user',
    baseURL: USER_CLIENT_URL,
    method: 'get',
    data: { page, size, sortField, direction },
  })
}

/**
 * Search users with filters.
 */
export const searchUsers = (search = {}, page = 1, size = 10, sortField = 'createdAt', direction = 'DESC') => {
  return http.request({
    method: 'post',
    url: '/user/search',
    baseURL: USER_CLIENT_URL,
    data: search,
    params: { page, size, sortField, direction },
  })
}

/**
 * Get a user by ID.
 */
export const getUserById = id => {
  return http.request({
    method: 'get',
    url: `/user/${id}`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Delete a user by ID.
 */
export const deleteUserById = id => {
  return http.request({
    method: 'delete',
    url: `/user/${id}`,
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Create a new user.
 */
export const createUser = data => {
  return http.request({
    method: 'post',
    url: '/user',
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Update user as admin.
 */
export const updateUserByAdmin = (id, data) => {
  return http.request({
    method: 'patch',
    url: `/user/admin/${id}`,
    baseURL: USER_CLIENT_URL,
    data,
  })
}

/**
 * Get the currently logged-in user's info.
 */
export const getCurrentUser = () => {
  return http.request({
    method: 'get',
    url: '/user/me',
    baseURL: USER_CLIENT_URL,
  })
}

/**
 * Unique check on a username string. If existed already returns true, else false
 */
export const isUsernameExist = username => {
  return http.request({
    url: `/user/duplicate-username/${username}`,
    baseURL: USER_CLIENT_URL,
    method: 'get',
  })
}

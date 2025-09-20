import http from '@/utils/request'

/**
 * Fetch a task entry by its ID.
 * @param {string} id - Task entry identifier.
 * @returns {Promise<Object>} API response containing the task entry data.
 */
export const getTaskEntryById = id => {
  return http.request({
    method: 'get',
    url: `/task/entry/${id}`,
  })
}

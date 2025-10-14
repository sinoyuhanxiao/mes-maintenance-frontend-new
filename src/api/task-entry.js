import http from '@/utils/request'

/**
 * Fetch a task entry by its ID.
 * @param {string} id - Task entry identifier.
 * @returns {Promise<Object>} API response containing the task entry data.
 */
export const getTaskEntryById = id => {
  return http.request( {
    method : 'get',
    url : `/task/entry/${id}`
  } )
}

/**
 * Fetch task logs by task entry ID.
 * @param {string} taskId - Task entry identifier.
 * @param {string} [change] - Optional filter by change type.
 * @returns {Promise<Object>} API response containing task logs array.
 */
export const getTaskLogsByTaskId = ( taskId, change = null ) => {
  return http.request( {
    method : 'get',
    url : `/task/logs/task/${taskId}`,
    params : change ? { change } : {}
  } )
}

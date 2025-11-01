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

/**
 * Fetch task logs by task entry ID.
 * @param {string} taskId - Task entry identifier.
 * @param {string} [change] - Optional filter by change type.
 * @returns {Promise<Object>} API response containing task logs array.
 */
export const getTaskLogsByTaskId = (taskId, change = null) => {
  return http.request({
    method: 'get',
    url: `/task/logs/task/${taskId}`,
    params: change ? { change } : {},
  })
}

/**
 * Update a task entry with step values and execution data.
 * @param {string} id - Task entry identifier.
 * @param {Object} data - Task entry update payload.
 * @param {Array} data.step_update_list - Array of steps with updated values.
 * @param {number} data.time_taken_sec - Time taken in seconds.
 * @param {boolean} data.submit - Whether to submit (true) or save as draft (false).
 * @param {string} data.updated_by - User ID who updated the task.
 * @returns {Promise<Object>} API response containing the updated task entry.
 */
export const updateTaskEntry = (id, data) => {
  return http.request({
    method: 'patch',
    url: `/task/entry/${id}`,
    data,
  })
}

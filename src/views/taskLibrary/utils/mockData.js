// Mock data and utilities for development/testing purposes
// These functions simulate backend responses for development and testing

/**
 * Get available tools for step configuration (mock implementation)
 * @returns {Promise} Mock response with tool data
 */
export const getAvailableTools = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    data: [
      { tool_id: 't-001', name: 'Flashlight', spec: 'Yellow LED Flashlight' },
      { tool_id: 't-002', name: 'Thermometer', spec: 'King Digital -50°C to 150°C' },
      { tool_id: 't-003', name: 'Multimeter', spec: 'King Digital Multimeter' },
      { tool_id: 't-004', name: 'Screwdriver Set', spec: 'Hurry Phillips and Flathead' },
      { tool_id: 't-005', name: 'Wrench Set', spec: 'Adjustable Wrench Set for Peach Brother' },
    ],
  }
}

/**
 * Upload resource file (mock implementation)
 * @param {File} file - File to upload
 * @param {string} stepId - Associated step ID
 * @returns {Promise} Mock response with uploaded file data
 */
export const uploadResource = async (file, stepId) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    data: {
      id: `r-${Date.now()}`,
      name: file.name,
      url: `https://cdn.example.com/files/${file.name}`, // TODO: modify this for minio in the future
      mime: file.type,
    },
  }
}

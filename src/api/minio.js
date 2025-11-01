// src/api/minio.js

import http from '@/utils/request'
import { ENV_CONFIG } from '@/utils/env'

const MINIO_URL = ENV_CONFIG.MINIO_URL
const DEFAULT_BUCKET_NAME = ENV_CONFIG.DEFAULT_BUCKET_NAME

/**
 * Uploads a single file to MinIO via multipart/form-data.
 * Note: For file uploads, we still use fetch() as it handles FormData better
 * @param {File} file - The file to upload.
 * @returns {Promise} - Resolves with the response from the server.
 */
export async function uploadToMinio(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucketName', DEFAULT_BUCKET_NAME)

  const response = await fetch(`${MINIO_URL}/files/upload-multipart`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  return await response.json()
}

/**
 * Alternative upload method using request.js (for non-file data)
 * @param {Object} data - The data to send to MinIO API.
 * @returns {Promise} - API response.
 */
export function minioApiRequest(data) {
  return http.request({
    method: 'post',
    url: '/files/api-endpoint', // Adjust URL as needed
    data,
  })
}

/**
 * Uploads multiple files to MinIO using /files/upload-multipart-list.
 * Note: For file uploads, we still use fetch() as it handles FormData better
 * @param {File[]} files - An array of File objects.
 * @returns {Promise} - Resolves with the response from the server.
 */
export async function uploadMultipleToMinio(files) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })

  const response = await fetch(`${MINIO_URL}/files/upload-multipart-list?bucketName=${DEFAULT_BUCKET_NAME}`, {
    method: 'POST',
    body: formData,
  })

  // if ( !response.ok ) {
  //   throw new Error( 'Multi-file upload failed' )
  // }

  return await response.json()
}

/**
 * Get file information from MinIO.
 * @param {string} fileName - The name of the file.
 * @returns {Promise} - API response with file information.
 */
export function getFileInfo(fileName) {
  return http.request({
    method: 'get',
    url: '/files/info',
    data: {
      fileName,
      bucketName: DEFAULT_BUCKET_NAME,
    },
  })
}

/**
 * Delete a file from MinIO.
 * @param {string} fileName - The name of the file to delete.
 * @returns {Promise} - API response.
 */
export function deleteFile(fileName) {
  return http.request({
    method: 'delete',
    url: '/files/delete',
    data: {
      fileName,
      bucketName: DEFAULT_BUCKET_NAME,
    },
  })
}

/**
 * Delete list of objects from MinIO.
 * @param {Object} objectInfo - The data object with bucket name and object url list.
 * @returns {Promise} - API response.
 */
export async function deleteObjectList(objectInfo) {
  const response = await fetch(`${MINIO_URL}/files/object-list`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(objectInfo),
  })
  return await response.json()
}

// src/api/minio.js

const MINIO_URL = import.meta.env.VITE_MINIO_URL
const DEFAULT_BUCKET_NAME = import.meta.env.VITE_DEFAULT_BUCKET_NAME

/**
 * Uploads a single file to MinIO via multipart/form-data.
 * @param {File} file - The file to upload.
 * @returns {Promise} - Resolves with the response from the server.
 */
export async function uploadToMinio( file ) {
  const formData = new FormData()
  formData.append( 'file', file )
  formData.append( 'bucketName', DEFAULT_BUCKET_NAME )

  const response = await fetch( `${MINIO_URL}/files/upload-multipart`, {
    method : 'POST',
    body : formData
  } )

  if ( !response.ok ) {
    throw new Error( 'File upload failed' )
  }

  return await response.json()
}

/**
 * Uploads multiple files to MinIO using /files/upload-multipart-list.
 * @param {File[]} files - An array of File objects.
 * @returns {Promise} - Resolves with the response from the server.
 */
export async function uploadMultipleToMinio( files ) {
  const formData = new FormData()
  files.forEach( file => {
    formData.append( 'files', file )
  } )

  const response = await fetch( `${MINIO_URL}/files/upload-multipart-list?bucketName=${DEFAULT_BUCKET_NAME}`, {
    method : 'POST',
    body : formData
  } )

  if ( !response.ok ) {
    throw new Error( 'Multi-file upload failed' )
  }

  return await response.json()
}

<template>
  <div class="file-list">
    <template v-if="normFiles.length">
      <div v-for="f in normFiles" :key="f.id || f.url || f.name" class="file-item">
        <div class="file-info">
          <el-icon :size="18" class="file-icon">
            <component :is="iconForType(f.type)" />
          </el-icon>
          <span class="file-name" :title="f.name">{{ f.name }}</span>
        </div>

        <div class="file-actions">
          <!-- Preview -->
          <el-button link type="primary" :icon="View" title="Preview" @click.stop="onPreview(f)" />
          <!-- Download -->
          <el-button link type="primary" :icon="Download" title="Download" @click.stop="onDownload(f)" />
        </div>
      </div>
    </template>

    <div v-else class="no-files">
      <el-text>{{ emptyText }}</el-text>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Picture, VideoCamera, Microphone, Download, View } from '@element-plus/icons-vue'

/**
 * Props
 * - files: Array<string | { id?, name?, url, type? }>
 * - emptyText: string shown when no files
 * - nativePreview: if true, component opens preview in new tab by default (emits 'preview' too)
 * - nativeDownload: if true, component performs download by default (emits 'download' too)
 */
const props = defineProps( {
  files : { type : Array, default : () => [] },
  emptyText : { type : String, default : 'No files available' },
  nativePreview : { type : Boolean, default : true },
  nativeDownload : { type : Boolean, default : true }
} )

const emit = defineEmits( ['preview', 'download', 'download-error'] )

/* ---------------- Normalization ---------------- */
const normFiles = computed( () =>
  ( props.files || [] ).map( ( raw, i ) => {
    // strings -> {url, name, type}
    if ( typeof raw === 'string' ) {
      const name = filenameFromUrl( raw ).replace( /\d{17}/, '' )
      return {
        id : i,
        url : raw,
        name,
        type : typeFromName( name )
      }
    }
    // objects
    const url = raw?.url
    const name = raw?.name || filenameFromUrl( url ).replace( /\d{17}/, '' ) || `file_${i + 1}`
    const type = ( raw?.type && raw.type.toLowerCase() ) || typeFromName( name )
    return { id : raw?.id ?? i, url, name, type }
  } )
)

function filenameFromUrl( u ) {
  if ( !u ) return 'file'
  try {
    const url = new URL( u, window.location.href )
    const qp = url.searchParams.get( 'filename' ) || url.searchParams.get( 'name' )
    const last = url.pathname.split( '/' ).filter( Boolean ).pop() || 'file'
    return decodeURIComponent( qp || last )
  } catch {
    // fallback for non-absolute URLs
    const last = String( u ).split( '?' )[0].split( '/' ).filter( Boolean ).pop() || 'file'
    try {
      return decodeURIComponent( last )
    } catch {
      return last
    }
  }
}

function typeFromName( name ) {
  const ext = ( name?.split( '.' ).pop() || '' ).toLowerCase()
  const image = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const video = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  const audio = ['mp3', 'wav', 'flac', 'aac', 'ogg']
  const archive = ['zip', 'rar', '7z', 'tar', 'gz']
  if ( image.includes( ext ) ) return 'image'
  if ( video.includes( ext ) ) return 'video'
  if ( audio.includes( ext ) ) return 'audio'
  if ( archive.includes( ext ) ) return 'download'
  if ( ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes( ext ) ) return 'document'
  return 'document'
}

function iconForType( type ) {
  switch ( ( type || '' ).toLowerCase() ) {
    case 'image':
      return Picture
    case 'video':
      return VideoCamera
    case 'audio':
      return Microphone
    case 'download':
      return Download
    default:
      return Document
  }
}

/* ---------------- Actions ---------------- */
function onPreview( file ) {
  emit( 'preview', file )
  if ( props.nativePreview && file?.url ) {
    window.open( file.url, '_blank' )
  }
}

async function onDownload( file ) {
  emit( 'download', file )
  if ( !props.nativeDownload || !file?.url ) return

  try {
    const res = await fetch( file.url, { mode : 'cors', credentials : 'omit' } )
    if ( !res.ok ) throw new Error( `HTTP ${res.status}` )
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL( blob )
    const a = document.createElement( 'a' )
    a.href = blobUrl
    a.download = file.name || 'file'
    document.body.appendChild( a )
    a.click()
    a.remove()
    URL.revokeObjectURL( blobUrl )
  } catch ( e ) {
    console.error( 'Download failed', e )
    ElMessage.error( 'Download failed' )
    emit( 'download-error', e )
  }
}
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fafafa;
  transition: background-color 0.2s;
}
.file-item:hover {
  background-color: #f0f9ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-icon {
  color: var(--el-color-primary);
}
.file-name {
  font-weight: 500;
}

/* Bold, prominent action icons (Preview / Download) */
.file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.file-actions .el-button {
  font-weight: 700;
  padding: 4px;
}
.file-actions .el-button .el-icon {
  font-size: 20px;
  stroke-width: 2.2;
  color: var(--el-color-primary);
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.25));
  transition: transform 0.15s ease, color 0.15s ease;
}
.file-actions .el-button:hover .el-icon {
  color: var(--el-color-primary-dark-2);
  transform: scale(1.15);
}

.no-files {
  text-align: left;
}
</style>

<template>
  <div class="t2-details">
    <template v-if="equipmentData">
      <div class="general-information">
        <el-descriptions :column="2" direction="vertical">
          <el-descriptions-item label="Name">{{ equipmentData.name }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ equipmentData.code }}</el-descriptions-item>
          <el-descriptions-item label="Description" class="highlighted-item">
            {{ equipmentData.description || 'No description available' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-divider />
      <div class="location">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Location Path">
            <el-breadcrumb :separator-icon="ArrowRight">
              <el-breadcrumb-item v-for="location in locationPath" :key="location.id">
                {{ location.name }}
              </el-breadcrumb-item>
              <el-breadcrumb-item v-if="locationPath.length === 0"> No location path available </el-breadcrumb-item>
            </el-breadcrumb>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-divider />
      <div class="image">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Images">
            <div v-if="equipmentData.image_list && equipmentData.image_list.length > 0" class="image-gallery">
              <el-image
                v-for="(imagePath, index) in equipmentData.image_list"
                :key="index"
                :src="imagePath"
                :preview-src-list="equipmentData.image_list"
                fit="cover"
                class="equipment-image"
              />
            </div>
            <div v-else class="no-images">
              <el-text>No equipment images available</el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-divider />
      <div class="files">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Files">
            <div class="file-list">
              <div v-if="equipmentData.file_list && equipmentData.file_list.length > 0">
                <div v-for="file in equipmentData.file_list" :key="file.id || file.name" class="file-item">
                  <el-link :href="file.url" target="_blank" :icon="getFileIcon(file.type)" class="file-link">
                    {{ file.name }}
                  </el-link>
                </div>
              </div>
              <div v-else class="no-files"><el-text> No files available </el-text></div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

    <!-- Loading state -->
    <div v-else-if="loading" class="loading-state" v-loading="true" element-loading-text="Loading equipment details...">
      <div style="height: 200px"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <el-alert type="error" :title="error" show-icon />
    </div>

    <!-- No data state -->
    <div v-else class="no-data">
      <el-empty description="No equipment data found" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ArrowRight, Document, Picture, VideoCamera, Microphone, Download } from '@element-plus/icons-vue'
import { getEquipmentById } from '@/api/equipment.js'
import { getLocationPathById } from '@/api/location.js'

const props = defineProps( {
  equipmentId : {
    type : Number
  }
} )

const equipmentData = ref( null )
const locationPath = ref( [] )
const loading = ref( false )
const error = ref( null )

// Parse file list from array of URLs
const parseFileList = fileArray => {
  if ( !fileArray || !Array.isArray( fileArray ) ) return []

  return fileArray.map( ( url, index ) => {
    // Extract filename from URL
    const urlParts = url.split( '/' )
    const filename = urlParts[urlParts.length - 1] || `file_${index + 1}`

    // Clean up filename (remove timestamp if present)
    const cleanFilename = filename.replace( /\d{17}/, '' ) // Remove 17-digit timestamp

    return {
      id : index,
      name : decodeURIComponent( cleanFilename ),
      url,
      type : getFileTypeFromName( cleanFilename )
    }
  } )
}

// Fetch equipment data
const fetchEquipmentData = async() => {
  if ( !props.equipmentId ) return

  try {
    loading.value = true
    error.value = null

    const response = await getEquipmentById( props.equipmentId )
    equipmentData.value = response.data

    // Parse file list if it's an array of URLs
    if ( equipmentData.value.file_list && Array.isArray( equipmentData.value.file_list ) ) {
      equipmentData.value.file_list = parseFileList( equipmentData.value.file_list )
    }

    if (
      equipmentData.value.location?.id &&
      typeof equipmentData.value.location.id !== 'object' &&
      equipmentData.value.location.status !== 0
    ) {
      await fetchLocationPath( equipmentData.value.location.id )
    } else {
      locationPath.value = []
    }
  } catch ( err ) {
    error.value = err.message || 'Failed to fetch equipment data'
  } finally {
    loading.value = false
  }
}

// Fetch location path
const fetchLocationPath = async locationId => {
  try {
    const response = await getLocationPathById( locationId )
    locationPath.value = response.data || []
  } catch ( err ) {
    locationPath.value = []
  }
}

// Get file icon based on file type
function getFileIcon( fileType ) {
  switch ( fileType?.toLowerCase() ) {
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return Picture
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return VideoCamera
    case 'audio':
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return Microphone
    case 'pdf':
    case 'document':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return Document
    case 'download':
    case 'zip':
    case 'rar':
    case '7z':
      return Download
    default:
      return Document
  }
}

// Get file type from file name extension
function getFileTypeFromName( fileName ) {
  if ( !fileName ) return 'document'

  const extension = fileName.split( '.' ).pop()?.toLowerCase()

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg']
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz']

  if ( imageTypes.includes( extension ) ) return 'image'
  if ( videoTypes.includes( extension ) ) return 'video'
  if ( audioTypes.includes( extension ) ) return 'audio'
  if ( archiveTypes.includes( extension ) ) return 'download'

  return 'document'
}

onMounted( () => {
  fetchEquipmentData()
} )

watch(
  () => props.equipmentId,
  newId => {
    if ( newId ) {
      fetchEquipmentData()
    }
  }
)
</script>

<style scoped>
.t2-details {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.general-information {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.location {
  flex: 0;
  display: flex;
  flex-direction: column;
  background-color: #0085a4;
}

.image {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #0085a4;
}

.image-gallery {
  display: flex;
  flex-direction: row;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
}

.equipment-image {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  flex-shrink: 0;
}

.no-images {
  text-align: left;
}

.files {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f0f9ff;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.no-files {
  text-align: left;
}
</style>

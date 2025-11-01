<template>
  <div class="t4-details">
    <template v-if="equipmentData">
      <div class="general-information">
        <el-descriptions :column="3" direction="vertical">
          <el-descriptions-item label="Name">{{ equipmentData.name }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ equipmentData.code }}</el-descriptions-item>
          <el-descriptions-item label="Model">
            {{ equipmentData.model || equipmentData.serial_number || '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="Description" class="highlighted-item">
            {{ equipmentData.description || 'No description available' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- Location -->
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

      <!-- Exploded View -->
      <div class="image">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Exploded View">
            <div v-if="equipmentData.exploded_view_drawing" class="image-gallery">
              <el-image
                :src="equipmentData.exploded_view_drawing"
                :preview-src-list="[equipmentData.exploded_view_drawing]"
                :hide-on-click-modal="true"
                fit="contain"
                class="equipment-image"
              />
            </div>
            <div v-else class="no-images">
              <el-text>No exploded view available</el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- Images -->
      <div class="image">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Images">
            <div v-if="equipmentData.image_list?.length" class="image-gallery">
              <el-image
                v-for="(imagePath, index) in equipmentData.image_list"
                :key="index"
                :src="imagePath"
                :preview-src-list="equipmentData.image_list"
                hide-on-click-modal="true"
                fit="contain"
                class="equipment-image"
              />
            </div>
            <div v-else class="no-images">
              <el-text>No images available</el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- Files (reuse) -->
      <div class="files">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Files">
            <FileDisplay
              :files="equipmentData.file_list || []"
              empty-text="No files available"
              :native-preview="true"
              :native-download="true"
              @preview="onPreview"
              @download="onDownload"
              @download-error="onDownloadError"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

    <div v-else-if="loading" class="loading-state" v-loading="true">
      <div style="height: 200px"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <el-alert type="error" :title="error" show-icon />
    </div>

    <div v-else class="no-data">
      <el-empty description="No equipment data found" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FileDisplay from '@/components/common/FileDisplay.vue'
import { getEquipmentById } from '@/api/equipment.js'
import { getLocationPathById } from '@/api/location.js'

const props = defineProps( { equipmentId : Number } )

const equipmentData = ref( null )
const locationPath = ref( [] )
const loading = ref( false )
const error = ref( null )

const fetchEquipmentData = async() => {
  if ( !props.equipmentId ) return
  try {
    loading.value = true
    error.value = null

    const response = await getEquipmentById( props.equipmentId )
    equipmentData.value = response.data

    // Location path
    const loc = equipmentData.value?.location
    if ( loc?.id && loc?.status !== 0 ) {
      const res = await getLocationPathById( loc.id )
      locationPath.value = res.data || []
    } else {
      locationPath.value = []
    }
  } catch ( err ) {
    error.value = err.message || 'Failed to fetch equipment data'
  } finally {
    loading.value = false
  }
}

onMounted( fetchEquipmentData )
watch(
  () => props.equipmentId,
  id => id && fetchEquipmentData()
)

/* Optional hooks (analytics/custom behavior) */
function onPreview( file ) {
  /* no-op by default */
}
function onDownload( file ) {
  /* no-op by default */
}
function onDownloadError( e ) {
  console.error( e )
  ElMessage.error( 'Download failed' )
}
</script>

<style scoped>
.t4-details {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.general-information {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.location,
.image {
  flex: 0;
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
</style>

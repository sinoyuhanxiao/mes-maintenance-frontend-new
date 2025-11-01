<template>
  <div class="t2-details">
    <template v-if="equipmentData">
      <div class="general-information">
        <el-descriptions :column="2" direction="vertical">
          <el-descriptions-item label="Name">{{ equipmentData.name }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ equipmentData.code }}</el-descriptions-item>
          <el-descriptions-item label="Description">
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
              <el-breadcrumb-item v-if="locationPath.length === 0">No location path available</el-breadcrumb-item>
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
                fit="contain"
                class="equipment-image"
              />
            </div>
            <div v-else class="no-images"><el-text>No exploded view available</el-text></div>
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
                v-for="(img, i) in equipmentData.image_list"
                :key="i"
                :src="img"
                :preview-src-list="equipmentData.image_list"
                fit="contain"
                class="equipment-image"
              />
            </div>
            <div v-else class="no-images"><el-text>No images available</el-text></div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- Files (reusable) -->
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

    <div v-else-if="loading" v-loading="true" style="height: 200px"></div>
    <div v-else-if="error"><el-alert type="error" :title="error" show-icon /></div>
    <div v-else><el-empty description="No equipment data found" /></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import FileDisplay from '@/components/Common/FileDisplay.vue'
import { getEquipmentById } from '@/api/equipment.js'
import { getLocationPathById } from '@/api/location.js'

const props = defineProps( { equipmentId : Number } )

const equipmentData = ref( null )
const locationPath = ref( [] )
const loading = ref( false )
const error = ref( null )

/* -------- Fetching -------- */
async function fetchEquipmentData() {
  if ( !props.equipmentId ) return
  try {
    loading.value = true
    error.value = null
    const res = await getEquipmentById( props.equipmentId )
    equipmentData.value = res.data

    const loc = equipmentData.value?.location
    if ( loc?.id && loc?.status !== 0 ) {
      const resp = await getLocationPathById( loc.id )
      locationPath.value = resp.data || []
    } else {
      locationPath.value = []
    }
  } catch ( e ) {
    error.value = e.message || 'Failed to fetch equipment data'
  } finally {
    loading.value = false
  }
}

onMounted( fetchEquipmentData )
watch(
  () => props.equipmentId,
  id => id && fetchEquipmentData()
)

/* -------- Optional listeners (you can remove if unused) -------- */
function onPreview( file ) {
  // Hook if you want analytics or custom behavior
  // Default preview is already handled by FileList when nativePreview=true
}

function onDownload( file ) {
  // Hook if you want analytics or custom behavior
  // Default download is already handled by FileList when nativeDownload=true
}

function onDownloadError( err ) {
  ElMessage.error( 'Download failed' )
  console.error( err )
}
</script>

<style scoped>
.t2-details {
  display: flex;
  flex-direction: column;
}

.image-gallery {
  display: flex;
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

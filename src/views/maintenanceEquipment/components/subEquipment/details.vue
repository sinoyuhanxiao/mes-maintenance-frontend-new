<template>
  <div class="t3-details">
    <template v-if="equipmentData">
      <div class="general-information">
        <el-descriptions :column="3" direction="vertical">
          <el-descriptions-item label="Name">{{ equipmentData.name }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ equipmentData.code }}</el-descriptions-item>
          <el-descriptions-item label="Model">{{ equipmentData.model || equipmentData.serial_number || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="Description" class="highlighted-item">
            {{ equipmentData.description || 'No description available' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-divider />
      <div class="location">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Location Path">
            <el-breadcrumb :separator-icon="ArrowRight" v-if="locationPath.length > 0">
              <el-breadcrumb-item
                v-for="location in locationPath"
                :key="location.id"
              >
                {{ location.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
            <el-text v-else type="info">
              Location path not available
            </el-text>
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
              <el-image :src="src" fit="cover" class="equipment-image" />
              <el-text type="info">No equipment images available</el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </template>

    <!-- Loading state -->
    <div v-else-if="loading" class="loading-state">
      <el-loading text="Loading equipment details..." />
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
import { ArrowRight } from '@element-plus/icons-vue'
import { getEquipmentById } from '@/api/equipment.js'
import { getLocationPathById } from '@/api/location.js'

const props = defineProps( {
  equipmentId : {
    type : Number,
    required : true
  }
} )

const equipmentData = ref( null )
const locationPath = ref( [] )
const loading = ref( false )
const error = ref( null )

// Fetch equipment data
const fetchEquipmentData = async() => {
  if ( !props.equipmentId ) return

  try {
    loading.value = true
    error.value = null

    const response = await getEquipmentById( props.equipmentId )
    equipmentData.value = response.data

    console.log( 'Equipment data:', equipmentData.value )

    // Use location_id to fetch location path
    if ( equipmentData.value.location_id ) {
      console.log( 'Fetching location path for location_id:', equipmentData.value.location_id )
      await fetchLocationPath( equipmentData.value.location_id )
    } else {
      console.log( 'No location_id found in equipment data' )
    }
  } catch ( err ) {
    console.error( 'Error fetching equipment:', err )
    error.value = err.message || 'Failed to fetch equipment data'
  } finally {
    loading.value = false
  }
}

// Fetch location path
const fetchLocationPath = async( locationId ) => {
  try {
    const response = await getLocationPathById( locationId )
    locationPath.value = response.data || []
    console.log( 'Location path received:', locationPath.value )
  } catch ( err ) {
    console.error( 'Error fetching location path:', err )
    locationPath.value = []
  }
}

onMounted( () => {
  fetchEquipmentData()
} )

watch( () => props.equipmentId, ( newId ) => {
  if ( newId ) {
    fetchEquipmentData()
  }
} )

const src = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
</script>

<style scoped>
.t3-details {
  flex: 1;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading-state, .error-state, .no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
}
</style>

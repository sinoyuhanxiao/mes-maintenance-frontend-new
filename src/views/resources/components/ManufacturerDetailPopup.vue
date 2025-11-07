<template>
  <el-dialog
    v-model="visible"
    :title="`Manufacturer Details — ${manufacturer?.name || ''}`"
    width="600px"
    top="10vh"
    destroy-on-close
  >
    <div v-loading="loading" element-loading-background="rgba(255,255,255,0.6)">
      <template v-if="manufacturer">
        <el-descriptions :column="2" class="general-details-descriptions" direction="vertical">
          <el-descriptions-item label="Name">{{ manufacturer.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ manufacturer.code || '-' }}</el-descriptions-item>

          <el-descriptions-item label="Website">
            <a v-if="manufacturer.website" :href="manufacturer.website" target="_blank" rel="noopener">
              {{ manufacturer.website }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>

          <el-descriptions-item label="Country">{{ manufacturer.country || '-' }}</el-descriptions-item>

          <el-descriptions-item label="Email">{{ manufacturer.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Phone">{{ manufacturer.phone_number || '-' }}</el-descriptions-item>

          <el-descriptions-item label="Description" :span="2">
            {{ manufacturer.description || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="Created At">
            {{ formatDate(manufacturer.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="Updated At">
            {{ formatDate(manufacturer.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Optional: Display image list if exists -->
        <div v-if="manufacturer.image_list?.length" class="image-section">
          <h4>Images</h4>
          <div class="image-list">
            <el-image
              v-for="(img, i) in manufacturer.image_list"
              :key="i"
              :src="img.url"
              fit="cover"
              style="width: 120px; height: 120px; border-radius: 8px"
            />
          </div>
        </div>
      </template>

      <template v-else-if="!loading">
        <div class="empty-state">No manufacturer details found.</div>
      </template>
    </div>

    <template #footer>
      <el-button type="primary" @click="closeDialog">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getManufacturerById } from '@/api/manufacturer'

const props = defineProps( {
  manufacturerId : {
    type : [Number, String],
    required : true
  },
  modelValue : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['update:modelValue'] )

const visible = ref( props.modelValue )
const manufacturer = ref( null )
const loading = ref( false )

watch(
  () => props.modelValue,
  val => {
    visible.value = val
    if ( val && props.manufacturerId ) {
      fetchManufacturer()
    }
  }
)

watch(
  () => props.manufacturerId,
  newId => {
    if ( visible.value && newId ) {
      fetchManufacturer()
    }
  }
)

function closeDialog() {
  emit( 'update:modelValue', false )
}

async function fetchManufacturer() {
  if ( !props.manufacturerId ) return
  loading.value = true
  manufacturer.value = null
  try {
    const res = await getManufacturerById( props.manufacturerId )
    manufacturer.value = res.data || null
  } catch ( err ) {
    console.error( 'Failed to fetch manufacturer:', err )
    ElMessage.error( 'Failed to load manufacturer details.' )
  } finally {
    loading.value = false
  }
}

function formatDate( dateStr ) {
  if ( !dateStr ) return '-'
  const d = new Date( dateStr )
  return d.toLocaleString()
}

onMounted( () => {
  if ( props.modelValue && props.manufacturerId ) {
    fetchManufacturer()
  }
} )
</script>

<style scoped>
.general-details-descriptions {
  margin-bottom: 20px;
}

.image-section {
  margin-top: 20px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>

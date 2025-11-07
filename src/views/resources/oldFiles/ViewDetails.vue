<template>
  <el-card>
    <div class="details-layout">
      <div class="details-panel">
        <!-- Basic Info + Stock -->
        <el-descriptions :column="descCols" direction="vertical" label-width="33%">
          <el-descriptions-item label="Spare Part Name">
            {{
                localData.name ? localData.name : '--'
            }}
          </el-descriptions-item>

          <el-descriptions-item label="Part Code">{{ localData.code ? localData.code : '--' }}</el-descriptions-item>
          <el-descriptions-item label="Inventory Code">{{
            localData.universal_code ? localData.universal_code : '--'
          }}</el-descriptions-item>

          <el-descriptions-item label="Manufacturer">
            {{ localData.manufacturer ? localData.manufacturer.name : '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="Category">
            {{ localData.spare_parts_class ? localData.spare_parts_class.name : '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="Reorder Point">
            {{ localData.reorder_point ?? '--' }}
          </el-descriptions-item>

          <!-- Combined stock: current/min/max (color only, no flags) -->
          <el-descriptions-item label="Stock (Current/Min/Max)">
            <div class="stock-line">
              <el-text :type="stockColorType" class="stock-color-wrap">
                <span :style="fwStyle">{{ currentDisplay }}</span
                >/<span :style="fwStyle">{{ minDisplay }}</span
                >/<span :style="fwStyle">{{ maxDisplay }}</span>
              </el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Description -->
        <el-divider />
        <el-descriptions :column="1" direction="vertical" class="section">
          <el-descriptions-item label="Description">
            <el-text>{{ localData.description || 'No Description available' }}</el-text>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Related Assets -->
        <el-divider />
        <el-descriptions :column="1" direction="horizontal" class="section">
          <el-descriptions-item label="Related Assets">
            <div class="section-body">
              <el-breadcrumb v-if="nodes && nodes.length" :separator-icon="Minus" class="assets-breadcrumb">
                <el-breadcrumb-item v-for="node in nodes" :key="node.id" :label="node.name">
                  {{ node.name }}
                </el-breadcrumb-item>
              </el-breadcrumb>
              <el-text v-else>No related assets</el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Related Images (only show URLs that return HTTP 200) -->
        <el-divider />
        <el-descriptions :column="1" direction="horizontal" class="section">
          <el-descriptions-item label="Images">
            <div class="image-grid">
              <template v-if="validImageUrls.length">
                <button
                  v-for="(u, i) in validImageUrls"
                  :key="u + '_' + i"
                  class="thumb"
                  type="button"
                  @click="openPreview(u)"
                  @keydown.enter.prevent="openPreview(u)"
                  aria-label="Preview image"
                >
                  <img :src="u" alt="" />
                </button>
              </template>
              <div v-else class="no-images">
                <el-text>No images available</el-text>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- Simple image preview dialog -->
    <el-dialog v-model="preview.open" :width="'80%'" :top="'5vh'" append-to-body destroy-on-close>
      <div class="preview-wrapper">
        <img :src="preview.url" alt="Preview" class="preview-image" />
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { Minus } from '@element-plus/icons-vue'
import { getEquipmentNodes } from '@/api/equipment'

const props = defineProps( { data : Object } )

const localData = ref( props.data )
const nodes = ref( null )

/** Responsive columns: 3 for >=1440px, else 2 */
const windowWidth = ref( typeof window !== 'undefined' ? window.innerWidth : 1440 )
const onResize = () => {
  windowWidth.value = window.innerWidth
}
onMounted( () => window.addEventListener( 'resize', onResize ) )
onBeforeUnmount( () => window.removeEventListener( 'resize', onResize ) )
const descCols = computed( () => ( windowWidth.value >= 1440 ? 3 : 2 ) )

/** Raw image URLs from data (string or array) */
const imageUrls = computed( () => {
  const raw = localData.value?.image_list
  if ( !raw ) return []
  return Array.isArray( raw ) ? raw : [raw]
} )

/** Filtered URLs that returned HTTP 200 via HEAD */
const validImageUrls = ref( [] )
let imgSeq = 0
const checkImageUrls = async() => {
  const seq = ++imgSeq
  try {
    const checks = await Promise.all(
      imageUrls.value.map( async u => {
        try {
          const res = await fetch( u, { method : 'HEAD' } )
          return res.ok ? u : null
        } catch {
          return null
        }
      } )
    )
    if ( seq !== imgSeq ) return
    validImageUrls.value = checks.filter( Boolean )
  } catch {
    if ( seq !== imgSeq ) return
    validImageUrls.value = []
  }
}

watch(
  imageUrls,
  list => {
    if ( list.length ) {
      checkImageUrls()
    } else {
      imgSeq++
      validImageUrls.value = []
    }
  },
  { immediate : true }
)

/** Color logic for stock number:
 * - danger (red) when current <= 0
 * - warning (orange) when 0 < current < min
 * - default otherwise
 */
const stockColorType = computed( () => {
  const cur = Number( localData.value?.current_stock )
  const min = Number( localData.value?.minimum_stock_level )
  if ( Number.isFinite( cur ) ) {
    if ( cur <= 0 ) return 'danger'
    if ( Number.isFinite( min ) && cur < min ) return 'warning'
  }
  return ''
} )

/** Bold when low or out of stock */
const emphasizeStock = computed( () => {
  const cur = Number( localData.value?.current_stock )
  const min = Number( localData.value?.minimum_stock_level )
  if ( !Number.isFinite( cur ) ) return false
  if ( cur <= 0 ) return true
  if ( Number.isFinite( min ) && cur < min ) return true
  return false
} )

// Bold all three when low or out; normal otherwise
const fwStyle = computed( () => ( { fontWeight : emphasizeStock.value ? 700 : 400 } ) )

const currentDisplay = computed( () => localData.value?.current_stock ?? '--' )
const minDisplay = computed( () => localData.value?.minimum_stock_level ?? '--' )
const maxDisplay = computed( () => localData.value?.maximum_stock_level ?? '--' )

/** Image preview */
const preview = ref( { open : false, url : '' } )
const openPreview = u => {
  preview.value.url = u
  preview.value.open = true
}

async function getNodeData() {
  const response = await getEquipmentNodes( 1, 100, 'name', 'ASC', { spare_part_ids : [props.data.id] } )
  nodes.value = response.data.content
}

watch(
  () => props.data,
  newData => {
    localData.value = { ...newData }
    getNodeData()
  },
  { immediate : true, deep : true }
)
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 652px;
  height: 592px;
}

.details-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
}

/* stock line (number only) */
.stock-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.stock-line {
  display: inline;
} /* no flex gap */
.stock-color-wrap {
  display: contents;
} /* remove el-text box so '/' is flush */

/* Section label styling to match location-detail */
.section :deep(.el-descriptions__label) {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-body {
  margin-top: 8px;
}

/* Image grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 8px;
}
.thumb {
  display: block;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.thumb img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}
.no-images {
  display: flex;
  align-items: center;
  min-height: 40px;
}

/* Preview dialog content */
.preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: min(80vh, 70vw);
}
.preview-image {
  max-width: 100%;
  max-height: 75vh;
  display: block;
  border-radius: 6px;
}

/* Responsive tweak */
@media (max-width: 1600px) {
  .details-layout {
    gap: 1rem;
    overflow-y: auto;
    max-height: 377px;
  }
}
</style>

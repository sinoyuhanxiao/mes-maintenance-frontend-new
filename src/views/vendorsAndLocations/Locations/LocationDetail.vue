<!-- src/views/vendorsAndLocations/Locations/LocationDetail.vue -->
<template>
  <div class="location-detail" v-if="location">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-main">
        <h2 class="detail-title">{{ location.name }}</h2>
      </div>

      <div class="header-actions">
        <el-dropdown trigger="click" placement="bottom-end" class="kebab-dropdown">
          <span class="kebab-trigger" role="button" aria-label="More actions">
            <el-icon class="kebab-icon">
              <MoreFilled />
            </el-icon>
          </span>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="enterEditMode">Edit</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Body -->
    <div class="detail-body">
      <div class="descriptions-container">
        <!-- General Info -->
        <el-descriptions class="two-col" :column="2" direction="vertical">
          <el-descriptions-item label="Name">{{ location.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ location.code || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Location Type">{{ location.location_type?.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Person in Charge">
            <template v-if="personInCharge">
              <div class="pic-line">
                <span class="pic-name">{{ picName }}</span>
              </div>
            </template>
            <template v-else>--</template>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Description -->
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Description">
            {{ location?.description?.length ? location.description : 'No description available' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Address -->
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Address">
            {{ location?.address?.length ? location.address : 'No address available' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="hasCoords" class="map-block">
          <el-descriptions :column="1" direction="vertical">
            <el-descriptions-item>
              <OsmMapFrame :lat="mapCenter.lat" :lng="mapCenter.lng" :delta="0.03" width="95%" />
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Images -->
        <el-divider v-if="!hasCoords" />
        <div v-if="isImagesLoading">
          <el-descriptions :column="1" direction="horizontal" class="section">
            <el-descriptions-item label="Images">
              <div class="image-grid">
                <el-skeleton v-for="n in 1" :key="n" animated style="width: 100%">
                  <template #template>
                    <el-skeleton-item variant="image" style="width: 100%; height: 160px; border-radius: 6px" />
                  </template>
                </el-skeleton>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-else-if="validImageUrls.length">
          <el-descriptions :column="1" direction="horizontal" class="section">
            <el-descriptions-item label="Images">
              <div class="image-grid">
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
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-else>
          <el-descriptions :column="1" direction="horizontal" class="section">
            <el-descriptions-item label="Images">
              <div class="no-images"><el-text>No images available</el-text></div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />
        <!-- ================= Location Path ================= -->
        <LocationPath :label="'Location Path'" :path="locationPath" :loading="pathLoading" />

        <el-divider />
        <!-- ================= Sub Locations Tree ================= -->
        <el-descriptions :column="1" direction="vertical" class="section" style="margin-bottom: 8px">
          <el-descriptions-item label="Sub Locations">
            <div v-if="subLoading" style="margin-top: 6px">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="text" style="width: 40%; height: 18px; margin-bottom: 8px" />
                  <el-skeleton-item variant="text" style="width: 60%; height: 18px; margin-bottom: 8px" />
                </template>
              </el-skeleton>
            </div>

            <div v-else-if="subTree.length">
              <el-tree
                :data="subTree"
                node-key="id"
                :props="subTreeProps"
                :expand-on-click-node="false"
                :default-expand-all="true"
                :highlight-current="true"
                style="max-width: 800px"
              >
                <template #default="{ data }">
                  <div class="sub-node" :class="{ 'is-root': data.id === props.location?.id }">
                    <span class="sub-node-name">{{ data.name }}</span>
                  </div>
                </template>
              </el-tree>
            </div>

            <div v-else class="no-subs" style="margin-top: 6px">
              <el-text>No sub locations available</el-text>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Related Equipment (always shown) -->
        <el-divider />
        <el-descriptions :column="1" direction="horizontal" class="section" style="margin-bottom: 48px">
          <el-descriptions-item label="Related Equipment">
            <template v-if="equipmentSearch.trim().length">
              <SearchTable
                :key="`loc-equip-${location?.id}`"
                :data="equipmentList"
                :columns="[
                  { label: 'Equipment Name', prop: 'name' },
                  { label: 'Equipment Code', prop: 'code' },
                  { label: 'Equipment Group (T2)', prop: 'equipment_group' },
                ]"
                :total="equipmentTotal"
                :page="equipmentPage"
                :page-size="equipmentPageSize"
                :enable-search="true"
                v-model:search="equipmentSearch"
                empty-text="No match found"
                @update:page="onEquipmentPageChange"
              />
            </template>

            <template v-else-if="!equipmentList.length">
              <div style="margin-top: 6px">
                <el-text>No related equipment available</el-text>
              </div>
            </template>

            <template v-else>
              <SearchTable
                :key="`loc-equip-${location?.id}`"
                :data="equipmentList"
                :columns="[
                  { label: 'Equipment Name', prop: 'name' },
                  { label: 'Equipment Code', prop: 'code' },
                  { label: 'Equipment Group (T2)', prop: 'equipment_group' },
                ]"
                :total="equipmentTotal"
                :page="equipmentPage"
                :page-size="equipmentPageSize"
                :enable-search="true"
                v-model:search="equipmentSearch"
                empty-text="No match found"
                @update:page="onEquipmentPageChange"
              />
            </template>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Related Parts Batches -->
        <el-divider v-if="sparePartsBatchList?.length" />
        <div v-if="sparePartsBatchList?.length">
          <el-descriptions :column="1" direction="horizontal" class="section">
            <el-descriptions-item label="Related Parts Batches">
              <SearchTable
                :data="sparePartsBatchList"
                :columns="[
                  { label: 'Name', prop: 'name' },
                  { label: 'Part Code', prop: 'code' },
                  { label: 'Quantity', prop: 'quantity' },
                ]"
              />
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Dialog -->
  <el-dialog
    v-model="editLocation"
    title="Edit Location"
    width="600px"
    align-center
    append-to-body
    destroy-on-close
    class="ld-edit-dialog"
    modal-class="ld-edit-overlay"
    transition="ld-fade"
  >
    <LocationForm v-model="editForm" :location-types="props.locationTypes" ref="editFormRef" />

    <template #footer>
      <el-button @click="editLocation = false">Cancel</el-button>
      <el-button type="primary" :loading="saving" :disabled="saving" class="btn-save" @click="saveEdit">Save</el-button>
    </template>
  </el-dialog>

  <!-- Image Preview -->
  <el-dialog v-model="preview.open" :width="'80%'" :top="'5vh'" append-to-body destroy-on-close>
    <div class="preview-wrapper">
      <img :src="preview.url" alt="Preview" class="preview-image" />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { MoreFilled } from '@element-plus/icons-vue'
import SearchTable from '@/components/Common/SearchTable.vue'
import LocationForm from './LocationForm.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ElMessage } from 'element-plus'
import { updateLocationById, getLocationPathById, getLocationById } from '@/api/location'
import { getEquipmentNodePathById, getEquipmentNodes } from '@/api/equipment.js'
import { uploadMultipleToMinio, deleteObjectList } from '@/api/minio'
import LocationPath from '@/components/Common/LocationPath.vue'
import OsmMapFrame from '@/components/Common/OsmMapFrame.vue'

const props = defineProps( {
  location : Object,
  locationTypes : { type : Array, default : () => [] }
} )
const emit = defineEmits( ['deleted', 'updated', 'add-child'] )

/** ================= EDIT DIALOG STATE ================= **/
const editLocation = ref( false )
const editForm = ref( {} )
const editFormRef = ref( null )
const saving = ref( false )

/** ================= LOCATION PATH ================= **/
const locationPath = ref( [] )
const pathLoading = ref( false )
const rawPIC = computed(
  () =>
    props.location?.person_in_charge ??
    props.location?.personInCharge ??
    props.location?.person_in_charge_id ??
    props.location?.personInChargeId ??
    null
)

const personInCharge = computed( () => {
  const p = rawPIC.value
  if ( !p ) return null
  if ( typeof p === 'object' ) return p
  const id = Number( p )
  return Number.isFinite( id ) ? { id } : null
} )

const picName = computed( () => {
  const p = personInCharge.value
  if ( !p ) return ''
  const first = p.first_name ?? p.firstName ?? ''
  const last = p.last_name ?? p.lastName ?? ''
  const uname = p.username ?? ''
  const full = [first, last].filter( Boolean ).join( ' ' )
  return full || uname || ( p.id != null ? `#${p.id}` : '' )
} )

/** ================= MAP CENTER ================= **/
const DEFAULT_CENTER = { lat : 49.1666, lng : -123.1336 }

const hasCoords = computed( () => {
  const loc = props.location
  if ( !loc ) return false

  // 1) must not be null/undefined
  if ( loc.latitude == null || loc.longitude == null ) return false

  const lat = Number( loc.latitude )
  const lng = Number( loc.longitude )

  // 2) must be real numbers
  if ( !Number.isFinite( lat ) || !Number.isFinite( lng ) ) return false

  // 3) (optional) treat 0,0 as "not set" as well
  if ( lat === 0 && lng === 0 ) return false

  return true
} )

const mapCenter = computed( () => {
  const loc = props.location
  if ( !loc ) return DEFAULT_CENTER

  const lat = Number( loc.latitude )
  const lng = Number( loc.longitude )

  if ( Number.isFinite( lat ) && Number.isFinite( lng ) ) {
    return { lat, lng }
  }

  return DEFAULT_CENTER
} )

const fetchLocationPath = async id => {
  if ( id === undefined || id === null ) {
    locationPath.value = []
    return
  }
  pathLoading.value = true
  try {
    const res = await getLocationPathById( id )
    const payload = res?.data ?? res
    const data = Array.isArray( payload?.data ) ? payload.data : Array.isArray( payload ) ? payload : []
    locationPath.value = data ?? []
  } catch ( e ) {
    console.error( 'Failed to fetch location path:', e )
    locationPath.value = []
  } finally {
    pathLoading.value = false
  }
}

/** ================= SUB LOCATIONS TREE ================= **/
const subLoading = ref( false )
const subTree = ref( [] )
const subTreeProps = { label : 'name', children : 'children' }

const unwrap = res => {
  const p = res?.data ?? res
  return p?.data ?? p
}

const fetchSubLocationsTree = async id => {
  subLoading.value = true
  subTree.value = []
  try {
    const root = unwrap( await getLocationById( id ) )
    const childIds = Array.isArray( root?.active_children_locations_ids ) ? root.active_children_locations_ids : []

    if ( !childIds.length ) {
      subTree.value = []
      return
    }

    const results = await Promise.allSettled( childIds.map( cid => getLocationById( cid ) ) )
    const children = results
      .map( ( r, i ) => {
        if ( r.status !== 'fulfilled' ) return null
        const d = unwrap( r.value )
        return {
          id : d?.id,
          name : d?.name ?? `#${childIds[i]}`,
          code : d?.code ?? '',
          children : []
        }
      } )
      .filter( Boolean )

    subTree.value = [
      {
        id : root.id,
        name : root.name,
        code : root.code,
        children
      }
    ]
  } catch ( err ) {
    console.error( 'fetchSubLocationsTree failed:', err )
    subTree.value = []
  } finally {
    subLoading.value = false
  }
}

/** ================= IMAGES ================= **/
const imageUrls = computed( () => {
  const list = props.location?.image_list || []
  return list.map( x => ( typeof x === 'string' ? x : x?.url ) ).filter( Boolean )
} )
const validImageUrls = ref( [] )
const isImagesLoading = ref( false )
let imgReqSeq = 0

const checkImageUrls = async() => {
  const seq = ++imgReqSeq
  isImagesLoading.value = true
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
    if ( seq !== imgReqSeq ) return
    validImageUrls.value = checks.filter( Boolean )
  } finally {
    if ( seq === imgReqSeq ) isImagesLoading.value = false
  }
}

watch(
  imageUrls,
  () => {
    if ( imageUrls.value.length ) checkImageUrls()
    else {
      imgReqSeq++
      validImageUrls.value = []
      isImagesLoading.value = false
    }
  },
  { immediate : true }
)

const preview = ref( { open : false, url : '' } )
const openPreview = u => {
  preview.value.url = u
  preview.value.open = true
}

/** ================= RELATED EQUIPMENT ================= **/
const equipmentList = ref( [] )
const equipmentTotal = ref( 0 )
const equipmentPage = ref( 1 )
const equipmentPageSize = ref( 5 )
const equipmentSearch = ref( '' )
let equipDataReqSeq = 0

const getAuthHeaders = () => {
  const token =
    localStorage.getItem( 'access_token' ) ||
    localStorage.getItem( 'token' ) ||
    sessionStorage.getItem( 'access_token' ) ||
    ''
  return token ? { Authorization : `Bearer ${token}` } : {}
}

const pickT2Name = pathArr => {
  if ( !Array.isArray( pathArr ) || !pathArr.length ) return ''
  if ( pathArr.length >= 3 ) return ( pathArr[2]?.name || '' ).trim()
  if ( pathArr.length >= 2 ) return ( pathArr[pathArr.length - 2]?.name || '' ).trim()
  return ( pathArr[0]?.name || '' ).trim()
}

const nodePathCache = new Map()

const getT2FromNodePath = async nodeId => {
  const id = Number( nodeId )
  if ( !Number.isFinite( id ) ) return ''
  if ( nodePathCache.has( id ) ) return nodePathCache.get( id )

  try {
    const resp = await getEquipmentNodePathById( id )
    const payload = resp?.data ?? resp
    const path = Array.isArray( payload?.data ) ? payload.data : Array.isArray( payload ) ? payload : []
    const t2 = pickT2Name( path )
    nodePathCache.set( id, t2 )
    return t2
  } catch ( e ) {
    console.error( `[node-path] failed for nodeId=${id}`, e?.response?.status, e?.response?.data || e )
    nodePathCache.set( id, '' )
    return ''
  }
}

const enrichEquipmentWithGroup = async( rows, seqAtStart ) => {
  const enriched = await Promise.all(
    rows.map( async r => {
      const nodeId = Number( r?.id )
      const group = await getT2FromNodePath( nodeId )
      return { ...r, equipment_group : group || '--' }
    } )
  )
  if ( seqAtStart === equipDataReqSeq ) {
    equipmentList.value = enriched
  }
}

const fetchEquipmentData = async( id = props.location?.id ) => {
  const locId = Number( id )
  if ( !Number.isFinite( locId ) ) {
    equipmentList.value = []
    equipmentTotal.value = 0
    return
  }
  const seq = ++equipDataReqSeq
  try {
    const term = equipmentSearch.value?.trim()
    const body = { location_ids : [locId] }
    if ( term ) body.keyword = term

    const res = await getEquipmentNodes( equipmentPage.value, equipmentPageSize.value, 'createdAt', 'DESC', body )
    if ( seq !== equipDataReqSeq ) return

    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []

    const normalized = list.map( e => ( { ...e, id : Number( e.id ), equipment_group : '--' } ) )

    equipmentList.value = normalized
    equipmentTotal.value = Number( page?.totalElements ?? page?.total ?? list.length )

    await enrichEquipmentWithGroup( normalized, seq )
  } catch ( err ) {
    if ( seq !== equipDataReqSeq ) return
    console.error( 'fetchEquipmentData failed:', err )
    equipmentList.value = []
    equipmentTotal.value = 0
  }
}

const onEquipmentPageChange = p => {
  equipmentPage.value = p
  fetchEquipmentData()
}

/** ================= SPARE PARTS ================= **/
const sparePartsBatchList = ref( [] )
const fetchSparePartsBatch = async id => {
  try {
    const res = await axios.get( `http://10.10.12.12:8095/api/location/correlative-spare-part-batch/${id}`, {
      headers : getAuthHeaders()
    } )
    sparePartsBatchList.value = res.data?.data || []
  } catch ( err ) {
    console.error( 'Failed to fetch spare parts batch:', err )
    sparePartsBatchList.value = []
  }
}

const { showSuccess } = useErrorHandler()

/** ================= WATCHERS ================= **/
watch(
  () => props.location?.id,
  async id => {
    equipmentSearch.value = ''
    equipmentPage.value = 1
    equipmentList.value = []
    equipmentTotal.value = 0

    if ( id !== undefined && id !== null ) {
      fetchLocationPath( id )
      fetchEquipmentData( id )
      fetchSparePartsBatch( id )
      await fetchSubLocationsTree( id )
    } else {
      locationPath.value = []
      subTree.value = []
    }
  },
  { immediate : true }
)

watch( equipmentSearch, () => {
  equipmentPage.value = 1
  fetchEquipmentData()
} )

/** ================= EDIT HANDLERS ================= **/
const enterEditMode = () => {
  editForm.value = { ...JSON.parse( JSON.stringify( props.location ) ), id : props.location.id }
  editLocation.value = true
}

const saveEdit = async() => {
  const valid = await editFormRef.value?.validate?.()
  if ( !valid ) return

  let showed = false
  const showTimer = setTimeout( () => {
    saving.value = true
    showed = true
  }, 150 )

  const extractUploadedUrls = resp => {
    const list =
      resp?.uploadedFiles ?? resp?.data?.uploadedFiles ?? resp?.data?.data?.uploadedFiles ?? resp?.files ?? []
    return ( Array.isArray( list ) ? list : [] ).map( f => f?.url || f?.fileUrl || f?.location || f?.path ).filter( Boolean )
  }

  try {
    const id = Number( props.location?.id )
    if ( !Number.isFinite( id ) ) throw new Error( 'Invalid location id' )

    const originalUrls = ( props.location?.image_list ?? [] )
      .map( x => ( typeof x === 'string' ? x : x?.url ) )
      .filter( Boolean )
    const removed = Array.isArray( editForm.value?.removed_existing_images ) ? editForm.value.removed_existing_images : []
    const keptExisting = originalUrls.filter( u => !removed.includes( u ) )
    const newFiles = Array.isArray( editForm.value?.image_files )
      ? editForm.value.image_files.filter( f => f instanceof File )
      : []

    let uploadedUrls = []
    if ( newFiles.length ) {
      const uploadResp = await uploadMultipleToMinio( newFiles )
      uploadedUrls = extractUploadedUrls( uploadResp )
    }

    const finalImageList = Array.from( new Set( [...keptExisting, ...uploadedUrls] ) )
    const payload = { ...editForm.value, image_list : finalImageList }
    delete payload.removed_existing_images

    await updateLocationById( id, payload )

    if ( removed.length ) {
      Promise.resolve().then( async() => {
        try {
          await deleteObjectList( { bucketName : 'sv-file-bucket', objectUrls : removed } )
        } catch {}
      } )
    }

    showSuccess( 'Location updated' )
    editLocation.value = false
    emit( 'updated', { id } )
  } catch ( e ) {
    const s = e?.response?.status
    const m = ( e?.response?.data?.message || '' ).toLowerCase()
    if ( s === 409 || /code.*(exist|in use|already)/.test( m ) ) {
      ElMessage.error( 'Update failed: location code already exists.' )
    } else {
      ElMessage.error( 'Update failed' )
    }
    console.error( 'Update location failed:', e?.response?.data || e )
  } finally {
    clearTimeout( showTimer )
    if ( showed ) saving.value = false
  }
}
</script>

<style scoped lang="scss">
/* ================================
   Container
   ================================ */
.location-detail {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* The scrolling area starts below the header */
.detail-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 24px;
}

/* ================================
   Location Path
   ================================ */
.path-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.node-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  line-height: 1;
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.node-code {
  color: var(--el-text-color-secondary);
  font-weight: 400;
}
.sep {
  user-select: none;
  opacity: 0.6;
  margin: 0 2px;
}
.no-path {
  margin-top: 6px;
}

/* ================================
   Descriptions: two equal columns
   ================================ */
.two-col {
  :deep(.el-descriptions__table) {
    table-layout: fixed;
    width: 100%;
  }
  :deep(col) {
    width: 50% !important;
  }
  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content) {
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
}

/* ================================
   Image grid
   ================================ */
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

/* ================================
   Header (stable)
   ================================ */
.detail-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 12px;
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: none;
  box-shadow: 0 1px 0 var(--el-border-color-light);
  background: #fff;
  z-index: 1;

  .header-main {
    .detail-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

/* Only affects THIS dialog instance because we use the classes we set on the tag */
:deep(.ld-edit-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.ld-edit-dialog) {
  margin: 0 !important;
  transform: none !important;
  animation: ld-fade-in 0.22s ease;
}
:deep(.ld-fade-enter-active),
:deep(.ld-fade-leave-active) {
  transition: opacity 0.22s ease;
}
:deep(.ld-fade-enter-from),
:deep(.ld-fade-leave-to) {
  opacity: 0;
}

@keyframes ld-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.kebab-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
.kebab-icon {
  transform: rotate(90deg);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 24px;
  color: #409eff;
}

.section {
  :deep(.el-descriptions__label) {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.pic-line {
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
  flex-wrap: wrap;
}
.pic-sep {
  opacity: 0.6;
}
.map-block {
  margin-bottom: 20px;
}
</style>

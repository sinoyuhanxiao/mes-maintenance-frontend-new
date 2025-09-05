<template>
  <div class="location-detail" v-if="location">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-main">
        <h2 class="detail-title">{{ location.name }}</h2>
      </div>

      <div class="header-actions">
        <el-button-group class="ml-4">
          <el-tooltip content="Add Child Location" placement="top" effect="light" :hide-after="0">
            <el-button :icon="Plus" @click="emit('add-child', { id: location.id })" />
          </el-tooltip>

          <el-tooltip content="Edit" placement="top" effect="light" :hide-after="0">
            <el-button :icon="Edit" @click="enterEditMode" />
          </el-tooltip>

          <el-tooltip content="Delete" placement="top" effect="light" :hide-after="0">
            <el-button :icon="Delete" :loading="deleteLoading" @click="handleDelete" />
          </el-tooltip>
        </el-button-group>
      </div>
    </div>

    <div class="detail-body">
      <div class="descriptions-container">
        <el-descriptions class="two-col" :column="2" direction="vertical">
          <el-descriptions-item label="Name">{{ location.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ location.code || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Location Type">{{ location.location_type?.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Capacity">{{ location.capacity || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions v-if="location?.address?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Address">{{ location.address || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions v-if="location?.description?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Description">{{ location.description || '--' }}</el-descriptions-item>
        </el-descriptions>

        <!-- Images -->
        <el-divider v-if="validImageUrls.length" />
        <div v-if="validImageUrls.length">
          <el-descriptions title="Images" />
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
        </div>

        <!-- Related Equipment -->
        <div v-if="showEquipSection" style="margin-bottom: 48px">
          <el-divider />
          <el-descriptions title="Related Equipment" />
          <SearchTable
            :key="`loc-equip-${location?.id}`"
            :data="equipmentList"
            :columns="[
              { label: 'Name', prop: 'name' },
              { label: 'Code', prop: 'code' },
              { label: 'Group', prop: 'equipment_group' },
            ]"
            :total="equipmentTotal"
            :page="equipmentPage"
            :page-size="equipmentPageSize"
            :enable-search="true"
            v-model:search="equipmentSearch"
            empty-text="No match found"
            @update:page="onEquipmentPageChange"
          />
        </div>

        <el-divider v-if="sparePartsBatchList?.length" />
        <div v-if="sparePartsBatchList?.length">
          <el-descriptions title="Related Parts Batches" />
          <SearchTable
            :data="sparePartsBatchList"
            :columns="[
              { label: 'Name', prop: 'name' },
              { label: 'Part Code', prop: 'code' },
              { label: 'Quantity', prop: 'quantity' },
            ]"
          />
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
    <!-- Keep your existing form -->
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
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import SearchTable from '@/views/vendorsAndLocations/Locations/SearchTable.vue'
import LocationForm from './LocationForm.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ElMessage } from 'element-plus'
import { updateLocationById, deactivateLocation } from '@/api/location'
import { getEquipmentNodes } from '@/api/equipment.js'
import { uploadMultipleToMinio, deleteObjectList } from '@/api/minio'

const props = defineProps( {
  location : Object,
  locationTypes : { type : Array, default : () => [] }
} )
const emit = defineEmits( ['deleted', 'updated', 'add-child'] )

const editLocation = ref( false )
const editForm = ref( {} )
const editFormRef = ref( null )
const saving = ref( false )

const imageUrls = computed( () => {
  const list = props.location?.image_list || []
  return list.map( x => ( typeof x === 'string' ? x : x?.url ) ).filter( Boolean )
} )

const validImageUrls = ref( [] )

/** check each URL with a HEAD request (cheap, no download) */
const checkImageUrls = async() => {
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
  validImageUrls.value = checks.filter( Boolean )
}

// re-check whenever imageUrls changes
watch(
  imageUrls,
  () => {
    if ( imageUrls.value.length ) {
      checkImageUrls()
    } else {
      validImageUrls.value = []
    }
  },
  { immediate : true }
)

/** Simple preview dialog state */
const preview = ref( { open : false, url : '' } )
const openPreview = u => {
  preview.value.url = u
  preview.value.open = true
}

/** Equipment table state (server-side search/pagination) */
const equipmentList = ref( [] )
const equipmentTotal = ref( 0 )

const equipmentPage = ref( 1 )
const equipmentPageSize = ref( 5 )
const equipmentSearch = ref( '' )

// Sticky visibility: based on unfiltered/base total
const equipmentBaseTotal = ref( 0 )
const showEquipSection = ref( false )

// Request guards to avoid races
let equipBaseReqSeq = 0
let equipDataReqSeq = 0

/** Spare parts */
const sparePartsBatchList = ref( [] )

const { confirmAction, showSuccess } = useErrorHandler()

// ========== Watch location change ==========
watch(
  () => props.location?.id,
  id => {
    // reset state for new location
    equipmentSearch.value = ''
    equipmentPage.value = 1
    equipmentList.value = []
    equipmentTotal.value = 0
    equipmentBaseTotal.value = 0
    showEquipSection.value = false

    if ( id ) {
      fetchEquipmentBase( id )
      fetchEquipmentData( id )
      fetchSparePartsBatch( id )
    }
  },
  { immediate : true }
)

// ========== Search watcher (debounced) ==========
let searchTimer = null
watch( equipmentSearch, val => {
  equipmentPage.value = 1
  clearTimeout( searchTimer )

  if ( !val?.trim() ) {
    fetchEquipmentBase()
    fetchEquipmentData()
  } else {
    searchTimer = setTimeout( () => fetchEquipmentData(), 250 )
  }
} )

const onEquipmentPageChange = p => {
  equipmentPage.value = p
  fetchEquipmentData()
}

// ========== Base fetch (no keyword) sets sticky visibility ==========
const fetchEquipmentBase = async( id = props.location?.id ) => {
  const locId = Number( id )
  if ( !Number.isFinite( locId ) ) {
    equipmentBaseTotal.value = 0
    showEquipSection.value = false
    return
  }

  const seq = ++equipBaseReqSeq
  try {
    const res = await getEquipmentNodes(
      1, // page
      1, // we only need totals
      'createdAt',
      'DESC',
      { location_ids : [locId] } // NO keyword
    )
    if ( seq !== equipBaseReqSeq ) return

    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const total = Number( page?.totalElements ?? page?.total ?? ( Array.isArray( page?.content ) ? page.content.length : 0 ) )

    equipmentBaseTotal.value = total
    showEquipSection.value = total > 0
  } catch ( err ) {
    if ( seq !== equipBaseReqSeq ) return
    console.error( 'fetchEquipmentBase failed:', err )
    equipmentBaseTotal.value = 0
    showEquipSection.value = false
  }
}

// ========== Data fetch (with keyword/paging) fills the table ==========
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

    equipmentList.value = list.map( e => ( { ...e, id : Number( e.id ) } ) )
    equipmentTotal.value = Number( page?.totalElements ?? page?.total ?? list.length )
  } catch ( err ) {
    if ( seq !== equipDataReqSeq ) return
    console.error( 'fetchEquipmentData failed:', err )
    equipmentList.value = []
    equipmentTotal.value = 0
  }
}

// ========== Spare parts ==========
const fetchSparePartsBatch = async id => {
  try {
    const res = await axios.get( `http://10.10.12.12:8095/api/location/correlative-spare-part-batch/${id}` )
    sparePartsBatchList.value = res.data?.data || []
  } catch ( err ) {
    console.error( 'Failed to fetch spare parts batch:', err )
    sparePartsBatchList.value = []
  }
}

// ========== Edit / Save ==========
const enterEditMode = () => {
  editForm.value = {
    ...JSON.parse( JSON.stringify( props.location ) ),
    id : props.location.id
  }
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

  // helper: normalize uploaded URLs from various possible shapes
  const extractUploadedUrls = resp => {
    // Common shapes to support:
    // { uploadedFiles: [{url}] }
    // { data: { uploadedFiles: [{url}] } }
    // { data: { uploadedFiles: [{fileUrl|path|location}] } }
    // { uploadedFiles: [{fileUrl|path|location}] }
    const list =
      resp?.uploadedFiles ??
      resp?.data?.uploadedFiles ??
      resp?.data?.data?.uploadedFiles ??
      resp?.files ?? // just in case
      []

    return ( Array.isArray( list ) ? list : [] ).map( f => f?.url || f?.fileUrl || f?.location || f?.path ).filter( Boolean )
  }

  try {
    const id = Number( props.location?.id )
    if ( !Number.isFinite( id ) ) throw new Error( 'Invalid location id' )

    // 1) original URLs from current location
    const originalUrls = ( props.location?.image_list ?? [] )
      .map( x => ( typeof x === 'string' ? x : x?.url ) )
      .filter( Boolean )

    // 2) removed URLs from child form
    const removed = Array.isArray( editForm.value?.removed_existing_images ) ? editForm.value.removed_existing_images : []

    // 3) keep existing minus removed
    const keptExisting = originalUrls.filter( u => !removed.includes( u ) )

    const newFiles = Array.isArray( editForm.value?.image_files )
      ? editForm.value.image_files.filter( f => f instanceof File )
      : []

    // 5) upload new files (if any)
    let uploadedUrls = []
    if ( newFiles.length ) {
      const uploadResp = await uploadMultipleToMinio( newFiles )
      // console.log('uploadMultipleToMinio response:', uploadResp) // <- uncomment to inspect
      uploadedUrls = extractUploadedUrls( uploadResp )
    }

    // 6) final list = kept existing + newly uploaded (dedup)
    const finalImageList = Array.from( new Set( [...keptExisting, ...uploadedUrls] ) )

    // 7) build payload; do not leak the helper field
    const payload = {
      ...editForm.value,
      image_list : finalImageList
    }
    delete payload.removed_existing_images

    // 8) update record
    await updateLocationById( id, payload )

    // 9) best-effort delete removed objects after save
    if ( removed.length ) {
      Promise.resolve().then( async() => {
        try {
          await deleteObjectList( {
            bucketName : 'sv-file-bucket',
            objectUrls : removed
          } )
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
      ElMessage.error( 'Update failed: location code already exists. Please use a different code.' )
    } else {
      ElMessage.error( 'Update failed' )
    }
    console.error( 'Update location failed:', e?.response?.data || e )
  } finally {
    clearTimeout( showTimer )
    if ( showed ) saving.value = false
  }
}

// ========== Delete ==========
const deleteLoading = ref( false )
const handleDelete = async() => {
  const confirmed = await confirmAction( {
    title : 'Confirm',
    message : `Are you sure you want to delete "${props.location?.name}"?`,
    confirmButtonText : 'Delete',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
  if ( !confirmed ) return

  const id = Number( props.location?.id )
  if ( !Number.isFinite( id ) ) return

  deleteLoading.value = true
  try {
    await deactivateLocation( id )
    showSuccess( 'Location deleted successfully' )
    emit( 'deleted', props.location.id )
  } catch ( err ) {
    ElMessage.error( 'Failed to delete location' )
    console.error( err )
  } finally {
    deleteLoading.value = false
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
  overflow: hidden; /* keep if you want; dialog is teleported so no clipping */
}

/* The scrolling area starts below the header */
.detail-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 24px;
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
    .header-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      .location-id {
        color: var(--el-color-primary);
        font-weight: 500;
      }
      .location-code {
        font-weight: 500;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

/* ================================
   Body container
   ================================ */
.descriptions-container {
  max-width: 1200px;
  width: 100%;
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
/* Only affects THIS dialog instance because we use the classes we set on the tag */
:deep(.ld-edit-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ld-edit-dialog) {
  margin: 0 !important; /* remove default top offset */
  transform: none !important; /* kill slide-from-corner */
  animation: ld-fade-in 0.22s ease;
}

/* Match the custom transition="ld-fade" set on the dialog */
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
</style>

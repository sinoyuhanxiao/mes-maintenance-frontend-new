<!-- VendorDetail -->
<template>
  <div class="vendor-detail" v-if="vendor">
    <!-- Detail Header -->
    <div class="detail-header">
      <div class="header-main">
        <h2 class="detail-title">{{ vendor.name }}</h2>
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
              <el-dropdown-item @click="handleDelete" :disabled="deleteLoading">Delete</el-dropdown-item>
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
          <el-descriptions-item label="Name">{{ vendor.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ vendor.code || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Phone Number">{{ vendor.phone_number || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ vendor.email || '--' }}</el-descriptions-item>
        </el-descriptions>

        <!-- Website -->
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Website">
            {{ vendor?.website?.length ? vendor.website : 'No website available' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Address -->
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Address">
            {{ vendor?.address?.length ? vendor.address : 'No address available' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Description -->
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Description">
            {{ vendor?.description?.length ? vendor.description : 'No description available' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Images -->
        <el-divider />
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
              <div class="no-images">
                <el-text>No images available</el-text>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Files -->
        <el-divider />
        <el-descriptions :column="1" direction="horizontal" class="section">
          <el-descriptions-item label="Files">
            <FileDisplay
              :files="parsedFiles"
              empty-text="No files available"
              :native-preview="true"
              :native-download="true"
              @download-error="onDownloadError"
            />
          </el-descriptions-item>
        </el-descriptions>

        <!-- Related Equipment -->
        <el-divider />
        <el-descriptions :column="1" direction="horizontal" class="section">
          <el-descriptions-item label="Related Equipment">
            <div class="no-data-line" v-if="equipBaseChecked && equipmentBaseTotal === 0">
              <el-text>No related equipment available</el-text>
            </div>

            <div v-else-if="equipmentBaseTotal > 0">
              <SearchTable
                :key="`equip-${vendor?.id}`"
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
            </div>

            <el-skeleton v-else :rows="1" animated />
          </el-descriptions-item>
        </el-descriptions>

        <!-- Related Parts Batches -->
        <el-divider />
        <el-descriptions :column="1" direction="horizontal" class="section">
          <el-descriptions-item label="Related Parts Batches">
            <div class="no-data-line" v-if="sparePartsBaseChecked && sparePartsBaseTotal === 0">
              <el-text>No related parts batches available</el-text>
            </div>

            <div v-else-if="sparePartsBaseTotal > 0">
              <SearchTable
                :key="`sp-${vendor?.id}`"
                :data="sparePartsBatchList"
                :columns="[
                  { label: 'Spare Parts Name', prop: 'name' },
                  { label: 'Spare Parts Code', prop: 'code' },
                  { label: 'Current Stock', prop: 'current_stock' },
                ]"
                :total="sparePartsTotal"
                :page="sparePartsPage"
                :page-size="sparePartsPageSize"
                :enable-search="true"
                v-model:search="sparePartsSearch"
                empty-text="No match found"
                @update:page="onSparePartsPageChange"
              />
            </div>

            <el-skeleton v-else :rows="1" animated />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>

  <!-- Edit Dialog -->
  <el-dialog
    v-model="editVendor"
    title="Edit Vendor"
    width="600px"
    align-center
    append-to-body
    destroy-on-close
    class="vd-edit-dialog"
    modal-class="vd-edit-overlay"
    transition="vd-fade"
  >
    <VendorForm v-model="editForm" ref="editFormRef" :key="`vendor-form-${vendor?.id}-${editVendor}`" />
    <template #footer>
      <el-button @click="editVendor = false">Cancel</el-button>
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
import SearchTable from '@/views/vendorsAndLocations/Locations/SearchTable.vue'
import VendorForm from './VendorForm.vue'
import FileDisplay from '@/components/Common/FileDisplay.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ElMessage } from 'element-plus'
import { deactivateVendor, updateVendor, getVendorById } from '@/api/vendor.js'
import { searchSpareParts } from '@/api/resources.js'
import { getEquipmentNodes } from '@/api/equipment.js'
import { uploadMultipleToMinio, deleteObjectList } from '@/api/minio'
import { MoreFilled } from '@element-plus/icons-vue'

const props = defineProps( { vendor : Object } )
const emit = defineEmits( ['deleted', 'updated'] )

const editVendor = ref( false )
const editForm = ref( {} )
const editFormRef = ref( null )
const saving = ref( false )

/* -------------------- Equipment state -------------------- */
const equipmentList = ref( [] )
const equipmentTotal = ref( 0 )
const equipmentPage = ref( 1 )
const equipmentPageSize = ref( 5 )
const equipmentSearch = ref( '' )

// Sticky visibility based on unfiltered total
const equipmentBaseTotal = ref( 0 )
const showEquipSection = ref( false )
const equipBaseChecked = ref( false )

// request sequence guards
let equipBaseReqSeq = 0
let equipDataReqSeq = 0

/* -------------------- Spare parts state -------------------- */
const sparePartsBatchList = ref( [] )
const sparePartsTotal = ref( 0 )
const sparePartsPage = ref( 1 )
const sparePartsPageSize = ref( 5 )
const sparePartsSearch = ref( '' )

// Sticky visibility based on unfiltered total
const sparePartsBaseTotal = ref( 0 )
const showSparePartsSection = ref( false )
const sparePartsBaseChecked = ref( false )

// request sequence guards
let sparePartsBaseReqSeq = 0
let sparePartsDataReqSeq = 0

const { confirmAction, showSuccess } = useErrorHandler()

/* -------------------- Files helpers -------------------- */
function fileNameFromUrl( u ) {
  try {
    const raw = new URL( String( u ) ).pathname.split( '/' ).pop() || ''
    return decodeURIComponent( raw ) || raw || 'file'
  } catch {
    const raw = String( u ).split( '/' ).pop() || ''
    try {
      return decodeURIComponent( raw ) || raw || 'file'
    } catch {
      return raw || 'file'
    }
  }
}
function getFileTypeFromName( fileName ) {
  if ( !fileName ) return 'document'
  const ext = String( fileName ).split( '.' ).pop()?.toLowerCase()
  const image = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const video = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
  const audio = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']
  const archive = ['zip', 'rar', '7z', 'tar', 'gz']
  if ( image.includes( ext ) ) return 'image'
  if ( video.includes( ext ) ) return 'video'
  if ( audio.includes( ext ) ) return 'audio'
  if ( archive.includes( ext ) ) return 'download'
  if ( ext === 'pdf' ) return 'pdf'
  if ( ['doc', 'docx', 'txt', 'rtf', 'md', 'ppt', 'pptx', 'xls', 'xlsx', 'csv'].includes( ext ) ) return 'document'
  return 'document'
}
const parsedFiles = computed( () => {
  const raw = props.vendor?.files_list ?? props.vendor?.file_list ?? []
  const urls = ( Array.isArray( raw ) ? raw : [] ).map( x => ( typeof x === 'string' ? x : x?.url ) ).filter( Boolean )
  return urls.map( ( url, idx ) => ( {
    id : idx,
    url,
    name : fileNameFromUrl( url ),
    type : getFileTypeFromName( fileNameFromUrl( url ) )
  } ) )
} )
function onDownloadError( err ) {
  console.error( err )
  ElMessage.error( 'Download failed' )
}

/* -------------------- Images (same as LocationDetail) -------------------- */
const imageUrls = computed( () => {
  const list = props.vendor?.image_list || []
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

/* -------------------- Auth header for node-path -------------------- */
const getAuthHeaders = () => {
  const token =
    localStorage.getItem( 'access_token' ) ||
    localStorage.getItem( 'token' ) ||
    sessionStorage.getItem( 'access_token' ) ||
    ''
  return token ? { Authorization : `Bearer ${token}` } : {}
}

/* -------------------- T2 resolution via node-path -------------------- */
const nodePathCache = new Map() // nodeId -> T2 name

const pickT2Name = pathArr => {
  if ( !Array.isArray( pathArr ) || !pathArr.length ) return ''
  // canonical positions: [T0, T1, T2, ...]
  if ( pathArr.length >= 3 ) return ( pathArr[2]?.name || '' ).trim()
  if ( pathArr.length >= 2 ) return ( pathArr[pathArr.length - 2]?.name || '' ).trim()
  return ( pathArr[0]?.name || '' ).trim()
}

const getT2FromNodePath = async nodeId => {
  const id = Number( nodeId )
  if ( !Number.isFinite( id ) ) return ''
  if ( nodePathCache.has( id ) ) return nodePathCache.get( id )
  try {
    const resp = await axios.get( `http://10.10.12.12:8095/api/equipment/node-path/${id}`, {
      headers : getAuthHeaders()
    } )
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
      // IMPORTANT: use the equipment NODE id for node-path lookup
      const nodeId = Number( r?.id )
      const group = await getT2FromNodePath( nodeId )
      return { ...r, equipment_group : group || '--' }
    } )
  )
  if ( seqAtStart === equipDataReqSeq ) {
    equipmentList.value = enriched
  }
}

/* -------------------- Vendor-related equipment -------------------- */
const fetchEquipmentBase = async( id = props.vendor?.id ) => {
  const vendorId = Number( id )
  if ( !Number.isFinite( vendorId ) ) {
    equipmentBaseTotal.value = 0
    showEquipSection.value = false
    equipBaseChecked.value = true
    return
  }
  const seq = ++equipBaseReqSeq
  try {
    const res = await getEquipmentNodes( 1, 1, 'createdAt', 'DESC', { vendor_ids : [vendorId] } )
    if ( seq !== equipBaseReqSeq ) return
    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const total = Number( page?.totalElements ?? page?.total ?? ( Array.isArray( page?.content ) ? page.content.length : 0 ) )
    equipmentBaseTotal.value = total
    showEquipSection.value = total > 0
  } catch ( e ) {
    if ( seq !== equipBaseReqSeq ) return
    console.error( 'fetchEquipmentBase failed:', e )
    equipmentBaseTotal.value = 0
    showEquipSection.value = false
  } finally {
    if ( seq === equipBaseReqSeq ) equipBaseChecked.value = true
  }
}

const fetchEquipmentData = async( id = props.vendor?.id ) => {
  const vendorId = Number( id )
  if ( !Number.isFinite( vendorId ) ) {
    equipmentList.value = []
    equipmentTotal.value = 0
    return
  }
  const seq = ++equipDataReqSeq
  try {
    const term = equipmentSearch.value?.trim()
    const body = { vendor_ids : [vendorId] }
    if ( term ) body.keyword = term

    const res = await getEquipmentNodes( equipmentPage.value, equipmentPageSize.value, 'createdAt', 'DESC', body )
    if ( seq !== equipDataReqSeq ) return

    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []

    // placeholder to avoid UI jitter; ensure id is numeric
    const normalized = list.map( e => ( { ...e, id : Number( e.id ), equipment_group : '--' } ) )
    equipmentList.value = normalized
    equipmentTotal.value = Number( page?.totalElements ?? page?.total ?? list.length )

    // async enrich with T2 (guarded by seq)
    await enrichEquipmentWithGroup( normalized, seq )
  } catch ( e ) {
    if ( seq !== equipDataReqSeq ) return
    console.error( 'fetchEquipmentData failed:', e )
    equipmentList.value = []
    equipmentTotal.value = 0
  }
}

/* -------------------- Spare parts (base + data) -------------------- */
const fetchSparePartsBase = async( id = props.vendor?.id ) => {
  const vendorId = Number( id )
  if ( !Number.isFinite( vendorId ) ) {
    sparePartsBaseTotal.value = 0
    showSparePartsSection.value = false
    sparePartsBaseChecked.value = true
    return
  }
  const seq = ++sparePartsBaseReqSeq
  try {
    const res = await searchSpareParts( 1, 1, 'name', 'ASC', { vendor_ids : [vendorId] } )
    if ( seq !== sparePartsBaseReqSeq ) return
    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const total = Number( page?.totalElements ?? page?.total ?? ( Array.isArray( page?.content ) ? page.content.length : 0 ) )
    sparePartsBaseTotal.value = total
    showSparePartsSection.value = total > 0
  } catch ( e ) {
    if ( seq !== sparePartsBaseReqSeq ) return
    console.error( 'fetchSparePartsBase failed:', e )
    sparePartsBaseTotal.value = 0
    showSparePartsSection.value = false
  } finally {
    if ( seq === sparePartsBaseReqSeq ) sparePartsBaseChecked.value = true
  }
}

const fetchSparePartsData = async( id = props.vendor?.id ) => {
  const vendorId = Number( id )
  if ( !Number.isFinite( vendorId ) ) {
    sparePartsBatchList.value = []
    sparePartsTotal.value = 0
    return
  }
  const seq = ++sparePartsDataReqSeq
  try {
    const term = sparePartsSearch.value?.trim()
    const body = { vendor_ids : [vendorId] }
    if ( term ) body.keyword = term

    const res = await searchSpareParts( sparePartsPage.value, sparePartsPageSize.value, 'name', 'ASC', body )
    if ( seq !== sparePartsDataReqSeq ) return

    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []

    sparePartsBatchList.value = list.map( p => ( { ...p, id : Number( p.id ) } ) )
    sparePartsTotal.value = Number( page?.totalElements ?? page?.total ?? list.length )
  } catch ( e ) {
    if ( seq !== sparePartsDataReqSeq ) return
    console.error( 'fetchSparePartsData failed:', e )
    sparePartsBatchList.value = []
    sparePartsTotal.value = 0
  }
}

/* -------------------- Reactivity: vendor changes & searches -------------------- */
watch(
  () => props.vendor?.id,
  id => {
    // reset equipment
    equipmentSearch.value = ''
    equipmentPage.value = 1
    equipmentList.value = []
    equipmentTotal.value = 0
    equipmentBaseTotal.value = 0
    showEquipSection.value = false
    equipBaseChecked.value = false

    // reset spare parts
    sparePartsSearch.value = ''
    sparePartsPage.value = 1
    sparePartsBatchList.value = []
    sparePartsTotal.value = 0
    sparePartsBaseTotal.value = 0
    showSparePartsSection.value = false
    sparePartsBaseChecked.value = false

    if ( id ) {
      fetchEquipmentBase( id )
      fetchEquipmentData( id )
      fetchSparePartsBase( id )
      fetchSparePartsData( id )
    } else {
      equipBaseChecked.value = true
      sparePartsBaseChecked.value = true
    }
  },
  { immediate : true }
)

let equipSearchTimer = null
watch( equipmentSearch, val => {
  equipmentPage.value = 1
  clearTimeout( equipSearchTimer )
  if ( !val?.trim() ) {
    fetchEquipmentBase()
    fetchEquipmentData()
  } else {
    equipSearchTimer = setTimeout( () => fetchEquipmentData(), 250 )
  }
} )
const onEquipmentPageChange = p => {
  equipmentPage.value = p
  fetchEquipmentData()
}

let spareSearchTimer = null
watch( sparePartsSearch, val => {
  sparePartsPage.value = 1
  clearTimeout( spareSearchTimer )
  if ( !val?.trim() ) {
    fetchSparePartsBase()
    fetchSparePartsData()
  } else {
    spareSearchTimer = setTimeout( () => fetchSparePartsData(), 250 )
  }
} )
const onSparePartsPageChange = p => {
  sparePartsPage.value = p
  fetchSparePartsData()
}

/* -------------------- Edit / Save / Delete -------------------- */
const enterEditMode = () => {
  const imageUrls = ( props.vendor?.image_list ?? [] ).map( x => ( typeof x === 'string' ? x : x?.url ) ).filter( Boolean )
  const fileUrls = ( props.vendor?.files_list ?? props.vendor?.file_list ?? [] )
    .map( x => ( typeof x === 'string' ? x : x?.url ) )
    .filter( Boolean )

  editForm.value = {
    ...JSON.parse( JSON.stringify( props.vendor || {} ) ),
    id : props.vendor?.id,
    image_list : imageUrls,
    image_files : [],
    removed_existing_images : [],
    file_list : fileUrls,
    file_files : [],
    removed_existing_files : []
  }
  editVendor.value = true
}

const saveEdit = async() => {
  if ( !( await editFormRef.value?.validate?.() ) ) return

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
    const id = Number( props.vendor?.id )
    if ( !Number.isFinite( id ) ) throw new Error( 'Invalid vendor id' )

    // images
    const originalImageUrls = ( props.vendor?.image_list ?? [] )
      .map( x => ( typeof x === 'string' ? x : x?.url ) )
      .filter( Boolean )
    const removedImages = Array.isArray( editForm.value?.removed_existing_images )
      ? editForm.value.removed_existing_images
      : []
    const keptExistingImages = originalImageUrls.filter( u => !removedImages.includes( u ) )
    const newImageFiles = Array.isArray( editForm.value?.image_files )
      ? editForm.value.image_files.filter( f => f instanceof File )
      : []
    let uploadedImageUrls = []
    if ( newImageFiles.length ) {
      uploadedImageUrls = extractUploadedUrls( await uploadMultipleToMinio( newImageFiles ) )
    }
    const finalImageList = Array.from( new Set( [...keptExistingImages, ...uploadedImageUrls] ) )

    // files
    const originalFileUrls = ( props.vendor?.files_list ?? props.vendor?.file_list ?? [] )
      .map( x => ( typeof x === 'string' ? x : x?.url ) )
      .filter( Boolean )
    const removedFiles = Array.isArray( editForm.value?.removed_existing_files )
      ? editForm.value.removed_existing_files
      : []
    const keptExistingFiles = originalFileUrls.filter( u => !removedFiles.includes( u ) )
    const newFiles = Array.isArray( editForm.value?.file_files )
      ? editForm.value.file_files.filter( f => f instanceof File )
      : []
    let uploadedFileUrls = []
    if ( newFiles.length ) {
      uploadedFileUrls = extractUploadedUrls( await uploadMultipleToMinio( newFiles ) )
    }
    const finalFileList = Array.from( new Set( [...keptExistingFiles, ...uploadedFileUrls] ) )

    const payload = {
      ...editForm.value,
      image_list : finalImageList,
      file_list : finalFileList
    }
    delete payload.image_files
    delete payload.removed_existing_images
    delete payload.file_files
    delete payload.removed_existing_files

    await updateVendor( id, payload )

    // best-effort deletes
    if ( removedImages.length ) {
      try {
        await deleteObjectList( { bucketName : 'sv-file-bucket', objectUrls : removedImages } )
      } catch {}
    }
    if ( removedFiles.length ) {
      try {
        await deleteObjectList( { bucketName : 'sv-file-bucket', objectUrls : removedFiles } )
      } catch {}
    }

    const res = await getVendorById( id )
    const refreshed = res?.data?.data ?? res?.data ?? res
    ElMessage.success( 'Vendor updated' )
    editVendor.value = false
    emit( 'updated', refreshed )
  } catch ( e ) {
    const s = e?.response?.status
    const msg = String( e?.response?.data?.message || e?.response?.data?.error || e?.message || '' )
    if ( s === 409 || /(duplicate|conflict)/i.test( msg ) || /code.*(already|in use)/i.test( msg ) ) {
      ElMessage.error( 'Update failed: vendor code already exists. Please use a different code.' )
    } else if ( /Cannot deserialize value of type `java\.lang\.String`/i.test( msg ) ) {
      ElMessage.error( 'Update failed: server expected file/image URLs, not objects. Check payload shaping.' )
    } else {
      ElMessage.error( 'Failed to update vendor' )
    }
    console.error( 'Update vendor failed:', e?.response?.data || e )
  } finally {
    clearTimeout( showTimer ) // <-- use the timer
    if ( showed ) saving.value = false // <-- only toggle off if we showed the spinner
  }
}

const deleteLoading = ref( false )
const handleDelete = async() => {
  const confirmed = await confirmAction( {
    title : 'Confirm',
    message : `Are you sure you want to delete "${props.vendor?.name}"?`,
    confirmButtonText : 'Delete',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
  if ( !confirmed ) return

  const id = Number( props.vendor?.id )
  if ( !Number.isFinite( id ) ) return

  deleteLoading.value = true
  try {
    await deactivateVendor( id )
    showSuccess( 'Vendor deleted successfully' )
    emit( 'deleted', id )
  } catch ( err ) {
    ElMessage.error( err?.response?.data?.message || 'Failed to delete vendor' )
    console.error( err )
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.vendor-detail {
  display: flex;
  flex-direction: column;
  padding: 24px;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

/* Header */
.detail-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding-bottom: 16px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: #fff;
  z-index: 1;

  .header-main {
    flex: 1;

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

      .vendor-id {
        color: var(--el-color-primary);
        font-weight: 500;
      }
      .vendor-code {
        font-weight: 500;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.detail-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: 24px;
}

.descriptions-container {
  position: relative;
  z-index: 0;
  max-width: 1200px;
  width: 100%;
  margin-left: 0;
}

/* Two equal columns */
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

/* Preview dialog */
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

/* Dialog transition and centering (mirror LocationDetail) */
:deep(.vd-edit-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.vd-edit-dialog) {
  margin: 0 !important;
  transform: none !important;
  animation: vd-fade-in 0.22s ease;
}
:deep(.vd-fade-enter-active),
:deep(.vd-fade-leave-active) {
  transition: opacity 0.22s ease;
}
:deep(.vd-fade-enter-from),
:deep(.vd-fade-leave-to) {
  opacity: 0;
}

@keyframes vd-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Old file list CSS can be removed, but harmless if left */
.vd-file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.vd-file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background-color: #fafafa;
  transition: background-color 0.2s;
}
.vd-file-item:hover {
  background-color: #f0f9ff;
}
.vd-file-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  white-space: normal;
  word-break: break-all;
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
:deep(.el-descriptions__label) {
  font-weight: 600;
  text-transform: none;
  color: var(--el-text-color-primary);
}
.no-data-line {
  margin-top: 6px;
  display: block;
}
</style>

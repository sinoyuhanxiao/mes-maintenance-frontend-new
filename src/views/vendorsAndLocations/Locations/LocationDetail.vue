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

        <el-divider v-if="location?.image_list?.length" />
        <div v-if="location?.image_list?.length">
          <el-descriptions title="Images" />
          <Images :images="location.image_list" />
        </div>

        <!-- Related Equipment (sticky visibility based on unfiltered total) -->
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
  <el-dialog v-model="editLocation" title="Edit Location" width="600px">
    <LocationForm v-model="editForm" :location-types="props.locationTypes" ref="editFormRef" />
    <template #footer>
      <el-button @click="editLocation = false">Cancel</el-button>
      <el-button type="primary" :loading="saving" :disabled="saving" class="btn-save" @click="saveEdit">Save</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import SearchTable from '@/views/vendorsAndLocations/Locations/SearchTable.vue'
import Images from './Images.vue'
import LocationForm from './LocationForm.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ElMessage } from 'element-plus'
import { updateLocationById, deactivateLocation } from '@/api/location'
import { getEquipmentNodes } from '@/api/equipment.js'

const props = defineProps( {
  location : Object,
  locationTypes : { type : Array, default : () => [] }
} )
const emit = defineEmits( ['deleted', 'updated', 'add-child'] )

const editLocation = ref( false )
const editForm = ref( {} )
const editFormRef = ref( null )
const saving = ref( false )

/** Equipment table state (server-side search/pagination) */
const equipmentList = ref( [] )
const equipmentTotal = ref( 0 ) // total for current query (can be 0 when searching)
const equipmentPage = ref( 1 )
const equipmentPageSize = ref( 5 )
const equipmentSearch = ref( '' )

// Sticky visibility: based on unfiltered/base total
const equipmentBaseTotal = ref( 0 ) // total with NO search
const showEquipSection = ref( false ) // v-if flag (only set by base fetch)

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
      // Base first (sets visibility), then table data
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
    // Cleared → refresh base & data (no keyword)
    fetchEquipmentBase()
    fetchEquipmentData()
  } else {
    // Typing → only data, debounced
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
      1, // tiny page; we only need totals
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
    // Do NOT touch equipmentBaseTotal/showEquipSection here
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

  try {
    const id = Number( props.location?.id )
    if ( !Number.isFinite( id ) ) throw new Error( 'Invalid location id' )

    await updateLocationById( id, editForm.value )
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
</style>

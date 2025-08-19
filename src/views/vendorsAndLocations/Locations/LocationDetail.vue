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
            <el-button :icon="Plus" @click="emit('add-child', { id: location.id })"> </el-button>
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
        <el-divider v-if="equipmentList?.length" />
        <div v-if="equipmentList?.length" style="margin-bottom: 48px">
          <el-descriptions title="Related Equipment" />
          <SearchTable
            :data="equipmentList"
            :columns="[
              { label: 'Name', prop: 'name' },
              { label: 'Code', prop: 'code' },
              { label: 'Group', prop: 'equipment_group' },
            ]"
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
      <el-button type="primary" :loading="saving" :disabled="saving" class="btn-save" @click="saveEdit">
        Save
      </el-button>
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

const equipmentList = ref( [] )
const sparePartsBatchList = ref( [] )

const { confirmAction, showSuccess } = useErrorHandler()

watch(
  () => props.location?.id,
  id => {
    if ( id ) {
      fetchEquipment( id )
      fetchSparePartsBatch( id )
    }
  },
  { immediate : true }
)

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

    await updateLocationById( id, editForm.value ) // ✅ no hardcoded host
    showSuccess( 'Location updated' )
    editLocation.value = false
    emit( 'updated', { id } )
  } catch ( e ) {
    const s = e?.response?.status
    const m = ( e?.response?.data?.message || '' ).toLowerCase()
    if ( s === 409 || /code.*(exist|in use|already)/.test( m ) ) {
      ElMessage.error( 'Update failed: location code already exists. Please use a different code.' )
      // optional:
      // editFormRef.value?.validateField?.('code', () => {})
      // editFormRef.value?.scrollToField?.('code')
    } else {
      ElMessage.error( 'Update failed' )
    }
    console.error( 'Update location failed:', e?.response?.data || e )
  } finally {
    clearTimeout( showTimer )
    if ( showed ) saving.value = false
  }
}

const fetchEquipment = async id => {
  const locId = Number( id )
  if ( !Number.isFinite( locId ) ) {
    equipmentList.value = []
    return
  }

  try {
    // matches your new API: POST /equipment/node-search with body { location_ids: [id] }
    const res = await getEquipmentNodes(
      1, // page
      10, // size
      'createdAt', // sortField
      'DESC', // direction
      { location_ids : [locId] } // search body
    )

    // unwrap response shape safely
    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []

    // (optional) normalize id
    equipmentList.value = list.map( e => ( { ...e, id : Number( e.id ) } ) )
  } catch ( err ) {
    console.error( 'Failed to fetch equipment:', err )
    equipmentList.value = []
  }
}

// related spare parts api backend not done yet, temporary hardcode old api here
const fetchSparePartsBatch = async id => {
  try {
    const res = await axios.get( `http://10.10.12.12:8095/api/location/correlative-spare-part-batch/${id}` )
    sparePartsBatchList.value = res.data?.data || []
  } catch ( err ) {
    console.error( 'Failed to fetch spare parts batch:', err )
    sparePartsBatchList.value = []
  }
}

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
   Container: header fixed in panel, body scrolls
   ================================ */
.location-detail {
  position: relative;
  background: #fff; /* solid base to avoid any translucency issues */
  border-radius: 8px;
  padding: 24px;
  height: 100%;

  display: flex;
  flex-direction: column;
  overflow: hidden; /* prevent double scrollbars */
}

/* The scrolling area starts below the header */
.detail-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* smooth on iOS */
  padding-top: 24px; /* replaces header's old margin-bottom spacing */
}

/* ================================
   Header (stable layout, not sticky)
   ================================ */
.detail-header {
  /* grid keeps actions from wrapping under the title */
  display: grid;
  grid-template-columns: 1fr auto; /* title grows, actions shrink-to-fit */
  align-items: center;
  column-gap: 12px;

  /* remove gap that caused see-through between header/body when sticky */
  margin-bottom: 0;
  padding-bottom: 16px;

  /* clean divider (shadow avoids subpixel hairline issues) */
  border-bottom: none;
  box-shadow: 0 1px 0 var(--el-border-color-light);

  background: #fff;
  z-index: 1; /* above scrolling content just in case */

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
    white-space: nowrap; /* prevents wrapping that would change header height */
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
   Element Plus <el-descriptions>
   Lock to two equal columns (50/50)
   ================================ */
.two-col {
  :deep(.el-descriptions__table) {
    table-layout: fixed;
    width: 100%;
  }

  :deep(col) {
    width: 50% !important; /* <colgroup> columns to equal width */
  }

  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content) {
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
}
</style>

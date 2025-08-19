<!-- VendorDetail -->
<template>
  <div class="vendor-detail" v-if="vendor">
    <!-- Detail Header (mimic WorkOrderDetail) -->
    <div class="detail-header">
      <div class="header-main">
        <h2 class="detail-title">{{ vendor.name }}</h2>
      </div>

      <div class="header-actions">
        <el-button-group class="ml-4">
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
          <el-descriptions-item label="Name">{{ vendor.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Code">{{ vendor.code || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Phone Number">{{ vendor.phone_number || '--' }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ vendor.email || '--' }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions v-if="vendor.website?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Website">{{ vendor.website || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions v-if="vendor.address?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Address">{{ vendor.address || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions v-if="vendor.description?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Description">{{ vendor.description || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider v-if="vendor?.image_list?.length" />
        <el-descriptions v-if="vendor.image_list?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Images" />
        </el-descriptions>
        <div v-if="vendor?.image_list?.length">
          <Images :images="vendor.image_list" />
        </div>

        <el-divider v-if="equipmentList?.length" />
        <el-descriptions v-if="equipmentList?.length" :column="1" direction="vertical">
          <el-descriptions-item label="Related Equipment" />
        </el-descriptions>
        <div v-if="equipmentList?.length">
          <SearchTable
            :data="equipmentList"
            :columns="[
              { label: 'Name', prop: 'name' },
              { label: 'Code', prop: 'code' },
              { label: 'Group', prop: 'equipment_group' },
            ]"
          />
        </div>

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
  <el-dialog v-model="editVendor" title="Edit Vendor" width="600px">
    <VendorForm v-model="editForm" ref="editFormRef" />
    <template #footer>
      <el-button @click="editVendor = false">Cancel</el-button>
      <el-button type="primary" :loading="saving" @click="saveEdit">Save</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { Delete, Edit } from '@element-plus/icons-vue'
import SearchTable from '@/views/vendorsAndLocations/Locations/SearchTable.vue'
import Images from '@/views/vendorsAndLocations/Locations/Images.vue'
import VendorForm from './VendorForm.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { ElMessage } from 'element-plus'
import { deactivateVendor, updateVendor, getVendorById } from '@/api/vendor.js'
import { getEquipmentNodes } from '@/api/equipment.js'

const props = defineProps( { vendor : Object } )
const emit = defineEmits( ['deleted', 'updated'] )

const editVendor = ref( false )
const editForm = ref( {} )
const editFormRef = ref( null )
const saving = ref( false )

const equipmentList = ref( [] )
const sparePartsBatchList = ref( [] )

const { confirmAction, showSuccess } = useErrorHandler()

watch(
  () => props.vendor?.id,
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
    ...JSON.parse( JSON.stringify( props.vendor ) ),
    id : props.vendor.id
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

  try {
    const id = Number( props.vendor?.id )
    if ( !Number.isFinite( id ) ) throw new Error( 'Invalid vendor id' )

    await updateVendor( id, editForm.value )

    const res = await getVendorById( id )
    const payload = res?.data ?? res
    const refreshed = payload?.data ?? payload ?? null // works with or without interceptor

    ElMessage.success( 'Vendor updated' )
    editVendor.value = false
    emit( 'updated', refreshed )
  } catch ( e ) {
    const msg = String( e?.response?.data?.message || e?.response?.data?.error || '' )
    if ( e?.response?.status === 409 || /(duplicate|conflict)/i.test( msg ) || /code.*(already|in use)/i.test( msg ) ) {
      ElMessage.error( 'Update failed: vendor code already exists. Please use a different code.' )
    } else {
      ElMessage.error( 'Failed to update vendor' )
    }
    console.error( 'Update vendor failed:', e?.response?.data || e )
  } finally {
    clearTimeout( showTimer )
    if ( showed ) saving.value = false
  }
}

const fetchEquipment = async id => {
  const vendorId = Number( id )
  if ( !Number.isFinite( vendorId ) ) {
    equipmentList.value = []
    return
  }

  try {
    const res = await getEquipmentNodes(
      1, // page
      10, // size
      'createdAt', // sortField
      'DESC', // direction
      { vendor_ids : [vendorId] } // POST body
    )

    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []

    // (optional) normalize ids
    equipmentList.value = list.map( e => ( { ...e, id : Number( e.id ) } ) )
  } catch ( err ) {
    console.error( 'Failed to fetch equipment:', err )
    equipmentList.value = []
  }
}

const fetchSparePartsBatch = async id => {
  try {
    const res = await axios.get( `http://10.10.12.12:8095/api/vendor/correlative-spare-part/${id}` )
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
  min-height: 0; /* let .detail-body get its scrollbar */
  overflow: hidden;
}

/* Header: static (not sticky), with a clean divider */
.detail-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding-bottom: 16px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: #fff; /* ensure solid */
  z-index: 1; /* sit above scrolling body just in case */

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

/* Body becomes the scrollbar area */
//.detail-body {
//  flex: 1 1 auto;
//  overflow-y: auto;
//  -webkit-overflow-scrolling: touch; /* smooth on iOS */
//  padding-top: 24px; /* visual spacing under header */
//}
.detail-body {
  flex: 1 1 auto;
  min-height: 0; /* important with nested flex parents */
  overflow-y: auto; /* the actual scroller */
  -webkit-overflow-scrolling: touch;
  padding-top: 24px;
}

/* Content container */
.descriptions-container {
  position: relative;
  z-index: 0;

  max-width: 1200px;
  width: 100%;
  margin-left: 0;

  :deep(.el-descriptions__title) {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }
}

/* Make el-descriptions truly 2 equal columns */
.two-col {
  :deep(.el-descriptions__table) {
    table-layout: fixed; /* equal-width columns */
    width: 100%;
  }

  :deep(col) {
    width: 50% !important; /* affects <colgroup> generated by Element Plus */
  }

  :deep(.el-descriptions__label),
  :deep(.el-descriptions__content) {
    white-space: normal; /* allow wrapping */
    word-break: break-word;
    overflow-wrap: anywhere;
  }
}
</style>

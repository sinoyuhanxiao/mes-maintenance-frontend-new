<template>
  <div class="split-view">
    <div class="tab-body">
      <!-- Left: Tab switcher + list panel -->
      <div class="list-panel">
        <el-tabs
          tab-position="top"
          :model-value="props.activeTab"
          @update:modelValue="val => emit('update:activeTab', val)"
          class="custom-tab"
        >
          <el-tab-pane name="vendors">
            <template #label><span class="tab-vendors-title">Vendors</span></template>
          </el-tab-pane>
          <el-tab-pane label="Locations" name="locations" />
        </el-tabs>

        <template v-if="props.activeTab === 'vendors'">
          <div class="work-order-list">
            <div class="list-content">
              <div class="pagination-info">
                <el-input
                  v-model="searchInput"
                  placeholder="Search Vendor"
                  clearable
                  size="default"
                  class="search-inline"
                  @clear="
                    () => {
                      currentPage = 1
                      fetchVendors().then(scrollListTop)
                    }
                  "
                />
              </div>

              <template v-if="vendors.length === 0">
                <div class="empty-list"><el-empty description="No vendors" :image-size="80" /></div>
              </template>
              <template v-else>
                <div class="cards-container" ref="cardsRef">
                  <el-row :gutter="16">
                    <el-col v-for="vendor in vendors" :key="vendor.id">
                      <VendorCard :vendor="vendor" :is-selected="selected?.id === vendor.id" @select="selectVendor" />
                    </el-col>
                  </el-row>
                </div>

                <div class="pagination-controls" v-if="totalVendors > 0">
                  <el-pagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="totalVendors"
                    layout="total, prev, pager, next"
                    :small="true"
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                    :hide-on-single-page="false"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Locations list -->
        <template v-else>
          <el-scrollbar height="100%">
            <LocationTree
              ref="locationTreeRef"
              :tree-data="locationTreeData"
              :default-props="{ children: 'children', label: 'name' }"
              @add-child="openAddChildDialog"
              @node-click="handleLocationClick"
            />
          </el-scrollbar>
        </template>
      </div>

      <!-- Right: Detail panel -->
      <div class="detail-panel">
        <VendorDetail
          v-show="props.activeTab === 'vendors'"
          :vendor="selected"
          @deleted="handleDelete"
          @updated="handleVendorUpdated"
        />
        <LocationDetail
          v-show="props.activeTab === 'locations'"
          :location="selectedLocation"
          :location-types="locationTypes"
          @deleted="handleLocationDelete"
          @add-child="openAddChildDialog"
          @updated="handleLocationUpdated"
        />
      </div>
    </div>

    <!-- Create Vendor Dialog -->
    <el-dialog
      :model-value="props.showCreateDialog && props.activeTab === 'vendors'"
      @update:modelValue="val => emit('update:showCreateDialog', val)"
      title="Create New Vendor"
      width="600px"
    >
      <VendorForm :key="vendorCreateKey" v-model="newVendor" :original-urls="[]" ref="vendorFormRef" />
      <template #footer>
        <el-button @click="emit('update:showCreateDialog', false)">Cancel</el-button>
        <el-button type="primary" @click="submitNewVendor">Create</el-button>
      </template>
    </el-dialog>

    <!-- Create Location Dialog -->
    <el-dialog
      :model-value="props.showCreateDialog && props.activeTab === 'locations'"
      @update:modelValue="val => emit('update:showCreateDialog', val)"
      :title="createLocationTitle"
      width="600px"
      destroy-on-close
    >
      <LocationForm v-model="newLocation" :location-types="locationTypes" ref="locationFormRef" />
      <template #footer>
        <el-button @click="emit('update:showCreateDialog', false)">Cancel</el-button>
        <el-button type="primary" @click="submitNewLocation"> Create </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

import VendorCard from './VendorCard.vue'
import VendorDetail from './VendorDetail.vue'
import VendorForm from './VendorForm.vue'
import LocationForm from '@/views/vendorsAndLocations/Locations/LocationForm.vue'
import LocationTree from '@/views/vendorsAndLocations/Locations/LocationTree.vue'
import LocationDetail from '@/views/vendorsAndLocations/Locations/LocationDetail.vue'
import { getLocationTree, getLocationById, createLocation, getLocationTypes } from '@/api/location.js'
import { createVendor, searchVendorsGeneral } from '@/api/vendor.js'
import { uploadMultipleToMinio } from '@/api/minio.js'

const props = defineProps( { activeTab : String, showCreateDialog : Boolean, search : String } )

/** robust MinIO response normalizer */
const extractUploadedUrls = resp => {
  const list = resp?.uploadedFiles ?? resp?.data?.uploadedFiles ?? resp?.data?.data?.uploadedFiles ?? resp?.files ?? []
  return ( Array.isArray( list ) ? list : [] ).map( f => f?.url || f?.fileUrl || f?.location || f?.path ).filter( Boolean )
}

const emit = defineEmits( ['update:activeTab', 'update:showCreateDialog'] )

const vendorFormRef = ref( null )
const locationFormRef = ref( null )
const locationTreeRef = ref( null )
const cardsRef = ref( null )

const vendors = ref( [] )
const selected = ref( null )
const locationTreeData = ref( [] )
const selectedLocation = ref( null )

const currentPage = ref( 1 )
const searchInput = ref( '' )
const activeTab = ref( props.activeTab )
const pageSize = ref( 10 )
const totalVendors = ref( 0 )
const isChildCreate = ref( false )
const vendorCreateKey = ref( 0 )

const scrollListTop = () =>
  nextTick( () => {
    const el = cardsRef.value
    if ( !el ) return
    if ( el.scrollTo ) el.scrollTo( { top : 0, behavior : 'smooth' } )
    else el.scrollTop = 0
  } )

watch(
  () => props.activeTab,
  val => {
    activeTab.value = val
  }
)

// Debounced search for vendors
let searchTimer = null
watch( searchInput, () => {
  currentPage.value = 1
  if ( searchTimer ) clearTimeout( searchTimer )
  searchTimer = setTimeout( () => {
    if ( props.activeTab === 'vendors' ) fetchVendors().then( scrollListTop )
  }, 300 )
} )

const newVendor = ref( {
  name : '',
  code : '',
  address : '',
  phone_number : '',
  email : '',
  website : '',
  description : '',
  image_list : [],
  file_list : []
} )

const newLocation = ref( {
  name : '',
  code : '',
  location_type : null,
  person_in_charge_id : null,
  address : '',
  description : '',
  image_list : [],
  file_list : [],
  parent_id : null,
  latitude : null,
  longitude : null
} )

const isRootLocation = computed( () => {
  return newLocation.value?.parent_id === null || newLocation.value?.parent_id === undefined
} )

const createLocationTitle = computed( () => {
  return isRootLocation.value ? 'Create New Location' : 'Create Sub Location'
} )

const locationTypes = ref( [] )

onMounted( async() => {
  await fetchLocationTypes()
  if ( props.activeTab === 'vendors' ) await fetchVendors()
  else if ( props.activeTab === 'locations' ) await fetchLocationTree()
} )

const fetchVendors = async() => {
  try {
    const res = await searchVendorsGeneral(
      { keyword : searchInput.value || '' },
      { page : currentPage.value, size : pageSize.value, sortField : 'createdAt', direction : 'DESC' }
    )
    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []
    const normalized = list.map( v => ( { ...v, id : Number( v.id ) } ) )

    vendors.value = normalized
    totalVendors.value = Number( page?.totalElements ?? normalized.length )

    const curId = Number( selected.value?.id )
    const stillThere = normalized.find( v => Number( v.id ) === curId )
    selected.value = stillThere || normalized[0] || null
  } catch ( err ) {
    console.error( 'Error fetching vendors:', err )
    vendors.value = []
    totalVendors.value = 0
  }
}

const fetchLocationTypes = async() => {
  try {
    const res = await getLocationTypes()
    const payload = res?.data ?? res
    const list = Array.isArray( payload?.data ) ? payload.data : Array.isArray( payload ) ? payload : []
    locationTypes.value = list.map( t => ( {
      ...t,
      id : Number( t.id ),
      sequence_order : t.sequence_order != null ? Number( t.sequence_order ) : 0
    } ) )
  } catch ( e ) {
    console.error( 'fetchLocationTypes failed:', e?.response?.data || e )
    locationTypes.value = []
  }
}

const fetchLocationTree = async() => {
  try {
    const res = await getLocationTree()
    const payload = res && res.data !== undefined ? res.data : res
    let raw = []
    if ( payload?.data ) raw = payload.data
    else if ( Array.isArray( payload ) ) raw = payload
    else if ( payload ) raw = [payload]

    const types = Array.isArray( locationTypes.value ) ? locationTypes.value : []
    const enrich = nodes =>
      nodes
        .map( node => {
          const id = Number( node.id )
          const locTypeId = node.locationTypeId != null ? Number( node.locationTypeId ) : null
          return {
            ...node,
            id,
            locationTypeId : locTypeId,
            location_type : types.find( t => Number( t.id ) === locTypeId ) || null,
            children : Array.isArray( node.children ) && node.children.length ? enrich( node.children ) : []
          }
        } )
        .sort( ( a, b ) => a.id - b.id )

    locationTreeData.value = enrich( raw )

    if ( !selectedLocation.value && locationTreeData.value.length > 0 ) {
      const first = locationTreeData.value[0]
      await handleLocationClick( first )
      await nextTick()
      locationTreeRef.value?.treeRef?.setCurrentKey( first.id )
    }
  } catch ( e ) {
    console.error( 'fetchLocationTree failed:', e )
  }
}

const handleLocationClick = async node => {
  const id = Number( node?.id ?? node?.locationId )
  if ( !Number.isFinite( id ) ) {
    console.warn( 'handleLocationClick: invalid id', node )
    return
  }

  try {
    const res = await getLocationById( id )
    const payload = res && res.data !== undefined ? res.data : res
    const data = payload?.data ?? payload ?? {}

    const typeId = data.location_type?.id ?? data.location_type_id ?? data.LocationTypeId ?? data.locationTypeId ?? null
    const matchType = ( arr, tid ) => ( Array.isArray( arr ) ? arr.find( t => Number( t.id ) === Number( tid ) ) || null : null )

    data.id = id
    data.location_type = typeId != null ? matchType( locationTypes.value, typeId ) : null

    selectedLocation.value = data
  } catch ( err ) {
    console.error( 'getLocationById failed:', err )
    const typeId = node.location_type?.id ?? node.location_type_id ?? node.locationTypeId
    selectedLocation.value = {
      ...node,
      id,
      location_type :
        typeId != null
          ? Array.isArray( locationTypes.value )
            ? locationTypes.value.find( t => Number( t.id ) === Number( typeId ) ) || null
            : null
          : null
    }
  }
}

const handleDelete = deletedId => {
  const index = vendors.value.findIndex( v => v.id === deletedId )
  if ( index === -1 ) return
  vendors.value.splice( index, 1 )
  selected.value = vendors.value.length > 0 ? vendors.value[Math.max( 0, index - 1 )] : null
  fetchVendors().then( scrollListTop )
}

const handleLocationDelete = async deletedId => {
  let newSelected = null
  const findAndRemove = ( nodes, parent = null ) => {
    for ( let i = 0; i < nodes.length; i++ ) {
      const node = nodes[i]
      if ( node.id === deletedId ) {
        const siblings = parent ? parent.children : locationTreeData.value
        newSelected = siblings[i - 1] || siblings[i + 1] || parent || null
        nodes.splice( i, 1 )
        return true
      }
      if ( node.children?.length ) {
        const removed = findAndRemove( node.children, node )
        if ( removed ) return true
      }
    }
    return false
  }

  findAndRemove( locationTreeData.value )

  if ( selectedLocation.value?.id === deletedId ) {
    selectedLocation.value = null
    if ( newSelected ) {
      await handleLocationClick( { id : newSelected.id } )
      nextTick( () => locationTreeRef.value?.treeRef?.setCurrentKey( newSelected.id ) )
    }
  }
}

const handleLocationUpdated = async( { id } ) => {
  const numericId = Number( id )
  if ( !Number.isFinite( numericId ) ) return

  try {
    const res = await getLocationById( numericId )
    const payload = res?.data ?? res
    const updated = ( payload?.data ?? payload ?? {} ) || {}

    const typeId = updated.location_type?.id ?? updated.location_type_id ?? updated.locationTypeId ?? null
    updated.id = numericId
    updated.location_type =
      ( Array.isArray( locationTypes.value ) ? locationTypes.value.find( t => Number( t.id ) === Number( typeId ) ) : null ) ||
      null

    if ( Number( selectedLocation.value?.id ) === numericId ) {
      Object.assign( selectedLocation.value, updated )
    } else {
      selectedLocation.value = updated
    }

    const updateNode = nodes => {
      for ( const n of nodes ) {
        if ( Number( n.id ) === numericId ) {
          Object.assign( n, updated )
          return true
        }
        if ( n.children?.length && updateNode( n.children ) ) return true
      }
      return false
    }
    const inPlace = Array.isArray( locationTreeData.value ) ? updateNode( locationTreeData.value ) : false
    if ( !inPlace ) await fetchLocationTree()

    await nextTick()
    locationTreeRef.value?.treeRef?.setCurrentKey( numericId )
  } catch ( err ) {
    console.error( 'handleLocationUpdated error:', err )
  }
}

const openAddChildDialog = parent => {
  isChildCreate.value = true
  newLocation.value = {
    name : '',
    code : '',
    location_type : null,
    person_in_charge_id : null, // ✅ new
    address : '',
    description : '',
    image_list : [],
    file_list : [],
    parent_id : parent.id,
    latitude : null,
    longitude : null
  }
  emit( 'update:showCreateDialog', true )
}

const selectVendor = vendor => {
  selected.value = vendor
}

const submitNewVendor = async() => {
  if ( !( await vendorFormRef.value?.validate?.() ) ) return

  const f = vendorFormRef.value.getFormData?.() ?? {}
  let uploadedImageUrls = []
  let uploadedFileUrls = []
  try {
    if ( Array.isArray( f.image_files ) && f.image_files.length ) {
      const res = await uploadMultipleToMinio( f.image_files )
      uploadedImageUrls = extractUploadedUrls( res )
    }
    if ( Array.isArray( f.file_files ) && f.file_files.length ) {
      const res = await uploadMultipleToMinio( f.file_files )
      uploadedFileUrls = extractUploadedUrls( res )
    }
  } catch ( e ) {
    ElMessage.error( 'File upload failed' )
    console.error( 'uploadMultipleToMinio failed:', e?.response?.data || e )
    return
  }

  const onlyUrls = arr => ( Array.isArray( arr ) ? arr.filter( x => typeof x === 'string' ) : [] )
  const image_list = [...onlyUrls( f.image_list ), ...uploadedImageUrls]
  const file_list = [...onlyUrls( f.file_list ), ...uploadedFileUrls]

  const payload = {
    name : ( f.name ?? '' ).trim(),
    code : ( f.code ?? '' ).trim(),
    address : ( f.address ?? '' ).trim(),
    phone_number : ( f.phone_number ?? '' ).trim(),
    email : ( f.email ?? '' ).trim(),
    website : ( f.website ?? '' ).trim(),
    description : ( f.description ?? '' ).trim(),
    image_list,
    file_list
  }

  try {
    await createVendor( payload )
    ElMessage.success( 'Vendor created' )
    emit( 'update:showCreateDialog', false )

    currentPage.value = 1
    await fetchVendors()
    await nextTick()
    selected.value = vendors.value[0] || null
    scrollListTop()
  } catch ( e ) {
    const s = e?.response?.status
    const m = ( e?.response?.data?.message || e?.response?.data?.error || '' ).toLowerCase()
    ElMessage.error( s === 409 || /code.*exist/.test( m ) ? 'Create failed: vendor code already exists.' : 'Create failed' )
    console.error( 'Create vendor failed:', e?.response?.data || e )
  }
}

const handleVendorUpdated = updated => {
  const i = vendors.value.findIndex( v => v.id === updated.id )
  if ( i !== -1 ) {
    Object.assign( vendors.value[i], updated )
    selected.value = vendors.value[i]
    return
  }
  fetchVendors().then( () => {
    const j = vendors.value.findIndex( v => v.id === updated.id )
    if ( j !== -1 ) selected.value = vendors.value[j]
  } )
}

const submitNewLocation = async() => {
  if ( !( await locationFormRef.value?.validate() ) ) return

  const f = locationFormRef.value.getFormData()
  const typeId = f.location_type_id == null ? null : Number( f.location_type_id )
  const picId = f.person_in_charge_id === '' || f.person_in_charge_id == null ? null : Number( f.person_in_charge_id )

  // normalize coordinates
  const lat =
    f.latitude === '' || f.latitude == null ? null : Number.isFinite( Number( f.latitude ) ) ? Number( f.latitude ) : null

  const lng =
    f.longitude === '' || f.longitude == null ? null : Number.isFinite( Number( f.longitude ) ) ? Number( f.longitude ) : null

  // Upload new images only
  let uploadedImageUrls = []
  try {
    if ( Array.isArray( f.image_files ) && f.image_files.length ) {
      const res = await uploadMultipleToMinio( f.image_files )
      uploadedImageUrls = extractUploadedUrls( res )
    }
  } catch ( e ) {
    ElMessage.error( 'Image upload failed' )
    console.error( 'uploadMultipleToMinio failed:', e?.response?.data || e )
    return
  }

  const onlyUrls = arr => ( Array.isArray( arr ) ? arr.filter( x => typeof x === 'string' ) : [] )
  const image_list = Array.from( new Set( [...onlyUrls( f.image_list ), ...uploadedImageUrls] ) )

  const payload = {
    name : f.name?.trim() || '',
    code : f.code?.trim() || '',
    description : f.description?.trim() || '',
    parent_id : newLocation.value?.parent_id ?? f.parent_id ?? null,
    address : f.address?.trim() || '',
    image_list,
    ...( typeId != null && Number.isFinite( typeId ) ? { location_type_id : typeId } : {} ),
    ...( Number.isFinite( picId ) ? { person_in_charge_id : picId } : {} ),
    ...( Number.isFinite( lat ) ? { latitude : lat } : {} ),
    ...( Number.isFinite( lng ) ? { longitude : lng } : {} )
  }

  try {
    const res = await createLocation( payload )
    const payloadRes = res?.data ?? res
    const created = payloadRes?.data ?? payloadRes
    const newId = Number( created?.id )

    emit( 'update:showCreateDialog', false )
    ElMessage.success( 'Location created' )

    await fetchLocationTree()
    await nextTick()

    if ( Number.isFinite( newId ) ) {
      await handleLocationClick( { id : newId } )
      await nextTick()
      locationTreeRef.value?.treeRef?.setCurrentKey( newId )
    }
  } catch ( e ) {
    const s = e?.response?.status
    const m = ( e?.response?.data?.message || '' ).toLowerCase()
    if ( s === 409 || /code.*exist/.test( m ) ) {
      ElMessage.error( 'Create failed: location code already exists. Please use a different code.' )
      locationFormRef.value?.validateField?.( 'code', () => {} )
      locationFormRef.value?.scrollToField?.( 'code' )
    } else {
      ElMessage.error( 'Create failed' )
    }
    console.error( 'Create location failed:', e?.response?.data || e )
  }
}

const handlePageChange = page => {
  currentPage.value = page
  fetchVendors().then( scrollListTop )
}
const handleSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
  fetchVendors().then( scrollListTop )
}

watch(
  () => props.activeTab,
  async newTab => {
    if ( newTab === 'vendors' ) {
      selectedLocation.value = null
      if ( vendors.value.length === 0 ) await fetchVendors()
      selected.value = vendors.value[0] || null
    } else if ( newTab === 'locations' ) {
      selected.value = null
      if ( locationTreeData.value.length === 0 ) await fetchLocationTree()
      const first = locationTreeData.value[0]
      if ( first ) {
        await handleLocationClick( first )
        nextTick( () => locationTreeRef.value?.treeRef?.setCurrentKey( first.id ) )
      }
    }
  },
  { immediate : true }
)

watch(
  () => props.showCreateDialog,
  open => {
    if ( !open ) {
      // dialog closing → reset flag
      isChildCreate.value = false
      return
    }

    if ( props.activeTab === 'vendors' ) {
      Object.assign( newVendor.value, {
        name : '',
        code : '',
        address : '',
        phone_number : '',
        email : '',
        website : '',
        description : '',
        image_list : [],
        file_list : [],
        removed_existing_images : []
      } )
      vendorCreateKey.value += 1
    } else {
      Object.assign( newLocation.value, {
        name : '',
        code : '',
        location_type : null,
        person_in_charge_id : null,
        address : '',
        description : '',
        image_list : [],
        file_list : [],
        parent_id : isChildCreate.value ? newLocation.value.parent_id : null,
        latitude : null,
        longitude : null
      } )
    }
  }
)
</script>

<style scoped>
.split-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.tab-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 5px 0 0 0;
}

.list-panel {
  flex: 0 0 30%;
  max-width: 30%;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
@media (min-width: 1600px) {
  .list-panel {
    flex-basis: 25%;
    max-width: 25%;
  }
}

.detail-panel {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-left: 16px;
  margin-left: 10px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.work-order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  min-height: 0;
}
.loading-container {
  padding: 16px;
}
.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
.list-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
  min-height: 300px;
  overflow-x: hidden;
}
.cards-container::-webkit-scrollbar {
  width: 6px;
}
.cards-container::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
}
.cards-container::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 3px;
}
.cards-container::-webkit-scrollbar-thumb:hover {
  background: var(--el-fill-color-darker);
}

.pagination-controls {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.pagination-controls :deep(.el-pagination) .el-pager li {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  font-size: 12px;
}
.pagination-controls :deep(.el-pagination) .btn-prev,
.pagination-controls :deep(.el-pagination) .btn-next {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
}
.pagination-controls :deep(.el-pagination) .el-pagination__total,
.pagination-controls :deep(.el-pagination) .el-pagination__jump {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.list-content .pagination-info {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 8px 0;
  background: var(--el-bg-color);
}
.list-content .pagination-info .search-inline {
  width: 100%;
}

.cards-container :deep(.el-col) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.custom-tab :deep(.tab-vendors-title) {
  display: inline-block;
  padding: 0 12px;
}
</style>

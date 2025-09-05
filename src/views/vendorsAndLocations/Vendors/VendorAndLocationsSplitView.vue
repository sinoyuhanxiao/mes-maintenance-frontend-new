<template>
  <div class="split-view">
    <div class="tab-body">
      <!-- Left: Tab switcher + list panel -->
      <div class="list-panel">
        <!-- Tabs -->
        <el-tabs
          tab-position="top"
          :model-value="props.activeTab"
          @update:modelValue="val => emit('update:activeTab', val)"
          class="custom-tab"
        >
          <el-tab-pane name="vendors">
            <template #label>
              <span class="tab-vendors-title">Vendors</span>
            </template>
          </el-tab-pane>

          <el-tab-pane label="Locations" name="locations" />
        </el-tabs>

        <template v-if="props.activeTab === 'vendors'">
          <!-- Work-order-like list wrapper (same chrome as TodoView) -->
          <div class="work-order-list">
            <div class="list-content">
              <!-- Search is ALWAYS visible -->
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
                      fetchVendors()
                    }
                  "
                />
              </div>

              <!-- Empty vs. Results -->
              <template v-if="vendors.length === 0">
                <div class="empty-list">
                  <el-empty description="No vendors" :image-size="80" />
                </div>
              </template>
              <template v-else>
                <!-- Cards Container (scrollable middle) -->
                <div class="cards-container">
                  <el-row :gutter="16">
                    <el-col v-for="vendor in vendors" :key="vendor.id">
                      <VendorCard :vendor="vendor" :is-selected="selected?.id === vendor.id" @select="selectVendor" />
                    </el-col>
                  </el-row>
                </div>

                <!-- Pagination Controls (bottom bar) -->
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

    <!-- Create Root Location Dialog -->
    <el-dialog
      :model-value="props.showCreateDialog && props.activeTab === 'locations'"
      @update:modelValue="val => emit('update:showCreateDialog', val)"
      :title="'Create Location'"
      width="600px"
      destroy-on-close
    >
      <LocationForm v-model="newLocation" :location-types="locationTypes" ref="locationFormRef" />
      <template #footer>
        <el-button @click="emit('update:showCreateDialog', false)">Cancel</el-button>
        <el-button type="primary" @click="submitNewLocation">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

import VendorCard from './VendorCard.vue'
import VendorDetail from './VendorDetail.vue'
import VendorForm from './VendorForm.vue'
import LocationForm from '@/views/vendorsAndLocations/Locations/LocationForm.vue'
import LocationTree from '@/views/vendorsAndLocations/Locations/LocationTree.vue'
import LocationDetail from '@/views/vendorsAndLocations/Locations/LocationDetail.vue'
import { getLocationTree, getLocationById, createLocation } from '@/api/location.js'
import { createVendor, searchVendorsGeneral } from '@/api/vendor.js'
import { uploadMultipleToMinio } from '@/api/minio.js'

const props = defineProps( {
  activeTab : String,
  showCreateDialog : Boolean,
  search : String
} )

/** robust MinIO response normalizer */
const extractUploadedUrls = resp => {
  const list = resp?.uploadedFiles ?? resp?.data?.uploadedFiles ?? resp?.data?.data?.uploadedFiles ?? resp?.files ?? []
  return ( Array.isArray( list ) ? list : [] ).map( f => f?.url || f?.fileUrl || f?.location || f?.path ).filter( Boolean )
}

const emit = defineEmits( ['update:activeTab', 'update:showCreateDialog'] )

const vendorFormRef = ref( null )
const locationFormRef = ref( null )
const locationTreeRef = ref( null )

const vendors = ref( [] ) // now holds ONLY the current server page
const selected = ref( null )
const locationTreeData = ref( [] )
const selectedLocation = ref( null )

const currentPage = ref( 1 )
const searchInput = ref( '' )
const activeTab = ref( props.activeTab )
const pageSize = ref( 10 )

const totalVendors = ref( 0 )
// const totalPages = computed( () => Math.max( 1, Math.ceil( totalVendors.value / pageSize.value ) ) )
const isChildCreate = ref( false )
const vendorCreateKey = ref( 0 )

watch(
  () => props.activeTab,
  val => {
    activeTab.value = val
  }
)

// Debounced search: call backend when query changes
let searchTimer = null
watch( searchInput, () => {
  currentPage.value = 1
  if ( searchTimer ) clearTimeout( searchTimer )
  searchTimer = setTimeout( () => {
    if ( props.activeTab === 'vendors' ) fetchVendors()
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
  capacity : '',
  address : '',
  description : '',
  image_list : [],
  file_list : [],
  parent_id : null
} )

const locationTypes = ref( [] )

onMounted( async() => {
  await fetchLocationTypes()

  if ( props.activeTab === 'vendors' ) {
    await fetchVendors()
  } else if ( props.activeTab === 'locations' ) {
    await fetchLocationTree()
  }
} )

const fetchVendors = async() => {
  try {
    const res = await searchVendorsGeneral(
      { keyword : searchInput.value || '' },
      {
        page : currentPage.value,
        size : pageSize.value,
        sortField : 'createdAt',
        direction : 'DESC'
      }
    )

    // handle both raw axios and unwrapped http helper responses
    const payload = res?.data ?? res
    const page = payload?.data ?? payload

    const list = Array.isArray( page?.content ) ? page.content : Array.isArray( page ) ? page : []

    // normalize ids (prevents selection mismatch)
    const normalized = list.map( v => ( { ...v, id : Number( v.id ) } ) )

    vendors.value = normalized
    totalVendors.value = Number( page?.totalElements ?? normalized.length )

    // keep the current selection if still present; else select first
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
  const res = await axios.get( 'http://10.10.12.12:8095/api/location/location-types' )
  locationTypes.value = res.data?.data || []
}

const fetchLocationTree = async() => {
  try {
    const res = await getLocationTree()

    // Accept: {data:{data}}, {data:[]}, [], or single object
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
            id, // normalize for el-tree node-key
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
      await nextTick() // ensure tree has rendered
      locationTreeRef.value?.treeRef?.setCurrentKey( first.id )
    }
  } catch ( e ) {
    console.error( 'fetchLocationTree failed:', e )
    // optionally: ElMessage.error('Failed to load location tree')
  }
}

const handleLocationClick = async node => {
  // 1) validate + normalize id
  const id = Number( node?.id ?? node?.locationId )
  if ( !Number.isFinite( id ) ) {
    console.warn( 'handleLocationClick: invalid id from node', node )
    return
  }

  try {
    // 2) call with id
    const res = await getLocationById( id )

    // 3) accept {data:{...}} or {...}
    const payload = res && res.data !== undefined ? res.data : res
    const data = payload?.data ?? payload ?? {}

    // 4) robust type mapping (number-compare)
    const typeId = data.location_type?.id ?? data.location_type_id ?? data.locationTypeId ?? null

    const matchType = ( arr, tid ) => ( Array.isArray( arr ) ? arr.find( t => Number( t.id ) === Number( tid ) ) || null : null )

    data.id = id
    data.location_type = typeId != null ? matchType( locationTypes.value, typeId ) : null

    // 5) set selected
    selectedLocation.value = data
  } catch ( err ) {
    console.error( 'getLocationById failed:', err )
    // Optional: fall back to node so UI still updates
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
    // Optionally toast: ElMessage.error('Failed to load location details')
  }
}

const handleDelete = deletedId => {
  const index = vendors.value.findIndex( v => v.id === deletedId )
  if ( index === -1 ) return
  vendors.value.splice( index, 1 )
  selected.value = vendors.value.length > 0 ? vendors.value[Math.max( 0, index - 1 )] : null
  // optional: refetch the current page to keep counts correct
  fetchVendors()
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
    const res = await getLocationById( numericId ) // ✅ no hardcoded host
    const payload = res?.data ?? res
    const updated = ( payload?.data ?? payload ?? {} ) || {}

    // re-enrich type like your tree expects (number-compare)
    const typeId = updated.location_type?.id ?? updated.location_type_id ?? updated.locationTypeId ?? null

    updated.id = numericId
    updated.location_type =
      ( Array.isArray( locationTypes.value ) ? locationTypes.value.find( t => Number( t.id ) === Number( typeId ) ) : null ) ||
      null

    // update detail in place
    if ( Number( selectedLocation.value?.id ) === numericId ) {
      Object.assign( selectedLocation.value, updated )
    } else {
      selectedLocation.value = updated
    }

    // update tree node in place
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

    // if it moved parents, just refetch tree
    if ( !inPlace ) await fetchLocationTree()

    await nextTick()
    locationTreeRef.value?.treeRef?.setCurrentKey( numericId )
  } catch ( err ) {
    console.error( 'handleLocationUpdated error:', err )
    // optional: ElMessage.error('Failed to refresh location')
  }
}

const openAddChildDialog = parent => {
  isChildCreate.value = true
  newLocation.value = {
    name : '',
    code : '',
    location_type : null,
    capacity : '',
    address : '',
    description : '',
    image_list : [],
    file_list : [],
    parent_id : parent.id
  }
  emit( 'update:showCreateDialog', true )
}

const selectVendor = vendor => {
  selected.value = vendor
}

const submitNewVendor = async() => {
  if ( !( await vendorFormRef.value?.validate?.() ) ) return

  // 1) Pull form data
  const f = vendorFormRef.value.getFormData?.() ?? {}

  // 2) Upload new Files → URLs
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

  // 3) Merge existing URL strings with newly uploaded (no File objects)
  const onlyUrls = arr => ( Array.isArray( arr ) ? arr.filter( x => typeof x === 'string' ) : [] )
  const image_list = [...onlyUrls( f.image_list ), ...uploadedImageUrls]
  const file_list = [...onlyUrls( f.file_list ), ...uploadedFileUrls] // <-- singular

  // 4) Build payload
  const payload = {
    name : ( f.name ?? '' ).trim(),
    code : ( f.code ?? '' ).trim(),
    address : ( f.address ?? '' ).trim(),
    phone_number : ( f.phone_number ?? '' ).trim(),
    email : ( f.email ?? '' ).trim(),
    website : ( f.website ?? '' ).trim(),
    description : ( f.description ?? '' ).trim(),
    image_list,
    file_list // <-- what your backend expects
  }

  try {
    const res = await createVendor( payload )
    const payloadRes = res?.data ?? res
    const created = payloadRes?.data ?? payloadRes
    const newId = Number( created?.id )

    ElMessage.success( 'Vendor created' )
    // close dialog in your code...
    emit( 'update:showCreateDialog', false )

    await fetchVendors()
    await nextTick()
    selected.value =
      ( Number.isFinite( newId ) ? vendors.value.find( v => Number( v.id ) === newId ) : null ) || vendors.value[0] || null
  } catch ( e ) {
    const s = e?.response?.status
    const m = ( e?.response?.data?.message || e?.response?.data?.error || '' ).toLowerCase()
    ElMessage.error(
      s === 409 || /code.*exist/.test( m )
        ? 'Create failed: vendor code already exists. Please use a different code.'
        : 'Create failed'
    )
    console.error( 'Create vendor failed:', e?.response?.data || e )
  }
}

const handleVendorUpdated = updated => {
  // 1) If the vendor is still on this page, mutate in place (keep identity).
  const i = vendors.value.findIndex( v => v.id === updated.id )
  if ( i !== -1 ) {
    Object.assign( vendors.value[i], updated ) // mutate existing object
    selected.value = vendors.value[i] // point selected to SAME instance
    return
  }

  // 2) If it moved off this page (filters/sort/page changed),
  //    refetch and try to reselect by id.
  fetchVendors().then( () => {
    const j = vendors.value.findIndex( v => v.id === updated.id )
    if ( j !== -1 ) selected.value = vendors.value[j]
    // else: it's not on this page anymore; selection will stay as-is.
  } )
}

const submitNewLocation = async() => {
  if ( !( await locationFormRef.value?.validate() ) ) return

  const f = locationFormRef.value.getFormData()
  const typeId = f.location_type_id == null ? null : Number( f.location_type_id )
  const cap = f.capacity == null || f.capacity === '' ? null : parseInt( f.capacity, 10 )

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

  // Merge existing URL strings with newly uploaded
  const onlyUrls = arr => ( Array.isArray( arr ) ? arr.filter( x => typeof x === 'string' ) : [] )
  const image_list = Array.from( new Set( [...onlyUrls( f.image_list ), ...uploadedImageUrls] ) )

  const payload = {
    name : f.name?.trim() || '',
    code : f.code?.trim() || '',
    description : f.description?.trim() || '',
    parent_id : newLocation.value?.parent_id ?? f.parent_id ?? null,
    address : f.address?.trim() || '',
    image_list,
    ...( typeId != null ? { location_type_id : typeId } : {} ),
    ...( cap != null ? { capacity : cap } : {} )
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
  fetchVendors()
}
const handleSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
  fetchVendors()
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
      if ( locationTreeData.value.length === 0 ) {
        await fetchLocationTree()
      }
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
    if ( !open ) return

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
        capacity : '',
        address : '',
        description : '',
        image_list : [],
        file_list : [],
        parent_id : isChildCreate.value ? newLocation.value.parent_id : null
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

/* Body must fill available space so children can match its height */
.tab-body {
  display: flex;
  flex: 1; /* was a fixed calc height */
  min-height: 0; /* lets inner flex children shrink/scroll */
  overflow: hidden;
  padding: 5px 0 0 0;
}

/* default: 30% */
.list-panel {
  flex: 0 0 30%;
  max-width: 30%;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ≥1920px: 20% */
@media (min-width: 1600px) {
  .list-panel {
    flex-basis: 25%;
    max-width: 25%;
  }
}

/* Right column fills the remaining ~70% */
.detail-panel {
  flex: 1 1 auto;
  display: flex; /* <-- make it a flex container */
  flex-direction: column; /* <-- vertical */
  min-height: 0; /* <-- CRITICAL so child can shrink/scroll */
  overflow: hidden; /* keep scrollbars inside */
  padding-left: 16px;
  margin-left: 10px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

/* Left panel already defined; these mimic TodoView’s inner chrome */
.work-order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  /* ensure it expands to fill left column */
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
  padding: 10px 8px 10px 8px;
  min-height: 300px; /* keeps some body area even with few items */
  overflow-x: hidden;

  /* optional: scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 3px;
    &:hover {
      background: var(--el-fill-color-darker);
    }
  }
}

.pagination-controls {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);

  :deep(.el-pagination) {
    .el-pager li {
      min-width: 28px;
      height: 28px;
      line-height: 28px;
      font-size: 12px;
    }
    .btn-prev,
    .btn-next {
      min-width: 28px;
      height: 28px;
      line-height: 28px;
    }
    .el-pagination__total,
    .el-pagination__jump {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
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
  display: inline-block; /* so padding applies nicely */
  padding: 0 12px; /* tweak as you like */
}
</style>

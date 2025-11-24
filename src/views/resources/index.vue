<template>
  <div>
    <div class="filters-container">
      <!-- Filter button with popover onclick -->
      <el-popover placement="bottom-start" trigger="click" width="500">
        <template #reference>
          <el-button icon="Filter" @click="() => (isFilterPopOverVisible = !isFilterPopOverVisible)">{{
            'Filters'
          }}</el-button>
        </template>

        <div class="vertical-filter-list">
          <el-text tag="b">Sort By</el-text>

          <el-select
            :teleported="false"
            v-model="listQuery.sort_by"
            placeholder="Sort by"
            clearable
            filterable
            @change="handleFilter"
          >
            <el-option label="Newest" value="newest" />

            <el-option label="Oldest" value="oldest" />

            <el-option label="A-Z (Name)" value="alphabetical-asc" />

            <el-option label="Z-A (Name)" value="alphabetical-desc" />
          </el-select>

          <el-text tag="b">Category</el-text>

          <el-select
            :teleported="false"
            v-model="listQuery.category_ids"
            placeholder="Filter by category"
            multiple
            clearable
            filterable
            @change="handleFilter"
          >
            <el-option
              v-for="category in sparePartClassesOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>

          <el-text tag="b">Stock Status</el-text>

          <el-select
            :teleported="false"
            v-model="listQuery.stock"
            placeholder="Filter by stock status"
            clearable
            filterable
            @change="handleFilter"
          >
            <el-option label="In Stock" value="in_stock" />

            <el-option label="Low Stock" value="low" />

            <el-option label="Out Of Stock" value="out_of_stock" />
          </el-select>

          <el-text tag="b">Material Vendor</el-text>

          <el-select
            :teleported="false"
            v-model="listQuery.vendor_ids"
            placeholder="Filter by material vendor"
            clearable
            multiple
            filterable
            @change="handleFilter"
          >
            <el-option v-for="vendor in vendorOptions" :key="vendor.id" :label="vendor.name" :value="vendor.id" />
          </el-select>

          <el-text tag="b">Lot Location</el-text>

          <LocationTreeSelect
            v-model="listQuery.location_ids"
            :max-collapse-tags="1"
            @change="handleFilter"
            :input-placeholder="'Filter by lot location'"
          />

          <!--            <el-row>-->
          <!--              <el-text tag="b">Manufacturers</el-text>-->
          <!--            </el-row>-->

          <!--            <el-row>-->
          <!--              <el-select-->
          <!--                v-model="listQuery.manufacturer_ids"-->
          <!--                placeholder="Filter by manufacturers"-->
          <!--                clearable-->
          <!--                multiple-->
          <!--                @change="handleFilter"-->
          <!--              >-->
          <!--                <el-option-->
          <!--                  v-for="manufacturer in manufacturerOptions"-->
          <!--                  :key="manufacturer.id"-->
          <!--                  :label="manufacturer.name"-->
          <!--                  :value="manufacturer.id"-->
          <!--                />-->
          <!--              </el-select>-->
          <!--            </el-row>-->

          <el-text tag="b">Unit Price</el-text>

          <div style="display: flex; justify-content: space-between">
            <el-input-number v-model="listQuery.unit_cost_min" placeholder="Min Cost" :min="0" @change="handleFilter" />

            <el-input-number
              v-model="listQuery.unit_cost_max"
              placeholder="Max Cost"
              :min="listQuery.unit_cost_min"
              @change="handleFilter"
            />
          </div>

          <div class="filter-footer">
            <el-button :icon="Remove" type="warning" plain @click="handleResetFilters">{{ 'Clear Filters' }}</el-button>
          </div>
          <!--        <el-slider v-model="filter.price_range" range min="0" range-start-label="minimum price" range-end-label="maximum price"/>-->
        </div>
      </el-popover>

      <!-- Filter selected criteria tag list, horizontal, overflow gets scrollable, takes rest of the space in filter container-->
      <div class="selected-filter-tag-list">
        <template v-for="tag in activeFilterTags" :key="`${tag.key}-${tag.value || tag.label}`">
          <el-tag type="info" closable @close="removeFilterTag(tag)" class="filter-tag">
            {{ tag.label }}
          </el-tag>
        </template>
      </div>

      <!-- action group stays on right end -->
      <div class="action-group">
        <el-input
          v-model="listQuery.keyword"
          placeholder="Search by keyword"
          clearable
          @input="handleFilter"
          style="width: 300px; height: 32px"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-button :icon="EditPen" type="primary" style="margin-left: 12px" @click="openCreateForm">{{
          'Create Spare Part'
        }}</el-button>

        <el-button :icon="Remove" type="warning" plain @click="handleResetFilters">{{ 'Clear Filters' }}</el-button>

        <el-button :icon="RefreshIcon" @click="handleRefresh">{{ 'Refresh' }}</el-button>
      </div>
    </div>

    <div class="split-view">
      <div class="left-pane">
        <SparePartList
          v-model="selectedSparePartId"
          :list="list"
          :loading="loading"
          :total="total"
          :page="page"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
          @select="showDetail"
        />
      </div>

      <div class="right-pane">
        <SparePartForm
          v-if="showSparePartForm"
          :data="selected"
          :all_locations="locationOptions"
          @cancel="cancelEdit"
          @confirm="savePart"
        />

        <SparePartDetail
          v-else-if="selected"
          :data="selected"
          :loading="loading"
          :inventory_transaction_logs="selectedInventoryTransactionLogs"
          :all_locations="locationOptions"
          @edit="startEdit"
          @refresh="handleRefresh"
          @delete="handleDelete"
        />

        <!--            @view-manufacturer-detail="showManufacturerDetailPopup"-->

        <el-empty
          v-else
          style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 400px"
          description="Select a spare part to view details"
        />
      </div>
    </div>

    <!--      <ManufacturerDetailPopup v-model="isManufacturerDialogVisible" :manufacturer-id="selectedManufacturerId" />-->
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSparePart } from '@/composables/useSparePart'
import SparePartForm from '@/views/resources/components/SparePartForm.vue'
import SparePartDetail from '@/views/resources/components/SparePartDetail.vue'
import SparePartList from '@/views/resources/components/SparePartList.vue'
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteSparePart, getAllSparePartClasses } from '@/api/resources'
import { searchVendors } from '@/api/vendor'
import { EditPen, Remove, Search, Refresh as RefreshIcon } from '@element-plus/icons-vue'
// import ManufacturerDetailPopup from '@/views/resources/components/ManufacturerDetailPopup.vue'
// import { searchManufacturers } from '@/api/manufacturer'
import { searchLocations } from '@/api/location'

defineOptions( {
  name : 'SpareParts'
} )

const {
  list,
  total,
  loading,
  fetchSpareParts,
  resetFilters,
  listQuery,
  getMaterialInventoryTransactionLog,
  fetchInventoryTransactionLogs
} = useSparePart()

const selected = ref( null ) // selected spare part object
const selectedSparePartId = ref( null )
const selectedInventoryTransactionLogs = ref( [] )
const showSparePartForm = ref( false )
const page = ref( 1 )
// const all_data_loading = ref( false )
const sparePartClassesOptions = ref( [] )
const vendorOptions = ref( [] )
const locationOptions = ref( [] )
// const manufacturerOptions = ref( [] )
// const isManufacturerDialogVisible = ref( false )
// const selectedManufacturerId = ref( null )
const isFilterPopOverVisible = ref( false )
const activeFilterTags = computed( () => {
  const tags = []

  if ( listQuery.sort_by ) {
    tags.push( { key : 'sort_by', label : `Sort By: ${formatNameSortLabel( listQuery.sort_by )}` } )
  }

  if ( listQuery.category_ids?.length ) {
    listQuery.category_ids.forEach( id => {
      const category = sparePartClassesOptions.value.find( c => c.id === id )

      if ( category ) {
        tags.push( { key : 'category_ids', value : id, label : `Category: ${category.name}` } )
      }
    } )
  }

  if ( listQuery.stock ) {
    tags.push( { key : 'stock', label : `Stock Level: ${formatStockLabel( listQuery.stock )}` } )
  }

  if ( listQuery.vendor_ids?.length ) {
    listQuery.vendor_ids.forEach( id => {
      const v = vendorOptions.value.find( v => v.id === id )
      if ( v ) tags.push( { key : 'vendor_ids', value : id, label : `Vendor: ${v.name}` } )
    } )
  }

  if ( listQuery.location_ids?.length ) {
    listQuery.location_ids.forEach( id => {
      tags.push( { key : 'location_ids', value : id, label : `Location: ${getLocationNameById( id )}` } )
    } )
  }

  // if ( listQuery.manufacturer_ids?.length ) {
  //   listQuery.manufacturer_ids.forEach( id => {
  //     const m = manufacturerOptions.value.find( m => m.id === id )
  //
  //     if ( m ) {
  //       tags.push( { key : 'manufacturer_ids', value : id, label : `Manufacturer: ${m.name}` } )
  //     }
  //   } )
  // }

  if ( listQuery.unit_cost_min != null ) {
    tags.push( { key : 'unit_cost_min', label : `Min Cost: ${listQuery.unit_cost_min}` } )
  }

  if ( listQuery.unit_cost_max != null ) {
    tags.push( { key : 'unit_cost_max', label : `Max Cost: ${listQuery.unit_cost_max}` } )
  }

  if ( listQuery.keyword ) {
    tags.push( { key : 'keyword', label : `Keyword: ${listQuery.keyword}` } )
  }

  return tags
} )

function getLocationNameById( locationId ) {
  const name = locationOptions.value.find( location => location.id === locationId )?.name
  return name || '-'
}

function removeFilterTag( tag ) {
  const { key, value } = tag

  if ( Array.isArray( listQuery[key] ) ) {
    listQuery[key] = listQuery[key].filter( v => v !== value )
  } else {
    listQuery[key] = key.includes( 'cost' ) ? null : ''
  }

  handleFilter()
}

function showDetail( item ) {
  selected.value = item
  selectedSparePartId.value = item.id
  selectedInventoryTransactionLogs.value = getMaterialInventoryTransactionLog( item.id )
  showSparePartForm.value = false
}

function startEdit() {
  showSparePartForm.value = true
}

async function handleDelete() {
  ElMessageBox.confirm( `Are you sure you want to delete this spare part?`, 'Confirm Spare Part Deletion', {
    confirmButtonText : 'Confirm',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( async() => {
      const selectionId = selected.value?.id
      selected.value = null
      selectedInventoryTransactionLogs.value = []

      try {
        await deleteSparePart( selectionId )
      } catch ( err ) {
        console.error( 'Failed to delete spare part:', err )
        ElMessage.error( 'Error deleting the spare part' )
      }

      ElMessage.success( 'Spare part deleted' )

      await fetchSpareParts()
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}

function cancelEdit() {
  showSparePartForm.value = false
}

function openCreateForm() {
  selected.value = null
  selectedSparePartId.value = null
  showSparePartForm.value = true
}

async function savePart( sparePartId ) {
  selected.value = null
  selectedSparePartId.value = sparePartId
  showSparePartForm.value = false

  await fetchInventoryTransactionLogs()
  await fetchSpareParts()

  // Reselect the item that was just saved
  if ( sparePartId ) {
    const updated = list.value.find( item => item.id === sparePartId )

    if ( updated ) {
      selected.value = updated
      selectedInventoryTransactionLogs.value = getMaterialInventoryTransactionLog( updated.id )
    }
  }
}

async function handlePageChange( newPage ) {
  listQuery.page = newPage
  await fetchSpareParts()
}

async function handlePageSizeChange( newPageSize ) {
  listQuery.limit = newPageSize
  listQuery.page = 1
  await fetchSpareParts()
}

async function handleFilter() {
  await fetchSpareParts()
}

function handleResetFilters() {
  selected.value = null
  showSparePartForm.value = false
  resetFilters()
}

async function handleRefresh() {
  showSparePartForm.value = false
  await refreshAllData()

  selected.value = list.value.find( item => item.id === selectedSparePartId.value )
  selectedInventoryTransactionLogs.value = getMaterialInventoryTransactionLog( selectedSparePartId.value )
}

// function showManufacturerDetailPopup( manufacturerId ) {
//   selectedManufacturerId.value = manufacturerId
//   isManufacturerDialogVisible.value = true
// }

function formatNameSortLabel( nameSort ) {
  if ( !nameSort ) {
    return ''
  }

  return nameSort
    .split( '-' )
    .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
    .join( ' ' )
}

function formatStockLabel( stock ) {
  if ( !stock ) {
    return ''
  }

  return stock
    .split( '_' )
    .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
    .join( ' ' )
}

async function loadSparePartClasses() {
  try {
    const response = await getAllSparePartClasses( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    sparePartClassesOptions.value = response?.data || []
  } catch ( err ) {
    console.error( 'Failed to load spare part classes:', err )
    ElMessage.error( 'Error loading spare part classes data' )
  }
}

async function loadVendor() {
  try {
    const response = await searchVendors( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    vendorOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load vendors:', err )
    ElMessage.error( 'Error loading vendors data' )
  }
}

async function loadLocation() {
  try {
    const response = await searchLocations( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    locationOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load location:', err )
    ElMessage.error( 'Error loading location data' )
  }
}

// async function loadManufacturer() {
//   try {
//     const response = await searchManufacturers( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
//     manufacturerOptions.value = response?.data?.content || []
//   } catch ( err ) {
//     console.error( 'Failed to load manufacturers:', err )
//     ElMessage.error( 'Error loading manufacturers data' )
//   }
// }

async function refreshAllData() {
  await fetchInventoryTransactionLogs()
  await loadLocation()
  await loadSparePartClasses()
  await loadVendor()
  // await loadManufacturer()
  await fetchSpareParts()
}

onMounted( async() => {
  await refreshAllData()
} )
</script>

<style scoped lang="scss">
.filters-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  padding: 15px;
}

.vertical-filter-list {
  display: flex;
  flex-direction: column;
  gap: 6px; /* consistent spacing between rows */

  .filter-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  :deep(.el-text) {
    align-self: flex-start;
  }
}

.selected-filter-tag-list {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0 8px;
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  min-height: 32px; /* keep visible height even if empty */

  .filter-tag {
    height: 30px;
    flex-shrink: 0;
  }
}

.split-view {
  display: flex;
  height: calc(100vh - 163px);
  gap: 10px;
  margin: 0 15px 0 15px;
}

.left-pane {
  flex: 3 0 0;
  overflow: hidden; /* prevent double scrollbars */
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.right-pane {
  flex: 7;
  padding: 0 15px 15px 0;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  width: 66%;
}

.action-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
}

.action-group :deep(.el-input) {
  min-width: 0;
  flex-shrink: 1; /* allow the input to shrink when space is tight */
}
</style>

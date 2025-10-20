<template>
  <div class="outer-container">
    <div class="header">
      <div class="left-header">
        <el-input
          v-model="keyword"
          :placeholder="currentView === 1 ? 'Search Spare Part' : 'Search Tool'"
          style="width: 240px"
          :prefix-icon="Search"
          clearable
        />

        <!-- Small popover under the filter icon -->
        <el-popover placement="bottom-start" width="300" v-model:visible="filterVisible" trigger="click">
          <template #reference>
            <el-icon style="cursor: pointer" title="Filter"><Filter /></el-icon>
          </template>

          <div class="filter-content">
            <!-- Sort -->
            <div class="filter-section">
              <div class="filter-title">Sort</div>
              <el-radio-group v-model="filterState.sortKey">
                <el-radio-button label="createdAt_desc">Newest</el-radio-button>
                <el-radio-button label="createdAt_asc">Oldest</el-radio-button>
                <el-radio-button label="name_asc">A–Z</el-radio-button>
                <el-radio-button label="name_desc">Z–A</el-radio-button>
              </el-radio-group>
            </div>

            <!-- Category -->
            <div class="filter-section">
              <div class="filter-title">Category</div>
              <el-select v-model="filterState.categories" placeholder="All" multiple clearable style="width: 100%">
                <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>

            <!-- Availability (kept for later; currently backend only receives category) -->
            <div class="filter-section">
              <div class="filter-title">Availability</div>
              <el-checkbox-group v-model="filterState.stockStatuses">
                <el-checkbox label="inStock">In Stock</el-checkbox>
                <el-checkbox label="lowStock">Below Min Stock</el-checkbox>
                <el-checkbox label="outOfStock">Out of Stock</el-checkbox>
              </el-checkbox-group>
            </div>

            <div class="filter-actions">
              <el-button @click="clearFilters" text>Reset</el-button>
              <el-button @click="applyFilters" type="primary">Apply</el-button>
            </div>
          </div>
        </el-popover>
      </div>

      <div class="right-header">
        <el-dropdown @command="handleCommand">
          <el-text class="el-dropdown-link" style="border: solid 1px #d5d5d5; padding: 5px">
            <el-icon><component :is="currentIcon" /></el-icon>
            {{ currentLabel }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-text>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="a" :icon="Magnet">Spare Parts</el-dropdown-item>
              <el-dropdown-item command="b" :icon="Tools">Tools</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button @click="() => (currentView === 1 ? (dialogVisible = true) : (newTool = true))" type="primary">
          {{ currentView === 1 ? 'Create Spare Part' : 'Create Tool' }}
        </el-button>
      </div>
    </div>

    <div class="main-container-sp" v-if="currentView === 1">
      <!-- ADD DIALOG -->
      <el-dialog v-model="dialogVisible" title="Add New Spare Part" width="600px">
        <SparePartForm
          mode="create"
          @success="handleCreate"
          @close="dialogVisible = false"
          @cancel="dialogVisible = false"
        />
      </el-dialog>

      <!-- EDIT DIALOG -->
      <el-dialog v-model="editDialogVisible" title="Edit Spare Part" width="600px">
        <SparePartForm
          mode="edit"
          :initialData="selectedData"
          @success="handleCreate"
          @close="editDialogVisible = false"
          @cancel="editDialogVisible = false"
        />
      </el-dialog>

      <div class="table-container">
        <CardTable
          @selection="getSelection"
          :module="1"
          :data="tableData"
          :maxHeight="maxHeight"
          :totalItems="tableTotal"
          :handleCurrentChange="handleCurrentChange"
          :currentPage="listQuery.page"
          :pageSize="listQuery.limit"
          :selectedId="selectedData?.id"
          :showSearch="false"
        />
      </div>

      <div class="content-container">
        <div class="tab-container">
          <el-card>
            <div style="display: flex; flex-direction: row; justify-content: space-between">
              <el-text v-if="selectedData" tag="b" size="large">{{ selectedData?.name }}</el-text>
              <el-dropdown class="kebab-dropdown" trigger="click" :disabled="!selectedData">
                <el-icon class="kebab-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openEditDialog">Edit</el-dropdown-item>
                    <el-dropdown-item divided class="danger-item" @click="confirmDelete"> Delete </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <el-tabs v-model="activeName" type="card" class="demo-tabs" style="margin-top: 10px">
              <el-tab-pane label="Details" name="first">
                <ViewDetails v-model:data="selectedData" />
              </el-tab-pane>
              <el-tab-pane label="Batches" name="second">
                <Batches :sparePart="selectedData" />
              </el-tab-pane>
              <el-tab-pane label="Usage" name="third">
                <Usage />
              </el-tab-pane>
              <el-tab-pane label="Transactions" name="fourth">
                <Transactions :sparePart="selectedData" />
              </el-tab-pane>
              <el-tab-pane label="History" name="fifth">
                <History />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>
    </div>

    <div v-if="currentView === 2">
      <ToolsView v-model:keyword="keyword" :newTool="newTool" @close="() => (newTool = false)" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, computed, reactive, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import CardTable from '../../components/Tables/CardTable.vue'
import ViewDetails from './components/ViewDetails.vue'
import Usage from './components/Usage.vue'
import Transactions from './components/Transactions.vue'
import History from './components/History.vue'
import SparePartForm from './components/SparePartForm.vue'
import { Search, Filter, Tools, Magnet, MoreFilled } from '@element-plus/icons-vue'
import Batches from './components/Batches/Batches.vue'
import ToolsView from './components/Tools/ToolsView.vue'
import { searchSpareParts, deleteSparePart, getAllSparePartClasses } from '@/api/resources'

const activeName = ref( 'first' )
const dialogVisible = ref( false )
const editDialogVisible = ref( false )
const newTool = ref( false )
const spareParts = ref( [] )
const selectedData = ref( null )
const selectedIndex = ref( 0 )
const totalItems = ref( 0 )
const keyword = ref( null )
const categoryOptions = ref( [] )

const listQuery = reactive( {
  page : 1,
  limit : 10,
  sort : '-id'
} )

/** Filter popover state */
const filterVisible = ref( false )
const filterState = reactive( {
  sortKey : 'createdAt_desc', // 'createdAt_desc' | 'createdAt_asc' | 'name_asc' | 'name_desc'
  categories : [],
  stockStatuses : [] // (not sent to backend yet)
} )

/** ✅ Use backend for all filter/sort/paging */
const useServerFiltering = true

// /** ——— Helpers (UI badges only; not used for backend) ——— */
// function getQty( item ) {
//   return item?.current_stock ?? item?.quantity ?? item?.stock ?? item?.qty ?? 0
// }
// function getName( item ) {
//   return item?.name ?? item?.display_name ?? item?.code ?? item?.universal_code ?? ''
// }

/** ✅ Map sortKey -> backend sortField/direction */
function resolveSort( sortKey ) {
  switch ( sortKey ) {
    case 'createdAt_asc':
      return { sortField : 'createdAt', direction : 'ASC' }
    case 'createdAt_desc':
      return { sortField : 'createdAt', direction : 'DESC' }
    case 'name_asc':
      return { sortField : 'name', direction : 'ASC' }
    case 'name_desc':
      return { sortField : 'name', direction : 'DESC' }
    default:
      return { sortField : 'createdAt', direction : 'DESC' }
  }
}

/** ✅ Build backend payload EXACTLY like your curl */
const STATUS_ACTIVE = 1
function buildSearchPayload() {
  return {
    keyword : keyword.value ?? '',
    spare_part_class_ids : filterState.categories?.length ? filterState.categories : undefined,
    status_ids : [STATUS_ACTIVE] // always filter out soft-deleted rows
  }
}

/** ✅ Fetch from API with backend sort/filter/paging */
async function getAllSparePartsData() {
  const { sortField, direction } = resolveSort( filterState.sortKey )

  const response = await searchSpareParts( listQuery.page, listQuery.limit, sortField, direction, buildSearchPayload() )

  const page = response.data
  spareParts.value = page?.content ?? []
  totalItems.value = page?.totalElements ?? 0

  // keep details panel stable
  selectedIndex.value = 0
  selectedData.value = spareParts.value?.[0] ?? null
}

/** ✅ Refetch on keyword/sort/category change */
watch(
  () => keyword.value,
  () => {
    if ( useServerFiltering ) {
      listQuery.page = 1
      getAllSparePartsData()
    }
  }
)
watch(
  () => filterState.sortKey,
  () => {
    if ( useServerFiltering ) {
      listQuery.page = 1
      getAllSparePartsData()
    }
  }
)
watch(
  () => filterState.categories,
  () => {
    if ( useServerFiltering ) {
      listQuery.page = 1
      getAllSparePartsData()
    }
  },
  { deep : true }
)

/** Page height handling */
const maxHeight = ref( '770px' )
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}

/** Apply/Clear in popover */
function applyFilters() {
  if ( useServerFiltering ) {
    listQuery.page = 1
    getAllSparePartsData()
  }
  filterVisible.value = false
}
function clearFilters() {
  filterState.sortKey = 'createdAt_desc'
  filterState.categories = []
  // leave stockStatuses as-is (not sent yet)
  if ( useServerFiltering ) {
    listQuery.page = 1
    getAllSparePartsData()
  }
  filterVisible.value = false
}

/** Table bindings (server mode) */
const tableData = computed( () => spareParts.value )
const tableTotal = computed( () => totalItems.value )

/** Delete flow */
async function confirmDelete() {
  if ( !selectedData.value?.id ) return
  try {
    await ElMessageBox.confirm(
      `Delete spare part “${selectedData.value.name}” (ID: ${selectedData.value.id})? This cannot be undone.`,
      'Confirm Delete',
      {
        confirmButtonText : 'Delete',
        cancelButtonText : 'Cancel',
        type : 'warning',
        autofocus : false,
        confirmButtonClass : 'el-button--danger'
      }
    )
    await deleteSparePart( selectedData.value.id )
    ElMessage.success( 'Spare part deleted.' )

    const isLastItemOnPage = spareParts.value.length === 1 && listQuery.page > 1
    if ( isLastItemOnPage ) listQuery.page -= 1

    selectedData.value = null
    selectedIndex.value = 0
    await getAllSparePartsData()
  } catch ( err ) {
    if ( err === 'cancel' ) return
    ElMessage.error( err?.message || 'Failed to delete spare part.' )
  }
}

/** Lifecycle */
onMounted( async() => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )

  try {
    const res = await getAllSparePartClasses()
    categoryOptions.value = ( res.data || [] )
      .map( c => ( {
        value : c.id,
        label : ( c.name ?? '' ).trim() || `Class #${c.id}`
      } ) )
      .sort( ( a, b ) => a.label.localeCompare( b.label, undefined, { sensitivity : 'base', numeric : true } ) )
  } catch ( err ) {
    console.error( 'Failed to load spare part classes:', err )
  }

  await getAllSparePartsData()
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateHeight )
} )

/** Selections / dialogs */
function getSelection( data ) {
  selectedIndex.value = data.index
  selectedData.value = data
}
function openEditDialog() {
  if ( !selectedData.value ) return
  editDialogVisible.value = true
}
async function handleCreate( data ) {
  if ( data ) {
    dialogVisible.value = false
    editDialogVisible.value = false
  }
  await getAllSparePartsData()
}

/** View switching */
const currentView = ref( 1 )
const handleCurrentChange = val => {
  listQuery.page = val
  getAllSparePartsData()
}
const handleCommand = command => {
  currentView.value = command === 'a' ? 1 : 2
}
const currentLabel = computed( () => ( currentView.value === 1 ? 'Spare Parts' : 'Tools' ) )
const currentIcon = computed( () => ( currentView.value === 1 ? 'Magnet' : 'Tools' ) )
</script>

<style scoped>
.outer-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.header {
  padding-left: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left-header,
.right-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.main-container-sp {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.table-container {
  flex: 0 0 30vw;
}

.content-container {
  padding: 5px;
  flex: 0 1 70vw;
  display: flex;
  justify-content: center;
}

.tab-container {
  width: 100%;
  max-width: 1245px;
  margin: 0 auto;
}

.kebab-dropdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
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
.danger-item {
  color: #f56c6c;
}
.danger-item:hover {
  color: #fff;
  background: #f56c6c;
}

/* Popover filter layout */
.filter-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-title {
  font-weight: 600;
  font-size: 14px;
}
.filter-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1600px) {
  .table-container {
    flex: 0 0 30vw;
  }
  .content-container {
    padding: 5px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .tab-container {
    width: 100%;
    max-width: 977px;
    margin: 0 auto;
  }
}
</style>

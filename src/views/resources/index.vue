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

        <!-- 🔽 Filter popover -->
        <el-popover placement="bottom-start" width="300" v-model:visible="filterVisible" trigger="click">
          <template #reference>
            <el-icon style="cursor: pointer" title="Filter"><Filter /></el-icon>
          </template>

          <!-- ===== Spare Parts filter (unchanged) ===== -->
          <div v-if="currentView === 1" class="filter-content">
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
              <el-select v-model="filterState.categories" placeholder="Select" multiple clearable style="width: 100%">
                <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>

            <!-- Availability -->
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

          <!-- ===== Tools filter (Category only) ===== -->
          <div v-else class="filter-content">
            <div class="filter-section">
              <div class="filter-title">Tool Category</div>
              <el-select
                v-model="filterStateTool.categories"
                placeholder="Select"
                multiple
                clearable
                style="width: 100%"
              >
                <el-option v-for="opt in toolCategoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
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

    <!-- 🔽 Spare Parts section -->
    <div class="main-container-sp" v-if="currentView === 1">
      <el-dialog v-model="dialogVisible" title="Add New Spare Part" width="600px">
        <SparePartForm
          mode="create"
          @success="handleCreate"
          @close="dialogVisible = false"
          @cancel="dialogVisible = false"
        />
      </el-dialog>

      <el-dialog v-model="editDialogVisible" title="Edit Spare Part" width="600px" destroy-on-close>
        <SparePartForm
          :key="selectedData?.id"
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
                    <el-dropdown-item divided class="danger-item" @click="confirmDelete">Delete</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <el-tabs v-model="activeName" type="card" class="demo-tabs" style="margin-top: 10px">
              <el-tab-pane label="Details" name="first"><ViewDetails v-model:data="selectedData" /></el-tab-pane>
              <el-tab-pane label="Batches" name="second"><Batches :sparePart="selectedData" /></el-tab-pane>
              <el-tab-pane label="Usage" name="third"><Usage /></el-tab-pane>
              <el-tab-pane label="Transactions" name="fourth"><Transactions :sparePart="selectedData" /></el-tab-pane>
              <el-tab-pane label="History" name="fifth"><History /></el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 🔽 Tools section -->
    <ToolsView
      v-if="currentView === 2"
      v-model:keyword="keyword"
      :newTool="newTool"
      :category-ids="filterStateTool.categories"
      @close="() => (newTool = false)"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Filter, Tools, Magnet, MoreFilled } from '@element-plus/icons-vue'
import CardTable from '../../components/Tables/CardTable.vue'
import ViewDetails from './components/ViewDetails.vue'
import Usage from './components/Usage.vue'
import Transactions from './components/Transactions.vue'
import History from './components/History.vue'
import Batches from './components/Batches/Batches.vue'
import SparePartForm from './components/SparePartForm.vue'
import ToolsView from './components/Tools/ToolsView.vue'
import { searchSpareParts, deleteSparePart, getAllSparePartClasses, getAllToolClasses } from '@/api/resources'

// ===== States =====
const activeName = ref( 'first' )
const dialogVisible = ref( false )
const editDialogVisible = ref( false )
const newTool = ref( false )
const currentView = ref( 1 )
const keyword = ref( null )

const spareParts = ref( [] )
const selectedData = ref( null )
const selectedIndex = ref( 0 )
const totalItems = ref( 0 )

const listQuery = reactive( { page : 1, limit : 10, sort : '-id' } )
const filterVisible = ref( false )

// ===== Spare Part filters =====
const filterState = reactive( {
  sortKey : 'createdAt_desc',
  categories : [],
  stockStatuses : []
} )
const categoryOptions = ref( [] )

// ===== Tool filters =====
const toolsRef = ref( null )
const filterStateTool = reactive( { categories : [] } )
const toolCategoryOptions = ref( [] )

// ===== Fetching helpers =====
const useServerFiltering = true
const STATUS_ACTIVE = 1

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

function buildSearchPayload() {
  return {
    keyword : keyword.value ?? '',
    spare_part_class_ids : filterState.categories?.length ? filterState.categories : undefined,
    status_ids : [STATUS_ACTIVE]
  }
}

async function getAllSparePartsData() {
  const { sortField, direction } = resolveSort( filterState.sortKey )
  const response = await searchSpareParts( listQuery.page, listQuery.limit, sortField, direction, buildSearchPayload() )
  const page = response.data
  spareParts.value = page?.content ?? []
  totalItems.value = page?.totalElements ?? 0
  selectedIndex.value = 0
  selectedData.value = spareParts.value?.[0] ?? null
}

// ===== Watchers =====
watch(
  () => keyword.value,
  () => {
    if ( useServerFiltering && currentView.value === 1 ) {
      listQuery.page = 1
      getAllSparePartsData()
    } else if ( currentView.value === 2 ) {
      toolsRef.value?.applyCategoryFilter?.( filterStateTool.categories )
    }
  }
)
watch(
  () => filterState.sortKey,
  () => {
    if ( useServerFiltering && currentView.value === 1 ) {
      listQuery.page = 1
      getAllSparePartsData()
    }
  }
)
watch(
  () => filterState.categories,
  () => {
    if ( useServerFiltering && currentView.value === 1 ) {
      listQuery.page = 1
      getAllSparePartsData()
    }
  },
  { deep : true }
)

// ===== Apply/Clear filters =====
async function applyFilters() {
  if ( currentView.value === 1 ) {
    if ( useServerFiltering ) {
      listQuery.page = 1
      await getAllSparePartsData()
    }
  } else {
    toolsRef.value?.applyCategoryFilter?.( filterStateTool.categories )
  }
  filterVisible.value = false
}

async function clearFilters() {
  if ( currentView.value === 1 ) {
    filterState.sortKey = 'createdAt_desc'
    filterState.categories = []
    filterState.stockStatuses = []
    if ( useServerFiltering ) {
      listQuery.page = 1
      await getAllSparePartsData()
    }
  } else {
    filterStateTool.categories = []
    toolsRef.value?.clearCategoryFilter?.()
  }
  filterVisible.value = false
}

// ===== Lifecycle =====
const maxHeight = ref( '770px' )
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}
onMounted( async() => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )

  // Spare part categories
  const res = await getAllSparePartClasses()
  categoryOptions.value = ( res.data || [] ).map( c => ( {
    value : c.id,
    label : c.name || `Class #${c.id}`
  } ) )

  // Tool categories
  const toolRes = await getAllToolClasses()
  toolCategoryOptions.value = ( toolRes.data || [] ).map( c => ( {
    value : c.id,
    label : c.name || `Category #${c.id}`
  } ) )

  await getAllSparePartsData()
} )
onBeforeUnmount( () => window.removeEventListener( 'resize', updateHeight ) )

// ===== Spare Part helpers =====
const tableData = computed( () => spareParts.value )
const tableTotal = computed( () => totalItems.value )

function getSelection( data ) {
  selectedIndex.value = data.index
  selectedData.value = data
}
function openEditDialog() {
  if ( !selectedData.value ) return
  editDialogVisible.value = true
}
async function confirmDelete() {
  if ( !selectedData.value?.id ) return
  try {
    await ElMessageBox.confirm( `Delete spare part “${selectedData.value.name}”?`, 'Confirm Delete', {
      confirmButtonText : 'Delete',
      cancelButtonText : 'Cancel',
      type : 'warning'
    } )
    await deleteSparePart( selectedData.value.id )
    ElMessage.success( 'Deleted' )
    await getAllSparePartsData()
  } catch ( err ) {
    if ( err !== 'cancel' ) ElMessage.error( 'Failed to delete' )
  }
}
async function handleCreate( data ) {
  dialogVisible.value = false
  editDialogVisible.value = false
  await getAllSparePartsData()
}

// ===== View switching =====
const handleCommand = command => {
  currentView.value = command === 'a' ? 1 : 2
}
const currentLabel = computed( () => ( currentView.value === 1 ? 'Spare Parts' : 'Tools' ) )
const currentIcon = computed( () => ( currentView.value === 1 ? 'Magnet' : 'Tools' ) )
const handleCurrentChange = val => {
  listQuery.page = val
  getAllSparePartsData()
}
</script>

<style scoped>
.outer-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left-header,
.right-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

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
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* parent .vue */
.main-container-sp {
  display: flex;
  gap: 0.5rem;
}

/* left panel fixed as a percentage, not vw */
.table-container {
  flex: 0 0 32%;
  max-width: 32%;
  min-width: 320px; /* optional safety floor */
  box-sizing: border-box;
}

/* right panel takes the rest */
.content-container {
  flex: 1 1 68%;
  max-width: 68%;
  box-sizing: border-box;
}

/* optional: avoid unexpected overflows in flex children */
.tab-container {
  min-width: 0;
}

.kebab-icon {
  transform: rotate(90deg);
  cursor: pointer;
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
</style>

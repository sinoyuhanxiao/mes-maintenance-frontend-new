<template>
  <div class="outer-container">
    <div class="header">
      <div class="left-header">
        <el-input
          v-model="keyword"
          :placeholder="currentView === 1 ? 'Search Spare Part' : 'Search Tool'"
          style="width: 240px"
          size="small"
          :prefix-icon="Search"
          clearable
        >
        </el-input>
        <el-icon style="cursor: pointer" title="Filter"><Filter /></el-icon>
      </div>
      <div class="right-header">
        <el-dropdown @command="handleCommand">
          <el-text class="el-dropdown-link" style="border: solid 1px #d5d5d5; padding: 5px">
            <el-icon><component :is="currentIcon" /></el-icon> {{ currentLabel
            }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-text>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="a" :icon="Magnet">Spare Parts</el-dropdown-item>
              <el-dropdown-item command="b" :icon="Tools">Tools</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="() => (currentView === 1 ? (dialogVisible = true) : (newTool = true))" type="primary">{{
          currentView === 1 ? 'Create Spare Part' : 'Create Tool'
        }}</el-button>
      </div>
    </div>
    <div class="main-container-sp" v-if="currentView === 1">
      <el-dialog v-model="dialogVisible" title="New Spare Part" width="800" top="5vh"
        ><NewSparePart @createPart="handleCreate"
      /></el-dialog>
      <div class="table-container">
        <CardTable
          @selection="getSelection"
          :module="1"
          :data="spareParts"
          :maxHeight="maxHeight"
          :totalItems="totalItems"
          :handleCurrentChange="handleCurrentChange"
          :currentPage="listQuery.page"
        />
      </div>
      <div class="content-container">
        <div v-if="!editing" class="tab-container">
          <el-card>
            <div style="display: flex; flex-direction: row; justify-content: space-between">
              <el-text v-if="selectedData" tag="b" size="large">{{ selectedData.name }} </el-text>
              <el-button :icon="EditPen" @click="() => (editing = true)">Edit</el-button>
            </div>
            <el-tabs
              v-model="activeName"
              type="card"
              class="demo-tabs"
              @tab-click="handleClick"
              style="margin-top: 10px"
            >
              <el-tab-pane label="Details" name="first"><ViewDetails v-model:data="selectedData" /></el-tab-pane>
              <el-tab-pane label="Batches" name="second"><Batches :sparePart="selectedData" /></el-tab-pane>
              <el-tab-pane label="Usage" name="third"><Usage /></el-tab-pane>
              <el-tab-pane label="Transactions" name="fourth"><Transactions :sparePart="selectedData" /></el-tab-pane>
              <el-tab-pane label="History" name="fifth"><History /></el-tab-pane>
              <el-tab-pane label="Vendors" name="sixth"
                ><Vendors :data="selectedData" @refresh-data="getAllSparePartsData()"
              /></el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
        <div v-if="editing" class="edit-container">
          <EditSparePart :data="selectedData" @cancel="() => (editing = false)" @updatePart="handleCreate" />
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
import CardTable from '../../components/Tables/CardTable.vue'
import ViewDetails from './components/ViewDetails.vue'
import Usage from './components/Usage.vue'
import Transactions from './components/Transactions.vue'
import History from './components/History.vue'
import Vendors from './components/Vendors/Vendors.vue'
import NewSparePart from './components/NewSparePart.vue'
import EditSparePart from './components/EditSparePart.vue'
import { EditPen, Search, Filter, Tools, Magnet } from '@element-plus/icons-vue'
import Batches from './components/Batches/Batches.vue'
import ToolsView from './components/Tools/ToolsView.vue'
import { searchSpareParts } from '../../api/resources'

const activeName = ref('first')

const dialogVisible = ref(false)
const newTool = ref(false)
const editing = ref(false)

const spareParts = ref([])

const selectedData = ref(null)
const selectedIndex = ref(0)
const totalItems = ref(null)
const search = ref({})
const keyword = ref(null)

// Query parameters
const listQuery = reactive({
  page: 1,
  limit: 10,
  sort: '-id',
})

watch(
  () => keyword.value,
  newVal => {
    console.log(newVal)
    search.value = { keyword: newVal }
  }
)

async function getAllSparePartsData() {
  const response = await searchSpareParts(listQuery.page, listQuery.limit, 'name', 'ASC', search.value)
  // console.log( response.data.content )

  spareParts.value = response.data.content
  totalItems.value = response.data.totalElements
  selectedData.value = spareParts.value[selectedIndex.value]
}

getAllSparePartsData()

watch(
  () => search,
  newData => {
    getAllSparePartsData()
  },
  { immediate: true, deep: true }
)

const maxHeight = ref('770px')
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeight)
})

function getSelection(data) {
  selectedIndex.value = data.index
  selectedData.value = data
}

onMounted(() => {
  selectedData.value = spareParts.value[0]
})

async function handleCreate(data) {
  if (data) {
    dialogVisible.value = false
    editing.value = false
  }
  getAllSparePartsData()
}

const currentView = ref(1)

const handleCurrentChange = val => {
  listQuery.page = val
  getAllSparePartsData()
}

// dropdown command handling
const handleCommand = command => {
  currentView.value = command === 'a' ? 1 : 2
}

const currentLabel = computed(() => {
  return currentView.value === 1 ? 'Spare Parts' : 'Tools'
})

const currentIcon = computed(() => {
  return currentView.value === 1 ? 'Magnet' : 'Tools'
})
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

.left-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
}

.right-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.main-container-sp {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  /* background-color: red; */
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

.tab-container,
.edit-container {
  width: 100%; /* Full width of the container */
  max-width: 1245px;
  margin: 0 auto;
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

  .tab-container,
  .edit-container {
    width: 100%; /* Full width of the container */
    max-width: 977px; /* Set the same max-width */
    margin: 0 auto;
  }
}
</style>

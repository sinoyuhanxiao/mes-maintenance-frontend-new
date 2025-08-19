<template>
  <div class="page-layout">
    <div class="header-title">
      <div class="left-header">
        <el-input
          v-model="keyword"
          placeholder="Search Request"
          style="width: 240px"
          size="small"
          :prefix-icon="Search"
          clearable
        >
        </el-input>
        <el-icon style="cursor: pointer" title="Filter"><Filter /></el-icon>
      </div>
      <el-button
        class="filter-item"
        type="primary"
        :icon="EditPen"
        @click="dialogVisible = true"
        :aria-label="$t('requests.createRequest')"
      >
        {{ $t('requests.createRequest') }}
      </el-button>
    </div>

    <div class="outer-dashboard">
      <div class="dashboard-body">
        <el-dialog v-model="dialogVisible" title="New Request" width="800">
          <NewRequest @submitRequest="handleSubmission" />
        </el-dialog>
        <div class="left-container">
          <!-- <el-card> -->
          <!-- <el-text tag="b">Active Requests</el-text> -->
          <div class="left-table">
            <CardTable
              @selection="handleRequestData"
              :data="items"
              :module="2"
              :maxHeight="maxHeight"
              :totalItems="totalItems"
              :handleCurrentChange="handleCurrentChange"
              :currentPage="listQuery.page"
            />
          </div>
          <!-- </el-card> -->
        </div>

        <div class="right-container">
          <el-card style="flex: 1">
            <ViewRequest v-if="!createWo" v-model:data="selectedData" @create="() => (createWo = true)" />
            <!-- Maybe just route to NewWorkOrder  -->
            <NewWorkOrder
              v-if="createWo"
              :requestData="selectedData"
              :height="woHeight"
              @cancel="() => (createWo = false)"
            />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watch } from 'vue'
// import MaintenanceCardTable from '../../components/Tables/MaintenanceCardTable.vue'
import { searchMaintenanceRequests } from '../../api/requests'
import { EditPen, Search } from '@element-plus/icons-vue'
import ViewRequest from './components/ViewRequest.vue'
import NewRequest from './components/NewRequest.vue'
import NewWorkOrder from '../workOrder/components/NewWorkOrder.vue'
import CardTable from '../../components/Tables/CardTable.vue'

const items = ref( [] )
const totalItems = ref( 0 )
const dialogVisible = ref( false )
const createWo = ref( false )

const woHeight = ref( '682px' )
const maxHeight = ref( '744px' )
function updateHeight() {
  woHeight.value = window.innerWidth <= 1600 ? '465px' : '682px'
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}

onMounted( () => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateHeight )
} )

// Query parameters
const listQuery = reactive( {
  page : 1,
  limit : 10
} )

const selectedData = ref( null )
const search = ref( {} )
const keyword = ref( null )

watch(
  () => keyword.value,
  newVal => {
    search.value = { keyword : newVal }
  }
)

async function getAllRequestsData() {
  const response = await searchMaintenanceRequests( listQuery.page, listQuery.limit, 'createdAt', 'DESC', search.value )
  items.value = response.data.content
  totalItems.value = response.data.totalElements
  selectedData.value = items.value[0]
}

getAllRequestsData()

watch(
  () => search,
  newData => {
    getAllRequestsData()
  },
  { immediate : true, deep : true }
)

function handleRequestData( data ) {
  selectedData.value = data
}

const handleCurrentChange = val => {
  listQuery.page = val
  getAllRequestsData()
}

async function handleSubmission( data ) {
  if ( data ) {
    dialogVisible.value = false
  }
  await getAllRequestsData()
}
</script>

<style scoped>
.page-layout {
  display: flex;
  flex: 1 1 100vh;
  flex-direction: column;
  padding: 10px;
}

.header-title {
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

.outer-dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* padding: 5px; */
}

.dashboard-body {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.h3-header {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.h3-header h3 {
  font-size: 16px;
  padding-left: 10px;
}

.left-container {
  display: flex;
  flex-direction: column;
  /* padding: 5px; */
  justify-content: center;
  flex: 0 1 30vw;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.left-table {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

<template>
  <div class="page-layout">
    <div class="header-title">
      <div class="left-header">
        <el-input
          v-model="keyword"
          placeholder="Search Work Order"
          style="width: 240px"
          size="small"
          :prefix-icon="Search"
          clearable
        >
        </el-input>
        <el-icon style="cursor: pointer" title="Filter"><Filter /></el-icon>
      </div>

      <div class="right-header">
        <!-- Create Button -->
        <el-dropdown @command="handleCommand">
          <el-text class="el-dropdown-link" style="border: solid 1px #d5d5d5; padding: 5px">
            <el-icon><component :is="currentIcon" /></el-icon> {{ currentLabel
            }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-text>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="b"
                ><el-icon><Menu /></el-icon> Dashboard View</el-dropdown-item
              >
              <el-dropdown-item command="a"
                ><el-icon><List /></el-icon> Table View</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          class="filter-item"
          type="primary"
          :icon="EditPen"
          @click="handleCreateWorkOrder"
          :aria-label="$t('workOrder.actions.createWorkOrder')"
        >
          {{ $t('workOrder.actions.createWorkOrder') }}
        </el-button>
      </div>
    </div>

    <TableView v-if="currentView === 2" />

    <div class="dashboard-body" v-if="currentView === 1">
      <div class="left-container">
        <!-- <MaintenanceCardTable
            :items="items"
            :pageSize="pageSize"
            :module="parseInt(2)"
            @requestData="handleRequestData"
            :height="height"
            :totalItems="totalItems"
            :handleCurrentChange="handleCurrentChange"
            :currentPage="listQuery.page"
          /> -->
        <CardTable
          @selection="getSelection"
          :module="3"
          :data="items"
          :maxHeight="maxHeight"
          :totalItems="totalItems"
          :handleCurrentChange="handleCurrentChange"
          :currentPage="listQuery.page"
        />
      </div>

      <div class="right-container">
        <ViewTask
          v-if="selectedData"
          :wo="selectedData"
          :height="height"
          :personnelList="personnel"
          :supervisorList="supervisor"
        />
      </div>
    </div>
  </div>
  <el-text>{{ items }}</el-text>
</template>

<script setup>
import ViewTask from './components/ViewTask.vue'
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditPen, List, Menu, Search } from '@element-plus/icons-vue'
import router from '../../router/index'
import { searchWorkOrders } from '../../api/workorder'
import TableView from './components/TableView.vue'
import CardTable from '../../components/Tables/CardTable.vue'

const height = ref( '298px' )

const items = ref( [] )
const totalItems = ref( 0 )
const currentView = ref( 1 )

const search = ref( {
  latest_per_recurrence : false
} )

// Query parameters
const listQuery = reactive( {
  page : 1,
  limit : 10,
  sort : '-id'
} )

const selectedData = ref( null )

async function getAllWorkOrdersData() {
  const response = await searchWorkOrders( listQuery.page, listQuery.limit, 'createdAt', 'DESC', search.value )

  items.value = response.data.content
  totalItems.value = response.data.totalElements
  selectedData.value = items.value[0]
}

getAllWorkOrdersData()

const keyword = ref( null )

watch(
  () => keyword.value,
  newVal => {
    search.value.keyword = newVal
  }
)

watch(
  () => search,
  newData => {
    getAllWorkOrdersData()
  },
  { immediate : true, deep : true }
)

const maxHeight = ref( '730px' )
function updateHeight() {
  maxHeight.value = window.innerWidth <= 1600 ? '521px' : '737px'
}

onMounted( () => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateHeight )
} )

function getSelection( data ) {
  selectedData.value = data
  console.log( selectedData.value )
}

function handleCreateWorkOrder() {
  router.push( { name : 'NewWorkOrder' } )
}

const handleCurrentChange = val => {
  listQuery.page = val
  getAllWorkOrdersData()
}

// dropdown command handling
const handleCommand = command => {
  currentView.value = command === 'a' ? 2 : 1
}

const currentLabel = computed( () => {
  return currentView.value === 2 ? 'Table View' : 'Dashboard View'
} )

const currentIcon = computed( () => {
  return currentView.value === 2 ? 'List' : 'Menu'
} )

// onMounted( () => {
//   updateTableHeight()
//   window.addEventListener( 'resize', updateTableHeight )
// } )

// onBeforeUnmount( () => {
//   window.removeEventListener( 'resize', updateTableHeight )
// } )

// function updateTableHeight() {
//   const windowHeight = window.innerHeight

//   if ( windowHeight < 800 ) {
//     height.value = '297px'
//   }
// }

const personnel = reactive( [
  { id : 1, firstName : 'John', lastName : 'Andrews', assigned : 0, role : 'Technician' },
  { id : 2, firstName : 'Maria', lastName : 'Lopez', assigned : 1, role : 'Supervisor' },
  { id : 3, firstName : 'James', lastName : 'Nguyen', assigned : 0, role : 'Electrician' },
  { id : 4, firstName : 'Sara', lastName : 'Lee', assigned : 0, role : 'Technician' },
  { id : 5, firstName : 'David', lastName : 'Patel', assigned : 0, role : 'Planner' },
  { id : 6, firstName : 'Emily', lastName : 'Martinez', assigned : 0, role : 'Mechanic' },
  { id : 7, firstName : 'Brian', lastName : 'Smith', assigned : 0, role : 'Technician' },
  { id : 8, firstName : 'Olivia', lastName : 'Hernandez', assigned : 0, role : 'Electrician' },
  { id : 9, firstName : 'Daniel', lastName : 'Kim', assigned : 0, role : 'Supervisor' },
  { id : 10, firstName : 'Ava', lastName : 'Brown', assigned : 0, role : 'Planner' },
  { id : 11, firstName : 'William', lastName : 'Clark', assigned : 0, role : 'Technician' },
  { id : 12, firstName : 'Zoey', lastName : 'Duan', assigned : 1, role : 'Mechanic' },
  { id : 13, firstName : 'Logan', lastName : 'Adams', assigned : 0, role : 'Technician' },
  { id : 14, firstName : 'Chloe', lastName : 'Scott', assigned : 0, role : 'Electrician' },
  { id : 15, firstName : 'Henry', lastName : 'Green', assigned : 0, role : 'Supervisor' },
  { id : 16, firstName : 'Isabella', lastName : 'Baker', assigned : 0, role : 'Technician' },
  { id : 17, firstName : 'Erik', lastName : 'Yu', assigned : 1, role : 'Planner' },
  { id : 18, firstName : 'Lily', lastName : 'Turner', assigned : 0, role : 'Mechanic' },
  { id : 19, firstName : 'Justin', lastName : 'Tung', assigned : 1, role : 'Technician' },
  { id : 20, firstName : 'Mia', lastName : 'Parker', assigned : 0, role : 'Supervisor' }
] )

const supervisor = reactive( [
  { id : 1, firstName : 'Richard', lastName : 'Drew', assigned : 0, role : 'Supervisor' },
  { id : 2, firstName : 'Maria', lastName : 'Lopez', assigned : 0, role : 'Supervisor' },
  { id : 3, firstName : 'Yao', lastName : 'Li', assigned : 1, role : 'Supervisor' },
  { id : 9, firstName : 'Daniel', lastName : 'Kim', assigned : 0, role : 'Supervisor' },
  { id : 15, firstName : 'Henry', lastName : 'Green', assigned : 0, role : 'Supervisor' },
  { id : 20, firstName : 'Mia', lastName : 'Parker', assigned : 0, role : 'Supervisor' }
] )
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

.right-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.dashboard-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  /* background-color: lightblue; */
  /* border: solid 1px #a9a9a9; */
  /* padding: 5px; */
  /* margin-top: 5px; */
}

.left-container {
  display: flex;
  flex-direction: column;
  /* padding: 5px; */
  flex: 0 1 30vw;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* margin-left: 5px; */
  padding: 5px;
}

.sub-header {
  font-size: 14px;
  font-weight: bold;
}

@media (max-width: 1600px) {
  .page-title {
    font-size: 24px;
  }

  .header-title {
    /* height: 40px; */
    font-size: 14px;
  }
}
</style>

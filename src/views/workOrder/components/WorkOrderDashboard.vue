<template>
  <div class="page-layout">
    <div class="header-title">
      <!-- <el-text style="font-size: 20px; color: #181818">Work Order Dashboard</el-text> -->
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

    <div class="dashboard-body">
      <div class="left-container">
        <el-card style="flex: 1">
          <el-text tag="b">Work Orders Due Today (5)</el-text>
          <MaintenanceCardTable
            style="flex: 1"
            :items="items"
            :pageSize="pageSize"
            :module="parseInt(1)"
            :height="height"
            :totalItems="totalItems"
            :handleCurrentChange="handleCurrentChange"
            :currentPage="listQuery.page"
          />
        </el-card>
      </div>
      <div class="right-container">
        <div class="pie-chart-container">
          <PieChart :chartData="grouped" chartTitle="Work Orders by Priority" />
          <PieChart :chartData="groupedStates" chartTitle="Work Orders by State" />
        </div>
        <div class="right-table">
          <el-card>
            <el-text tag="b">Incomplete Work Orders</el-text>
            <MaintenanceCardTable
              :items="incompleteItems"
              :pageSize="incompletePageSize"
              :module="parseInt(1)"
              :height="height2"
              :totalItems="incompleteTotalItems"
              :handleCurrentChange="handleCurrentChangeIncomplete"
              :currentPage="incompleteListQuery.page"
            />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { workOrders, priorities, states } from '../../../utils'
import { ref, reactive } from 'vue'
import PieChart from '../../../components/Charts/PieChart.vue'
import MaintenanceCardTable from '../../../components/Tables/MaintenanceCardTable.vue'
import { searchWorkOrders } from '../../../api/workorder'

const height = ref( '300px' )
const height2 = ref( '540px' )

const items = ref( [] )
const incompleteItems = ref( [] )
const grouped = ref( [] )
const groupedStates = ref( [] )
const totalItems = ref( 0 )
const incompleteTotalItems = ref( 0 )

const selectedData = ref( null )

// Query parameters
const listQuery = reactive( {
  page : 1,
  limit : 10,
  sort : '-id'
} )

const incompleteListQuery = reactive( {
  page : 1,
  limit : 5,
  sort : '-id'
} )

async function getAllWorkOrdersData() {
  const response = await searchWorkOrders( listQuery.page, listQuery.limit, 'createdAt', 'DESC' )
  const incompleteResponse = await searchWorkOrders(
    incompleteListQuery.page,
    incompleteListQuery.limit,
    'createdAt',
    'DESC'
  )

  items.value = response.data.content
  incompleteItems.value = incompleteResponse.data.content
  totalItems.value = response.data.totalElements
  incompleteTotalItems.value = incompleteResponse.data.totalElements
  selectedData.value = items.value[0]

  // Group by priority
  const priorityMap = {}
  const stateMap = {}

  for ( const wo of items.value ) {
    if ( wo.status === 1 ) {
      // Priority
      const pid = wo.priority.id
      if ( !priorityMap[pid] ) {
        priorityMap[pid] = { value : 0, name : wo.priority.name }
      }
      priorityMap[pid].value += 1

      // State
      const sid = wo.state.id
      if ( !stateMap[sid] ) {
        stateMap[sid] = { value : 0, name : wo.state.name }
      }
      stateMap[sid].value += 1
    }
  }

  grouped.value = Object.values( priorityMap )
  groupedStates.value = Object.values( stateMap )
  console.log( 'GROUPED VALUE: ', grouped.value )
}

getAllWorkOrdersData()

const handleCurrentChange = val => {
  listQuery.page = val
  getAllWorkOrdersData()
}

const handleCurrentChangeIncomplete = val => {
  incompleteListQuery.page = val
  getAllWorkOrdersData()
}

const pageSize = 10
const incompletePageSize = 5
</script>

<style scoped>
.page-layout {
  display: flex;
  flex: 100vh;
  flex-direction: column;
  padding: 10px;
}

.header-title {
  margin-right: 12px;
  line-height: 32px;
  flex-direction: row;
  justify-content: flex-end;
  display: flex;
}

.dashboard-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  /* background-color: lightblue; */
  /* border: solid 1px #a9a9a9; */
  border-radius: 10px;
  padding: 5px;
  /* margin-top: 10px; */
}

.left-container {
  display: flex;
  flex-direction: column;
  padding: 5px;
  flex: 0 0 30vw;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* margin-left: 5px; */
  padding: 5px;
}

.pie-chart-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  border: solid 1px rgb(212, 212, 212);
  border-radius: 10px;
  flex: 0 1;
  margin-bottom: 10px;
}

.sub-header {
  font-size: 14px;
  font-weight: bold;
}

@media (max-width: 1600px) {
  .page-title {
    font-size: 24px;
  }

  .left-container,
  .right-container {
    padding: 4px;
    /* margin-left: 5px; */
  }

  .left-container {
    flex: 0 1 35vw;
  }

  .pie-chart-container {
    height: 290px;
  }

  .sub-header {
    font-size: 14px;
  }
}
</style>

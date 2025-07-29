<template>
  <div class="t2-tasks-container">
    <el-descriptions :column="1" direction="vertical">
      <el-descriptions-item label="Task Library">
        <MaintenanceCardTable
          :items="taskData"
          :pageSize="6"
          :module="4"
          @requestData="handleRequestData"
          :height="'405px'"
          :totalItems="taskData.length"
          :handleCurrentChange="handleTaskCurrentChange"
          :currentPage="taskListQuery.page"
        />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import MaintenanceCardTable from '../../../../components/Tables/MaintenanceCardTable.vue'

const selectedData = ref( null )

// Task Library data (for module 4)
const taskData = ref( [
  { id : 1, title : 'Fix Bug #12', description : 'Fix the UI layout issue on login page.' },
  { id : 2, title : 'Write Tests', description : 'Add unit tests for user service.' },
  { id : 3, title : 'Code Review', description : 'Review pull request #42.' },
  { id : 4, title : 'Deploy Update', description : 'Deploy v1.3 to staging environment.' },
  { id : 5, title : 'Write Docs', description : 'Update README with new API usage.' },
  { id : 6, title : 'Schedule Meeting', description : 'Book sync-up with frontend team.' },
  { id : 7, title : 'Fix Lint Errors', description : 'Resolve ESLint issues in dashboard module.' },
  { id : 8, title : 'Add Feature Flag', description : 'Introduce dark mode toggle for beta users.' }
] )

// Configuration for Task Library table
const taskListQuery = reactive( {
  page : 1,
  limit : 6
} )

// Event handlers
function handleRequestData( data ) {
  selectedData.value = data
  console.log( 'Selected data:', selectedData.value )
}

function handleTaskCurrentChange( page ) {
  taskListQuery.page = page
  console.log( 'Task library current page changed to:', page )
  // Here you would typically fetch new task data based on the page
  // fetchTaskData(page)
}

// Optional: Method to fetch task data (if needed)
// async function fetchTaskData(page) {
//   try {
//     const response = await api.getTaskLibraryItems({ page, limit: 6 })
//     taskData.value = response.data
//   } catch (error) {
//     console.error('Failed to fetch task data:', error)
//   }
// }
</script>

<style scoped>
.t2-tasks-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

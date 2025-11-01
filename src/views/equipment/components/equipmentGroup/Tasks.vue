<template>
  <div class="t2-tasks-container">
    <!-- ✅ Show Task Library section only if there are tasks -->
    <el-descriptions v-if="taskData.length > 0" :column="1" direction="vertical">
      <el-descriptions-item>
        <TaskCardTable
          :items="taskData"
          :pageSize="pageSize"
          :totalItems="totalItems"
          :currentPage="page"
          :loading="loading"
          @page-change="handleTaskCurrentChange"
          @requestData="handlePick"
          @search="handleSearch"
        />
      </el-descriptions-item>
    </el-descriptions>

    <!-- ❌ If no tasks, show this simple text only -->
    <div v-else class="no-task-text">No related task available</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import TaskCardTable from '../equipmentGroup/components/TaskCardTable.vue'
import { searchTaskTemplates } from '@/api/task-library'

const props = defineProps( {
  equipmentId : { type : [Number, String], required : false }
} )

const loading = ref( false )
const taskData = ref( [] )
const totalItems = ref( 0 )
const page = ref( 1 )
const pageSize = ref( 6 )
const searchText = ref( '' )

async function fetchTasks() {
  loading.value = true
  try {
    const eq = props.equipmentId != null && props.equipmentId !== '' ? Number( props.equipmentId ) : null
    const filter = {
      latest_per_recurrence : false,
      ...( eq ? { equipment_node_ids : [eq] } : {} )
    }
    if ( searchText.value ) filter.keyword = searchText.value

    const res = await searchTaskTemplates( page.value, pageSize.value, 'createdAt', 'DESC', filter )
    const root = res?.data
    const content =
      root?.data?.content ?? root?.content ?? root?.records ?? root?.rows ?? root?.list ?? root?.items ?? []
    taskData.value = content
    totalItems.value = Number( root?.data?.totalElements ?? root?.totalElements ?? content.length )
  } catch ( e ) {
    console.error( 'fetchTasks error:', e )
    taskData.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

function handleTaskCurrentChange( p ) {
  page.value = p
  fetchTasks()
}

function handlePick( row ) {
  console.log( 'Picked task template:', row )
}

function handleSearch( q ) {
  searchText.value = q || ''
  page.value = 1
  fetchTasks()
}

onMounted( fetchTasks )
watch(
  () => props.equipmentId,
  () => {
    page.value = 1
    fetchTasks()
  }
)
</script>

<style scoped>
.t2-tasks-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.no-task-text {
  text-align: left;
  color: #999;
  font-size: 14px;
  padding: 10px 0;
}
</style>

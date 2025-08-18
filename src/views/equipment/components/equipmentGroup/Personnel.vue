<template>
  <div class="t2-personnel-container">
    <div class="table">
      <el-descriptions :column="1" direction="vertical">
        <el-descriptions-item label="Associated Personnel Work Order Statistics">
          <div class="search-bar">
            <el-input v-model="searchQuery" placeholder="Search by Name..." clearable prefix-icon="el-icon-search" />
          </div>
          <div class="table-wrapper">
            <el-table
              :data="paginatedData"
              :default-sort="{ prop: 'active', order: 'descending' }"
              style="width: 100%"
              height="calc(100vh - 395px)"
            >
              <el-table-column prop="name" label="Name" sortable />
              <el-table-column prop="active" label="Active" sortable />
              <el-table-column prop="complete" label="Complete" sortable />
              <el-table-column prop="failed" label="Failed" sortable />
              <el-table-column prop="incomplete" label="Incomplete" sortable />
              <el-table-column prop="total" label="Total" sortable />
            </el-table>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="filteredData.length"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref( '' )
const currentPage = ref( 1 )
const pageSize = ref( 15 )

// Random Data
const tableData = ref(
  Array.from( { length : 22 }, ( _, i ) => {
    const names = [
      'Alice',
      'Bob',
      'Charlie',
      'Diana',
      'Eve',
      'Frank',
      'Grace',
      'Hank',
      'Ivy',
      'Jake',
      'Kate',
      'Leo',
      'Mona',
      'Nina',
      'Owen',
      'Paul'
    ]
    const name = names[i % names.length]
    const active = Math.floor( Math.random() * 5 )
    const complete = Math.floor( Math.random() * 20 )
    const failed = Math.floor( Math.random() * 3 )
    const incomplete = Math.floor( Math.random() * 5 )
    const total = active + complete + failed + incomplete

    return {
      name,
      active,
      complete,
      failed,
      incomplete,
      total
    }
  } )
)

const filteredData = computed( () => {
  if ( !searchQuery.value.trim() ) return tableData.value
  return tableData.value.filter( row => row.name.toLowerCase().includes( searchQuery.value.toLowerCase() ) )
} )

const paginatedData = computed( () => {
  const start = ( currentPage.value - 1 ) * pageSize.value
  return filteredData.value.slice( start, start + pageSize.value )
} )

function handlePageChange( page ) {
  currentPage.value = page
}
</script>

<style scoped>
.t2-personnel-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.table {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.search-bar {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
</style>

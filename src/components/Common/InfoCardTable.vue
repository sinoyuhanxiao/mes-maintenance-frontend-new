<template>
  <div class="info-card-table-container">
    <div class="search-bar">
      <el-input v-model="searchQuery" placeholder="Search by Task Title..." clearable prefix-icon="el-icon-search" />
    </div>
    <div class="card-scroll-container">
      <el-row :gutter="0">
        <el-col v-for="item in paginatedData" :key="item.id" :xs="24" :sm="24" :md="24" :lg="24">
          <EquipmentTaskCard :item="item" />
        </el-col>
      </el-row>
    </div>
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="cardsPerPage"
        :total="filteredData.length"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EquipmentTaskCard from './EquipmentTaskCard.vue'
import { ElRow, ElCol, ElPagination, ElInput } from 'element-plus'

const props = defineProps( {
  data : {
    type : Array,
    default : () => []
  },
  rows : {
    type : Number,
    default : 2
  },
  heightOffset : {
    type : String,
    default : '350px'
  }
} )

const currentPage = ref( 1 )
const searchQuery = ref( '' )

const cardsPerPage = computed( () => props.rows * 1 )

const filteredData = computed( () => {
  if ( !searchQuery.value.trim() ) return props.data
  return props.data.filter( item => item.title.toLowerCase().includes( searchQuery.value.toLowerCase() ) )
} )

const paginatedData = computed( () => {
  const start = ( currentPage.value - 1 ) * cardsPerPage.value
  return filteredData.value.slice( start, start + cardsPerPage.value )
} )

function handlePageChange( page ) {
  currentPage.value = page
}
</script>

<style scoped>
.info-card-table-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.search-bar {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.card-scroll-container {
  height: calc(100vh - v-bind(heightOffset));
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 10px;
  background-color: #fff;
  min-height: 0;
}

.pagination-wrapper {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
</style>

<template>
  <div class="table-container">
    <div class="search-container">
      <!-- <i class="fa-solid fa-magnifying-glass"></i> -->
      <el-button v-if="searchActive === false" @click="handleSearchOption" size="small" :icon="Search" round
        >Search</el-button
      >
      <input
        v-if="searchActive === true"
        :placeholder="searchPlaceholder"
        style="border: solid 1px #d5d5d5; border-radius: 5px; width: 100%"
      />
      <el-button v-if="searchActive === true" @click="handleSearchOption" size="small" :icon="Close" round
        >Cancel</el-button
      >
    </div>
    <div class="card-scroll-container">
      <el-row :gutter="0">
        <el-col v-for="wo in items" :key="wo.id" :xs="24" :sm="24" :md="24" :lg="24">
          <!-- <h5>{{ wo }}</h5> -->
          <MaintenanceWorkOrderCard
            v-if="module === 1 || module === 2"
            :wo="wo"
            :module="module"
            @requestData="handleRequestData"
          />
          <MaintenanceRequestCard v-if="module === 3" :wo="wo" @requestData="handleRequestData" />
          <MaintenanceSparePartCard v-else-if="module === 5" :item="wo" />
        </el-col>
      </el-row>
    </div>
    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalItems"
      :pager-count="3"
      @current-change="handleCurrentChange"
      class="pagination"
    />
  </div>
  <!-- <h1>{{ paginatedItems }}</h1> -->
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MaintenanceWorkOrderCard from './Cards/MaintenanceWorkOrderCard.vue'
import MaintenanceRequestCard from './Cards/MaintenanceRequestCard.vue'
import MaintenanceSparePartCard from './Cards/MaintenanceSparePartCard.vue'
import { Search, Close } from '@element-plus/icons-vue'

const props = defineProps({
  items: Object,
  pageSize: Number,
  searchable: Boolean,
  module: Number,
  height: String,
  totalItems: Number,
  handleCurrentChange: Function,
  currentPage: Number,
})

const searchActive = ref(false)

const searchPlaceholder = computed(() => {
  if (props.module == 1 || props.module == 2) {
    return 'Search Work Orders'
  } else if (props.module == 3) {
    return 'Search Requests'
  }
  return 'Search Work Orders'
})

const items = ref(props.items)

watch(
  () => props.items,
  newItems => {
    items.value = newItems
    console.log('Updated items:', items.value)
  },
  { immediate: true, deep: true }
)

const pageSize = ref(props.pageSize)

const emit = defineEmits(['requestData'])

function handleRequestData(data) {
  emit('requestData', data)
}

function handleSearchOption() {
  if (searchActive.value == true) {
    searchActive.value = false
  } else {
    searchActive.value = true
  }
}
</script>

<style scoped>
.search-container {
  /* border-bottom: solid 1px darkgray; */
  padding: 5px;
  flex: 0 0 30px;
  display: flex;
  flex-direction: row;
}

.search-container input {
  margin-right: 5px;
  padding-left: 5px;
  border-style: none;
  margin-top: 0;
  width: 100%;
}

.search-container .el-button {
  margin-top: 3px;
}

.search-container i {
  color: darkgray;
  margin-top: 5px;
}

.table-container {
  /* border: solid 1px darkgray; */
  border-radius: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.card-scroll-container {
  flex: 1 1 calc(100vh - v-bind(height));
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  /* border: 1px solid #dcdfe6; */
  border-radius: 8px;
  box-sizing: border-box;
  background-color: white;
  padding: 5px;
  min-height: 0;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

@media (max-width: 1600px) {
  .card-scroll-container {
    display: flex;
    flex-direction: column;
    flex: 1 1 calc(100vh - v-bind(height));
    /* height: calc(100vh - 550px); */
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    box-sizing: border-box;
    background-color: #fff;
    /* margin: 5px; */
    padding: 5px;
  }

  .table-container {
    flex: 1;
  }
}
</style>

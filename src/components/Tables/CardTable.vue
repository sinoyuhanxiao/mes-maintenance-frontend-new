<template>
  <div class="card-table-wrapper">
    <!-- Search Bar -->
    <div v-if="showSearch" class="search-container">
      <el-input v-model="searchQuery" :placeholder="searchPlaceholder" size="default" clearable class="search-input">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <div class="card-scroll-container" :class="{ 'with-border': showBorder }">
      <el-row :gutter="0">
        <el-col v-for="sp in filteredData" :key="sp.id" :xs="24" :sm="24" :md="24" :lg="24">
          <Card v-if="props.module === 1" :data="sp" @selection="handleSelection" />
          <MaintenanceRequestCard v-if="props.module === 2" :data="sp" @selection="handleSelection" />
          <MaintenanceWorkOrderCard v-if="props.module === 3" :wo="sp" @requestData="handleSelection" :module="2" />
          <MaintenanceSelectedTaskCard v-if="props.module === 4" :template="sp" @selection="handleSelection" />
          <AddNewTaskCard v-if="props.module === 5" :template="sp" @selection="handleSelection" />
          <MaintenanceSelectedStandardsCard v-if="props.module === 6" :template="sp" @selection="handleSelection" />
          <AddNewStandardCard v-if="props.module === 7" :template="sp" @selection="handleSelection" />
        </el-col>
      </el-row>

      <!-- No results message -->
      <div v-if="filteredData.length === 0 && searchQuery" class="no-results">
        <el-empty description="No items found matching your search" :image-size="80" />
      </div>
    </div>

    <el-pagination
      v-if="showPagination"
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalItems"
      :pager-count="3"
      @current-change="handleCurrentChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import Card from '@/views/resources/components/Card.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import MaintenanceRequestCard from './Cards/MaintenanceRequestCard.vue'
import MaintenanceWorkOrderCard from './Cards/MaintenanceWorkOrderCard.vue'
import MaintenanceSelectedTaskCard from './Cards/MaintenanceSelectedTaskCard.vue'
import AddNewTaskCard from './Cards/AddNewTaskCard.vue'
import MaintenanceSelectedStandardsCard from './Cards/MaintenanceSelectedStandardsCard.vue'
import AddNewStandardCard from './Cards/AddNewStandardCard.vue'

const props = defineProps( {
  module : Number,
  data : Object,
  maxHeight : String,
  totalItems : Number,
  handleCurrentChange : Function,
  currentPage : Number,
  selectedItems : {
    type : Set,
    default : () => new Set()
  },
  pageSize : {
    type : Number,
    default : 10
  },
  showBorder : {
    type : Boolean,
    default : false
  },
  showPagination : {
    type : Boolean,
    default : true
  },
  showSearch : {
    type : Boolean,
    default : true
  },
  searchPlaceholder : {
    type : String,
    default : 'Search items...'
  },
  searchFields : {
    type : Array,
    default : () => ['name', 'category', 'description']
  }
} )

const height = ref( props.maxHeight )
const searchQuery = ref( '' )

function updateHeight() {
  height.value = window.innerWidth <= 1600 ? '465px' : props.maxHeight
}

onMounted( () => {
  updateHeight()
  window.addEventListener( 'resize', updateHeight )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', updateHeight )
} )

const emit = defineEmits( ['selection'] )

// Computed property to filter data based on search query
const filteredData = computed( () => {
  if ( !searchQuery.value || !props.data ) {
    return props.data || []
  }

  const query = searchQuery.value.toLowerCase().trim()

  return props.data.filter( item => {
    return props.searchFields.some( field => {
      const value = item[field]
      if ( typeof value === 'string' ) {
        return value.toLowerCase().includes( query )
      }
      if ( typeof value === 'number' ) {
        return value.toString().includes( query )
      }
      return false
    } )
  } )
} )

function handleSelection( data ) {
  emit( 'selection', data )
}
</script>

<style scoped>
.card-table-wrapper {
  width: 100%;
}

.search-container {
  margin-bottom: 10px;
}

.search-input {
  max-width: 400px;
}

.card-scroll-container {
  height: v-bind(maxHeight);
  overflow-y: auto;
  padding: 5px;
  border-radius: 6px;
}

.card-scroll-container.with-border {
  border: 1px solid #e4e7ed;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--el-text-color-secondary);
}

.pagination {
  margin-top: 5px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
</style>

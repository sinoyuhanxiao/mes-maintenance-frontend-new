<template>
  <div class="card-table-wrapper">
    <!-- Search Bar -->
    <div v-if="showSearch" class="search-container">
      <el-input v-model="searchQuery" :placeholder="searchPlaceholder" size="default" clearable class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="card-scroll-container" :class="{ 'with-border': showBorder }">
      <el-row :gutter="0" style="gap: 0.5rem">
        <el-col v-for="(sp, idx) in filteredData" :key="sp.id" :xs="24" :sm="24" :md="24" :lg="24">
          <MaintenanceResourceCard
            v-if="props.module === 1"
            :data="sp"
            :isSelected="sp.id === selectedId"
            @selection="() => emitSelection(sp, idx)"
          />
          <MaintenanceRequestCard
            v-if="props.module === 2"
            :data="sp"
            :isSelected="sp.id === selectedId"
            @selection="() => emitSelection(sp, idx)"
          />
          <MaintenanceWorkOrderCard
            v-if="props.module === 3"
            :wo="sp"
            :isSelected="sp.id === selectedId"
            @requestData="() => emitSelection(sp, idx)"
            :module="2"
          />
          <MaintenanceSelectedTaskCard
            v-if="props.module === 4"
            :template="sp"
            :isSelected="sp.id === selectedId"
            @selection="() => emitSelection(sp, idx)"
          />
          <AddNewTaskCard
            v-if="props.module === 5"
            :template="sp"
            :isSelected="sp.id === selectedId"
            @selection="() => emitSelection(sp, idx)"
          />
          <MaintenanceSelectedStandardsCard
            v-if="props.module === 6"
            :template="sp"
            :isSelected="sp.id === selectedId"
            @selection="() => emitSelection(sp, idx)"
          />
          <AddNewStandardCard
            v-if="props.module === 7"
            :template="sp"
            :isSelected="sp.id === selectedId"
            @selection="() => emitSelection(sp, idx)"
          />
        </el-col>
      </el-row>

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
      @current-change="onCurrentChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import MaintenanceResourceCard from '@/views/resources/components/MaintenanceResourceCard.vue'
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
  currentPage : Number,
  selectedId : { type : [Number, String, null], default : null },
  pageSize : { type : Number, default : 10 },
  showBorder : { type : Boolean, default : false },
  showPagination : { type : Boolean, default : true },
  showSearch : { type : Boolean, default : true },
  searchPlaceholder : { type : String, default : 'Search items...' },
  searchFields : { type : Array, default : () => ['name', 'category', 'description'] },
  focusedCardId : { type : [String, Number], default : null },

  // ✅ function props coming from parent
  handleCurrentChange : { type : Function, default : null },
  handleSizeChange : { type : Function, default : null }
} )

const emit = defineEmits( ['selection'] )

const searchQuery = ref( '' )
const height = ref( props.maxHeight )

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

const filteredData = computed( () => {
  if ( !searchQuery.value || !props.data ) return props.data || []
  const query = searchQuery.value.toLowerCase().trim()
  return props.data.filter( item =>
    props.searchFields.some( field => {
      const value = item[field]
      if ( typeof value === 'string' ) return value.toLowerCase().includes( query )
      if ( typeof value === 'number' ) return value.toString().includes( query )
      return false
    } )
  )
} )

function emitSelection( sp, idx ) {
  emit( 'selection', { ...sp, index : idx } )
}

// ✅ delegate pagination event to parent’s function prop
function onCurrentChange( p ) {
  props.handleCurrentChange && props.handleCurrentChange( p )
}
// If you later add sizes:
// function onSizeChange(s) {
//   props.handleSizeChange && props.handleSizeChange(s)
// }
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

/* CardTable.vue */
.card-scroll-container {
  height: v-bind(height);
  overflow-y: scroll; /* reserve scrollbar width always */
  padding-right: 8px; /* content doesn’t hug the bar */
  border-radius: 6px;
}

/* if you prefer modern behavior instead: */
/*
.card-scroll-container {
  height: v-bind(height);
  overflow-y: auto;
  scrollbar-gutter: stable both-edges;
  padding-right: 8px;
}
@supports not (scrollbar-gutter: stable) {
  .card-scroll-container { overflow-y: scroll; }
}
*/

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

<template>
  <div class="search-table">
    <el-table :data="tableRows" :max-height="240" style="width: 100%" :empty-text="emptyText">
      <el-table-column v-for="col in columns" :key="col.prop || col.label" :label="col.label" :prop="col.prop" />
      <el-table-column v-if="enableSearch" align="right">
        <template #header>
          <el-input
            v-model="internalSearch"
            size="default"
            placeholder="Search"
            clearable
            @clear="onSearchClear"
            @input="onSearchInput"
            @keyup.enter="onSearchEnter"
          />
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 8px; display: flex; justify-content: flex-end">
      <!-- Server-side pagination -->
      <el-pagination
        v-if="useServer"
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        :small="true"
        @current-change="$emit('update:page', $event)"
      />
      <!-- Client-side pagination -->
      <el-pagination
        v-else
        layout="total, prev, pager, next"
        :total="filteredData.length"
        :page-size="clientPageSize"
        v-model:current-page="clientPage"
        :small="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'

const props = defineProps( {
  data : { type : Array, default : () => [] },
  columns : { type : Array, default : () => [] },
  enableSearch : { type : Boolean, default : true },

  /* ---- Server-side mode inputs (optional) ---- */
  // When these are provided (esp. total > 0), we switch to server mode
  total : { type : Number, default : 0 },
  page : { type : Number, default : 1 },
  pageSize : { type : Number, default : 5 },

  // v-model:search for server-side search (optional)
  search : { type : String, default : '' },

  /* ---- Client-side mode options ---- */
  emptyText : { type : String, default : 'No data found' },
  clientPageSize : { type : Number, default : 5 },
  // If you still want local filtering even in server mode, set this to true.
  clientFilterFallback : { type : Boolean, default : false }
} )

const emit = defineEmits( ['update:search', 'update:page'] )

/* Decide mode: server if pagination is controlled by parent (total provided) */
const useServer = computed( () => props.total > 0 )

/* ----- Search handling ----- */
const internalSearch = ref( props.search )
watch(
  () => props.search,
  v => {
    if ( v !== internalSearch.value ) internalSearch.value = v
  }
)

let debounceTimer = null
const emitSearch = val => emit( 'update:search', val )
const onSearchInput = () => {
  // Always tell parent about the new value (debounced)
  clearTimeout( debounceTimer )
  debounceTimer = setTimeout( () => emitSearch( internalSearch.value ), 250 )
  // Client mode continues to work because local filtering uses internalSearch
}
const onSearchEnter = () => {
  emitSearch( internalSearch.value )
  // client mode: reset page handled below
}
const onSearchClear = () => {
  internalSearch.value = ''
  emitSearch( '' )
}

/* ----- SearchTable Client-side mode: local filter + pagination ----- */
const clientPage = ref( 1 )
watch( internalSearch, () => {
  if ( !useServer.value ) clientPage.value = 1
} )
watch(
  () => props.data,
  () => {
    if ( !useServer.value ) clientPage.value = 1
  }
)

const filteredData = computed( () => {
  if ( !props.enableSearch ) return props.data
  const q = internalSearch.value.trim().toLowerCase()
  if ( !q ) return props.data

  // If server mode AND not using fallback, do not filter locally.
  if ( useServer.value && !props.clientFilterFallback ) return props.data

  return props.data.filter( row =>
    Object.values( row ?? {} ).some( val =>
      String( val ?? '' )
        .toLowerCase()
        .includes( q )
    )
  )
} )

const pagedData = computed( () => {
  const start = ( clientPage.value - 1 ) * props.clientPageSize
  return filteredData.value.slice( start, start + props.clientPageSize )
} )

/* ----- Table rows presented ----- */
const tableRows = computed( () => ( useServer.value ? props.data : pagedData.value ) )
</script>

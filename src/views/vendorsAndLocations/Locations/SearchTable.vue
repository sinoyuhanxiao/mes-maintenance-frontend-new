<template>
  <div class="search-table">
    <el-table :data="pagedData" :max-height="240" style="width: 100%" empty-text="No data found">
      <el-table-column v-for="col in columns" :key="col.prop" :label="col.label" :prop="col.prop" />
      <el-table-column v-if="enableSearch" align="right">
        <template #header>
          <el-input v-model="search" size="default" placeholder="Search" clearable @keyup.enter="page = 1" />
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 8px; display: flex; justify-content: flex-end">
      <el-pagination
        layout="total, prev, pager, next"
        :total="filteredData.length"
        :page-size="pageSize"
        v-model:current-page="page"
        :small="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, watch } from 'vue'

const props = defineProps( {
  data : { type : Array, default : () => [] },
  columns : { type : Array, default : () => [] },
  enableSearch : { type : Boolean, default : true }
} )

const pageSize = 5
const page = ref( 1 )
const search = ref( '' )

const filteredData = computed( () => {
  if ( !props.enableSearch ) return props.data
  const q = search.value.trim().toLowerCase()
  if ( !q ) return props.data
  return props.data.filter( row =>
    Object.values( row ).some( val =>
      String( val ?? '' )
        .toLowerCase()
        .includes( q )
    )
  )
} )

watch( search, () => {
  page.value = 1
} )
watch(
  () => props.data,
  () => {
    page.value = 1
  }
)

const pagedData = computed( () => {
  const start = ( page.value - 1 ) * pageSize
  return filteredData.value.slice( start, start + pageSize )
} )
</script>

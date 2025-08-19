<template>
  <div class="header">
    <el-input
      v-model="search.keyword"
      placeholder="Search Vendor"
      style="width: 240px"
      size="small"
      :prefix-icon="Search"
      clearable
    >
    </el-input>
  </div>
  <!-- <el-text>{{ search }}</el-text> -->
  <el-dialog v-model="dialogVisible"
title="Add Parts Vendor"
width="800"
    ><AddSPVendor :vendor="selectedVendor"
:sparePart="props.sparePart"
@addVendor="handleAddVendor"
  /></el-dialog>
  <el-card>
    <div class="card-scroll-container">
      <el-row :gutter="0" style="gap: 0.5rem">
        <el-col v-for="v in vendors" :key="v.id" :xs="24" :sm="24" :md="24" :lg="24">
          <VendorCard :data="v" :spData="null" @new="handleEmit(v)" />
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { searchVendors } from '../../../../api/vendor'
import VendorCard from './VendorCard.vue'
import AddSPVendor from './AddSPVendor.vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps( {
  data : Array, // assuming data is an array of vendors
  sparePart : Object
} )

const vendors = ref( [] )

const selectedVendor = ref( null )

const dialogVisible = ref( false )

const search = ref( {
  keyword : null
} )

const emit = defineEmits( ['addVendor'] )

const existingVendorIds = computed( () => new Set( ( props.data || [] ).map( v => v.id ) ) )

async function getAllVendorsData() {
  const response = await searchVendors( 1, 50, 'name', 'ASC', search.value )
  console.log( search.value )
  vendors.value = response.data.content.filter( item => !existingVendorIds.value.has( item.id ) )
}

// Re-fetch vendors whenever props.data changes
watch(
  () => props.data,
  () => {
    getAllVendorsData()
  },
  { deep : true }
)

getAllVendorsData()

watch(
  () => search.value,
  () => {
    getAllVendorsData()
  },
  { deep : true }
)

function handleEmit( data ) {
  selectedVendor.value = data
  dialogVisible.value = true
}

function handleAddVendor() {
  dialogVisible.value = false
  emit( 'addVendor' )
}
</script>

<style scoped>
.header {
  margin-bottom: 10px;
}
.card-scroll-container {
  height: 555px;
  overflow-y: auto;
  padding: 5px;
}

@media (max-width: 1600px) {
  .card-scroll-container {
    height: 385px;
    overflow-y: auto;
    padding: 5px;
  }
}
</style>

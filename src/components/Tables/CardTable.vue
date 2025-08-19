<template>
  <div class="card-scroll-container">
    <el-row :gutter="0" style="gap: 0.5rem">
      <el-col v-for="sp in props.data" :key="sp.id" :xs="24" :sm="24" :md="24" :lg="24">
        <Card v-if="props.module === 1" :data="sp" @selection="handleSelection" />
        <MaintenanceRequestCard v-if="props.module === 2" :data="sp" @selection="handleSelection" />
        <MaintenanceWorkOrderCard v-if="props.module === 3" :wo="sp" @requestData="handleSelection" :module="2" />
      </el-col>
    </el-row>
  </div>
  <el-pagination
    layout="prev, pager, next"
    :current-page="currentPage"
    :page-size="pageSize"
    :total="totalItems"
    :pager-count="3"
    @current-change="handleCurrentChange"
    class="pagination"
  />
</template>

<script setup>
import Card from '@/views/resources/components/Card.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MaintenanceRequestCard from './Cards/MaintenanceRequestCard.vue'
import MaintenanceWorkOrderCard from './Cards/MaintenanceWorkOrderCard.vue'

// set up data as a prop later to make the card list dynamic
const props = defineProps( {
  module : Number,
  data : Object,
  maxHeight : String,
  totalItems : Number,
  handleCurrentChange : Function,
  currentPage : Number
} )

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

const emit = defineEmits( ['selection'] )

function handleSelection( data ) {
  const index = props.data.findIndex( sp => sp.id === data.id )
  data.index = index
  emit( 'selection', data )
}
</script>

<style scoped>
.card-scroll-container {
  height: v-bind(maxHeight);
  overflow-y: auto;
  padding: 5px;
}

.pagination {
  margin-top: 5px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

/* @media (max-width: 1600px) {
  .card-scroll-container {
    height: 555px;
  }
} */
</style>

<template>
  <el-dialog v-model="viewDetails" title="Part Vendor Details" width="800"
    ><DeleteSPVendor :spvData="spvData" :sparePart="props.data" @deletedVendor="handleDeleteVendor"
  /></el-dialog>
  <div class="title">
    <el-text>Associated Vendors ({{ currentVendors.length }})</el-text>
    <el-button @click="dialogVisible = true">Add Vendor</el-button>
  </div>
  <el-dialog v-model="dialogVisible" title="Vendors" width="800">
    <VendorList @removal="handleRemoval" :data="vendorsOnly" :sparePart="props.data" @addVendor="handleAddVendor" />
  </el-dialog>
  <div class="card-scroll-container">
    <el-row :gutter="0" style="gap: 0.5rem">
      <el-col v-for="v in currentVendors" :key="v.id" :xs="24" :sm="24" :md="24" :lg="24">
        <VendorCard :data="v.vendor" :spData="v" @existing="handleEmit(v)" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VendorList from './VendorList.vue'
import VendorCard from './VendorCard.vue'
import DeleteSPVendor from './DeleteSPVendor.vue'

const props = defineProps({
  data: Object,
})

const emit = defineEmits(['refreshData'])
const dialogVisible = ref(false)
const viewDetails = ref(false)

const currentVendors = ref([])

const vendorsOnly = ref(null)

const spvData = ref(null)

watch(
  () => props.data,
  newVal => {
    currentVendors.value = newVal.spare_part_vendors
    vendorsOnly.value = currentVendors.value.map(item => item.vendor)
  },
  { deep: true }
)

function handleAddVendor() {
  dialogVisible.value = false
  emit('refreshData')
}

function handleDeleteVendor() {
  viewDetails.value = false
  emit('refreshData')
}

function handleEmit(data) {
  spvData.value = data
  viewDetails.value = true
}
</script>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-scroll-container {
  height: 582px;
  overflow-y: auto;
  padding: 5px;
}

@media (max-width: 1600px) {
  .card-scroll-container {
    height: 367px;
    overflow-y: auto;
    padding: 5px;
  }
}
</style>

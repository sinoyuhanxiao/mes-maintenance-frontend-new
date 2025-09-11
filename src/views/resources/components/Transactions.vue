<template>
  <div class="title">
    <el-text>Transaction Logs ({{ logs.length }})</el-text>
  </div>
  <div class="main-container-t">
    <el-table :data="logs" :key="logs.length" style="width: 100%; height: 100%" border>
      <el-table-column fixed prop="transaction_type.name" label="Transaction Type" width="180" />
      <el-table-column prop="from_inventory.batch_number" label="From Batch" width="180" />
      <el-table-column prop="to_inventory.batch_number" label="To Batch" width="180" />
      <el-table-column prop="from_location.name" label="From Location" width="180" />
      <el-table-column prop="to_location.name" label="To Location" width="180" />
      <el-table-column prop="quantity_change" label="Quantity Change" width="150" />
      <el-table-column prop="remark" label="Remark" width="150" />
      <el-table-column label="Allocated At" width="180">
        <template #default="{ row }">
          {{ convertToLocalTime(row.allocated_at) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { searchInventoryTransactionLogs } from '../../../api/resources'
import { watch, ref } from 'vue'
import { convertToLocalTime } from '../../../utils/datetime'

const props = defineProps( {
  sparePart : Object
} )

const logs = ref( [] )

const search = ref( {
  material_type_id : 3,
  material_id : null
} )

async function getLogData() {
  const response = await searchInventoryTransactionLogs( 1, 50, 'allocatedAt', 'DESC', search.value )

  logs.value = response.data.content
  console.log( 'LOGS: ', logs.value )
}

watch(
  () => props.sparePart,
  newVal => {
    if ( newVal?.id ) {
      search.value.material_id = newVal.id
      getLogData()
    }
  },
  { deep : true, immediate : true }
)
</script>

<style scoped>
.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
  height: 35px;
}

.main-container-t {
  overflow-y: auto;
  height: 582px;
  /* margin-right: 50px; */
  padding: 5px;
}

@media (max-width: 1600px) {
  .main-container-t {
    overflow-y: auto;
    height: 367px;
    /* margin-right: 10px; */
    padding: 5px;
  }
}
</style>

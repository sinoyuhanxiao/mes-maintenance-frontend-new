<template>
  <el-table
    :data="inventoryData"
    v-loading="loading"
    style="width: 100%"
    stripe
  >
    <el-table-column label="Item Name" min-width="200">
      <template #default="{ row }">
        <div style="font-weight: 500">{{ row.spare_part?.name || row.tool?.name || '-' }}</div>
        <div style="color: #909399; font-size: 12px">
          {{ row.spare_part ? 'Spare Part' : 'Tool' }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="Location" min-width="150">
      <template #default="{ row }">
        {{ row.location?.name || '-' }}
      </template>
    </el-table-column>

    <el-table-column label="Current Stock" width="120" align="center">
      <template #default="{ row }">
        <span :style="{ color: getStockColor(row.quantity, row.min_quantity) }">
          {{ row.quantity || 0 }}
        </span>
      </template>
    </el-table-column>

    <el-table-column label="Min Stock" width="110" align="center">
      <template #default="{ row }">
        {{ row.min_quantity || 0 }}
      </template>
    </el-table-column>

    <el-table-column label="Status" width="120" align="center">
      <template #default="{ row }">
        <el-tag :type="getStockStatusType(row.quantity, row.min_quantity)" size="small">
          {{ getStockStatus(row.quantity, row.min_quantity) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="Last Updated" width="150">
      <template #default="{ row }">
        {{ formatDate(row.updated_at) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { searchInventory } from '@/api/resources'
import { convertToLocalTime } from '@/utils/datetime'

const loading = ref( false )
const inventoryData = ref( [] )

const fetchData = async() => {
  loading.value = true
  try {
    // Fetch inventory data (top 10, sorted by updated date)
    const response = await searchInventory(
      1,
      10,
      'updated_at',
      'DESC',
      {}
    )

    if ( response.data && response.data.content ) {
      inventoryData.value = response.data.content
    }
  } catch ( error ) {
    console.error( 'Failed to fetch inventory data:', error )
    inventoryData.value = []
  } finally {
    loading.value = false
  }
}

const getStockColor = ( current, min ) => {
  if ( !current || !min ) return '#606266'
  if ( current <= min ) return '#ec536c'
  if ( current <= min * 1.5 ) return '#f5b225'
  return '#67c23a'
}

const getStockStatus = ( current, min ) => {
  if ( !current || !min ) return 'Unknown'
  if ( current <= min ) return 'Low'
  if ( current <= min * 1.5 ) return 'Warning'
  return 'Normal'
}

const getStockStatusType = ( current, min ) => {
  if ( !current || !min ) return 'info'
  if ( current <= min ) return 'danger'
  if ( current <= min * 1.5 ) return 'warning'
  return 'success'
}

const formatDate = dateString => {
  return dateString ? convertToLocalTime( dateString ) : '-'
}

onBeforeMount( () => {
  // Disabled API call - component hidden for now
  // fetchData()
} )

defineOptions( {
  name : 'ResourceInventoryTable'
} )
</script>

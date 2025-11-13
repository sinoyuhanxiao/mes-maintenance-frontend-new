<template>
  <el-table ref="multipleTable" :data="workOrders" v-loading="loading" tooltip-effect="dark" style="width: 100%">
    <el-table-column label="Work Order" min-width="100">
      <template #default="{ row }">
        <div style="font-weight: 500">{{ row.name }}</div>
        <div style="color: #909399; font-size: 12px">#{{ row.id }}</div>
      </template>
    </el-table-column>

    <el-table-column label="Code" width="250">
      <template #default="{ row }">{{ row.code || '-' }}</template>
    </el-table-column>

    <el-table-column label="Due Date" width="200">
      <template #default="{ row }">
        <span :style="{ color: isOverdue(row.due_date) ? 'var(--el-color-danger)' : '' }">
          {{ formatDate(row.due_date) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column label="Priority" width="120" align="center">
      <template #default="{ row }">
        <PriorityTag :priority="row.priority" />
      </template>
    </el-table-column>

    <el-table-column label="Type" width="140" align="center">
      <template #default="{ row }">
        <WorkTypeTag :work-type="row.work_type" />
      </template>
    </el-table-column>

    <el-table-column label="Status" width="150" align="center">
      <template #default="{ row }">
        <StatusTag :status="row.state" />
      </template>
    </el-table-column>

    <el-table-column label="Created By" min-width="20">
      <template #default="{ row }">
        {{ formatCreatedBy(row.created_by) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { searchWorkOrders } from '@/api/work-order'
import { convertToLocalTime } from '@/utils/datetime'
import PriorityTag from '@/components/WorkOrder/Display/PriorityTag.vue'
import WorkTypeTag from '@/components/WorkOrder/Display/WorkTypeTag.vue'
import StatusTag from '@/components/WorkOrder/Display/StatusTag.vue'

const loading = ref( false )
const workOrders = ref( [] )

const fetchData = async() => {
  loading.value = true
  try {
    // Fetch recent work orders (first 5 items, sorted by creation date descending)
    const response = await searchWorkOrders(
      1, // page
      5, // size - only show 5 recent work orders
      'createdAt',
      'DESC',
      { latest_per_recurrence : true }
    )

    if ( response.data && response.data.content ) {
      workOrders.value = response.data.content
    }
  } catch ( error ) {
    console.error( 'Failed to fetch work orders:', error )
    workOrders.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = dateString => {
  return dateString ? convertToLocalTime( dateString ) : '-'
}

const isOverdue = dueDate => {
  return dueDate && new Date( dueDate ) < new Date()
}

const formatCreatedBy = createdBy => {
  if ( !createdBy ) return '-'
  if ( typeof createdBy === 'string' ) return createdBy
  const firstName = createdBy.first_name || ''
  const lastName = createdBy.last_name || ''
  return `${firstName} ${lastName}`.trim() || '-'
}

onBeforeMount( () => {
  fetchData()
} )

defineOptions( {
  name : 'TransactionTable'
} )
</script>

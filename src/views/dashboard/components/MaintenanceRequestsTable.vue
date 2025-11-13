<template>
  <el-table :data="requestsData" v-loading="loading" style="width: 100%" stripe>
    <el-table-column label="Request" min-width="200">
      <template #default="{ row }">
        <div style="font-weight: 500">{{ row.name }}</div>
        <div style="color: #909399; font-size: 12px">#{{ row.id }}</div>
      </template>
    </el-table-column>

    <el-table-column label="Equipment" min-width="180">
      <template #default="{ row }">
        {{ row.equipment_node?.name || '-' }}
      </template>
    </el-table-column>

    <el-table-column label="Status" width="130" align="center">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)" size="small">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="Priority" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="getPriorityType(row.priority)" size="small">
          {{ row.priority || 'Normal' }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="Created Date" width="250">
      <template #default="{ row }">
        {{ formatDate(row.created_at) }}
      </template>
    </el-table-column>

    <el-table-column label="Created By" min-width="50">
      <template #default="{ row }">
        {{ formatCreatedBy(row.created_by) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { searchMaintenanceRequests } from '@/api/maintenance-requests'
import { convertToLocalTime } from '@/utils/datetime'

const loading = ref( false )
const requestsData = ref( [] )

const fetchData = async() => {
  loading.value = true
  try {
    // Fetch maintenance requests (top 10, sorted by created date)
    const response = await searchMaintenanceRequests( 1, 10, 'createdAt', 'DESC', {} )

    if ( response.data && response.data.content ) {
      requestsData.value = response.data.content
    }
  } catch ( error ) {
    console.error( 'Failed to fetch maintenance requests:', error )
    requestsData.value = []
  } finally {
    loading.value = false
  }
}

const getStatusText = status => {
  const statusMap = {
    0 : 'Pending',
    1 : 'Approved',
    2 : 'Rejected'
  }
  return statusMap[status] || status || 'Unknown'
}

const getStatusType = status => {
  const typeMap = {
    0 : 'warning',
    1 : 'primary',
    2 : 'danger'
  }
  return typeMap[status] || 'info'
}

const getPriorityType = priority => {
  if ( !priority ) return 'info'
  const p = priority.toLowerCase()
  if ( p === 'high' || p === 'urgent' ) return 'danger'
  if ( p === 'medium' ) return 'warning'
  return 'success'
}

const formatDate = dateString => {
  return dateString ? convertToLocalTime( dateString ) : '-'
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
  name : 'MaintenanceRequestsTable'
} )
</script>

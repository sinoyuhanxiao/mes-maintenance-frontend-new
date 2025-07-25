<template>
  <div class="t4-sub-items">
    <el-descriptions :column="1" direction="vertical">
      <el-descriptions-item label="Maintenance Schedule">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="Search by Location Code, Device Tag, or Spare Part..."
            clearable
            prefix-icon="el-icon-search"
          />
        </div>
      </el-descriptions-item>
    </el-descriptions>

    <el-table
      :data="paginatedData"
      :default-sort="{ prop: 'maintenanceDate', order: 'ascending' }"
      class="schedule-table"
    >
      <el-table-column prop="locationCode" label="Location Code" sortable width="120" />
      <el-table-column prop="deviceTag" label="Device Tag" sortable width="140" />
      <el-table-column prop="sparePart" label="Spare Part" sortable width="180" />
      <el-table-column prop="vendorSuggestedDays" label="Vendor Suggested Service Days" sortable width="200" />
      <el-table-column prop="estimatedServiceDays" label="Estimated Service Days" sortable width="180" />
      <el-table-column prop="previousRuntime" label="Previous Runtime" sortable width="150" />
      <el-table-column prop="maintenanceType" label="Maintenance Type" sortable width="140">
        <template #default="{ row }">
          <el-tag
            :type="getMaintenanceTypeColor(row.maintenanceType)"
            size="small"
          >
            {{ row.maintenanceType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="maintenanceDate" label="Maintenance Date" sortable width="150">
        <template #default="{ row }">
          {{ formatDate(row.maintenanceDate) }}
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div class="pagination-wrapper">
    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="filteredData.length"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref( '' )
const currentPage = ref( 1 )
const pageSize = ref( 15 )

const tableData = ref( [
  {
    locationCode : 'A-101',
    deviceTag : 'CONV-001',
    sparePart : 'Belt Drive Motor',
    vendorSuggestedDays : 90,
    estimatedServiceDays : 85,
    previousRuntime : '2,340 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-08-15'
  },
  {
    locationCode : 'B-205',
    deviceTag : 'PUMP-003',
    sparePart : 'Impeller Assembly',
    vendorSuggestedDays : 120,
    estimatedServiceDays : 110,
    previousRuntime : '1,890 hrs',
    maintenanceType : 'Predictive',
    maintenanceDate : '2025-08-22'
  },
  {
    locationCode : 'C-150',
    deviceTag : 'FAN-007',
    sparePart : 'Bearing Set',
    vendorSuggestedDays : 180,
    estimatedServiceDays : 175,
    previousRuntime : '4,200 hrs',
    maintenanceType : 'Corrective',
    maintenanceDate : '2025-09-05'
  },
  {
    locationCode : 'A-102',
    deviceTag : 'VALVE-012',
    sparePart : 'Actuator Seal',
    vendorSuggestedDays : 365,
    estimatedServiceDays : 350,
    previousRuntime : '8,760 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-09-12'
  },
  {
    locationCode : 'D-301',
    deviceTag : 'COMP-005',
    sparePart : 'Cylinder Head',
    vendorSuggestedDays : 730,
    estimatedServiceDays : 700,
    previousRuntime : '15,600 hrs',
    maintenanceType : 'Overhaul',
    maintenanceDate : '2025-10-01'
  },
  {
    locationCode : 'B-210',
    deviceTag : 'HEAT-009',
    sparePart : 'Heating Element',
    vendorSuggestedDays : 45,
    estimatedServiceDays : 40,
    previousRuntime : '960 hrs',
    maintenanceType : 'Emergency',
    maintenanceDate : '2025-07-28'
  },
  {
    locationCode : 'E-405',
    deviceTag : 'SENS-014',
    sparePart : 'Temperature Probe',
    vendorSuggestedDays : 60,
    estimatedServiceDays : 55,
    previousRuntime : '1,320 hrs',
    maintenanceType : 'Predictive',
    maintenanceDate : '2025-08-10'
  },
  {
    locationCode : 'A-103',
    deviceTag : 'GEAR-002',
    sparePart : 'Gear Assembly',
    vendorSuggestedDays : 540,
    estimatedServiceDays : 520,
    previousRuntime : '12,000 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-11-15'
  },
  {
    locationCode : 'F-502',
    deviceTag : 'CTRL-018',
    sparePart : 'Control Board',
    vendorSuggestedDays : 1095,
    estimatedServiceDays : 1000,
    previousRuntime : '26,280 hrs',
    maintenanceType : 'Upgrade',
    maintenanceDate : '2025-12-20'
  },
  {
    locationCode : 'C-155',
    deviceTag : 'TANK-006',
    sparePart : 'Pressure Relief Valve',
    vendorSuggestedDays : 365,
    estimatedServiceDays : 360,
    previousRuntime : '8,400 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-09-18'
  },
  {
    locationCode : 'B-220',
    deviceTag : 'FILTER-011',
    sparePart : 'Filter Cartridge',
    vendorSuggestedDays : 30,
    estimatedServiceDays : 28,
    previousRuntime : '720 hrs',
    maintenanceType : 'Routine',
    maintenanceDate : '2025-08-02'
  },
  {
    locationCode : 'D-320',
    deviceTag : 'MOTOR-015',
    sparePart : 'Rotor Assembly',
    vendorSuggestedDays : 180,
    estimatedServiceDays : 170,
    previousRuntime : '4,080 hrs',
    maintenanceType : 'Corrective',
    maintenanceDate : '2025-09-25'
  },
  {
    locationCode : 'E-410',
    deviceTag : 'TRANS-008',
    sparePart : 'Transmission Fluid',
    vendorSuggestedDays : 90,
    estimatedServiceDays : 85,
    previousRuntime : '2,160 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-08-18'
  },
  {
    locationCode : 'A-105',
    deviceTag : 'BELT-004',
    sparePart : 'Timing Belt',
    vendorSuggestedDays : 120,
    estimatedServiceDays : 115,
    previousRuntime : '2,880 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-09-08'
  },
  {
    locationCode : 'F-510',
    deviceTag : 'SEAL-016',
    sparePart : 'Rubber Gasket Set',
    vendorSuggestedDays : 240,
    estimatedServiceDays : 230,
    previousRuntime : '5,520 hrs',
    maintenanceType : 'Predictive',
    maintenanceDate : '2025-10-12'
  },
  {
    locationCode : 'C-160',
    deviceTag : 'WIRE-013',
    sparePart : 'Electrical Harness',
    vendorSuggestedDays : 730,
    estimatedServiceDays : 720,
    previousRuntime : '17,520 hrs',
    maintenanceType : 'Inspection',
    maintenanceDate : '2025-11-30'
  },
  {
    locationCode : 'B-225',
    deviceTag : 'LUBR-010',
    sparePart : 'Grease Fitting',
    vendorSuggestedDays : 15,
    estimatedServiceDays : 14,
    previousRuntime : '360 hrs',
    maintenanceType : 'Routine',
    maintenanceDate : '2025-07-25'
  },
  {
    locationCode : 'D-325',
    deviceTag : 'COOL-017',
    sparePart : 'Cooling Fan',
    vendorSuggestedDays : 365,
    estimatedServiceDays : 355,
    previousRuntime : '8,520 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-09-22'
  },
  {
    locationCode : 'E-415',
    deviceTag : 'DISP-019',
    sparePart : 'Display Panel',
    vendorSuggestedDays : 1095,
    estimatedServiceDays : 1080,
    previousRuntime : '26,040 hrs',
    maintenanceType : 'Upgrade',
    maintenanceDate : '2025-12-15'
  },
  {
    locationCode : 'A-110',
    deviceTag : 'BRAKE-020',
    sparePart : 'Brake Pad Set',
    vendorSuggestedDays : 90,
    estimatedServiceDays : 88,
    previousRuntime : '2,112 hrs',
    maintenanceType : 'Preventive',
    maintenanceDate : '2025-08-28'
  }
] )

const filteredData = computed( () => {
  if ( !searchQuery.value.trim() ) return tableData.value
  return tableData.value.filter( row =>
    row.locationCode.toLowerCase().includes( searchQuery.value.toLowerCase() ) ||
    row.deviceTag.toLowerCase().includes( searchQuery.value.toLowerCase() ) ||
    row.sparePart.toLowerCase().includes( searchQuery.value.toLowerCase() )
  )
} )

const paginatedData = computed( () => {
  const start = ( currentPage.value - 1 ) * pageSize.value
  return filteredData.value.slice( start, start + pageSize.value )
} )

function handlePageChange( page ) {
  currentPage.value = page
}

function getMaintenanceTypeColor( type ) {
  const colorMap = {
    'Preventive' : 'success',
    'Predictive' : 'primary',
    'Corrective' : 'warning',
    'Emergency' : 'danger',
    'Routine' : 'info',
    'Overhaul' : 'warning',
    'Upgrade' : 'primary',
    'Inspection' : 'info'
  }
  return colorMap[type] || 'info'
}

function formatDate( dateString ) {
  const date = new Date( dateString )
  return date.toLocaleDateString( 'en-US', {
    year : 'numeric',
    month : 'short',
    day : 'numeric'
  } )
}
</script>

<style scoped>
.t4-sub-items {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.search-bar {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  flex: 0;
}

.schedule-table {
  width: 100%;
  height: calc(100vh - 445px);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  padding: 10px 0;
}
</style>

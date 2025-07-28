<template>
  <div class="sub-items">
    <div class="image-container">
      <el-image
        :src="props.imageUrl"
        :alt="props.imageAlt"
        fit="contain"
        :preview-src-list="[props.imageUrl]"
        class="equipment-image"
      >
      </el-image>
    </div>
    <div class="spare-parts-table">
      <MaintenanceCardTable
        :items="sparePartsData"
        :pageSize="4"
        :module="5"
        @requestData="handleRequestData"
        :height="'400px'"
        :totalItems="sparePartsData.length"
        :handleCurrentChange="handleCurrentChange"
        :currentPage="listQuery.page"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import MaintenanceCardTable from '../../../../components/Tables/MaintenanceCardTable.vue'

const props = defineProps( {
  imageUrl : {
    type : String,
    default : 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  imageAlt : {
    type : String,
    default : 'Equipment image'
  }
} )

const selectedData = ref( null )

// Spare Parts data (for module 5) - converted from your task data
const sparePartsData = ref( [
  {
    id : 1,
    title : 'HYDRAULIC PUMP SEAL KIT',
    partNumber : 'HP001',
    deviceTag : 'HP001',
    deviceTagPositionCode : '1',
    deviceQuantity : '1',
    suggestedServiceDays : '2 Days',
    estimatedServiceDays : '1 Day',
    autoTriggerCycle : 'No',
    imageUrl : 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  {
    id : 2,
    title : 'ROLLER BEARING 6203-2RS',
    partNumber : 'RB002',
    deviceTag : 'RB002',
    deviceTagPositionCode : '3',
    deviceQuantity : '2',
    suggestedServiceDays : '3 Days',
    estimatedServiceDays : '2 Days',
    autoTriggerCycle : 'Yes',
    imageUrl : null
  },
  {
    id : 3,
    title : 'DRIVE CHAIN 40SS-316L',
    partNumber : 'DC003',
    deviceTag : 'DC003',
    deviceTagPositionCode : '2',
    deviceQuantity : '1',
    suggestedServiceDays : '5 Days',
    estimatedServiceDays : '3 Days',
    autoTriggerCycle : 'No',
    imageUrl : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcjpeg.jpeg'
  },
  {
    id : 4,
    title : 'PNEUMATIC CYLINDER SEAL',
    partNumber : 'PC004',
    deviceTag : 'PC004',
    deviceTagPositionCode : '4',
    deviceQuantity : '1',
    suggestedServiceDays : '1 Day',
    estimatedServiceDays : '1 Day',
    autoTriggerCycle : 'No',
    imageUrl : null
  },
  {
    id : 5,
    title : 'MOTOR COUPLING ASSEMBLY',
    partNumber : 'MC005',
    deviceTag : 'MC005',
    deviceTagPositionCode : '5',
    deviceQuantity : '1',
    suggestedServiceDays : '4 Days',
    estimatedServiceDays : '3 Days',
    autoTriggerCycle : 'Yes',
    imageUrl : 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  {
    id : 6,
    title : 'CONVEYOR BELT SECTION',
    partNumber : 'CB006',
    deviceTag : 'CB006',
    deviceTagPositionCode : '6',
    deviceQuantity : '1',
    suggestedServiceDays : '7 Days',
    estimatedServiceDays : '5 Days',
    autoTriggerCycle : 'No',
    imageUrl : null
  },
  {
    id : 7,
    title : 'LIMIT SWITCH ASSEMBLY',
    partNumber : 'LS007',
    deviceTag : 'LS007',
    deviceTagPositionCode : '7',
    deviceQuantity : '2',
    suggestedServiceDays : '2 Days',
    estimatedServiceDays : '1 Day',
    autoTriggerCycle : 'Yes',
    imageUrl : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcjpeg.jpeg'
  },
  {
    id : 8,
    title : 'PRESSURE RELIEF VALVE',
    partNumber : 'PRV008',
    deviceTag : 'PRV008',
    deviceTagPositionCode : '8',
    deviceQuantity : '1',
    suggestedServiceDays : '3 Days',
    estimatedServiceDays : '2 Days',
    autoTriggerCycle : 'No',
    imageUrl : null
  },
  {
    id : 9,
    title : 'GEARBOX OIL SEAL',
    partNumber : 'GOS009',
    deviceTag : 'GOS009',
    deviceTagPositionCode : '9',
    deviceQuantity : '1',
    suggestedServiceDays : '6 Days',
    estimatedServiceDays : '4 Days',
    autoTriggerCycle : 'Yes',
    imageUrl : 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  {
    id : 10,
    title : 'TEMPERATURE SENSOR PROBE',
    partNumber : 'TSP010',
    deviceTag : 'TSP010',
    deviceTagPositionCode : '10',
    deviceQuantity : '1',
    suggestedServiceDays : '1 Day',
    estimatedServiceDays : '1 Day',
    autoTriggerCycle : 'No',
    imageUrl : null
  }
] )

// Pagination configuration
const listQuery = reactive( {
  page : 1,
  limit : 4
} )

// Event handlers
function handleRequestData( data ) {
  selectedData.value = data
  console.log( 'Selected spare part:', selectedData.value )
}

function handleCurrentChange( page ) {
  listQuery.page = page
  console.log( 'Spare parts current page changed to:', page )
  // Here you would typically fetch new spare parts data based on the page
  // fetchSparePartsData(page)
}

// Optional: Method to fetch spare parts data (if needed)
// async function fetchSparePartsData(page) {
//   try {
//     const response = await api.getSparePartsItems({ page, limit: 4 })
//     sparePartsData.value = response.data
//   } catch (error) {
//     console.error('Failed to fetch spare parts data:', error)
//   }
// }
</script>

<style scoped>
.sub-items {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 10px;
}

.equipment-image {
  width: 100%;
  height: 100%;
}

.spare-parts-table {
  flex: 0 0 400px;
}
</style>

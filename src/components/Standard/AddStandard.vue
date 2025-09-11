<template>
  <div class="standard-dialog-container">
    <div class="standard-dialog-header"></div>

    <!-- Standard Table -->
    <div class="standard-dialog-content">
      <CardTable
        :module="7"
        :data="standardTemplates"
        :maxHeight="'340px'"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :pageSize="pageSize"
        :showBorder="true"
        :showPagination="true"
        :loading="loading"
        @selection="handleStandardAction"
        @page-change="handlePageChange"
      />
    </div>

    <div class="standard-dialog-footer">
      <el-button type="primary" :disabled="selectedStandards.size === 0" @click="handleAddStandards">
        Add Standards ({{ selectedStandards.size }})
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CardTable from '../Tables/CardTable.vue'
import { getStandards } from '@/api/task-library.js'

// Define emits
const emit = defineEmits( ['close', 'addStandards'] )

// Reactive data
const standardTemplates = ref( [] )
const totalItems = ref( 0 )
const currentPage = ref( 1 )
const pageSize = ref( 10 )
const loading = ref( false )

// Track selected standards
const selectedStandards = ref( new Set() )

// Get list of selected standard objects
const selectedStandardsList = computed( () => {
  return standardTemplates.value.filter( standard => selectedStandards.value.has( standard.id ) )
} )

// Fetch standards data from API
const fetchStandards = async( page = 1 ) => {
  loading.value = true
  try {
    const params = {
      page,
      limit : pageSize.value
    }

    const response = await getStandards( params )
    standardTemplates.value = response.data || []
    totalItems.value = response.total || 0
    currentPage.value = page
  } catch ( error ) {
    console.error( 'Error fetching standards:', error )
    // You might want to show an error message to the user here
    standardTemplates.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// Handle page changes
const handlePageChange = page => {
  // Clear selections when changing pages if needed
  // selectedStandards.value.clear()
  fetchStandards( page )
}

const handleStandardAction = selectionData => {
  console.log( 'Selection data:', selectionData )

  const { id, action } = selectionData

  if ( action === 'check' ) {
    selectedStandards.value.add( id )
  } else if ( action === 'uncheck' ) {
    selectedStandards.value.delete( id )
  }

  console.log( 'Currently selected:', Array.from( selectedStandards.value ) )
}

const handleAddStandards = () => {
  if ( selectedStandards.value.size > 0 ) {
    emit( 'addStandards', selectedStandardsList.value )
    selectedStandards.value.clear()
    emit( 'close' )
  }
}

// Fetch data on component mount
onMounted( () => {
  fetchStandards()
} )
</script>

<style>
.standard-dialog-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.standard-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.standard-dialog-content {
  flex: 1;
}

.standard-dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>

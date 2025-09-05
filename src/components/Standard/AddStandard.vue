<template>
  <div class="standard-dialog-container">
    <div class="standard-dialog-header"></div>

    <!-- Standard Table -->
    <div class="standard-dialog-content">
      <CardTable
        :module="7"
        :data="standardTemplates"
        :maxHeight="'340px'"
        :totalItems="standardTemplates.length"
        :currentPage="1"
        :pageSize="10"
        :showBorder="true"
        :showPagination="true"
        @selection="handleStandardAction"
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
import { ref, computed } from 'vue'
import CardTable from '../Tables/CardTable.vue'

// Define emits
const emit = defineEmits( ['close', 'addStandards'] )

// Sample standard templates data
const standardTemplates = ref( [
  {
    id : 16,
    name : 'Safety Protocol Checklist',
    category : 'Safety Standards',
    estimated_minutes : 20
  },
  {
    id : 13513,
    name : 'Equipment Inspection Standard',
    category : 'Quality Control',
    estimated_minutes : 35
  },
  {
    id : 23,
    name : 'Environmental Compliance Check',
    category : 'Environmental',
    estimated_minutes : 40
  },
  {
    id : 756,
    name : 'Documentation Standard',
    category : 'Administrative',
    estimated_minutes : 15
  }
] )

// Track selected standards
const selectedStandards = ref( new Set() )

// Get list of selected standard objects
const selectedStandardsList = computed( () => {
  return standardTemplates.value.filter( standard => selectedStandards.value.has( standard.id ) )
} )

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

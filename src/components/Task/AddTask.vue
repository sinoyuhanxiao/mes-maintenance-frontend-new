<template>
  <div class="task-dialog-container">
    <div class="task-dialog-header"></div>

    <!-- Task Table -->
    <div class="task-dialog-content">
      <CardTable
        :module="5"
        :data="taskTemplates"
        :maxHeight="'340px'"
        :totalItems="taskTemplates.length"
        :currentPage="1"
        :pageSize="10"
        :showBorder="true"
        :showPagination="true"
        @selection="handleTaskAction"
      />
    </div>

    <div class="task-dialog-footer">
      <el-button type="primary" :disabled="selectedTemplates.size === 0" @click="handleAddTemplates">
        Add Task Templates ({{ selectedTemplates.size }})
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CardTable from '../Tables/CardTable.vue'

// Define emits
const emit = defineEmits( ['close', 'addTemplates'] )

// Sample task templates data
const taskTemplates = ref( [
  {
    id : 1,
    name : 'HVAC Filter Replacement',
    category : 'Preventive Maintenance',
    estimated_minutes : 30
  },
  {
    id : 2,
    name : 'Fire Extinguisher Inspection',
    category : 'Safety',
    estimated_minutes : 15
  },
  {
    id : 3,
    name : 'Electrical Panel Check',
    category : 'Safety Inspection',
    estimated_minutes : 45
  },
  {
    id : 4,
    name : 'Emergency Lighting Test',
    category : 'Safety Testing',
    estimated_minutes : 20
  }
] )

// Track selected templates
const selectedTemplates = ref( new Set() )

// Get list of selected template objects
const selectedTemplatesList = computed( () => {
  return taskTemplates.value.filter( template => selectedTemplates.value.has( template.id ) )
} )

const handleTaskAction = selectionData => {
  console.log( 'Selection data:', selectionData )

  const { id, action } = selectionData

  if ( action === 'check' ) {
    selectedTemplates.value.add( id )
  } else if ( action === 'uncheck' ) {
    selectedTemplates.value.delete( id )
  }

  console.log( 'Currently selected:', Array.from( selectedTemplates.value ) )
}

const handleAddTemplates = () => {
  if ( selectedTemplates.value.size > 0 ) {
    emit( 'addTemplates', selectedTemplatesList.value )
    selectedTemplates.value.clear()
    emit( 'close' )
  }
}
</script>

<style>
.task-dialog-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.task-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-dialog-content {
  flex: 1;
}

.task-dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>

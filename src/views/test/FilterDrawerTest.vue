<template>
  <div class="filter-drawer-test">
    <h1>Filter Drawer Test Page</h1>
    <p>This page demonstrates the filter drawer functionality in UnifiedWorkOrderFilters component.</p>

    <div class="test-container">
      <UnifiedWorkOrderFilters
        v-model="filters"
        :export-loading="false"
        :show-todo-actions="true"
        @filter-change="handleFilterChange"
        @create="handleCreate"
        @export="handleExport"
        @refresh="handleRefresh"
      />

      <div class="current-filters">
        <h3>Current Filters:</h3>
        <pre>{{ JSON.stringify(filters, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UnifiedWorkOrderFilters from '@/components/WorkOrder/UnifiedWorkOrderFilters.vue'

// State
const filters = ref( {
  assignedTo : null,
  dueDate : null,
  workType : null,
  priority : null,
  search : '',
  customDateRange : null,
  status : null,
  category : null,
  equipment : null,
  location : null
} )

// Methods
const handleFilterChange = newFilters => {
  console.log( 'Filter changed:', newFilters )
}

const handleCreate = () => {
  console.log( 'Create clicked' )
}

const handleExport = () => {
  console.log( 'Export clicked' )
}

const handleRefresh = () => {
  console.log( 'Refresh clicked' )
}

defineOptions( {
  name : 'FilterDrawerTest'
} )
</script>

<style scoped lang="scss">
.filter-drawer-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }

  p {
    color: var(--el-text-color-secondary);
    margin-bottom: 32px;
  }
}

.test-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.current-filters {
  background: var(--el-bg-color-page);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);

  h3 {
    margin: 0 0 12px 0;
    color: var(--el-text-color-primary);
  }

  pre {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-lighter);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>

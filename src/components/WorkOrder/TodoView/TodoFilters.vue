<template>
  <div class="todo-filters">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-left">
        <!-- Quick Filters -->
        <el-button-group class="quick-filters">
          <el-button
            :type="activeFilter === 'assigned' ? 'primary' : 'default'"
            size="small"
            @click="setFilter('assigned')"
          >
            {{ $t('workOrder.filters.assignedToMe') }}
          </el-button>
          <el-button
            :type="activeFilter === 'overdue' ? 'danger' : 'default'"
            size="small"
            @click="setFilter('overdue')"
          >
            {{ $t('workOrder.filters.overdue') }}
          </el-button>
          <el-button :type="activeFilter === 'high' ? 'warning' : 'default'" size="small" @click="setFilter('high')">
            {{ $t('workOrder.filters.highPriority') }}
          </el-button>
        </el-button-group>
      </div>

      <div class="filter-right">
        <!-- Advanced Filters Dropdown -->
        <el-dropdown trigger="click" @command="handleFilterCommand">
          <el-button size="small">
            {{ $t('workOrder.filters.addFilter') }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="dueDate">
                <el-icon><Calendar /></el-icon>
                {{ $t('workOrder.filters.dueDate') }}
              </el-dropdown-item>
              <el-dropdown-item command="location">
                <el-icon><Location /></el-icon>
                {{ $t('workOrder.filters.location') }}
              </el-dropdown-item>
              <el-dropdown-item command="priority">
                <el-icon><Flag /></el-icon>
                {{ $t('workOrder.filters.priority') }}
              </el-dropdown-item>
              <el-dropdown-item command="workType">
                <el-icon><Tools /></el-icon>
                {{ $t('workOrder.filters.maintenanceType') }}
              </el-dropdown-item>
              <el-dropdown-item divided command="saved">
                <el-icon><Star /></el-icon>
                {{ $t('workOrder.filters.myFilters') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="filter-tags">
        <el-tag
          v-for="filter in activeFilters"
          :key="filter.key"
          closable
          @close="removeFilter(filter.key)"
          size="small"
          type="info"
        >
          {{ filter.label }}
        </el-tag>
      </div>
      <el-button type="text" size="small" @click="clearAllFilters" class="clear-all">
        {{ $t('workOrder.filters.clearAll') }}
      </el-button>
    </div>

    <!-- Status Tabs -->
    <div class="status-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="todo-tabs">
        <el-tab-pane :label="$t('workOrder.tabs.todo')" name="todo" />
        <el-tab-pane :label="$t('workOrder.tabs.done')" name="done" />
      </el-tabs>
    </div>

    <!-- Sort Options -->
    <div class="sort-options">
      <div class="sort-label">{{ $t('workOrder.sort.sortBy') }}:</div>
      <el-select v-model="sortBy" @change="handleSortChange" size="small" style="width: 180px">
        <el-option :label="$t('workOrder.sort.priorityHighest')" value="priority-desc" />
        <el-option :label="$t('workOrder.sort.priorityLowest')" value="priority-asc" />
        <el-option :label="$t('workOrder.sort.dueDateNearest')" value="dueDate-asc" />
        <el-option :label="$t('workOrder.sort.dueDateFarthest')" value="dueDate-desc" />
        <el-option :label="$t('workOrder.sort.createdNewest')" value="created-desc" />
        <el-option :label="$t('workOrder.sort.createdOldest')" value="created-asc" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Calendar, Location, Flag, Tools, Star } from '@element-plus/icons-vue'

// Props
// const props = defineProps( {
//   modelValue : {
//     type : Object,
//     default : () => ( {} )
//   }
// } )

// Emits
const emit = defineEmits( ['update:modelValue', 'filter-change', 'tab-change', 'sort-change'] )

const { t } = useI18n()

// State
const activeFilter = ref( '' )
const activeTab = ref( 'todo' )
const sortBy = ref( 'priority-desc' )
const activeFilters = ref( [] )

// Computed
const hasActiveFilters = computed( () => activeFilters.value.length > 0 )

// Methods
const setFilter = filterType => {
  if ( activeFilter.value === filterType ) {
    activeFilter.value = ''
    removeFilter( filterType )
  } else {
    activeFilter.value = filterType
    addFilter( filterType )
  }
}

const addFilter = filterType => {
  const filterLabels = {
    assigned : t( 'workOrder.filters.assignedToMe' ),
    overdue : t( 'workOrder.filters.overdue' ),
    high : t( 'workOrder.filters.highPriority' )
  }

  const existingIndex = activeFilters.value.findIndex( f => f.key === filterType )
  if ( existingIndex === -1 ) {
    activeFilters.value.push( {
      key : filterType,
      label : filterLabels[filterType] || filterType
    } )
  }

  emitFilterChange()
}

const removeFilter = filterKey => {
  activeFilters.value = activeFilters.value.filter( f => f.key !== filterKey )
  if ( activeFilter.value === filterKey ) {
    activeFilter.value = ''
  }
  emitFilterChange()
}

const clearAllFilters = () => {
  activeFilters.value = []
  activeFilter.value = ''
  emitFilterChange()
}

const handleFilterCommand = command => {
  // Handle advanced filter commands
  console.log( 'Advanced filter:', command )
  // Implement advanced filter modals/dialogs
}

const handleTabChange = tabName => {
  emit( 'tab-change', tabName )
}

const handleSortChange = sortValue => {
  emit( 'sort-change', sortValue )
}

const emitFilterChange = () => {
  const filters = {
    active : activeFilters.value,
    quick : activeFilter.value
  }
  emit( 'filter-change', filters )
}

defineOptions( {
  name : 'TodoFilters'
} )
</script>

<style scoped lang="scss">
.todo-filters {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-light);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .filter-left {
    .quick-filters {
      .el-button {
        font-size: 12px;
      }
    }
  }

  .filter-right {
    .el-button {
      font-size: 12px;
    }
  }
}

.active-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);

  .filter-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .clear-all {
    font-size: 12px;
    color: var(--el-color-danger);
  }
}

.status-tabs {
  margin-bottom: 16px;

  .todo-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;

  .sort-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }
}

// Responsive design
@media (max-width: 768px) {
  .todo-filters {
    padding: 12px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .filter-left,
    .filter-right {
      width: 100%;
    }

    .quick-filters {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }

  .active-filters {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .sort-options {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .el-select {
      width: 100% !important;
    }
  }
}
</style>

<template>
  <div class="unified-work-order-filters">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <!-- Main Filters Row -->
      <div class="filters-row">
        <!-- Assigned To Filter -->
        <div class="filter-item">
          <el-select
            v-model="localFilters.assignedTo"
            :placeholder="$t('workOrder.filters.assignedTo')"
            clearable
            size="default"
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option v-for="user in assignedToOptions" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </div>

        <!-- Due Date Filter -->
        <div class="filter-item">
          <el-select
            v-model="localFilters.dueDate"
            :placeholder="$t('workOrder.filters.dueDate')"
            clearable
            size="default"
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option :label="$t('workOrder.filters.overdue')" value="overdue" />
            <el-option :label="$t('workOrder.filters.today')" value="today" />
            <el-option :label="$t('workOrder.filters.thisWeek')" value="thisWeek" />
            <el-option :label="$t('workOrder.filters.thisMonth')" value="thisMonth" />
            <el-option :label="$t('workOrder.filters.custom')" value="custom" />
          </el-select>
        </div>

        <!-- Work Type Filter -->
        <div class="filter-item">
          <el-select
            v-model="localFilters.workType"
            :placeholder="$t('workOrder.table.workType')"
            clearable
            size="default"
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="workType in workTypeOptions"
              :key="workType.id"
              :label="workType.name"
              :value="workType.id"
            />
          </el-select>
        </div>

        <!-- Priority Filter -->
        <div class="filter-item">
          <el-select
            v-model="localFilters.priority"
            :placeholder="$t('workOrder.table.priority')"
            clearable
            size="default"
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="priority in priorityOptions"
              :key="priority.id"
              :label="priority.name"
              :value="priority.id"
            />
          </el-select>
        </div>

        <!-- Search Input -->
        <div class="filter-item search-item">
          <el-input
            v-model="localFilters.search"
            :placeholder="$t('workOrder.placeholder.search')"
            style="width: 200px"
            size="default"
            clearable
            @keyup.enter="handleFilterChange"
            @clear="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Action Buttons Row -->
        <div class="actions-row">
          <!-- Create Button -->
          <el-button size="default" type="primary" :icon="EditPen" @click="$emit('create')">
            {{ $t('workOrder.actions.create') }}
          </el-button>

          <!-- Export Button -->
          <el-button size="default" :loading="exportLoading" type="success" :icon="Download" @click="$emit('export')">
            {{ $t('workOrder.actions.export') }}
          </el-button>

          <!-- Additional Actions for Todo View -->
          <template v-if="showTodoActions">
            <el-button size="default" type="default" :icon="Refresh" @click="$emit('refresh')">
              {{ $t('workOrder.actions.refresh') }}
            </el-button>
          </template>
        </div>

        <!-- Filter Customization Menu -->
        <div class="filter-item customization-item">
          <el-dropdown trigger="click" @command="handleCustomizationCommand">
            <el-button type="text" class="customization-button">
              <el-icon><Operation /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="toggleFilters">
                  <el-icon><View /></el-icon>
                  {{ $t('workOrder.filters.toggleVisibility') }}
                </el-dropdown-item>
                <el-dropdown-item command="addFilter">
                  <el-icon><Plus /></el-icon>
                  {{ $t('workOrder.filters.addFilter') }}
                </el-dropdown-item>
                <el-dropdown-item divided command="savePreset">
                  <el-icon><Star /></el-icon>
                  {{ $t('workOrder.filters.savePreset') }}
                </el-dropdown-item>
                <el-dropdown-item command="managePresets">
                  <el-icon><Setting /></el-icon>
                  {{ $t('workOrder.filters.managePresets') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters-row">
        <div class="active-filters-label">{{ $t('workOrder.filters.activeFilters') }}:</div>
        <div class="active-filters-tags">
          <el-tag
            v-for="filter in activeFilterTags"
            :key="filter.key"
            closable
            @close="removeFilter(filter.key)"
            size="small"
            type="info"
          >
            {{ filter.label }}
          </el-tag>
        </div>
        <el-button type="text" size="small" @click="clearAllFilters" class="clear-all-button">
          {{ $t('workOrder.filters.clearAll') }}
        </el-button>
      </div>
    </div>

    <!-- Custom Date Range Picker (shown when due date filter is 'custom') -->
    <div v-if="localFilters.dueDate === 'custom'" class="custom-date-range">
      <el-date-picker
        v-model="localFilters.customDateRange"
        type="daterange"
        :range-separator="$t('common.to')"
        :start-placeholder="$t('common.startDate')"
        :end-placeholder="$t('common.endDate')"
        @change="handleFilterChange"
        style="width: 300px"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Operation, View, Plus, Star, Setting, EditPen, Download, Refresh } from '@element-plus/icons-vue'
import { useCommonDataStore } from '@/store/modules/commonData'

// Props
const props = defineProps( {
  modelValue : {
    type : Object,
    default : () => ( {} )
  },
  exportLoading : {
    type : Boolean,
    default : false
  },
  showTodoActions : {
    type : Boolean,
    default : false
  }
} )

// Emits
const emit = defineEmits( ['update:modelValue', 'filter-change', 'create', 'export', 'refresh'] )

const { t } = useI18n()
const commonDataStore = useCommonDataStore()

// Local filters state
const localFilters = reactive( {
  assignedTo : props.modelValue.assignedTo || null,
  dueDate : props.modelValue.dueDate || null,
  workType : props.modelValue.workType || null,
  priority : props.modelValue.priority || null,
  search : props.modelValue.search || '',
  customDateRange : props.modelValue.customDateRange || null
} )

// Filter options
const assignedToOptions = computed( () => {
  // TODO: Get from user store or API
  return [
    { id : 1, name : 'John Doe' },
    { id : 2, name : 'Jane Smith' },
    { id : 3, name : 'Mike Johnson' }
  ]
} )

const workTypeOptions = computed( () => commonDataStore.workTypes || [] )
const priorityOptions = computed( () => commonDataStore.priorities || [] )

// Active filters
const activeFilterTags = computed( () => {
  const tags = []

  if ( localFilters.assignedTo ) {
    const user = assignedToOptions.value.find( u => u.id === localFilters.assignedTo )
    tags.push( {
      key : 'assignedTo',
      label : `${t( 'workOrder.filters.assignedTo' )}: ${user?.name || localFilters.assignedTo}`
    } )
  }

  if ( localFilters.dueDate ) {
    const dueDateLabels = {
      overdue : t( 'workOrder.filters.overdue' ),
      today : t( 'workOrder.filters.today' ),
      thisWeek : t( 'workOrder.filters.thisWeek' ),
      thisMonth : t( 'workOrder.filters.thisMonth' ),
      custom : t( 'workOrder.filters.custom' )
    }
    tags.push( {
      key : 'dueDate',
      label : `${t( 'workOrder.filters.dueDate' )}: ${dueDateLabels[localFilters.dueDate]}`
    } )
  }

  if ( localFilters.workType ) {
    const workType = workTypeOptions.value.find( wt => wt.id === localFilters.workType )
    tags.push( {
      key : 'workType',
      label : `${t( 'workOrder.table.workType' )}: ${workType?.name || localFilters.workType}`
    } )
  }

  if ( localFilters.priority ) {
    const priority = priorityOptions.value.find( p => p.id === localFilters.priority )
    tags.push( {
      key : 'priority',
      label : `${t( 'workOrder.table.priority' )}: ${priority?.name || localFilters.priority}`
    } )
  }

  if ( localFilters.search ) {
    tags.push( {
      key : 'search',
      label : `${t( 'workOrder.placeholder.search' )}: ${localFilters.search}`
    } )
  }

  return tags
} )

const hasActiveFilters = computed( () => activeFilterTags.value.length > 0 )

// Methods
const handleFilterChange = () => {
  emit( 'update:modelValue', { ...localFilters } )
  emit( 'filter-change', { ...localFilters } )
}

const removeFilter = filterKey => {
  switch ( filterKey ) {
    case 'assignedTo':
      localFilters.assignedTo = null
      break
    case 'dueDate':
      localFilters.dueDate = null
      localFilters.customDateRange = null
      break
    case 'workType':
      localFilters.workType = null
      break
    case 'priority':
      localFilters.priority = null
      break
    case 'search':
      localFilters.search = ''
      break
    default:
      console.warn( `Unknown filter key: ${filterKey}` )
      break
  }
  handleFilterChange()
}

const clearAllFilters = () => {
  Object.keys( localFilters ).forEach( key => {
    if ( typeof localFilters[key] === 'string' ) {
      localFilters[key] = ''
    } else {
      localFilters[key] = null
    }
  } )
  handleFilterChange()
}

const handleCustomizationCommand = command => {
  console.log( 'Customization command:', command )
  // TODO: Implement filter customization functionality
}

// Watch for external changes
watch(
  () => props.modelValue,
  newValue => {
    Object.assign( localFilters, newValue )
  },
  { deep : true }
)

defineOptions( {
  name : 'UnifiedWorkOrderFilters'
} )
</script>

<style scoped lang="scss">
.unified-work-order-filters {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-top: 1px;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .filter-item {
    display: flex;
    align-items: center;

    &.search-item {
      margin-left: auto;
    }

    &.customization-item {
      .customization-button {
        padding: 8px;
        color: var(--el-text-color-secondary);

        &:hover {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }
    }
  }
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-filters-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  flex-wrap: wrap;

  .active-filters-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  .active-filters-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .clear-all-button {
    font-size: 12px;
    color: var(--el-color-danger);
    margin-left: auto;
  }
}

.custom-date-range {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

// Responsive design
@media (max-width: 1200px) {
  .filters-row {
    .filter-item {
      &.search-item {
        margin-left: 0;
        order: -1;
        width: 100%;
      }
    }
  }
}

@media (max-width: 768px) {
  .unified-work-order-filters {
    padding: 12px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .filter-item {
      width: 100%;

      .el-select,
      .el-input {
        width: 100% !important;
      }
    }
  }

  .actions-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .el-button {
      width: 100%;
    }
  }

  .active-filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .clear-all-button {
      margin-left: 0;
      align-self: flex-end;
    }
  }
}
</style>

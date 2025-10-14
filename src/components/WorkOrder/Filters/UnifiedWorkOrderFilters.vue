<template>
  <div class="unified-work-order-filters">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <!-- Main Filters Row -->
      <div class="filters-row">
        <!-- Assigned To Filter -->
        <div v-if="isFilterVisible('assignedTo')" class="filter-item">
          <el-select
            v-model="localFilters.assignedTo"
            :placeholder="$t('workOrder.filters.assignedTo')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.assignedTo }"
            @change="handleFilterChange"
          >
            <el-option v-for="user in assignedToOptions" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </div>

        <!-- Due Date Filter -->
        <div v-if="isFilterVisible('dueDate')" class="filter-item">
          <el-select
            v-model="localFilters.dueDate"
            :placeholder="$t('workOrder.filters.dueDate')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.dueDate }"
            @change="handleFilterChange"
          >
            <el-option :label="$t('workOrder.filters.overdue')" value="overdue" />
            <el-option :label="$t('workOrder.filters.today')" value="today" />
            <el-option :label="$t('workOrder.filters.thisWeek')" value="thisWeek" />
            <el-option :label="$t('workOrder.filters.thisMonth')" value="thisMonth" />
          </el-select>
        </div>

        <!-- Work Type Filter -->
        <div v-if="isFilterVisible('workType')" class="filter-item">
          <el-select
            v-model="localFilters.workType"
            :placeholder="$t('workOrder.table.workType')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.workType }"
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
        <div v-if="isFilterVisible('priority')" class="filter-item">
          <el-select
            v-model="localFilters.priority"
            :placeholder="$t('workOrder.table.priority')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.priority }"
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

        <!-- State Filter -->
        <div v-if="isFilterVisible('state')" class="filter-item">
          <el-select
            v-model="localFilters.state"
            :placeholder="$t('workOrder.filters.state')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.status }"
            @change="handleFilterChange"
          >
            <el-option v-for="state in stateOptions" :key="state.id" :label="state.name" :value="state.id" />
          </el-select>
        </div>

        <!-- Status Filter -->
        <div v-if="isFilterVisible('status')" class="filter-item">
          <el-select
            v-model="localFilters.status"
            :placeholder="$t('workOrder.filters.status')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.status }"
            @change="handleFilterChange"
          >
            <el-option v-for="status in statusOptions" :key="status.id" :label="status.name" :value="status.id" />
          </el-select>
        </div>

        <!-- Category Filter -->
        <div v-if="isFilterVisible('category')" class="filter-item">
          <el-select
            v-model="localFilters.category"
            :placeholder="$t('workOrder.filters.category')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.category }"
            @change="handleFilterChange"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </div>

        <!-- Equipment Filter -->
        <div v-if="isFilterVisible('equipment')" class="filter-item">
          <el-select
            v-model="localFilters.equipment"
            :placeholder="$t('workOrder.filters.equipment')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.equipment }"
            @change="handleFilterChange"
          >
            <el-option
              v-for="equipment in equipmentOptions"
              :key="equipment.id"
              :label="equipment.name"
              :value="equipment.id"
            />
          </el-select>
        </div>

        <!-- Location Filter -->
        <div v-if="isFilterVisible('location')" class="filter-item">
          <el-select
            v-model="localFilters.location"
            :placeholder="$t('workOrder.filters.location')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.location }"
            @change="handleFilterChange"
          >
            <el-option
              v-for="location in locationOptions"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            />
          </el-select>
        </div>

        <!-- Recurrence Filter -->
        <div v-if="isFilterVisible('recurrence')" class="filter-item">
          <el-select
            v-model="localFilters.recurrence"
            :placeholder="$t('workOrder.filters.recurrence')"
            clearable
            size="default"
            style="width: 140px"
            :class="{ 'highlight-animation': animatingFilters.recurrence }"
            @change="handleFilterChange"
          >
            <el-option
              v-for="recurrence in recurrenceOptions"
              :key="recurrence.id"
              :label="recurrence.name"
              :value="recurrence.id"
            />
          </el-select>
        </div>

        <!-- Right group: Search + Actions -->
        <div class="right-group">
          <!-- Search Input (optional) -->
          <div v-if="isFilterVisible('search')" class="filter-item search-item">
            <el-input
              v-model="searchQuery"
              :placeholder="searchByIdMode ? 'Search work order ID...' : $t('workOrder.placeholder.search')"
              style="width: 200px"
              size="default"
              :class="{ 'highlight-animation': animatingFilters.search }"
              @input="handleSearchInput"
              @clear="handleFilterChange"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #suffix>
                <div class="search-suffix-icons">
                  <el-tooltip :content="searchByIdMode ? 'Search by Name' : 'Search by ID'" placement="bottom">
                    <el-icon
                      :class="['search-mode-toggle', { 'is-active': searchByIdMode }]"
                      @click.stop="toggleSearchMode"
                    >
                      #
                    </el-icon>
                  </el-tooltip>
                </div>
              </template>
            </el-input>
          </div>

          <!-- Action Buttons Row -->
          <div class="actions-row">
            <el-button size="default" type="primary" :icon="EditPen" @click="$emit('create')">
              {{ $t('workOrder.actions.create') }}
            </el-button>

            <el-button size="default" :loading="exportLoading" type="success" :icon="Download" @click="$emit('export')">
              {{ $t('workOrder.actions.export') }}
            </el-button>

            <template v-if="showTodoActions">
              <el-button size="default" type="default" :icon="Refresh" @click="$emit('refresh')">
                {{ $t('workOrder.actions.refresh') }}
              </el-button>
            </template>
          </div>
        </div>

        <!-- Filter Customization Button -->
        <div class="filter-item customization-item">
          <el-tooltip :content="$t('workOrder.filters.filterSetting')" placement="bottom">
            <el-button type="text" class="customization-button" @click="drawerVisible = true">
              <el-icon><Operation /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- Filter Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="$t('workOrder.filters.filterDrawerTitle')"
      direction="rtl"
      size="400px"
      :before-close="closeFilterDrawer"
    >
      <div class="filter-drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <el-input
            v-model="filterSearchTerm"
            :placeholder="$t('workOrder.filters.searchFiltersPlaceholder')"
            class="drawer-search"
            size="default"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Scrollable Filter Sections -->
        <div class="filter-sections-container">
          <!-- Basic Filters Section -->
          <div class="filter-section">
            <h4 class="section-title">
              <el-icon><Grid /></el-icon>
              {{ $t('workOrder.filters.basicFilters') }}
            </h4>
            <div class="filter-list">
              <div
                v-for="filter in filteredBasicFilters"
                :key="filter.key"
                class="filter-item-row"
                :class="{ disabled: isFilterLimitReached && !isFilterVisible(filter.key) }"
                @click="handleDisabledFilterClick(filter.key)"
              >
                <el-checkbox
                  :model-value="isFilterVisible(filter.key)"
                  :disabled="isFilterLimitReached && !isFilterVisible(filter.key)"
                  @change="toggleFilterVisibility(filter.key)"
                  class="filter-checkbox"
                >
                  <div class="filter-info">
                    <el-icon class="filter-icon">
                      <component :is="filter.icon" />
                    </el-icon>
                    <span class="filter-label">{{ filter.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </div>

          <!-- Advanced Filters Section -->
          <div class="filter-section">
            <h4 class="section-title">
              <el-icon><Setting /></el-icon>
              {{ $t('workOrder.filters.workOrderFilters') }}
            </h4>
            <div class="filter-list">
              <div
                v-for="filter in filteredAdvancedFilters"
                :key="filter.key"
                class="filter-item-row"
                :class="{ disabled: isFilterLimitReached && !isFilterVisible(filter.key) }"
                @click="handleDisabledFilterClick(filter.key)"
              >
                <el-checkbox
                  :model-value="isFilterVisible(filter.key)"
                  :disabled="isFilterLimitReached && !isFilterVisible(filter.key)"
                  @change="toggleFilterVisibility(filter.key)"
                  class="filter-checkbox"
                >
                  <div class="filter-info">
                    <el-icon class="filter-icon">
                      <component :is="filter.icon" />
                    </el-icon>
                    <span class="filter-label">{{ filter.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filters Summary -->
        <div v-if="activeFilterTags.length > 0" class="active-filters-summary">
          <div class="summary-header">
            <h4 class="summary-title">
              <el-icon><Filter /></el-icon>
              {{ $t('workOrder.filters.activeFilters') || 'Active Filters' }}
            </h4>
            <el-tooltip :content="$t('workOrder.filters.clearAll') || 'Clear all filters'" placement="top">
              <el-button type="text" size="small" class="clear-all-button" @click="handleClearAllFilters">
                <el-icon><CircleClose /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          <div class="summary-content">
            <el-tag
              v-for="tag in activeFilterTags"
              :key="tag.key"
              type="info"
              size="small"
              closable
              @close="handleRemoveFilter(tag.key)"
              class="filter-tag"
            >
              {{ tag.label }}
            </el-tag>
          </div>
        </div>
        <div v-else class="active-filters-summary empty">
          <div class="empty-state">
            <el-icon class="empty-icon"><Filter /></el-icon>
            <span class="empty-text">{{ $t('workOrder.filters.noActiveFilters') || 'No active filters' }}</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { reactive, computed, watch, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Search,
  Operation,
  Setting,
  EditPen,
  Download,
  Refresh,
  Grid,
  Filter,
  CircleClose
} from '@element-plus/icons-vue'
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
  },
  currentView : {
    type : String,
    default : 'table'
  }
} )

// Emits
const emit = defineEmits( ['update:modelValue', 'filter-change', 'create', 'export', 'refresh'] )
const { t } = useI18n()
const commonDataStore = useCommonDataStore()

// Search mode state
const searchQuery = ref( '' )
const searchByIdMode = ref( false )
let searchDebounceTimer = null

// Local filters state
const localFilters = reactive( {
  assignedTo : props.modelValue.assignedTo || null,
  dueDate : props.modelValue.dueDate || null,
  workType : props.modelValue.workType || null,
  priority : props.modelValue.priority || null,
  state : props.modelValue.state || null,
  category : props.modelValue.category || null,
  search : props.modelValue.search || '',
  work_order_id : props.modelValue.work_order_id || null,
  latest_per_recurrence : props.currentView !== 'calendar',
  status : props.modelValue.status || null,
  equipment : props.modelValue.equipment || null,
  location : props.modelValue.location || null,
  recurrence : props.modelValue.recurrence || null
} )

// Filter drawer state
const drawerVisible = ref( false )

// Screen width and filter limits
const screenWidth = ref( window.innerWidth )
const maxFilters = computed( () => ( screenWidth.value > 1800 ? 8 : 5 ) )
const activeFilterCount = computed( () => {
  return Object.values( availableFilters ).filter( f => f.visible ).length
} )
const isFilterLimitReached = computed( () => activeFilterCount.value >= maxFilters.value )

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

onMounted( () => {
  window.addEventListener( 'resize', updateScreenWidth )
} )

onUnmounted( () => {
  window.removeEventListener( 'resize', updateScreenWidth )
  // Clear search debounce timer if exists
  if ( searchDebounceTimer ) {
    clearTimeout( searchDebounceTimer )
  }
} )

// Watch for screen width changes to handle filter limits
watch( screenWidth, ( newWidth, oldWidth ) => {
  // Check if we crossed the breakpoint from large to small
  if ( oldWidth > 1800 && newWidth <= 1800 ) {
    const maxAllowed = 5
    if ( activeFilterCount.value > maxAllowed ) {
      const excessCount = activeFilterCount.value - maxAllowed
      const visibleFilters = Object.keys( availableFilters ).filter( key => availableFilters[key].visible )

      // Shuffle the array of visible filters
      for ( let i = visibleFilters.length - 1; i > 0; i-- ) {
        const j = Math.floor( Math.random() * ( i + 1 ) )
        ;[visibleFilters[i], visibleFilters[j]] = [visibleFilters[j], visibleFilters[i]]
      }

      // Deselect the required number of random filters
      for ( let i = 0; i < excessCount; i++ ) {
        const filterToDisable = visibleFilters[i]
        availableFilters[filterToDisable].visible = false
      }

      ElMessage.info( t( 'workOrder.filters.autoDeselected', { count : excessCount } ) )
    }
  }
} )

// Animation state for border highlight
const animatingFilters = reactive( {
  assignedTo : false,
  dueDate : false,
  workType : false,
  priority : false,
  search : false,
  state : false,
  status : false,
  category : false,
  equipment : false,
  location : false,
  recurrence : false
} )

// Available filters configuration
const availableFilters = reactive( {
  assignedTo : { visible : true, category : 'basic' },
  dueDate : { visible : true, category : 'basic' },
  workType : { visible : true, category : 'basic' },
  priority : { visible : true, category : 'basic' },
  search : { visible : true, category : 'basic' },
  state : { visible : false, category : 'advanced' },
  status : { visible : false, category : 'advanced' },
  category : { visible : false, category : 'advanced' },
  equipment : { visible : false, category : 'advanced' },
  location : { visible : false, category : 'advanced' },
  recurrence : { visible : false, category : 'advanced' }
} )

// Filter options
const assignedToOptions = computed( () => {
  // TODO: Get from user store or API
  return [
    { id : 1, name : 'Erik Yu' },
    { id : 2, name : 'Jane Smith' },
    { id : 3, name : 'Mike Johnson' }
  ]
} )

const workTypeOptions = computed( () => commonDataStore.workTypes || [] )
const priorityOptions = computed( () => commonDataStore.priorities || [] )
const stateOptions = computed( () => commonDataStore.states || [] )
const categoryOptions = computed( () => commonDataStore.categories || [] )

// Additional filter options
const statusOptions = computed( () => [
  { id : 'pending', name : t( 'workOrder.status.pending' ) },
  { id : 'in_progress', name : t( 'workOrder.status.inProgress' ) },
  { id : 'completed', name : t( 'workOrder.status.completed' ) },
  { id : 'cancelled', name : t( 'workOrder.status.cancelled' ) }
] )

const equipmentOptions = computed( () => [
  { id : 1, name : 'Production Line A' },
  { id : 2, name : 'Production Line B' },
  { id : 3, name : 'Packaging Machine 1' },
  { id : 4, name : 'Packaging Machine 2' }
] )

const locationOptions = computed( () => [
  { id : 1, name : 'Factory Floor 1' },
  { id : 2, name : 'Factory Floor 2' },
  { id : 3, name : 'Warehouse' },
  { id : 4, name : 'Office Building' }
] )

const recurrenceOptions = computed( () => [
  { id : 1, name : t( 'workOrder.recurrence.none' ) },
  { id : 2, name : t( 'workOrder.recurrence.daily' ) },
  { id : 3, name : t( 'workOrder.recurrence.weekly' ) },
  { id : 4, name : t( 'workOrder.recurrence.monthlyByDate' ) },
  { id : 5, name : t( 'workOrder.recurrence.yearly' ) }
] )

// Filter definitions for drawer
const filterDefinitions = computed( () => ( {
  assignedTo : {
    key : 'assignedTo',
    label : t( 'workOrder.filters.assignedTo' ),
    icon : 'User',
    category : 'basic'
  },
  dueDate : {
    key : 'dueDate',
    label : t( 'workOrder.filters.dueDate' ),
    icon : 'Calendar',
    category : 'basic'
  },
  workType : {
    key : 'workType',
    label : t( 'workOrder.table.workType' ),
    icon : 'Tools',
    category : 'basic'
  },
  priority : {
    key : 'priority',
    label : t( 'workOrder.table.priority' ),
    icon : 'Flag',
    category : 'basic'
  },
  search : {
    key : 'search',
    label : t( 'workOrder.filters.search' ),
    icon : 'Search',
    category : 'basic'
  },
  state : {
    key : 'state',
    label : t( 'workOrder.filters.state' ),
    icon : 'CircleCheck',
    category : 'advanced'
  },
  status : {
    key : 'status',
    label : t( 'workOrder.filters.status' ),
    icon : 'CircleCheck',
    category : 'advanced'
  },
  category : {
    key : 'category',
    label : t( 'workOrder.filters.category' ),
    icon : 'Collection',
    category : 'advanced'
  },
  equipment : {
    key : 'equipment',
    label : t( 'workOrder.filters.equipment' ),
    icon : 'Setting',
    category : 'advanced'
  },
  location : {
    key : 'location',
    label : t( 'workOrder.filters.location' ),
    icon : 'Location',
    category : 'advanced'
  },
  recurrence : {
    key : 'recurrence',
    label : t( 'workOrder.filters.recurrence' ),
    icon : 'Refresh',
    category : 'advanced'
  }
} ) )

// Computed filter categories
const basicFilters = computed( () => Object.values( filterDefinitions.value ).filter( f => f.category === 'basic' ) )
const advancedFilters = computed( () => Object.values( filterDefinitions.value ).filter( f => f.category === 'advanced' ) )

// Search term for filtering the drawer lists
const filterSearchTerm = ref( '' )

// Case-insensitive, instant filtering of labels; auto-hide non-matches
const filteredBasicFilters = computed( () => {
  const q = filterSearchTerm.value.trim().toLowerCase()
  if ( !q ) return basicFilters.value
  return basicFilters.value.filter( f => ( f.label || '' ).toLowerCase().includes( q ) )
} )

const filteredAdvancedFilters = computed( () => {
  const q = filterSearchTerm.value.trim().toLowerCase()
  if ( !q ) return advancedFilters.value
  return advancedFilters.value.filter( f => ( f.label || '' ).toLowerCase().includes( q ) )
} )

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
      thisMonth : t( 'workOrder.filters.thisMonth' )
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

  if ( localFilters.state ) {
    const state = stateOptions.value.find( s => s.id === localFilters.state )
    tags.push( {
      key : 'state',
      label : `${t( 'workOrder.table.state' )}: ${state?.name || localFilters.state}`
    } )
  }

  if ( localFilters.category ) {
    const category = categoryOptions.value.find( c => c.id === localFilters.category )
    tags.push( {
      key : 'category',
      label : `${t( 'workOrder.table.category' )}: ${category?.name || localFilters.category}`
    } )
  }

  if ( localFilters.search ) {
    tags.push( {
      key : 'search',
      label : `${t( 'workOrder.placeholder.search' )}: ${localFilters.search}`
    } )
  }

  if ( localFilters.work_order_id ) {
    tags.push( {
      key : 'work_order_id',
      label : `Work Order ID: ${localFilters.work_order_id}`
    } )
  }

  if ( localFilters.status ) {
    const status = statusOptions.value.find( s => s.id === localFilters.status )
    tags.push( {
      key : 'status',
      label : `${t( 'workOrder.filters.status' )}: ${status?.name || localFilters.status}`
    } )
  }

  if ( localFilters.equipment ) {
    const equipment = equipmentOptions.value.find( e => e.id === localFilters.equipment )
    tags.push( {
      key : 'equipment',
      label : `${t( 'workOrder.filters.equipment' )}: ${equipment?.name || localFilters.equipment}`
    } )
  }

  if ( localFilters.location ) {
    const location = locationOptions.value.find( l => l.id === localFilters.location )
    tags.push( {
      key : 'location',
      label : `${t( 'workOrder.filters.location' )}: ${location?.name || localFilters.location}`
    } )
  }

  if ( localFilters.recurrence ) {
    const recurrence = recurrenceOptions.value.find( r => r.id === localFilters.recurrence )
    tags.push( {
      key : 'recurrence',
      label : `${t( 'workOrder.filters.recurrence' )}: ${recurrence?.name || localFilters.recurrence}`
    } )
  }

  return tags
} )

// Methods
const handleSearchInput = () => {
  // Clear any existing debounce timer
  if ( searchDebounceTimer ) {
    clearTimeout( searchDebounceTimer )
  }

  // Update the appropriate filter based on search mode
  if ( searchByIdMode.value ) {
    localFilters.work_order_id = searchQuery.value ? parseInt( searchQuery.value, 10 ) : null
    localFilters.search = null
  } else {
    localFilters.search = searchQuery.value
    localFilters.work_order_id = null
  }

  // Debounce the filter change by 300ms
  searchDebounceTimer = setTimeout( () => {
    handleFilterChange()
  }, 300 )
}

const toggleSearchMode = () => {
  const hasSearchContent = searchQuery.value && searchQuery.value.trim() !== ''

  searchByIdMode.value = !searchByIdMode.value

  if ( hasSearchContent ) {
    // If there's content, apply it as a filter using the new mode
    if ( searchByIdMode.value ) {
      // Switched TO ID mode
      localFilters.work_order_id = parseInt( searchQuery.value, 10 )
      localFilters.search = null
    } else {
      // Switched TO Name mode
      localFilters.search = searchQuery.value
      localFilters.work_order_id = null
    }
    handleFilterChange()
  } else {
    // If no content, just clear the alternative filter
    if ( searchByIdMode.value ) {
      localFilters.search = null
    } else {
      localFilters.work_order_id = null
    }
  }
}

const handleFilterChange = async() => {
  emit( 'update:modelValue', { ...localFilters } )
}

const closeFilterDrawer = () => {
  drawerVisible.value = false
}

const handleDisabledFilterClick = filterKey => {
  if ( isFilterLimitReached.value && !isFilterVisible( filterKey ) ) {
    ElMessage.warning( t( 'workOrder.filters.noSpace' ) )
  }
}

const toggleFilterVisibility = async filterKey => {
  const wasVisible = availableFilters[filterKey].visible

  // Prevent adding more filters if the limit is reached
  if ( !wasVisible && isFilterLimitReached.value ) {
    ElMessage.warning( t( 'workOrder.filters.limitReached', { max : maxFilters.value } ) )
    return
  }

  availableFilters[filterKey].visible = !wasVisible

  // Trigger animation for the toggled filter item in main filters row
  await triggerFilterHighlightAnimation( filterKey )
}

// Animation method for border highlight
const triggerFilterHighlightAnimation = async filterKey => {
  // Wait for DOM update to ensure the filter item is rendered/removed
  await nextTick()

  // For hiding animation, the element will be removed by v-if, so we skip it
  if ( availableFilters[filterKey].visible ) {
    // Start animation
    animatingFilters[filterKey] = true

    // Remove animation after 2 seconds
    setTimeout( () => {
      animatingFilters[filterKey] = false
    }, 2000 )
  }
}

const isFilterVisible = filterKey => {
  return availableFilters[filterKey]?.visible || false
}

const handleRemoveFilter = filterKey => {
  // Clear the filter value
  localFilters[filterKey] = null

  // If removing search or work_order_id, also clear the search query
  if ( filterKey === 'search' || filterKey === 'work_order_id' ) {
    searchQuery.value = ''
  }

  // Emit the change to parent
  handleFilterChange()
}

const handleClearAllFilters = () => {
  // Clear all filter values except latest_per_recurrence
  Object.keys( localFilters ).forEach( key => {
    if ( key !== 'latest_per_recurrence' ) {
      localFilters[key] = null
    }
  } )

  // Clear search-related state
  searchQuery.value = ''
  searchByIdMode.value = false

  // Emit the change to parent
  handleFilterChange()
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
  padding-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .filter-item {
    display: flex;
    align-items: center;

    &.search-item {
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

.right-group {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Form field highlight animation styles */
.el-select.highlight-animation,
.el-input.highlight-animation,
.el-date-editor.highlight-animation {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    animation: formFieldHighlight 1s ease-in-out;
  }
}

// Form field highlight animation keyframes
@keyframes formFieldHighlight {
  0% {
    border-color: var(--el-border-color);
    box-shadow: none;
  }
  50% {
    border-color: #0085a4;
    box-shadow: 0 0 0 2px rgba(0, 133, 164, 0.5);
  }
  100% {
    border-color: var(--el-border-color);
    box-shadow: none;
  }
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
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

// Filter Drawer Styles
.filter-drawer-content {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-sections-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 3px;

    &:hover {
      background: var(--el-fill-color-darker);
    }
  }
}

.drawer-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 0 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
  background: var(--el-bg-color);

  .drawer-subtitle {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.4;
  }

  display: flex;
  flex-direction: column;
  gap: 10px;

  .drawer-search :deep(.el-input__wrapper) {
    box-shadow: none;
  }
}

.filter-section {
  padding: 0 0 8px 0;
  margin-bottom: 20px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    .el-icon {
      color: var(--el-color-primary);
      font-size: 16px;
    }
  }
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 6px; /* tighter list */
}

.filter-item-row {
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.15s ease;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background-color: transparent; // Override hover effect
    }
  }

  &:hover {
    background-color: var(--el-fill-color-lighter);
  }

  .filter-checkbox {
    width: 100%;

    :deep(.el-checkbox__label) {
      padding-left: 8px;
      font-size: 13px;
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  .filter-icon {
    color: var(--el-text-color-secondary);
    font-size: 16px;
    flex-shrink: 0;
  }

  .filter-label {
    font-size: 15px;
    color: var(--el-text-color-primary);
    flex: 1;
  }
}

:deep(.el-drawer__body) {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

// Active Filters Summary Section
.active-filters-summary {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 16px 0 0 0;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);

  &.empty {
    padding: 12px 0 0 0;

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: var(--el-fill-color-lighter);
      border-radius: 6px;

      .empty-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
      }

      .empty-text {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .summary-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        color: var(--el-color-primary);
        font-size: 16px;
      }
    }

    .clear-all-button {
      padding: 4px;
      color: var(--el-text-color-secondary);
      transition: all 0.2s ease;

      .el-icon {
        font-size: 18px;
      }

      &:hover {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
        border-radius: 4px;
      }

      &:active {
        color: var(--el-color-danger-dark-2);
      }
    }
  }

  .summary-content {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
    padding: 2px;

    // Custom scrollbar for summary content
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: var(--el-fill-color-lighter);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-fill-color-dark);
      border-radius: 2px;

      &:hover {
        background: var(--el-fill-color-darker);
      }
    }

    .filter-tag {
      max-width: 100%;
      font-size: 12px;

      :deep(.el-tag__content) {
        display: inline-block;
        max-width: 280px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// Drawer responsive design
:deep(.el-drawer) {
  @media (max-width: 768px) {
    width: 100% !important;
  }
}

:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.2); /* adjust opacity */
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .el-drawer__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

:deep(.el-drawer__body) {
  padding: 20px;
}

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

// Search toggle styles
.search-suffix-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-mode-toggle {
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  color: #909399;
  transition: color 0.2s ease;
}

.search-mode-toggle:hover {
  color: var(--el-color-primary);
}

.search-mode-toggle.is-active {
  color: var(--el-color-primary);
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

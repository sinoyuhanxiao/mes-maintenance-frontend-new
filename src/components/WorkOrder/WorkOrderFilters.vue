<template>
  <div class="work-order-filters">
    <div class="filter-container">
      <div class="filter-left">
        <!-- Work Order Name Search -->
        <el-input
          v-model="filters.title"
          :placeholder="$t('workOrder.placeholder.workOrderName')"
          style="width: 120px; margin-right: 20px"
          class="filter-item"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <!-- Maintenance Type Filter -->
        <el-select
          v-model="filters.importance"
          :placeholder="$t('workOrder.placeholder.maintenanceType')"
          clearable
          style="width: 120px; margin-right: 20px"
          class="filter-item"
          @change="handleSearch"
        >
          <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
        </el-select>

        <!-- Priority Filter -->
        <el-select
          v-model="filters.type"
          :placeholder="$t('workOrder.form.priority')"
          clearable
          class="filter-item"
          style="width: 130px; margin-right: 20px"
          @change="handleSearch"
        >
          <el-option
            v-for="item in priorityOptions"
            :key="item.key"
            :label="`${item.display_name} (${item.key})`"
            :value="item.key"
          />
        </el-select>

        <!-- Sort Options -->
        <el-select
          v-model="filters.sort"
          style="width: 140px; margin-right: 20px"
          class="filter-item"
          @change="handleSearch"
        >
          <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <!-- Search Button -->
        <el-button
          v-wave
          class="filter-item"
          type="default"
          :icon="Search"
          @click="handleSearch"
          :aria-label="$t('workOrder.actions.search')"
        >
          {{ $t('workOrder.actions.search') }}
        </el-button>
      </div>

      <div class="filter-right">
        <!-- Dashboard Button -->
        <el-button
          class="filter-item"
          type="primary"
          :icon="Menu"
          @click="$emit('dashboard')"
          :aria-label="$t('workOrder.actions.dashboard')"
        >
          {{ $t('workOrder.actions.dashboard') }}
        </el-button>

        <!-- Create Button -->
        <el-button
          class="filter-item"
          type="primary"
          :icon="EditPen"
          @click="$emit('create')"
          :aria-label="$t('workOrder.actions.create')"
        >
          {{ $t('workOrder.actions.create') }}
        </el-button>

        <!-- Export Button -->
        <el-button
          v-wave
          :loading="exportLoading"
          class="filter-item"
          type="success"
          :icon="Download"
          @click="$emit('export')"
          :aria-label="$t('workOrder.actions.export')"
        >
          {{ $t('workOrder.actions.export') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, EditPen, Download, Menu } from '@element-plus/icons-vue'

// Props
const props = defineProps( {
  modelValue : {
    type : Object,
    default : () => ( {} )
  },
  exportLoading : {
    type : Boolean,
    default : false
  }
} )

// Emits
const emit = defineEmits( ['update:modelValue', 'search', 'create', 'export'] )

const { t } = useI18n()

// Local filters state
const filters = reactive( {
  title : props.modelValue.title || '',
  importance : props.modelValue.importance || undefined,
  type : props.modelValue.type || undefined,
  sort : props.modelValue.sort || '-id'
} )

// Options
const importanceOptions = ref( [1, 2, 3] )

const priorityOptions = ref( [
  { key : 'CN', display_name : 'China' },
  { key : 'US', display_name : 'USA' },
  { key : 'JP', display_name : 'Japan' },
  { key : 'EU', display_name : 'Eurozone' }
] )

const sortOptions = computed( () => [
  {
    label : t( 'common.sortIdAsc' ),
    key : '+id'
  },
  {
    label : t( 'common.sortIdDesc' ),
    key : '-id'
  }
] )

// Methods
const handleSearch = () => {
  // Update parent component
  emit( 'update:modelValue', { ...filters } )
  emit( 'search', { ...filters } )
}

// Reset filters
const resetFilters = () => {
  filters.title = ''
  filters.importance = undefined
  filters.type = undefined
  filters.sort = '-id'
  handleSearch()
}

// Expose methods for parent component
defineExpose( {
  resetFilters
} )

defineOptions( {
  name : 'WorkOrderFilters'
} )
</script>

<style scoped lang="scss">
.work-order-filters {
  .filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;

    .filter-item {
      display: inline-block;
      vertical-align: middle;
      margin-bottom: 10px;
    }
  }

  .filter-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  // Responsive design
  @media (max-width: 768px) {
    .filter-container {
      flex-direction: column;
      gap: 16px;
    }

    .filter-left,
    .filter-right {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>

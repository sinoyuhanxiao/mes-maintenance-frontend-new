<template>
  <div class="standard-dialog-container">
    <!-- Standard Table -->
    <div class="standard-dialog-content">
      <!-- Search Container (always visible) -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="Search standards..."
          size="default"
          clearable
          class="search-input"
          @input="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="4" animated />
        </div>

        <div v-else-if="standardTemplates.length === 0" class="empty-container">
          <el-empty description="No standards found" :image-size="80" />
        </div>

        <div v-else>
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ paginationInfo.total }} standards
            </div>
            <el-select v-model="pageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select>
          </div>

          <CardTable
            :module="7"
            :data="standardTemplates"
            :maxHeight="'60vh'"
            :totalItems="totalItems"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :showBorder="true"
            :showPagination="true"
            :showSearch="false"
            :loading="loading"
            :focusedCardId="focusedCardId"
            @selection="handleStandardAction"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="standard-dialog-footer">
      <div class="footer-actions">
        <el-button :type="focusedCardId ? 'primary' : ''" :disabled="!focusedCardId" @click="handlePreview" plain>
          Preview
        </el-button>
        <el-button type="primary" :disabled="selectedStandards.size === 0" @click="handleAddStandards">
          Add Standards ({{ selectedStandards.size }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CardTable from '../Tables/CardTable.vue'
import { searchStandards } from '@/api/task-library'
import { debounce } from 'lodash-es'

// Define emits
const emit = defineEmits( ['close', 'addStandards'] )

// Reactive state
const standardTemplates = ref( [] )
const loading = ref( false )
const searchQuery = ref( '' )
const totalItems = ref( 0 )
const currentPage = ref( 1 )
const pageSize = ref( 20 )

// Track selected standards
const selectedStandards = ref( new Set() )

// Track focused card for preview functionality
const focusedCardId = ref( null )

// Computed properties
const selectedStandardsList = computed( () => {
  return standardTemplates.value.filter( standard => selectedStandards.value.has( standard.id || standard._id ) )
} )

const paginationInfo = computed( () => {
  const start = totalItems.value === 0 ? 0 : ( currentPage.value - 1 ) * pageSize.value + 1
  const end = Math.min( currentPage.value * pageSize.value, totalItems.value )
  return {
    start,
    end,
    total : totalItems.value
  }
} )

// API functions
const fetchStandards = async( resetPage = false ) => {
  if ( resetPage ) {
    currentPage.value = 1
  }

  loading.value = true
  try {
    const filter = {}

    // Add search query if provided
    if ( searchQuery.value?.trim() ) {
      filter.keyword = searchQuery.value.trim()
    }

    const pagination = {
      page : currentPage.value,
      size : pageSize.value,
      sortField : 'createdAt',
      direction : 'DESC'
    }

    const response = await searchStandards( filter, pagination )

    // Handle response data structure
    const content = response.data?.content || response.data || []
    standardTemplates.value = Array.isArray( content ) ? content : []

    // Handle total count from different possible response structures
    totalItems.value =
      response.data?.totalElements ||
      response.data?.total ||
      response.totalElements ||
      response.total ||
      standardTemplates.value.length
  } catch ( error ) {
    console.error( 'Error fetching standards:', error )
    ElMessage.error( 'Failed to load standards' )
    standardTemplates.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = page => {
  currentPage.value = page
  fetchStandards()
}

const handlePageSizeChange = newSize => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchStandards()
}

const handleStandardAction = selectionData => {
  const { id, action } = selectionData

  if ( action === 'check' ) {
    selectedStandards.value.add( id )
  } else if ( action === 'uncheck' ) {
    selectedStandards.value.delete( id )
  } else if ( action === 'focus' ) {
    focusedCardId.value = id
  }
}

const handleAddStandards = () => {
  if ( selectedStandards.value.size > 0 ) {
    emit( 'addStandards', selectedStandardsList.value )
    selectedStandards.value.clear()
    emit( 'close' )
  }
}

const handlePreview = () => {
  // TODO: Implement preview functionality
  console.log( 'Preview clicked for selected standards:', selectedStandardsList.value )
}

// Debounced search handler for better performance
const debouncedSearch = debounce( () => {
  fetchStandards( true )
}, 300 )

// Event handlers
const handleSearch = () => {
  selectedStandards.value.clear() // Clear selections when searching
  focusedCardId.value = null // Clear focused card when searching
  debouncedSearch()
}

// Watch for search query changes
watch( searchQuery, () => {
  if ( !searchQuery.value?.trim() ) {
    selectedStandards.value.clear()
    focusedCardId.value = null
    fetchStandards( true )
  }
} )

// Lifecycle
onMounted( () => {
  fetchStandards()
} )

defineOptions( {
  name : 'AddStandard'
} )
</script>

<style scoped lang="scss">
.standard-dialog-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  padding: 0;
}

.standard-dialog-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .search-container {
    margin-bottom: 10px;

    .search-input {
      width: 50%;
    }
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .loading-container,
    .empty-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pagination-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 0 4px;

      .info-text {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.standard-dialog-footer {
  display: flex;
  justify-content: right;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 16px;

  .footer-actions {
    display: flex;
    gap: 8px;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .standard-dialog-container {
    height: 500px;
  }

  .standard-dialog-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .footer-actions {
      justify-content: center;
    }
  }
}
</style>

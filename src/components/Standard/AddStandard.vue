<template>
  <div class="standard-dialog-container">
    <!-- Main Add Standard Content -->
    <div v-if="!showPreviewDialog" class="standard-dialog-content">
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
        <el-link type="primary" @click="handleCreateNewStandard" class="new-standard-link"> + New Standard </el-link>
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

          <WorkOrderStandardSelector
            :data="standardTemplates"
            :maxHeight="selectedCount > 0 ? '45vh' : '60vh'"
            :totalItems="totalItems"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :showBorder="true"
            :showPagination="true"
            :focusedCardId="focusedCardId"
            :selectedItems="selectedStandards"
            @selection="handleStandardAction"
            @page-change="handlePageChange"
          />
        </div>
      </div>

      <!-- Selected Standards Summary -->
      <div v-if="!showPreviewDialog && selectedCount > 0" class="selected-standards-summary">
        <div class="summary-header">
          <h4 class="summary-title">
            <el-icon><Collection /></el-icon>
            Selected Standards ({{ selectedCount }})
          </h4>
          <el-tooltip content="Clear all selections" placement="top">
            <el-button type="text" size="small" class="clear-all-button" @click="handleClearAllSelections">
              <el-icon><CircleClose /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
        <div class="summary-content">
          <el-tag
            v-for="standard in selectedStandardsList"
            :key="standard.id"
            type="primary"
            size="small"
            closable
            @close="handleRemoveSelection(standard.id)"
            class="selection-tag"
          >
            {{ standard.name }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="standard-dialog-footer">
      <div class="footer-actions">
        <el-button :type="focusedCardId ? 'success' : ''" :disabled="!focusedCardId" @click="handlePreview">
          Preview
        </el-button>
        <el-button
          type="primary"
          :disabled="selectedCount === 0 || isAddingStandards"
          :loading="isAddingStandards"
          @click="handleAddStandards"
        >
          Add Standards ({{ selectedCount }})
        </el-button>
      </div>
    </div>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="showPreviewDialog"
      width="700px"
      top="5vh"
      :before-close="handleClosePreview"
      class="preview-dialog"
    >
      <template #header="{ titleId }">
        <div class="preview-dialog-header">
          <el-button type="text" @click="handleBackToAddStandard" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span :id="titleId" class="dialog-title"> Preview: {{ getPreviewStandardTitle() }} </span>
        </div>
      </template>

      <StandardsPreview v-if="previewStandardId" :standard-id="previewStandardId" />
    </el-dialog>

    <!-- Create Standard Dialog -->
    <CreateStandardDialog
      :visible="showCreateStandardDialog"
      :is-edit-mode="false"
      :initial-data="createStandardForm"
      :loading="createStandardLoading"
      @close="handleCreateStandardCancel"
      @submit="handleCreateStandardSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, ArrowLeft, Collection, CircleClose } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkOrderStandardSelector from '@/components/WorkOrder/Selectors/WorkOrderStandardSelector.vue'
import StandardsPreview from '@/components/TaskLibrary/StandardsPreview.vue'
import CreateStandardDialog from '@/components/TaskLibrary/CreateStandardDialog.vue'
import { searchStandards, createStandard } from '@/api/task-library'
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
const selectedStandardsData = ref( new Map() ) // Store full standard objects
const isAddingStandards = ref( false )

// Track focused card for preview functionality
const focusedCardId = ref( null )

// Preview dialog state
const showPreviewDialog = ref( false )
const previewStandardId = ref( null )

// Create standard dialog state
const showCreateStandardDialog = ref( false )
const createStandardForm = ref( {
  name : '',
  description : '',
  category : '',
  items : []
} )
const createStandardLoading = ref( false )

// Computed properties
const selectedStandardsList = computed( () => {
  return Array.from( selectedStandardsData.value.values() )
} )

const selectedCount = computed( () => selectedStandardsData.value.size )

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
  const { id, action, data } = selectionData

  if ( action === 'check' ) {
    selectedStandards.value.add( id )
    selectedStandardsData.value.set( id, data ) // Store full standard object
    // Force reactivity by creating new Set and Map
    selectedStandards.value = new Set( selectedStandards.value )
    selectedStandardsData.value = new Map( selectedStandardsData.value )
  } else if ( action === 'uncheck' ) {
    selectedStandards.value.delete( id )
    selectedStandardsData.value.delete( id )
    // Force reactivity by creating new Set and Map
    selectedStandards.value = new Set( selectedStandards.value )
    selectedStandardsData.value = new Map( selectedStandardsData.value )
  } else if ( action === 'focus' ) {
    focusedCardId.value = id
  }
}

const handleRemoveSelection = standardId => {
  selectedStandards.value.delete( standardId )
  selectedStandardsData.value.delete( standardId )
  selectedStandards.value = new Set( selectedStandards.value )
  selectedStandardsData.value = new Map( selectedStandardsData.value )
}

const handleClearAllSelections = () => {
  selectedStandards.value.clear()
  selectedStandardsData.value.clear()
  selectedStandards.value = new Set( selectedStandards.value )
  selectedStandardsData.value = new Map( selectedStandardsData.value )
}

const handleAddStandards = () => {
  if ( selectedStandardsData.value.size === 0 || isAddingStandards.value ) {
    return
  }

  isAddingStandards.value = true
  try {
    const standardsToAdd = selectedStandardsList.value
    if ( standardsToAdd.length === 0 ) {
      ElMessage.warning( 'No valid standards to add' )
      return
    }

    emit( 'addStandards', standardsToAdd )
    handleClearAllSelections()
    emit( 'close' )
  } catch ( error ) {
    console.error( 'Error adding standards:', error )
    ElMessage.error( 'Failed to add standards. Please try again.' )
  } finally {
    isAddingStandards.value = false
  }
}

const handlePreview = () => {
  if ( !focusedCardId.value ) {
    ElMessage.warning( 'Please select a standard to preview' )
    return
  }

  previewStandardId.value = focusedCardId.value
  showPreviewDialog.value = true
}

const handleBackToAddStandard = () => {
  showPreviewDialog.value = false
  previewStandardId.value = null
}

const handleClosePreview = () => {
  handleBackToAddStandard()
}

const getPreviewStandardTitle = () => {
  if ( !previewStandardId.value ) return 'Standard'

  const standard = standardTemplates.value.find( s => ( s.id || s._id || s.standard_id ) === previewStandardId.value )
  return standard?.name || 'Standard'
}

// Debounced search handler for better performance
const debouncedSearch = debounce( () => {
  fetchStandards( true )
}, 300 )

// Event handlers
const handleSearch = () => {
  // DO NOT clear selections - allow persistence across search
  focusedCardId.value = null // Clear focused card when searching
  debouncedSearch()
}

// Create standard event handlers
const handleCreateNewStandard = () => {
  createStandardForm.value = {
    name : '',
    description : '',
    category : '',
    items : []
  }
  showCreateStandardDialog.value = true
}

const handleCreateStandardCancel = () => {
  showCreateStandardDialog.value = false
  createStandardForm.value = {
    name : '',
    description : '',
    category : '',
    items : []
  }
}

const handleCreateStandardSubmit = async formData => {
  showCreateStandardDialog.value = false
  await promptStandardSaveMode( formData )
}

const promptStandardSaveMode = async formData => {
  try {
    await ElMessageBox.confirm(
      'Do you want to save this as a standard template or only for this work order?',
      'Save Standard',
      {
        confirmButtonText : 'Save as Template',
        cancelButtonText : 'Save Only for Work Order',
        distinguishCancelAndClose : true,
        type : 'info'
      }
    )

    await handleSaveAsTemplate( formData )
  } catch ( action ) {
    if ( action === 'cancel' ) {
      handleSaveForWorkOrderOnly( formData )
    }
  }
}

const handleSaveAsTemplate = async formData => {
  try {
    createStandardLoading.value = true

    const payload = {
      ...formData,
      module : 200
    }

    const response = await createStandard( payload )

    ElMessage.success( 'Standard created successfully' )

    // Refresh the standards list
    await fetchStandards( true )

    // Auto-select the new standard
    const newStandardId = response.data?.id || response.data?._id
    if ( newStandardId ) {
      const newStandard = standardTemplates.value.find( s => s.id === newStandardId )
      if ( newStandard ) {
        selectedStandards.value.add( newStandardId )
        selectedStandardsData.value.set( newStandardId, newStandard )
        selectedStandards.value = new Set( selectedStandards.value )
        selectedStandardsData.value = new Map( selectedStandardsData.value )
        focusedCardId.value = newStandardId
      }
    }
  } catch ( error ) {
    console.error( 'Failed to create standard:', error )
    ElMessage.error( 'Failed to create standard' )
  } finally {
    createStandardLoading.value = false
  }
}

const handleSaveForWorkOrderOnly = formData => {
  // Create a standalone standard for this work order only
  const standaloneStandard = {
    id : `work-order-standard-${Date.now()}`,
    name : formData.name,
    description : formData.description,
    category : formData.category,
    items : formData.items,
    estimated_minutes : 15,
    isStandalone : true
  }

  // Emit directly to work order without saving to library
  emit( 'addStandards', [standaloneStandard] )

  ElMessage.success( 'Standard added to work order' )

  // Close the main dialog
  emit( 'close' )
}

// Watch for search query changes
watch( searchQuery, () => {
  if ( !searchQuery.value?.trim() ) {
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
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    display: flex;
    gap: 12px;
    align-items: center;

    .search-input {
      width: 50%;
    }

    .new-standard-link {
      white-space: nowrap;
      font-weight: 500;
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

// Preview Dialog Styles
:deep(.el-dialog.preview-dialog) {
  height: 90vh !important;
  display: flex;
  flex-direction: column;
}

.preview-dialog-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: -16px;
}

.back-button {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  .el-icon {
    font-size: 16px;
    margin-right: 0;
  }
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Selected Standards Summary Section
.selected-standards-summary {
  margin-top: 12px;
  padding: 0 12px 12px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  height: 10vh;
  overflow-y: auto;

  .summary-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--el-fill-color-lighter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-top: 8px;
    padding-bottom: 8px;

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
        font-size: 16px;
      }

      &:hover {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
        border-radius: 4px;
      }
    }
  }

  .summary-content {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .selection-tag {
      max-width: 100%;
      cursor: default;

      :deep(.el-tag__content) {
        display: inline-block;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

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

  .preview-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 0 auto;
    }
  }
}
</style>

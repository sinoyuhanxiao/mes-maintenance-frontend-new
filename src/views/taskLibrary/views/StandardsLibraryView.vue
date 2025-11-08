<template>
  <div class="standard-library-view" :style="{ height: containerHeight }">
    <!-- Left Panel - standard List -->
    <div class="left-panel">
      <!-- Filters Section -->
      <div class="filters-section" :class="{ 'filters-collapsed': !showFilters }">
        <!-- Search Input -->
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="Search Keyword..."
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-tooltip content="Show/Hide filters" placement="top">
                <el-icon class="filter-toggle" @click.stop="handleFilterToggle">
                  <Filter />
                </el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls" v-show="showFilters">
          <div class="filter-controls">
            <el-select
              v-model="categoryFilter"
              placeholder="Category"
              clearable
              size="small"
              style="width: 140px"
              @change="handleCategoryFilter"
            >
              <el-option v-for="category in availableCategories" :key="category" :label="category" :value="category" />
            </el-select>

            <el-button size="small" @click="clearAllFilters"> Clear Filters </el-button>
          </div>
        </div>
      </div>

      <!-- standard Cards -->
      <div class="standard-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="standards.length === 0" class="empty-list">
          <el-empty description="No standards found" :image-size="80" />
        </div>

        <div v-else class="list-content">
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ pagination.total }} standards
            </div>
            <el-select v-model="pageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select>
          </div>

          <!-- standard Cards List -->
          <div class="standards-container">
            <standardCard
              v-for="standard in standards"
              :key="getStandardId(standard)"
              :standard="standard"
              :is-selected="selectedstandardId === getStandardId(standard)"
              @select="handlestandardSelect"
              @edit="handlestandardEdit"
              @duplicate="handlestandardDuplicate"
              @delete="handlestandardDelete"
            />
          </div>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              :pager-count="3"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - standard Details/Actions -->
    <div class="right-panel">
      <div v-if="!selectedstandard" class="no-selection">
        <div class="no-selection-content">
          <el-icon class="no-selection-icon"><Warning /></el-icon>
          <h3>Select a standard</h3>
          <p>Choose a standard from the list to view details and actions</p>
          <el-button type="primary" @click="createNewstandard" style="margin-top: 8px">
            <el-icon><Plus /></el-icon>
            Create a New standard
          </el-button>
        </div>
      </div>

      <div v-else class="standard-details">
        <!-- Fixed Header Section -->
        <div class="fixed-header-section">
          <!-- standard Header -->
          <div class="details-header">
            <div class="header-main">
              <h2 class="standard-title">{{ selectedstandard.name }}</h2>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="default" @click="createNewstandard" class="create-button">
                <el-icon><Plus /></el-icon>
                Create
              </el-button>
              <el-dropdown trigger="click" @command="handleHeaderAction">
                <el-button type="text" size="default" class="action-button">
                  <el-icon class="rotated-icon"><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon><Edit /></el-icon>
                      Edit
                    </el-dropdown-item>
                    <el-dropdown-item command="duplicate">
                      <el-icon><DocumentCopy /></el-icon>
                      Duplicate
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided class="delete-dropdown-item">
                      <el-icon><Delete /></el-icon>
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="standard-tabs-header">
            <el-tabs v-model="activeTab" class="details-tabs">
              <el-tab-pane label="General" name="general"></el-tab-pane>
              <el-tab-pane label="Standard Rules" name="rules"></el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="scrollable-content">
          <div class="tab-content-wrapper">
            <!-- General Tab Content -->
            <div v-if="activeTab === 'general'" class="tab-pane-content">
              <!-- standard Overview Card -->
              <div class="overview-card">
                <div class="card-content">
                  <el-descriptions :column="2" direction="vertical">
                    <el-descriptions-item width="50%" label="Category">{{
                      selectedstandard.category || 'Uncategorized'
                    }}</el-descriptions-item>
                    <el-descriptions-item width="50%" label="Total Rules">
                      <span class="info-value highlight">{{ selectedstandard.items?.length || 0 }} rules</span>
                    </el-descriptions-item>
                    <!--                    <el-descriptions-item width="50%" label="Standard ID">-->
                    <!--                      <span class="standard-id">{{ getStandardId(selectedstandard) }}</span>-->
                    <!--                    </el-descriptions-item>-->
                    <el-descriptions-item width="50%" label="Standard Code">
                      <span class="standard-id">{{ selectedstandard.code || 'N/A' }}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>

              <!-- Description Section -->
              <div class="description-card" v-if="selectedstandard.description">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-content">
                  <div class="description-text">
                    {{ selectedstandard.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Standard Rules Tab Content -->
            <div v-if="activeTab === 'rules'" class="tab-pane-content">
              <!-- Standard Rules List -->
              <div v-if="selectedstandard.items && selectedstandard.items.length > 0" class="rules-list">
                <div class="card-header">
                  <h3 class="card-title">Standard Rules</h3>
                  <el-button type="primary" size="default" @click="addNewRule" plain style="font-weight: 550">
                    + Rule
                  </el-button>
                </div>
                <VueDraggable
                  v-model="selectedstandard.items"
                  class="rules-container"
                  item-key="index"
                  :animation="200"
                  :disabled="editingRuleIndex !== null"
                  handle=".drag-handle"
                  ghost-class="rule-ghost"
                  chosen-class="rule-chosen"
                  drag-class="rule-drag"
                  @end="handleRuleReorder"
                >
                  <template #item="{ element: rule, index }">
                    <div class="rule-item" :key="index">
                      <div class="rule-number">{{ index + 1 }}</div>
                      <div class="rule-content">
                        <div class="rule-text" v-if="editingRuleIndex === null || editingRuleIndex !== index">
                          {{ rule }}
                        </div>
                        <el-input v-else v-model="editingRuleText" @keyup.enter="saveRule(index)" ref="ruleInput" />
                      </div>
                      <div class="rule-actions">
                        <template v-if="editingRuleIndex === index">
                          <el-button type="text" size="default" @click="saveRule(index)" title="Save">
                            <el-icon><Check /></el-icon>
                          </el-button>
                          <el-button type="text" size="default" @click="cancelEdit" title="Cancel">
                            <el-icon><Close /></el-icon>
                          </el-button>
                        </template>
                        <template v-else>
                          <el-button type="text" size="default" @click="editRule(index, rule)" title="Edit">
                            <el-icon><Edit /></el-icon>
                          </el-button>
                          <el-button
                            type="text"
                            size="default"
                            @click="deleteRule(index)"
                            title="Delete"
                            class="delete-btn"
                          >
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </template>
                      </div>
                      <div class="drag-handle" v-if="editingRuleIndex !== index">
                        <el-icon><Rank /></el-icon>
                      </div>
                    </div>
                  </template>
                </VueDraggable>
              </div>
              <div v-else class="empty-rules">
                <el-empty description="No standard rules defined yet" :image-size="60">
                  <el-button type="primary" @click="addNewRule">
                    <el-icon><Plus /></el-icon>
                    Add First Rule
                  </el-button>
                </el-empty>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      :model-value="deleteDialogVisible"
      @update:model-value="val => (deleteDialogVisible = val)"
      title="Delete Standard"
      width="500px"
      :before-close="handleDeleteCancel"
    >
      <div class="delete-confirmation-content">
        <p>
          <strong>Are you sure you want to delete "{{ standardToDelete?.name }}"?</strong>
        </p>
        <p style="color: #f56c6c; font-size: 14px; margin: 12px 0">This action cannot be undone.</p>

        <div class="name-confirmation-section">
          <el-input
            v-model="deleteConfirmationText"
            placeholder="Type the exact standard name"
            @input="validateDeleteConfirmation"
            @keyup.enter="deleteConfirmationValid ? handleDeleteConfirm() : null"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDeleteCancel">Cancel</el-button>
          <el-button
            type="danger"
            @click="handleDeleteConfirm"
            :loading="deleteLoading"
            :disabled="!deleteConfirmationValid"
          >
            Delete
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Standard Form Dialog -->
    <CreateStandardDialog
      :visible="formDialogVisible"
      :is-edit-mode="isEditMode"
      :initial-data="formData"
      :loading="formLoading"
      @close="handleFormCancel"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import { useSettingsStore } from '@/store'
import {
  Filter,
  Search,
  Plus,
  Edit,
  Delete,
  DocumentCopy,
  MoreFilled,
  Warning,
  Check,
  Close,
  Rank
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStandards } from '@/composables/designer/useStandards'
import standardCard from '../components/Library/StandardCard.vue'
import CreateStandardDialog from '@/components/TaskLibrary/CreateStandardDialog.vue'
import VueDraggable from 'vuedraggable'

const settingsStore = useSettingsStore()
const {
  loading,
  standards,
  loadstandards,
  createStandard,
  updateStandard,
  deleteStandard,
  setFilter,
  clearFilters,
  pagination,
  setPage,
  setPageSize,
  getStandardId
} = useStandards()

// Local state
const searchQuery = ref( '' )
const categoryFilter = ref( '' )
const currentPage = computed( {
  get : () => pagination.value.currentPage,
  set : val => setPage( val )
} )
const pageSize = computed( {
  get : () => pagination.value.pageSize,
  set : val => setPageSize( val )
} )
const selectedstandardId = ref( null )
const deleteDialogVisible = ref( false )
const standardToDelete = ref( null )
const deleteLoading = ref( false )
const deleteConfirmationText = ref( '' )
const deleteConfirmationValid = ref( false )
const showFilters = ref( false )
const activeTab = ref( 'general' )

// Form dialog state
const formDialogVisible = ref( false )
const formLoading = ref( false )
const isEditMode = ref( false )
const formData = ref( {
  name : '',
  description : '',
  category : '',
  items : []
} )

// Rule editing state (for detail view)
const editingRuleIndex = ref( null )
const editingRuleText = ref( '' )

// Dynamic height calculation state
const navbarHeight = ref( 50 )
const tagsViewHeight = ref( 34 )
const containerHeight = computed( () => {
  const totalFixedHeight = navbarHeight.value + tagsViewHeight.value
  const safeHeight = totalFixedHeight > 0 ? totalFixedHeight : 84
  return `calc(100vh - ${safeHeight}px)`
} )

// Computed properties
const availableCategories = computed( () => {
  return ['food-safety', 'general']
} )

// Removed displayedstandards - now using server-side pagination and sorting

const selectedstandard = computed( () => {
  return standards.value.find( s => getStandardId( s ) === selectedstandardId.value )
} )

const paginationInfo = computed( () => {
  const total = pagination.value.total
  const start = total === 0 ? 0 : ( currentPage.value - 1 ) * pageSize.value + 1
  const end = Math.min( currentPage.value * pageSize.value, total )
  return { start, end, total }
} )

// Event handlers with debouncing
const handleSearchImmediate = () => {
  setFilter( 'search', searchQuery.value )
}

const handleSearch = debounce( handleSearchImmediate, 300 )

const handleCategoryFilter = () => {
  setFilter( 'category', categoryFilter.value )
}

const clearAllFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  clearFilters()
}

const clearNonSearchFilters = () => {
  categoryFilter.value = ''
  const currentSearch = searchQuery.value
  clearFilters() // from composable
  setFilter( 'search', currentSearch )
}

const handleFilterToggle = () => {
  showFilters.value = !showFilters.value
  clearNonSearchFilters()
}

const handlePageChange = page => {
  // Handled by computed setter
  currentPage.value = page
}

const handlePageSizeChange = size => {
  // Handled by computed setter
  pageSize.value = size
}

const handlestandardSelect = standard => {
  selectedstandardId.value = getStandardId( standard )
}

const handlestandardEdit = ( standard = selectedstandard.value ) => {
  if ( standard ) {
    isEditMode.value = true
    formData.value = {
      name : standard.name || '',
      description : standard.description || '',
      category : standard.category || '',
      items : [...( standard.items || [] )]
    }
    formDialogVisible.value = true
  }
}

const handlestandardDuplicate = async( standard = selectedstandard.value ) => {
  if ( standard ) {
    try {
      const duplicateData = {
        name : `${standard.name} (Copy)`,
        description : standard.description,
        category : standard.category,
        items : [...( standard.items || [] )],
        module : 200
      }

      await createStandard( duplicateData )
      ElMessage.success( 'Safety measure duplicated successfully' )
      await loadstandards()
    } catch ( error ) {
      ElMessage.error( 'Failed to duplicate standard' )
    }
  }
}

const handlestandardDelete = standard => {
  standardToDelete.value = standard
  deleteConfirmationText.value = ''
  deleteConfirmationValid.value = false
  deleteDialogVisible.value = true
}

const validateDeleteConfirmation = () => {
  deleteConfirmationValid.value = deleteConfirmationText.value === standardToDelete.value?.name
}

const handleDeleteCancel = () => {
  deleteDialogVisible.value = false
  standardToDelete.value = null
  deleteConfirmationText.value = ''
  deleteConfirmationValid.value = false
}

const handleDeleteConfirm = async() => {
  if ( !standardToDelete.value ) return

  deleteLoading.value = true
  try {
    await deleteStandard( getStandardId( standardToDelete.value ) )

    if ( selectedstandardId.value === getStandardId( standardToDelete.value ) ) {
      selectedstandardId.value = null
    }

    deleteDialogVisible.value = false
    standardToDelete.value = null
    deleteConfirmationText.value = ''
    deleteConfirmationValid.value = false
  } catch ( error ) {
    ElMessage.error( 'Failed to delete standard' )
  } finally {
    deleteLoading.value = false
  }
}

const handleHeaderAction = command => {
  // eslint-disable-next-line default-case
  switch ( command ) {
    case 'edit':
      handlestandardEdit()
      break
    case 'duplicate':
      handlestandardDuplicate()
      break
    case 'delete':
      handlestandardDelete( selectedstandard.value )
      break
  }
}

const createNewstandard = () => {
  isEditMode.value = false
  formData.value = {
    name : '',
    description : '',
    category : '',
    items : []
  }
  formDialogVisible.value = true
}

const handleFormCancel = () => {
  formDialogVisible.value = false
  formData.value = {
    name : '',
    description : '',
    category : '',
    items : []
  }
}

const handleFormSubmit = async submittedFormData => {
  formLoading.value = true
  try {
    const payload = { ...submittedFormData, module : 200 }
    if ( isEditMode.value ) {
      // Validate ID before update
      const currentId = selectedstandardId.value
      if ( !currentId ) {
        ElMessage.error( 'Standard ID is missing. Please refresh and try again.' )
        return
      }
      await updateStandard( currentId, payload )
      ElMessage.success( 'Standard updated successfully' )

      // Preserve selection after reload
      await loadstandards()
      selectedstandardId.value = currentId
    } else {
      await createStandard( payload )
      ElMessage.success( 'Standard created successfully' )
      await loadstandards()
    }
    formDialogVisible.value = false
  } catch ( error ) {
    ElMessage.error( isEditMode.value ? 'Failed to update standard' : 'Failed to create standard' )
  } finally {
    formLoading.value = false
  }
}

// Rule management
const addNewRule = () => {
  if ( !selectedstandard.value ) return

  // Don't add empty rule if there's already an empty rule being edited
  if ( editingRuleIndex.value !== null ) {
    return
  }

  editingRuleIndex.value = selectedstandard.value.items.length
  editingRuleText.value = ''
  selectedstandard.value.items.push( '' )
}

const editRule = ( index, rule ) => {
  editingRuleIndex.value = index
  editingRuleText.value = rule
}

const cancelEdit = () => {
  if ( editingRuleIndex.value === null ) return

  const isEmptyRule = selectedstandard.value.items[editingRuleIndex.value] === ''

  if ( isEmptyRule ) {
    // Remove empty rule completely
    selectedstandard.value.items.splice( editingRuleIndex.value, 1 )
  }

  editingRuleIndex.value = null
  editingRuleText.value = ''
}

const saveRule = async index => {
  if ( !selectedstandard.value ) return

  if ( editingRuleText.value.trim() === '' ) {
    // Remove empty rule completely
    try {
      const items = [...selectedstandard.value.items]
      items.splice( index, 1 )
      const payload = { ...selectedstandard.value, items, module : 200 }

      // Validate ID before update
      const currentId = selectedstandardId.value
      if ( !currentId ) {
        ElMessage.error( 'Standard ID is missing. Please refresh and try again.' )
        return
      }

      await updateStandard( currentId, payload )

      // Preserve selection after reload
      await loadstandards()
      selectedstandardId.value = currentId
    } catch ( error ) {
      ElMessage.error( 'Failed to remove empty rule' )
    }

    editingRuleIndex.value = null
    editingRuleText.value = ''
    return
  }

  try {
    const items = [...selectedstandard.value.items]
    items[index] = editingRuleText.value.trim()
    const payload = { ...selectedstandard.value, items, module : 200 }

    // Validate that we have a valid ID before attempting update
    const currentId = selectedstandardId.value
    if ( !currentId ) {
      ElMessage.error( 'Standard ID is missing. Please refresh and try again.' )
      return
    }

    await updateStandard( currentId, payload )

    // Preserve selection after reload
    await loadstandards()
    selectedstandardId.value = currentId

    editingRuleIndex.value = null
    editingRuleText.value = ''
  } catch ( error ) {
    ElMessage.error( 'Failed to save standard rule' )
  }
}

const deleteRule = async index => {
  if ( !selectedstandard.value ) return

  try {
    await ElMessageBox.confirm( 'Are you sure you want to delete this rule?', 'Confirm Deletion', {
      confirmButtonText : 'Delete',
      cancelButtonText : 'Cancel',
      type : 'warning'
    } )

    const items = [...selectedstandard.value.items]
    items.splice( index, 1 )
    const payload = { ...selectedstandard.value, items, module : 200 }

    // Validate ID before update
    const currentId = selectedstandardId.value
    if ( !currentId ) {
      ElMessage.error( 'Standard ID is missing. Please refresh and try again.' )
      return
    }

    await updateStandard( currentId, payload )

    // Preserve selection after reload
    await loadstandards()
    selectedstandardId.value = currentId

    ElMessage.success( 'Rule deleted successfully' )
  } catch ( error ) {
    if ( error !== 'cancel' ) {
      ElMessage.error( 'Failed to delete standard rule' )
    }
  }
}

const handleRuleReorder = async() => {
  if ( !selectedstandard.value ) return

  try {
    const payload = { ...selectedstandard.value, module : 200 }

    // Validate ID before update
    const currentId = selectedstandardId.value
    if ( !currentId ) {
      ElMessage.error( 'Standard ID is missing. Please refresh and try again.' )
      return
    }

    await updateStandard( currentId, payload )

    // Preserve selection after reload
    await loadstandards()
    selectedstandardId.value = currentId

    ElMessage.success( 'Rules reordered successfully' )
  } catch ( error ) {
    ElMessage.error( 'Failed to reorder rules' )
  }
}

// Dynamic height calculation functions
const calculateDynamicHeights = () => {
  nextTick( () => {
    const navbarEl = document.querySelector( '.navbar' )
    if ( navbarEl && navbarEl.offsetHeight > 0 ) {
      navbarHeight.value = navbarEl.offsetHeight
    }

    const tagsViewEl = document.querySelector( '#tags-view-container' )
    if ( settingsStore.tagsView && tagsViewEl && tagsViewEl.offsetHeight > 0 ) {
      tagsViewHeight.value = tagsViewEl.offsetHeight
    } else {
      tagsViewHeight.value = 0
    }
  } )
}

const handleResize = () => {
  calculateDynamicHeights()
}

watch(
  () => settingsStore.tagsView,
  () => {
    calculateDynamicHeights()
  },
  { immediate : false }
)

// Initialize
onMounted( () => {
  calculateDynamicHeights()
  window.addEventListener( 'resize', handleResize )
  loadstandards()
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
} )

defineOptions( {
  name : 'standardLibrary'
} )
</script>

<style scoped>
.standard-library-view {
  display: flex;
  background: #f5f7fa;
}

.left-panel {
  width: 450px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  background: white;
  overflow: hidden;
}

.filters-section {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.filters-collapsed {
  padding-bottom: 0 !important;
}

.search-bar {
  margin-bottom: 12px;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.standard-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-container {
  padding: 20px;
}

.empty-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
}

.standards-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.standards-container::-webkit-scrollbar {
  width: 6px;
}

.standards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.standards-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.standards-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.pagination-container {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e4e7ed;
}

/* Right Panel Styles */
.no-selection {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-selection-content {
  text-align: center;
  color: #909399;
}

.no-selection-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.standard-details {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fixed-header-section {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #fff;
}

.scrollable-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.standard-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-button {
  margin-right: 8px;
}

.action-button {
  font-size: 20px;
  padding: 8px;
}

.rotated-icon {
  transform: rotate(90deg);
}

.details-tabs {
  height: 100%;
}

/* Card Components */
.overview-card,
.description-card,
.stats-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
}

.card-header {
  padding: 8px 24px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.standard-id {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.card-content {
  padding: 12px 24px 12px 24px;
}

.info-value {
  color: #606266;
  font-weight: 200;
  font-size: 14px;
  text-align: right;
  margin-right: 20px;
}

.info-value.highlight {
  color: #409eff;
  font-weight: 600;
}

/* Description Card */
.description-text {
  color: #303133;
  line-height: 1.7;
  font-size: 14px;
  padding: 16px 16px 16px 0px;
  border-radius: 6px;
}

/* Stats Card */
.stat-item {
  text-align: center;
  padding: 20px 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-2px);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Rules List */
.rules-list {
  margin-bottom: 24px;
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px 28px 24px;
  background: #fafbfc;
  border-radius: 8px;
  margin: 0 24px 24px 24px;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
}

.rule-item:hover {
  border-color: #a0cfff;
  background: #f8fbff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  transform: translateY(-1px);
}

.rule-number {
  min-width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  margin-right: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.rule-content {
  flex: 1;
  margin-right: 14px;
}

.rule-text {
  color: #3c4043;
  line-height: 1.7;
  font-size: 14px;
  word-break: break-word;
}

.rule-content :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #d0d7de;
  padding: 0;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.rule-content :deep(.el-input__wrapper:hover) {
  border-color: #a0cfff;
}

.rule-content :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.rule-content :deep(.el-input__inner) {
  font-size: 14px;
  line-height: 1.7;
  color: #3c4043;
  border: none;
  box-shadow: none;
  padding: 0 0 0 6px;
}

.rule-actions {
  display: flex;
  transition: opacity 0.2s ease;
}

.rule-item:hover .rule-actions {
  opacity: 1;
}

.rule-actions .el-button {
  border-radius: 6px;
  font-size: 16px;
}

.rule-actions .el-button .el-icon {
  font-size: 16px;
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #f78989;
  background: #fef0f0;
}

.empty-rules {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.filter-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.filter-toggle:hover {
  color: var(--el-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-icon) {
  margin-right: 5px;
}

:deep(.delete-dropdown-item) {
  color: var(--el-color-danger);
}

:deep(.delete-dropdown-item:hover) {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-9);
}

:deep(.el-tabs__item.is-top) {
  font-size: 16px;
  width: 50%;
}

:deep(.el-tabs__nav.is-top) {
  width: 100%;
}

/* Delete Confirmation Styles */
.delete-confirmation-content {
  margin: 0;
}

.name-confirmation-section {
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #f56c6c;
  font-size: 13px;
}

.validation-error .el-icon {
  font-size: 14px;
  margin-right: 0;
}

/* Drag Handle */
.drag-handle {
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  color: #c0c4cc;
  cursor: grab;
  padding: 6px;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.rule-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  color: #409eff;
}

.drag-handle:active {
  cursor: grabbing;
  color: #409eff;
}

/* Drag States */
.rule-ghost {
  opacity: 0.5;
  background: #e8f4ff;
  border: 2px dashed #409eff;
}

.rule-chosen {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  border-color: #409eff;
}

.rule-drag {
  opacity: 0.9;
  transform: rotate(2deg);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
</style>

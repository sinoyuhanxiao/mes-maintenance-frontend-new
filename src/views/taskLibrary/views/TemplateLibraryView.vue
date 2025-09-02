<template>
  <div class="template-library-view" :style="{ height: containerHeight }">
    <!-- Left Panel - Template List -->
    <div class="left-panel">
      <!-- Filters Section -->
      <div class="filters-section" :class="{ 'filters-collapsed': !showFilters }">
        <!-- Search Input -->
        <div class="search-bar">
          <el-input v-model="searchQuery" placeholder="Search tasks..." clearable @input="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <!-- ADD -->
            <template #suffix>
              <el-tooltip content="Show/Hide filters" placement="top">
                <el-icon class="filter-toggle" @click.stop="showFilters = !showFilters">
                  <Filter />
                </el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls" v-show="showFilters">
          <div class="filter-controls">
            <!--            <el-select-->
            <!--              v-model="statusFilter"-->
            <!--              placeholder="Status"-->
            <!--              clearable-->
            <!--              size="small"-->
            <!--              style="width: 120px"-->
            <!--              @change="handleStatusFilter"-->
            <!--            >-->
            <!--              <el-option label="Published" value="published" />-->
            <!--              <el-option label="Draft" value="draft" />-->
            <!--              <el-option label="Archived" value="archived" />-->
            <!--            </el-select>-->
            <el-tree-select
              v-model="assetFilter"
              placeholder="Asset"
              :data="equipmentTreeData"
              multiple
              filterable
              check-strictly
              node-key="value"
              :props="{ children: 'children', label: 'label' }"
              size="small"
              style="width: 120px"
              class="asset-tree-select"
              popper-class="asset-tree-select-popper"
              :teleported="false"
              @change="handleAssetFilter"
            />

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

      <!-- Template Cards -->
      <div class="template-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="displayedTemplates.length === 0" class="empty-list">
          <el-empty description="No tasks found" :image-size="80" />
        </div>

        <div v-else class="list-content">
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ paginationInfo.total }} tasks
            </div>
            <el-select v-model="pageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select>
          </div>

          <!-- Template Cards List -->
          <div class="templates-container">
            <TemplateCard
              v-for="template in displayedTemplates"
              :key="template.template_id"
              :template="template"
              :is-selected="selectedTemplateId === template.template_id"
              @select="handleTemplateSelect"
              @edit="handleTemplateEdit"
              @duplicate="handleTemplateDuplicate"
              @delete="handleTemplateDelete"
              @publish="handleTemplatePublish"
            />
          </div>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="filteredTemplates.length"
              :page-sizes="[10, 20, 50]"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Template Details/Actions -->
    <div class="right-panel">
      <div v-if="!selectedTemplate" class="no-selection">
        <div class="no-selection-content">
          <el-icon class="no-selection-icon"><DocumentCopy /></el-icon>
          <h3>Select a Task</h3>
          <p>Choose a task from the list to view details and actions</p>
          <el-button type="primary" @click="createNewTemplate" style="margin-top: 8px">
            <el-icon><Plus /></el-icon>
            Create a New Task
          </el-button>
        </div>
      </div>

      <div v-else class="template-details">
        <!-- Fixed Header Section -->
        <div class="fixed-header-section">
          <!-- Template Header -->
          <div class="details-header">
            <div class="header-main">
              <h2 class="template-title">{{ selectedTemplate.name }}</h2>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="default" @click="handleTemplateEdit" class="edit-button">
                <el-icon><Edit /></el-icon>
                Edit Task
              </el-button>
              <el-dropdown trigger="click" @command="handleHeaderAction">
                <el-button type="text" size="default" class="action-button">
                  <el-icon class="rotated-icon"><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="duplicate">
                      <el-icon><DocumentCopy /></el-icon>
                      Duplicate
                    </el-dropdown-item>
                    <el-dropdown-item command="publish" :disabled="selectedTemplate.status === 'published'">
                      <el-icon><Check /></el-icon>
                      Publish
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="template-tabs-header">
            <el-tabs v-model="activeTab" class="details-tabs">
              <el-tab-pane label="General" name="general"></el-tab-pane>
              <el-tab-pane label="Steps" name="steps"></el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="scrollable-content">
          <div class="tab-content-wrapper">
            <!-- General Tab Content -->
            <div v-if="activeTab === 'general'" class="tab-pane-content">
              <!-- Template Overview Card -->
              <div class="overview-card">
                <div class="card-content">
                  <el-descriptions :column="3" direction="vertical">
                    <el-descriptions-item width="33%" label="Status">
                      <el-tag :type="getStatusType(selectedTemplate.status)" size="default">
                        {{ selectedTemplate.status }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="Category">{{
                      selectedTemplate.category || 'Uncategorized'
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Asset/Equipment">{{
                      selectedTemplate.asset || 'No asset specified'
                    }}</el-descriptions-item>
                    <el-descriptions-item width="33%" label="Estimated Time">
                      <span class="info-value highlight">
                        {{
                          selectedTemplate.estimated_minutes
                            ? `${selectedTemplate.estimated_minutes} minutes`
                            : 'Not specified'
                        }}
                      </span>
                    </el-descriptions-item>
                    <el-descriptions-item width="33%" label="Total Steps">
                      <span class="info-value step-count">{{ selectedTemplate.steps?.length || 0 }} steps</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="Template ID">
                      <span class="template-id">{{ selectedTemplate.template_id }}</span>
                    </el-descriptions-item>

                    <el-descriptions-item label="Created On">{{
                      formatDate(selectedTemplate.created_at)
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Last Modified">{{
                      formatDate(selectedTemplate.updated_at)
                    }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>

              <!-- Description Section -->
              <div class="description-card" v-if="selectedTemplate.description">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-content">
                  <div class="description-text">
                    {{ selectedTemplate.description }}
                  </div>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="stats-card" style="margin-bottom: 100px">
                <div class="card-header">
                  <h3 class="card-title">Quick Statistics</h3>
                </div>
                <div class="card-content">
                  <el-row :gutter="16">
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ selectedTemplate.steps?.length || 8 }}</div>
                        <div class="stat-label">Total Failure</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ selectedTemplate.estimated_minutes || 0 }}</div>
                        <div class="stat-label">AVG Minutes</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ getRequiredStepsCount() }}</div>
                        <div class="stat-label">Parts Consumed</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ getOptionalStepsCount() }}</div>
                        <div class="stat-label">Work Orders</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>

              <!-- Step Types Overview -->
              <div class="step-types-card" v-if="selectedTemplate.steps && selectedTemplate.steps.length > 0">
                <div class="card-header">
                  <h3 class="card-title">Step Types Breakdown</h3>
                </div>
                <div class="card-content">
                  <div class="step-types-grid">
                    <div v-for="(count, type) in getStepTypesBreakdown()" :key="type" class="step-type-item">
                      <div class="step-type-icon">
                        <el-icon><Document /></el-icon>
                      </div>
                      <div class="step-type-info">
                        <div class="step-type-name">{{ getStepTypeLabel(type) }}</div>
                        <div class="step-type-count">{{ count }} {{ count === 1 ? 'step' : 'steps' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Steps Tab Content -->
            <div v-if="activeTab === 'steps'" class="tab-pane-content">
              <!-- Template Steps Preview -->
              <div v-if="selectedTemplate.steps && selectedTemplate.steps.length > 0" class="steps-preview">
                <div class="steps-list">
                  <div v-for="step in selectedTemplate.steps" :key="step.step_id" class="step-preview-item">
                    <div class="step-number">{{ step.order }}</div>
                    <div class="step-content">
                      <div class="step-title">{{ step.label }}</div>
                      <div class="step-type">{{ getStepTypeLabel(step.type) }}</div>
                      <div v-if="step.description" class="step-description">{{ step.description }}</div>
                    </div>
                    <div class="step-required">
                      <el-tag v-if="step.required" type="danger" size="small">Required</el-tag>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-steps">
                <el-empty description="No steps defined yet" :image-size="60" />
              </div>
            </div>

            <!-- Statistics Tab Content -->
            <div v-if="activeTab === 'statistics'" class="tab-pane-content">
              <!-- Template Steps Preview -->
              <div v-if="selectedTemplate.steps && selectedTemplate.steps.length > 0" class="steps-preview">
                <div class="steps-list">
                  <div v-for="step in selectedTemplate.steps" :key="step.step_id" class="step-preview-item">
                    <div class="step-number">{{ step.order }}</div>
                    <div class="step-content">
                      <div class="step-title">{{ step.label }}</div>
                      <div class="step-type">{{ getStepTypeLabel(step.type) }}</div>
                      <div v-if="step.description" class="step-description">{{ step.description }}</div>
                    </div>
                    <div class="step-required">
                      <el-tag v-if="step.required" type="danger" size="small">Required</el-tag>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-steps">
                <el-empty description="No steps defined yet" :image-size="60" />
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Action Button -->
        <div class="floating-action">
          <el-button type="primary" class="fab-button" @click="createNewWorkOrder" size="large">
            <el-icon style="margin: 0px 8px 2px 0px; font-size: 16px"><Calendar /></el-icon>
            Create Work Order from Template
          </el-button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      :model-value="deleteDialogVisible"
      @update:model-value="val => (deleteDialogVisible = val)"
      title="Delete Task"
      width="400px"
      :before-close="handleDeleteCancel"
    >
      <p>Are you sure you want to delete "{{ templateToDelete?.name }}"?</p>
      <p style="color: #f56c6c; font-size: 12px">This action cannot be undone.</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDeleteCancel">Cancel</el-button>
          <el-button type="danger" @click="handleDeleteConfirm" :loading="deleteLoading"> Delete </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/store'
import {
  Filter,
  Search,
  Plus,
  Edit,
  Delete,
  Check,
  DocumentCopy,
  MoreFilled,
  Calendar,
  Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTaskLibrary } from '@/composables/useTaskLibrary'
import { getEquipmentTree } from '@/api/equipment.js'
import TemplateCard from '../components/Library/TemplateCard.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const {
  loading,
  templates,
  filteredTemplates,
  loadTemplates,
  deleteTemplate,
  publishTemplate,
  setFilter,
  clearFilters
} = useTaskLibrary()

// Local state
const searchQuery = ref( '' )
const statusFilter = ref( '' )
const categoryFilter = ref( '' )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const selectedTemplateId = ref( null )
const deleteDialogVisible = ref( false )
const templateToDelete = ref( null )
const deleteLoading = ref( false )
const showFilters = ref( false )
const assetFilter = ref( [] )
const equipmentTreeData = ref( [] )
const activeTab = ref( 'general' )

// Dynamic height calculation state
const navbarHeight = ref( 50 ) // Fallback to default navbar height
const tagsViewHeight = ref( 34 ) // Fallback to default tags-view height
const containerHeight = computed( () => {
  const totalFixedHeight = navbarHeight.value + tagsViewHeight.value
  // Ensure minimum height values for fallback
  const safeHeight = totalFixedHeight > 0 ? totalFixedHeight : 84
  return `calc(100vh - ${safeHeight}px)`
} )

const fetchEquipmentTreeData = async() => {
  try {
    const response = await getEquipmentTree()
    const transformNode = node => ( {
      value : node.id, // el-tree-select uses 'value' by default
      label : node.name,
      children : node.children && node.children.length > 0 ? node.children.map( transformNode ) : undefined
    } )
    let dataArray
    if ( response.data?.data ) {
      dataArray = response.data.data
    } else if ( Array.isArray( response.data ) ) {
      dataArray = response.data
    } else if ( response.data ) {
      dataArray = [response.data]
    } else {
      dataArray = []
    }
    equipmentTreeData.value = dataArray.map( node => transformNode( node ) )
  } catch ( error ) {
    console.error( 'Failed to fetch equipment tree:', error )
    ElMessage.error( 'Failed to load asset filter data.' )
  }
}

const handleAssetFilter = () => {
  setFilter( 'asset', assetFilter.value )
  currentPage.value = 1
}

// Computed properties
const availableCategories = computed( () => {
  const categories = [...new Set( templates.value.map( t => t.category ).filter( Boolean ) )]
  return categories.sort()
} )

const displayedTemplates = computed( () => {
  const start = ( currentPage.value - 1 ) * pageSize.value
  const end = start + pageSize.value
  return filteredTemplates.value.slice( start, end )
} )

const selectedTemplate = computed( () => {
  return templates.value.find( t => t.template_id === selectedTemplateId.value )
} )

const paginationInfo = computed( () => {
  const total = filteredTemplates.value.length
  const start = total === 0 ? 0 : ( currentPage.value - 1 ) * pageSize.value + 1
  const end = Math.min( currentPage.value * pageSize.value, total )
  return { start, end, total }
} )

// Event handlers
const handleSearch = () => {
  setFilter( 'search', searchQuery.value )
  currentPage.value = 1
}
const handleCategoryFilter = () => {
  setFilter( 'category', categoryFilter.value )
  currentPage.value = 1
}

const clearAllFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  clearFilters()
  currentPage.value = 1
}

const handlePageChange = page => {
  currentPage.value = page
}

const handlePageSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
}

const handleTemplateSelect = template => {
  selectedTemplateId.value = template.template_id
}

const handleTemplateEdit = ( template = selectedTemplate.value ) => {
  if ( template ) {
    router.push( {
      name : 'TaskDesignerEdit',
      params : { id : template.template_id }
    } )
  }
}

const handleTemplateDuplicate = async( template = selectedTemplate.value ) => {
  if ( template ) {
    try {
      // Create a copy with a new name
      // eslint-disable-next-line no-unused-vars
      const duplicateData = {
        ...template,
        name : `${template.name} (Copy)`,
        status : 'draft',
        template_id : undefined,
        created_at : undefined,
        updated_at : undefined
      }

      // This would create a new template - for now just show success message
      ElMessage.success( 'Task duplicated successfully' )
      await loadTemplates() // Refresh list
    } catch ( error ) {
      ElMessage.error( 'Failed to duplicate task' )
    }
  }
}

const handleTemplateDelete = template => {
  templateToDelete.value = template
  deleteDialogVisible.value = true
}

const handleDeleteCancel = () => {
  deleteDialogVisible.value = false
  templateToDelete.value = null
}

const handleDeleteConfirm = async() => {
  if ( !templateToDelete.value ) return

  deleteLoading.value = true
  try {
    await deleteTemplate( templateToDelete.value.template_id )

    // Clear selection if deleted template was selected
    if ( selectedTemplateId.value === templateToDelete.value.template_id ) {
      selectedTemplateId.value = null
    }

    deleteDialogVisible.value = false
    templateToDelete.value = null
  } catch ( error ) {
    ElMessage.error( 'Failed to delete task' )
  } finally {
    deleteLoading.value = false
  }
}

const handleTemplatePublish = async( template = selectedTemplate.value ) => {
  if ( template && template.status !== 'published' ) {
    try {
      await publishTemplate( template.template_id )
    } catch ( error ) {
      ElMessage.error( 'Failed to publish task' )
    }
  }
}

const handleHeaderAction = command => {
  // eslint-disable-next-line default-case
  switch ( command ) {
    case 'duplicate':
      handleTemplateDuplicate()
      break
    case 'publish':
      handleTemplatePublish()
      break
    case 'delete':
      handleTemplateDelete( selectedTemplate.value )
      break
  }
}

const createNewTemplate = () => {
  router.push( { name : 'TaskDesigner' } )
}

const createNewWorkOrder = () => {
  // TODO: Implement work order creation functionality
  ElMessage.success( 'Thanks for clicking! Work Order Creation will come soon!' )
}

// Helper functions
const getStatusType = status => {
  switch ( status ) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
}

const getStepTypeLabel = type => {
  const labels = {
    inspection : 'Inspection',
    checkbox : 'Checkbox',
    number : 'Number Input',
    text : 'Text Input',
    attachments : 'File Upload'
  }
  return labels[type] || type
}

const formatDate = dateString => {
  if ( !dateString ) return 'N/A'
  return new Date( dateString ).toLocaleDateString( 'en-US', {
    year : 'numeric',
    month : 'short',
    day : 'numeric',
    hour : '2-digit',
    minute : '2-digit'
  } )
}

const getRequiredStepsCount = () => {
  if ( !selectedTemplate.value?.steps ) return 0
  return selectedTemplate.value.steps.filter( step => step.required ).length
}

const getOptionalStepsCount = () => {
  if ( !selectedTemplate.value?.steps ) return 0
  return selectedTemplate.value.steps.filter( step => !step.required ).length
}

const getStepTypesBreakdown = () => {
  if ( !selectedTemplate.value?.steps ) return {}
  const breakdown = {}
  selectedTemplate.value.steps.forEach( step => {
    breakdown[step.type] = ( breakdown[step.type] || 0 ) + 1
  } )
  return breakdown
}

// Dynamic height calculation functions
const calculateDynamicHeights = () => {
  nextTick( () => {
    // Get navbar element
    const navbarEl = document.querySelector( '.navbar' )
    if ( navbarEl && navbarEl.offsetHeight > 0 ) {
      navbarHeight.value = navbarEl.offsetHeight
    }

    // Get tags-view-container element - only count height if TagsView is enabled
    const tagsViewEl = document.querySelector( '#tags-view-container' )
    if ( settingsStore.tagsView && tagsViewEl && tagsViewEl.offsetHeight > 0 ) {
      tagsViewHeight.value = tagsViewEl.offsetHeight
    } else {
      tagsViewHeight.value = 0 // Set to 0 when TagsView is disabled
    }
  } )
}

// Handle window resize to recalculate heights
const handleResize = () => {
  calculateDynamicHeights()
}

// Watch for TagsView setting changes
watch(
  () => settingsStore.tagsView,
  () => {
    // Recalculate heights when TagsView is toggled
    calculateDynamicHeights()
  },
  { immediate : false }
)

// Initialize
onMounted( () => {
  // Calculate dynamic heights
  calculateDynamicHeights()

  // Add resize listener
  window.addEventListener( 'resize', handleResize )

  loadTemplates()
  fetchEquipmentTreeData()
} )

onBeforeUnmount( () => {
  // Remove resize listener
  window.removeEventListener( 'resize', handleResize )
} )

defineOptions( {
  name : 'TaskLibrary'
} )
</script>

<style scoped>
.template-library-view {
  display: flex;
  background: #f5f7fa;
}

.left-panel {
  width: 400px;
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

.template-list {
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

.templates-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* Consistent scroll bar styling */
.templates-container::-webkit-scrollbar {
  width: 6px;
}

.templates-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.templates-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.templates-container::-webkit-scrollbar-thumb:hover {
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

.template-details {
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

.template-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.template-category,
.template-time {
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  color: #606266;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-button {
  margin-right: 8px;
}

.action-button {
  padding: 8px;
}

.rotated-icon {
  transform: rotate(90deg);
}

.template-tabs {
  flex: 1;
}

.details-tabs {
  height: 100%;
}

.details-tabs .el-tabs__content {
  height: calc(100% - 40px);
  overflow-y: auto;
}

/* Card Components */
.overview-card,
.description-card,
.stats-card,
.step-types-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
}

.card-header {
  padding: 8px 24px 16px 24px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.template-id {
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

/* Info Groups */
.info-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f7fa;
  height: 25px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
  min-width: 120px;
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

.info-value.step-count {
  color: #67c23a;
  font-weight: 600;
}

.status-tag {
  margin-left: auto;
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

/* Step Types Card */
.step-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.step-type-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  transition: all 0.3s ease;
}

.step-type-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
}

.step-type-icon {
  width: 40px;
  height: 40px;
  background: #409eff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.step-type-info {
  flex: 1;
}

.step-type-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.step-type-count {
  font-size: 12px;
  color: #909399;
}

.floating-action {
  position: fixed;
  bottom: 24px;
  right: 23%;
  z-index: 1000;
}

.fab-button {
  border-radius: 50px;
  padding: 12px 20px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.fab-button:hover {
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.steps-preview {
  margin-bottom: 24px;
}

.empty-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.steps-preview h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-preview-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.step-type {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.step-description {
  font-size: 12px;
  color: #606266;
}

.step-required {
  margin-left: 12px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.filter-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.filter-toggle:hover {
  color: var(--el-color-primary);
}

.el-descriptions__table td {
  :deep(&) {
    padding-bottom: 16px !important;
  }
}

:deep(.asset-tree-select) {
  max-height: 500px;
  width: 300px;
}

:deep(.asset-tree-select .el-select__popper) {
  min-width: 300px;
}

:deep(.el-tree.asset-tree-select) {
  width: 300px !important;
}
</style>

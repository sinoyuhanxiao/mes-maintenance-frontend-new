<template>
  <div class="template-library-view" :style="{ height: containerHeight }">
    <!-- Left Panel - Template List -->
    <div class="left-panel">
      <!-- Filters Section -->
      <div class="filters-section" :class="{ 'filters-collapsed': !showFilters }">
        <!-- Search Input -->
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            :placeholder="searchByIdMode ? 'Search template ID...' : 'Search task templates...'"
            @input="handleSearch"
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
                <el-tooltip content="Show/Hide filters" placement="top">
                  <el-icon
                    class="filter-toggle"
                    :class="{ 'is-active': showFilters }"
                    @click.stop="toggleFilterVisibility"
                  >
                    <Filter />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-input>
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls" v-show="showFilters">
          <div class="filter-controls">
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
              :is-highlighted="highlightedTemplateId === template.template_id"
              @select="handleTemplateSelect"
              @edit="handleTemplateEdit"
              @duplicate="handleTemplateDuplicate"
              @delete="handleTemplateDelete"
            />
          </div>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="pagination.total || 0"
              :pager-count="3"
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
      <div v-if="templateDetailLoading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="!selectedTemplate" class="no-selection">
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
              <h2 class="template-title">
                {{ selectedTemplate.name }}
                <el-tag type="info" class="template-id-header">
                  <span v-if="selectedTemplate.reference_id"> #{{ selectedTemplate.reference_id }}</span>
                </el-tag>
              </h2>
            </div>
            <div class="header-actions">
              <el-button type="primary" size="default" @click="createNewTemplate" class="create-button">
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
                    <el-dropdown-item command="createWorkOrder">
                      <el-icon><Calendar /></el-icon>
                      Create Work Order
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
                    <el-descriptions-item label="Category">{{
                      getCategoryLabel(selectedTemplate.category)
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Asset/Equipment">{{
                      selectedTemplate.equipment_node?.name || 'No asset specified'
                    }}</el-descriptions-item>
                    <el-descriptions-item width="33%" label="Estimated Time (minutes)">
                      <span class="info-value warning">
                        {{
                          selectedTemplate.time_estimate_sec
                            ? `${Math.ceil(selectedTemplate.time_estimate_sec / 60)} minutes`
                            : 'Not specified'
                        }}
                      </span>
                    </el-descriptions-item>
                    <el-descriptions-item width="33%" label="Total Steps">
                      <span class="info-value highlight clickable-steps"
@click="navigateToStepsTab"
                        >{{ selectedTemplate.steps?.length || 0 }} steps</span
                      >
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
                  <el-row :gutter="24">
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
            </div>

            <!-- Steps Tab Content -->
            <div v-if="activeTab === 'steps'" class="tab-pane-content">
              <!-- Step Search Bar -->
              <div class="step-search-bar">
                <el-input
                  v-model="stepSearchQuery"
                  placeholder="Search steps by name..."
                  clearable
                  @input="handleStepSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>

              <!-- Desktop-style Procedure Preview (read-only) -->
              <div v-if="filteredPreviewSteps && filteredPreviewSteps.length > 0" class="procedure-preview">
                <div class="preview-main viewport-desktop density-comfortable">
                  <div class_="section-content">
                    <div
                      v-for="(step, index) in filteredPreviewSteps"
                      :key="step.step_id || index"
                      class="preview-step-simple"
                    >
                      <div class="step-config-preview">
                        <component
                          :is="getStepComponent(step.type)"
                          :step="getStepWithNumber(step, index)"
                          :preview-mode="true"
                          :interactive="false"
                        />

                        <!-- Bottom section for required image OR tools (desktop style) -->
                        <div
                          v-if="step.required_image || (step.relevant_tools && step.relevant_tools.length > 0)"
                          class="preview-bottom-section"
                        >
                          <div class="desktop-upload-button">
                            <el-button v-if="step.required_image" type="info" size="small" disabled>
                              <span class="required-asterisk">*</span>
                              <el-icon><Upload /></el-icon>
                              Upload Image
                            </el-button>

                            <!-- Show Tools Button -->
                            <el-button
                              disabled
                              v-if="step.relevant_tools && step.relevant_tools.length > 0"
                              size="small"
                              plain
                              @click="toggleStepTools(step.step_id)"
                              class="tools-toggle-btn"
                              :style="step.required_image ? 'margin-left: 8px;' : ''"
                            >
                              <el-icon><Tools /></el-icon>
                              {{ getStepToolsVisible(step.step_id) ? 'Hide Tools' : 'Show Tools' }} ({{
                                step.relevant_tools.length
                              }})
                            </el-button>
                          </div>
                        </div>

                        <!-- Tools List (toggleable) -->
                        <div
                          v-if="
                            getStepToolsVisible(step.step_id) && step.relevant_tools && step.relevant_tools.length > 0
                          "
                          class="desktop-tools-list"
                        >
                          <div class="tools-list-header">
                            <h4>Required Tools</h4>
                          </div>
                          <div class="tools-list-content">
                            <div v-for="tool in step.relevant_tools" :key="tool.tool_id || tool.id" class="tool-item">
                              <el-icon><Tools /></el-icon>
                              <span class="tool-name">{{ tool.name || 'Unnamed Tool' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-steps">
                <el-empty
                  :description="stepSearchQuery ? 'No steps match your search' : 'No steps defined yet'"
                  :image-size="60"
                />
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
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      :model-value="deleteDialogVisible"
      @update:model-value="val => (deleteDialogVisible = val)"
      title="Delete Task"
      width="500px"
      :before-close="handleDeleteCancel"
    >
      <div class="delete-confirmation-content">
        <p>
          <strong>Are you sure you want to delete "{{ templateToDelete?.name }}"?</strong>
        </p>
        <p style="color: #f56c6c; font-size: 14px; margin: 12px 0">This action cannot be undone.</p>

        <div class="name-confirmation-section">
          <el-input
            v-model="deleteConfirmationText"
            placeholder="Type the exact task name"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSettingsStore, useTagsViewStore } from '@/store'
import {
  Filter,
  Search,
  Plus,
  Edit,
  Delete,
  DocumentCopy,
  MoreFilled,
  Calendar,
  Upload,
  Tools
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskLibrary } from '@/composables/designer/useTaskLibrary'
import { getEquipmentTree } from '@/api/equipment.js'
import { getAllCategories } from '@/api/common.js'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'
import { buildDisplayTaskFromTemplate } from '@/components/WorkOrder/TodoView/taskPayloadHelpers'
import TemplateCard from '../components/Library/TemplateCard.vue'
// Preview components reused from Procedure Designer
import InspectionStepPreview from '../components/Designer/StepCards/InspectionStepPreview.vue'
import CheckboxStepPreview from '../components/Designer/StepCards/CheckboxStepPreview.vue'
import NumberStepPreview from '../components/Designer/StepCards/NumberStepPreview.vue'
import TextStepPreview from '../components/Designer/StepCards/TextStepPreview.vue'
import AttachmentStepPreview from '../components/Designer/StepCards/AttachmentStepPreview.vue'
import ServiceStepPreview from '../components/Designer/StepCards/ServiceStepPreview.vue'
import { transformLimitsFromBackend } from '../utils/stepTransforms'

const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()
const workOrderDraftStore = useWorkOrderDraftStore()
const {
  loading,
  templateDetailLoading,
  templates,
  filteredTemplates,
  currentTemplate,
  pagination,
  loadTemplates,
  loadTemplate,
  createTemplate,
  deleteTemplate,
  setFilter,
  clearFilters,
  setPage,
  setPageSize
} = useTaskLibrary()

// Local state
const searchQuery = ref( '' )
const searchByIdMode = ref( false )

const categoryFilter = ref( '' )
const currentPage = ref( 1 )
const pageSize = ref( 20 )
const selectedTemplateId = ref( null )
const highlightedTemplateId = ref( null )
const deleteDialogVisible = ref( false )
const templateToDelete = ref( null )
const deleteLoading = ref( false )
const deleteConfirmationText = ref( '' )
const deleteConfirmationValid = ref( false )
const showFilters = ref( false )
const assetFilter = ref( [] )
const equipmentTreeData = ref( [] )
const activeTab = ref( 'general' )
const stepSearchQuery = ref( '' )
const allCategories = ref( [] )
const stepToolsVisible = reactive( {} )

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
    console.error( 'Equipment tree load failed:', error )
    ElMessage.error( 'Failed to load asset filter data.' )
  }
}

const fetchCategories = async() => {
  try {
    const response = await getAllCategories()
    allCategories.value = response.data.map( category => category.name )
  } catch ( error ) {
    console.error( 'Categories load failed:', error )
    ElMessage.error( 'Failed to load category filter data.' )
  }
}

const handleAssetFilter = () => {
  setFilter( 'equipment_node_ids', assetFilter.value )
  currentPage.value = 1
}

// Computed properties
const availableCategories = computed( () => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return allCategories.value.sort()
} )

const displayedTemplates = computed( () => {
  // With server-side pagination, all templates returned are already the correct page
  // Ensure we always return an array
  return Array.isArray( filteredTemplates.value ) ? filteredTemplates.value : []
} )

const selectedTemplate = computed( () => {
  // Use currentTemplate from store for detailed data, fallback to list item
  if (
    currentTemplate.value &&
    ( currentTemplate.value.template_id === selectedTemplateId.value ||
      currentTemplate.value.id === selectedTemplateId.value )
  ) {
    return currentTemplate.value
  }
  // Ensure templates.value is an array before calling find
  if ( Array.isArray( templates.value ) ) {
    return templates.value.find( t => t.template_id === selectedTemplateId.value || t.id === selectedTemplateId.value )
  }
  return null
} )

// Map backend step value types to preview component types
const mapValueTypeToPreviewType = valueType => {
  const mapping = {
    numeric : 'number',
    boolean : 'checkbox',
    inspection : 'inspection',
    text : 'text',
    file : 'attachments',
    service : 'service'
  }
  return mapping[valueType] || valueType || 'text'
}

// Transform backend steps to preview-ready steps
const previewSteps = computed( () => {
  const tmpl = selectedTemplate.value
  const steps = Array.isArray( tmpl?.steps ) ? tmpl.steps : []
  return steps.map( ( s, idx ) => {
    const v = s.value || {}
    const type = mapValueTypeToPreviewType( v.type )
    const base = {
      step_id : s.id || s.step_id || `step-${idx}`,
      order : idx + 1,
      type,
      label : s.name || s.label || `Step ${idx + 1}`,
      description : s.description || '',
      required : Boolean( s.required ),
      required_image : Boolean( v.require_image ),
      relevant_tools : ( s.tools || [] ).map( t => ( { tool_id : t.id, name : t.name } ) ),
      config : {}
    }

    if ( type === 'number' ) {
      base.config = {
        default_value : typeof v.value === 'number' ? v.value : undefined,
        limits : transformLimitsFromBackend( v.numeric_limit_bounds ),
        required_image : base.required_image
      }
    } else if ( type === 'checkbox' ) {
      base.config = { default : Boolean( v.value ), required_image : base.required_image }
    } else if ( type === 'text' ) {
      base.config = { default_value : v.value ?? '', required_image : base.required_image }
    } else if ( type === 'inspection' ) {
      base.config = { default : 'pass', required_image : base.required_image }
    } else if ( type === 'attachments' ) {
      base.config = { upload_style : { list_type : 'picture-card' }, required_image : base.required_image }
    }
    return base
  } )
} )

const filteredPreviewSteps = computed( () => {
  if ( !stepSearchQuery.value ) {
    return previewSteps.value
  }
  const query = stepSearchQuery.value.toLowerCase()
  return previewSteps.value.filter( step => step.label.toLowerCase().includes( query ) )
} )

// Desktop preview helpers
const getStepComponent = stepType => {
  const components = {
    inspection : InspectionStepPreview,
    checkbox : CheckboxStepPreview,
    number : NumberStepPreview,
    text : TextStepPreview,
    files : AttachmentStepPreview,
    attachments : AttachmentStepPreview,
    service : ServiceStepPreview
  }
  return components[stepType] || 'div'
}

const getStepWithNumber = ( step, index ) => ( {
  ...step,
  label : `${index + 1}. ${step.label || 'Step'}`
} )

const toggleStepTools = stepId => {
  stepToolsVisible[stepId] = !stepToolsVisible[stepId]
}

const getStepToolsVisible = stepId => {
  return Boolean( stepToolsVisible[stepId] )
}

const paginationInfo = computed( () => {
  const total = pagination.value.total || 0
  const currentPageNum = pagination.value.page || 1
  const currentPageSize = pagination.value.size || 20
  const start = total === 0 ? 0 : ( currentPageNum - 1 ) * currentPageSize + 1
  const end = Math.min( currentPageNum * currentPageSize, total )
  return { start, end, total }
} )

const searchDebounce = ref( null )

const handleStepSearch = () => {
  // The computed property `filteredPreviewSteps` will automatically update.
  // This function is here for potential future use, like debouncing.
}

// Event handlers
const handleSearch = () => {
  clearTimeout( searchDebounce.value )
  searchDebounce.value = setTimeout( () => {
    if ( searchByIdMode.value ) {
      setFilter( 'reference_id', searchQuery.value )
    } else {
      setFilter( 'keyword', searchQuery.value )
    }
    currentPage.value = 1
  }, 500 ) // 500ms debounce delay
}

const toggleSearchMode = () => {
  searchByIdMode.value = !searchByIdMode.value
  searchQuery.value = '' // Clear the visual input

  // Clear the alternative search filter in the store
  if ( searchByIdMode.value ) {
    // Switched TO ID mode, so clear keyword
    setFilter( 'keyword', '' )
  } else {
    // Switched TO Name mode, so clear reference_id
    setFilter( 'reference_id', '' )
  }
  // handleSearch() is no longer needed as setFilter triggers a fetch
}

const toggleFilterVisibility = () => {
  showFilters.value = !showFilters.value
  if ( !showFilters.value ) {
    clearAllFilters()
  }
}
const handleCategoryFilter = () => {
  setFilter( 'category', categoryFilter.value )
  currentPage.value = 1
}

const clearAllFilters = () => {
  searchQuery.value = ''
  searchByIdMode.value = false
  categoryFilter.value = ''
  assetFilter.value = []
  clearFilters()
  currentPage.value = 1
}

const handlePageChange = page => {
  currentPage.value = page
  // Update store pagination and fetch new data
  setPage( page )
  loadTemplates()
}

const handlePageSizeChange = size => {
  pageSize.value = size
  currentPage.value = 1
  // Update store pagination and fetch new data
  setPageSize( size )
}

const handleTemplateSelect = async template => {
  selectedTemplateId.value = template.template_id || template.id
  // Load full template details for right panel using new API
  try {
    await loadTemplate( template.template_id || template.id )
  } catch ( error ) {
    console.error( 'Template details load failed:', error )
  }
}

const handleTemplateEdit = ( template = selectedTemplate.value ) => {
  if ( template ) {
    // Template ID can be either template_id or id depending on API response format
    const templateId = template.template_id || template.id
    if ( !templateId ) {
      console.error( 'Missing template ID:', template )
      ElMessage.error( 'Unable to edit task - missing template ID' )
      return
    }

    // Prevent opening duplicate edit tabs for the same ID
    const tagsViewStore = useTagsViewStore()
    const targetPath = `/maintenance-library/designer/${templateId}`
    const existing = ( tagsViewStore.visitedViews || [] ).find( v => v.path === targetPath )
    if ( existing ) {
      router.push( existing.fullPath || existing.path )
      return
    }

    router.push( {
      name : 'TaskDesignerEdit',
      params : { id : templateId }
    } )
  } else {
    ElMessage.error( 'No template selected for editing' )
  }
}

// Helper function to transform template data for duplication
const prepareDuplicateData = ( sourceTemplate, newName ) => {
  if ( !sourceTemplate ) {
    throw new Error( 'Source template is required' )
  }

  // Transform the template to match the designer format expected by createTemplate
  const duplicateData = {
    name : newName || `${sourceTemplate.name} (Copy)`,
    description : sourceTemplate.description || '',
    category : sourceTemplate.category?.id || sourceTemplate.category,
    estimated_minutes : sourceTemplate.time_estimate_sec
      ? Math.round( sourceTemplate.time_estimate_sec / 60 )
      : sourceTemplate.estimated_minutes || 30,
    applicable_assets : sourceTemplate.equipment_node_id
      ? Array.isArray( sourceTemplate.equipment_node_id )
        ? sourceTemplate.equipment_node_id
        : [sourceTemplate.equipment_node_id]
      : [],
    steps : []
  }

  // Transform steps from API format to designer format if they exist
  if ( sourceTemplate.steps && Array.isArray( sourceTemplate.steps ) ) {
    duplicateData.steps = sourceTemplate.steps.map( ( step, index ) => {
      const stepValue = step.value || {}
      const stepType = mapApiStepTypeToDesigner( stepValue.type )

      return {
        step_id : `step-${Date.now()}-${index}`, // Generate new step IDs
        order : index + 1,
        type : stepType,
        label : step.name || `Step ${index + 1}`,
        description : step.description || '',
        required : Boolean( step.required ),
        required_image : Boolean( stepValue.require_image ),
        relevant_tools : transformApiToolsToDesigner( step.tools || [] ),
        relevant_resources : step.relevant_resources || [],
        config : transformApiStepConfigToDesigner( stepType, stepValue )
      }
    } )
  }

  return duplicateData
}

// Helper function to map API step types to designer step types
const mapApiStepTypeToDesigner = apiType => {
  const typeMap = {
    numeric : 'number',
    boolean : 'checkbox',
    checkbox : 'checkbox',
    text : 'text',
    file : 'attachments',
    inspection : 'inspection',
    service : 'service'
  }
  return typeMap[apiType] || 'text'
}

// Helper function to transform API tools to designer format
const transformApiToolsToDesigner = apiTools => {
  if ( !Array.isArray( apiTools ) ) return []
  return apiTools.map( tool => ( {
    tool_id : tool.id,
    name : tool.name || 'Unnamed Tool'
  } ) )
}

// Helper function to transform API step config to designer format
const transformApiStepConfigToDesigner = ( stepType, apiValue ) => {
  const baseConfig = {
    required_image : Boolean( apiValue.require_image )
  }

  switch ( stepType ) {
    case 'number':
      return {
        ...baseConfig,
        kind : 'number',
        unit : apiValue.unit || '',
        decimal_places : apiValue.decimal_places || 0,
        default_value : typeof apiValue.value === 'number' ? apiValue.value : 0,
        limits : apiValue.numeric_limit_bounds || null
      }

    case 'checkbox':
      return {
        ...baseConfig,
        kind : 'checkbox',
        default : Boolean( apiValue.value )
      }

    case 'text':
      return {
        ...baseConfig,
        kind : 'text',
        multiline : true,
        max_length : 1000,
        default_value : String( apiValue.value || '' )
      }

    case 'inspection':
      return {
        ...baseConfig,
        kind : 'inspection',
        choices : ['pass', 'fail'],
        default : apiValue.value ? 'pass' : 'fail',
        require_comment_on_fail : false,
        require_photo_on_fail : false
      }

    case 'attachments':
      return {
        ...baseConfig,
        kind : 'attachments',
        allow_types : ['image', 'pdf'],
        max_files : 5,
        max_file_size_mb : 10
      }

    default:
      return baseConfig
  }
}

const handleTemplateDuplicate = async( template = selectedTemplate.value ) => {
  if ( !template ) {
    ElMessage.error( 'No template selected for duplication' )
    return
  }

  try {
    // Show confirmation dialog with name input
    const result = await ElMessageBox.prompt(
      'Are you sure you want to duplicate this task template?',
      'Duplicate Task Template',
      {
        confirmButtonText : 'Duplicate',
        cancelButtonText : 'Cancel',
        inputPlaceholder : `${template.name} (Copy)`,
        inputValue : `${template.name} (Copy)`,
        inputValidator : value => {
          if ( !value || value.trim().length === 0 ) {
            return 'Template name is required'
          }
          if ( value.trim().length > 255 ) {
            return 'Template name must be 255 characters or less'
          }
          return true
        },
        inputErrorMessage : 'Invalid template name'
      }
    )

    const newName = result.value.trim()

    // Prepare the duplicate data using the helper function
    const duplicateData = prepareDuplicateData( template, newName )

    // Create the new template using the existing createTemplate function
    const newTemplate = await createTemplate( duplicateData )

    // Refresh the template list
    await loadTemplates()

    // Success feedback
    ElMessage.success( `Task "${newName}" duplicated successfully` )

    // Optionally, select the newly created template
    if ( newTemplate && newTemplate.id ) {
      // Find and select the new template in the list after refresh
      nextTick( () => {
        const createdTemplate = templates.value.find( t => t.template_id === newTemplate.id || t.id === newTemplate.id )
        if ( createdTemplate ) {
          selectedTemplate.value = createdTemplate
        }
      } )
    }
  } catch ( error ) {
    // Handle user cancellation
    if ( error === 'cancel' ) {
      return // User cancelled, no error message needed
    }

    // Handle other errors
    console.error( 'Template duplication failed:', error )
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to duplicate task template'
    ElMessage.error( errorMessage )
  }
}

const handleTemplateDelete = template => {
  templateToDelete.value = template
  deleteConfirmationText.value = ''
  deleteConfirmationValid.value = false
  deleteDialogVisible.value = true
}

const validateDeleteConfirmation = () => {
  deleteConfirmationValid.value = deleteConfirmationText.value === templateToDelete.value?.name
}

const handleDeleteCancel = () => {
  deleteDialogVisible.value = false
  templateToDelete.value = null
  deleteConfirmationText.value = ''
  deleteConfirmationValid.value = false
}

const handleDeleteConfirm = async() => {
  if ( !templateToDelete.value ) return

  // Get the template ID from either id or template_id field
  const templateId = templateToDelete.value.id || templateToDelete.value.template_id

  if ( !templateId ) {
    ElMessage.error( 'Template ID is missing, cannot delete template' )
    return
  }

  deleteLoading.value = true
  try {
    await deleteTemplate( templateId )

    // Clear selection if deleted template was selected
    if ( selectedTemplateId.value === templateId ) {
      selectedTemplateId.value = null
    }

    deleteDialogVisible.value = false
    templateToDelete.value = null
    deleteConfirmationText.value = ''
    deleteConfirmationValid.value = false
  } catch ( error ) {
    ElMessage.error( 'Failed to delete task' )
  } finally {
    deleteLoading.value = false
  }
}

const handleHeaderAction = command => {
  // eslint-disable-next-line default-case
  switch ( command ) {
    case 'edit':
      handleTemplateEdit()
      break

    case 'duplicate':
      handleTemplateDuplicate()
      break

    case 'createWorkOrder':
      createNewWorkOrder()
      break

    case 'delete':
      handleTemplateDelete( selectedTemplate.value )
      break
  }
}

const createNewTemplate = () => {
  // Ensure only one Designer (create) tab exists at a time
  const tagsViewStore = useTagsViewStore()
  const existing = ( tagsViewStore.visitedViews || [] ).find( v => v.path === '/maintenance-library/designer' )
  if ( existing ) {
    router.push( existing.fullPath || existing.path )
    return
  }
  router.push( { name : 'TaskDesigner' } )
}

const createNewWorkOrder = async() => {
  if ( !selectedTemplate.value ) {
    ElMessage.error( 'No template selected. Please select a template first.' )
    return
  }

  try {
    // Check if there's already an unfinished work order
    if ( workOrderDraftStore.hasDraft ) {
      // Show confirmation dialog
      const result = await ElMessageBox.confirm(
        'You have an unfinished work order. Add this task there?',
        'Unfinished Work Order',
        {
          confirmButtonText : 'Yes',
          cancelButtonText : 'Cancel',
          type : 'warning',
          customClass : 'work-order-confirmation-dialog'
        }
      )

      if ( result === 'cancel' ) {
        // User chose to discard the existing draft
        workOrderDraftStore.clearDraft()
      }
      // If user chose "Add Here", we continue with the existing logic below
    }

    // Set context to create mode BEFORE appending task
    workOrderDraftStore.setCreateMode()

    // Convert the selected template to a task format
    const taskFromTemplate = buildDisplayTaskFromTemplate( selectedTemplate.value )

    // Add the task to the work order draft
    workOrderDraftStore.appendTask( taskFromTemplate )

    // Set flag to automatically open the create panel
    workOrderDraftStore.setShouldOpenCreatePanel( true )

    // Navigate to work order view in todo mode
    router.push( {
      path : '/work-order',
      query : { view : 'todo' }
    } )

    ElMessage.success( `Template "${selectedTemplate.value.name}" added to work order creation` )
  } catch ( error ) {
    // Handle user cancellation (when clicking X or pressing Esc)
    if ( error === 'cancel' || error === 'close' ) {
      return // User cancelled, no error message needed
    }

    console.error( 'Failed to create work order from template:', error )
    ElMessage.error( 'Failed to add template to work order. Please try again.' )
  }
}

const navigateToStepsTab = () => {
  activeTab.value = 'steps'
}

// Helper functions

const getCategoryLabel = category => {
  if ( !category ) return 'Uncategorized'
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
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

// eslint-disable-next-line no-unused-vars
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

  // Initial load of templates
  loadTemplates()

  // Load filter data
  fetchEquipmentTreeData()
  fetchCategories()
} )

// Handle template focusing when navigating from template creation
const handleTemplateFocus = async( templateId, refresh = false ) => {
  try {
    // If refresh is requested, reload templates first
    if ( refresh ) {
      await loadTemplates()
    }

    // Give a small delay to ensure DOM is updated
    await nextTick()

    // Clear filters and search to ensure the template is findable
    clearAllFilters()

    // Find the template in all templates (not just filtered ones)
    let template = templates.value.find( t => t.id === templateId || t.template_id === templateId )

    // If not found, try a second load (sometimes new items take a moment)
    if ( !template ) {
      await new Promise( resolve => setTimeout( resolve, 500 ) ) // Wait 500ms
      await loadTemplates() // Reload templates
      template = templates.value.find( t => t.id === templateId || t.template_id === templateId )
    }

    if ( template ) {
      // Find which page the template is on
      const templateIndex = templates.value.findIndex( t => t.id === templateId || t.template_id === templateId )
      const templatePage = Math.ceil( ( templateIndex + 1 ) / pageSize.value )

      // Navigate to the correct page if needed
      if ( templatePage !== currentPage.value ) {
        currentPage.value = templatePage
        setPage( templatePage )
        await loadTemplates()
        await nextTick()
      }

      // Highlight the template card with animation
      highlightedTemplateId.value = template.template_id || template.id

      // Use the existing template selection function to properly focus the template
      await handleTemplateSelect( template )

      ElMessage.success( `Task "${template.name}" created successfully` )

      // Remove highlight after 3 seconds
      setTimeout( () => {
        highlightedTemplateId.value = null
      }, 3000 )

      // Scroll the template card into view
      await nextTick()
      const templateCard = document.querySelector( `.template-card.highlighted` )
      if ( templateCard ) {
        templateCard.scrollIntoView( { behavior : 'smooth', block : 'center' } )
      }
    } else {
      // Template might not be visible due to other issues - still show success
      ElMessage.success( 'Task created successfully' )
    }
  } catch ( error ) {
    console.error( 'Template focus failed:', error )
    // Don't show another success message on error - the template was still created
  }

  // Clean up the query parameter
  router.replace( { query : { ...route.query, focusTemplate : undefined, refresh : undefined }} )
}

// Watch for route changes to handle template focusing
watch(
  () => route.query,
  newQuery => {
    if ( newQuery.focusTemplate ) {
      const refresh = newQuery.refresh === 'true'
      handleTemplateFocus( newQuery.focusTemplate, refresh )
    }
  },
  { immediate : true }
)

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

::v-deep(.el-checkbox__input.is-disabled + span.el-checkbox__label) {
  color: #606266;
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

.template-id-header {
  font-size: 16px;
  color: #606266;
  margin-left: 10px;
  font-weight: normal;
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

.info-value.warning {
  color: var(--el-color-warning);
  font-weight: 600;
}

.info-value.step-count {
  color: #67c23a;
  font-weight: 600;
}

.clickable-steps {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-steps:hover {
  color: #409eff !important;
  text-decoration: underline;
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
  padding: 16px 12px;
  background: transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: #f5f7fa;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-color-primary);
  line-height: 1;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8492a6;
  font-weight: 500;
  line-height: 1;
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

.steps-preview {
  margin-bottom: 24px;
}

.empty-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* Desktop-style preview (borrowed from PreviewDialog, simplified) */
.step-search-bar {
  padding: 0px 0px 12px 0px;
  height: 8%;
}

.procedure-preview {
  margin-bottom: 24px;
}

.preview-main {
  overflow-y: auto;
}

.preview-section {
}

.section-content {
}

.preview-step-simple {
  margin-bottom: 12px;
}

.step-config-preview {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.preview-bottom-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e4e7ed;
  display: flex;
  align-items: center;
}

.desktop-upload-button {
  width: 100%;
  text-align: left;
}

.desktop-upload-button .el-button {
  min-width: 130px;
  border: 1px dashed #dcdfe6;
  color: #606266;
  background: white;
}

.required-asterisk {
  color: #f56c6c;
  margin-right: 4px;
}

/* Tools Styling */
.tools-toggle-btn {
  font-size: 12px;
  padding: 0 12px;
  border-radius: 6px;
}

.desktop-tools-list {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.tools-list-header {
  margin-bottom: 8px;
}

.tools-list-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.tools-list-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8f9fb;
  border-radius: 4px;
  font-size: 12px;
}

.tool-item .el-icon {
  color: #409eff;
  font-size: 14px;
  margin-right: 0;
}

.tool-name {
  color: #303133;
  font-weight: 500;
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

.filter-toggle {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.filter-toggle:hover {
  color: var(--el-color-primary);
}

.filter-toggle.is-active {
  color: var(--el-color-primary);
}

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
</style>

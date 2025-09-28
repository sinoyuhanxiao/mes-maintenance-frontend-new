<template>
  <div class="task-dialog-container">
    <!-- Main Add Task Content -->
    <div v-if="!showPreviewDialog" class="task-dialog-content">
      <!-- Search Container (always visible) -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="Search task templates..."
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
        <el-link type="primary" @click="handleNewTask" class="new-task-link"> + New Task </el-link>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="4" animated />
        </div>

        <div v-else-if="taskTemplates.length === 0" class="empty-container">
          <el-empty description="No task templates found" :image-size="80" />
        </div>

        <div v-else>
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ paginationInfo.total }} templates
            </div>
            <el-select v-model="pageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select>
          </div>

          <CardTable
            :module="5"
            :data="taskTemplates"
            :maxHeight="'60vh'"
            :totalItems="totalItems"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :showBorder="true"
            :showPagination="true"
            :showSearch="false"
            :loading="loading"
            :focusedCardId="focusedCardId"
            :selectedItems="selectedTemplates"
            @selection="handleTaskAction"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="task-dialog-footer">
      <div class="footer-actions">
        <el-button :type="focusedCardId ? 'success' : ''" :disabled="!focusedCardId" @click="handlePreview">
          Preview
        </el-button>
        <el-button
          type="primary"
          :disabled="selectedTemplates.size === 0 || isAddingTemplates"
          :loading="isAddingTemplates"
          @click="handleAddTemplates"
        >
          Add Templates ({{ selectedTemplates.size }})
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
          <el-button type="text" @click="handleBackToAddTask" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span :id="titleId" class="dialog-title"> Preview: {{ getPreviewTemplateTitle() }} </span>
          <el-tooltip content="Interactive Mode" placement="top">
            <el-switch v-model="isInteractive" />
          </el-tooltip>
        </div>
      </template>

      <StepsPreview
        v-if="previewTemplateId"
        :template-id="previewTemplateId"
        :interactive="isInteractive"
        :show-mode-switch="false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CardTable from '../Tables/CardTable.vue'
import StepsPreview from '@/components/TaskLibrary/StepsPreview.vue'
import { searchTaskTemplates, getTaskTemplateById } from '@/api/task-library'
import { debounce } from 'lodash-es'
import { useRouter, useRoute } from 'vue-router'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'

// Define props and emits
const props = defineProps( {
  originPanel : {
    type : String,
    default : 'create'
  },
  originWorkOrderId : {
    type : [Number, String],
    default : null
  }
} )

const emit = defineEmits( ['close', 'addTemplates'] )

const router = useRouter()
const route = useRoute()
const workOrderDraftStore = useWorkOrderDraftStore()

// Reactive state
const taskTemplates = ref( [] )
const loading = ref( false )
const searchQuery = ref( '' )
const totalItems = ref( 0 )
const currentPage = ref( 1 )
const pageSize = ref( 20 )

// Track selected templates
const selectedTemplates = ref( new Set() )
const isAddingTemplates = ref( false )

// Track focused card for preview functionality
const focusedCardId = ref( null )

// Preview dialog state
const showPreviewDialog = ref( false )
const previewTemplateId = ref( null )
const isInteractive = ref( false )

// Computed properties
const selectedTemplatesList = computed( () => {
  return taskTemplates.value.filter( template => selectedTemplates.value.has( template.id || template._id ) )
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
const fetchTaskTemplates = async( resetPage = false ) => {
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

    const response = await searchTaskTemplates( currentPage.value, pageSize.value, 'createdAt', 'DESC', filter )

    // Handle response data structure
    const content = response.data?.content || response.data || []
    taskTemplates.value = Array.isArray( content ) ? content : []

    // Handle total count from different possible response structures
    totalItems.value =
      response.data?.totalElements ||
      response.data?.total ||
      response.totalElements ||
      response.total ||
      taskTemplates.value.length
  } catch ( error ) {
    console.error( 'Error fetching task templates:', error )
    ElMessage.error( 'Failed to load task templates' )
    taskTemplates.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = page => {
  currentPage.value = page
  fetchTaskTemplates()
}

const handlePageSizeChange = newSize => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchTaskTemplates()
}

const handleTaskAction = selectionData => {
  const { id, action } = selectionData

  if ( action === 'check' ) {
    selectedTemplates.value.add( id )
  } else if ( action === 'uncheck' ) {
    selectedTemplates.value.delete( id )
  } else if ( action === 'focus' ) {
    focusedCardId.value = id
  }
}

const mergeTemplateData = ( baseTemplate, detailedTemplate ) => {
  return {
    ...baseTemplate,
    ...detailedTemplate,
    steps : Array.isArray( detailedTemplate?.steps ) && detailedTemplate.steps.length > 0
      ? detailedTemplate.steps
      : baseTemplate?.steps || []
  }
}

const ensureTemplateSteps = async template => {
  if ( Array.isArray( template?.steps ) && template.steps.length > 0 ) {
    return template
  }

  try {
    const templateId = template.id || template._id || template.template_id
    if ( !templateId ) {
      throw new Error( 'Template is missing an identifier' )
    }

    const response = await getTaskTemplateById( templateId )
    const detailedTemplate = response?.data ?? response
    if ( !detailedTemplate ) {
      throw new Error( 'Missing template detail payload' )
    }
    return mergeTemplateData( template, detailedTemplate )
  } catch ( error ) {
    console.error( 'Failed to fetch template details:', error )
    ElMessage.error( `Unable to load steps for template "${template?.name || 'Unnamed Template'}"` )
    return null
  }
}

const handleAddTemplates = async() => {
  if ( selectedTemplates.value.size === 0 || isAddingTemplates.value ) {
    return
  }

  isAddingTemplates.value = true
  try {
    const templatesToAdd = await Promise.all(
      selectedTemplatesList.value.map( template => ensureTemplateSteps( template ) )
    )

    const validTemplates = templatesToAdd.filter( Boolean )
    if ( validTemplates.length === 0 ) {
      return
    }

    emit( 'addTemplates', validTemplates )
    selectedTemplates.value.clear()
    emit( 'close' )
  } finally {
    isAddingTemplates.value = false
  }
}

const handlePreview = () => {
  if ( !focusedCardId.value ) {
    ElMessage.warning( 'Please select a task template to preview' )
    return
  }

  previewTemplateId.value = focusedCardId.value
  showPreviewDialog.value = true
}

const handleBackToAddTask = () => {
  showPreviewDialog.value = false
  previewTemplateId.value = null
}

const handleClosePreview = () => {
  handleBackToAddTask()
}

const getPreviewTemplateTitle = () => {
  if ( !previewTemplateId.value ) return 'Template'

  const template = taskTemplates.value.find( t => ( t.id || t._id || t.template_id ) === previewTemplateId.value )
  return template?.name || 'Template'
}

const handleNewTask = () => {
  const returnPath = route.fullPath || '/work-order/table'
  workOrderDraftStore.setReturnRoute( returnPath )

  const panel = props.originPanel === 'edit' ? 'edit' : 'create'
  workOrderDraftStore.setReturnPanel( panel )

  if ( panel === 'edit' ) {
    workOrderDraftStore.setReturnWorkOrderId( props.originWorkOrderId ?? null )
    workOrderDraftStore.setShouldOpenCreatePanel( false )
    // Note: For edit mode, the current work order form should already be synced to draft
    // This happens in the parent component (WorkOrderEdit) before opening this dialog
  } else {
    workOrderDraftStore.setReturnWorkOrderId( null )
    workOrderDraftStore.setShouldOpenCreatePanel( true )
  }

  const query = {
    fromWorkOrder : 'true',
    returnRoute : returnPath,
    returnPanel : panel
  }

  if ( panel === 'edit' && props.originWorkOrderId ) {
    query.returnWorkOrderId = String( props.originWorkOrderId )
  }

  router.push( {
    name : 'TaskDesigner',
    query
  } )

  emit( 'close' )
}

// Debounced search handler for better performance
const debouncedSearch = debounce( () => {
  fetchTaskTemplates( true )
}, 300 )

// Event handlers
const handleSearch = () => {
  selectedTemplates.value.clear() // Clear selections when searching
  focusedCardId.value = null // Clear focused card when searching
  debouncedSearch()
}

// Watch for search query changes
watch( searchQuery, () => {
  if ( !searchQuery.value?.trim() ) {
    selectedTemplates.value.clear()
    focusedCardId.value = null
    fetchTaskTemplates( true )
  }
} )

// Lifecycle
onMounted( () => {
  fetchTaskTemplates()
} )

defineOptions( {
  name : 'AddTask'
} )
</script>

<style scoped lang="scss">
.task-dialog-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  padding: 0;
}

.task-dialog-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .search-container {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    .search-input {
      width: 50%;
    }

    .new-task-link {
      margin-right: 14px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
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

.task-dialog-footer {
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
  justify-content: space-evenly;
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
}

// Responsive adjustments
@media (max-width: 768px) {
  .task-dialog-container {
    height: 500px;
  }

  .task-dialog-footer {
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

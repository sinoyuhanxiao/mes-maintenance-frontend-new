<template>
  <div class="steps-preview-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-empty description="Failed to load template steps" :image-size="60" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Step Search Bar -->
      <div class="step-search-bar">
        <el-input v-model="stepSearchQuery" placeholder="Search steps by name..." clearable @input="handleStepSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Desktop-style Procedure Preview (read-only) -->
      <div v-if="filteredPreviewSteps && filteredPreviewSteps.length > 0" class="procedure-preview">
        <div class="preview-main viewport-desktop density-comfortable">
          <div class="section-content">
            <div v-for="(step, index) in filteredPreviewSteps" :key="step.step_id || index" class="preview-step-simple">
              <div class="step-config-preview">
                <component
                  :is="getStepComponent(step.type)"
                  :step="getStepWithNumber(step, index)"
                  :preview-mode="true"
                  :interactive="isInteractive"
                />

                <!-- Bottom section for required image OR tools (desktop style) -->
                <div
                  v-if="step.required_image || (step.relevant_tools && step.relevant_tools.length > 0)"
                  class="preview-bottom-section"
                >
                  <div class="desktop-upload-button">
                    <el-button v-if="step.required_image" type="info" size="small" :disabled="!isInteractive">
                      <span class="required-asterisk">*</span>
                      <el-icon><Upload /></el-icon>
                      Upload Image
                    </el-button>

                    <!-- Show Tools Button -->
                    <el-button
                      :disabled="!isInteractive"
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
                  v-if="getStepToolsVisible(step.step_id) && step.relevant_tools && step.relevant_tools.length > 0"
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
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { Search, Upload, Tools } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTaskLibrary } from '@/composables/designer/useTaskLibrary'
import { transformLimitsFromBackend } from '@/views/taskLibrary/utils/stepTransforms'

// Preview components reused from Procedure Designer
import InspectionStepPreview from '@/views/taskLibrary/components/Designer/StepCards/InspectionStepPreview.vue'
import CheckboxStepPreview from '@/views/taskLibrary/components/Designer/StepCards/CheckboxStepPreview.vue'
import NumberStepPreview from '@/views/taskLibrary/components/Designer/StepCards/NumberStepPreview.vue'
import TextStepPreview from '@/views/taskLibrary/components/Designer/StepCards/TextStepPreview.vue'
import AttachmentStepPreview from '@/views/taskLibrary/components/Designer/StepCards/AttachmentStepPreview.vue'
import ServiceStepPreview from '@/views/taskLibrary/components/Designer/StepCards/ServiceStepPreview.vue'

const props = defineProps( {
  templateId : {
    type : [String, Number],
    default : ''
  },
  steps : {
    type : Array,
    default : () => []
  },
  interactive : {
    type : Boolean,
    default : false
  },
  showModeSwitch : {
    type : Boolean,
    default : true
  }
} )

// Composables
const { loadTemplate } = useTaskLibrary()

// Local state
const loading = ref( false )
const error = ref( false )
const template = ref( null )
const stepSearchQuery = ref( '' )
const stepToolsVisible = reactive( {} )
const isInteractive = ref( props.interactive )

// Watch for prop changes
watch(
  () => props.interactive,
  newValue => {
    isInteractive.value = newValue
  }
)

// Map backend step value types to preview component types
const mapValueTypeToPreviewType = valueType => {
  const normalized = ( valueType || '' ).toString().toLowerCase()

  if ( normalized.includes( 'numeric' ) || normalized === 'number' ) {
    return 'number'
  }

  if ( normalized.includes( 'boolean' ) || normalized.includes( 'checkbox' ) ) {
    return 'checkbox'
  }

  if ( normalized.includes( 'inspection' ) ) {
    return 'inspection'
  }

  if ( normalized.includes( 'file' ) || normalized.includes( 'attachment' ) ) {
    return 'attachments'
  }

  if ( normalized.includes( 'service' ) ) {
    return 'service'
  }

  if ( normalized.includes( 'text' ) ) {
    return 'text'
  }

  return normalized || 'text'
}

// Transform backend steps to preview-ready steps
const sourceSteps = computed( () => {
  if ( Array.isArray( props.steps ) && props.steps.length > 0 ) {
    return props.steps
  }

  const tmpl = template.value
  return Array.isArray( tmpl?.steps ) ? tmpl.steps : []
} )

const previewSteps = computed( () => {
  return sourceSteps.value.map( ( s, idx ) => {
    const v = s.value || {}
    const type = mapValueTypeToPreviewType( v.type )
    const tools = Array.isArray( s.tools ) && s.tools.length > 0 ? s.tools : s.relevant_tools || []
    const numericBounds = v.numeric_limit_bounds || v.numericLimitBounds || {}
    const base = {
      step_id : s.id || s.step_id || `step-${idx}`,
      order : idx + 1,
      type,
      label : s.name || s.label || `Step ${idx + 1}`,
      description : s.description || '',
      required : Boolean( s.required ),
      required_image : Boolean( v.require_image ),
      relevant_tools : tools.map( t => ( {
        tool_id : t.id || t.tool_id,
        name : t.name || t.tool_name || 'Unnamed Tool'
      } ) ),
      config : {}
    }

    if ( type === 'number' ) {
      base.config = {
        default_value : typeof v.value === 'number' ? v.value : undefined,
        limits : transformLimitsFromBackend( numericBounds ),
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

const handleStepSearch = () => {
  // The computed property `filteredPreviewSteps` will automatically update.
}

// eslint-disable-next-line no-unused-vars
const handleModeChange = value => {
  isInteractive.value = value
}

const hasExternalSteps = computed( () => Array.isArray( props.steps ) && props.steps.length > 0 )

const resetStepToolsVisibility = () => {
  Object.keys( stepToolsVisible ).forEach( key => {
    delete stepToolsVisible[key]
  } )
}

// Load template data
const fetchTemplate = async() => {
  if ( !props.templateId || hasExternalSteps.value ) return

  resetStepToolsVisibility()

  loading.value = true
  error.value = false
  try {
    const loadedTemplate = await loadTemplate( props.templateId )
    template.value = loadedTemplate
  } catch ( err ) {
    console.error( 'Failed to load template for preview:', err )
    error.value = true
    ElMessage.error( 'Failed to load template steps' )
  } finally {
    loading.value = false
  }
}

const refreshPreviewSource = () => {
  resetStepToolsVisibility()

  if ( hasExternalSteps.value ) {
    loading.value = false
    error.value = false
    template.value = null
    return
  }

  if ( props.templateId ) {
    fetchTemplate()
  } else {
    template.value = null
    loading.value = false
    error.value = false
  }
}

// Watch for template ID changes
watch(
  () => props.templateId,
  newId => {
    if ( hasExternalSteps.value ) {
      return
    }

    if ( newId ) {
      fetchTemplate()
    } else {
      template.value = null
      loading.value = false
      error.value = false
    }
  },
  { immediate : true }
)

watch(
  () => props.steps,
  () => {
    refreshPreviewSource()
  },
  { deep : true, immediate : true }
)
</script>

<style scoped>
.steps-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.error-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.step-search-bar {
  padding: 0px 0px 4px 0px;
  flex-shrink: 0;
}

.procedure-preview {
  flex: 1;
  min-height: 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  min-height: 0;
}

.section-content {
  padding: 8px 0;
}

.preview-step-simple {
  margin-bottom: 12px;
}

.preview-step-simple:last-child {
  margin-bottom: 0;
}

.step-config-preview {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
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

.empty-steps {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Consistent scroll bar styling */
.preview-main::-webkit-scrollbar {
  width: 6px;
}

.preview-main::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.preview-main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.preview-main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

:deep(.el-icon) {
  margin-right: 5px;
}

/* Ensure all text content wraps properly */
:deep(.preview-label),
:deep(.step-description),
:deep(.el-input__inner),
:deep(.el-textarea__inner),
:deep(.tool-name) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

/* Prevent long text from breaking layout */
:deep(.el-button) {
  max-width: 100%;
  white-space: normal;
  text-overflow: ellipsis;
}

/* Ensure containers respect boundaries */
.preview-step-simple,
.step-config-preview,
.preview-bottom-section,
.desktop-tools-list {
  max-width: 100%;
  overflow: hidden;
}
</style>

<template>
  <div class="steps-preview-populated-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-empty description="Failed to load task steps" :image-size="60" />
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

      <!-- Desktop-style Populated Preview (read-only with actual values) -->
      <div v-if="filteredPreviewSteps && filteredPreviewSteps.length > 0" class="procedure-preview">
        <div class="preview-main viewport-desktop density-comfortable">
          <div class="section-content">
            <div v-for="(step, index) in filteredPreviewSteps" :key="step.step_id || index" class="preview-step-simple">
              <div class="step-config-preview">
                <component
                  :is="getStepComponent(step.type)"
                  :step="getStepWithNumber(step, index)"
                  :preview-mode="false"
                  :interactive="false"
                />

                <!-- Completion Metadata (only show timestamp, not user) -->
                <div v-if="step.completed_at" class="step-metadata">
                  <div class="metadata-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatTimestamp(step.completed_at) }}</span>
                  </div>
                </div>

                <!-- Bottom section for uploaded images -->
                <div v-if="step.uploaded_images && step.uploaded_images.length > 0" class="preview-bottom-section">
                  <div class="uploaded-images-section">
                    <h4>Uploaded Images</h4>
                    <div class="image-list">
                      <div v-for="(img, imgIdx) in step.uploaded_images" :key="imgIdx" class="image-item">
                        <el-image :src="img" fit="cover" :preview-src-list="step.uploaded_images" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom section for uploaded files (attachment steps) -->
                <div v-if="step.uploaded_files && step.uploaded_files.length > 0" class="preview-bottom-section">
                  <div class="uploaded-files-section">
                    <h4>Uploaded Files</h4>
                    <ul class="file-list">
                      <li v-for="(file, fileIdx) in step.uploaded_files" :key="fileIdx" class="file-item">
                        <a :href="file" target="_blank" class="file-link">
                          <el-icon><Document /></el-icon>
                          <span class="file-name">{{ extractFilenameFromUrl(file) }}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Tools List (if applicable) -->
                <div v-if="step.relevant_tools && step.relevant_tools.length > 0" class="desktop-tools-list">
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
import { ref, computed } from 'vue'
import { Search, Tools, Clock, Document } from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'

// Preview components reused from Procedure Designer
import InspectionStepPreview from '@/views/taskLibrary/components/Designer/StepCards/InspectionStepPreview.vue'
import CheckboxStepPreview from '@/views/taskLibrary/components/Designer/StepCards/CheckboxStepPreview.vue'
import NumberStepPreview from '@/views/taskLibrary/components/Designer/StepCards/NumberStepPreview.vue'
import TextStepPreview from '@/views/taskLibrary/components/Designer/StepCards/TextStepPreview.vue'
import AttachmentStepPreview from '@/views/taskLibrary/components/Designer/StepCards/AttachmentStepPreview.vue'
import ServiceStepPreview from '@/views/taskLibrary/components/Designer/StepCards/ServiceStepPreview.vue'

const props = defineProps( {
  steps : {
    type : Array,
    default : () => []
  }
} )

// Local state
const loading = ref( false )
const error = ref( false )
const stepSearchQuery = ref( '' )

// Helper function to extract and clean filename from URL
const removeTimestampFromFilename = filename => {
  if ( !filename || typeof filename !== 'string' ) return filename
  // Remove timestamp suffix pattern: -20251021180840125 (dash followed by 17 digits)
  return filename.replace( /-\d{17}(\.[^.]+)$/, '$1' )
}

const extractFilenameFromUrl = url => {
  if ( !url || typeof url !== 'string' ) return 'file'
  try {
    const parts = url.split( '/' )
    const lastPart = parts[parts.length - 1]
    let filename = decodeURIComponent( lastPart )
    filename = removeTimestampFromFilename( filename )
    return filename
  } catch ( error ) {
    return 'file'
  }
}

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

// Process populated steps from task log data
const processPopulatedStep = ( s, idx ) => {
  if ( !s || typeof s !== 'object' ) {
    return {
      step_id : `step-${idx}`,
      order : idx + 1,
      type : 'text',
      label : `Step ${idx + 1}`,
      description : '',
      required : false,
      config : {},
      completed_by : null,
      completed_at : null,
      uploaded_images : [],
      relevant_tools : []
    }
  }

  // Extract value data from step
  const v = s.value || {}
  const type = mapValueTypeToPreviewType( v.type )
  const tools = Array.isArray( s.tools ) && s.tools.length > 0 ? s.tools : s.relevant_tools || []

  // Extract uploaded images and files separately
  const uploadedImages = []
  const uploadedFiles = []

  if ( v.image && Array.isArray( v.image ) ) {
    uploadedImages.push( ...v.image )
  }
  if ( v.file && Array.isArray( v.file ) ) {
    uploadedFiles.push( ...v.file )
  }

  const base = {
    step_id : s.id || s.step_id || `step-${idx}`,
    order : idx + 1,
    type,
    label : s.name || s.label || `Step ${idx + 1}`,
    description : s.description || '',
    required : Boolean( s.required ),
    completed_by : s.completed_by,
    completed_at : s.completed_at,
    uploaded_images : uploadedImages,
    uploaded_files : uploadedFiles,
    relevant_tools : tools
      .filter( t => t && ( t.id || t.tool_id ) )
      .map( t => ( {
        tool_id : t.id || t.tool_id,
        name : t.name || t.tool_name || 'Unnamed Tool'
      } ) ),
    config : {}
  }

  // Build config with actual values from the task
  if ( type === 'number' ) {
    const numericBounds = v.numeric_limit_bounds || v.numericLimitBounds || {}
    base.config = {
      default : typeof v.value === 'number' ? v.value : 0,
      default_value : typeof v.value === 'number' ? v.value : 0,
      limits : {
        lower_limit_inclusive : numericBounds.lower_limit_inclusive,
        lower_limit_exclusive : numericBounds.lower_limit_exclusive,
        upper_limit_inclusive : numericBounds.upper_limit_inclusive,
        upper_limit_exclusive : numericBounds.upper_limit_exclusive,
        equal_to : numericBounds.equal_to
      }
    }
  } else if ( type === 'checkbox' ) {
    base.config = {
      default : Boolean( v.value )
    }
  } else if ( type === 'text' ) {
    console.log( '[StepsPreviewPopulated] Processing text step:', s.name || s.label )
    console.log( '[StepsPreviewPopulated] Value object v:', v )
    console.log( '[StepsPreviewPopulated] v.value:', v.value )
    base.config = {
      default : v.value ?? '',
      default_value : v.value ?? ''
    }
    console.log( '[StepsPreviewPopulated] Created config:', base.config )
  } else if ( type === 'inspection' ) {
    // For inspection, show the actual result (pass/fail) and remarks
    const result = v.value === true ? 'pass' : v.value === false ? 'fail' : 'pass'
    base.config = {
      default : result,
      result,
      remarks : v.remarks || ''
    }
    // Note: remarks are now displayed by InspectionStepPreview component, not in description
  } else if ( type === 'attachments' ) {
    base.config = {
      upload_style : { list_type : 'picture-card' },
      files : uploadedFiles
    }
  }

  return base
}

const previewSteps = computed( () => {
  return ( props.steps || [] ).map( ( s, idx ) => processPopulatedStep( s, idx ) )
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

const getStepWithNumber = ( step, index ) => {
  if ( !step || typeof step !== 'object' ) {
    return {
      step_id : `step-${index}`,
      type : 'text',
      label : `${index + 1}. Step`,
      description : '',
      required : false,
      config : {}
    }
  }
  return {
    ...step,
    label : `${index + 1}. ${step.label || 'Step'}`
  }
}

const formatTimestamp = timestamp => {
  if ( !timestamp ) return '-'
  return convertToLocalTime( timestamp )
}

const handleStepSearch = () => {
  // The computed property `filteredPreviewSteps` will automatically update.
}

defineOptions( {
  name : 'StepsPreviewPopulated'
} )
</script>

<style scoped>
.steps-preview-populated-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
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
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0px 0px 12px 0px;
  flex-shrink: 0;
  width: 100%;
  background: white;
}

.procedure-preview {
  flex: 1;
  min-height: 0;
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
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
}

.step-metadata {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.metadata-item .el-icon {
  color: #909399;
}

.preview-bottom-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e4e7ed;
}

.uploaded-images-section h4,
.uploaded-files-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.image-item {
  width: 100%;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.image-item .el-image {
  width: 100%;
  height: 100%;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fb;
  border-radius: 4px;
  color: #606266;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
}

.file-link:hover {
  background: #ecf5ff;
  color: #409eff;
}

.file-link .el-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-size: 13px;
  word-break: break-word;
}

/* Tools Styling */
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

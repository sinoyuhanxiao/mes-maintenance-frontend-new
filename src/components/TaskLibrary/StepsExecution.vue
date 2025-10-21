<template>
  <div class="steps-execution-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-empty description="Failed to load task steps" :image-size="60" />
    </div>

    <!-- Content -->
    <div style="height: 100%" v-else>
      <!-- Step Search Bar -->
      <div class="step-search-bar">
        <el-input v-model="stepSearchQuery" placeholder="Search steps by name..." clearable @input="handleStepSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Execution Steps -->
      <div v-if="filteredExecutionSteps && filteredExecutionSteps.length > 0" class="procedure-execution">
        <div class="execution-main viewport-desktop density-comfortable">
          <div class="section-content">
            <div
              v-for="(step, index) in filteredExecutionSteps"
              :key="step.step_id || index"
              class="execution-step"
              :class="{ 'step-completed': isStepCompleted(step) }"
            >
              <div class="step-config-execution">
              <component
                :is="getStepComponent(step.type)"
                :step="getStepWithNumber(step, index)"
                :preview-mode="false"
                :interactive="true"
                :model-value="getStepModelValue(step.step_id)"
                v-bind="getStepComponentProps(step)"
                @value-change="handleStepValueChange(step.step_id, $event)"
                @update:modelValue="handleStepValueChange(step.step_id, $event)"
              />

              <!-- Image Upload Section -->
                <div v-if="step.required_image || step.value?.require_image" class="image-upload-section">
                  <div class="upload-header">
                    <span class="upload-label">
                      <span v-if="step.required_image" class="required-asterisk">*</span>
                      Upload Images
                    </span>
                  </div>
                  <el-upload
                    :file-list="getStepImages(step.step_id)"
                    list-type="picture-card"
                    :auto-upload="false"
                    :on-change="uploadFile => handleImageSelected(step.step_id, uploadFile)"
                    :on-remove="file => handleImageRemove(step.step_id, file)"
                    accept="image/*"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </div>

                <div v-if="isAttachmentStep(step)" class="file-upload-section">
                  <el-upload
                    :file-list="getStepFiles(step.step_id)"
                    :auto-upload="false"
                    :on-change="uploadFile => handleAttachmentSelected(step.step_id, uploadFile)"
                    :on-remove="file => handleAttachmentRemove(step.step_id, file)"
                    :on-preview="handleFilePreview"
                  >
                    <el-button type="primary" plain>
                      <el-icon><UploadFilled /></el-icon>
                      Drop files here or click to upload
                    </el-button>
                  </el-upload>
                </div>

                <!-- Tools Section -->
                <div
                  v-if="step.relevant_tools && step.relevant_tools.length > 0"
                  class="tools-section"
                  :class="{ 'has-divider': step.required_image || step.value?.require_image }"
                >
                  <el-button size="small" plain @click="toggleStepTools(step.step_id)" class="tools-toggle-btn">
                    <el-icon><Tools /></el-icon>
                    {{ getStepToolsVisible(step.step_id) ? 'Hide Tools' : 'Show Tools' }} ({{
                      step.relevant_tools.length
                    }})
                  </el-button>
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
                      <div class="tool-header">
                        <el-icon><Tools /></el-icon>
                        <span class="tool-name">{{ tool.name || 'Unnamed Tool' }}</span>
                        <span v-if="tool.code" class="tool-code">Code: {{ tool.code }}</span>
                      </div>
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
import { Search, Tools, Plus, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTaskLibrary } from '@/composables/designer/useTaskLibrary'
import { transformLimitsFromBackend } from '@/views/taskLibrary/utils/stepTransforms'
import { uploadToMinio } from '@/api/minio'

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
  }
} )

// Emit event for parent to get step values
const emit = defineEmits( ['values-updated'] )

// Composables
const { loadTemplate } = useTaskLibrary()

// Local state
const loading = ref( false )
const error = ref( false )
const template = ref( null )
const stepSearchQuery = ref( '' )
const stepToolsVisible = reactive( {} )
const stepValues = reactive( {} ) // Store step values by step_id
const stepImages = reactive( {} ) // Store images by step_id
const stepFiles = reactive( {} ) // Store attachments by step_id
const stepInitialized = reactive( {} ) // Track which steps have been initialized

// Track upload loading states
const imageUploadLoading = reactive( {} )
const fileUploadLoading = reactive( {} )

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

// Enhanced step type detection for different data formats
const detectStepType = step => {
  // Handle designer format (step.type directly)
  if ( step.type ) {
    return mapValueTypeToPreviewType( step.type )
  }

  // Handle backend format (step.value.type)
  if ( step.value && step.value.type ) {
    return mapValueTypeToPreviewType( step.value.type )
  }

  // Handle step config format (step.config.kind)
  if ( step.config && step.config.kind ) {
    return mapValueTypeToPreviewType( step.config.kind )
  }

  // Handle legacy format lookups by checking step structure patterns
  if ( step.value ) {
    // Numeric field detection
    if ( typeof step.value.value === 'number' || step.value.has_upper_limit || step.value.has_lower_limit ) {
      return 'number'
    }

    // Boolean field detection
    if ( typeof step.value.value === 'boolean' ) {
      return 'checkbox'
    }

    // File field detection
    if ( step.value.files || step.value.file_attachments ) {
      return 'attachments'
    }
  }

  // Fallback to text type
  return 'text'
}

// Transform backend steps to execution-ready steps
const sourceSteps = computed( () => {
  if ( Array.isArray( props.steps ) && props.steps.length > 0 ) {
    return props.steps
  }

  const tmpl = template.value
  return Array.isArray( tmpl?.steps ) ? tmpl.steps : []
} )

// Process template-based steps
const processTemplateStep = ( s, idx ) => {
  if ( !s || typeof s !== 'object' ) {
    return {
      step_id : `step-${idx}`,
      order : idx + 1,
      type : 'text',
      label : `Step ${idx + 1}`,
      description : '',
      required : false,
      required_image : false,
      relevant_tools : [],
      config : {},
      originalStep : s
    }
  }

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
    relevant_tools : tools
      .filter( t => t && ( t.id || t.tool_id ) )
      .map( t => ( {
        tool_id : t.id || t.tool_id,
        name : t.name || t.tool_name || 'Unnamed Tool',
        code : t.code || '',
        description : t.description || ''
      } ) ),
    config : {},
    originalStep : s, // Keep original step data
    value : v // Keep original value structure
  }

  // Config building logic
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
    base.config = { default : v.value !== undefined ? v.value : 'pass', required_image : base.required_image }
  } else if ( type === 'attachments' ) {
    base.config = { upload_style : { list_type : 'picture-card' }, required_image : base.required_image }
  }

  // Initialize step values from existing data
  initializeStepValue( base.step_id, base.type, v )

  return base
}

// Process standalone steps
const processStandaloneStep = ( s, idx ) => {
  if ( !s || typeof s !== 'object' ) {
    return {
      step_id : `step-${idx}`,
      order : idx + 1,
      type : 'text',
      label : `Step ${idx + 1}`,
      description : '',
      required : false,
      required_image : false,
      relevant_tools : [],
      config : {},
      originalStep : s
    }
  }

  const type = detectStepType( s )
  const v = s.value || s.config || {}
  const tools = Array.isArray( s.tools ) && s.tools.length > 0 ? s.tools : s.relevant_tools || []
  const numericBounds = v.numeric_limit_bounds || v.numericLimitBounds || v.limits || {}
  const requiredImage = Boolean( v.require_image || v.required_image || s.required_image )

  const base = {
    step_id : s.id || s.step_id || `step-${idx}`,
    order : idx + 1,
    type,
    label : s.name || s.label || `Step ${idx + 1}`,
    description : s.description || '',
    required : Boolean( s.required ),
    required_image : requiredImage,
    relevant_tools : tools
      .filter( t => t && ( t.id || t.tool_id ) )
      .map( t => ( {
        tool_id : t.id || t.tool_id,
        name : t.name || t.tool_name || 'Unnamed Tool'
      } ) ),
    config : {},
    originalStep : s,
    value : v
  }

  // Config building
  if ( type === 'number' ) {
    base.config = {
      default_value :
        typeof v.value === 'number' ? v.value : typeof v.default_value === 'number' ? v.default_value : undefined,
      limits : transformLimitsFromBackend( numericBounds ),
      required_image : base.required_image
    }
  } else if ( type === 'checkbox' ) {
    const defaultVal = v.value !== undefined ? Boolean( v.value ) : v.default !== undefined ? Boolean( v.default ) : false
    base.config = { default : defaultVal, required_image : base.required_image }
  } else if ( type === 'text' ) {
    const defaultVal = v.value ?? v.default_value ?? ''
    base.config = { default_value : defaultVal, required_image : base.required_image }
  } else if ( type === 'inspection' ) {
    const defaultVal = v.value !== undefined ? v.value : v.default || 'pass'
    base.config = { default : defaultVal, required_image : base.required_image }
  } else if ( type === 'attachments' ) {
    base.config = { upload_style : { list_type : 'picture-card' }, required_image : base.required_image }
  }

  // Initialize step values from existing data
  initializeStepValue( base.step_id, base.type, v )

  return base
}

// Initialize step value from existing data
const toNumberOrNull = value => {
  if ( value === null || value === undefined || value === '' ) return null
  const parsed = Number( value )
  return Number.isFinite( parsed ) ? parsed : null
}

const toBooleanOrNull = value => {
  if ( value === null || value === undefined ) return null
  if ( typeof value === 'boolean' ) return value
  if ( typeof value === 'string' ) {
    const normalized = value.trim().toLowerCase()
    if ( ['true', 'pass', 'yes', '1'].includes( normalized ) ) return true
    if ( ['false', 'fail', 'no', '0' ].includes( normalized ) ) return false
  }
  return Boolean( value )
}

const removeTimestampFromFilename = filename => {
  if ( !filename || typeof filename !== 'string' ) return filename
  // Remove timestamp suffix pattern: -20251021180840125 (dash followed by 17 digits)
  // Pattern matches: -YYYYMMDDHHMMSSMMM before the file extension
  return filename.replace( /-\d{17}(\.[^.]+)$/, '$1' )
}

const extractFilenameFromUrl = url => {
  if ( !url || typeof url !== 'string' ) return 'file'
  try {
    // Get the last part of the URL path
    const parts = url.split( '/' )
    const lastPart = parts[parts.length - 1]
    // Decode URL encoding
    let filename = decodeURIComponent( lastPart )

    // Remove timestamp suffix
    filename = removeTimestampFromFilename( filename )

    return filename
  } catch ( error ) {
    return 'file'
  }
}

const normalizeFileList = files => {
  if ( !Array.isArray( files ) ) return []

  return files
    .map( ( file, index ) => {
      if ( typeof file === 'string' ) {
        return {
          name : extractFilenameFromUrl( file ),
          url : file,
          uid : `existing-file-${index + 1}`
        }
      }

      if ( file && typeof file === 'object' ) {
        const url = file.url || file.path || file.file_url || file.download_url
        return {
          name : file.name || file.file_name || file.original_name || extractFilenameFromUrl( url ),
          url,
          uid : file.uid || file.id || `existing-file-${index + 1}`
        }
      }

      return null
    } )
    .filter( Boolean )
}

const initializeStepValue = ( stepId, type, valueData = {} ) => {
  if ( !stepId ) return

  // Skip initialization if this step has already been initialized
  if ( stepInitialized[stepId] ) {
    // Update images array reference to keep it in sync
    if ( stepImages[stepId] && stepImages[stepId].length > 0 ) {
      const urls = stepImages[stepId].map( file => file.url ).filter( Boolean )
      if ( !stepValues[stepId] ) {
        stepValues[stepId] = {}
      }
      stepValues[stepId].images = urls
    }
    return
  }

  const imageList = normalizeFileList( valueData.image )
  const fileList = normalizeFileList( valueData.file )

  // Initialize images/files from backend data
  stepImages[stepId] = imageList
  stepFiles[stepId] = fileList

  if ( !stepValues[stepId] ) {
    stepValues[stepId] = {}
  }

  // Initialize step values
  if ( type === 'number' ) {
    const numericValue = valueData.value !== undefined ? valueData.value : valueData.default_value
    stepValues[stepId].value = toNumberOrNull( numericValue )
  } else if ( type === 'checkbox' ) {
    const checkboxValue = valueData.value !== undefined ? valueData.value : valueData.default
    const normalized = toBooleanOrNull( checkboxValue )
    stepValues[stepId].value = normalized === null ? false : normalized
  } else if ( type === 'inspection' ) {
    const inspectionValue = valueData.value !== undefined ? valueData.value : valueData.default
    stepValues[stepId].value = toBooleanOrNull( inspectionValue )
    // Initialize remarks for inspection steps
    if ( valueData.remarks ) {
      stepValues[stepId].remarks = valueData.remarks
    }
  } else if ( type === 'text' ) {
    const textValue = valueData.value !== undefined ? valueData.value : valueData.default_value
    stepValues[stepId].value = textValue ?? ''
  } else if ( type === 'attachments' ) {
    stepValues[stepId].value = fileList.map( file => file.url ).filter( Boolean )
  } else {
    stepValues[stepId].value = valueData.value ?? null
  }

  // Update images array reference if images exist
  if ( imageList.length > 0 ) {
    const urls = imageList.map( file => file.url ).filter( Boolean )
    stepValues[stepId].images = urls
  }

  // Mark this step as initialized
  stepInitialized[stepId] = true
}

const executionSteps = computed( () => {
  return sourceSteps.value.map( ( s, idx ) => {
    const hasBackendFormat = s && s.value && s.value.type

    if ( hasBackendFormat ) {
      return processTemplateStep( s, idx )
    } else {
      return processStandaloneStep( s, idx )
    }
  } )
} )

const filteredExecutionSteps = computed( () => {
  if ( !stepSearchQuery.value ) {
    return executionSteps.value
  }
  const query = stepSearchQuery.value.toLowerCase()
  return executionSteps.value.filter( step => step.label.toLowerCase().includes( query ) )
} )

// Step component helpers
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

// Tools visibility
const toggleStepTools = stepId => {
  if ( !stepId ) return
  stepToolsVisible[stepId] = !stepToolsVisible[stepId]
}

const getStepToolsVisible = stepId => {
  if ( !stepId ) return false
  return Boolean( stepToolsVisible[stepId] )
}

const getStepModelValue = stepId => {
  const record = stepValues[stepId]
  if ( record && 'value' in record ) {
    return record.value
  }
  return null
}

const getStepComponentProps = step => {
  if ( !step ) return {}
  if ( step.type === 'text' ) {
    return {
      executionMode : true
    }
  }
  return {}
}

const findExecutionStep = stepId => executionSteps.value.find( step => step.step_id === stepId )

// Handle step value changes
const handleStepValueChange = ( stepId, value ) => {
  if ( !stepId ) return

  if ( !stepValues[stepId] ) {
    stepValues[stepId] = {}
  }

  // Handle inspection step value (which is an object with value and remarks)
  if ( value && typeof value === 'object' && 'value' in value && 'remarks' in value ) {
    stepValues[stepId].value = value.value
    stepValues[stepId].remarks = value.remarks
  } else {
    stepValues[stepId].value = value
  }

  // Emit updated values to parent
  emitValuesUpdate()
}

const getStepImages = stepId => stepImages[stepId] || []
const getStepFiles = stepId => stepFiles[stepId] || []

const ensureStepImageBucket = stepId => {
  if ( !stepImages[stepId] ) {
    stepImages[stepId] = []
  }
}

const ensureStepFileBucket = stepId => {
  if ( !stepFiles[stepId] ) {
    stepFiles[stepId] = []
  }
}

const uploadFileToMinio = async file => {
  const response = await uploadToMinio( file )

  // Handle response structure: { status, message, data: "url" }
  if ( response?.data && typeof response.data === 'string' ) {
    return response.data
  }

  // Fallback to nested data structure
  const uploaded = response?.data || response
  if ( uploaded?.url ) {
    return uploaded.url
  }
  if ( Array.isArray( uploaded?.uploadedFiles ) && uploaded.uploadedFiles.length ) {
    return uploaded.uploadedFiles[0]?.url
  }
  if ( uploaded?.fileUrl ) {
    return uploaded.fileUrl
  }

  throw new Error( 'Upload response missing URL' )
}

const isAttachmentStep = step => step?.type === 'attachments' || step?.value?.type === 'file'

const handleImageSelected = async( stepId, uploadFile ) => {
  if ( !uploadFile?.raw ) return
  if ( !uploadFile.raw.type.startsWith( 'image/' ) ) {
    ElMessage.error( 'Only image files are allowed.' )
    return
  }

  const uid = uploadFile.uid || `img-${Date.now()}`
  const stepMeta = findExecutionStep( stepId )

  try {
    imageUploadLoading[stepId] = true
    const url = await uploadFileToMinio( uploadFile.raw )
    ensureStepImageBucket( stepId )
    const entry = {
      uid,
      name : uploadFile.name,
      url,
      status : 'success'
    }
    stepImages[stepId].push( entry )

    if ( !stepValues[stepId] ) {
      stepValues[stepId] = {}
    }
    const imageUrls = stepImages[stepId].map( img => img.url ).filter( Boolean )
    stepValues[stepId].images = imageUrls
    if ( isAttachmentStep( stepMeta ) ) {
      stepValues[stepId].value = imageUrls
    }

    emitValuesUpdate()
    ElMessage.success( 'Image uploaded successfully' )
  } catch ( error ) {
    console.error( 'Image upload failed:', error )
    ElMessage.error( error?.message || 'Image upload failed' )
  } finally {
    imageUploadLoading[stepId] = false
  }
}

const handleImageRemove = ( stepId, file ) => {
  if ( !stepImages[stepId] ) return

  const stepMeta = findExecutionStep( stepId )

  stepImages[stepId] = stepImages[stepId].filter( img => img.uid !== file.uid )

  if ( stepValues[stepId] ) {
    const imageUrls = stepImages[stepId].map( img => img.url ).filter( Boolean )
    stepValues[stepId].images = imageUrls
    if ( isAttachmentStep( stepMeta ) ) {
      stepValues[stepId].value = imageUrls
    }
  }

  emitValuesUpdate()
}

const handleAttachmentSelected = async( stepId, uploadFile ) => {
  if ( !uploadFile?.raw ) return

  const uid = uploadFile.uid || `file-${Date.now()}`

  try {
    fileUploadLoading[stepId] = true
    const url = await uploadFileToMinio( uploadFile.raw )
    ensureStepFileBucket( stepId )

    // Extract clean filename from URL (backend returns URL with timestamp)
    const cleanName = extractFilenameFromUrl( url )

    const entry = {
      uid,
      name : cleanName,
      url,
      status : 'success'
    }
    stepFiles[stepId].push( entry )

    if ( !stepValues[stepId] ) {
      stepValues[stepId] = {}
    }
    const fileUrls = stepFiles[stepId].map( fileEntry => fileEntry.url ).filter( Boolean )
    stepValues[stepId].value = fileUrls

    emitValuesUpdate()
    ElMessage.success( 'File uploaded successfully' )
  } catch ( error ) {
    console.error( 'File upload failed:', error )
    ElMessage.error( error?.message || 'File upload failed' )
  } finally {
    fileUploadLoading[stepId] = false
  }
}

const handleAttachmentRemove = ( stepId, file ) => {
  if ( !stepFiles[stepId] ) return
  stepFiles[stepId] = stepFiles[stepId].filter( entry => entry.uid !== file.uid )

  if ( stepValues[stepId] ) {
    const fileUrls = stepFiles[stepId].map( entry => entry.url ).filter( Boolean )
    stepValues[stepId].value = fileUrls
  }

  emitValuesUpdate()
}

const handleFilePreview = file => {
  console.log( 'Preview file:', file )
  if ( file && file.url ) {
    window.open( file.url, '_blank' )
  } else if ( file && file.response?.url ) {
    window.open( file.response.url, '_blank' )
  } else {
    console.warn( 'File preview failed - no URL found:', file )
  }
}

const hasRequiredImages = step => {
  if ( step.required_image || step.value?.require_image ) {
    return Array.isArray( stepImages[step.step_id] ) && stepImages[step.step_id].length > 0
  }
  return true
}

const isStepValueProvided = step => {
  const stepId = step.step_id
  const value = stepValues[stepId]?.value

  if ( step.type === 'text' ) {
    return typeof value === 'string' && value.trim() !== ''
  }

  if ( step.type === 'number' || step.type === 'numeric' ) {
    return value !== null && value !== undefined && value !== ''
  }

  if ( step.type === 'inspection' ) {
    return value === true || value === false
  }

  if ( step.type === 'checkbox' ) {
    return value === true || value === false
  }

  if ( isAttachmentStep( step ) ) {
    return Array.isArray( stepFiles[stepId] ) && stepFiles[stepId].length > 0
  }

  if ( step.required ) {
    return value !== null && value !== undefined && value !== ''
  }

  return true
}

const isStepCompleted = step => {
  return isStepValueProvided( step ) && hasRequiredImages( step )
}

const getMissingRequiredSteps = () => {
  const missing = []
  executionSteps.value.forEach( step => {
    // Only check if the step is explicitly marked as required
    if ( step.required && !isStepValueProvided( step ) ) {
      missing.push( step.label || step.name || `Step ${step.order}` )
      return
    }
    // Check for required images regardless of step.required flag
    if ( !hasRequiredImages( step ) ) {
      missing.push( ( step.label || step.name || `Step ${step.order}` ) + ' (image required)' )
    }
  } )
  return missing
}

const validateRequiredSteps = () => getMissingRequiredSteps()

const handleStepSearch = () => {
  // filteredExecutionSteps is reactive
}

const emitValuesUpdate = () => {
  emit( 'values-updated', {
    stepValues : { ...stepValues },
    stepImages : { ...stepImages },
    stepFiles : { ...stepFiles }
  } )
}

watch(
  executionSteps,
  () => {
    emitValuesUpdate()
  },
  { immediate : true, deep : true }
)

// Get execution payload for submission
const getExecutionPayload = () => {
  const toDeepClone = value => {
    if ( value === null || value === undefined ) return {}
    try {
      return JSON.parse( JSON.stringify( value ) )
    } catch ( error ) {
      if ( Array.isArray( value ) ) {
        return value.slice()
      }
      return { ...value }
    }
  }

  const normalizeInspectionValue = value => {
    if ( typeof value === 'boolean' ) {
      return value
    }

    if ( typeof value === 'string' ) {
      const normalized = value.trim().toLowerCase()
      if ( normalized === 'pass' ) return true
      if ( normalized === 'fail' ) return false
    }

    if ( value === null || value === undefined ) {
      return value
    }

    return Boolean( value )
  }

  const normalizeTools = originalStep => {
    const baseTools = Array.isArray( originalStep?.tools )
      ? originalStep.tools
      : Array.isArray( originalStep?.relevant_tools )
        ? originalStep.relevant_tools
        : []

    if ( !baseTools.length ) {
      return null
    }

    const normalized = baseTools
      .map( tool => {
        if ( typeof tool === 'number' ) {
          return tool
        }
        if ( typeof tool === 'string' ) {
          const parsed = Number( tool )
          return Number.isFinite( parsed ) ? parsed : tool
        }
        if ( tool && typeof tool === 'object' ) {
          const extracted = tool.tool_id || tool.id
          if ( extracted !== undefined ) {
            const parsed = typeof extracted === 'string' ? Number( extracted ) : extracted
            return Number.isFinite( parsed ) ? parsed : extracted
          }
        }
        return null
      } )
      .filter( toolId => toolId !== null && toolId !== undefined )

    return normalized.length ? normalized : null
  }

  const stepUpdateList = executionSteps.value.map( step => {
    const stepId = step.step_id
    const originalStep = step.originalStep || {}
    const originalValue = toDeepClone( originalStep.value || {} )
    const currentValueRecord = stepValues[stepId]
    const currentValue = currentValueRecord ? currentValueRecord.value : undefined
    const uploadedImages = Array.isArray( stepImages[stepId] ) ? stepImages[stepId].map( img => img?.url ).filter( Boolean ) : []
    const uploadedFiles = Array.isArray( stepFiles[stepId] ) ? stepFiles[stepId].map( file => file?.url ).filter( Boolean ) : []

    // Resolve base payload for step value using original data as foundation
    const resolvedValue = toDeepClone( originalValue )

    const ensureUploads = () => {
      if ( isAttachmentStep( step ) || resolvedValue.type === 'file' ) {
        if ( uploadedFiles.length ) {
          resolvedValue.file = uploadedFiles
        } else if ( Array.isArray( currentValue ) ) {
          resolvedValue.file = currentValue
        } else {
          resolvedValue.file = Array.isArray( originalValue.file ) ? originalValue.file : []
        }
        return
      }

      // Always use the current uploaded images array, even if empty (user removed all images)
      resolvedValue.image = uploadedImages
    }

    // When step components emit a structured object, merge it directly to preserve metadata (remarks, etc.)
    if ( currentValue && typeof currentValue === 'object' && !Array.isArray( currentValue ) ) {
      Object.assign( resolvedValue, currentValue )
      ensureUploads()
    } else {
      ensureUploads()

      const valueFromOriginal = originalValue.value
      const finalValue = currentValue !== undefined ? currentValue : valueFromOriginal

      if ( step.type === 'number' || step.type === 'numeric' ) {
        const numericValue = finalValue === '' || finalValue === null || finalValue === undefined ? null : Number( finalValue )
        resolvedValue.value = Number.isFinite( numericValue ) ? numericValue : null
        resolvedValue.numeric_limit_bounds = originalValue.numeric_limit_bounds || originalValue.numericLimitBounds || {}
      } else if ( step.type === 'checkbox' ) {
        resolvedValue.value = Boolean( finalValue )
      } else if ( step.type === 'inspection' ) {
        resolvedValue.value = finalValue
      } else if ( step.type === 'text' ) {
        resolvedValue.value = finalValue !== undefined && finalValue !== null ? finalValue : ''
      } else if ( step.type === 'attachments' || step.type === 'file' ) {
        resolvedValue.file = uploadedFiles.length
          ? uploadedFiles
          : Array.isArray( finalValue )
            ? finalValue
            : Array.isArray( originalValue.file )
              ? originalValue.file
              : []
      } else {
        resolvedValue.value = finalValue
      }
    }

    if ( resolvedValue.require_image === undefined ) {
      resolvedValue.require_image = Boolean( step.required_image || originalValue.require_image )
    }

    if ( step.type === 'inspection' || resolvedValue.type === 'inspection' ) {
      resolvedValue.value = normalizeInspectionValue( resolvedValue.value )
      // Include remarks for inspection steps
      if ( currentValueRecord && currentValueRecord.remarks ) {
        resolvedValue.remarks = currentValueRecord.remarks
      }
    }

    const stepPayload = toDeepClone( originalStep )
    stepPayload.value = resolvedValue

    const normalizedTools = normalizeTools( stepPayload )
    if ( normalizedTools !== null ) {
      stepPayload.tools = normalizedTools
    } else if ( 'tools' in stepPayload ) {
      stepPayload.tools = []
    }
    if ( 'relevant_tools' in stepPayload ) {
      delete stepPayload.relevant_tools
    }

    return stepPayload
  } )

  return stepUpdateList
}

// Expose methods to parent
defineExpose( {
  getExecutionPayload,
  stepValues,
  stepImages,
  stepFiles,
  validateRequiredSteps
} )

const hasExternalSteps = computed( () => Array.isArray( props.steps ) && props.steps.length > 0 )

const resetStepToolsVisibility = () => {
  Object.keys( stepToolsVisible ).forEach( key => {
    delete stepToolsVisible[key]
  } )
}

const resetStepInitialization = () => {
  Object.keys( stepInitialized ).forEach( key => {
    delete stepInitialized[key]
  } )
}

// Load template data
const fetchTemplate = async() => {
  if ( !props.templateId || hasExternalSteps.value ) return

  resetStepToolsVisibility()
  resetStepInitialization()

  loading.value = true
  error.value = false
  try {
    const loadedTemplate = await loadTemplate( props.templateId )
    template.value = loadedTemplate
  } catch ( err ) {
    console.error( 'Failed to load template for execution:', err )
    error.value = true
    ElMessage.error( 'Failed to load task steps' )
  } finally {
    loading.value = false
  }
}

const refreshExecutionSource = () => {
  resetStepToolsVisibility()
  resetStepInitialization()

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
    refreshExecutionSource()
  },
  { deep : true, immediate : true }
)
</script>

<style scoped>
.steps-execution-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: hidden;
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
  flex-shrink: 0;
  width: 98.5%;
  height: 6%;
}

.procedure-execution {
  flex: 1;
  min-height: 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 92%;
}

.execution-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  min-height: 0;
}

.section-content {
  padding: 8px 0;
}

.execution-step {
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.execution-step:last-child {
  margin-bottom: 0;
}

.execution-step.step-completed {
  opacity: 0.9;
}

.step-config-execution {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.execution-step.step-completed .step-config-execution:hover {
  //border-color: var(--el-color-primary, #409eff);
  //background: rgba(64, 158, 255, 0.08);
}

.image-upload-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e4e7ed;
}

.file-upload-section {
  margin-top: 12px;
}

.upload-header {
  margin-bottom: 8px;
}

.upload-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.required-asterisk {
  color: #f56c6c;
  margin-right: 4px;
  font-weight: 600;
  font-size: 16px;
}

.tools-section {
  margin-top: 8px;
}

.tools-section.has-divider {
  padding-top: 8px;
  border-top: 1px dashed #e4e7ed;
}

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
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #f8f9fb;
  border-radius: 4px;
  font-size: 12px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-item .el-icon {
  color: #409eff;
  font-size: 14px;
  margin-right: 0;
  flex-shrink: 0;
}

.tool-name {
  color: #303133;
  font-weight: 500;
  font-size: 13px;
  flex-shrink: 0;
}

.tool-code {
  color: #606266;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}

.tool-description {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  padding-left: 22px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-steps {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Consistent scroll bar styling */
.execution-main::-webkit-scrollbar {
  width: 6px;
}

.execution-main::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.execution-main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.execution-main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

:deep(.el-icon) {
  margin-right: 5px;
}

/* Ensure all text content wraps properly */
:deep(.upload-label),
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
.execution-step,
.step-config-execution,
.image-upload-section,
.desktop-tools-list {
  max-width: 100%;
  overflow: hidden;
}
</style>

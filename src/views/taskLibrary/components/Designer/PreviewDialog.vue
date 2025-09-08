<template>
  <el-dialog
    top="5vh"
    :model-value="visible"
    :title="dialogConfig.title"
    :width="dialogConfig.width"
    :fullscreen="dialogConfig.fullscreen"
    :close-on-click-modal="dialogConfig.closeOnClickModal"
    :append-to-body="dialogConfig.appendToBody"
    :custom-class="dialogConfig.customClass"
    @update:model-value="handleClose"
    @open="handleOpen"
    @close="handleClose"
    class="preview-dialog"
  >
    <!-- Dialog Header Content -->
    <div class="preview-content">
      <!-- Toolbar Section -->
      <div class="preview-toolbar" v-if="showToolbar">
        <div class="toolbar-left">
          <!-- Reset button moved to main designer header -->
        </div>

        <div class="toolbar-right">
          <div v-if="toolbarConfig.showViewportSwitcher" class="viewport-switcher">
            <el-button-group>
              <el-button
                :type="currentViewport === 'desktop' ? 'primary' : ''"
                size="default"
                @click="setViewport('desktop')"
              >
                <el-icon style="margin-right: 5px">
                  <Monitor />
                </el-icon>
                Desktop
              </el-button>
              <el-button
                :type="currentViewport === 'mobile' ? 'primary' : ''"
                size="default"
                @click="setViewport('mobile')"
              >
                <el-icon style="margin-right: 5px">
                  <Iphone />
                </el-icon>
                Mobile
              </el-button>
            </el-button-group>
          </div>

          <el-switch
            v-model="isInteractive"
            size="default"
            active-text="Interactive"
            inactive-text="Static"
            class="interaction-toggle"
          />
        </div>
      </div>

      <!-- Main Content Area -->
      <div
        class="preview-main"
        :class="[
          `viewport-${currentViewport}`,
          `density-${layoutConfig.density}`,
          { 'interactive-mode': isInteractive },
        ]"
      >
        <!-- Steps (simplified to show only step-config-preview) -->
        <div class="preview-section">
          <div class="section-content">
            <div v-for="(step, index) in templateForm.steps" :key="step.step_id || index" class="preview-step-simple">
              <!-- Step Config Preview with numbered title -->
              <div class="step-config-preview">
                <component
                  :is="getStepComponent(step.type)"
                  :step="getStepWithNumber(step, index)"
                  :preview-mode="true"
                  :interactive="isInteractive"
                />

                <!-- Preview Bottom Section (only show if required image is checked) -->
                <div v-if="step.required_image" class="preview-bottom-section">
                  <div v-if="isMobileView" class="mobile-upload-section">
                    <div class="upload-preview">
                      <el-upload
                        class="upload-demo"
                        drag
                        :disabled="!isInteractive"
                        :show-file-list="false"
                        :list-type="step.config?.upload_style?.list_type || 'picture-card'"
                      >
                        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                        <div class="el-upload__text">Add images or files</div>
                      </el-upload>
                    </div>
                  </div>
                  <div v-else class="desktop-upload-button">
                    <el-button type="info" size="small" :disabled="!isInteractive">
                      <span class="required-asterisk">*</span>
                      <el-icon><Upload /></el-icon>
                      Upload Image
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!templateForm.steps || templateForm.steps.length === 0" class="empty-preview">
          <el-empty description="No steps to preview" :image-size="80" />
        </div>
      </div>
    </div>

    <!-- Dialog Footer -->
    <template #footer>
      <div class="preview-footer">
        <el-button v-if="footerConfig.showPrint" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          Print
        </el-button>
        <el-button v-if="footerConfig.showClose" @click="handleClose"> Close </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted, onUnmounted } from 'vue'
import { Monitor, Iphone, Printer, UploadFilled, Upload } from '@element-plus/icons-vue'

// Import step preview components (reused from BaseStepCard)
import InspectionStepPreview from './StepCards/InspectionStepPreview.vue'
import CheckboxStepPreview from './StepCards/CheckboxStepPreview.vue'
import NumberStepPreview from './StepCards/NumberStepPreview.vue'
import TextStepPreview from './StepCards/TextStepPreview.vue'
import AttachmentStepPreview from './StepCards/AttachmentStepPreview.vue'
import ServiceStepPreview from './StepCards/ServiceStepPreview.vue'

const props = defineProps( {
  visible : {
    type : Boolean,
    default : false
  },
  templateForm : {
    type : Object,
    required : true
  },
  dialogConfig : {
    type : Object,
    default : () => ( {
      title : 'Preview Procedure',
      width : '60%',
      fullscreen : false,
      closeOnClickModal : true,
      appendToBody : true,
      customClass : ''
    } )
  },
  headerConfig : {
    type : Object,
    default : () => ( {
      showSubtitle : true,
      showMeta : true,
      metaFields : ['category', 'estimated_minutes', 'applicable_assets']
    } )
  },
  toolbarConfig : {
    type : Object,
    default : () => ( {
      showStepNumbersToggle : true,
      showViewportSwitcher : true,
      viewportOptions : ['desktop', 'mobile'],
      interactionMode : 'static'
    } )
  },
  layoutConfig : {
    type : Object,
    default : () => ( {
      sectionCollapsible : true,
      sectionsInitiallyExpanded : true,
      showStepNumbers : true,
      requiredMark : '*',
      density : 'comfortable'
    } )
  },
  contentConfig : {
    type : Object,
    default : () => ( {
      grouping : 'by_section_field',
      sectionTitleField : 'section',
      unknownSectionTitle : 'General',
      widgets : {
        inspection : {
          options : ['pass', 'flag', 'fail'],
          buttonStyle : 'pill'
        },
        checkbox : {
          stackDirection : 'vertical'
        },
        number : {
          showUnits : true,
          showLimits : true,
          unitsField : 'uom',
          limitsField : 'limits'
        },
        text : {
          placeholderField : 'placeholder',
          rows : 3
        },
        files : {
          acceptImages : true,
          acceptDocuments : true
        }
      }
    } )
  },
  footerConfig : {
    type : Object,
    default : () => ( {
      showClose : true,
      showPrint : false
    } )
  }
} )

const emit = defineEmits( ['open', 'close', 'print'] )

// Reactive state
const currentViewport = ref( 'desktop' )
const isInteractive = ref( false )
const sectionStates = reactive( {} )
const windowWidth = ref( window.innerWidth )

// Computed properties
// Use preview's viewport switcher primarily for deciding mobile vs desktop
const isMobileView = computed( () => currentViewport.value === 'mobile' )

const showToolbar = computed( () => {
  return props.toolbarConfig.showStepNumbersToggle || props.toolbarConfig.showViewportSwitcher
} )

const renderSnapshot = computed( () => {
  if ( !props.templateForm || !props.templateForm.steps ) {
    return {
      title : '',
      subtitle : '',
      sections : []
    }
  }

  return {
    title : props.templateForm.name || 'Untitled Procedure',
    subtitle : props.templateForm.description || '',
    sections : []
  }
} )

// Watch for layout changes
watch(
  () => props.layoutConfig.sectionsInitiallyExpanded,
  expanded => {
    Object.keys( sectionStates ).forEach( sectionId => {
      sectionStates[sectionId] = expanded
    } )
  },
  { immediate : true }
)

// Methods
// eslint-disable-next-line no-unused-vars
const groupStepsIntoSections = steps => {
  if ( props.contentConfig.grouping === 'none' ) {
    return [
      {
        sectionId : 'default',
        title : props.contentConfig.unknownSectionTitle,
        expanded : props.layoutConfig.sectionsInitiallyExpanded,
        steps : steps.map( step => transformStepForPreview( step ) )
      }
    ]
  }

  const sections = {}
  const sectionField = props.contentConfig.sectionTitleField

  steps.forEach( step => {
    const sectionTitle = step[sectionField] || props.contentConfig.unknownSectionTitle
    const sectionId = sectionTitle.toLowerCase().replace( /\s+/g, '_' )

    if ( !sections[sectionId] ) {
      sections[sectionId] = {
        sectionId,
        title : sectionTitle,
        expanded : sectionStates[sectionId] ?? props.layoutConfig.sectionsInitiallyExpanded,
        steps : []
      }
    }

    sections[sectionId].steps.push( transformStepForPreview( step ) )
  } )

  return Object.values( sections ).sort( ( a, b ) => a.title.localeCompare( b.title ) )
}

const transformStepForPreview = step => {
  return {
    id : step.step_id,
    order : step.order,
    type : step.type,
    title : step.label || `${step.type} step`,
    required : step.required || false,
    ui : {
      ...step.config,
      description : step.description,
      relevant_tools : step.relevant_tools,
      relevant_resources : step.relevant_resources
    }
  }
}

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
  if ( !props.layoutConfig.showStepNumbers ) {
    return step
  }

  // Create a modified copy of the step with numbered label
  return {
    ...step,
    label : `${index + 1}. ${step.label || `${getStepTypeLabel( step.type )} step`}`
  }
}

// eslint-disable-next-line no-unused-vars
const getMetaLabel = field => {
  const labels = {
    category : 'Category',
    estimated_minutes : 'Est. Time',
    applicable_assets : 'Assets'
  }
  return labels[field] || field
}

// eslint-disable-next-line no-unused-vars
const getMetaValue = field => {
  if ( !props.templateForm ) return ''

  const value = props.templateForm[field]
  if ( field === 'estimated_minutes' ) {
    return `${value || 0} min`
  }
  if ( field === 'applicable_assets' && Array.isArray( value ) ) {
    return value.length > 0 ? `${value.length} asset(s)` : 'Any asset'
  }
  return value || ''
}

const getStepTypeLabel = type => {
  const labels = {
    inspection : 'Inspection',
    checkbox : 'Checkbox',
    number : 'Number',
    text : 'Text',
    attachments : 'Files',
    files : 'Files',
    service : 'Service'
  }
  return labels[type] || type
}

// eslint-disable-next-line no-unused-vars
const getStepTypeColor = type => {
  const colors = {
    inspection : '#67c23a',
    checkbox : '#409eff',
    number : '#e6a23c',
    text : '#909399',
    attachments : '#849aec',
    files : '#849aec',
    service : '#df869d'
  }
  return colors[type] || '#c0c4cc'
}

// eslint-disable-next-line no-unused-vars
const toggleStepNumbers = () => {
  // This would need to be handled by parent component, but for sinec I do not have much time just emit it
  emit( 'toggle-step-numbers' )
}

// eslint-disable-next-line no-unused-vars
const toggleSection = sectionId => {
  if ( props.layoutConfig.sectionCollapsible ) {
    sectionStates[sectionId] = !sectionStates[sectionId]
  }
}

const setViewport = viewport => {
  currentViewport.value = viewport
}

const handleOpen = () => {
  emit( 'open' )
}

const handleClose = () => {
  emit( 'close' )
}

const handlePrint = () => {
  emit( 'print' )
  // Could implement actual print functionality here
  window.print()
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted( () => {
  window.addEventListener( 'resize', handleResize )
} )

onUnmounted( () => {
  window.removeEventListener( 'resize', handleResize )
} )

// Initialize section states
watch(
  () => renderSnapshot.value.sections,
  sections => {
    sections.forEach( section => {
      if ( !( section.sectionId in sectionStates ) ) {
        sectionStates[section.sectionId] = section.expanded
      }
    } )
  },
  { immediate : true }
)
</script>

<style scoped>
.preview-dialog {
  --preview-primary-color: #409eff;
  --preview-secondary-color: #909399;
  --preview-success-color: #67c23a;
  --preview-warning-color: #e6a23c;
  --preview-danger-color: #f56c6c;
  --preview-border-color: #e4e7ed;
  --preview-bg-color: #fafafa;
  --preview-text-color: #303133;
  --preview-text-secondary: #606266;
  --preview-gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --preview-gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.el-dialog) {
  margin-top: 1.5vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  display: none;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__footer) {
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid #e2e8f0;
}

.preview-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 75vh;
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--preview-bg-color);
  border-bottom: 1px solid var(--preview-border-color);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.viewport-switcher .el-button {
  padding: 4px 8px;
}

.interaction-toggle {
  margin-left: 8px;
}

.preview-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  background: white;
  min-height: 400px;
}

.preview-main::-webkit-scrollbar {
  width: 8px;
}

.preview-main::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.preview-main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.preview-main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.preview-main.viewport-mobile {
  width: 430px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.preview-main.density-compact .preview-step {
  margin-bottom: 12px;
}

.preview-main.density-comfortable .preview-step {
  margin-bottom: 24px;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--preview-border-color);
}

.section-header.collapsible {
  cursor: pointer;
  user-select: none;
}

.section-header.collapsible:hover {
  background: var(--preview-bg-color);
  margin: 0 -8px 16px -8px;
  padding: 8px 8px 8px 8px;
  border-radius: 4px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--preview-text-color);
}

.collapse-icon {
  color: var(--preview-text-secondary);
  transition: transform 0.2s;
}

::v-deep(.el-checkbox__input.is-disabled+span.el-checkbox__label) {
  color: #606266;
}

.section-content {
}

.preview-step-simple {
  margin-bottom: 12px;
  padding: 0;
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

.mobile-upload-section {
  width: 100%;
}

.mobile-upload-section .upload-preview {
  width: 100%;
}

.mobile-upload-section .upload-preview :deep(.el-upload-dragger) {
  border: 2px dashed #d3d3d3 !important;
  background-color: #fafafa !important;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mobile-upload-section :deep(.el-upload.el-upload--picture-card) {
  height: 90px !important;
}

.mobile-upload-section .upload-preview :deep(.el-upload__text) {
  color: #c0c4cc !important;
}

.mobile-upload-section .upload-preview :deep(.el-icon--upload) {
  color: #c0c4cc !important;
  font-size: 40px;
  line-height: 1;
}

.mobile-upload-section .upload-demo {
  height: 100%;
}

.mobile-upload-section .upload-demo :deep(.el-upload) {
  width: 100%;
}

.el-icon.el-icon--upload {
  margin-bottom: 2px;
}

.desktop-upload-button {
  width: 100%;
  text-align: left; /* Center the button */
}

.desktop-upload-button .el-button {
  width: auto; /* Allow button to size naturally */
  min-width: 130px; /* Give it a reasonable minimum width */
  border: 1px dashed #dcdfe6;
  color: #606266;
  background: white;
}

.required-asterisk {
  color: #f56c6c;
  margin-right: 4px;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--preview-text-secondary);
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.preview-footer .el-button) {
  font-weight: 500;
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 0.2s;
}

:deep(.preview-footer .el-button:hover) {
  transform: translateY(-1px);
}

/* Simplified preview structure - no type-specific styling needed */

/* Widget styling to match step card preview */
:deep(.widget-content) {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
}

:deep(.inspection-widget),
:deep(.checkbox-widget),
:deep(.number-widget),
:deep(.text-widget),
:deep(.files-widget) {
  background: transparent;
  border: none;
  padding: 0;
}

:deep(.inspection-widget:hover),
:deep(.checkbox-widget:hover),
:deep(.number-widget:hover),
:deep(.text-widget:hover),
:deep(.files-widget:hover) {
  box-shadow: none;
}

:deep(.attachment-step-preview .upload-preview .upload-demo .el-upload--picture-card) {
  height: 100% !important;
}

:deep(.attachment-step-preview .el-upload-dragger) {
  height: 100% !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .preview-header {
    padding: 24px 20px 0 20px;
  }

  .preview-title {
    font-size: 24px;
  }

  .preview-meta {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .preview-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 16px 20px;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }

  .preview-main {
    padding: 20px;
  }

  .preview-step-simple {
    margin-bottom: 20px;
  }

  .step-config-preview {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .section-header {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .preview-step-simple {
    margin-bottom: 16px;
  }

  .step-config-preview {
    padding: 12px;
  }
}
</style>

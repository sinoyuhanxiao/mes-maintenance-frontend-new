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
          <el-button v-if="toolbarConfig.showStepNumbersToggle" type="text" size="small" @click="toggleStepNumbers">
            <el-icon><List /></el-icon>
            {{ layoutConfig.showStepNumbers ? 'Hide Numbers' : 'Show Numbers' }}
          </el-button>
        </div>

        <div class="toolbar-right">
          <div v-if="toolbarConfig.showViewportSwitcher" class="viewport-switcher">
            <el-button-group>
              <el-button
                :type="currentViewport === 'desktop' ? 'primary' : ''"
                size="small"
                @click="setViewport('desktop')"
              >
                <el-icon>
                  <Monitor />
                </el-icon>
                Desktop
              </el-button>
              <el-button
                :type="currentViewport === 'mobile' ? 'primary' : ''"
                size="small"
                @click="setViewport('mobile')"
              >
                <el-icon>
                  <Iphone />
                </el-icon>
                Mobile
              </el-button>
            </el-button-group>
          </div>

          <el-switch
            v-model="isInteractive"
            size="small"
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
        <!-- Sections -->
        <div v-for="section in renderSnapshot.sections" :key="section.sectionId" class="preview-section">
          <div
            class="section-header"
            :class="{ collapsible: layoutConfig.sectionCollapsible }"
            @click="toggleSection(section.sectionId)"
          >
            <h3 class="section-title">{{ section.title }}</h3>
            <el-icon v-if="layoutConfig.sectionCollapsible" class="collapse-icon">
              <ArrowDown v-if="section.expanded" />
              <ArrowRight v-else />
            </el-icon>
          </div>

          <div v-if="section.expanded" class="section-content">
            <div
              v-for="step in section.steps"
              :key="step.id"
              class="preview-step"
              :class="[{ 'required-step': step.required }, `step-type-${step.type}`]"
            >
              <!-- Step Header -->
              <div class="step-header">
                <div
                  class="step-number"
                  v-if="layoutConfig.showStepNumbers"
                  :style="{ backgroundColor: getStepTypeColor(step.type) }"
                >
                  {{ step.order }}
                </div>
                <div class="step-info">
                  <div class="step-type-badge" :style="{ backgroundColor: getStepTypeColor(step.type) }">
                    {{ getStepTypeLabel(step.type) }}
                  </div>
                  <div v-if="step.required" class="required-badge">Required</div>
                </div>
              </div>

              <!-- Step Content -->
              <div class="step-content">
                <!-- Step Label -->
                <div class="step-label-section">
                  <div class="step-title">{{ step.title }}</div>
                </div>

                <!-- Step Description -->
                <div v-if="step.ui.description" class="step-description-section">
                  <div class="step-description">{{ step.ui.description }}</div>
                </div>

                <!-- Step Widget -->
                <div class="step-config-preview">
                  <component
                    :is="getStepWidget(step.type)"
                    :step="step"
                    :interactive="isInteractive"
                    :config="contentConfig.widgets[step.type] || {}"
                  />
                </div>

                <!-- Step Meta -->
                <div
                  v-if="step.ui.relevant_tools?.length > 0 || step.ui.relevant_resources?.length > 0"
                  class="step-options"
                >
                  <div class="step-meta">
                    <el-button
                      v-if="step.ui.relevant_tools?.length > 0"
                      type="info"
                      size="small"
                      plain
                      class="meta-button"
                    >
                      <el-icon><Tools /></el-icon>
                      {{ step.ui.relevant_tools.length }} tool(s)
                    </el-button>
                    <el-button
                      v-if="step.ui.relevant_resources?.length > 0"
                      type="warning"
                      size="small"
                      plain
                      class="meta-button"
                    >
                      <el-icon><Folder /></el-icon>
                      {{ step.ui.relevant_resources.length }} resource(s)
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="renderSnapshot.sections.length === 0" class="empty-preview">
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
import { ref, computed, watch, reactive } from 'vue'
import { List, Monitor, Iphone, ArrowDown, ArrowRight, Printer, Tools, Folder } from '@element-plus/icons-vue'

// Import step widget components
import InspectionWidget from './PreviewWidgets/InspectionWidget.vue'
import CheckboxWidget from './PreviewWidgets/CheckboxWidget.vue'
import NumberWidget from './PreviewWidgets/NumberWidget.vue'
import TextWidget from './PreviewWidgets/TextWidget.vue'
import FilesWidget from './PreviewWidgets/FilesWidget.vue'

const props = defineProps( {
  visible : {
    type : Boolean,
    default : false
  },
  template : {
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

// Computed properties
const showToolbar = computed( () => {
  return props.toolbarConfig.showStepNumbersToggle || props.toolbarConfig.showViewportSwitcher
} )

const renderSnapshot = computed( () => {
  if ( !props.template || !props.template.steps ) {
    return {
      title : '',
      subtitle : '',
      sections : []
    }
  }

  return {
    title : props.template.name || 'Untitled Procedure',
    subtitle : props.template.description || '',
    sections : groupStepsIntoSections( props.template.steps )
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

const getStepWidget = stepType => {
  const widgets = {
    inspection : InspectionWidget,
    checkbox : CheckboxWidget,
    number : NumberWidget,
    text : TextWidget,
    files : FilesWidget,
    attachments : FilesWidget // alias
  }
  return widgets[stepType] || 'div'
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
  if ( !props.template ) return ''

  const value = props.template[field]
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
    attachments : 'Files'
  }
  return labels[type] || type
}

const getStepTypeColor = type => {
  const colors = {
    inspection : '#67c23a',
    checkbox : '#409eff',
    number : '#e6a23c',
    text : '#909399',
    attachments : '#849aec'
  }
  return colors[type] || '#c0c4cc'
}

const toggleStepNumbers = () => {
  // This would need to be handled by parent component, but for sinec I do not have much time just emit it
  emit( 'toggle-step-numbers' )
}

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
  max-width: 393px;
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

.section-content {
  padding-left: 16px;
}

.preview-step {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.preview-step:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.preview-step.required-step {
  border-left: 4px solid #f56c6c;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-type-badge {
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.required-badge {
  background: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-label-section .step-title {
  font-weight: 500;
  font-size: 16px;
  color: #303133;
}

.step-description-section .step-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.step-config-preview {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.step-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.step-meta {
  margin-right: 20px;
  display: flex;
  gap: 5px;
  align-items: center;
}

.meta-button {
  height: 24px;
  font-size: 11px;
  padding: 0 8px;
}

.meta-button .el-icon {
  margin-right: 4px;
}

/* Step type specific styling */
.step-type-inspection {
  border-left: 4px solid #67c23a;
}

.step-type-checkbox {
  border-left: 4px solid #409eff;
}

.step-type-number {
  border-left: 4px solid #e6a23c;
}

.step-type-text {
  border-left: 4px solid #909399;
}

.step-type-attachments {
  border-left: 4px solid #849aec;
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

/* Step type specific styling */
.step-number[data-type='inspection'] {
  background: linear-gradient(135deg, var(--preview-success-color) 0%, #5cb85c 100%);
}

.step-number[data-type='checkbox'] {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.step-number[data-type='number'] {
  background: linear-gradient(135deg, var(--preview-warning-color) 0%, #d97706 100%);
}

.step-number[data-type='text'] {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.step-number[data-type='attachments'] {
  background: linear-gradient(135deg, var(--preview-danger-color) 0%, #dc2626 100%);
}

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

  .preview-step {
    flex-direction: column;
    gap: 16px;
  }

  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .step-title {
    padding-left: 0;
  }

  .step-widget {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .section-header {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .preview-step {
    padding: 16px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .step-title {
    font-size: 16px;
  }
}
</style>

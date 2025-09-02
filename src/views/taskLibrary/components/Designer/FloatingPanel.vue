<template>
  <div class="floating-panel">
    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <div class="mode-selector">
            <el-button-group>
              <el-button
                :type="mode === 'add_step' ? 'primary' : ''"
                size="default"
                @click="setMode('add_step')"
                class="mode-button"
              >
                <el-icon><Plus /></el-icon>
                Add
              </el-button>
              <el-button
                :type="mode === 'reorder_steps' ? 'primary' : ''"
                size="default"
                @click="setMode('reorder_steps')"
                class="mode-button"
              >
                <el-icon><Setting /></el-icon>
                Config
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <div class="panel-content">
        <!-- Add Step Mode -->
        <div v-if="mode === 'add_step'" class="add-step-mode">
          <div class="step-types">
            <div
              v-for="stepType in stepTypes"
              :key="stepType.type"
              class="step-type-card"
              @click="handleAddStep(stepType.type)"
            >
              <div class="step-type-icon" :style="{ backgroundColor: stepType.color }">
                <el-icon>
                  <component :is="stepType.icon" />
                </el-icon>
              </div>
              <div class="step-type-info">
                <div class="step-type-name">{{ stepType.name }}</div>
                <div class="step-type-desc">{{ stepType.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reorder Steps Mode -->
        <div v-else class="reorder-steps-mode">
          <div class="reorder-header">
            <el-input v-model="searchQuery" placeholder="Search steps..." size="default" clearable class="search-input">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="steps-list-container">
            <VueDraggable
              :key="draggableKey"
              v-if="stepsForDrag.length > 0"
              v-model="stepsForDrag"
              class="steps-list"
              :component-data="{
                tag: 'div',
                type: 'transition-group',
                name: 'step-item',
              }"
              item-key="id"
              :animation="200"
              :delay="0"
              :disabled="false"
              handle=".drag-handle"
              ghost-class="step-ghost"
              chosen-class="step-chosen"
              drag-class="step-drag"
              @start="handleVueDragStart"
              @end="handleVueDragEnd"
              @change="handleVueDragChange"
            >
              <template #item="{ element: step }">
                <div
                  class="step-item"
                  :class="{
                    selected: selectedStepIds.includes(step.id),
                    [`step-type-${step.type}`]: true,
                  }"
                  @click="toggleStepSelection(step.id)"
                >
                  <div class="step-checkbox" v-if="uiHints.showCheckboxes">
                    <el-checkbox
                      :model-value="selectedStepIds.includes(step.id)"
                      @click.stop
                      @change="toggleStepSelection(step.id)"
                    />
                  </div>

                  <div class="step-number" v-if="uiHints.showStepNumbers">
                    {{ step.order }}
                  </div>

                  <div class="step-type-indicator" v-if="uiHints.showTypeIcons">
                    <el-icon :style="{ color: getStepTypeColor(step.type) }">
                      <component :is="getStepTypeIcon(step.type)" />
                    </el-icon>
                  </div>

                  <div class="step-content">
                    <div class="step-title">
                      <span v-if="step.required" class="required-asterisk">*</span>
                      {{ step.title }}
                    </div>
                  </div>

                  <div class="step-actions">
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="handleInlineRename(step.id)"
                      v-if="interactions.allowInlineRename"
                    >
                      <el-icon style="font-size: 15px"><Edit /></el-icon>
                    </el-button>
                    <div class="drag-handle" v-if="uiHints.showDragHandles">
                      <el-icon><Rank /></el-icon>
                    </div>
                  </div>
                </div>
              </template>
            </VueDraggable>

            <div v-else class="empty-steps">
              <el-empty description="No steps found" :image-size="60" />
            </div>
          </div>

          <!-- Fixed Bulk Actions Toolbar -->
          <div v-if="selectedStepIds.length > 0 && uiHints.showBulkToolbarOnSelect" class="bulk-actions-toolbar">
            <div class="bulk-actions-info">{{ selectedStepIds.length }} step(s) selected</div>
            <div class="bulk-actions-buttons">
              <el-button
                v-if="enabledBulkActions.includes('duplicate')"
                type="text"
                size="small"
                @click="handleBulkAction('duplicate')"
              >
                <el-icon><DocumentCopy /></el-icon>
                Duplicate
              </el-button>
              <el-button
                v-if="enabledBulkActions.includes('mark_required') && !allSelectedRequired"
                type="text"
                size="small"
                @click="handleBulkAction('mark_required')"
              >
                <el-icon><Star /></el-icon>
                Mark Required
              </el-button>
              <el-button
                v-if="enabledBulkActions.includes('mark_optional') && allSelectedRequired"
                type="text"
                size="small"
                @click="handleBulkAction('mark_optional')"
              >
                <el-icon><StarFilled /></el-icon>
                Mark Optional
              </el-button>
              <el-button
                v-if="enabledBulkActions.includes('delete')"
                type="text"
                size="small"
                @click="handleBulkAction('delete')"
                class="delete-button"
              >
                <el-icon><Delete /></el-icon>
                Delete
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Plus,
  Rank,
  Search,
  Edit,
  CircleCheck,
  Document,
  DataAnalysis,
  Paperclip,
  DocumentCopy,
  Star,
  StarFilled,
  Setting,
  Delete,
  Tools
} from '@element-plus/icons-vue'
import VueDraggable from 'vuedraggable'

const props = defineProps( {
  mode : {
    type : String,
    default : 'add_step',
    validator : value => ['add_step', 'reorder_steps'].includes( value )
  },
  steps : {
    type : Array,
    default : () => []
  },
  uiHints : {
    type : Object,
    default : () => ( {
      showCheckboxes : true,
      showDragHandles : true,
      showStepNumbers : true,
      showTypeIcons : true,
      showBulkToolbarOnSelect : true,
      rowDensity : 'compact'
    } )
  },
  interactions : {
    type : Object,
    default : () => ( {
      allowMultiSelect : true,
      allowGroupDrag : true,
      allowInlineRename : true,
      confirmOnDelete : true
    } )
  },
  enabledBulkActions : {
    type : Array,
    default : () => ['duplicate', 'mark_required', 'mark_optional', 'delete']
  }
} )

const emit = defineEmits( ['add-step', 'toggle-mode', 'set-mode', 'reorder-steps', 'bulk-action', 'inline-rename'] )
const searchQuery = ref( '' )
const selectedStepIds = ref( [] )

// Step types configuration
const stepTypes = [
  {
    type : 'inspection',
    name : 'Inspection',
    description : 'Pass/Fail check',
    icon : CircleCheck,
    color : '#67c23a'
  },
  {
    type : 'checkbox',
    name : 'Checkbox',
    description : 'Yes/No confirmation',
    icon : Document,
    color : '#409eff'
  },
  {
    type : 'number',
    name : 'Number',
    description : 'Numeric measurement',
    icon : DataAnalysis,
    color : '#e6a23c'
  },
  {
    type : 'text',
    name : 'Text',
    description : 'Text input/notes',
    icon : Edit,
    color : '#909399'
  },
  {
    type : 'attachments',
    name : 'Files',
    description : 'File upload',
    icon : Paperclip,
    color : '#849aec'
  },
  {
    type : 'service',
    name : 'Service',
    description : 'Replace/Repair ops',
    icon : Tools,
    color : '#df869d'
  }
]

// Computed properties
// Create a reactive copy for vuedraggable
const stepsForDrag = ref( [] )

// Computed filtered steps (read-only)
const filteredSteps = computed( () => {
  if ( !searchQuery.value ) {
    return props.steps
  }

  const query = searchQuery.value.toLowerCase()
  return props.steps.filter(
    step => step.title?.toLowerCase().includes( query ) || step.type?.toLowerCase().includes( query )
  )
} )

// Update stepsForDrag when filteredSteps changes
watch(
  filteredSteps,
  newSteps => {
    stepsForDrag.value = [...newSteps]
  },
  { immediate : true, deep : true }
)

// Also watch props.steps directly for immediate updates
watch(
  () => props.steps,
  newSteps => {},
  { immediate : true, deep : true }
)

const allSelectedRequired = computed( () => {
  if ( selectedStepIds.value.length === 0 ) return false
  const selectedSteps = props.steps.filter( step => selectedStepIds.value.includes( step.id ) )
  return selectedSteps.every( step => step.required )
} )

const draggableKey = computed( () => {
  // Create a sorted copy to ensure the key is order-independent.
  // This is for fixing the drag-and-drop issue while keeping reactivity for content changes. very nice huh
  const sortedSteps = [...stepsForDrag.value].sort( ( a, b ) => ( a.id > b.id ? 1 : -1 ) )
  const key = sortedSteps.map( s => `${s.id}-${s.title}-${s.type}` ).join( ',' )
  return key
} )

// Methods
const handleAddStep = stepType => {
  emit( 'add-step', stepType )
}

const setMode = newMode => {
  emit( 'set-mode', newMode )
}

const toggleStepSelection = stepId => {
  if ( !props.interactions.allowMultiSelect ) {
    selectedStepIds.value = selectedStepIds.value.includes( stepId ) ? [] : [stepId]
    return
  }

  const index = selectedStepIds.value.indexOf( stepId )
  if ( index > -1 ) {
    selectedStepIds.value.splice( index, 1 )
  } else {
    selectedStepIds.value.push( stepId )
  }
}

// VueDraggable event handlers for FloatingPanel
const handleVueDragStart = evt => {}

const handleVueDragEnd = evt => {
  // Emit reorder event with the new structure
  if ( evt.oldIndex !== evt.newIndex ) {
    const stepId = stepsForDrag.value[evt.newIndex].id
    emit( 'reorder-steps', {
      stepId,
      sourceIndex : evt.oldIndex,
      targetIndex : evt.newIndex
    } )
  }
}

const handleVueDragChange = evt => {}

const handleBulkAction = action => {
  if ( selectedStepIds.value.length === 0 ) return

  emit( 'bulk-action', {
    action,
    stepIds : [...selectedStepIds.value]
  } )

  // Clear selection after action
  selectedStepIds.value = []
}

const handleInlineRename = stepId => {
  emit( 'inline-rename', stepId )
}

const getStepTypeColor = type => {
  const stepType = stepTypes.find( st => st.type === type )
  return stepType?.color || '#c0c4cc'
}

const getStepTypeIcon = type => {
  const stepType = stepTypes.find( st => st.type === type )
  return stepType?.icon || Document
}

// Watch for mode changes to clear state
watch(
  () => props.mode,
  () => {
    selectedStepIds.value = []
    searchQuery.value = ''
  }
)
</script>

<style scoped>
.floating-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.el-card__header {
  :deep(&) {
    padding: 12px !important;
  }
}

.panel-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.panel-card .el-card__body) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.panel-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mode-selector {
  width: 100%;
}

.mode-selector .el-button-group {
  width: 100%;
  display: flex;
}

.mode-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  padding: 8px 12px;
}

.mode-button .el-icon {
  font-size: 14px;
}

.panel-content {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Add Step Mode Styles */
.add-step-mode {
  padding: 16px;
}

.step-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-type-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.step-type-card:hover {
  background: white;
  border-color: rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.step-type-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.step-type-info {
  flex: 1;
  min-width: 0;
}

.step-type-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  font-size: 14px;
}

.step-type-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

/* Reorder Steps Mode Styles */
.reorder-steps-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.reorder-header {
  padding: 16px 16px 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
}

.steps-list-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  height: 100%;
}

.steps-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 16px;
  min-height: 0;
  max-height: 100%;
}

/* Force scrollbar to appear when needed */
.steps-list::-webkit-scrollbar {
  width: 6px;
}

.steps-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.steps-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.steps-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  background: white;
}

.step-item:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.step-item.selected {
  background: #e6f7ff;
  border-color: #91d5ff;
}

/* VueDraggable styles for FloatingPanel */
.step-ghost {
  opacity: 0.5;
}

.step-chosen {
  border-color: var(--step-type-color, var(--el-color-primary));
}

.step-drag {
  opacity: 0.8;
}

/* Step item transition animations */
.step-item-move,
.step-item-enter-active,
.step-item-leave-active {
  transition: all 0.25s ease;
}

.step-item-enter-from,
.step-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.step-item-leave-active {
  position: absolute;
  width: 100%;
}

.step-checkbox {
  flex-shrink: 0;
}

.step-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--step-type-color);
  background-color: white;
  border: 1px solid var(--step-type-color);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-type-indicator {
  flex-shrink: 0;
  font-size: 14px;
  margin-top: 4px;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.required-asterisk {
  color: #f56c6c;
  font-weight: 600;
  font-size: 20px;
  flex-shrink: 0;
}

.step-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.drag-handle {
  cursor: grab;
  color: #a0a3aa;
  padding: 2px;
  font-size: 14px;
}

.drag-handle:hover {
  color: var(--step-type-color, var(--el-color-primary));
}

.drag-handle:active {
  cursor: grabbing;
  color: var(--step-type-color, var(--el-color-primary));
}

.empty-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  min-height: 200px;
}

.bulk-actions-toolbar {
  padding: 12px 16px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.bulk-actions-info {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
  text-align: center;
}

.bulk-actions-buttons {
  display: flex;
  flex-direction: row;
  gap: 6px;
  flex-wrap: wrap;
}

.bulk-actions-buttons .el-button {
  flex: 1;
  min-width: 0;
  justify-content: center;
  padding: 8px 6px;
  height: auto;
  font-size: 13px;
  text-align: center;
}

.bulk-actions-buttons .el-button .el-icon {
  margin-right: 3px;
  margin-bottom: 1px;
  font-size: 12px;
}

.delete-button {
  color: #f56c6c !important;
}

.delete-button:hover {
  color: #f78989 !important;
  background-color: #fef0f0 !important;
}

/* Compact row density */
.step-item.compact {
  padding: 6px;
}

.step-item.compact .step-title {
  font-size: 12px;
}

.step-item.compact .step-meta {
  font-size: 10px;
}

/* Responsive design */
@media (max-width: 1200px) {
  .floating-panel {
    position: relative;
    top: 0;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .step-item {
    padding: 6px;
  }

  .step-title {
    font-size: 12px;
  }

  .bulk-actions-toolbar {
    padding: 8px 12px;
  }

  .bulk-actions-buttons {
    gap: 4px;
  }

  .bulk-actions-buttons .el-button {
    font-size: 10px;
    padding: 6px 4px;
  }

  .bulk-actions-buttons .el-button .el-icon {
    margin-right: 3px;
    margin-bottom: 1px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .bulk-actions-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .bulk-actions-buttons .el-button {
    width: 100%;
    justify-content: flex-start;
    padding: 6px 8px;
    text-align: left;
  }

  .bulk-actions-buttons .el-button .el-icon {
    margin-right: 3px;
    margin-bottom: 1px;
  }
}

/* Step type specific styling for color variables */
.step-type-inspection {
  --step-type-color: #67c23a;
  --step-type-color-rgb: 103, 194, 58;
}

.step-type-checkbox {
  --step-type-color: #409eff;
  --step-type-color-rgb: 64, 158, 255;
}

.step-type-number {
  --step-type-color: #e6a23c;
  --step-type-color-rgb: 230, 162, 60;
}

.step-type-text {
  --step-type-color: #909399;
  --step-type-color-rgb: 144, 147, 153;
}

.step-type-attachments {
  --step-type-color: #849aec;
  --step-type-color-rgb: 172, 136, 252;
}

.step-type-service {
  --step-type-color: #df869d;
  --step-type-color-rgb: 223, 134, 157;
}

/* Global icon spacing for all Task Library buttons */
:deep(.el-button .el-icon) {
  margin-right: 3px !important;
  margin-bottom: 1px !important;
}
</style>

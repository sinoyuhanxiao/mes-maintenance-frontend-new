<template>
  <div class="template-designer-view" :style="{ height: containerHeight }">
    <!-- Designer Header -->
    <div class="designer-header">
      <div class="header-left">
        <el-button v-if="!settingsStore.tagsView" type="text" @click="handleBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="header-title">
          <div class="title-with-help">
            <h1>{{ isStandaloneTask ? 'Edit Standalone Task' : isEditing ? 'Edit Task' : 'Create New Task' }}</h1>
            <el-tooltip content="Show guided tour" placement="bottom" effect="dark">
              <el-button type="text" size="default" @click="startTour" class="help-button" :icon="QuestionFilled" />
            </el-tooltip>
          </div>
          <el-tag v-if="isEditing && currentTemplate?.reference_id" type="info" class="template-id-header">
            #{{ currentTemplate.reference_id }}
          </el-tag>
          <div v-if="currentTemplate" class="template-status">
            <span v-if="hasUnsavedChanges" class="unsaved-indicator">
              <el-icon><Warning /></el-icon>
              Unsaved changes
            </span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="handleReset" plain style="font-weight: 500">
          <el-icon><RefreshLeft /></el-icon>
          Reset
        </el-button>
        <el-button type="primary" @click="handlePreview" plain style="font-weight: 500">
          <el-icon><View /></el-icon>
          Preview
        </el-button>
        <el-tooltip
          :content="!isFormValid ? 'Please fix validation issues' : ''"
          :disabled="isFormValid"
          placement="bottom"
          effect="dark"
        >
          <el-button
            type="primary"
            size="default"
            @click="handleSave"
            :loading="saving"
            :disabled="!isFormValid"
            :class="{ 'shake-on-hover': !isFormValid }"
            style="font-weight: 550"
          >
            <el-icon><Check /></el-icon>
            {{ isStandaloneTask ? 'Update Task' : isEditing ? 'Save Changes' : 'Save Task' }}
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Designer Content -->
    <div class="designer-content">
      <!-- Left Panel - Template Metadata -->
      <div class="left-panel">
        <div v-if="isDataLoading" class="panel-loading">
          <el-skeleton animated>
            <template #template>
              <el-card class="metadata-card">
                <template #header>
                  <el-skeleton-item variant="text" style="width: 40%" />
                </template>
                <div style="padding: 14px">
                  <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px" />
                  <el-skeleton-item variant="rect" style="height: 32px; margin-bottom: 18px" />
                  <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px" />
                  <el-skeleton-item variant="rect" style="height: 80px; margin-bottom: 18px" />
                  <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px" />
                  <el-skeleton-item variant="rect" style="height: 32px; margin-bottom: 18px" />
                  <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 8px" />
                  <el-skeleton-item variant="rect" style="height: 32px; margin-bottom: 18px" />
                  <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 8px" />
                  <el-skeleton-item variant="rect" style="height: 32px" />
                </div>
              </el-card>
            </template>
          </el-skeleton>
        </div>

        <el-card v-else class="metadata-card">
          <template #header>
            <span class="card-title">Task Information</span>
          </template>

          <el-form
            ref="metadataFormRef"
            :model="templateForm"
            :rules="metadataRules"
            label-position="top"
            class="metadata-form"
          >
            <el-form-item label="Task Name" prop="name" required>
              <el-input v-model="templateForm.name" placeholder="Enter task name" @input="markAsChanged" />
            </el-form-item>

            <el-form-item label="Description" prop="description">
              <el-input
                v-model="templateForm.description"
                type="textarea"
                :rows="4"
                placeholder="Describe what this task is for"
                @input="markAsChanged"
              />
            </el-form-item>

            <el-form-item label="Category" prop="category" required>
              <el-select
                v-model="templateForm.category"
                placeholder="Select category"
                style="width: 100%"
                @change="markAsChanged"
              >
                <el-option
                  v-for="category in availableCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Estimated Time (minutes)" prop="estimated_minutes" required>
              <el-input-number
                v-model="templateForm.estimated_minutes"
                :min="1"
                :max="480"
                style="width: 100%"
                @change="markAsChanged"
              />
            </el-form-item>

            <el-form-item label="Applicable Assets" prop="applicable_assets">
              <el-tree-select
                v-model="templateForm.applicable_assets"
                placeholder="Select applicable assets"
                :data="equipmentTreeData"
                filterable
                check-strictly
                node-key="value"
                :props="{ children: 'children', label: 'label' }"
                :multiple="false"
                style="width: 100%"
                @change="markAsChanged"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Template Validation & Usage Tips -->
        <el-card v-if="validationErrors.length > 0 || templateForm.steps.length > 0" class="validation-card">
          <template #header>
            <div class="card-header-with-toggle">
              <span class="card-title">
                {{ showComponentTips ? 'Component Usage Tips' : 'Validation Issues' }}
              </span>
              <el-tooltip
                :content="showComponentTips ? 'Switch to Validation Issues' : 'Switch to Component Usage Tips'"
                placement="top"
              >
                <el-button
                  type="text"
                  size="small"
                  @click="showComponentTips = !showComponentTips"
                  class="toggle-button"
                >
                  <el-icon><Switch /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>

          <!-- Validation Issues View -->
          <div v-if="!showComponentTips">
            <ul v-if="validationErrors.length > 0" class="validation-list">
              <li v-for="error in validationErrors" :key="error" class="validation-error">
                {{ error }}
              </li>
            </ul>
            <div v-else class="no-issues">
              <el-icon class="success-icon"><CircleCheck /></el-icon>
              <span>No validation issues found</span>
            </div>
          </div>

          <!-- Component Usage Tips View -->
          <div v-else>
            <div v-if="focusedStepType" class="tips-list">
              <div class="tip-item" :style="{ borderLeftColor: stepTypeColors[focusedStepType] }">
                <div class="tip-type" :style="{ color: stepTypeColors[focusedStepType] }">
                  {{ focusedStepType.charAt(0).toUpperCase() + focusedStepType.slice(1) }} Step:
                </div>
                <div class="tip-description">{{ componentUsageTips[focusedStepType] }}</div>
              </div>
            </div>
            <div v-else class="no-tips">
              <span>Select a step to see its usage tip</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Center Panel - Steps Designer -->
      <div class="center-panel">
        <div class="steps-header">
          <div class="steps-title">
            <h3>Procedure Designer</h3>
            <span v-if="!isDataLoading" class="steps-count">{{ templateForm.steps.length }} steps</span>
            <el-skeleton v-else style="width: 60px; height: 18px" animated />
          </div>
          <div class="steps-actions">
            <el-tooltip content="Clear all steps" placement="top">
              <el-button
                type="text"
                size="small"
                @click="handleResetSteps"
                :disabled="templateForm.steps.length === 0 || isDataLoading"
                class="reset-steps-btn"
              >
                <el-icon style="font-size: 18px"><RefreshLeft /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <div v-if="isDataLoading" class="center-panel-loading">
          <el-skeleton animated>
            <template #template>
              <div style="padding: 16px">
                <div v-for="i in 3" :key="i" style="margin-bottom: 16px">
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      padding: 16px;
                      border: 1px solid #eee;
                      border-radius: 4px;
                      background: white;
                    "
                  >
                    <el-skeleton-item variant="circle" style="width: 24px; height: 24px; margin-right: 12px" />
                    <div style="flex: 1">
                      <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 8px" />
                      <el-skeleton-item variant="text" style="width: 40%" />
                    </div>
                    <div style="display: flex; gap: 8px">
                      <el-skeleton-item variant="button" style="width: 24px; height: 24px" />
                      <el-skeleton-item variant="button" style="width: 24px; height: 24px" />
                      <el-skeleton-item variant="button" style="width: 24px; height: 24px" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <div v-else class="steps-container" :class="{ 'no-steps': templateForm.steps.length === 0 }">
          <!-- Empty State -->
          <div v-if="templateForm.steps.length === 0" class="empty-steps">
            <div class="empty-content">
              <el-icon class="empty-icon"><DocumentAdd /></el-icon>
              <h4>No Steps Added</h4>
              <p>Add your first step to start building the procedure</p>
              <el-button type="primary" @click="handleAddStep('inspection')">
                <el-icon><Plus /></el-icon>
                Add First Step
              </el-button>
            </div>
          </div>

          <!-- Steps List -->
          <div v-else ref="stepsListRef" class="steps-list">
            <VueDraggable
              v-model="templateForm.steps"
              class="steps-container"
              :component-data="{
                tag: 'div',
                type: 'transition-group',
                name: 'step-card',
              }"
              item-key="step_id"
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
              <template #item="{ element: step, index }">
                <BaseStepCard
                  :step="step"
                  :step-index="index"
                  :is-focused="designerState.focused_step_id === step.step_id"
                  @focus="handleStepFocus"
                  @update="handleStepUpdate"
                  @delete="handleStepDelete"
                  @configure="handleStepConfigure"
                  @duplicate="handleStepDuplicate"
                />
              </template>
            </VueDraggable>
          </div>
        </div>
      </div>

      <!-- Right Panel - Floating Actions -->
      <div class="right-panel">
        <div v-if="isDataLoading" class="panel-loading">
          <el-skeleton animated>
            <template #template>
              <div style="padding: 16px; background: white; border-radius: 4px">
                <el-skeleton-item variant="text" style="width: 50%; margin-bottom: 16px" />
                <div style="display: flex; gap: 8px; margin-bottom: 16px">
                  <el-skeleton-item variant="button" style="width: 60px; height: 28px" />
                  <el-skeleton-item variant="button" style="width: 60px; height: 28px" />
                  <el-skeleton-item variant="button" style="width: 60px; height: 28px" />
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px">
                  <div
                    v-for="i in 6"
                    :key="i"
                    style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f2f5"
                  >
                    <el-skeleton-item variant="circle" style="width: 20px; height: 20px; margin-right: 12px" />
                    <el-skeleton-item variant="text" style="width: 70%" />
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <!-- Floating Panel for adding/managing steps -->
        <FloatingPanel
          v-else-if="designerState.floating_panel.visible"
          :mode="designerState.floating_panel.mode"
          :steps="stepsForPanel"
          :ui-hints="floatingPanelUiHints"
          :interactions="floatingPanelInteractions"
          :enabled-bulk-actions="enabledBulkActions"
          @add-step="handleAddStep"
          @toggle-mode="toggleFloatingPanelMode"
          @set-mode="handleSetMode"
          @reorder-steps="handleReorderSteps"
          @bulk-action="handleBulkAction"
          @inline-rename="handleInlineRename"
        />
      </div>
    </div>

    <!-- Configuration Dialogs -->
    <NumberLimitsPanel
      v-if="designerState.dialogs.number_limits.visible"
      :visible="designerState.dialogs.number_limits.visible"
      :step-id="designerState.dialogs.number_limits.for_step_id"
      :initial-data="designerState.dialogs.number_limits.form_data"
      @save="handleNumberLimitsSave"
      @close="closeNumberLimitsDialog"
    />

    <ToolPickerPanel
      v-if="designerState.dialogs.relevant_tools_picker.visible"
      :visible="designerState.dialogs.relevant_tools_picker.visible"
      :step-id="designerState.dialogs.relevant_tools_picker.for_step_id"
      :selected-tools="designerState.dialogs.relevant_tools_picker.selected_tools"
      @save="handleToolsSave"
      @close="closeToolsDialog"
    />

    <ResourceUploaderPanel
      v-if="designerState.dialogs.resource_uploader.visible"
      :visible="designerState.dialogs.resource_uploader.visible"
      :step-id="designerState.dialogs.resource_uploader.for_step_id"
      :existing-resources="designerState.dialogs.resource_uploader.form_data?.existing_resources || []"
      @save="handleResourcesSave"
      @close="closeResourcesDialog"
    />

    <!-- Preview Dialog -->
    <PreviewDialog
      :visible="showPreviewDialog"
      :template-form="templateForm"
      :dialog-config="previewDialogConfig"
      :header-config="previewHeaderConfig"
      :toolbar-config="previewToolbarConfig"
      :layout-config="previewLayoutConfig"
      :content-config="previewContentConfig"
      :footer-config="previewFooterConfig"
      @open="handlePreviewOpen"
      @close="handlePreviewClose"
      @print="handlePreviewPrint"
    />

    <!-- Change Summary Dialog -->
    <ChangeSummaryDialog
      :visible="designerState.dialogs.change_summary.visible"
      :changes="designerState.dialogs.change_summary.changes"
      :loading="designerState.dialogs.change_summary.loading"
      :current-steps="templateForm.steps"
      @confirm="handleChangeSummaryConfirm"
      @cancel="handleChangeSummaryCancel"
      @close="handleChangeSummaryCancel"
    />

    <!-- Unsaved Changes Dialog -->
    <el-dialog
      :model-value="showUnsavedDialog"
      @update:model-value="val => (showUnsavedDialog = val)"
      title="Unsaved Changes"
      width="450px"
      :before-close="handleUnsavedDialogClose"
    >
      <p>You have unsaved changes. What would you like to do?</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUnsavedDialog = false">Cancel</el-button>
          <el-button type="primary" @click="discardChanges">Continue</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Tour Component -->
    <el-tour v-model="tourOpen" type="primary" :mask="true" @finish="onTourFinish">
      <el-tour-step
        target=".designer-header"
        title="Designer Header"
        description="This is the header of the designer with all the main actions."
      />
      <el-tour-step
        target="div.designer-header > div.header-actions > button.el-button"
        title="Reset"
        description="This is where you can reset the entire task template to its original state."
      />
      <el-tour-step
        target="div.designer-header > div.header-actions > button.el-button:nth-child(2)"
        title="Preview"
        description="You can preview your task on both mobile and desktop devices."
      />
      <el-tour-step
        target="div.designer-header > div.header-actions > button.el-button:nth-child(3)"
        title="Save Task"
        description="This will save the task template you created to the system, where it can be used for work orders."
      />
      <el-tour-step
        target=".left-panel"
        title="Task Information"
        description="Edit the task name, description, and other required metadata fields here."
      />
      <el-tour-step
        target=".center-panel"
        title="Procedure Designer"
        description="This is your main design area. Add and arrange procedure steps here. Start by adding your first step to build the task workflow."
      />
      <el-tour-step
        target=".right-panel"
        title="+ Add Panel"
        description="Click any step type card here to append a new step to your procedure."
      />
      <el-tour-step
        target=".mode-selector .el-button-group button.el-button:nth-of-type(2)"
        title="Click the Config Tab"
        description="Please click the Config tab now to switch to Configuration mode."
      />
      <el-tour-step
        target="div.panel-content > div.reorder-steps-mode > div.steps-list-container"
        title="Configuration Panel"
        description="Here you can duplicate multiple steps, mark them as required/optional, delete selected steps, and drag-drop to reorder positions."
      />
    </el-tour>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated, watch, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import {
  ArrowLeft,
  Check,
  View,
  Warning,
  DocumentAdd,
  Plus,
  Switch,
  CircleCheck,
  RefreshLeft,
  QuestionFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// Native drag and drop implementation
import { useTaskLibrary } from '@/composables/designer/useTaskLibrary'
import { getTaskTemplateById } from '@/api/task-library'
import { getTaskEntryById } from '@/api/task-entry'
import { useDesignerStateCache } from '@/composables/designer/useDesignerStateCache'
import { useDesignerTour } from '@/composables/designer/useDesignerTour'
import { useAppStore, useSettingsStore, useTagsViewStore } from '@/store'
import { useWorkOrderDraftStore } from '@/store/modules/workOrderDraft'
import {
  buildDisplayTaskFromTemplate,
  buildDisplayTaskFromDesigner
} from '@/components/WorkOrder/TodoView/taskPayloadHelpers'
import { getEquipmentTree } from '@/api/equipment.js'
import { getAllCategories } from '@/api/common.js'
import VueDraggable from 'vuedraggable'
import BaseStepCard from '../components/Designer/StepCards/BaseStepCard.vue'
import FloatingPanel from '../components/Designer/FloatingPanel.vue'
import NumberLimitsPanel from '../components/Designer/ConfigPanels/NumberLimitsPanel.vue'
import ToolPickerPanel from '../components/Designer/ConfigPanels/ToolPickerPanel.vue'
import ResourceUploaderPanel from '../components/Designer/ConfigPanels/ResourceUploaderPanel.vue'
import PreviewDialog from '../components/Designer/PreviewDialog.vue'
import ChangeSummaryDialog from '../components/Designer/ChangeSummaryDialog.vue'
import { usePreviewConfigs } from '../composables/usePreviewConfigs'
import { getDefaultStepConfig, transformApiStepToDesignerStep, formatLimitsText } from '../utils/stepTransforms'

const route = useRoute()
const router = useRouter()
const workOrderDraftStore = useWorkOrderDraftStore()

const fromWorkOrder = computed( () => route.query.fromWorkOrder === 'true' )
const workOrderReturnRoute = computed( () => {
  const queryRoute = typeof route.query.returnRoute === 'string' ? route.query.returnRoute : null
  return queryRoute || workOrderDraftStore.returnRoute || '/work-order/table'
} )

const workOrderReturnPanel = computed( () => {
  const queryPanel = typeof route.query.returnPanel === 'string' ? route.query.returnPanel : null
  return queryPanel || workOrderDraftStore.returnPanel || null
} )

const workOrderReturnWorkOrderId = computed( () => {
  const queryId = typeof route.query.returnWorkOrderId === 'string' ? route.query.returnWorkOrderId : null
  if ( queryId ) return queryId
  if ( workOrderDraftStore.returnWorkOrderId != null ) {
    return String( workOrderDraftStore.returnWorkOrderId )
  }
  return null
} )

const standaloneTaskIdRef = ref( typeof route.query.taskId === 'string' ? route.query.taskId : null )

const { loadTemplates, createTemplate, updateTemplate, validateTemplate } = useTaskLibrary()

// Tour functionality
const { isOpen : tourOpen, start : startTour, onFinish : onTourFinish } = useDesignerTour()

// Create local designer state instead of using global store
const designerState = ref( {
  focused_step_id : null,
  dragging : {
    is_dragging : false,
    source_step_id : null,
    target_step_id : null
  },
  floating_panel : {
    visible : true,
    mode : 'add_step'
  },
  dialogs : {
    number_limits : {
      visible : false,
      for_step_id : null,
      loading : false,
      form_data : {}
    },
    relevant_tools_picker : {
      visible : false,
      for_step_id : null,
      selected_tools : [],
      loading : false
    },
    resource_uploader : {
      visible : false,
      for_step_id : null,
      upload_progress : 0, // hardcoded for now, rely on Yellow Kid
      uploading : false,
      form_data : {}
    },
    change_summary : {
      visible : false,
      loading : false,
      changes : {
        metadata : [],
        steps_added : [],
        steps_modified : [],
        steps_deleted : [],
        steps_reordered : []
      }
    }
  }
} )

// Local designer action functions (replacing global store methods)
const setFocusedStep = stepId => {
  designerState.value.focused_step_id = stepId
}

const toggleFloatingPanelMode = () => {
  const currentMode = designerState.value.floating_panel.mode
  designerState.value.floating_panel.mode = currentMode === 'add_step' ? 'reorder_steps' : 'add_step'
}

const setFloatingPanelMode = mode => {
  designerState.value.floating_panel.mode = mode
}

const scrollToNewStep = stepId => {
  if ( !stepsListRef.value ) {
    console.warn( 'stepsListRef not available for scrolling' )
    return
  }

  // Find the step card element by its data-step-id attribute
  // Search within the entire stepsListRef (which includes VueDraggable content)
  const stepCard = stepsListRef.value.querySelector( `[data-step-id="${stepId}"]` )
  if ( stepCard ) {
    // Scroll the step card into view with smooth behavior
    stepCard.scrollIntoView( {
      behavior : 'smooth',
      block : 'center',
      inline : 'nearest'
    } )
  } else {
    // Fallback: if element not found, try scrolling to bottom of steps list
    console.warn( `Step card with ID ${stepId} not found, scrolling to bottom` )
    stepsListRef.value.scrollTo( {
      top : stepsListRef.value.scrollHeight,
      behavior : 'smooth'
    } )
  }
}

const openNumberLimitsDialog = ( stepId, initialData = {} ) => {
  designerState.value.dialogs.number_limits = {
    visible : true,
    for_step_id : stepId,
    loading : false,
    form_data : initialData
  }
}

const closeNumberLimitsDialog = () => {
  designerState.value.dialogs.number_limits.visible = false
}

const openToolsDialog = ( stepId, selectedTools = [] ) => {
  designerState.value.dialogs.relevant_tools_picker = {
    visible : true,
    for_step_id : stepId,
    selected_tools : selectedTools,
    loading : false
  }
}

const closeToolsDialog = () => {
  designerState.value.dialogs.relevant_tools_picker.visible = false
}

const openResourcesDialog = ( stepId, formData = {} ) => {
  designerState.value.dialogs.resource_uploader = {
    visible : true,
    for_step_id : stepId,
    upload_progress : 0,
    uploading : false,
    form_data : formData
  }
}

const closeResourcesDialog = () => {
  designerState.value.dialogs.resource_uploader.visible = false
}

const openChangeSummaryDialog = changes => {
  designerState.value.dialogs.change_summary = {
    visible : true,
    loading : false,
    changes
  }
}

const closeChangeSummaryDialog = () => {
  designerState.value.dialogs.change_summary.visible = false
}

const setChangeSummaryLoading = loading => {
  designerState.value.dialogs.change_summary.loading = loading
}

const showWorkOrderSaveConfirmation = ( workOrderId, workOrderName ) => {
  const displayName = workOrderName || workOrderId || 'Work Order'

  // Create custom dialog with both options
  ElMessageBox( {
    title : 'Save Confirmation',
    message : `Do you want to save this edit locally only for Work Order ${displayName} or do you want to alter the template?`,
    showCancelButton : true,
    showConfirmButton : true,
    cancelButtonText : 'Save Locally (Work Order Only)',
    confirmButtonText : 'Alter Template',
    type : 'question',
    distinguishCancelAndClose : true,
    customClass : 'work-order-save-confirmation'
  } )
    .then( () => {
      // User chose "Alter Template"
      return performSave( { mode : 'template', fromWorkOrderContext : true } )
    } )
    .catch( async action => {
      if ( action === 'cancel' ) {
        const matchedCategory = Array.isArray( categoriesForDropdown.value )
          ? categoriesForDropdown.value.find( category => category.value === templateForm.value.category )
          : null
        const adhocTask = buildDisplayTaskFromDesigner( templateForm.value, matchedCategory )
        workOrderDraftStore.appendTask( adhocTask )
        await navigateBackToWorkOrder( 'Task added to the work order.' )
      }
    } )
}

const resetDesignerState = () => {
  designerState.value = {
    focused_step_id : null,
    dragging : {
      is_dragging : false,
      source_step_id : null,
      target_step_id : null
    },
    floating_panel : {
      visible : true,
      mode : 'add_step'
    },
    dialogs : {
      number_limits : {
        visible : false,
        for_step_id : null,
        loading : false,
        form_data : {}
      },
      relevant_tools_picker : {
        visible : false,
        for_step_id : null,
        selected_tools : [],
        loading : false
      },
      resource_uploader : {
        visible : false,
        for_step_id : null,
        upload_progress : 0,
        uploading : false,
        form_data : {}
      },
      change_summary : {
        visible : false,
        loading : false,
        changes : {
          metadata : [],
          steps_added : [],
          steps_modified : [],
          steps_deleted : [],
          steps_reordered : []
        }
      }
    }
  }
}

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const tagsViewStore = useTagsViewStore()

// State persistence for tagView tabs
const {
  saveState,
  saveStateByKey,
  restoreState,
  restoreStateByKey,
  restoreStateByTemplateId,
  hasCachedState,
  hasCachedStateByKey,
  clearState,
  clearStateByKey,
  getCacheStats
} = useDesignerStateCache()

// Snapshot of route identity for this instance (prevents cross-tab bleed)
const routeSnapshot = ref( { path : route.path, params : { ...( route.params || {} ) }} )
// Stable cache key for this instance (does not change across tab switches)
const stableCacheKey = ref( null )

// Local state
const metadataFormRef = ref( null )
const stepsListRef = ref( null )

// Helpers to use snapshot for caching operations
const snapshotRoute = () => ( { path : routeSnapshot.value.path, params : { ...( routeSnapshot.value.params || {} ) }} )
const hasCache = () => hasCachedState( snapshotRoute() )
const restoreCache = () => restoreState( snapshotRoute() )
// eslint-disable-next-line no-unused-vars
const saveCache = state => saveState( snapshotRoute(), state )
// eslint-disable-next-line no-unused-vars
const clearCache = () => clearState( snapshotRoute() )
// Track whether this keep-alive instance is currently active (visible)
const isComponentActive = ref( false )
const templateForm = ref( {
  name : '',
  description : '',
  category : '',
  estimated_minutes : 30,
  applicable_assets : null,
  steps : []
} )

// Original template for change tracking
const originalTemplate = ref( null )
// Local template instance (not shared across tabs like global currentTemplate)
const currentTemplate = ref( null )

const hasUnsavedChanges = ref( false )
const saving = ref( false )

const showUnsavedDialog = ref( false )
const pendingNavigation = ref( null )
const originalSidebarState = ref( null )
const showComponentTips = ref( false )
const equipmentTreeData = ref( [] )
const allCategories = ref( [] )
const categoriesForDropdown = ref( [] )

// Loading states
const categoriesLoading = ref( false )
const equipmentTreeLoading = ref( false )

// Dynamic height calculation state
const navbarHeight = ref( 50 )
const tagsViewHeight = ref( 34 )
const containerHeight = computed( () => {
  const totalFixedHeight = navbarHeight.value + tagsViewHeight.value
  // Fallback height
  const safeHeight = totalFixedHeight > 0 ? totalFixedHeight : 84
  return `calc(100vh - ${safeHeight}px)`
} )

// Preview dialog state
const showPreviewDialog = ref( false )

// Computed properties
const isEditing = computed( () => !!route.params.id && route.params.id !== 'standalone' )
const isStandaloneTask = computed( () => route.params.id === 'standalone' && route.query.standalone === 'true' )
const validationErrors = computed( () => validateTemplate( templateForm.value ) )

// Local detail loading to avoid mutating global store currentTemplate
const detailLoading = ref( false )
// Render readiness gate to prevent blank panels before data is ready
const renderReady = ref( false )
// Overall loading state for panels; also block render until ready
const isDataLoading = computed(
  () => detailLoading.value || categoriesLoading.value || equipmentTreeLoading.value || !renderReady.value
)

// Component usage tips
const componentUsageTips = computed( () => {
  const tips = {
    inspection :
      'Perfect for equipment condition verification with pass/fail outcomes, commonly used in safety checks and quality control procedures.',
    checkbox :
      'Ideal for simple yes/no confirmations, compliance checklists, and ensuring critical steps are acknowledged before proceeding.',
    number :
      'Essential for recording measurements, sensor readings, and quantitative data with optional unit specifications and validation limits.',
    text : 'Best for capturing detailed observations, technician notes, and contextual information that structured data cannot represent.',
    attachments :
      'Critical for visual documentation, before/after photos, and creating comprehensive maintenance records for compliance and audit trails.',
    service :
      'Designed for maintenance operations requiring specific device tag identification and service type specification, supporting Replace and Repair workflows with quantity tracking.'
  }
  return tips
} )

// Step type colors matching BaseStepCard
const stepTypeColors = computed( () => {
  const colors = {
    inspection : '#67c23a',
    checkbox : '#409eff',
    number : '#e6a23c',
    text : '#909399',
    attachments : '#849aec'
    // service: '#df869d',
  }
  return colors
} )

const focusedStepType = computed( () => {
  if ( !designerState.value.focused_step_id ) return null
  const focusedStep = templateForm.value.steps.find( step => step.step_id === designerState.value.focused_step_id )
  return focusedStep?.type || null
} )

const availableCategories = computed( () => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return categoriesForDropdown.value.sort( ( a, b ) => a.label.localeCompare( b.label ) )
} )

// Check Element Plus form validation state
const isElementFormValid = ref( true )

// Watch form fields and validate Element Plus form
const validateElementForm = async() => {
  if ( !metadataFormRef.value ) {
    // If the form isn't mounted yet, don't mark it invalid; defer validation
    return
  }

  try {
    await metadataFormRef.value.validate()
    isElementFormValid.value = true
  } catch ( error ) {
    isElementFormValid.value = false
  }
}

// Watch form changes to trigger validation
watch(
  [() => templateForm.value.name, () => templateForm.value.category, () => templateForm.value.estimated_minutes],
  () => {
    // Use nextTick to ensure form is updated before validation
    nextTick( () => {
      validateElementForm()
    } )
  },
  { immediate : false }
)

const isFormValid = computed( () => {
  // Check basic metadata fields
  const hasValidName =
    templateForm.value.name && typeof templateForm.value.name === 'string' && templateForm.value.name.trim().length > 0
  const categoryValue = templateForm.value.category
  let hasValidCategory = false

  if ( typeof categoryValue === 'number' ) {
    hasValidCategory = categoryValue > 0
  } else if ( typeof categoryValue === 'string' ) {
    hasValidCategory = categoryValue.trim().length > 0
  } else if ( categoryValue && typeof categoryValue === 'object' ) {
    const resolvedId = categoryValue.id ?? categoryValue.value ?? null
    const resolvedLabel = categoryValue.name ?? categoryValue.label ?? ''
    hasValidCategory = Boolean( ( resolvedId && resolvedId > 0 ) || ( resolvedLabel && resolvedLabel.trim().length > 0 ) )
  }
  const hasValidTime = templateForm.value.estimated_minutes > 0

  // Check comprehensive template validation (including steps validation)
  const hasNoValidationErrors = validationErrors.value.length === 0

  // Check Element Plus form validation
  const hasValidElementForm = metadataFormRef.value ? isElementFormValid.value : true

  return hasValidName && hasValidCategory && hasValidTime && hasNoValidationErrors && hasValidElementForm
} )

// Re-validate when render becomes ready (e.g., after restore)
watch(
  () => renderReady.value,
  ready => {
    if ( ready ) {
      nextTick( () => validateElementForm() )
    }
  }
)

// FloatingPanel computed properties
const stepsForPanel = computed( () => {
  const result = templateForm.value.steps.map( step => ( {
    id : step.step_id,
    order : step.order,
    type : step.type,
    title : step.label || `Untitled ${step.type} step`,
    required : step.required || false
  } ) )
  return result
} )

const floatingPanelUiHints = computed( () => ( {
  showCheckboxes : true,
  showDragHandles : true,
  showStepNumbers : true,
  showTypeIcons : true,
  showBulkToolbarOnSelect : true,
  rowDensity : 'compact'
} ) )

const floatingPanelInteractions = computed( () => ( {
  allowMultiSelect : true,
  allowGroupDrag : true,
  allowInlineRename : true,
  confirmOnDelete : true
} ) )

const enabledBulkActions = computed( () => ['duplicate', 'mark_required', 'mark_optional', 'delete'] )

// Preview dialog configuration (extracted)
const {
  previewDialogConfig,
  previewHeaderConfig,
  previewToolbarConfig,
  previewLayoutConfig,
  previewContentConfig,
  previewFooterConfig
} = usePreviewConfigs()

// Form validation rules
const metadataRules = {
  name : [
    { required : true, message : 'Task name is required', trigger : 'blur' },
    { min : 3, max : 200, message : 'Name should be 3-200 characters', trigger : 'blur' }
  ],
  category : [{ required : true, message : 'Category is required', trigger : 'change' }],
  estimated_minutes : [
    { required : true, message : 'Estimated time is required', trigger : 'change' },
    { type : 'number', min : 1, message : 'Time must be at least 1 minute', trigger : 'change' }
  ]
}

// Event handlers
const handleBack = () => {
  const navigateBack = () => {
    // Restore original sidebar state if it was originally open
    if ( originalSidebarState.value && !appStore.sidebar.opened ) {
      appStore.TOGGLE_SIDEBAR()
    }
    router.push( { name : 'TaskLibrary' } )
  }

  if ( hasUnsavedChanges.value ) {
    pendingNavigation.value = navigateBack
    showUnsavedDialog.value = true
  } else {
    navigateBack()
  }
}

const navigateBackToWorkOrder = async( message, additionalQuery = {} ) => {
  const rawTarget = workOrderReturnRoute.value || '/work-order/table'
  const panel = workOrderReturnPanel.value
  const returnWorkOrderId = workOrderReturnWorkOrderId.value

  const targetUrl = new URL( rawTarget, window.location.origin )
  let basePath = targetUrl.pathname || '/work-order/table'
  if ( basePath === '/' && targetUrl.hash && targetUrl.hash.startsWith( '#/' ) ) {
    basePath = targetUrl.hash.slice( 1 )
  }
  const baseQueryEntries = Object.fromEntries( targetUrl.searchParams.entries() )

  const finalQuery = { ...baseQueryEntries, ...additionalQuery }

  // Enhanced context validation - ensure proper edit vs create distinction
  const isEditContext = panel === 'edit' && returnWorkOrderId
  const isCreateContext = panel === 'create' || ( !panel && workOrderDraftStore.shouldOpenCreatePanel )

  // Validate context consistency with draft store
  if ( isEditContext && !workOrderDraftStore.isEditMode ) {
    console.warn( 'Context mismatch: Navigation indicates edit mode but draft store is not in edit mode' )
    // Force edit mode in draft store to ensure consistency
    workOrderDraftStore.setContext( 'edit' )
  } else if ( isCreateContext && !workOrderDraftStore.isCreateMode ) {
    console.warn( 'Context mismatch: Navigation indicates create mode but draft store is not in create mode' )
    // Force create mode in draft store to ensure consistency
    workOrderDraftStore.setCreateMode()
  }

  const shouldOpenCreate = isCreateContext

  if ( shouldOpenCreate ) {
    finalQuery.panel = 'create'
    if ( !( 'showCreate' in finalQuery ) ) {
      finalQuery.showCreate = '1'
    }
  } else if ( isEditContext ) {
    finalQuery.panel = 'edit'
    if ( returnWorkOrderId ) {
      finalQuery.workOrderId = returnWorkOrderId
    }
  }

  workOrderDraftStore.setShouldOpenCreatePanel( shouldOpenCreate )

  if ( message ) {
    ElMessage.success( message )
  }

  if ( settingsStore.tagsView ) {
    await tagsViewStore.DEL_VIEW( route )
  }

  await router.push( { path : basePath, query : finalQuery } )
}

const promptWorkOrderSaveMode = async() => {
  try {
    await ElMessageBox.confirm( 'Do you want to save this as a template or only for this work order?', 'Save Task', {
      confirmButtonText : 'Save as Template',
      cancelButtonText : 'Save Only for Work Order',
      distinguishCancelAndClose : true,
      type : 'info'
    } )

    await performSave( { mode : 'template', fromWorkOrderContext : true } )
  } catch ( action ) {
    if ( action === 'cancel' ) {
      await performSave( { mode : 'adhoc', fromWorkOrderContext : true } )
    }
  }
}

const handleSave = async() => {
  try {
    await metadataFormRef.value.validate()

    if ( isStandaloneTask.value && originalTemplate.value ) {
      // For standalone tasks, show change summary dialog first
      const referenceData = {
        categories : categoriesForDropdown.value,
        equipmentTree : equipmentTreeData.value
      }

      const changes = generateChangesSummary( originalTemplate.value, templateForm.value, referenceData )

      // Always show dialog for standalone tasks, even if no changes detected
      openChangeSummaryDialog( changes )
    } else if ( isEditing.value && originalTemplate.value ) {
      // For editing mode (both regular and work order context), show change summary dialog first
      const referenceData = {
        categories : categoriesForDropdown.value,
        equipmentTree : equipmentTreeData.value
      }

      const changes = generateChangesSummary( originalTemplate.value, templateForm.value, referenceData )

      // Always show dialog in edit mode, even if no changes detected
      openChangeSummaryDialog( changes )
    } else {
      if ( fromWorkOrder.value ) {
        await promptWorkOrderSaveMode()
      } else {
        await performSave( { mode : 'template', fromWorkOrderContext : false } )
      }
    }
  } catch ( error ) {
    console.error( 'Validation error:', error )
    if ( error.fields ) {
      ElMessage.error( 'Please fix validation errors before saving' )
    } else {
      ElMessage.error( 'Please check your data and try again' )
    }
  }
}

const performSave = async( { mode = 'template', fromWorkOrderContext = false } = {} ) => {
  try {
    saving.value = true

    if ( isEditing.value ) {
      // For editing, we need to transform the data and call the update API with the template ID
      const templateId = route.params.id
      if ( !templateId ) {
        throw new Error( 'Template ID is required for editing' )
      }

      const updatedTemplate = await updateTemplate( templateId, templateForm.value )
      hasUnsavedChanges.value = false

      // Clear cached state after successful save
      clearStateByKey( stableCacheKey.value )

      // Update original template for future comparisons
      originalTemplate.value = JSON.parse( JSON.stringify( templateForm.value ) )

      if ( fromWorkOrderContext ) {
        const returnPanel = workOrderReturnPanel.value
        const returnWorkOrderId = workOrderReturnWorkOrderId.value

        // Enhanced context validation for template updates
        const isEditContext = returnPanel === 'edit' && returnWorkOrderId
        const isCreateContext = returnPanel === 'create'

        // Ensure draft store context consistency during template updates
        if ( isEditContext && !workOrderDraftStore.isEditMode ) {
          console.warn( 'Template update: Setting edit mode context for consistency' )
          workOrderDraftStore.setContext( 'edit' )
        } else if ( isCreateContext && !workOrderDraftStore.isCreateMode ) {
          console.warn( 'Template update: Setting create mode context for consistency' )
          workOrderDraftStore.setCreateMode()
        }

        workOrderDraftStore.updateTasksWithTemplate( updatedTemplate )
        workOrderDraftStore.setShouldOpenCreatePanel( isCreateContext )
        await navigateBackToWorkOrder( 'Task updated successfully' )
        return
      }

      // Handle navigation based on tagViews mode
      if ( settingsStore.tagsView ) {
        // Close current tab and navigate to previous tab
        const { visitedViews } = await tagsViewStore.DEL_VIEW( route )
        await loadTemplates() // Refresh the task list

        // Navigate to the previous tab (same logic as TagsView component)
        const latestView = visitedViews.slice( -1 )[0]
        if ( latestView ) {
          router.push( latestView.fullPath )
        } else {
          // Fallback to Task Library if no other tabs
          router.push( { name : 'TaskLibrary' } )
        }
      } else {
        // Navigate back to library and focus the updated template
        router.push( {
          name : 'TaskLibrary',
          query : { focusTemplate : templateId, refresh : true }
        } )
      }
    } else if ( mode === 'template' ) {
      const newTemplate = await createTemplate( templateForm.value )
      hasUnsavedChanges.value = false

      // Clear cached state after successful save
      clearStateByKey( stableCacheKey.value )

      if ( fromWorkOrderContext ) {
        workOrderDraftStore.appendTask( buildDisplayTaskFromTemplate( newTemplate ) )
        await navigateBackToWorkOrder( 'Template saved and added to the work order.' )
        return
      }

      // Handle navigation based on tagViews mode
      const templateId = newTemplate.id || newTemplate.template_id

      if ( settingsStore.tagsView ) {
        // Close current tab and navigate to Task Library
        await tagsViewStore.DEL_VIEW( route )
        await loadTemplates() // Refresh the task list

        // Always navigate to Task Library and focus the new template
        router.push( {
          name : 'TaskLibrary',
          query : { focusTemplate : templateId, refresh : true }
        } )
      } else {
        // Navigate back to Task Library and focus the new template
        router.push( {
          name : 'TaskLibrary',
          query : { focusTemplate : templateId, refresh : true }
        } )
      }
    } else if ( mode === 'adhoc' ) {
      const matchedCategory = Array.isArray( categoriesForDropdown.value )
        ? categoriesForDropdown.value.find( category => category.value === templateForm.value.category )
        : null
      const adhocTask = buildDisplayTaskFromDesigner( templateForm.value, matchedCategory )
      workOrderDraftStore.appendTask( adhocTask )
      hasUnsavedChanges.value = false
      clearStateByKey( stableCacheKey.value )
      await navigateBackToWorkOrder( 'Task added to the work order.' )
    }
  } catch ( error ) {
    console.error( 'Save error:', error )
    if ( error.fields ) {
      ElMessage.error( 'Please fix validation errors before saving' )
    } else if ( error.response?.data?.message ) {
      ElMessage.error( `Save failed: ${error.response.data.message}` )
    } else if ( error.message ) {
      ElMessage.error( `Save failed: ${error.message}` )
    } else {
      ElMessage.error( 'Failed to save task. Please check your data and try again.' )
    }
  } finally {
    saving.value = false
  }
}

const performStandaloneSave = async() => {
  try {
    saving.value = true

    // Get the original task ID from route query
    const originalTaskId = standaloneTaskIdRef.value || route.query.taskId || route.params.id
    if ( !originalTaskId ) {
      throw new Error( 'Original task ID not found' )
    }

    // Find the category option for proper transformation
    const categoryOption = Array.isArray( categoriesForDropdown.value )
      ? categoriesForDropdown.value.find( category => category.value === templateForm.value.category )
      : null

    // Use the same transformation logic as new task creation
    const transformedTask = buildDisplayTaskFromDesigner( templateForm.value, categoryOption )

    // Create the updated task data with proper payload structure
    const normalizedTaskId = String( originalTaskId )

    const updatedTaskData = {
      id : normalizedTaskId,
      name : transformedTask.name,
      description : transformedTask.description,
      category : transformedTask.category,
      category_name : transformedTask.category_name,
      estimated_minutes : transformedTask.estimated_minutes,
      steps : transformedTask.steps,
      source : 'adhoc',
      payload : transformedTask.payload // This is crucial - includes the backend-ready payload
    }

    if ( !updatedTaskData.task_id ) {
      updatedTaskData.task_id = normalizedTaskId
    }

    if ( updatedTaskData.payload && typeof updatedTaskData.payload === 'object' ) {
      updatedTaskData.payload.id = normalizedTaskId
      updatedTaskData.payload.task_id = normalizedTaskId
    }

    // Update the task in the work order draft store
    workOrderDraftStore.updateTask( normalizedTaskId, updatedTaskData )

    hasUnsavedChanges.value = false
    clearStateByKey( stableCacheKey.value )

    // Persist updated task data for work order edit view to consume
    // Navigate back to work order with reference to the stored update
    await navigateBackToWorkOrder( 'Standalone task updated successfully.', {
      taskData : JSON.stringify( updatedTaskData ),
      taskId : normalizedTaskId
    } )
  } catch ( error ) {
    console.error( 'Standalone save error:', error )

    if ( error.message ) {
      ElMessage.error( `Update failed: ${error.message}` )
    } else {
      ElMessage.error( 'Failed to update standalone task. Please try again.' )
    }
  } finally {
    saving.value = false
  }
}

const handlePreview = () => {
  showPreviewDialog.value = true
}

const handleReset = async() => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to reset all changes? This action cannot be undone.',
      'Reset Confirmation',
      {
        confirmButtonText : 'Reset',
        cancelButtonText : 'Cancel',
        type : 'warning'
      }
    )

    if ( isStandaloneTask.value || isEditing.value ) {
      // Edit mode or standalone mode: restore to original loaded state
      if ( originalTemplate.value ) {
        // Deep clone original template to avoid reference issues
        const originalData = JSON.parse( JSON.stringify( originalTemplate.value ) )

        // Reset templateForm to original template data
        templateForm.value.name = originalData.name || ''
        templateForm.value.description = originalData.description || ''
        templateForm.value.category = originalData.category || ''
        templateForm.value.estimated_minutes = originalData.estimated_minutes || 30
        templateForm.value.applicable_assets = originalData.applicable_assets || null
        templateForm.value.steps = originalData.steps || []

        // Reset all designer state (focus, dialogs, etc.)
        resetDesignerState()

        // Clear unsaved changes flag
        hasUnsavedChanges.value = false

        const messageText = isStandaloneTask.value
          ? 'Standalone task restored to original state'
          : 'Template restored to original state'
        ElMessage.success( messageText )

        // Clear cached state after reset
        clearStateByKey( stableCacheKey.value )
      } else {
        ElMessage.error( 'No original task data available' )
      }
    } else {
      // Create mode: reset to initial empty state
      // Reset templateForm to initial state
      templateForm.value.name = ''
      templateForm.value.description = ''
      templateForm.value.category = ''
      templateForm.value.estimated_minutes = 30
      templateForm.value.applicable_assets = null
      templateForm.value.steps = []

      // Reset all designer state (focus, dialogs, etc.)
      resetDesignerState()

      // Clear unsaved changes flag
      hasUnsavedChanges.value = false

      ElMessage.success( 'All inputs cleared' )

      // Clear cached state after reset
      clearStateByKey( stableCacheKey.value )
    }
  } catch ( error ) {
    if ( error !== 'cancel' ) {
      ElMessage.error( 'Reset operation failed' )
      console.error( 'Reset error:', error )
    }
  }
}

const markAsChanged = () => {
  hasUnsavedChanges.value = true
}

// Step management
const handleStepFocus = stepId => {
  setFocusedStep( stepId )
}

const handleResetSteps = async() => {
  try {
    await ElMessageBox.confirm(
      'This will remove all procedure steps. This action cannot be undone.',
      'Clear All Steps',
      {
        confirmButtonText : 'Continue',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--primary'
      }
    )

    // Clear all steps
    templateForm.value.steps = []
    markAsChanged()
    ElMessage.success( 'All steps have been cleared' )
  } catch ( error ) {
    // User cancelled - do nothing
  }
}

const handleAddStep = stepType => {
  const newStep = {
    step_id : `step-${Date.now()}`,
    order : templateForm.value.steps.length + 1,
    type : stepType,
    label : `New ${stepType} step`,
    description : '',
    required : false,
    required_image : false,
    relevant_resources : [],
    relevant_tools : [],
    config : getDefaultStepConfig( stepType )
  }

  templateForm.value.steps.push( newStep )
  markAsChanged()

  // Focus the new step
  setFocusedStep( newStep.step_id )

  // Scroll to the newly added step after DOM update; Use setTimeout to ensure VueDraggable and transition-group have completed
  nextTick( () => {
    setTimeout( () => {
      scrollToNewStep( newStep.step_id )
    }, 100 )
  } )
}

const handleStepUpdate = ( stepId, updates ) => {
  const stepIndex = templateForm.value.steps.findIndex( s => s.step_id === stepId )
  if ( stepIndex !== -1 ) {
    // Use Object.assign to ensure reactivity
    Object.assign( templateForm.value.steps[stepIndex], updates )

    // Force reactivity by creating a new array reference if the change includes type
    if ( updates.type ) {
      templateForm.value.steps = [...templateForm.value.steps]
    }

    markAsChanged()
  }
}

const handleStepDelete = async stepId => {
  try {
    await ElMessageBox.confirm( 'Are you sure you want to delete this step?', 'Delete Step', {
      confirmButtonText : 'Delete',
      cancelButtonText : 'Cancel',
      type : 'warning'
    } )

    templateForm.value.steps = templateForm.value.steps.filter( s => s.step_id !== stepId )

    // Reorder remaining steps
    templateForm.value.steps.forEach( ( step, index ) => {
      step.order = index + 1
    } )

    markAsChanged()

    // Clear focus if deleted step was focused
    if ( designerState.value.focused_step_id === stepId ) {
      setFocusedStep( null )
    }
  } catch ( error ) {
    // User cancelled
  }
}

const handleStepDuplicate = stepId => {
  // Find the original step
  const originalStepIndex = templateForm.value.steps.findIndex( s => s.step_id === stepId )
  if ( originalStepIndex === -1 ) return

  const originalStep = templateForm.value.steps[originalStepIndex]

  // Create a complete copy of the step
  const duplicatedStep = {
    ...originalStep,
    step_id : `step-${Date.now()}`,
    label : `${originalStep.label} (Copy)`,
    // Deep copy complex objects to avoid reference issues
    config : originalStep.config ? JSON.parse( JSON.stringify( originalStep.config ) ) : {},
    relevant_tools : originalStep.relevant_tools ? [...originalStep.relevant_tools] : [],
    relevant_resources : originalStep.relevant_resources ? [...originalStep.relevant_resources] : []
  }

  // Insert the duplicated step right after the original step
  templateForm.value.steps.splice( originalStepIndex + 1, 0, duplicatedStep )

  // Reorder all steps
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  markAsChanged()

  // Focus the newly created duplicate step
  setFocusedStep( duplicatedStep.step_id )

  // Scroll to the duplicated step after DOM update
  // Use setTimeout to ensure VueDraggable and transition-group have completed
  nextTick( () => {
    setTimeout( () => {
      scrollToNewStep( duplicatedStep.step_id )
    }, 100 )
  } )
}

const handleStepConfigure = ( stepId, configType ) => {
  const step = templateForm.value.steps.find( s => s.step_id === stepId )
  if ( !step ) return

  switch ( configType ) {
    case 'limits':
      openNumberLimitsDialog( stepId, step.config.limits || {} )
      break
    case 'tools':
      // Extract tool IDs if passing objects, otherwise pass the array as-is
      // eslint-disable-next-line no-case-declarations
      const toolIds =
        Array.isArray( step.relevant_tools ) &&
        step.relevant_tools.length > 0 &&
        typeof step.relevant_tools[0] === 'object'
          ? step.relevant_tools.map( tool => tool.tool_id )
          : step.relevant_tools || []
      openToolsDialog( stepId, toolIds )
      break
    case 'resources':
      openResourcesDialog( stepId, step.relevant_resources || [] )
      break
    default:
      break
  }
}

// VueDraggable event handlers
const handleVueDragStart = evt => {
  // Optional: Add any start logic here
}

const handleVueDragEnd = evt => {
  // Update step orders after drag ends
  updateStepOrders()
  markAsChanged()
}

const handleVueDragChange = evt => {
  // Vue draggable automatically updates the v-model (templateForm.steps)
  // We just need to update step orders
  updateStepOrders()
}

// Helper function to update step orders
const updateStepOrders = () => {
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )
}

// FloatingPanel event handlers
const handleReorderSteps = ( { stepId, sourceIndex, targetIndex } ) => {
  if ( sourceIndex === targetIndex ) return

  const steps = [...templateForm.value.steps]
  const stepToMove = steps[sourceIndex]

  // Remove from source position
  steps.splice( sourceIndex, 1 )

  // Insert at target position
  steps.splice( targetIndex, 0, stepToMove )

  // Update step orders
  steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  templateForm.value.steps = steps
  markAsChanged()
}

const handleBulkAction = async( { action, stepIds } ) => {
  const stepIndices = stepIds
    .map( id => templateForm.value.steps.findIndex( s => s.step_id === id ) )
    .filter( index => index !== -1 )

  switch ( action ) {
    case 'duplicate':
      // eslint-disable-next-line no-case-declarations
      const duplicatedSteps = stepIndices.map( index => {
        const originalStep = templateForm.value.steps[index]
        return {
          ...originalStep,
          step_id : `step-${Date.now()}-${Math.random().toString( 36 ).substr( 2, 9 )}`,
          label : `${originalStep.label} (Copy)`,
          order : templateForm.value.steps.length + 1
        }
      } )
      templateForm.value.steps.push( ...duplicatedSteps )
      break

    case 'mark_required':
      stepIndices.forEach( index => {
        templateForm.value.steps[index].required = true
      } )
      break

    case 'mark_optional':
      stepIndices.forEach( index => {
        templateForm.value.steps[index].required = false
      } )
      break

    case 'delete':
      // Confirm deletion
      try {
        await ElMessageBox.confirm(
          `Are you sure you want to delete ${stepIds.length} step(s)? This action cannot be undone.`,
          'Delete Steps',
          {
            confirmButtonText : 'Delete',
            cancelButtonText : 'Cancel',
            type : 'warning'
          }
        )

        // Remove steps in reverse order to maintain indices
        const sortedIndices = stepIndices.sort( ( a, b ) => b - a )
        sortedIndices.forEach( index => {
          templateForm.value.steps.splice( index, 1 )
        } )
      } catch ( error ) {
        // User cancelled, do nothing
        return
      }
      break
    default:
      break
  }

  // Reorder all steps
  templateForm.value.steps.forEach( ( step, index ) => {
    step.order = index + 1
  } )

  markAsChanged()
}

const handleInlineRename = stepId => {
  // Focus the step for inline editing
  setFocusedStep( stepId )

  // Find the step card and focus its label input
  setTimeout( () => {
    const stepCard = document.querySelector( `[data-step-id="${stepId}"] .step-label-input input` )
    if ( stepCard ) {
      stepCard.focus()
      stepCard.select()
    }
  }, 100 )
}

const handleSetMode = mode => {
  setFloatingPanelMode( mode )
}

// Configuration dialog handlers
const handleNumberLimitsSave = ( stepId, limitsData ) => {
  handleStepUpdate( stepId, {
    config : {
      ...templateForm.value.steps.find( s => s.step_id === stepId )?.config,
      limits : limitsData
    }
  } )
  closeNumberLimitsDialog()
}

const handleToolsSave = ( stepId, selectedTools ) => {
  handleStepUpdate( stepId, {
    relevant_tools : selectedTools
  } )
  closeToolsDialog()
}

const handleResourcesSave = ( stepId, resources ) => {
  handleStepUpdate( stepId, {
    relevant_resources : resources
  } )
  closeResourcesDialog()
}

// Unsaved changes handling
const handleUnsavedDialogClose = () => {
  showUnsavedDialog.value = false
  pendingNavigation.value = null
}

const discardChanges = () => {
  hasUnsavedChanges.value = false
  showUnsavedDialog.value = false
  if ( pendingNavigation.value ) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
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

// Utility functions moved to ../utils/stepTransforms

// Change detection utilities (localized copy; avoids global store dependency)
const getDetailedConfigChanges = ( originalStep, currentStep ) => {
  const changes = []
  const originalConfig = originalStep.config || {}
  const currentConfig = currentStep.config || {}

  // For number steps, check limits specifically
  if ( currentStep.type === 'number' ) {
    const originalLimits = originalConfig.limits
    const currentLimits = currentConfig.limits

    // Check if limits changed
    if ( JSON.stringify( originalLimits ) !== JSON.stringify( currentLimits ) ) {
      const originalText = formatLimitsText( originalLimits, originalConfig.unit )
      const currentText = formatLimitsText( currentLimits, currentConfig.unit )
      changes.push( {
        field : 'limits',
        label : 'Range',
        original : originalText,
        current : currentText
      } )
    }

    // Check if unit changed
    if ( originalConfig.unit !== currentConfig.unit ) {
      changes.push( {
        field : 'unit',
        label : 'Unit',
        original : originalConfig.unit || 'None',
        current : currentConfig.unit || 'None'
      } )
    }

    // Check if decimal places changed
    if ( originalConfig.decimal_places !== currentConfig.decimal_places ) {
      changes.push( {
        field : 'decimal_places',
        label : 'Decimal Places',
        original : originalConfig.decimal_places?.toString() || '0',
        current : currentConfig.decimal_places?.toString() || '0'
      } )
    }

    // Check if default value changed
    if ( originalConfig.default_value !== currentConfig.default_value ) {
      changes.push( {
        field : 'default_value',
        label : 'Default Value',
        original : originalConfig.default_value?.toString() || 'None',
        current : currentConfig.default_value?.toString() || 'None'
      } )
    }
  } else if ( currentStep.type === 'checkbox' ) {
    if ( originalConfig.default !== currentConfig.default ) {
      changes.push( {
        field : 'default',
        label : 'Default Value',
        original : originalConfig.default ? 'Checked' : 'Unchecked',
        current : currentConfig.default ? 'Checked' : 'Unchecked'
      } )
    }
  } else if ( currentStep.type === 'text' ) {
    if ( originalConfig.default_value !== currentConfig.default_value ) {
      changes.push( {
        field : 'default_value',
        label : 'Default Value',
        original : originalConfig.default_value || 'None',
        current : currentConfig.default_value || 'None'
      } )
    }
    if ( originalConfig.max_length !== currentConfig.max_length ) {
      changes.push( {
        field : 'max_length',
        label : 'Max Length',
        original : originalConfig.max_length?.toString() || 'Unlimited',
        current : currentConfig.max_length?.toString() || 'Unlimited'
      } )
    }
  } else if ( currentStep.type === 'inspection' ) {
    if ( originalConfig.default !== currentConfig.default ) {
      changes.push( {
        field : 'default',
        label : 'Default Value',
        original : originalConfig.default || 'None',
        current : currentConfig.default || 'None'
      } )
    }
  }

  // If no specific config changes detected but configs are different, fall back to generic
  if ( changes.length === 0 && JSON.stringify( originalConfig ) !== JSON.stringify( currentConfig ) ) {
    changes.push( {
      field : 'config',
      label : 'Configuration',
      original : 'Modified',
      current : 'Modified'
    } )
  }

  return changes
}

const generateChangesSummary = ( originalTemplate, currentTemplate, referenceData = {} ) => {
  const changes = {
    metadata : [],
    steps_added : [],
    steps_modified : [],
    steps_deleted : [],
    steps_reordered : []
  }

  // Compare metadata changes
  const metadataFields = [
    { key : 'name', label : 'Task Name' },
    { key : 'description', label : 'Description' },
    { key : 'category', label : 'Category' },
    { key : 'estimated_minutes', label : 'Estimated Time' },
    { key : 'applicable_assets', label : 'Applicable Assets' }
  ]

  metadataFields.forEach( field => {
    const original = originalTemplate[field.key]
    const current = currentTemplate[field.key]
    if ( JSON.stringify( original ) !== JSON.stringify( current ) ) {
      changes.metadata.push( {
        field : field.key,
        label : field.label,
        original : formatValue( original, field.key, referenceData ),
        current : formatValue( current, field.key, referenceData )
      } )
    }
  } )

  // Detect step changes
  const originalSteps = originalTemplate.steps || []
  const currentSteps = currentTemplate.steps || []
  const originalStepsMap = new Map( originalSteps.map( step => [step.step_id, step] ) )
  const currentStepsMap = new Map( currentSteps.map( step => [step.step_id, step] ) )

  // Added steps
  currentSteps.forEach( step => {
    if ( !originalStepsMap.has( step.step_id ) ) {
      changes.steps_added.push( {
        step_id : step.step_id,
        label : step.label,
        type : step.type,
        position : step.order
      } )
    }
  } )

  // Deleted steps
  originalSteps.forEach( step => {
    if ( !currentStepsMap.has( step.step_id ) ) {
      changes.steps_deleted.push( {
        step_id : step.step_id,
        label : step.label,
        type : step.type,
        position : step.order
      } )
    }
  } )

  // Modified steps
  currentSteps.forEach( currentStep => {
    const originalStep = originalStepsMap.get( currentStep.step_id )
    if ( originalStep ) {
      const stepChanges = []
      const stepFields = [
        { key : 'label', label : 'Name' },
        { key : 'description', label : 'Description' },
        { key : 'required', label : 'Required' },
        { key : 'required_image', label : 'Image Required' },
        { key : 'type', label : 'Type' }
      ]
      stepFields.forEach( field => {
        if ( originalStep[field.key] !== currentStep[field.key] ) {
          stepChanges.push( {
            field : field.key,
            label : field.label,
            original : formatValue( originalStep[field.key], field.key, referenceData ),
            current : formatValue( currentStep[field.key], field.key, referenceData )
          } )
        }
      } )
      // Detailed config comparison
      const configChanges = getDetailedConfigChanges( originalStep, currentStep )
      if ( configChanges.length > 0 ) {
        stepChanges.push( ...configChanges )
      }
      if ( JSON.stringify( originalStep.relevant_tools ) !== JSON.stringify( currentStep.relevant_tools ) ) {
        stepChanges.push( {
          field : 'relevant_tools',
          label : 'Tools',
          original : `${( originalStep.relevant_tools || [] ).length} tools`,
          current : `${( currentStep.relevant_tools || [] ).length} tools`
        } )
      }
      if ( stepChanges.length > 0 ) {
        changes.steps_modified.push( {
          step_id : currentStep.step_id,
          label : currentStep.label,
          type : currentStep.type,
          changes : stepChanges
        } )
      }
    }
  } )

  // Reordered steps
  if ( originalSteps.length === currentSteps.length ) {
    const originalOrder = originalSteps.map( s => s.step_id )
    const currentOrder = currentSteps.map( s => s.step_id )
    if ( JSON.stringify( originalOrder ) !== JSON.stringify( currentOrder ) ) {
      const reorderedSteps = []
      currentSteps.forEach( ( step, index ) => {
        const originalIndex = originalSteps.findIndex( s => s.step_id === step.step_id )
        if ( originalIndex !== -1 && originalIndex !== index ) {
          reorderedSteps.push( {
            step_id : step.step_id,
            label : step.label,
            original_position : originalIndex + 1,
            new_position : index + 1
          } )
        }
      } )
      changes.steps_reordered = reorderedSteps
    }
  }

  return changes
}

const formatValue = ( value, fieldKey = '', referenceData = {} ) => {
  if ( value === null || value === undefined ) return 'None'
  if ( fieldKey === 'category' ) {
    if ( typeof value === 'number' && referenceData.categories ) {
      const category = referenceData.categories.find( cat => cat.value === value || cat.id === value )
      return category ? category.label : `Category ID: ${value}`
    }
    if ( typeof value === 'string' && value.trim() === '' ) return 'None'
    return value.toString()
  }
  if ( fieldKey === 'applicable_assets' ) {
    if ( Array.isArray( value ) ) {
      if ( value.length === 0 ) return 'None'
      if ( referenceData.equipmentTree && referenceData.equipmentTree.length > 0 ) {
        const assetNames = value
          .map( assetId => {
            const asset = findAssetInTree( referenceData.equipmentTree, assetId )
            if ( asset ) return asset.label
            const numericId = parseInt( assetId )
            if ( !isNaN( numericId ) ) {
              const byNum = findAssetInTree( referenceData.equipmentTree, numericId )
              return byNum ? byNum.label : `Asset ID: ${assetId}`
            }
            return `Asset ID: ${assetId}`
          } )
          .filter( Boolean )
        return assetNames.length > 0 ? assetNames.join( ', ' ) : 'None'
      }
      return `${value.length} asset(s)`
    }
    if ( typeof value === 'number' || ( typeof value === 'string' && value.trim() !== '' ) ) {
      if ( referenceData.equipmentTree && referenceData.equipmentTree.length > 0 ) {
        const asset = findAssetInTree( referenceData.equipmentTree, value )
        return asset ? asset.label : `Asset ID: ${value}`
      }
      return `Asset ID: ${value}`
    }
    return 'None'
  }
  if ( Array.isArray( value ) ) return value.length === 0 ? 'None' : value.join( ', ' )
  if ( typeof value === 'boolean' ) return value ? 'Yes' : 'No'
  if ( typeof value === 'number' ) return fieldKey === 'estimated_minutes' ? `${value} minutes` : value.toString()
  if ( typeof value === 'string' && value.trim() === '' ) return 'None'
  return value.toString()
}

const findAssetInTree = ( treeData, assetId ) => {
  if ( !Array.isArray( treeData ) ) return null
  for ( const node of treeData ) {
    if (
      node.value === assetId ||
      node.id === assetId ||
      parseInt( node.value ) === parseInt( assetId ) ||
      parseInt( node.id ) === parseInt( assetId )
    ) {
      return node
    }
    if ( node.children && node.children.length > 0 ) {
      const found = findAssetInTree( node.children, assetId )
      if ( found ) return found
    }
  }
  return null
}

const fetchEquipmentTreeData = async() => {
  equipmentTreeLoading.value = true
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
    ElMessage.error( 'Failed to load asset data.' )
  } finally {
    equipmentTreeLoading.value = false
  }
}

const fetchCategories = async() => {
  categoriesLoading.value = true
  try {
    const response = await getAllCategories()
    // Store both category objects and names for proper ID mapping
    allCategories.value = response.data || []
    categoriesForDropdown.value = response.data.map( category => ( {
      label : category.name,
      value : category.id // Use ID as value for proper backend integration
    } ) )
  } catch ( error ) {
    console.error( 'Categories load failed:', error )
    ElMessage.error( 'Failed to load category data.' )
    // Fallback to default categories
    categoriesForDropdown.value = [
      { label : 'Preventive Maintenance', value : 1 },
      { label : 'Inspection', value : 2 },
      { label : 'Repair', value : 3 },
      { label : 'Calibration', value : 4 },
      { label : 'Safety Check', value : 5 },
      { label : 'Other', value : 6 }
    ]
  } finally {
    categoriesLoading.value = false
  }
}

// Data transformation helpers moved to ../utils/stepTransforms

const resolveCategoryFromApiTemplate = apiTemplate => {
  // Handle different category formats from API
  if ( !apiTemplate.category ) return ''

  // If category is already an object with id/name, use the id
  if ( typeof apiTemplate.category === 'object' && apiTemplate.category.id ) {
    return apiTemplate.category.id
  }

  // If category is a string, try to find matching ID from dropdown options
  if ( typeof apiTemplate.category === 'string' ) {
    const matchingCategory = categoriesForDropdown.value.find( cat => cat.label === apiTemplate.category )
    if ( matchingCategory ) {
      return matchingCategory.value
    }
  }

  // If category is already a number, return it
  if ( typeof apiTemplate.category === 'number' ) {
    return apiTemplate.category
  }

  return ''
}

// Fetch template by ID without touching global store
const fetchTemplateByIdLocal = async id => {
  detailLoading.value = true
  try {
    const resp = await getTaskTemplateById( id )
    if ( resp?.data?.data ) return resp.data.data
    return resp?.data
  } finally {
    detailLoading.value = false
  }
}

// Helper function to transform standalone task steps to designer format
const transformStandaloneStepToDesigner = ( step, index ) => {
  // Check if step is already in designer format (has step_id, type, config properties)
  if ( step.step_id && step.type && step.config ) {
    return step
  }

  // If step has the backend API format (with value.type structure), use the standard transformer
  if ( step.value && step.value.type ) {
    return transformApiStepToDesignerStep( step, index )
  }

  // If step is in a different format, try to transform it manually
  // This handles the case where standalone tasks have steps in backend payload format
  const stepType = step.type || 'text'

  // Map backend step types to designer types
  const typeMapping = {
    template : 'text',
    numeric : 'number',
    boolean : 'checkbox',
    file : 'attachments',
    checkbox : 'checkbox',
    text : 'text',
    inspection : 'inspection',
    number : 'number',
    attachments : 'attachments'
  }

  const mappedType = typeMapping[stepType] || 'text'

  return {
    step_id : step.id || step._id || `step-${Date.now()}-${index}`,
    order : index + 1,
    type : mappedType,
    label : step.name || `Step ${index + 1}`,
    description : step.description || '',
    required : Boolean( step.required ),
    required_image : Boolean( step.value?.require_image ),
    relevant_tools : step.tools || [],
    relevant_resources : step.relevant_resources || [],
    config : getDefaultStepConfig( mappedType )
  }
}

// Track initialization to prevent multiple concurrent calls
const initializationInProgress = ref( false )

// Initialize template data
const initializeTemplate = async() => {
  if ( initializationInProgress.value ) {
    console.log( 'TemplateDesignerView: initializeTemplate already in progress, skipping...' )
    return
  }

  initializationInProgress.value = true
  console.log( 'TemplateDesignerView: initializeTemplate called with route:', {
    params : route.params,
    query : route.query,
    isStandaloneTask : isStandaloneTask.value,
    routeParamsId : route.params.id,
    routeQueryStandalone : route.query.standalone,
    routeQueryTaskData : route.query.taskData ? 'present' : 'missing',
    routeQueryTaskDataKey : route.query.taskDataKey ? 'present' : 'missing'
  } )

  if ( isStandaloneTask.value ) {
    // Handle standalone task editing
    try {
      let taskDataString = route.query.taskData
      const taskDataKey = route.query.taskDataKey

      console.log( 'TemplateDesignerView: taskDataString:', taskDataString ? 'present' : 'missing' )
      console.log( 'TemplateDesignerView: taskDataKey:', taskDataKey ? 'present' : 'missing' )

      // Try to get data from sessionStorage if taskDataKey is provided
      if ( !taskDataString && taskDataKey ) {
        console.log( 'TemplateDesignerView: Retrieving task data from sessionStorage with key:', taskDataKey )
        taskDataString = sessionStorage.getItem( taskDataKey )
        if ( taskDataString ) {
          console.log( 'TemplateDesignerView: Successfully retrieved task data from sessionStorage' )
          // Don't clean up immediately - wait until after successful initialization
        } else {
          console.log( 'TemplateDesignerView: No data found in sessionStorage for key:', taskDataKey )
        }
      }

      // If taskDataString is still missing, wait a bit and retry (handles timing issues with route updates)
      if ( !taskDataString ) {
        console.log( 'TemplateDesignerView: taskData missing, retrying after delay...' )
        await new Promise( resolve => setTimeout( resolve, 100 ) )
        taskDataString = route.query.taskData || ( taskDataKey ? sessionStorage.getItem( taskDataKey ) : null )
        if ( !taskDataString ) {
          const fallbackKey = sessionStorage.getItem( 'last-standalone-task-key' )
          if ( fallbackKey ) {
            taskDataString = sessionStorage.getItem( fallbackKey )
            if ( !taskDataKey && taskDataString ) {
              console.log( 'TemplateDesignerView: Using fallback session key for standalone task data' )
              sessionStorage.removeItem( 'last-standalone-task-key' )
            }
          }
        }
        console.log( 'TemplateDesignerView: taskDataString after retry:', taskDataString ? 'present' : 'missing' )
      }

      let taskData = null

      if ( taskDataString ) {
        taskData = JSON.parse( taskDataString )
      }

      const shouldFetchEntry = route.query.shouldFetchEntry === 'true'
      const rawEntryLookupId =
        route.query.taskEntryId ||
        route.query.taskId ||
        ( route.params.id !== 'standalone' ? route.params.id : null ) ||
        taskData?.entry_id
      const entryLookupId = rawEntryLookupId && rawEntryLookupId !== 'undefined' ? rawEntryLookupId : null

      if ( shouldFetchEntry && entryLookupId ) {
        try {
          console.log( 'TemplateDesignerView: Fetching standalone task entry via API for id:', entryLookupId )
          const entryResponse = await getTaskEntryById( entryLookupId )
          const entryData = entryResponse?.data || entryResponse || null
          if ( entryData ) {
            taskData = {
              ...entryData,
              ...taskData
            }
          }
        } catch ( entryError ) {
          console.warn( 'TemplateDesignerView: Failed to fetch task entry via API:', entryError )
        }
      } else if ( !taskData && entryLookupId ) {
        console.log( 'TemplateDesignerView: Attempting fallback task entry fetch for id:', entryLookupId )
        try {
          const entryResponse = await getTaskEntryById( entryLookupId )
          taskData = entryResponse?.data || entryResponse || null
        } catch ( entryError ) {
          console.warn( 'TemplateDesignerView: Fallback task entry fetch failed:', entryError )
        }
      }

      if ( !taskData ) {
        const pendingTask = workOrderDraftStore.consumePendingStandaloneTask()
        if ( pendingTask ) {
          const pendingIdCandidates = [pendingTask.id, pendingTask.task_id, pendingTask.taskId]
            .filter( Boolean )
            .map( value => String( value ) )
          const lookupId = entryLookupId ? String( entryLookupId ) : null

          if ( !lookupId || pendingIdCandidates.includes( lookupId ) ) {
            console.log( 'TemplateDesignerView: Using pending standalone task data from draft store' )
            taskData = pendingTask
          } else {
            // Put it back if it doesn't match
            workOrderDraftStore.setPendingStandaloneTask( pendingTask )
          }
        }
      }

      if ( !taskData ) {
        const draftTasks = workOrderDraftStore.draftForm?.tasks || []
        const draftMatch = draftTasks.find( task => {
          const candidates = [task.id, task.task_id, task.taskId].filter( Boolean ).map( value => String( value ) )
          const lookupId = entryLookupId ? String( entryLookupId ) : null
          return lookupId ? candidates.includes( lookupId ) : false
        } )

        if ( draftMatch ) {
          console.log( 'TemplateDesignerView: Resolved standalone task data from draft store' )
          taskData = JSON.parse( JSON.stringify( draftMatch ) )
        }
      }

      if ( !taskData ) {
        throw new Error( 'Task data not found in route query parameters or sessionStorage' )
      }

      if ( taskData.id || taskData.task_id ) {
        standaloneTaskIdRef.value = String( taskData.id || taskData.task_id )
      }

      // Normalize minimal identifiers
      if ( !taskData.id && taskData.task_id ) {
        taskData.id = taskData.task_id
      }

      // Transform standalone task data to match the designer form structure
      templateForm.value = {
        name : taskData.name || '',
        description : taskData.description || '',
        category : taskData.category || '',
        estimated_minutes : taskData.estimated_minutes || 30,
        applicable_assets : taskData.equipment_node_id || null,
        steps : Array.isArray( taskData.steps ) ? taskData.steps.map( transformStandaloneStepToDesigner ) : []
      }

      // Create a mock template object for standalone tasks
      currentTemplate.value = {
        id : taskData.id,
        name : taskData.name,
        description : taskData.description,
        steps : taskData.steps || [],
        isStandalone : true
      }

      // Store original template for change detection
      originalTemplate.value = JSON.parse( JSON.stringify( templateForm.value ) )

      // Mark that we have loaded data but no changes made yet
      hasUnsavedChanges.value = false

      // Update tag title for tagViews mode
      if ( settingsStore.tagsView ) {
        const newTitle = `Edit Standalone Task - ${taskData.name || taskData.id}`
        tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, newTitle )
      }

      // Clean up sessionStorage after successful initialization
      if ( taskDataKey ) {
        console.log( 'TemplateDesignerView: Cleaning up sessionStorage for key:', taskDataKey )
        sessionStorage.removeItem( taskDataKey )
      }

      sessionStorage.removeItem( 'last-standalone-task-key' )

      // Clean up query parameters that were used only for initialization
      if ( taskDataKey || route.query.shouldFetchEntry || route.query.taskData ) {
        const cleanedQuery = { ...route.query }
        delete cleanedQuery.taskDataKey
        delete cleanedQuery.taskData
        delete cleanedQuery.shouldFetchEntry
        router.replace( { query : cleanedQuery } ).catch( () => {} )
      }

      // Initial validation check
      nextTick( () => {
        validateElementForm()
      } )
    } catch ( error ) {
      console.error( 'Standalone task load failed:', error )
      ElMessage.error( 'Failed to load standalone task data' )
      router.push( { name : 'TaskLibrary' } )
    }
  } else if ( isEditing.value ) {
    try {
      const template = await fetchTemplateByIdLocal( route.params.id )
      if ( !template ) {
        throw new Error( 'Template not found' )
      }

      // Transform the loaded template data to match the designer form structure
      templateForm.value = {
        name : template.name || '',
        description : template.description || '',
        category : resolveCategoryFromApiTemplate( template ),
        estimated_minutes : template.time_estimate_sec
          ? Math.round( template.time_estimate_sec / 60 )
          : template.estimated_minutes || 30,
        applicable_assets : template.equipment_node?.id || template.equipment_node_id || null,
        steps : Array.isArray( template.steps ) ? template.steps.map( transformApiStepToDesignerStep ) : []
      }

      // Store the loaded template data locally (not shared across tabs)
      currentTemplate.value = template
      // Store original template for change detection
      originalTemplate.value = JSON.parse( JSON.stringify( templateForm.value ) )

      // Mark that we have loaded data but no changes made yet
      hasUnsavedChanges.value = false

      // Update tag title for tagViews mode with template reference_id
      if ( settingsStore.tagsView && template.reference_id ) {
        const newTitle = `Edit Task - ${template.reference_id}`
        tagsViewStore.UPDATE_VISITED_VIEW_TITLE( route.path, newTitle )
      }

      // Initial validation check
      nextTick( () => {
        validateElementForm()
      } )
    } catch ( error ) {
      console.error( 'Template load failed:', error )
      ElMessage.error( 'Failed to load task' )
      router.push( { name : 'TaskLibrary' } )
    }
  } else {
    // Initialize new template
    currentTemplate.value = null // No template loaded for create mode
    templateForm.value = {
      name : '',
      description : '',
      category : '',
      estimated_minutes : 30,
      applicable_assets : null,
      steps : []
    }
    hasUnsavedChanges.value = false

    // Initial validation check for new templates
    nextTick( () => {
      validateElementForm()
    } )
  }
}

// Lifecycle hooks
onMounted( async() => {
  // Capture route identity for this keep-alive instance
  routeSnapshot.value = { path : route.path, params : { ...( route.params || {} ) }}
  // Dev helper to inspect designer state cache
  if ( typeof window !== 'undefined' ) {
    window.__designerCacheStats = getCacheStats
  }
  renderReady.value = false
  // Compute stable cache key once per instance
  stableCacheKey.value = route.params?.id ? `designer-edit-${route.params.id}` : 'designer-create'

  // Store original sidebar state and collapse it only on small viewports
  originalSidebarState.value = appStore.sidebar.opened
  if ( appStore.sidebar.opened && window.innerWidth < 1600 ) {
    appStore.CLOSE_SIDEBAR( false )
  }

  // Calculate dynamic heights
  calculateDynamicHeights()

  // Add resize listener
  window.addEventListener( 'resize', handleResize )

  // Load categories and equipment data first, then initialize template
  // This ensures category resolution works properly for edit mode
  await Promise.all( [fetchCategories(), fetchEquipmentTreeData()] )

  // Check if we have cached state before initializing
  // If tagViews is enabled and we have cached state, let onActivated handle restoration
  if ( settingsStore.tagsView && hasCache() ) {
    return
  }

  // Initialize template normally if no cached state
  await initializeTemplate()
  renderReady.value = true
  await nextTick( () => validateElementForm() )
} )

onBeforeUnmount( () => {
  // Remove resize listener
  window.removeEventListener( 'resize', handleResize )

  // Restore original sidebar state if it was originally open
  if ( originalSidebarState.value && !appStore.sidebar.opened ) {
    appStore.TOGGLE_SIDEBAR()
  }

  resetDesignerState()
} )

onActivated( async() => {
  isComponentActive.value = true
  // Refresh snapshot to current route identity when (re)activating
  routeSnapshot.value = { path : route.path, params : { ...( route.params || {} ) }}

  // Recalculate heights when component is activated
  calculateDynamicHeights()
  renderReady.value = false

  // Try to restore cached state if available (prefer stable key)
  if ( settingsStore.tagsView && ( hasCachedStateByKey( stableCacheKey.value ) || hasCache() ) ) {
    const cachedState = restoreStateByKey( stableCacheKey.value ) || restoreCache()
    if ( cachedState ) {
      // Helper to detect empty form snapshots
      const formIsEmpty = form => {
        if ( !form || typeof form !== 'object' ) return true
        const hasName = typeof form.name === 'string' && form.name.trim().length > 0
        const hasSteps = Array.isArray( form.steps ) && form.steps.length > 0
        const hasCategory = !!form.category
        return !( hasName || hasSteps || hasCategory )
      }

      // Restore template form data with fallback to originalTemplate if needed
      if ( formIsEmpty( cachedState.templateForm ) && cachedState.originalTemplate ) {
        console.warn( '[Designer] Cached templateForm empty; rebuilding from originalTemplate snapshot' )
        templateForm.value = JSON.parse( JSON.stringify( cachedState.originalTemplate ) )
      } else {
        templateForm.value = cachedState.templateForm
      }

      // Restore original template reference
      originalTemplate.value = cachedState.originalTemplate

      // Restore current template reference
      currentTemplate.value = cachedState.currentTemplate

      // Restore unsaved changes flag
      hasUnsavedChanges.value = cachedState.hasUnsavedChanges

      // Restore designer state if available
      if ( cachedState.designerState ) {
        Object.assign( designerState.value, cachedState.designerState )
      }

      // Mark ready, then validate once form is rendered
      renderReady.value = true
      await nextTick( () => {
        validateElementForm()
      } )

      // Integrity check: ensure cached template matches current route id
      if (
        isEditing.value &&
        currentTemplate.value &&
        ( currentTemplate.value.id || currentTemplate.value.template_id ) !== route.params.id
      ) {
        console.warn(
          '[Designer] Cached template id mismatch; reloading by route id',
          'cached:',
          currentTemplate.value.id || currentTemplate.value.template_id,
          'route:',
          route.params.id
        )
        await initializeTemplate()
        renderReady.value = true
      }
      return
    }
  }

  // Fallback: attempt to restore by templateId from any cache entry
  if ( settingsStore.tagsView && isEditing.value && route.params.id ) {
    const restored = restoreStateByTemplateId( route.params.id, snapshotRoute() )
    if ( restored ) {
      // Use same empty form fallback for templateId-based restore
      const formIsEmpty2 = form => {
        if ( !form || typeof form !== 'object' ) return true
        const hasName = typeof form.name === 'string' && form.name.trim().length > 0
        const hasSteps = Array.isArray( form.steps ) && form.steps.length > 0
        const hasCategory = !!form.category
        return !( hasName || hasSteps || hasCategory )
      }
      if ( formIsEmpty2( restored.templateForm ) && restored.originalTemplate ) {
        console.warn( '[Designer] Cached templateForm empty (templateId path); rebuilding from originalTemplate' )
        templateForm.value = JSON.parse( JSON.stringify( restored.originalTemplate ) )
      } else {
        templateForm.value = restored.templateForm
      }
      originalTemplate.value = restored.originalTemplate
      currentTemplate.value = restored.currentTemplate
      hasUnsavedChanges.value = restored.hasUnsavedChanges
      if ( restored.designerState ) {
        Object.assign( designerState.value, restored.designerState )
      }
      renderReady.value = true
      await nextTick( () => validateElementForm() )
      return
    }
  }

  // If no cached state available, check if we need to initialize
  // This handles cases where onMounted skipped initialization due to detected cache
  // but the cache was invalid/cleared
  const isFormEmpty =
    !templateForm.value.name && !templateForm.value.description && templateForm.value.steps.length === 0

  if ( isFormEmpty ) {
    await initializeTemplate()
    renderReady.value = true
  }
} )

// Watch for route changes to reinitialize when navigating between different tasks
watch(
  () => [route.params.id, route.query.taskData, route.query.standalone],
  async( [newId, newTaskData, newStandalone], [oldId, oldTaskData, oldStandalone] ) => {
    // Only reinitialize if the route actually changed meaningfully
    const routeChanged = newId !== oldId || newTaskData !== oldTaskData || newStandalone !== oldStandalone

    if ( routeChanged && ( newId || newTaskData ) ) {
      renderReady.value = false

      try {
        await initializeTemplate()
        renderReady.value = true
      } catch ( error ) {
        console.error( 'TemplateDesignerView: Failed to reinitialize on route change:', error )
        renderReady.value = true
      }
    }
  },
  { immediate : false } // Don't run immediately since onMounted handles the initial load
)

onDeactivated( () => {
  isComponentActive.value = false

  // Only save state when tagViews mode is enabled
  if ( settingsStore.tagsView ) {
    // Save current state to cache before switching tabs
    // Avoid overwriting a good snapshot with an empty form; fallback to previous cached form if needed
    const formIsEmpty = form => {
      if ( !form || typeof form !== 'object' ) return true
      const hasName = typeof form.name === 'string' && form.name.trim().length > 0
      const hasSteps = Array.isArray( form.steps ) && form.steps.length > 0
      const hasCategory = !!form.category
      return !( hasName || hasSteps || hasCategory )
    }
    let effectiveForm = templateForm.value
    const previous = restoreStateByKey( stableCacheKey.value )
    if ( formIsEmpty( effectiveForm ) && previous?.templateForm ) {
      console.warn( '[Designer] Avoiding empty-form save by using previous cached form for key:', stableCacheKey.value )
      effectiveForm = previous.templateForm
    }

    const currentState = {
      templateForm : effectiveForm,
      originalTemplate : originalTemplate.value,
      currentTemplate : currentTemplate.value,
      hasUnsavedChanges : hasUnsavedChanges.value,
      designerState : designerState.value
    }

    saveStateByKey(
      stableCacheKey.value,
      currentState,
      snapshotRoute(),
      currentTemplate.value?.id || currentTemplate.value?.template_id || route.params.id || null
    )
  }
} )

// Preview dialog event handlers
const handlePreviewOpen = () => {
  // Handle preview opened event
}

const handlePreviewClose = () => {
  showPreviewDialog.value = false
}

const handlePreviewPrint = () => {
  window.print()
}

// Change summary dialog handlers
const handleChangeSummaryConfirm = async() => {
  setChangeSummaryLoading( true )

  // Check if we're coming from a work order context
  const workOrderName = route.query.workOrderName
  const workOrderId = route.query.workOrderId

  try {
    if ( isStandaloneTask.value ) {
      // For standalone tasks, update the task in the work order draft store
      await performStandaloneSave()
      closeChangeSummaryDialog()
    } else if ( fromWorkOrder.value ) {
      // Close change summary dialog first
      closeChangeSummaryDialog()

      // Then show work order save confirmation dialog
      showWorkOrderSaveConfirmation( workOrderId, workOrderName )
    } else {
      // Regular flow - save directly
      await performSave( { mode : 'template', fromWorkOrderContext : false } )
      closeChangeSummaryDialog()
    }
  } catch ( error ) {
    // Error handling is already done in performSave
  } finally {
    setChangeSummaryLoading( false )
  }
}

const handleChangeSummaryCancel = () => {
  closeChangeSummaryDialog()
}

// Watch for route changes
watch(
  () => route.params.id,
  ( newId, oldId ) => {
    if ( newId === oldId ) return
    // In tagsView mode, avoid reacting while deactivated to prevent state bleed
    if ( settingsStore.tagsView && !isComponentActive.value ) {
      return
    }
    // Preemptively save current state before switching ids when active
    if ( settingsStore.tagsView && isComponentActive.value ) {
      // Avoid empty-form overwrite by reusing previously cached form if needed
      const formIsEmpty = form => {
        if ( !form || typeof form !== 'object' ) return true
        const hasName = typeof form.name === 'string' && form.name.trim().length > 0
        const hasSteps = Array.isArray( form.steps ) && form.steps.length > 0
        const hasCategory = !!form.category
        return !( hasName || hasSteps || hasCategory )
      }
      let effectiveForm = templateForm.value
      const previous = restoreStateByKey( stableCacheKey.value )
      if ( formIsEmpty( effectiveForm ) && previous?.templateForm ) {
        console.warn(
          '[Designer] Avoiding empty-form preemptive save by using previous cached form for key:',
          stableCacheKey.value
        )
        effectiveForm = previous.templateForm
      }

      const currentState = {
        templateForm : effectiveForm,
        originalTemplate : originalTemplate.value,
        currentTemplate : currentTemplate.value,
        hasUnsavedChanges : hasUnsavedChanges.value,
        designerState : designerState.value
      }
      saveStateByKey(
        stableCacheKey.value,
        currentState,
        snapshotRoute(),
        currentTemplate.value?.id || currentTemplate.value?.template_id || oldId || null
      )
      renderReady.value = false
    }
    if ( hasUnsavedChanges.value && !settingsStore.tagsView ) {
      pendingNavigation.value = () => initializeTemplate()
      showUnsavedDialog.value = true
    } else {
      initializeTemplate()
      renderReady.value = true
    }
  }
)

// Watch for TagsView setting changes
watch(
  () => settingsStore.tagsView,
  () => {
    // Recalculate heights when TagsView is toggled
    calculateDynamicHeights()
  },
  { immediate : false }
)

// Handle navigation guard for traditional routing (when tagViews is disabled)
onBeforeRouteLeave( ( to, from, next ) => {
  // Only show unsaved changes dialog when tagViews is disabled
  // When tagViews is enabled, users can navigate via tab clicks without losing context
  if ( !settingsStore.tagsView && hasUnsavedChanges.value ) {
    pendingNavigation.value = () => next()
    showUnsavedDialog.value = true
  } else {
    next()
  }
} )

defineOptions( {
  name : 'TemplateDesignerView'
} )
</script>

<style scoped>
.template-designer-view {
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 10px;
}

.back-button {
  color: #606266;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title-with-help {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.help-button {
  color: #909399 !important;
  font-size: 16px;
  padding: 4px;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.help-button:hover {
  color: #409eff !important;
}

.template-id-header {
  font-size: 12px;
  font-weight: 500;
  background-color: #f0f2f5;
  border-color: #d3d6db;
}

.unsaved-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.designer-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 320px;
  padding: 10px;
  overflow-y: auto;
  background: #f5f7fa;
}

/* Consistent scroll bar styling */
.left-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin-bottom: 10px;
  border-left: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
}

.right-panel {
  width: 360px;
  padding: 10px;
  background: #f5f7fa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metadata-card,
.validation-card {
  margin-bottom: 16px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.error-icon {
  color: #f56c6c;
  margin-right: 4px;
}

.metadata-form .el-form-item {
  margin-bottom: 18px;
}

.validation-list {
  margin: 0;
  padding-left: 10px;
}

.validation-error {
  color: #f56c6c;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.steps-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.steps-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.steps-actions {
  display: flex;
  align-items: center;
}

.reset-steps-btn {
  color: #909399;
  font-size: 16px;
  padding: 4px;
  margin: 0;
}

.reset-steps-btn:hover:not(.is-disabled) {
  color: #f56c6c;
  background-color: #fef0f0;
}

.reset-steps-btn.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.steps-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.steps-count {
  font-size: 14px;
  font-weight: 550;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.steps-container {
  flex: 1;
  overflow: hidden;
}

.steps-container.no-steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-steps {
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-content h4 {
  margin: 0 0 8px 0;
  color: #606266;
}

.empty-content p {
  margin: 0 0 16px 0;
  color: #909399;
}

::v-deep(.el-checkbox__input.is-disabled + span.el-checkbox__label) {
  color: #606266;
}

.steps-list {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

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

.steps-container {
  display: flex;
  flex-direction: column;
}

/* VueDraggable styles */
.step-ghost {
  opacity: 0.5;
}

.step-chosen {
  border-color: var(--el-color-primary);
}

.step-drag {
  opacity: 0.8;
}

/* Step card transition animations */
.step-card-move,
.step-card-enter-active,
.step-card-leave-active {
  transition: all 0.3s ease;
}

.step-card-enter-from,
.step-card-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.step-card-leave-active {
  position: absolute;
}

/* Step card drag over state */
.base-step-card.drag-over {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive design */
@media (max-width: 1200px) {
  .left-panel {
    width: 280px;
  }

  .right-panel {
    width: 320px;
  }
}

@media (max-width: 992px) {
  .designer-content {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    height: auto;
    max-height: 200px;
  }

  .center-panel {
    border: none;
  }
}

/* Global icon spacing for all Task Library buttons */
:deep(.el-button .el-icon) {
  margin-right: 3px !important;
  margin-bottom: 1px !important;
}

/* Card header with toggle button */
.card-header-with-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.toggle-button {
  font-size: 16px;
  padding: 4px 8px;
  color: #909399;
  position: relative;
  left: 10px;
}

.toggle-button:hover {
  color: #409eff;
}

.info-icon {
  color: #409eff;
  margin-right: 4px;
}

.success-icon {
  color: #67c23a;
  margin-right: 4px;
}

.no-issues {
  display: flex;
  align-items: center;
  color: #67c23a;
  font-size: 13px;
  padding: 8px 0;
}

.no-tips {
  color: #909399;
  font-size: 13px;
  font-style: italic;
  padding: 8px 0;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 4px;
  border-left: 2px solid;
  margin-bottom: 2px;
}

.tip-type {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
  text-transform: capitalize;
}

.tip-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* Loading states */
.panel-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.center-panel-loading {
  flex: 1;
  overflow: hidden;
}

/* Easter egg: Shake animation for disabled save button */
.shake-on-hover:hover {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(1px);
  }
}
</style>

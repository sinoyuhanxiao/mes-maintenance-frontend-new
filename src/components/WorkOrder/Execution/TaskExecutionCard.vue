<template>
  <div class="task-execution-card" :class="statusClass">
    <div class="card-header">
      <div class="header-left">
        <h3 class="task-title">{{ task.name || `Task ${indexLabel}` }}</h3>
        <StatusBadge :status="currentStatus" />
      </div>
      <div class="header-meta">ID: {{ task.id || 'N/A' }}</div>
    </div>

    <div class="card-section">
      <label class="section-label">Time Spent</label>
      <TaskTimeInput v-model="timeState" @change="handleTimeChange" />
    </div>

    <div class="card-section">
      <label class="section-label">Steps</label>
      <div v-if="stepList.length" class="steps-preview-container">
        <div v-for="(step, index) in stepList" :key="step.id || step.name || index" class="preview-step-simple">
          <div class="step-header">
            <div class="step-index">{{ index + 1 }}</div>
            <div class="step-info">
              <div class="step-name">{{ step.name || 'Step' }}</div>
              <div v-if="step.description" class="step-description">{{ step.description }}</div>
            </div>
            <el-tag v-if="step.required" size="small" type="danger" effect="plain">Required</el-tag>
          </div>

          <div class="step-config-preview">
            <component
              :is="getStepComponent(step)"
              :step="step"
              :model-value="stepProgressState[step.id || step.name]"
              :disabled="isCompleted"
              @update:modelValue="value => handleStepChange(step, value)"
            />
          </div>
        </div>
      </div>
      <el-empty v-else description="No steps available" :image-size="80" />
    </div>

    <div class="card-footer">
      <div class="timestamps" v-if="progress?.updated_at">
        <span>Last updated: {{ formatDate(progress.updated_at) }}</span>
      </div>
      <div class="actions">
        <el-button type="primary" plain size="small" :disabled="isCompleted" @click="handleSaveDraft">
          Save as Draft
        </el-button>
        <el-button type="primary" size="small" :disabled="isCompleted" @click="handleSubmit"> Submit </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import TaskTimeInput from './TaskTimeInput.vue'
import StatusBadge from '../Display/StatusBadge.vue'

import StepCheckbox from '@/components/TaskLibrary/components/preview/StepCheckbox.vue'
import StepBoolean from '@/components/TaskLibrary/components/preview/StepBoolean.vue'
import StepNumeric from '@/components/TaskLibrary/components/preview/StepNumeric.vue'
import StepText from '@/components/TaskLibrary/components/preview/StepText.vue'
import StepPassFail from '@/components/TaskLibrary/components/preview/StepPassFail.vue'
import StepFile from '@/components/TaskLibrary/components/preview/StepFile.vue'

const componentMap = {
  checklist : StepCheckbox,
  checkbox : StepCheckbox,
  boolean_field : StepBoolean,
  text_field : StepText,
  numeric_field : StepNumeric,
  pass_fail : StepPassFail,
  file_field : StepFile
}

const props = defineProps( {
  task : {
    type : Object,
    required : true
  },
  progress : {
    type : Object,
    default : () => ( {
      status : 'not_started',
      time_spent : { value : 0, unit : 'minutes' },
      step_progress : {}
    } )
  },
  index : {
    type : Number,
    default : 0
  }
} )

const emit = defineEmits( ['save-draft', 'submit', 'time-change', 'step-change'] )

const indexLabel = computed( () => props.index + 1 )

const stepList = computed( () => {
  if ( Array.isArray( props.task?.steps ) && props.task.steps.length ) return props.task.steps
  if ( Array.isArray( props.task?.payload?.steps ) ) return props.task.payload.steps
  return []
} )

const currentStatus = computed( () => props.progress?.status || 'draft' )
const isCompleted = computed( () => currentStatus.value === 'completed' )

const timeState = ref( {
  value : props.progress?.time_spent?.value ?? 0,
  unit : props.progress?.time_spent?.unit ?? 'minutes'
} )

const stepProgressState = reactive( { ...props.progress?.step_progress } )

watch(
  () => props.progress,
  value => {
    timeState.value = {
      value : value?.time_spent?.value ?? 0,
      unit : value?.time_spent?.unit ?? 'minutes'
    }
    Object.keys( stepProgressState ).forEach( key => delete stepProgressState[key] )
    Object.assign( stepProgressState, value?.step_progress || {} )
  }
)

watch(
  stepList,
  list => {
    list.forEach( step => {
      const key = step.id || step.name
      if ( key && !Object.prototype.hasOwnProperty.call( stepProgressState, key ) ) {
        stepProgressState[key] = props.progress?.step_progress?.[key] || 'todo'
      }
    } )
  },
  { immediate : true }
)

const statusClass = computed( () => `status-${currentStatus.value}` )

const getStepComponent = step => {
  const type = step.type || step.value?.type
  return componentMap[type] || StepText
}

const emitProgress = status => {
  const payload = {
    status,
    time_spent : { ...timeState.value },
    step_progress : { ...stepProgressState }
  }
  return payload
}

const handleTimeChange = value => {
  timeState.value = value
  emit( 'time-change', {
    taskId : props.task.id,
    value
  } )
}

const handleStepChange = ( step, newValue ) => {
  const key = step.id || step.name
  stepProgressState[key] = newValue
  emit( 'step-change', {
    taskId : props.task.id,
    stepId : key,
    value : newValue
  } )
}

const handleSaveDraft = () => {
  const payload = emitProgress( 'draft' )
  emit( 'save-draft', payload )
}

const handleSubmit = () => {
  const payload = emitProgress( 'completed' )
  emit( 'submit', payload )
}

const formatDate = value => {
  if ( !value ) return ''
  const date = new Date( value )
  if ( Number.isNaN( date.getTime() ) ) return ''
  return date.toLocaleString()
}
</script>

<style scoped>
.task-execution-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.status-completed {
  border-color: var(--el-color-success);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.steps-preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-step-simple {
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  background: #fff;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.step-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step-info {
  flex: 1;
}

.step-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.step-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.step-config-preview {
  padding-left: 40px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamps {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.actions {
  display: flex;
  gap: 8px;
}
</style>

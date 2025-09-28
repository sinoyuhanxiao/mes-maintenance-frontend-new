<template>
  <div class="steps-preview-container">
    <div v-for="(step, index) in steps" :key="step.id || index" class="preview-step-simple">
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
          :is="getComponent(step)"
          :step="step"
          :model-value="modelValues[stepKey(step)]"
          @update:modelValue="value => updateValue(step, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

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
  steps : {
    type : Array,
    default : () => []
  },
  modelValue : {
    type : Object,
    default : () => ( {} )
  }
} )

const emit = defineEmits( ['update:modelValue', 'step-change'] )

const modelValues = reactive( { ...props.modelValue } )

watch(
  () => props.modelValue,
  value => {
    Object.keys( modelValues ).forEach( key => delete modelValues[key] )
    Object.assign( modelValues, value || {} )
  }
)

const stepKey = step => step.id || step.name || JSON.stringify( step )

const getComponent = step => {
  const type = step.type || step.value?.type
  return componentMap[type] || StepText
}

const updateValue = ( step, value ) => {
  modelValues[stepKey( step )] = value
  emit( 'update:modelValue', { ...modelValues } )
  emit( 'step-change', { step, value } )
}
</script>

<style scoped>
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
</style>

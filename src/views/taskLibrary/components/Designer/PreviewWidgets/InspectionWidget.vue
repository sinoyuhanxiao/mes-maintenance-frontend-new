<template>
  <div class="inspection-widget">
    <div class="widget-content">
      <div v-if="step.ui.description" class="step-description">
        {{ step.ui.description }}
      </div>

      <div class="inspection-options">
        <el-button-group style="width: 100%">
          <el-button
            v-for="option in displayOptions"
            :key="option"
            :type="selectedOption === option ? getOptionType(option) : ''"
            :class="['inspection-option', `option-${option}`, { selected: selectedOption === option }]"
            @click="selectOption(option)"
            :disabled="!interactive"
            style="width: 50%"
          >
            <el-icon>
              <Check v-if="option === 'pass'" />
              <Close v-if="option === 'fail'" />
            </el-icon>
            {{ getOptionLabel(option) }}
          </el-button>
        </el-button-group>
      </div>

      <div v-if="selectedOption === 'fail' && step.ui.require_comment_on_fail" class="failure-comment">
        <el-input
          v-model="failureComment"
          type="textarea"
          placeholder="Please provide details about the failure..."
          :rows="2"
          :disabled="!interactive"
        />
      </div>

      <div v-if="selectedOption === 'fail' && step.ui.require_photo_on_fail" class="failure-photo">
        <el-upload :disabled="!interactive" action="#" :auto-upload="false" list-type="picture-card" accept="image/*">
          <el-icon><Plus /></el-icon>
          <template #tip>
            <div class="el-upload__tip">Photo evidence required for failures</div>
          </template>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check, Close, Plus } from '@element-plus/icons-vue'

const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  interactive : {
    type : Boolean,
    default : false
  },
  config : {
    type : Object,
    default : () => ( {
      options : ['pass', 'fail'],
      buttonStyle : 'pill'
    } )
  }
} )

const selectedOption = ref( props.step.ui.default || null )
const failureComment = ref( '' )

const displayOptions = computed( () => {
  // Always use only pass and fail options
  return ['pass', 'fail']
} )

const selectOption = option => {
  if ( props.interactive ) {
    selectedOption.value = option
  }
}

const getOptionLabel = option => {
  const labels = {
    pass : 'Pass',
    fail : 'Fail'
  }
  return labels[option] || option
}

const getOptionType = option => {
  const types = {
    pass : 'success',
    fail : 'danger'
  }
  return types[option] || 'primary'
}
</script>

<style scoped>
.inspection-widget {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafbfc;
  transition: all 0.2s;
}

.inspection-widget:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.step-description {
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.inspection-options {
  margin-bottom: 16px;
}

.inspection-option {
  margin-right: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.failure-comment,
.failure-photo {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.failure-photo :deep(.el-upload__tip) {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 4px;
}
</style>

<template>
  <el-dialog
    :model-value="visible"
    title="Configure Number Limits"
    width="480px"
    @update:model-value="$emit('close')"
    @close="$emit('close')"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
      <!-- Main Limit Values -->
      <div class="form-section">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Minimum Value" prop="lower">
              <el-input-number v-model="formData.lower" :precision="2" placeholder="No minimum" style="width: 100%" />
              <div class="help-text">Leave empty for no lower limit</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Maximum Value" prop="upper">
              <el-input-number v-model="formData.upper" :precision="2" placeholder="No maximum" style="width: 100%" />
              <div class="help-text">Leave empty for no upper limit</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Inclusion Options -->
      <div class="form-section" v-if="formData.lower !== null || formData.upper !== null">
        <el-row :gutter="16">
          <el-col :span="12" v-if="formData.lower !== null">
            <el-form-item>
              <el-checkbox v-model="formData.inclusive.lower"> Allow exactly {{ formData.lower }} </el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.upper !== null">
            <el-form-item>
              <el-checkbox v-model="formData.inclusive.upper"> Allow exactly {{ formData.upper }} </el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Preview -->
      <div class="form-section">
        <div class="section-title">Preview</div>
        <div class="preview-section">
          <div class="preview-text">{{ getPreviewText() }}</div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('close')">Cancel</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading" :disabled="!hasLimits">
          Save Limits
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps( {
  visible : {
    type : Boolean,
    default : false
  },
  stepId : {
    type : String,
    required : true
  },
  initialData : {
    type : Object,
    default : () => ( {} )
  },
  loading : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['save', 'close'] )

const formRef = ref( null )
const formData = reactive( {
  lower : null,
  upper : null,
  inclusive : {
    lower : true,
    upper : true
  }
} )

// Computed property to check if any limits are set
const hasLimits = computed( () => {
  return (
    ( formData.lower !== null && formData.lower !== undefined ) ||
    ( formData.upper !== null && formData.upper !== undefined )
  )
} )

const rules = {
  lower : [
    {
      validator : ( rule, value, callback ) => {
        if ( value !== null && formData.upper !== null && value >= formData.upper ) {
          callback( new Error( 'Lower limit must be less than upper limit' ) )
        } else {
          callback()
        }
      },
      trigger : 'change'
    }
  ],
  upper : [
    {
      validator : ( rule, value, callback ) => {
        if ( value !== null && formData.lower !== null && value <= formData.lower ) {
          callback( new Error( 'Upper limit must be greater than lower limit' ) )
        } else {
          callback()
        }
      },
      trigger : 'change'
    }
  ]
}

// Watch for initial data changes
watch(
  () => props.initialData,
  newData => {
    if ( newData ) {
      Object.assign( formData, {
        lower : newData.lower !== undefined ? newData.lower : null,
        upper : newData.upper !== undefined ? newData.upper : null,
        inclusive : {
          lower : newData.inclusive?.lower !== false,
          upper : newData.inclusive?.upper !== false
        }
      } )
    } else {
      // Reset to initial state when no data is provided
      Object.assign( formData, {
        lower : null,
        upper : null,
        inclusive : {
          lower : true,
          upper : true
        }
      } )
    }
  },
  { immediate : true }
)

const handleSave = async() => {
  try {
    await formRef.value.validate()

    const limitsData = {
      ...formData,
      lower : formData.lower,
      upper : formData.upper,
      show_limits_hint : true
    }

    emit( 'save', props.stepId, limitsData )
  } catch ( error ) {
    console.error( 'Number limits validation failed:', error )
  }
}

const getPreviewText = () => {
  const lower = formData.lower
  const upper = formData.upper
  const lowerIncl = formData.inclusive.lower
  const upperIncl = formData.inclusive.upper

  if ( lower === null && upper === null ) {
    return 'No limits set'
  }

  let text = ''

  if ( lower !== null ) {
    text += `${lowerIncl ? '≥' : '>'} ${lower}`
  }

  if ( upper !== null ) {
    if ( text ) text += ' and '
    text += `${upperIncl ? '≤' : '<'} ${upper}`
  }

  return text
}
</script>

<style scoped>
.number-limits-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 14px;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.inclusive-checkbox .el-form-item__content {
  justify-content: flex-end;
}

.el-divider {
  margin: 8px 0;
}

.preview-section {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.preview-text {
  font-weight: 500;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-radio) {
  display: block;
  margin-bottom: 8px;
}

:deep(.el-dialog__body) {
  margin-top: 100px !important;
}
</style>

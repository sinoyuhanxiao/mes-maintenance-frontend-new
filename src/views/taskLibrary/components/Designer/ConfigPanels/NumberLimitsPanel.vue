<template>
  <el-dialog :model-value="visible" title="Number Input Limits" width="500px" @update:model-value="$emit('close')" @close="$emit('close')">
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Lower Limit" prop="lower">
            <el-input-number v-model="formData.lower" :precision="2" placeholder="No minimum" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Upper Limit" prop="upper">
            <el-input-number v-model="formData.upper" :precision="2" placeholder="No maximum" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item>
            <el-checkbox v-model="formData.inclusive.lower"> Include lower limit </el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-checkbox v-model="formData.inclusive.upper"> Include upper limit </el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-checkbox v-model="formData.show_limits_hint"> Show limits hint to user </el-checkbox>
      </el-form-item>

      <el-form-item label="Out of Range Behavior">
        <el-radio-group v-model="formData.out_of_range_behavior">
          <el-radio label="allow_with_warning">Allow with warning</el-radio>
          <el-radio label="block_submission">Block submission</el-radio>
          <el-radio label="require_comment">Require comment</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- Preview -->
      <el-form-item label="Preview">
        <div class="preview-section">
          <div class="preview-text">Range: {{ getPreviewText() }}</div>
          <div class="preview-behavior">Behavior: {{ getBehaviorText() }}</div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('close')">Cancel</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading"> Save Limits </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

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
  },
  show_limits_hint : true,
  out_of_range_behavior : 'allow_with_warning'
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
        lower : newData.lower || null,
        upper : newData.upper || null,
        inclusive : {
          lower : newData.inclusive?.lower !== false,
          upper : newData.inclusive?.upper !== false
        },
        show_limits_hint : newData.show_limits_hint !== false,
        out_of_range_behavior : newData.out_of_range_behavior || 'allow_with_warning'
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
      upper : formData.upper
    }

    emit( 'save', props.stepId, limitsData )
  } catch ( error ) {
    console.error( 'Validation failed:', error )
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

const getBehaviorText = () => {
  const behaviors = {
    allow_with_warning : 'Allow input with warning message',
    block_submission : 'Block form submission',
    require_comment : 'Require explanatory comment'
  }

  return behaviors[formData.out_of_range_behavior] || 'Unknown'
}
</script>

<style scoped>
.preview-section {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.preview-text {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.preview-behavior {
  font-size: 12px;
  color: #606266;
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
</style>

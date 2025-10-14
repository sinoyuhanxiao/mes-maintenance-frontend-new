<template>
  <div class="step-pass-fail">
    <div class="pass-fail-buttons">
      <el-button
        :type="modelValue === 'pass' ? 'success' : 'default'"
        :disabled="disabled"
        size="small"
        @click="updateValue('pass')"
      >
        Pass
      </el-button>
      <el-button
        :type="modelValue === 'fail' ? 'danger' : 'default'"
        :disabled="disabled"
        size="small"
        @click="updateValue('fail')"
      >
        Fail
      </el-button>
    </div>
    <div v-if="step.description" class="step-description">
      {{ step.description }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps( {
  step : {
    type : Object,
    required : true
  },
  modelValue : {
    type : [String, Boolean],
    default : ''
  },
  disabled : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['update:modelValue'] )

const updateValue = value => {
  if ( !props.disabled ) {
    emit( 'update:modelValue', value )
  }
}
</script>

<style scoped>
.step-pass-fail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pass-fail-buttons {
  display: flex;
  gap: 8px;
}

.step-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  padding: 6px 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
</style>

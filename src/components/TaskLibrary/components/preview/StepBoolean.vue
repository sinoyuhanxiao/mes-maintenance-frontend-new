<template>
  <div class="step-boolean">
    <div class="boolean-buttons">
      <el-button
        :type="modelValue === true ? 'success' : 'default'"
        :disabled="disabled"
        size="small"
        @click="updateValue(true)"
      >
        Pass
      </el-button>
      <el-button
        :type="modelValue === false ? 'danger' : 'default'"
        :disabled="disabled"
        size="small"
        @click="updateValue(false)"
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
    type : [Boolean, String],
    default : null
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
.step-boolean {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.boolean-buttons {
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

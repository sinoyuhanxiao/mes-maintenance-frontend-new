<template>
  <div class="time-input">
    <el-input v-model="localValue" class="time-field" placeholder="0" @blur="handleBlur" @input="handleInput">
      <template #suffix>
        <span class="unit-label">{{ selectedUnitLabel }}</span>
      </template>
    </el-input>
    <el-select v-model="localUnit" class="unit-select" @change="handleUnitChange">
      <el-option v-for="unit in units" :key="unit.value" :label="unit.label" :value="unit.value" />
    </el-select>
    <p v-if="errorMessage" class="helper-text">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps( {
  modelValue : {
    type : Object,
    default : () => ( { value : '', unit : 'minutes' } )
  },
  units : {
    type : Array,
    default : () => [
      { label : 'Minutes', value : 'minutes' },
      { label : 'Hours', value : 'hours' },
      { label : 'Days', value : 'days' }
    ]
  }
} )

const emit = defineEmits( ['update:modelValue', 'change', 'invalid'] )

const localValue = ref( props.modelValue?.value ?? '' )
const localUnit = ref( props.modelValue?.unit ?? 'minutes' )
const errorMessage = ref( '' )

watch(
  () => props.modelValue,
  value => {
    if ( value ) {
      localValue.value = value.value ?? ''
      localUnit.value = value.unit ?? 'minutes'
    }
  }
)

const selectedUnitLabel = computed( () => {
  const option = props.units.find( unit => unit.value === localUnit.value )
  return option?.label ?? ''
} )

const emitValue = () => {
  const valueNumber = parseFloat( localValue.value )
  if ( Number.isNaN( valueNumber ) || valueNumber < 0 ) {
    errorMessage.value = 'Enter a valid non-negative number.'
    emit( 'invalid', { value : localValue.value, unit : localUnit.value } )
    return
  }
  errorMessage.value = ''
  const payload = { value : valueNumber, unit : localUnit.value }
  emit( 'update:modelValue', payload )
  emit( 'change', payload )
}

const handleInput = () => {
  errorMessage.value = ''
}

const handleBlur = () => {
  emitValue()
}

const handleUnitChange = () => {
  emitValue()
}
</script>

<style scoped>
.time-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-field {
  width: 160px;
}

.unit-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.unit-select {
  width: 120px;
}

.helper-text {
  margin: 0;
  font-size: 12px;
  color: var(--el-color-danger);
}
</style>

<template>
  <el-form ref="formRef" :model="internalShift" :rules="shiftFormRules" label-width="160px" class="two-col-form">
    <el-form-item prop="name" :label="t('common.name')">
      <el-input v-model="internalShift.name" />
    </el-form-item>

    <div class="form-row">
      <el-form-item class="full-width" prop="description" :label="t('common.description')">
        <el-input type="textarea" v-model="internalShift.description" />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item prop="start_time" :label="t('shift.startTime')">
        <el-time-picker v-model="internalShift.start_time" value-format="HH:mm:ss" />
      </el-form-item>

      <el-form-item prop="end_time" :label="t('shift.endTime')">
        <el-time-picker v-model="internalShift.end_time" value-format="HH:mm:ss" />
      </el-form-item>
    </div>
  </el-form>

  <div class="form-action-row">
    <el-button @click="emit('cancel')">{{ t('common.cancel') }}</el-button>
    <el-button type="warning" @click="handleResetForm">
      {{ t('workOrder.actions.reset') }}
    </el-button>
    <el-button type="primary" :disabled="internalShift.id && !isShiftEdited" @click="handleConfirmSubmit">
      {{ t('common.confirm') }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { createShift, updateShift } from '@/api/shift'

const props = defineProps( {
  shift : {
    type : Object,
    default : null
  }
} )

const { t } = useI18n()
const emit = defineEmits( ['confirm', 'cancel', 'update:loading'] )

const formRef = ref()
const submitting = ref( false )

const shiftFormRules = {
  name : [{ required : true, message : t( 'common.nameRequired' ), trigger : 'blur' }],
  start_time : [{ required : true, message : t( 'shift.startTimeRequired' ), trigger : 'change' }],
  end_time : [{ required : true, message : t( 'shift.endTimeRequired' ), trigger : 'change' }]
}

function createEmptyShift() {
  return {
    name : '',
    description : '',
    start_time : null,
    end_time : null
  }
}

const internalShift = ref( createEmptyShift() )
const originalShiftSnapshot = ref( null )

watch(
  () => props.shift,
  async shift => {
    if ( shift ) {
      internalShift.value = { ...createEmptyShift(), ...shift }
      originalShiftSnapshot.value = JSON.parse( JSON.stringify( internalShift.value ) )
    } else {
      internalShift.value = createEmptyShift()
      originalShiftSnapshot.value = null
    }

    await nextTick()
    formRef.value?.clearValidate()
  },
  { immediate : true }
)

async function handleResetForm() {
  try {
    await ElMessageBox.confirm( 'This will reset all fields to their original values. Continue?', 'Warning', {
      type : 'warning',
      confirmButtonText : t( 'common.confirm' ),
      cancelButtonText : t( 'common.cancel' ),
      distinguishCancelAndClose : true
    } )

    if ( originalShiftSnapshot.value === null ) {
      internalShift.value = createEmptyShift()
    } else {
      internalShift.value = JSON.parse( JSON.stringify( originalShiftSnapshot.value ) )
    }
    formRef.value.clearValidate()
  } catch {}
}

function buildCreateShiftPayload( entry ) {
  return {
    name : entry.name,
    description : entry.description,
    start_time : entry.start_time,
    end_time : entry.end_time,
    status : 1
  }
}

function buildUpdateShiftPayload( entry, original ) {
  const payload = {}
  if ( entry.name !== original.name ) payload.name = entry.name
  if ( entry.description !== original.description ) payload.description = entry.description
  if ( entry.start_time !== original.start_time ) {
    payload.start_time = entry.start_time
  }
  if ( entry.end_time !== original.end_time ) {
    payload.end_time = entry.end_time
  }
  return payload
}

const isShiftEdited = computed( () => {
  if ( !internalShift.value.id || !originalShiftSnapshot.value ) return true
  const payload = buildUpdateShiftPayload( internalShift.value, originalShiftSnapshot.value )
  return Object.keys( payload ).length > 0
} )

async function handleConfirmSubmit() {
  const isValid = await formRef.value.validate()
  if ( !isValid ) {
    return ElMessage.error( t( 'user.message.pleaseCorrectErrors' ) )
  }

  submitting.value = true
  emit( 'update:loading', true )

  try {
    const payload = internalShift.value.id
      ? buildUpdateShiftPayload( internalShift.value, originalShiftSnapshot.value )
      : buildCreateShiftPayload( internalShift.value )

    if ( internalShift.value.id ) {
      await updateShift( internalShift.value.id, payload )
      ElMessage.success( t( 'shift.message.updated' ) )
    } else {
      await createShift( payload )
      ElMessage.success( t( 'shift.message.created' ) )
    }

    emit( 'confirm' )
  } catch ( err ) {
    console.error( 'Error submitting shift form:', err )
    ElMessage.error( t( 'shift.message.shiftUpdatedFailed' ) )
  } finally {
    submitting.value = false
    emit( 'update:loading', false )
  }
}

// function formatTime( val ) {
//   if ( !val ) return null
//   console.log( formatTime )
//   const d = new Date( val )
//   const formatD = d.toLocaleTimeString( 'en-GB', { hour12 : false } )
//   console.log( formatTime )
//   return formatD
// }
</script>

<style scoped lang="scss">
.two-col-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.two-col-form .form-row .full-width {
  grid-column: span 2;
}

.form-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>

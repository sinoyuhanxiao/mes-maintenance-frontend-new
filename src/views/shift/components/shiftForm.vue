<template>
  <el-form :model="shift" ref="shiftFormRef" :rules="validationRules" label-width="170px">
    <template v-for="item in formItems" :key="item.prop">
      <el-form-item :label="item.label" :prop="item.prop" v-if="item.type === 'input'">
        <el-input v-model="shift[item.prop]" :placeholder="item.placeholder" :maxlength="item.maxlength" />
      </el-form-item>

      <el-form-item :label="item.label" :prop="item.prop" v-else-if="item.type === 'textarea'">
        <el-input type="textarea" v-model="shift[item.prop]" :placeholder="item.placeholder" />
      </el-form-item>
    </template>

    <el-row>
      <el-col :span="7">
        <el-form-item :label="t('shift.startTime')" prop="start_time">
          <el-time-picker v-model="shift.start_time" />
        </el-form-item>
      </el-col>

      <el-col :span="7">
        <el-form-item :label="t('shift.endTime')" prop="end_time">
          <el-time-picker v-model="shift.end_time" />
        </el-form-item>
      </el-col>

      <el-col :span="10">
        <el-form-item :label="t('shift.graceTimeMinute')">
          <el-input-number v-model="shift.grace_minute" :min="0" :max="120" style="margin-right: 10px" />
        </el-form-item>
      </el-col>
    </el-row>

    <div style="display: flex; justify-content: end">
      <el-button @click="emit('cancel')">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="validateAndSubmit">{{ t('common.confirm') }}</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
// import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const props = defineProps( {
  shift : { type : Object, required : true },
  isEditMode : { type : Boolean, required : true }
} )
const emit = defineEmits( ['submit', 'cancel'] )
const { t } = useI18n()

const shiftFormRef = ref( null )
defineExpose( { shiftFormRef } )

const shift = computed( () => toRef( props, 'shift' ).value )

const validationRules = {
  name : [{ required : true, message : t( 'common.nameRequired' ), trigger : 'blur' }],
  start_time : [{ required : true, message : t( 'shift.startTimeRequired' ), trigger : 'change' }],
  end_time : [{ required : true, message : t( 'shift.endTimeRequired' ), trigger : 'change' }]
}

const formItems = [
  {
    prop : 'name',
    label : t( 'common.name' ),
    placeholder : t( 'common.namePlaceholder' ),
    type : 'input',
    maxlength : 255
  },
  {
    prop : 'description',
    label : t( 'common.description' ),
    placeholder : t( 'common.descriptionPlaceholder' ),
    type : 'textarea'
  }
]

function validateAndSubmit() {
  shiftFormRef.value?.validate( valid => {
    if ( !valid ) return console.error( 'Form validation failed!' )

    const payload = { ...shift.value, status : 1 }
    // TODO: Add create/update by param later
    // const userId = store.getters.getUser?.id
    const now = new Date().toISOString()

    if ( payload.id == null ) {
      // payload.created_by = userId
      payload.created_at = now
    } else {
      // payload.updated_by = userId
      payload.updated_at = now
    }

    emit( 'submit', payload )
  } )
}
</script>

<style scoped></style>

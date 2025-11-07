<template>
  <el-dialog
    :title="isEdit ? `Edit Material Lot #${form.id}` : 'Add New Material Lot'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    width="560px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="180px">
      <el-form-item :label="'Location'" prop="location_id">
        <LocationTreeSelect v-model="form.location_id" :input-placeholder="'Select location'" :multiple="false" />
      </el-form-item>

      <el-form-item :label="'Units in lot'" prop="unit_in_stock">
        <el-input-number v-model="form.unit_in_stock" :min="0" value-on-clear="min" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">{{ t('common.cancel') }}</el-button>

      <el-button type="primary" @click="confirm">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LocationTreeSelect from '@/views/team/components/LocationTreeSelect.vue'

const props = defineProps( {
  modelValue : { type : Boolean, default : false },
  value : { type : Object, default : null } // existing lot for edit
} )

const emit = defineEmits( ['update:modelValue', 'save'] )
const { t } = useI18n()

// const visible = ref( false )
const formRef = ref()

const form = reactive( {
  id : null,
  location_id : [],
  unit_in_stock : 0,
  inventory_type_id : 3, // fixed to "spare part type"
  batch_number : null
} )

const rules = {
  location_id : [{ required : true, message : 'Location is required', trigger : 'change' }]
}

const isEdit = computed( () => !!form.id )

watch(
  () => props.modelValue,

  v => {
    if ( v ) {
      init()
    }
  }
)

watch(
  () => form.location_id,
  ( newVal, oldVal ) => {
    if ( !formRef.value ) {
      return
    }

    formRef.value.validateField( 'location_id' )
  }
)

function init() {
  Object.assign( form, {
    id : props.value?.id ?? null,
    location_id : props.value?.location_id
      ? [props.value.location_id] // normalize to array for LocationTreeSelect
      : [],
    unit_in_stock : props.value?.unit_in_stock ?? 0,
    inventory_type_id : 3,
    batch_number : props.value?.batch_number ?? null
  } )
}

function close() {
  emit( 'update:modelValue', false )
}

function confirm() {
  formRef.value.validate( valid => {
    if ( !valid ) {
      return
    }

    const normalizedLocationId = Array.isArray( form.location_id ) ? form.location_id[0] : form.location_id

    const payload = {
      ...form,
      location_id : normalizedLocationId
    }

    if ( props.value?._index != null ) {
      payload._index = props.value._index
    }

    emit( 'save', payload )
    close()
  } )
}
</script>

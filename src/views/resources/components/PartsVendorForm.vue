<template>
  <el-dialog
    :title="isEdit ? `Edit Parts Vendor` : 'Add Parts Vendor'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    width="560px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="160px">
      <el-form-item :label="'Vendor'" prop="vendor_id">
        <el-select v-model="form.vendor_id" filterable clearable>
          <el-option
            v-for="v in vendorOptions"
            :key="v.id"
            :label="v.name"
            :value="v.id"
            :disabled="isVendorDisabled(v.id)"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'Unit Price'" prop="unit_price">
        <div class="price-row">
          <el-input-number v-model="form.unit_price" :min="0" :precision="2" :step="0.01" value-on-clear="min" />

          <el-select
            v-model="form.price_uom_id"
            filterable
            placeholder="Select price currency"
            class="ml8"
            style="width: 120px"
          >
            <el-option v-for="unit in currencyUnitOptions" :key="unit.id" :label="unit.name" :value="unit.id" />
          </el-select>
        </div>
      </el-form-item>

      <el-form-item :label="'Lead Time Days'" prop="lead_time_days">
        <el-input-number v-model="form.lead_time_days" :min="1" value-on-clear="min" />
      </el-form-item>

      <el-form-item :label="'Ordering Part Number'" prop="order_code">
        <el-input v-model="form.order_code" />
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
import { searchVendors } from '@/api/vendor'
import { ElMessage } from 'element-plus'
import { getUnitByType } from '@/api/common'

const props = defineProps( {
  modelValue : { type : Boolean, default : false },
  value : { type : Object, default : null },
  selectedVendorIds : { type : Object, default : () => new Set() }
} )

const emit = defineEmits( ['update:modelValue', 'save'] )
const { t } = useI18n()
const formRef = ref()
const vendorOptions = ref( [] )
const currencyUnitOptions = ref( [] )

const form = reactive( getEmptyForm() )
const isEdit = computed( () => props.value && props.value._index != null )

const rules = {
  vendor_id : [{ required : true, message : 'Vendor is required', trigger : 'change' }]
}

watch(
  () => props.modelValue,
  async open => {
    if ( open ) {
      await Promise.all( [loadCurrencyUnits(), loadVendors()] )
      init()
    }
  }
)

function getEmptyForm() {
  return {
    vendor_id : null,
    order_code : '',
    lead_time_days : 1,
    unit_price : 0,
    price_uom_id : 23, // default with CAD currency uom_id
    _index : -1
  }
}

function init() {
  const data = {
    ...getEmptyForm(),
    ...( props.value || {} )
  }

  Object.assign( form, data )
}

function close() {
  emit( 'update:modelValue', false )
}

function confirm() {
  formRef.value.validate( valid => {
    if ( !valid ) {
      return
    }

    emit( 'save', { ...form } )
    close()
  } )
}

function isVendorDisabled( id ) {
  // allow editing the same vendor (when editing an existing record)
  const currentEditingId = props.value?.vendor_id

  return props.selectedVendorIds.has( id ) && id !== currentEditingId
}

async function loadVendors() {
  try {
    const response = await searchVendors( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    vendorOptions.value = response?.data?.content || []
    console.log( 'Loaded new data for vendorOptions. PartsVendorForm' )
  } catch ( err ) {
    console.error( 'Failed to load vendors:', err )
    ElMessage.error( 'Error loading vendors data' )
  }
}

async function loadCurrencyUnits() {
  try {
    // 11 is the monetary uom type id
    const response = await getUnitByType( 11 )
    currencyUnitOptions.value = response.data || []
    console.log( 'Loaded new data for currencyOptions. PartsVendorForm' )
  } catch ( e ) {
    console.error( 'Failed to load currency units:', e )
    ElMessage.error( 'Error loading currency unit data' )
  }
}
</script>

<style scoped>
.price-row {
  display: flex;
  align-items: center;
}

.ml8 {
  margin-left: 8px;
}
</style>

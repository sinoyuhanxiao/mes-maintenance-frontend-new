<template>
  <el-dialog
    :title="'Adjust Material Stock'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    width="750px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="lotTransactionFormValidationRules"
      label-width="180px"
      :validate-on-rule-change="false"
    >
      <el-form-item :label="'Adjustment Type'" prop="transaction_type_id">
        <el-select v-model="form.transaction_type_id" filterable>
          <el-option v-for="type in transactionTypeOptions" :key="type.id" :label="type.name" :value="type.id" />
        </el-select>

        <template v-if="selectedTransactionType">
          <el-text
            type="info"
            style="display: block; margin-top: 4px; font-size: 13px; color: var(--el-text-color-secondary)"
          >
            {{ selectedTransactionType.description }}
          </el-text>
        </template>
      </el-form-item>

      <!-- Conditional Fields -->
      <!-- Origin lot -->
      <el-form-item v-show="needsOrigin" label="Origin Lot" prop="inventory_from">
        <el-select v-model="form.inventory_from" placeholder="Select origin lot" clearable filterable>
          <!-- Custom label for selected item -->
          <template #label>
            <template v-if="form.inventory_from">
              <div style="display: flex; justify-content: space-between; width: 100%">
                <span>
                  {{ 'Lot #' + (lotOptions.find(l => l.id === form.inventory_from)?.id ?? '') }}
                </span>

                <span style="color: var(--el-text-color-secondary); font-size: 13px">
                  Stock:
                  {{ lotOptions.find(l => l.id === form.inventory_from)?.unit_in_stock ?? 0 }}
                </span>
              </div>
            </template>
          </template>

          <el-option
            v-for="lot in lotOptions"
            :key="lot.id"
            :label="lot.name"
            :value="lot.id"
            :disabled="shouldDisableOriginLot(lot)"
          >
            <template #default>
              <div style="display: flex; justify-content: space-between; width: 100%">
                <span>{{ 'Lot #' + lot.id }}</span>

                <span style="color: var(--el-text-color-secondary); font-size: 13px">
                  Stock: {{ lot.unit_in_stock ?? 0 }}
                </span>
              </div>
            </template>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- Destination Lot -->
      <el-form-item v-show="needsDestination" label="Destination Lot" prop="inventory_to">
        <el-select v-model="form.inventory_to" placeholder="Select destination lot" clearable filterable>
          <!-- Custom label for selected item -->
          <template #label>
            <template v-if="form.inventory_to">
              <div style="display: flex; justify-content: space-between; width: 100%">
                <span>
                  {{ 'Lot #' + (lotOptions.find(l => l.id === form.inventory_to)?.id ?? '') }}
                </span>

                <span style="color: var(--el-text-color-secondary); font-size: 13px">
                  Stock:
                  {{ lotOptions.find(l => l.id === form.inventory_to)?.unit_in_stock ?? 0 }}
                </span>
              </div>
            </template>
          </template>

          <el-option
            v-for="lot in lotOptions"
            :key="lot.id"
            :label="lot.name"
            :value="lot.id"
            :disabled="shouldDisableDestinationLot(lot)"
          >
            <template #default>
              <div style="display: flex; justify-content: space-between; width: 100%">
                <span>{{ 'Lot #' + lot.id }}</span>

                <span style="color: var(--el-text-color-secondary); font-size: 13px">
                  Stock: {{ lot.unit_in_stock ?? 0 }}
                </span>
              </div>
            </template>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="'Quantity'" prop="quantity">
        <template #label>
          Quantity
          <el-text type="info" style="margin-left: 8px; font-size: 12px; color: var(--el-text-color-secondary)">
            (Max: {{ quantityMax }})
          </el-text>
        </template>

        <el-input-number v-model="form.quantity" :min="1" :max="quantityMax" value-on-clear="min" />
      </el-form-item>

      <el-form-item :label="'Remark'" prop="remark">
        <el-input type="textarea" v-model="form.remark" :autosize="{ minRows: 2, maxRows: 6 }" />
      </el-form-item>

      <el-form-item label="Result Preview">
        <div v-if="resultPreview">
          <el-text
            v-if="resultPreview?.message"
            type="info"
            style="
              display: block;
              margin-top: 6px;
              white-space: pre-line;
              font-size: 13px;
              line-height: 1.6;
              color: var(--el-text-color-secondary);
            "
          >
            {{ resultPreview.message }}
          </el-text>

          <template v-if="resultPreview.direction === 'transfer'">
            <div class="preview-line">
              <strong>{{ resultPreview.from.name + ' Stock : ' }}</strong>

              <span style="color: var(--el-color-danger)">
                {{ resultPreview.from.before }} → {{ resultPreview.from.after }}
              </span>
            </div>

            <div class="preview-line">
              <strong>{{ resultPreview.to.name + ' Stock : ' }}</strong>

              <span style="color: var(--el-color-success)">
                {{ resultPreview.to.before }} → {{ resultPreview.to.after }}
              </span>
            </div>
          </template>

          <template v-else-if="resultPreview.to">
            <div class="preview-line">
              <strong>{{ resultPreview.to.name + ' Stock : ' }}</strong>

              <span
                :style="{
                  color: resultPreview.direction === 'increase' ? 'var(--el-color-success)' : 'var(--el-color-danger)',
                }"
              >
                {{ resultPreview.to.before }} → {{ resultPreview.to.after }}
              </span>
            </div>
          </template>
        </div>

        <div v-else style="color: var(--el-text-color-placeholder)">Fill in transaction details to preview result.</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">{{ t('common.cancel') }}</el-button>

      <el-button type="primary" @click="confirm">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  consumeInventory,
  getAllTransactionTypes,
  receivedInventory,
  searchInventory,
  transferInventory
} from '@/api/resources'
import { ElMessage } from 'element-plus'

const props = defineProps( {
  modelValue : { type : Boolean, default : false }, // dialog visibility
  material_id : { type : Number, required : true },
  material_name : { type : String, required : true }
} )

const emit = defineEmits( ['update:modelValue', 'save', 'lot-transaction-submitted'] )
const { t } = useI18n()

const formRef = ref()
const lotOptions = ref( [] )
const TRANSACTION_TYPE = ref( {} )
const transactionTypeOptions = ref( [] )
const quantityMax = ref( 9999 )

const form = reactive( getEmptyTransactionForm() )

const lotTransactionFormValidationRules = computed( () => {
  const tType = TRANSACTION_TYPE.value
  const isTransfer = form.transaction_type_id === tType.MOVE_BETWEEN_LOTS

  // Rules for Transfer type
  const transferRules = {
    transaction_type_id : [{ required : true, message : 'Transaction type is required', trigger : 'change' }],
    inventory_from : [{ required : true, message : 'Origin lot is required', trigger : 'change' }],
    inventory_to : [{ required : true, message : 'Destination lot is required', trigger : 'change' }],
    quantity : [{ required : true, message : 'Quantity is required', trigger : 'blur' }]
  }

  // Rules for all other types
  const normalRules = {
    transaction_type_id : [{ required : true, message : 'Transaction type is required', trigger : 'change' }],
    inventory_to : [{ required : true, message : 'Destination lot is required', trigger : 'change' }],
    quantity : [{ required : true, message : 'Quantity is required', trigger : 'blur' }]
  }

  return isTransfer ? transferRules : normalRules
} )

// hardcoded 104 is transfer transaction type id as no crud provided on
const needsOrigin = computed( () => {
  const t = TRANSACTION_TYPE.value

  if ( !t.MOVE_BETWEEN_LOTS ) {
    return false
  }

  return form.transaction_type_id === t.MOVE_BETWEEN_LOTS
} )

const needsDestination = computed( () => {
  const t = TRANSACTION_TYPE.value

  if ( t.length <= 0 ) {
    return false
  }

  return [t.RECEIVE_FROM_VENDOR, t.RETURN_TO_VENDOR, t.USE_IN_MAINTENANCE, t.DISCARD, t.MOVE_BETWEEN_LOTS].includes(
    form.transaction_type_id
  )
} )

const selectedTransactionType = computed( () => {
  return transactionTypeOptions.value.find( type => type.id === form.transaction_type_id )
} )

watch(
  () => props.modelValue,

  v => {
    if ( v ) {
      init()
    }
  }
)

// Reset inventory selection when type is changed
watch(
  () => form.transaction_type_id,
  async v => {
    form.inventory_from = null
    form.inventory_to = null

    await nextTick()
    formRef.value?.clearValidate( ['inventory_to', 'inventory_from'] )
  }
)

watch(
  [() => form.transaction_type_id, () => form.invenotry_form, () => form.inventory_to],
  () => {
    const t = TRANSACTION_TYPE.value
    const type = form.transaction_type_id
    const fromLot = lotOptions.value.find( lot => lot.id === form.inventory_from )
    const toLot = lotOptions.value.find( lot => lot.id === form.inventory_to )

    // Set a arbitrary max limit
    let max = 9999

    if ( type === t.MOVE_BETWEEN_LOTS && fromLot ) {
      max = fromLot.unit_in_stock ?? 1
    }

    if ( [t.RETURN_TO_VENDOR, t.DISCARD, t.USE_IN_MAINTENANCE].includes( type ) && toLot ) {
      max = toLot.unit_in_stock ?? 1
    }

    quantityMax.value = Math.max( 1, max )

    // If quantity exceeds new max, clamp it
    if ( form.quantity > quantityMax.value ) {
      form.quantity = quantityMax.value
    }
  },
  { immediate : true }
)

async function init() {
  await loadTransactionType()
  await loadMaterialLots( props.material_id )

  Object.assign( form, getEmptyTransactionForm() )
}

function getEmptyTransactionForm() {
  return {
    transaction_type_id : null,
    inventory_from : null,
    inventory_to : null,
    quantity : 0,
    remark : null
  }
}

function close() {
  emit( 'update:modelValue', false )
}

async function confirm() {
  await nextTick()

  formRef.value.validate( async valid => {
    if ( !valid ) {
      return
    }

    const now = new Date().toISOString()
    const type = form.transaction_type_id
    const t = TRANSACTION_TYPE.value

    // Base payload common to all
    const basePayload = {
      transaction_type_id : type,
      quantity : form.quantity,
      remark : form.remark
    }

    try {
      if ( type === t.RECEIVE_FROM_VENDOR ) {
        await receivedInventory( {
          ...basePayload,
          inventory_id : form.inventory_to,
          received_date : now
        } )
      } else if ( type === t.MOVE_BETWEEN_LOTS ) {
        await transferInventory( {
          ...basePayload,
          transfer_from_id : form.inventory_from,
          transfer_to_id : form.inventory_to,
          transfer_date : now
        } )
      } else {
        // Covers Consumption, Return, Discard, etc.
        await consumeInventory( {
          ...basePayload,
          inventory_id : form.inventory_to,
          consumed_date : now
        } )
      }

      ElMessage.success( 'Transaction recorded successfully.' )
      emit( 'lot-transaction-submitted', props.material_id )
      close()
    } catch ( error ) {
      console.error( 'Transaction failed:', error )
      ElMessage.error( 'Failed to record transaction. Please try again.' )
    }
  } )
}

function shouldDisableOriginLot( lot ) {
  const t = TRANSACTION_TYPE.value
  const type = form.transaction_type_id

  // disable same as destination lot or when stock == 0 in transfer mode
  if ( lot.id === form.inventory_to ) {
    return true
  }

  // Disable empty stock lot to be select as origin lot for transfer type
  return type === t.MOVE_BETWEEN_LOTS && ( lot.unit_in_stock ?? 0 ) <= 0
}

function shouldDisableDestinationLot( lot ) {
  const t = TRANSACTION_TYPE.value
  const type = form.transaction_type_id

  // disable same as origin lot
  if ( lot.id === form.inventory_from ) {
    return true
  }

  // disable 0-stock lots for return/discard/use-in-maintenance
  return [t.RETURN_TO_VENDOR, t.DISCARD, t.USE_IN_MAINTENANCE].includes( type ) && ( lot.unit_in_stock ?? 0 ) <= 0
}

async function loadMaterialLots( material_id ) {
  try {
    const res = await searchInventory( 1, 1000, 'id', 'ASC', {
      material_id
    } )

    lotOptions.value = res.data.content.filter( inventory => inventory.status === 1 ) || []
  } catch ( e ) {
    console.error( 'Failed to load material lots: ', e )
    ElMessage.error( 'Error loading material lots' )
  }
}

async function loadTransactionType() {
  try {
    const res = await getAllTransactionTypes()
    // Prevent create/update transaction type to be selected
    const types = res.data.filter( type => type.status === 1 && ![106, 107].includes( type.id ) )

    transactionTypeOptions.value = types

    // Build runtime enum-like map
    TRANSACTION_TYPE.value = Object.fromEntries(
      types.map( t => [
        t.name.toUpperCase().replace( /\s+/g, '_' ), // e.g. "Receive From Vendor" → "RECEIVE_FROM_VENDOR"
        t.id
      ] )
    )
  } catch ( e ) {
    console.error( 'Failed to load transaction type: ', e )
    ElMessage.error( 'Error loading transaction types' )
  }
}

// Computed preview for before/after stock levels
const resultPreview = computed( () => {
  if ( !form.transaction_type_id || !form.quantity ) {
    return null
  }

  const t = TRANSACTION_TYPE.value
  const qty = Number( form.quantity ) || 0
  const itemName = props.material_name || 'selected material'

  const fromLot = lotOptions.value.find( l => l.id === form.inventory_from )
  const toLot = lotOptions.value.find( l => l.id === form.inventory_to )

  // Initialize preview result
  const result = {
    from : null,
    to : null,
    direction : '',
    message : ''
  }

  switch ( form.transaction_type_id ) {
    case t.RECEIVE_FROM_VENDOR:
      if ( toLot ) {
        result.to = {
          name : `Lot #${toLot.id}`,
          before : toLot.unit_in_stock ?? 0,
          after : ( toLot.unit_in_stock ?? 0 ) + qty
        }
        result.direction = 'increase'
        result.message = `You’re about to receive ${qty} units of “${itemName}” into ${result.to.name}.`
      }
      break

    case t.RETURN_TO_VENDOR:
      if ( toLot ) {
        result.to = {
          name : `Lot #${toLot.id}`,
          before : toLot.unit_in_stock ?? 0,
          after : Math.max( ( toLot.unit_in_stock ?? 0 ) - qty, 0 )
        }
        result.direction = 'decrease'
        result.message = `You’re about to return ${qty} units of “${itemName}” from ${result.to.name}.`
      }
      break

    case t.USE_IN_MAINTENANCE:
      if ( toLot ) {
        result.to = {
          name : `Lot #${toLot.id}`,
          before : toLot.unit_in_stock ?? 0,
          after : Math.max( ( toLot.unit_in_stock ?? 0 ) - qty, 0 )
        }
        result.direction = 'decrease'
        result.message = `You’re about to use ${qty} units of “${itemName}” from ${result.to.name}.`
      }
      break

    case t.DISCARD:
      if ( toLot ) {
        result.to = {
          name : `Lot #${toLot.id}`,
          before : toLot.unit_in_stock ?? 0,
          after : Math.max( ( toLot.unit_in_stock ?? 0 ) - qty, 0 )
        }
        result.direction = 'decrease'
        result.message = `You’re about to discard ${qty} units of “${itemName}” from ${result.to.name}.`
      }
      break

    case t.MOVE_BETWEEN_LOTS:
      if ( fromLot && toLot ) {
        result.from = {
          name : `Lot #${fromLot.id}`,
          before : fromLot.unit_in_stock ?? 0,
          after : Math.max( ( fromLot.unit_in_stock ?? 0 ) - qty, 0 )
        }
        result.to = {
          name : `Lot #${toLot.id}`,
          before : toLot.unit_in_stock ?? 0,
          after : ( toLot.unit_in_stock ?? 0 ) + qty
        }
        result.direction = 'transfer'
        result.message =
          `You’re about to move ${qty} units of “${itemName}” ` +
          `from ${result.from.name} ` +
          `to   ${result.to.name}.`
      }
      break

    default:
      return null
  }

  return result
} )

onMounted( () => {
  loadTransactionType()
} )
</script>

<style scoped>
.preview-line {
  display: flex;
  justify-content: flex-start;
  font-size: 14px;
  gap: 10px;
}
</style>

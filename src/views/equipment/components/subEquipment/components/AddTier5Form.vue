<template>
  <div class="t5-create-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
      <!-- Spare Part -->
      <!-- CREATE: show searchable select -->
      <el-form-item v-if="mode === 'create'" class="col-span-2" label="Spare Part" prop="sparePart">
        <el-select
          v-model="form.sparePart"
          value-key="id"
          filterable
          remote
          clearable
          placeholder="Search among all spare parts by name or part code"
          :remote-method="searchSparePartsDebounced"
          :loading="loading.parts"
          style="width: 100%"
          @visible-change="v => v && searchSparePartsViaApi('')"
        >
          <template #empty>
            <div class="empty-select">
              <el-empty :image-size="48" description="No spare parts found" />
            </div>
          </template>

          <el-option
            v-for="item in sparePartOptions"
            :key="item.id"
            :label="item.title + (item.partNumber ? ' — ' + item.partNumber : '')"
            :value="item"
          >
            <div class="option-row">
              <div class="option-title">{{ item.title }}</div>
              <div class="option-sub" v-if="item.partNumber">{{ item.partNumber }}</div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- EDIT: hide the select; show read-only name -->
      <el-form-item v-else class="col-span-2" label="Spare Part">
        <el-input :model-value="form.sparePart?.title || form.title || ''" disabled placeholder="(no name)" />
      </el-form-item>

      <el-row :gutter="16" class="details-grid col-span-2">
        <!-- Part Code (greyed out in edit) -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Part Code" prop="partNumber">
            <el-input
              v-model="form.partNumber"
              :disabled="mode === 'edit'"
              :readonly="mode !== 'create'"
              placeholder="Auto filled from selection"
            />
          </el-form-item>
        </el-col>
        <!-- Position (integer) -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Position Code" prop="deviceTagPositionCode">
            <el-input-number
              v-model="form.deviceTagPositionCode"
              :min="1"
              :max="999999"
              :step="1"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>

        <!-- Quantity -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Quantity" prop="deviceQuantity">
            <el-input-number v-model="form.deviceQuantity" :min="1" :max="9999" controls-position="right" />
          </el-form-item>
        </el-col>

        <!-- Suggested -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Vendor Suggested Service Days" prop="suggestedServiceDays">
            <el-input-number v-model="form.suggestedServiceDays" :min="0" :max="36500" controls-position="right" />
          </el-form-item>
        </el-col>

        <!-- Estimated -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Estimated Service Days" prop="estimatedServiceDays">
            <el-input-number v-model="form.estimatedServiceDays" :min="0" :max="36500" controls-position="right" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Installation Date" prop="lastInstallmentTime">
            <el-date-picker
              v-model="form.lastInstallmentTime"
              type="date"
              placeholder="Select date"
              style="width: 100%"
              :disabled-date="d => d.getTime() > Date.now() + 1000 * 3600 * 24 * 365 * 10"
            />
          </el-form-item>
        </el-col>

        <!-- Auto Trigger -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <el-form-item label="Is Auto Trigger" prop="autoTriggerCycle">
            <el-segmented v-model="form.autoTriggerCycle" :options="['Yes', 'No']" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Actions -->
      <div class="footer-actions col-span-2">
        <el-button @click="$emit('close')">Cancel</el-button>
        <el-button type="primary" :loading="loading.submit" @click="onSubmit">
          {{ mode === 'edit' ? 'Save' : 'Create' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { searchSpareParts } from '@/api/resources'
import { createNewNode, editEquipmentNode } from '@/api/equipment.js'
import { ElMessage } from 'element-plus'

/** Props & Emits */
const props = defineProps( {
  tier4Id : { type : [Number, String], required : true },
  parentId : { type : [Number, String], default : null },
  mode : { type : String, default : 'create' }, // 'create' | 'edit'
  initial : { type : Object, default : null }
} )
const emit = defineEmits( ['close', 'success'] )

/** State */
const formRef = ref()
const form = reactive( {
  sparePart : null, // { id, title, partNumber, raw }
  partNumber : '', // display-only (from sparePart)
  deviceTagPositionCode : 0, // NUMBER now (used for sequence_order)
  deviceQuantity : 0,
  suggestedServiceDays : 0,
  estimatedServiceDays : 0,
  autoTriggerCycle : 'No', // 'Yes' | 'No'
  lastInstallmentTime : null // Date
} )

/** Validation (conditional) */
const rules = computed( () => ( {
  sparePart :
    props.mode === 'create' ? [{ required : true, message : 'Please choose a spare part', trigger : 'change' }] : [],
  partNumber : [{ required : true, message : 'Part # is required', trigger : 'blur' }]
} ) )

const loading = reactive( { parts : false, submit : false } )
const sparePartOptions = ref( [] )

/** Keep Part # synced from selection ONLY in create mode */
watch(
  () => form.sparePart,
  sp => {
    if ( props.mode !== 'create' ) return
    if ( sp?.partNumber ) form.partNumber = form.partNumber || sp.partNumber
  }
)

/** --- Remote API search (POST with { keyword }) --- */
async function searchSparePartsViaApi( keyword = '' ) {
  if ( props.mode !== 'create' ) return // no calls in edit mode
  loading.parts = true
  try {
    const resp = await searchSpareParts( 1, 10, 'name', 'ASC', { keyword } )
    const payload = resp?.data ?? resp
    const rows = payload?.data?.content ?? payload?.content ?? payload?.list ?? []
    sparePartOptions.value = rows.map( it => ( {
      id : it.id,
      title : it.name ?? it.title ?? it.partName ?? String( it.id ),
      partNumber : it.code ?? it.partNumber ?? '',
      raw : it
    } ) )
  } catch ( e ) {
    console.error( 'Spare parts search failed:', e )
    sparePartOptions.value = []
  } finally {
    loading.parts = false
  }
}

// Inline UUID generator (uses crypto.randomUUID when available)
function buildNodeCode() {
  if ( globalThis.crypto?.randomUUID ) return crypto.randomUUID()

  // RFC4122 v4 fallback
  const bytes = new Uint8Array( 16 )
  if ( globalThis.crypto?.getRandomValues ) {
    crypto.getRandomValues( bytes )
  } else {
    for ( let i = 0; i < 16; i++ ) bytes[i] = ( Math.random() * 256 ) | 0
  }
  bytes[6] = ( bytes[6] & 0x0f ) | 0x40 // version 4
  bytes[8] = ( bytes[8] & 0x3f ) | 0x80 // variant 10

  const hex = [...bytes].map( b => b.toString( 16 ).padStart( 2, '0' ) )
  return `${hex.slice( 0, 4 ).join( '' )}-${hex.slice( 4, 6 ).join( '' )}-${hex.slice( 6, 8 ).join( '' )}-${hex
    .slice( 8, 10 )
    .join( '' )}-${hex.slice( 10 ).join( '' )}`
}

/** Debounce wrapper for Element Plus remote method */
let partsTimer = null
function searchSparePartsDebounced( q ) {
  if ( props.mode !== 'create' ) return
  clearTimeout( partsTimer )
  partsTimer = setTimeout( () => searchSparePartsViaApi( q || '' ), 250 )
}

/** --------- PREFILL FROM props.initial (edit mode) ---------- */
function hydrateFromInitial( v ) {
  if ( !v ) return

  // Normalize spare part for the select / display
  const sp = v.sparePart ?? {
    id : v.spare_part_id ?? v.spare_part_definition_id ?? v.sparePartId ?? v.spare_part_definition?.id ?? null,
    title : v.title ?? v.name ?? '',
    partNumber : v.partNumber ?? v.part_number ?? v.code ?? '',
    raw : v.spare_part_definition ?? null
  }

  // If create mode and we have a part, seed the options so the select shows label
  if ( props.mode === 'create' && sp?.id && !sparePartOptions.value.some( o => o.id === sp.id ) ) {
    sparePartOptions.value = [sp, ...sparePartOptions.value]
  }

  form.sparePart = sp ?? null
  form.partNumber = v.partNumber ?? v.part_number ?? v.code ?? sp?.partNumber ?? ''

  // Position from any known field; default 0
  form.deviceTagPositionCode = Number(
    v.deviceTagPositionCode ?? v.device_tag_position_code ?? v.sequence_order ?? v.sequenceOrder ?? 0
  )

  form.deviceQuantity = Number( v.deviceQuantity ?? v.device_quantity ?? v.spare_part_quantity ?? 0 )
  form.suggestedServiceDays = Number(
    v.suggestedServiceDays ?? v.suggested_service_days ?? v.suggested_maintenance_interval_days ?? 0
  )
  form.estimatedServiceDays = Number(
    v.estimatedServiceDays ?? v.estimated_service_days ?? v.estimated_maintenance_interval_days ?? 0
  )
  form.autoTriggerCycle =
    v.autoTriggerCycle ?? ( v.is_auto_trigger === true ? 'Yes' : v.is_auto_trigger === false ? 'No' : 'No' )

  const last =
    v.lastInstallmentTime ?? v.last_installment_time ?? v.last_maintenance_date ?? v.installation_date ?? null
  form.lastInstallmentTime = last ? ( last instanceof Date ? last : new Date( last ) ) : null
}
watch(
  () => props.initial,
  v => hydrateFromInitial( v ),
  { immediate : true }
)

/** Submit */
const onSubmit = async() => {
  await formRef.value.validate()
  loading.submit = true
  try {
    const position = Number.isInteger( form.deviceTagPositionCode ) ? form.deviceTagPositionCode : 1
    const autoTriggerBool = String( form.autoTriggerCycle ).toLowerCase() === 'yes'
    const installIso = form.lastInstallmentTime ? new Date( form.lastInstallmentTime ).toISOString() : null

    // pull from selected spare part
    const spId = form.sparePart?.id
    const spName = form.sparePart?.title || form.sparePart?.raw?.name || ''
    const spCode = form.sparePart?.partNumber || form.sparePart?.raw?.code || form.partNumber || ''

    let submissionData

    if ( props.mode === 'create' ) {
      if ( !spId || !spName || !spCode ) {
        throw new Error( 'Please select a spare part with valid name & code' )
      }

      submissionData = {
        // REQUIRED by backend on CREATE
        name : spName,
        code : buildNodeCode(), // ← random UUID now

        // placement
        node_type_id : 7,
        parent_id : Number( props.tier4Id ),

        // link to master spare part
        spare_part_id : spId,

        // non-unique SKU-like field (still echo the spare part code if you want)
        part_number : spCode,

        // position / quantity / intervals / flags / dates
        sequence_order : position,
        sequenceOrder : position,
        spare_part_quantity : Number( form.deviceQuantity ),
        suggested_maintenance_interval_days : Number( form.suggestedServiceDays ),
        estimated_maintenance_interval_days : Number( form.estimatedServiceDays ),
        is_auto_trigger : autoTriggerBool,
        installation_date : installIso
      }

      const resp = await createNewNode( submissionData )
      ElMessage.success( 'Tier-5 spare part created!' )
      emit( 'success', resp?.data ?? submissionData )
      emit( 'close' )
    } else {
      // EDIT: do NOT send name/code to avoid collisions or unintended changes
      submissionData = {
        sequence_order : position,
        sequenceOrder : position,
        spare_part_quantity : Number( form.deviceQuantity ),
        suggested_maintenance_interval_days : Number( form.suggestedServiceDays ),
        estimated_maintenance_interval_days : Number( form.estimatedServiceDays ),
        is_auto_trigger : autoTriggerBool,
        installation_date : installIso
        // omit spare_part_id unless you intentionally want to relink
        // omit name/code on edit
      }

      const resp = await editEquipmentNode( props.initial.id, submissionData )
      ElMessage.success( 'Tier-5 spare part updated!' )
      emit( 'success', resp?.data ?? submissionData )
      emit( 'close' )
    }
  } catch ( e ) {
    console.error( e )
    ElMessage.error(
      e?.message ||
        ( props.mode === 'edit' ? 'Failed to update Tier-5 spare part' : 'Failed to create Tier-5 spare part' )
    )
  } finally {
    loading.submit = false
  }
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.col-span-2 {
  grid-column: 1 / -1;
}
.footer-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.option-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.option-title {
  font-weight: 500;
}
.option-sub {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
.empty-select {
  padding: 8px 0;
}
@media (min-width: 1280px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

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
          placeholder="Search by spare part name, code, or inventory code"
          :remote-method="searchSparePartsDebounced"
          :loading="loading.parts"
          style="width: 100%"
          popper-class="sp-parts-popper"
          @visible-change="onSelectVisibleChange"
        >
          <template #empty>
            <div class="empty-select">
              <el-empty :image-size="48" :description="searchState.q ? 'No matches' : 'Type to search'" />
            </div>
          </template>

          <el-option
            v-for="item in sparePartOptions"
            :key="item.id"
            :label="`${item.title}${item.partNumber ? ' — ' + item.partNumber : ''}${
              item.universalCode ? ' — ' + item.universalCode : ''
            }`"
            :value="item"
          >
            <div class="option-row">
              <div class="option-title">{{ item.title }}</div>
              <div class="option-sub">
                <template v-if="item.partNumber">code: {{ item.partNumber }}</template>
                <template v-if="item.universalCode">
                  <span v-if="item.partNumber"> | </span>inventory code: {{ item.universalCode }}
                </template>
              </div>
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

        <!-- Vendor Suggested -->
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

        <!-- Install Date -->
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
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { searchSpareParts } from '@/api/resources'
import { createNewNode, editEquipmentNode } from '@/api/equipment.js'

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
  sparePart : null, // { id, title, partNumber, universalCode, raw }
  partNumber : '', // display-only (from sparePart)
  deviceTagPositionCode : 0,
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

/** Loading flags */
const loading = reactive( { parts : false, submit : false } )

/** Options list */
const sparePartOptions = ref( [] )

/** Keep Part # synced from selection ONLY in create mode */
watch(
  () => form.sparePart,
  sp => {
    if ( props.mode !== 'create' ) return
    if ( sp?.partNumber ) form.partNumber = form.partNumber || sp.partNumber
  }
)

/** ---------- Infinite-scroll search (unknown total) ---------- */
const PAGE_SIZE = 50 // tune as needed
const searchState = reactive( {
  q : '',
  page : 1,
  hasMore : false,
  seq : 0 // anti-race token
} )
const seenIds = new Set()

// Core fetch (append=false resets, append=true loads next page)
async function fetchSpareParts( { append } = { append : false } ) {
  if ( !searchState.q ) {
    sparePartOptions.value = []
    searchState.hasMore = false
    return
  }

  const mySeq = ++searchState.seq
  loading.parts = true
  try {
    const resp = await searchSpareParts( searchState.page, PAGE_SIZE, 'name', 'ASC', { keyword : searchState.q } )

    // Ignore if a newer request started afterward (user typed again)
    if ( mySeq !== searchState.seq ) return

    const payload = resp?.data ?? resp
    const rows = payload?.data?.content ?? payload?.content ?? payload?.list ?? []

    if ( !append ) {
      sparePartOptions.value = []
      seenIds.clear()
    }

    for ( const it of rows ) {
      const id = it?.id
      if ( id != null && !seenIds.has( id ) ) {
        seenIds.add( id )
        sparePartOptions.value.push( {
          id,
          title : it.name ?? it.title ?? it.partName ?? String( id ),
          partNumber : it.code ?? it.partNumber ?? '',
          universalCode : it.universalCode ?? it.universal_code ?? '',
          raw : it
        } )
      }
    }

    // Determine if more pages exist
    const totalPages = payload?.data?.totalPages ?? payload?.totalPages ?? payload?.page?.totalPages
    if ( typeof totalPages === 'number' ) {
      searchState.hasMore = searchState.page < totalPages
    } else {
      // Fallback heuristic if API doesn't return total pages
      searchState.hasMore = rows.length === PAGE_SIZE
    }
  } catch ( e ) {
    console.error( 'Spare parts search failed:', e )
    if ( !append ) {
      sparePartOptions.value = []
      seenIds.clear()
    }
    searchState.hasMore = false
  } finally {
    loading.parts = false
  }
}

// Debounced remote method for <el-select>
let partsTimer = null
function searchSparePartsDebounced( q ) {
  const nq = String( q ?? '' ).trim()
  clearTimeout( partsTimer )

  partsTimer = setTimeout( async() => {
    searchState.q = nq
    searchState.page = 1
    searchState.hasMore = false
    await fetchSpareParts( { append : false } )
  }, 250 )
}

// Wire scroll handler when dropdown opens
let scrollEl = null
function onSelectVisibleChange( visible ) {
  if ( !visible ) {
    if ( scrollEl ) {
      scrollEl.removeEventListener( 'scroll', onDropdownScroll, { passive : true } )
      scrollEl = null
    }
    return
  }
  nextTick( () => {
    const popper = document.querySelector( '.sp-parts-popper' )
    scrollEl =
      popper?.querySelector( '.el-select-dropdown__wrap' ) || popper?.querySelector( '.el-scrollbar__wrap' ) || popper
    if ( scrollEl ) {
      scrollEl.addEventListener( 'scroll', onDropdownScroll, { passive : true } )
    }
  } )
}

async function onDropdownScroll( e ) {
  if ( !searchState.hasMore || loading.parts ) return
  const el = e.target
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16
  if ( !nearBottom ) return
  searchState.page += 1
  await fetchSpareParts( { append : true } )
}

/** --------- Prefill from props.initial (edit mode) ---------- */
function hydrateFromInitial( v ) {
  if ( !v ) return

  const sp = v.sparePart ?? {
    id : v.spare_part_id ?? v.spare_part_definition_id ?? v.sparePartId ?? v.spare_part_definition?.id ?? null,
    title : v.title ?? v.name ?? '',
    partNumber : v.partNumber ?? v.part_number ?? v.code ?? '',
    universalCode : v.universalCode ?? v.universal_code ?? '',
    raw : v.spare_part_definition ?? null
  }

  if ( props.mode === 'create' && sp?.id && !sparePartOptions.value.some( o => o.id === sp.id ) ) {
    sparePartOptions.value = [sp, ...sparePartOptions.value]
    seenIds.add( sp.id )
  }

  form.sparePart = sp ?? null
  form.partNumber = v.partNumber ?? v.part_number ?? v.code ?? sp?.partNumber ?? ''

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

/** --------- Submit --------- */
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

const onSubmit = async() => {
  await formRef.value.validate()
  loading.submit = true
  try {
    const position = Number.isInteger( form.deviceTagPositionCode ) ? form.deviceTagPositionCode : 1
    const autoTriggerBool = String( form.autoTriggerCycle ).toLowerCase() === 'yes'
    const installIso = form.lastInstallmentTime ? new Date( form.lastInstallmentTime ).toISOString() : null

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
        code : buildNodeCode(),

        // placement
        node_type_id : 7,
        parent_id : Number( props.tier4Id ),

        // link to master spare part
        spare_part_id : spId,

        // non-unique SKU-like field
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
      submissionData = {
        sequence_order : position,
        sequenceOrder : position,
        spare_part_quantity : Number( form.deviceQuantity ),
        suggested_maintenance_interval_days : Number( form.suggestedServiceDays ),
        estimated_maintenance_interval_days : Number( form.estimatedServiceDays ),
        is_auto_trigger : autoTriggerBool,
        installation_date : installIso
        // omit spare_part_id unless intentionally relinking
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

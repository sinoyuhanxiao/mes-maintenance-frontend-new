<template>
  <div class="main">
    <el-card>
      <div class="main-div">
        <div><el-text size="large" tag="b">FROM</el-text></div>
        <el-card>
          <BatchCard :data="batch" />
        </el-card>
        <div>
          <el-form ref="formRef" :rules="rules" label-width="150px">
            <el-form-item label="Transfer to" prop="transfer_to_id">
              <el-select v-model="selectedBatchId" placeholder="Select Batch" style="width: 50%">
                <el-option
                  v-for="item in localBatches"
                  :key="item.id"
                  :label="`#${item.id}/${item.batch_number}/L${item.location_id}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Transfer Quantity" prop="quantity">
              <el-input-number
                clearable
                v-model="form.quantity"
                placeholder="Please input Transfer Quantity"
                :step="1"
                :max="batch.unit_in_stock"
                :min="1"
                style="width: 50%"
              >
              </el-input-number>
            </el-form-item>
            <el-form-item label="Transfer Date" prop="transfer_date">
              <el-date-picker
                v-model="form.transferDate"
                type="datetime"
                placeholder="Select date and time"
                style="width: 50%"
                :disabled-date="disablePastDates"
              />
            </el-form-item>
            <el-form-item label="Remark">
              <el-input v-model="form.remark" type="textarea" placeholder="Transfer Remarks" style="width: 50%" />
            </el-form-item>
          </el-form>
        </div>
        <div v-if="selectedBatch"><el-text size="large" tag="b">TO</el-text></div>
        <el-card v-if="selectedBatch">
          <BatchCard :data="selectedBatch" :addStock="form.quantity" />
        </el-card>
        <div>
          <el-button type="primary" @click="confirmTransfer">Confirm Transfer</el-button>
        </div>
      </div>
    </el-card>
  </div>
  <!-- <el-text>{{ form }}</el-text> -->
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import BatchCard from './BatchCard.vue'
import { transferInventory } from '../../../../api/resources'

const props = defineProps( {
  data : Object,
  batches : Object
} )
const emit = defineEmits( ['transfer'] )

const localBatches = ref( props.batches.filter( item => item.id !== props.data.id ) )
console.log( localBatches.value )
const formRef = ref( null )

const batch = ref( props.data )

const selectedBatchId = ref( null )

const selectedBatch = ref( null )

const form = reactive( {
  transfer_from_id : props.data.id,
  transfer_to_id : selectedBatchId,
  quantity : 1,
  transfer_date : null,
  remark : null,
  transaction_type_id : 104
} )

// Form rules
const rules = reactive( {
  transfer_to_id : [{ required : true, message : 'Please select transfer target', trigger : 'blur' }],
  quantity : [{ required : true, message : 'Please enter in transfer quantity', trigger : 'blur' }],
  transfer_date : [{ required : true, message : 'Please select in transfer date', trigger : 'blur' }]
} )

function disablePastDates( time ) {
  return time.getTime() < Date.now() - 86400000 // disables all past dates (before today)
}

watch( selectedBatchId, newId => {
  selectedBatch.value = localBatches.value.find( b => b.id === newId ) || null
} )

async function confirmTransfer() {
  const response = await transferInventory( form )

  emit( 'transfer', response )
  resetForm()
}

const resetForm = () => {
  if ( formRef.value ) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.main-div {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 1600px) {
  .main {
    overflow-y: auto;
    /* height: 505px; */
  }
}
</style>

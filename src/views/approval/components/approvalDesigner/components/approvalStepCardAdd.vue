<template>
  <div class="approval-class-card">
    <div class="card-number">
      <div class="circle">{{ stepNumber }}</div>
    </div>
    <div class="card-info">
      <div class="card-field">
        <el-text class="field-label">Approving Role:</el-text>
        <el-input
          v-model="localStepData.approvingRole"
          placeholder="Enter approving role"
          size="small"
          style="width: 200px"
          @input="handleUpdate"
        />
      </div>
      <div class="card-field">
        <el-checkbox v-model="localStepData.requiresApproval" @change="handleUpdate">
          Requires Approval Starting At:
        </el-checkbox>
        <el-input
          v-model="localStepData.approvalAmount"
          :disabled="!localStepData.requiresApproval"
          placeholder="$0"
          size="small"
          style="width: 120px"
          @input="handleUpdate"
        >
          <template #prefix>$</template>
        </el-input>
      </div>
    </div>
    <div class="card-actions">
      <el-button type="danger" size="small" :icon="Delete" circle @click="handleRemove" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps( {
  stepNumber : {
    type : Number,
    default : 1
  },
  stepData : {
    type : Object,
    default : () => ( {
      approvingRole : '',
      requiresApproval : false,
      approvalAmount : ''
    } )
  }
} )

const emit = defineEmits( ['update', 'remove'] )

// Local copy of step data for v-model binding
const localStepData = ref( {
  approvingRole : props.stepData.approvingRole || '',
  requiresApproval : props.stepData.requiresApproval || false,
  approvalAmount : props.stepData.approvalAmount || ''
} )

// Watch for prop changes (in case parent updates the data)
watch(
  () => props.stepData,
  newVal => {
    localStepData.value = {
      approvingRole : newVal.approvingRole || '',
      requiresApproval : newVal.requiresApproval || false,
      approvalAmount : newVal.approvalAmount || ''
    }
  },
  { deep : true }
)

// Emit update to parent
const handleUpdate = () => {
  emit( 'update', localStepData.value )
}

// Emit remove event
const handleRemove = () => {
  emit( 'remove' )
}
</script>

<style scoped>
.approval-class-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin: 5px;
  width: 95%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  background-color: white;
}

.card-number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #409eff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  white-space: nowrap;
}

.card-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
</style>

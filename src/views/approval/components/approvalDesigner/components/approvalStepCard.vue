<template>
  <div class="approval-class-card">
    <div class="card-number">
      <div class="circle">{{ stepNumber }}</div>
    </div>
    <div class="card-info">
      <div class="card-column">
        <div class="card-field">
          <el-text class="field-label-approver">Approver Type:</el-text>
          <el-text class="field-value">{{ stepData.approverType || 'N/A' }}</el-text>
        </div>
        <div class="card-field">
          <el-text class="field-label-approver">Approver:</el-text>
          <el-text class="field-value">{{ stepData.approverName || 'N/A' }}</el-text>
        </div>
      </div>
      <div class="card-column">
        <div class="card-field">
          <el-text class="field-label-value">Requires Approval Starting At:</el-text>
          <el-text class="field-value">{{ stepData.requiresApproval ? 'Yes' : 'No' }}</el-text>
        </div>
        <div class="card-field">
          <el-text class="field-label-value">Value:</el-text>
          <el-text class="field-value">{{
            stepData.requiresApproval ? `$${stepData.approvalAmount || '0'}` : '-'
          }}</el-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stepNumber: {
    type: Number,
    default: 1,
  },
  stepData: {
    type: Object,
    default: () => ({
      approverType: '',
      approverName: '',
      requiresApproval: false,
      approvalAmount: '',
    }),
  },
})
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
  font-weight: 600;
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

.card-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
}

.card-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.field-label-approver {
  white-space: nowrap;
  width: 110px;
  font-weight: 600;
  flex-shrink: 0;
}

.field-label-value {
  white-space: nowrap;
  width: 210px;
  font-weight: 600;
  flex-shrink: 0;
}

.field-value {
  flex: 1;
  min-width: 80px;
}
</style>

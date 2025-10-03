<template>
  <div class="approval-class-card">
    <div class="card-number">
      <div class="circle">{{ stepNumber }}</div>
    </div>
    <div class="card-info">
      <el-text>Approving Role: abcd</el-text>
      <el-text>Requires Approval Starting At: $100</el-text>
    </div>
  </div>
</template>

<script setup>
defineProps( {
  stepNumber : {
    type : Number,
    default : 1
  }
} )
</script>

<style scoped>
.approval-class-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin: 5px;
  width: calc(100vw - 635px);
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.card-number {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #409eff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>

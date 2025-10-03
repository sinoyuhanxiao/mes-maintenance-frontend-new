<template>
  <div class="approval-designer">
    <div class="approval-designer-header">
      <el-text size="large">{{ props.selectedDepartmentId }} Approval Hierarchy</el-text>
      <el-dropdown class="kebab-dropdown" @click.stop>
        <el-icon class="kebab-icon">
          <MoreFilled />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleEdit">Edit</el-dropdown-item>
            <el-dropdown-item divided @click="handleDelete">Delete</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider></el-divider>
    <div class="approval-designer-info">
      <el-descriptions :column="2" :size="size" direction="vertical" :style="blockMargin">
        <el-descriptions-item label="Approval Type">Work Order</el-descriptions-item>
        <el-descriptions-item label="Title">Work Order Approval Flow</el-descriptions-item>
        <el-descriptions-item label="Description" :span="2">
          This is a sample approval flow for work orders.
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider></el-divider>
    <div class="approval-designer-steps">
      <el-steps :active="3" align-center>
        <el-step title="Step 1" description="Some description" />
        <el-step title="Step 2" description="Some description" />
        <el-step title="Step 3" description="Some description" />
      </el-steps>
    </div>
    <el-divider></el-divider>
    <div class="approval-designer-list">
      <approvalStepCard />
      <approvalStepCard />
      <approvalStepCard />
    </div>
  </div>
</template>

<script setup>
import approvalStepCard from './components/approvalStepCard.vue'
import { MoreFilled } from '@element-plus/icons-vue'

const props = defineProps( {
  selectedDepartmentId : {
    type : [String, Number],
    default : null
  }
} )

const handleEdit = () => {
  console.log( 'Edit clicked' )
}

const handleDelete = () => {
  console.log( 'Delete clicked' )
}
</script>

<style scoped>
.approval-designer {
  flex: 0;
  display: flex-start;
  flex-direction: column;
  overflow-y: None;
}
.approval-designer-header {
  flex: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.kebab-dropdown {
  flex-shrink: 0;
}
.kebab-icon {
  transform: rotate(90deg);
  cursor: pointer;
  border-radius: 4px;
  color: #409eff;
  font-size: 18px;
}
.approval-designer-info {
  flex: 0;
  display: flex-start;
  flex-direction: column;
  margin-bottom: 10px;
}
.approval-designer-steps {
  flex: 0;
  display: flex;
  flex-direction: column;
}
.approval-designer-list {
  flex: 0;
  display: flex;
  flex-direction: column;
}
</style>

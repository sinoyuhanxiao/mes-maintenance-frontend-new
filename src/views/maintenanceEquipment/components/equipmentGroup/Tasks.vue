<template>
  <div class="main-container">
    <el-descriptions :column="1" direction="vertical">
      <el-descriptions-item label="Task Library">
        <InfoCardTable :data="taskData" :pageSize="6" :rows="5" :heightOffset="'435px'" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import InfoCardTable from '../components/InfoCardTable/index.vue'

const taskData = [
  { id : 1, title : 'Fix Bug #12', description : 'Fix the UI layout issue on login page.' },
  { id : 2, title : 'Write Tests', description : 'Add unit tests for user service.' },
  { id : 3, title : 'Code Review', description : 'Review pull request #42.' },
  { id : 4, title : 'Deploy Update', description : 'Deploy v1.3 to staging environment.' },
  { id : 5, title : 'Write Docs', description : 'Update README with new API usage.' },
  { id : 6, title : 'Schedule Meeting', description : 'Book sync-up with frontend team.' },
  { id : 7, title : 'Fix Lint Errors', description : 'Resolve ESLint issues in dashboard module.' },
  { id : 8, title : 'Add Feature Flag', description : 'Introduce dark mode toggle for beta users.' }
]
</script>

<style scoped>
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

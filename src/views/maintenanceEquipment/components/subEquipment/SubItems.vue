<template>
  <div class="sub-items">
    <div class="image-container">
      <el-image
        :src="props.imageUrl"
        :alt="props.imageAlt"
        fit="contain"
        :preview-src-list="[props.imageUrl]"
        class="equipment-image"
      >
      </el-image>
    </div>
    <div class="spare-parts-table">
      <SparePartsTable :data="taskData" :pageSize="6" :rows="10" :heightOffset="'400px'" />
    </div>
  </div>
</template>

<script setup>
import SparePartsTable from './components/CardTable/index.vue'

const props = defineProps( {
  imageUrl : {
    type : String,
    default : 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  imageAlt : {
    type : String,
    default : 'Equipment image'
  }
} )

const taskData = [
  { id : 1, title : 'Fix Bug #12', description : 'Fix the UI layout issue on login page.' },
  { id : 2, title : 'Write Tests', description : 'Add unit tests for user service.' },
  { id : 3, title : 'Code Review', description : 'Review pull request #42.' },
  { id : 4, title : 'Deploy Update', description : 'Deploy v1.3 to staging environment.' },
  { id : 5, title : 'Write Docs', description : 'Update README with new API usage.' },
  { id : 6, title : 'Schedule Meeting', description : 'Book sync-up with frontend team.' },
  { id : 7, title : 'Fix Lint Errors', description : 'Resolve ESLint issues in dashboard module.' },
  { id : 8, title : 'Add Feature Flag', description : 'Introduce dark mode toggle for beta users.' },
  { id : 9, title : 'Database Migration', description : 'Migrate user data to new schema structure.' },
  { id : 10, title : 'Update Dependencies', description : 'Upgrade Vue.js and related packages to latest versions.' },
  { id : 11, title : 'Performance Optimization', description : 'Optimize API response times for search functionality.' },
  { id : 12, title : 'Security Audit', description : 'Conduct security review of authentication system.' },
  { id : 13, title : 'Mobile Responsive', description : 'Make dashboard components mobile-friendly.' },
  { id : 14, title : 'Error Handling', description : 'Implement proper error boundaries in React components.' },
  { id : 15, title : 'Analytics Setup', description : 'Integrate Google Analytics for user behavior tracking.' }
]
</script>

<style scoped>
.sub-items {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 10px;
}

.equipment-image {
  width: 100%;
  height: 100%;
}

.spare-parts-table {
  flex: 0 0 400px;
}
</style>

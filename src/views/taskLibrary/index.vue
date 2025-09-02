<template>
  <div class="maintenance-library-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Maintenance Library</h1>
        <p class="dashboard-subtitle">Design and manage maintenance procedure templates</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="navigateToDesigner">
          <el-icon><Plus /></el-icon>
          Create New Template
        </el-button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ totalTemplates }}</div>
              <div class="stat-label">Total Templates</div>
            </div>
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ publishedTemplates }}</div>
              <div class="stat-label">Published</div>
            </div>
            <div class="stat-icon published">
              <el-icon><Check /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ draftTemplates }}</div>
              <div class="stat-label">Drafts</div>
            </div>
            <div class="stat-icon draft">
              <el-icon><Edit /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ uniqueCategories }}</div>
              <div class="stat-label">Categories</div>
            </div>
            <div class="stat-icon categories">
              <el-icon><Collection /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <el-card>
        <template #header>
          <span class="section-title">Quick Actions</span>
        </template>
        <div class="quick-actions-grid">
          <div class="action-item" @click="navigateToDesigner">
            <div class="action-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="action-content">
              <h4>Create Template</h4>
              <p>Design a new maintenance procedure template</p>
            </div>
          </div>
          <div class="action-item" @click="navigateToLibrary">
            <div class="action-icon">
              <el-icon><Folder /></el-icon>
            </div>
            <div class="action-content">
              <h4>Browse Library</h4>
              <p>View and manage existing templates</p>
            </div>
          </div>
          <div class="action-item" @click="navigateToLibrary">
            <div class="action-icon">
              <el-icon><Search /></el-icon>
            </div>
            <div class="action-content">
              <h4>Search Templates</h4>
              <p>Find templates by name or category</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Recent Templates -->
    <div class="recent-templates-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <span class="section-title">Recent Templates</span>
            <el-button type="text" @click="navigateToLibrary">View All</el-button>
          </div>
        </template>
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="recentTemplates.length === 0" class="empty-state">
          <el-empty description="No templates found" :image-size="80" />
        </div>
        <div v-else class="recent-templates-list">
          <div
            v-for="template in recentTemplates"
            :key="template.template_id"
            class="recent-template-item"
            @click="openTemplate(template)"
          >
            <div class="template-info">
              <h4 class="template-name">{{ template.name }}</h4>
              <p class="template-description">{{ template.description || 'No description' }}</p>
              <div class="template-meta">
                <el-tag :type="getStatusType(template.status)" size="small">
                  {{ template.status }}
                </el-tag>
                <span class="template-category">{{ template.category }}</span>
                <span class="template-time">{{ template.estimated_minutes }}min</span>
              </div>
            </div>
            <div class="template-actions">
              <el-button type="text" size="small" @click.stop="editTemplate(template)">
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Document, Check, Edit, Collection, Folder, Search } from '@element-plus/icons-vue'
import { useTaskLibrary } from '@/composables/useTaskLibrary'

const router = useRouter()
const { loading, templates, loadTemplates } = useTaskLibrary()

// Computed properties for stats
const totalTemplates = computed( () => templates.value.length )
const publishedTemplates = computed( () => templates.value.filter( t => t.status === 'published' ).length )
const draftTemplates = computed( () => templates.value.filter( t => t.status === 'draft' ).length )
const uniqueCategories = computed( () => {
  const categories = new Set( templates.value.map( t => t.category ).filter( Boolean ) )
  return categories.size
} )

// Recent templates (last 5)
const recentTemplates = computed( () => {
  return [...templates.value].sort( ( a, b ) => new Date( b.updated_at ) - new Date( a.updated_at ) ).slice( 0, 5 )
} )

// Navigation methods
const navigateToDesigner = () => {
  router.push( { name : 'TemplateDesigner' } )
}

const navigateToLibrary = () => {
  router.push( { name : 'TemplateLibrary' } )
}

const openTemplate = template => {
  router.push( {
    name : 'TemplateDesignerEdit',
    params : { id : template.template_id }
  } )
}

const editTemplate = template => {
  router.push( {
    name : 'TemplateDesignerEdit',
    params : { id : template.template_id }
  } )
}

// Helper methods
const getStatusType = status => {
  switch ( status ) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
}

// Initialize data
onMounted( () => {
  loadTemplates()
} )
</script>

<style scoped>
.maintenance-library-dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.dashboard-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.dashboard-subtitle {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .stat-label {
    color: #606266;
    font-size: 14px;
  }

  .stat-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 32px;
    color: #409eff;

    &.published {
      color: #67c23a;
    }

    &.draft {
      color: #e6a23c;
    }

    &.categories {
      color: #909399;
    }
  }
}

:deep(.stat-card .el-card__body) {
  position: relative;
  padding: 20px;
}

.quick-actions-section,
.recent-templates-section {
  margin-bottom: 24px;
}

.section-title {
  font-weight: 600;
  color: #303133;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background-color: #f0f7ff;
  }
}

.action-icon {
  margin-right: 16px;
  font-size: 24px;
  color: #409eff;
}

.action-content h4 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 16px;
}

.action-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.loading-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.recent-templates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background-color: #f0f7ff;
  }
}

.template-info {
  flex: 1;
}

.template-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.template-description {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.template-category,
.template-time {
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.template-actions {
  margin-left: 16px;
}

/* Global icon spacing for all Task Library buttons */
:deep(.el-button .el-icon) {
  margin-right: 3px !important;
  margin-bottom: 1px !important;
}
</style>

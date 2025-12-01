<template>
  <div class="standards-preview">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="4" animated />
      <div class="loading-text">Loading standard details...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-alert title="Failed to load standard" :description="error" type="error" :closable="false" show-icon />
    </div>

    <!-- Standard Details (matching exactly StandardsLibraryView structure) -->
    <div v-else-if="standard" class="standard-details">
      <!-- Fixed Header Section -->
      <div class="fixed-header-section">
        <!-- Tab Navigation -->
        <div class="standard-tabs-header">
          <el-tabs v-model="activeTab" class="details-tabs">
            <el-tab-pane label="General" name="general"></el-tab-pane>
            <el-tab-pane label="Standard Rules" name="rules"></el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="scrollable-content">
        <div class="tab-content-wrapper">
          <!-- General Tab Content -->
          <div v-if="activeTab === 'general'" class="tab-pane-content">
            <!-- Standard Overview Card -->
            <div class="overview-card">
              <div class="card-content">
                <el-descriptions :column="2" direction="vertical">
                  <el-descriptions-item width="50%" label="Category">
                    {{ standard.category || 'Uncategorized' }}
                  </el-descriptions-item>
                  <el-descriptions-item width="50%" label="Total Rules">
                    <span class="info-value highlight clickable-rules" @click="navigateToRulesTab"
                      >{{ standard.items?.length || 0 }} rules</span
                    >
                  </el-descriptions-item>
                  <el-descriptions-item width="50%" label="Standard Code">
                    <span class="standard-id">{{ standard.code || 'N/A' }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <!-- Description Section -->
            <div class="description-card" v-if="standard.description">
              <div class="card-header">
                <h3 class="card-title">Description</h3>
              </div>
              <div class="card-content">
                <div class="description-text">
                  {{ standard.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Standard Rules Tab Content -->
          <div v-if="activeTab === 'rules'" class="tab-pane-content">
            <!-- Standard Rules List -->
            <div v-if="standard.items && standard.items.length > 0" class="rules-list">
              <div class="card-header">
                <h3 class="card-title">Standard Rules</h3>
                <el-tag type="warning" size="small">Read Only</el-tag>
              </div>
              <div class="rules-container">
                <div v-for="(rule, index) in standard.items" :key="index" class="rule-item">
                  <div class="rule-number">{{ index + 1 }}</div>
                  <div class="rule-content">
                    <div class="rule-text">{{ rule }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-rules">
              <el-empty description="No standard rules defined yet" :image-size="60" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Standard State -->
    <div v-else class="empty-standard">
      <el-empty description="No standard data available" :image-size="60" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getStandard } from '@/api/task-library'

const props = defineProps( {
  standardId : {
    type : [String, Number],
    required : true
  }
} )

// Local state
const loading = ref( false )
const error = ref( null )
const standard = ref( null )
const activeTab = ref( 'general' )

const navigateToRulesTab = () => {
  activeTab.value = 'rules'
}

// Load standard data
const fetchStandard = async() => {
  if ( !props.standardId ) {
    error.value = 'No standard ID provided'
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log( `Loading standard: ${props.standardId}` )
    const response = await getStandard( props.standardId )

    if ( response && response.data ) {
      standard.value = response.data?.data || response.data
      console.log( 'Standard loaded:', standard.value )
    } else {
      throw new Error( 'No standard data received' )
    }
  } catch ( err ) {
    console.error( 'Failed to load standard for preview:', err )
    error.value = err.response?.data?.message || err.message || 'Failed to load standard details'
    ElMessage.error( 'Failed to load standard details' )
  } finally {
    loading.value = false
  }
}

// Watch for standard ID changes
watch(
  () => props.standardId,
  newId => {
    if ( newId ) {
      fetchStandard()
    }
  },
  { immediate : true }
)

onMounted( () => {
  if ( props.standardId ) {
    fetchStandard()
  }
} )

defineOptions( {
  name : 'StandardsPreview'
} )
</script>

<style scoped>
.standards-preview {
  padding: 0;
  overflow: visible;
}

.loading-container {
  padding: 24px;

  .loading-text {
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 16px;
  }
}

.error-container {
  padding: 24px;
}

.empty-standard {
  padding: 40px 20px;
  text-align: center;
}

/* Matching StandardsLibraryView styles exactly */
.standard-details {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fixed-header-section {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #fff;
}

.scrollable-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.standard-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-tabs {
  height: 100%;
}

/* Card Components - matching StandardsLibraryView exactly */
.overview-card,
.description-card,
.stats-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
}

.card-header {
  padding: 8px 24px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.standard-id {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.card-content {
  padding: 12px 24px 12px 24px;
}

.info-value {
  color: #606266;
  font-weight: 200;
  font-size: 14px;
  text-align: right;
  margin-right: 20px;
}

.info-value.highlight {
  color: #409eff;
  font-weight: 600;
}

.clickable-rules {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-rules:hover {
  color: #409eff !important;
  text-decoration: underline;
}

/* Description Card */
.description-text {
  color: #303133;
  line-height: 1.7;
  font-size: 14px;
  padding: 16px 16px 16px 0px;
  border-radius: 6px;
  max-height: 32vh;
  overflow-y: auto;
}

/* Rules List - matching StandardsLibraryView exactly */
.rules-list {
  margin-bottom: 24px;
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 24px 24px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.rule-item:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.rule-number {
  width: 23px;
  height: 23px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 16px;
  flex-shrink: 0;
}

.rule-content {
  flex: 1;
  margin-right: 12px;
}

.rule-text {
  color: #303133;
  line-height: 1.6;
  font-size: 14px;
}

.empty-rules {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

/* Tab styling matching StandardsLibraryView */
:deep(.el-tabs__item.is-top) {
  font-size: 16px;
  width: 50%;
}

:deep(.el-tabs__nav.is-top) {
  width: 100%;
}

/* Custom scrollbar for rules container only */
.rules-container::-webkit-scrollbar {
  width: 6px;
}

.rules-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.rules-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.rules-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Custom scrollbar for description text */
.description-text::-webkit-scrollbar {
  width: 6px;
}

.description-text::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.description-text::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.description-text::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .standards-preview {
    padding: 12px;
  }

  .standard-details {
    padding: 16px;
  }

  .standard-title {
    font-size: 20px;
  }

  .card-content {
    padding: 12px 16px;
  }

  .rules-container {
    padding: 8px 16px 16px 16px;
    gap: 8px;
  }

  .rule-item {
    padding: 10px;
  }

  .rule-number {
    width: 20px;
    height: 20px;
    font-size: 12px;
    margin-right: 12px;
  }

  .rule-text {
    font-size: 13px;
  }
}
</style>

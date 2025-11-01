<template>
  <div
    class="template-card"
    :class="{ selected: isSelected, highlighted: isHighlighted }"
    @click="$emit('select', template)"
  >
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Steps -->
      <div class="row-1">
        <h4 class="card-title" :title="template.name">
          {{ template.name }}
        </h4>
        <div class="steps-count">{{ stepsCount }} steps</div>
      </div>

      <!-- Row 2: Tags (conditional) -->
      <div class="row-2 card-tags">
        <el-tag v-if="categoryLabel" size="small" class="tag-item">
          {{ categoryLabel }}
        </el-tag>

        <el-tag v-if="assetLabel" size="small" type="info" class="tag-item">
          {{ assetLabel }}
        </el-tag>

        <el-tag v-if="template.estimated_minutes" size="small" type="warning" class="tag-item">
          {{ template.estimated_minutes }} min
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps( {
  template : {
    type : Object,
    required : true
  },
  isSelected : {
    type : Boolean,
    default : false
  },
  isHighlighted : {
    type : Boolean,
    default : false
  }
} )

// eslint-disable-next-line no-unused-vars
const emit = defineEmits( ['select', 'edit', 'duplicate', 'delete'] )

const stepsCount = computed( () => {
  // Use new backend format total_steps if available, fallback to old format
  return props.template?.total_steps ?? props.template?.steps?.length ?? 0
} )

const categoryLabel = computed( () => {
  const category = props.template?.category
  if ( !category ) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
} )

const assetLabel = computed( () => {
  const a = props.template?.applicable_assets
  if ( !a || a.length === 0 ) return ''
  return a.length === 1 ? a[0] : `${a.length} assets`
} )
</script>

<style scoped>
.template-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-card.selected {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  background: #f0f7ff;
}

.template-card.highlighted {
  border-color: #67c23a;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.2);
  background: #f0f9f0;
  animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
  0%,
  100% {
    box-shadow: 0 2px 12px rgba(103, 194, 58, 0.2);
  }
  50% {
    box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
  }
}

.template-card.archived {
  border-left: 4px solid #909399;
  opacity: 0.8;
}

/* ADD */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
}

.row-1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.steps-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.row-2 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 24px; /* Ensure consistent height even when no tags are present */
}

.tag-item {
  --el-tag-border-color: #e4e7ed;
}

@media (max-width: 480px) {
  .card-content {
    padding: 10px 12px;
  }
  .card-title {
    font-size: 15px;
  }
}

.card-content {
  display: flex;
  padding: 12px 16px;
  gap: 16px;
}

.content-main {
  flex: 1;
  min-width: 0;
}

.content-sidebar {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 80px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.meta-label {
  color: #909399;
  margin-right: 8px;
  font-weight: 500;
  min-width: 60px;
}

.meta-value {
  color: #606266;
}

.status-section {
  margin-bottom: 4px;
}

.version-info {
  font-size: 11px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.timestamps {
  text-align: right;
}

.timestamp-item {
  font-size: 11px;
  color: #c0c4cc;
}

.timestamp-label {
  display: block;
  margin-bottom: 2px;
}

.timestamp-value {
  font-weight: 500;
}

.card-footer {
  padding: 8px 16px 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.footer-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.footer-button {
  font-size: 12px;
  padding: 4px 8px;
  color: #606266;
}

.footer-button:hover {
  color: #409eff;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .card-content {
    flex-direction: column;
    gap: 12px;
  }

  .content-sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .footer-actions {
    justify-content: center;
  }
}
</style>

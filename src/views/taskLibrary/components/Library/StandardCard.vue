<template>
  <div class="standard-card" :class="{ selected: isSelected }" @click="$emit('select', standard)">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Rules Count -->
      <div class="row-1">
        <h4 class="card-title" :title="standard.name">
          {{ standard.name }}
        </h4>
        <div class="rules-count">{{ rulesCount }} rules</div>
      </div>

      <!-- Row 2: Description -->
      <div class="row-2" v-if="standard.description">
        <p class="card-description">{{ standard.description }}</p>
      </div>

      <!-- Row 3: Tags -->
      <div class="row-3 card-tags">
        <el-tag
          v-if="standard.category"
          :type="standard.category === 'general' ? 'primary' : 'warning'"
          size="small"
          class="tag-item"
        >
          {{ standard.category }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps( {
  standard : {
    type : Object,
    required : true
  },
  isSelected : {
    type : Boolean,
    default : false
  }
} )

// eslint-disable-next-line no-unused-vars
const emit = defineEmits( ['select', 'edit', 'duplicate', 'delete'] )

const rulesCount = computed( () => props.standard?.items?.length || 0 )
</script>

<style scoped>
.standard-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
}

.standard-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.standard-card.selected {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  background: #f0f7ff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.rules-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.row-2 {
  margin: 4px 0;
}

.card-description {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.row-3 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
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
</style>

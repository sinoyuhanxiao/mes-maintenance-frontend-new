<template>
  <el-drawer
    v-model="drawerVisible"
    title="Live Activity Feed"
    direction="rtl"
    size="420px"
    :before-close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <el-icon class="header-icon"><Bell /></el-icon>
        <span class="header-title">Live Activity Feed</span>
      </div>
    </template>

    <div class="activity-content">
      <div class="activity-filters">
        <el-radio-group v-model="selectedFilter" size="default" class="filter-buttons">
          <el-radio-button label="all">All</el-radio-button>
          <el-radio-button label="alerts">Alarms</el-radio-button>
          <el-radio-button label="maintenance">Maintenance</el-radio-button>
        </el-radio-group>
      </div>

      <div class="activity-list">
        <transition-group name="list" tag="div">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="activity-card"
            :class="`severity-${activity.severity}`"
          >
            <div class="card-header">
              <div class="activity-time">{{ activity.timestamp }}</div>
            </div>
            <div class="activity-message">{{ activity.message }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { Bell, Tools, Warning, Box, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps( {
  activities : {
    type : Array,
    default : () => []
  },
  visible : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['close'] )

const drawerVisible = ref( props.visible )
const selectedFilter = ref( 'all' )

watch(
  () => props.visible,
  newVal => {
    drawerVisible.value = newVal
  }
)

watch( drawerVisible, newVal => {
  if ( !newVal ) {
    emit( 'close' )
  }
} )

const handleClose = () => {
  drawerVisible.value = false
}

const filteredActivities = computed( () => {
  if ( selectedFilter.value === 'all' ) {
    return props.activities
  }
  if ( selectedFilter.value === 'alerts' ) {
    return props.activities.filter( a => a.type === 'alert' )
  }
  if ( selectedFilter.value === 'maintenance' ) {
    return props.activities.filter( a => a.type === 'maintenance' )
  }
  return props.activities
} )

// eslint-disable-next-line no-unused-vars
const getActivityIcon = type => {
  const iconMap = {
    maintenance : Tools,
    alert : Warning,
    production : Box,
    status : InfoFilled
  }
  return iconMap[type] || InfoFilled
}
</script>

<style lang="scss" scoped>
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #0085a4;

  .header-icon {
    font-size: 22px;
  }
}

.activity-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.activity-filters {
  padding: 0 0 20px 0;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;

  .filter-buttons {
    width: 100%;
    display: flex;

    :deep(.el-radio-button) {
      flex: 1;

      .el-radio-button__inner {
        width: 100%;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 6px;
      }

      &:first-child .el-radio-button__inner {
        border-radius: 6px 0 0 6px;
      }

      &:last-child .el-radio-button__inner {
        border-radius: 0 6px 6px 0;
      }
    }
  }
}

.activity-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;

    &:hover {
      background: #c0c4cc;
    }
  }
}

.activity-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  border-left: 2px solid transparent;

  &.severity-success {
    border-left-color: #67c23a;
  }

  &.severity-warning {
    border-left-color: #e6a23c;
  }

  &.severity-info {
    border-left-color: #409eff;
  }

  &.severity-danger {
    border-left-color: #f56c6c;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.activity-message {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  word-wrap: break-word;
  padding-left: 0;
}

// List animation
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// Drawer custom styles
:deep(.el-drawer__header) {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

:deep(.el-drawer__body) {
  padding: 20px;
}
</style>

<template>
  <div class="request-card" :class="{ selected: isSelected }" @click="handleClick">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Request ID -->
      <div class="row-1">
        <h4 class="card-title" :title="request.name">
          {{ request.name }}
        </h4>
        <span class="request-id">#{{ request.id }}</span>
      </div>

      <!-- Row 2: Status + Created Date -->
      <div class="row-2 card-meta">
        <div class="meta-item">
          <el-tag :type="statusTagType" size="small" class="status-tag">
            {{ statusLabel }}
          </el-tag>
        </div>
        <div class="meta-item" v-if="request.created_at">
          <el-icon class="meta-icon"><Clock /></el-icon>
          <span class="meta-text">{{ formatDate(request.created_at) }}</span>
        </div>
      </div>

      <!-- Row 3: Equipment Info -->
      <div class="row-3" v-if="request.equipment_node">
        <div class="meta-item">
          <el-icon class="meta-icon"><Grid /></el-icon>
          <span class="meta-text">{{ equipmentLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Grid, Clock } from '@element-plus/icons-vue'

const props = defineProps( {
  request : {
    type : Object,
    required : true
  },
  isSelected : {
    type : Boolean,
    default : false
  },
  standalone : {
    type : Boolean,
    default : false
  }
} )

// eslint-disable-next-line no-unused-vars
const emit = defineEmits( ['select'] )

const router = useRouter()

const handleClick = () => {
  if ( props.standalone ) {
    // Navigate to standalone view page
    router.push( {
      path : `/maintenance/requests/view/${props.request.id}`
    } )
  } else {
    // Emit select event for list view
    emit( 'select', props.request )
  }
}

const statusLabel = computed( () => {
  const statusMap = {
    0 : 'Pending',
    1 : 'Rejected',
    2 : 'Approved'
  }
  return statusMap[props.request?.status] || 'Unknown'
} )

const statusTagType = computed( () => {
  const typeMap = {
    0 : 'info',
    1 : 'danger',
    2 : 'success'
  }
  return typeMap[props.request?.status] || 'info'
} )

const equipmentLabel = computed( () => {
  return props.request?.equipment_node.name
} )

const formatDate = dateString => {
  if ( !dateString ) return 'N/A'
  const date = new Date( dateString )
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor( diffMs / 60000 )
  const diffHours = Math.floor( diffMs / 3600000 )
  const diffDays = Math.floor( diffMs / 86400000 )

  if ( diffMins < 60 ) {
    return `${diffMins}m ago`
  } else if ( diffHours < 24 ) {
    return `${diffHours}h ago`
  } else if ( diffDays < 7 ) {
    return `${diffDays}d ago`
  } else {
    // Format as YYYY-MM-DD
    const year = date.getFullYear()
    const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
    const day = String( date.getDate() ).padStart( 2, '0' )
    return `${year}-${month}-${day}`
  }
}
</script>

<style scoped>
.request-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
}

.request-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.request-card.selected {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  background: #f0f7ff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.status-tag {
  flex-shrink: 0;
}

.row-2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-meta {
  min-height: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}

.meta-icon {
  font-size: 14px;
  color: #909399;
}

.meta-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-3 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.request-id {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 3px;
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

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="zone?.name || 'Equipment Details'"
    width="600px"
    :before-close="handleClose"
    class="equipment-modal"
  >
    <div v-if="zone" class="modal-content">
      <!-- Status Header -->
      <div class="status-header" :class="`status-${zone.status}`">
        <div class="status-info">
          <div class="status-badge-large">
            <span class="status-dot" :class="`status-${zone.status}`"></span>
            <span class="status-text">{{ getStatusText(zone.status) }}</span>
          </div>
          <div v-if="zone.hasAlert" class="alert-badge">
            <i class="el-icon-warning"></i>
            Alert Active
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="metric-icon uptime">
            <i class="el-icon-time"></i>
          </div>
          <div class="metric-info">
            <div class="metric-label">Uptime</div>
            <div class="metric-value">{{ zone.details?.uptime || 'N/A' }}</div>
          </div>
        </div>

        <div class="metric-box">
          <div class="metric-icon throughput">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="metric-info">
            <div class="metric-label">Throughput</div>
            <div class="metric-value">{{ zone.details?.throughput || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- Maintenance Info -->
      <div class="maintenance-section">
        <div class="section-title">
          <i class="el-icon-tools"></i>
          Maintenance Information
        </div>
        <div class="maintenance-grid">
          <div class="maintenance-item">
            <span class="label">Last Maintenance:</span>
            <span class="value">{{ formatDate(zone.lastMaintenance) }}</span>
          </div>
          <div class="maintenance-item">
            <span class="label">Next Scheduled:</span>
            <span class="value">{{ formatDate(zone.details?.nextMaintenance) }}</span>
          </div>
          <div class="maintenance-item">
            <span class="label">Equipment ID:</span>
            <span class="value">{{ `EQ-${zone.id.toString().padStart(4, '0')}` }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Chart Placeholder -->
      <div class="chart-section">
        <div class="section-title">
          <i class="el-icon-data-analysis"></i>
          Performance Trend (Last 7 Days)
        </div>
        <div class="chart-placeholder">
          <div class="placeholder-bars">
            <div v-for="i in 7" :key="i" class="bar" :style="{ height: `${Math.random() * 80 + 20}%` }"></div>
          </div>
          <div class="placeholder-text">Performance data visualization</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <el-button type="primary" size="default" @click="handleMaintenanceRequest">
          <i class="el-icon-edit"></i>
          Request Maintenance
        </el-button>
        <el-button type="default" size="default" @click="handleViewHistory">
          <i class="el-icon-document"></i>
          View History
        </el-button>
        <el-button type="default" size="default" @click="handleViewDetails">
          <i class="el-icon-info"></i>
          Full Details
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps( {
  zone : {
    type : Object,
    default : null
  },
  visible : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['close'] )

const dialogVisible = computed( {
  get : () => props.visible,
  set : value => {
    if ( !value ) {
      emit( 'close' )
    }
  }
} )

const handleClose = () => {
  emit( 'close' )
}

const getStatusText = status => {
  const statusMap = {
    operational : 'Operational',
    warning : 'Warning',
    error : 'Error',
    idle : 'Idle'
  }
  return statusMap[status] || status
}

const formatDate = dateStr => {
  if ( !dateStr ) return 'N/A'
  const date = new Date( dateStr )
  return date.toLocaleDateString( 'en-US', { year : 'numeric', month : 'short', day : 'numeric' } )
}

const handleMaintenanceRequest = () => {
  ElMessage.success( 'Maintenance request created successfully' )
  // TODO: Navigate to maintenance request page or open form
}

const handleViewHistory = () => {
  ElMessage.info( 'Opening equipment history...' )
  // TODO: Navigate to history page
}

const handleViewDetails = () => {
  ElMessage.info( 'Opening detailed view...' )
  // TODO: Navigate to equipment detail page
}
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 0;
}

.status-header {
  background: linear-gradient(135deg, #f0f2f5 0%, #e5e7eb 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  &.status-operational {
    background: linear-gradient(135deg, rgba(48, 176, 143, 0.1) 0%, rgba(48, 176, 143, 0.05) 100%);
  }

  &.status-warning {
    background: linear-gradient(135deg, rgba(254, 193, 113, 0.1) 0%, rgba(254, 193, 113, 0.05) 100%);
  }

  &.status-error {
    background: linear-gradient(135deg, rgba(192, 54, 57, 0.1) 0%, rgba(192, 54, 57, 0.05) 100%);
  }
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge-large {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.status-operational {
      background: #30b08f;
      box-shadow: 0 0 8px rgba(48, 176, 143, 0.6);
    }

    &.status-warning {
      background: #fec171;
      box-shadow: 0 0 8px rgba(254, 193, 113, 0.6);
    }

    &.status-error {
      background: #c03639;
      box-shadow: 0 0 8px rgba(192, 54, 57, 0.6);
    }

    &.status-idle {
      background: #64748b;
    }
  }

  .status-text {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.alert-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #c03639;
  color: #fff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.metric-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  &.uptime {
    background: rgba(0, 133, 164, 0.1);
    color: #0085a4;
  }

  &.throughput {
    background: rgba(48, 176, 143, 0.1);
    color: #30b08f;
  }
}

.metric-info {
  flex: 1;

  .metric-label {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 20px;
    font-weight: 700;
    color: #333;
  }
}

.maintenance-section,
.chart-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f2f5;

  i {
    color: #0085a4;
  }
}

.maintenance-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.maintenance-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;

  .label {
    font-size: 14px;
    color: #666;
  }

  .value {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.chart-placeholder {
  background: linear-gradient(135deg, #f9fafb 0%, #f0f2f5 100%);
  border-radius: 8px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.placeholder-bars {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 100px;
  margin-bottom: 12px;

  .bar {
    width: 24px;
    background: linear-gradient(180deg, #0085a4 0%, #006b87 100%);
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease;

    &:hover {
      transform: scaleY(1.1);
    }
  }
}

.placeholder-text {
  font-size: 13px;
  color: #999;
}

.actions-section {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;

  .el-button {
    flex: 1;
  }
}
</style>

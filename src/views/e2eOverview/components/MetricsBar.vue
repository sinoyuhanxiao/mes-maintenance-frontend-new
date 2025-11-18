<template>
  <div class="metrics-bar">
    <div class="metrics-container">
      <!-- OEE Metric -->
      <div class="metric-card primary">
        <div class="metric-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-label">Overall Equipment Effectiveness</div>
          <div class="metric-value">
            {{ metrics.oee.toFixed(1) }}%
            <span class="metric-trend" :class="getTrendClass(metrics.oee, 85)">
              <el-icon>
                <Top v-if="metrics.oee >= 85" />
                <Bottom v-else />
              </el-icon>
            </span>
          </div>
          <div class="metric-progress">
            <el-progress
              :percentage="parseFloat(metrics.oee.toFixed(1))"
              :color="getOeeColor(metrics.oee)"
              :show-text="false"
              :stroke-width="6"
            />
          </div>
        </div>
      </div>

      <!-- Production Count Metric -->
      <div class="metric-card success">
        <div class="metric-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-label">Production Today</div>
          <div class="metric-value">
            {{ metrics.productionCount.toFixed(2) }}
            <span class="metric-unit-tons">tons</span>
            <span class="metric-unit">/ {{ metrics.productionTarget }}</span>
          </div>
          <div class="metric-subtext">
            <span class="metric-subtext-highlight"
              >{{ Math.round((metrics.productionCount / metrics.productionTarget) * 100) }}%</span
            >
            of daily target
          </div>
        </div>
      </div>

      <!-- Active Work Orders Metric -->
      <div class="metric-card info">
        <div class="metric-icon">
          <el-icon><Cpu /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-label">Active Work Orders</div>
          <div class="metric-value">
            {{ metrics.activeWorkOrders }} / {{ metrics.totalWorkOrders }}
            <span class="metric-percentage">
              ({{ Math.round((metrics.activeWorkOrders / metrics.totalWorkOrders) * 100) }}%)
            </span>
          </div>
          <div class="station-indicators">
            <div class="station-progress-bar">
              <div
                class="station-progress-fill"
                :style="{ width: `${(metrics.activeWorkOrders / metrics.totalWorkOrders) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alarms Metric -->
      <div class="metric-card" :class="metrics.alertCount > 0 ? 'warning' : 'success'">
        <div class="metric-icon">
          <el-icon><WarningFilled /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-label">Active Alarms</div>
          <div class="metric-value">
            {{ metrics.alertCount }}
            <span v-if="metrics.alertCount > 0" class="pulse-dot"></span>
          </div>
          <div class="metric-subtext">
            {{ metrics.alertCount === 0 ? 'All systems normal' : 'Requires attention' }}
          </div>
        </div>
      </div>

      <!-- Current Shift Metric -->
      <div class="metric-card secondary">
        <div class="metric-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="metric-content">
          <div class="metric-label">Current Shift</div>
          <div class="metric-value">{{ metrics.currentShift }}</div>
          <div class="metric-subtext">
            Active Workforce: <span class="metric-subtext-highlight">{{ metrics.workforceCount }}</span> personnel
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { DataAnalysis, Box, Cpu, WarningFilled, Clock, Top, Bottom } from '@element-plus/icons-vue'
// import CountUp from './CountUp.vue'

const props = defineProps( {
  metrics : {
    type : Object,
    required : true,
    default : () => ( {
      oee : 0,
      productionCount : 0,
      productionTarget : 0,
      activeStations : 0,
      totalStations : 0,
      alertCount : 0,
      currentShift : '',
      efficiency : 0
    } )
  }
} )

const getOeeColor = value => {
  if ( value >= 85 ) return '#30b08f'
  if ( value >= 70 ) return '#fec171'
  return '#c03639'
}

const getTrendClass = ( value, threshold ) => {
  return value >= threshold ? 'positive' : 'negative'
}

// eslint-disable-next-line no-unused-vars
const getProductionPercentage = () => {
  return Math.round( ( props.metrics.productionCount / props.metrics.productionTarget ) * 100 )
}
</script>

<style lang="scss" scoped>
.metrics-bar {
  padding: 20px 20px 0 20px;
  background-color: transparent;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 -3px 31px 0 rgb(0 0 0 / 5%), 0 6px 20px 0 rgb(0 0 0 / 2%);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  &.primary {
    border-left-color: #0085a4;

    .metric-icon {
      background: rgba(0, 133, 164, 0.1);
      color: #0085a4;
    }
  }

  &.success {
    border-left-color: #30b08f;

    .metric-icon {
      background: rgba(48, 176, 143, 0.1);
      color: #30b08f;
    }
  }

  &.info {
    border-left-color: #3a71a8;

    .metric-icon {
      background: rgba(58, 113, 168, 0.1);
      color: #3a71a8;
    }
  }

  &.warning {
    border-left-color: #fec171;

    .metric-icon {
      background: rgba(254, 193, 113, 0.1);
      color: #fec171;
    }
  }

  &.secondary {
    border-left-color: #409eff;

    .metric-icon {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }
  }
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-label {
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: 500;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  .metric-unit {
    font-size: 14px;
    color: #999;
    font-weight: 400;
  }

  .metric-unit-kg {
    font-size: 16px;
    color: #30b08f;
    font-weight: 600;
    margin-left: 4px;
  }

  .metric-unit-tons {
    font-size: 16px;
    color: #30b08f;
    font-weight: 600;
    margin-left: 4px;
  }

  .metric-percentage {
    font-size: 14px;
    color: #666;
    font-weight: 400;
  }

  .metric-trend {
    font-size: 14px;
    display: flex;
    align-items: center;

    &.positive {
      color: #30b08f;
    }

    &.negative {
      color: #c03639;
    }
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #c03639;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

.metric-subtext {
  font-size: 12px;
  color: #999;
  margin-top: 4px;

  .metric-subtext-highlight {
    font-weight: 700;
    color: #30b08f;
    font-size: 13px;
  }
}

.metric-progress {
  margin-top: 8px;
}

.station-indicators {
  margin-top: 8px;

  .station-progress-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;

    .station-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #30b08f 0%, #3ac9a8 100%);
      border-radius: 4px;
      transition: width 0.6s ease;
      box-shadow: 0 0 8px rgba(48, 176, 143, 0.4);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shimmer 2s infinite;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(192, 54, 57, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(192, 54, 57, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(192, 54, 57, 0);
  }
}

// Responsive adjustments
@media (max-width: 1600px) {
  .metrics-bar {
    padding: 15px 15px 0 15px;
  }

  .metrics-container {
    gap: 12px;
    margin-bottom: 15px;
  }

  .metric-card {
    padding: 12px;
  }

  .metric-value {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .metrics-container {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 12px;
  }
}
</style>

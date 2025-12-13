<template>
  <div class="status-badge" :class="[`status-${status}`, { 'has-pulse': showPulse }]">
    <div class="status-dot"></div>
    <div v-if="oeeValue !== null" class="oee-percentage">{{ oeeValue.toFixed(1) }}%</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps( {
  status : {
    type : String,
    required : true,
    validator : value =>
      ['operational', 'warning', 'error', 'idle', 'excellent', 'good', 'fair', 'poor'].includes( value )
  },
  showPulse : {
    type : Boolean,
    default : false
  },
  oeeValue : {
    type : Number,
    default : null
  }
} )
</script>

<style lang="scss" scoped>
.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: all 0.3s ease;

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .oee-percentage {
    position: absolute;
    opacity: 0;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 0.3s ease;
    color: #ffffff;
  }

  // Operational status colors
  &.status-operational {
    .status-dot {
      background: #30b08f;
      box-shadow: 0 0 8px rgba(48, 176, 143, 0.6), 0 0 0 2px rgba(48, 176, 143, 0.2);
    }
  }

  // Warning status colors
  &.status-warning {
    .status-dot {
      background: #fec171;
      box-shadow: 0 0 8px rgba(254, 193, 113, 0.6), 0 0 0 2px rgba(254, 193, 113, 0.2);
    }
  }

  // Error status colors
  &.status-error {
    .status-dot {
      background: #c03639;
      box-shadow: 0 0 8px rgba(192, 54, 57, 0.6), 0 0 0 2px rgba(192, 54, 57, 0.2);
    }
  }

  // Idle status colors
  &.status-idle {
    .status-dot {
      background: #64748b;
      box-shadow: 0 0 0 2px rgba(100, 116, 139, 0.2);
    }
  }

  // OEE-based status colors (excellent)
  &.status-excellent {
    .status-dot {
      background: #30b08f;
      box-shadow: 0 0 8px rgba(48, 176, 143, 0.6), 0 0 0 2px rgba(48, 176, 143, 0.2);
    }
  }

  // OEE-based status colors (good)
  &.status-good {
    .status-dot {
      background: #f39c12;
      box-shadow: 0 0 8px rgba(243, 156, 18, 0.6), 0 0 0 2px rgba(243, 156, 18, 0.2);
    }
  }

  // OEE-based status colors (fair)
  &.status-fair {
    .status-dot {
      background: #c03639;
      box-shadow: 0 0 8px rgba(192, 54, 57, 0.6), 0 0 0 2px rgba(192, 54, 57, 0.2);
    }
  }

  // OEE-based status colors (poor)
  &.status-poor {
    .status-dot {
      background: #64748b;
      box-shadow: 0 0 0 2px rgba(100, 116, 139, 0.2);
    }
  }

  &.has-pulse {
    .status-dot {
      animation: pulse-ring 2s infinite;
    }
  }
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 8px rgba(192, 54, 57, 0.6), 0 0 0 0 rgba(192, 54, 57, 0.4);
  }
  50% {
    box-shadow: 0 0 8px rgba(192, 54, 57, 0.6), 0 0 0 8px rgba(192, 54, 57, 0);
  }
  100% {
    box-shadow: 0 0 8px rgba(192, 54, 57, 0.6), 0 0 0 0 rgba(192, 54, 57, 0);
  }
}
</style>

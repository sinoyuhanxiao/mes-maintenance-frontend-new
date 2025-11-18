<template>
  <div class="status-badge" :class="[`status-${status}`, { 'has-pulse': showPulse }]">
    <div class="status-dot"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps( {
  status : {
    type : String,
    required : true,
    validator : value => ['operational', 'warning', 'error', 'idle'].includes( value )
  },
  showPulse : {
    type : Boolean,
    default : false
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

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  &.status-operational {
    .status-dot {
      background: #30b08f;
      box-shadow: 0 0 8px rgba(48, 176, 143, 0.6), 0 0 0 2px rgba(48, 176, 143, 0.2);
    }
  }

  &.status-warning {
    .status-dot {
      background: #fec171;
      box-shadow: 0 0 8px rgba(254, 193, 113, 0.6), 0 0 0 2px rgba(254, 193, 113, 0.2);
    }
  }

  &.status-error {
    .status-dot {
      background: #c03639;
      box-shadow: 0 0 8px rgba(192, 54, 57, 0.6), 0 0 0 2px rgba(192, 54, 57, 0.2);
    }
  }

  &.status-idle {
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

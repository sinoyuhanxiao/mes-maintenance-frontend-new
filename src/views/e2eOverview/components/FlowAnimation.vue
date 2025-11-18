<template>
  <svg class="flow-animation" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradient for flow dots -->
      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color: #0085a4; stop-opacity: 0" />
        <stop offset="50%" style="stop-color: #0085a4; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #0085a4; stop-opacity: 0" />
      </linearGradient>

      <!-- Arrow marker -->
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="rgba(0, 133, 164, 0.3)" />
      </marker>
    </defs>

    <!-- Flow paths with animated dots -->
    <g v-for="(path, index) in flowPaths" :key="index">
      <!-- Path line -->
      <line
        :x1="path.from.x"
        :y1="path.from.y"
        :x2="path.to.x"
        :y2="path.to.y"
        stroke="rgba(0, 133, 164, 0.2)"
        stroke-width="2"
        stroke-dasharray="5,5"
        marker-end="url(#arrowhead)"
      />

      <!-- Animated flow dot -->
      <circle r="4" fill="url(#flowGradient)" class="flow-dot" :style="getAnimationStyle(path, index)">
        <animateMotion :dur="`${3 / path.speed}s`" repeatCount="indefinite" :begin="`${index * 0.5}s`">
          <mpath :href="`#path-${index}`" />
        </animateMotion>
      </circle>

      <!-- Hidden path for animation -->
      <path
        :id="`path-${index}`"
        :d="`M ${path.from.x} ${path.from.y} L ${path.to.x} ${path.to.y}`"
        fill="none"
        stroke="none"
      />
    </g>
  </svg>
</template>

<script setup>
import { defineProps } from 'vue'

// eslint-disable-next-line no-unused-vars
const props = defineProps( {
  flowPaths : {
    type : Array,
    default : () => []
  }
} )

const getAnimationStyle = ( path, index ) => {
  return {
    animationDelay : `${index * 0.5}s`
  }
}
</script>

<style lang="scss" scoped>
.flow-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.flow-dot {
  filter: drop-shadow(0 0 4px rgba(0, 133, 164, 0.6));
}
</style>

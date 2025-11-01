<template>
  <el-card
    class="sub-item-card"
    shadow="hover"
    :class="[{ clickable: !disabled, selected, disabled }, `size-${size}`]"
    :tabindex="disabled ? -1 : 0"
    role="button"
    :aria-disabled="disabled ? 'true' : 'false'"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <div class="card-content">
      <!-- Circular badge with white background -->
      <div class="index-circle" :style="{ '--accent': circleColor }">{{ number }}</div>

      <!-- Text -->
      <div class="text-block">
        <el-text class="title">{{ text }}</el-text>
        <el-text v-if="subtitle" type="info" class="subtitle">{{ subtitle }}</el-text>
      </div>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps( {
  number : { type : [String, Number], default : 1 },
  text : { type : String, default : 'Sub-Item Text' },
  subtitle : { type : String, default : '' },
  circleColor : { type : String, default : '#409EFF' },
  nodeId : { type : [String, Number], default : null },
  size : { type : String, default : 'md' },
  selected : { type : Boolean, default : false },
  disabled : { type : Boolean, default : false }
} )

const emit = defineEmits( ['card-click'] )

function onActivate() {
  if ( props.disabled ) return
  emit( 'card-click', props.nodeId ?? props.number )
}
</script>

<style scoped>
/* Add spacing between cards */
.sub-item-card {
  width: 100%; /* fill container width */
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px; /* 🔑 gap between cards */
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease;
  outline: none;
  border-radius: 8px;
}

/* El-card body padding */
.sub-item-card :deep(.el-card__body) {
  padding: 10px 14px;
}

/* Interactivity */
.sub-item-card.clickable {
  cursor: pointer;
}
.sub-item-card.clickable:hover {
  transform: translateY(-1px);
}
.sub-item-card.clickable:focus-visible {
  box-shadow: 0 0 0 2px var(--accent, v-bind(circleColor));
}

/* States */
.sub-item-card.selected {
  border-color: var(--accent, v-bind(circleColor));
  background: color-mix(in oklch, var(--accent, v-bind(circleColor)) 8%, white);
}
.sub-item-card.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Layout inside card */
.card-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  justify-content: flex-start; /* force left alignment */
}

/* Circular number badge */
.index-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  color: var(--accent, v-bind(circleColor));
  background: #fff; /* always white background */
  border: 2px solid var(--accent, v-bind(circleColor));
  flex-shrink: 0;
}

/* Text block */
.text-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* ⬅️ ensures left text */
  text-align: left;
}

.title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive: narrower max-width only on small screens */
@media (max-width: 768px) {
  .sub-item-card {
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }
}
@media (max-width: 480px) {
  .sub-item-card {
    max-width: 260px;
  }
}
/* Larger font on wide monitors */
@media (min-width: 1440px) {
  .title {
    font-size: 15px;
  }
  .subtitle {
    font-size: 14px;
  }
  .index-circle {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
}
</style>

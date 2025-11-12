<template>
  <div class="version-info-container" :class="{ collapse: props.collapse }">
    <transition name="versionFade">
      <div v-if="!props.collapse" class="version-content">
        <div class="version-item">
          <span class="version-label">Version:</span>
          <span class="version-value">{{ version }}</span>
        </div>
        <div class="version-item">
          <span class="version-label">Released:</span>
          <span class="version-value">{{ releaseDate }}</span>
        </div>
      </div>
      <div v-else class="version-content-collapsed">
        <span class="version-value-short">{{ version }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { VERSION, RELEASE_DATE } from '@/utils/env'

const props = defineProps( {
  collapse : {
    type : Boolean,
    required : true
  }
} )

const version = VERSION
const releaseDate = RELEASE_DATE

defineOptions( {
  name : 'VersionInfo'
} )
</script>

<style lang="scss" scoped>
.versionFade-enter-active {
  transition: opacity 0.3s;
}

.versionFade-enter-from,
.versionFade-leave-to {
  opacity: 0;
}

.version-info-container {
  position: relative;
  width: 88%;
  min-height: 45px;
  padding: 12px 16px;
  background: #1f2329;
  border-top: 1px solid #2b2f3a;
  flex-shrink: 0;

  .version-content {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .version-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      line-height: 1.4;

      .version-label {
        color: #909399;
        font-weight: 400;
      }

      .version-value {
        color: #c0c4cc;
        font-weight: 500;
      }
    }
  }

  .version-content-collapsed {
    display: flex;
    justify-content: center;
    align-items: center;

    .version-value-short {
      color: #c0c4cc;
      font-size: 11px;
      font-weight: 500;
    }
  }

  &.collapse {
    padding: 8px 4px;
    min-height: 40px;
    text-align: center;
  }
}
</style>

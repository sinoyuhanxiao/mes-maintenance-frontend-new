<template>
  <div
    ref="wrapperRef"
    :class="['mes-layout', viewMode === 'todo' || viewMode === 'calendar' ? 'todo-mode' : 'table-mode']"
  >
    <div class="header">
      <!-- Title row with optional view mode selector -->
      <div class="header-title-row">
        <!-- Custom title slot or default title -->
        <div v-if="$slots.title" class="header-custom-title">
          <slot name="title" />
        </div>
        <div v-else class="header-tt ellipsis">{{ title }}</div>

        <!-- Optional view mode selector slot -->
        <div v-if="$slots.viewMode" class="header-view-mode">
          <slot name="viewMode" />
        </div>
      </div>

      <!-- Subtitle (only show if not using custom title) -->
      <div v-if="!$slots.title && subtitle" class="header-desc ellipsis-col ellipsis-col2" v-html="subtitle"></div>

      <!-- Head slot -->
      <slot name="head" />
    </div>
    <div class="body">
      <slot name="body" />
    </div>
    <div v-if="viewMode === 'table'" class="footer">
      <slot name="foot" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent( {
  name : 'MesLayout',
  props : {
    title : {
      type : String,
      default : ''
    },
    subtitle : {
      type : String,
      default : ''
    },
    viewMode : {
      type : String,
      default : 'table' // 'table' or 'todo'
    }
  },
  setup() {
    const wrapperRef = ref()
    return { wrapperRef }
  }
} )
</script>

<style lang="scss" scoped>
.mes-layout {
  flex-direction: column;
  height: calc(100vh - 90px);
  display: grid;
  &.table-mode {
    grid-template-rows: 75px auto 60px;
  }

  &.todo-mode {
    grid-template-rows: 75px auto;
  }

  .header {
    display: grid;
    grid-template-rows: 70% 20% auto;
    box-sizing: border-box;
    padding: 15px;
    background: #fff;

    .header-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-tt {
      margin-right: 12px;
      color: #181818;
      font-weight: 600;
      font-size: 20px;
      line-height: 32px;
      flex: 1;
    }

    .header-desc {
      color: #29282b;
      line-height: 20px;
    }

    .header-custom-title {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .header-view-mode {
      display: flex;
      align-items: center;
      margin-left: 16px;
      flex-shrink: 0;
    }
  }

  @media (max-width: 768px) {
    .header {
      .header-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .header-tt {
        margin-right: 0;
        flex: none;
      }

      .header-custom-title {
        flex: none;
        width: 100%;
      }

      .header-view-mode {
        margin-left: 0;
        align-self: flex-end;
      }
    }
  }

  @media (max-width: 480px) {
    .header {
      .header-title-row {
        align-items: stretch;
      }

      .header-view-mode {
        align-self: stretch;
        justify-content: center;
      }
    }
  }

  .body {
    flex: 1 1 auto;
    padding: 16px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .footer {
    flex: 0 0 auto;
    background: #fff;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 1600px) {
  .mes-layout {
    grid-template-rows: 10% auto 10%;
  }
}
</style>

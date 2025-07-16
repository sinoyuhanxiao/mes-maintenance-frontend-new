<template>
  <div ref="wrapperRef" class="mes-layout">
    <div class="header">
      <div class="header-tt ellipsis">{{ title }}</div>
      <div class="header-desc ellipsis-col ellipsis-col2" v-html="subtitle"></div>
      <slot name="head" />
    </div>
    <div class="body">
      <slot name="body" />
    </div>
    <div class="footer">
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
  grid-template-rows: 15% auto 10%;

  .header {
    display: grid;
    grid-template-rows: 55% 35% auto;
    box-sizing: border-box;
    padding: 15px;
    background: #fff;
    .header-tt {
      margin-right: 12px;
      color: #181818;
      font-weight: 600;
      font-size: 20px;
      line-height: 32px;
    }
    .header-desc {
      color: #29282b;
      line-height: 20px;
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
  }
}

@media (max-width: 1600px) {
  .mes-layout {
    grid-template-rows: 20% auto 10%;
  }
}
</style>

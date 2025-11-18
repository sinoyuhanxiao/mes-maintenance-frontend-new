<template>
  <div :class="{ 'has-logo': set.showLogo, 'has-version': set.showVersion }" class="sidebar-wrapper">
    <Logo :class="set.layoutMod + '-logo'" v-if="set.showLogo" :collapse="set.isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <Menu />
    </el-scrollbar>
    <VersionInfo v-if="set.showVersion" :collapse="set.isCollapse" />
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useAppStore, useSettingsStore } from '@/store'
// import { ENV_UTILS } from '@/utils/env'
import Logo from './Logo'
import Menu from './Menu'
import VersionInfo from './VersionInfo'

const appStore = useAppStore()
const settingsStore = useSettingsStore()

const set = reactive( {
  showLogo : computed( () => {
    return settingsStore.sidebarLogo
  } ),
  layoutMod : computed( () => {
    return settingsStore.layoutMod
  } ),
  isCollapse : computed( () => {
    return !appStore.sidebar.opened
  } ),
  showVersion : computed( () => {
    return true
  } )
} )
</script>

<style scoped lang="scss">
.sidebar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.horizontal-logo {
  width: 210px;
  display: flex;
}
</style>

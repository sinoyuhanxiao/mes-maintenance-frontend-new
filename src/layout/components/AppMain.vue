<template>
  <section class="app-main">
    <el-scrollbar :height="height">
      <!-- Production view - always rendered but hidden with visibility -->
      <div :class="{ 'route-hidden': !isProductionRoute }" class="route-view production-view">
        <ProductionIframeView v-if="hasVisitedProduction" />
      </div>

      <!-- Other routes with normal keep-alive and transition -->
      <router-view v-if="!isProductionRoute">
        <template #default="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="key" />
            </keep-alive>
          </transition>
        </template>
      </router-view>
    </el-scrollbar>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store'
import ProductionIframeView from '@/views/shared/ProductionIframeView.vue'

const route = useRoute()
const tagsViewStore = useTagsViewStore()
const hasVisitedProduction = ref( false )

const isProductionRoute = computed( () => {
  return route.path.startsWith( '/production' )
} )

const key = computed( () => {
  return route.path
} )

const cachedViews = computed( () => {
  return tagsViewStore.cachedViews
} )

// Track if user has visited Production to mount the component
watch(
  isProductionRoute,
  isProduction => {
    if ( isProduction ) {
      hasVisitedProduction.value = true
    }
  },
  { immediate : true }
)

const props = defineProps( {
  needTagsView : {
    type : Boolean,
    required : true,
    default : false
  }
} )

const height = ref( 'calc( 100vh - 84px)' )
watch(
  () => props.needTagsView,
  () => {
    height.value = props.needTagsView ? 'calc( 100vh - 84px )' : 'calc( 100vh - 50px )'
  },
  {
    immediate : true
  }
)

defineOptions( {
  name : 'AppMain'
} )
</script>

<style lang="scss" scoped>
.route-view {
  width: 100%;
  height: 100%;
}

.production-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.route-hidden {
  visibility: hidden;
  pointer-events: none;
  position: absolute;
  z-index: -1;
}
</style>

<style lang="scss" scoped>
.app-main {
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
  background: white;
}
.fixed-header + .app-main {
  padding-top: 50px;
}
.hasTagsView {
  .app-main {
    min-height: calc(100vh - 84px);
  }
  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>

<template>
  <div v-if="!props.item.meta?.hidden">
    <template
      v-if="
        hasOneShowingChild(props.item.children, props.item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !props.item.meta?.alwaysShow
      "
    >
      <AppLink v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !props.isNest }">
          <svg-icon
            class-name="menu-icons"
            v-if="onlyOneChild.meta.icon || (props.item.meta && props.item.meta.icon)"
            :icon-class="onlyOneChild.meta.icon || (props.item.meta && props.item.meta.icon)"
          />
          <template #title>
            <span> {{ renderTitle(onlyOneChild) }} </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <el-sub-menu v-else ref="subMenu" popper-class="sub-menu-test" :index="resolvePath(props.item.path)">
      <template #title>
        <svg-icon
          class-name="menu-icons"
          v-if="props.item.meta && props.item.meta.icon"
          :icon-class="props.item.meta && props.item.meta.icon"
        />
        <span> {{ renderTitle(props.item) }} </span>
      </template>
      <SidebarItem
        v-for="child in props.item.children || []"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import path from 'path-browserify'
import { isExternal } from '@/utils/validate'
import AppLink from './Link.vue'

// eslint-disable-next-line no-undef
const props = defineProps( {
  item : {
    type : Object,
    required : true
  },
  isNest : {
    type : Boolean,
    default : false
  },
  basePath : {
    type : String,
    default : ''
  }
} )
const { t } = useI18n()
const onlyOneChild = ref( null )
const subMenu = ref( null )

// If the title is a string, render it as `t(title)`, otherwise, fallback to the title itself / breadcrumb / route name.
function renderTitle( routeItem ) {
  const raw = routeItem?.meta?.title
  if ( typeof raw === 'string' ) {
    try {
      return t( raw )
    } catch ( e ) {
      // i18n 没有这个 key 时，优雅降级为原值
      return raw
    }
  }
  return raw ?? routeItem?.meta?.breadcrumb ?? routeItem?.name ?? ''
}

function hasOneShowingChild( children = [], parent ) {
  const showingChildren = ( children || [] ).filter( item => {
    if ( item.meta?.hidden ) {
      return false
    } else {
      onlyOneChild.value = item
      return true
    }
  } )
  if ( showingChildren.length === 1 ) {
    return true
  }
  if ( showingChildren.length === 0 ) {
    onlyOneChild.value = { ...parent, path : '', noShowingChildren : true }
    return true
  }
  return false
}

const resolvePath = routePath => {
  if ( isExternal( routePath ) ) {
    return routePath
  }
  if ( isExternal( props.basePath ) ) {
    return props.basePath
  }
  return path.resolve( props.basePath, routePath )
}

defineOptions( {
  name : 'SidebarItem'
} )
</script>

<template>
  <div
    v-show="isVisible"
    class="json-tree-item"
    :style="{ paddingLeft: level * 16 + 'px' }"
    :class="{ 'search-highlight': matchesSearch && searchTerm }"
  >
    <div class="item-header" @click="toggleExpanded" :class="{ 'is-leaf': isLeaf, clickable: !isLeaf }">
      <el-icon v-if="!isLeaf" class="expand-icon" :class="{ expanded: expanded }">
        <ArrowRight />
      </el-icon>
      <span class="item-key">{{ nodeKey }}:</span>
      <span class="item-type" :class="nodeType">{{ nodeType }}</span>
      <span v-if="isLeaf" class="item-value">{{ displayValue }}</span>
    </div>
    <div v-if="expanded && !isLeaf" class="item-children">
      <JsonTreeItem
        v-for="(childValue, childKey) in value"
        :key="childKey"
        :node-key="childKey"
        :value="childValue"
        :level="level + 1"
        :search-term="searchTerm"
        :force-expand="forceExpand"
        :force-collapse="forceCollapse"
        @reset-force-states="emit('reset-force-states')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps( {
  nodeKey : {
    type : [String, Number],
    required : true
  },
  value : {
    required : true
  },
  level : {
    type : Number,
    default : 0
  },
  searchTerm : {
    type : String,
    default : ''
  },
  forceExpand : {
    type : Boolean,
    default : false
  },
  forceCollapse : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['reset-force-states'] )

const expanded = ref( false )

const isObject = computed( () => props.value !== null && typeof props.value === 'object' && !Array.isArray( props.value ) )

const isArray = computed( () => Array.isArray( props.value ) )

const isLeaf = computed( () => !isObject.value && !isArray.value )

const nodeType = computed( () => {
  if ( props.value === null ) return 'null'
  if ( isArray.value ) return `array[${props.value.length}]`
  if ( isObject.value ) return `object{${Object.keys( props.value ).length}}`
  return typeof props.value
} )

const displayValue = computed( () => {
  if ( props.value === null ) return 'null'
  if ( typeof props.value === 'string' ) return `"${props.value}"`
  if ( typeof props.value === 'boolean' ) return props.value.toString()
  return props.value
} )

// Search functionality
const matchesSearch = computed( () => {
  if ( !props.searchTerm ) return true

  const searchLower = props.searchTerm.toLowerCase()
  const keyMatches = String( props.nodeKey ).toLowerCase().includes( searchLower )

  // For leaf nodes, also check the value
  if ( isLeaf.value ) {
    const valueStr = String( props.value ).toLowerCase()
    return keyMatches || valueStr.includes( searchLower )
  }

  return keyMatches
} )

// Check if any child matches search
const hasMatchingChildren = computed( () => {
  if ( !props.searchTerm || isLeaf.value ) return false

  const searchDeep = ( obj, search ) => {
    if ( typeof obj === 'object' && obj !== null ) {
      for ( const [key, value] of Object.entries( obj ) ) {
        if (
          String( key ).toLowerCase().includes( search ) ||
          String( value ).toLowerCase().includes( search ) ||
          ( typeof value === 'object' && searchDeep( value, search ) )
        ) {
          return true
        }
      }
    }
    return false
  }

  return searchDeep( props.value, props.searchTerm.toLowerCase() )
} )

// Item should be visible if it matches search or has matching children
const isVisible = computed( () => !props.searchTerm || matchesSearch.value || hasMatchingChildren.value )

// Auto-expand if searching and has matching children
const shouldAutoExpand = computed( () => props.searchTerm && hasMatchingChildren.value )

// Watch for force expand/collapse
watch(
  () => props.forceExpand,
  newVal => {
    if ( newVal && !isLeaf.value ) {
      expanded.value = true
      emit( 'reset-force-states' )
    }
  }
)

watch(
  () => props.forceCollapse,
  newVal => {
    if ( newVal && !isLeaf.value ) {
      expanded.value = false
      emit( 'reset-force-states' )
    }
  }
)

// Auto-expand for search
watch( shouldAutoExpand, newVal => {
  if ( newVal && !isLeaf.value ) {
    expanded.value = true
  }
} )

const toggleExpanded = () => {
  if ( !isLeaf.value ) {
    expanded.value = !expanded.value
  }
}

defineOptions( {
  name : 'JsonTreeItem'
} )
</script>

<style scoped lang="scss">
.json-tree-item {
  &.search-highlight {
    .item-header {
      background: rgba(255, 235, 59, 0.2);
      border: 1px solid rgba(255, 193, 7, 0.3);
    }
  }

  .item-header {
    display: flex;
    align-items: center;
    padding: 2px 4px;
    border-radius: 3px;
    gap: 6px;
    min-height: 20px;

    &.clickable {
      cursor: pointer;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }

    &.is-leaf {
      cursor: default;
    }

    .expand-icon {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      transition: transform 0.2s ease;
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.expanded {
        transform: rotate(90deg);
      }
    }

    .item-key {
      color: var(--el-color-primary);
      font-weight: 500;
      white-space: nowrap;
    }

    .item-type {
      font-size: 10px;
      padding: 1px 4px;
      border-radius: 2px;
      background: var(--el-fill-color-darker);
      color: var(--el-text-color-secondary);
      white-space: nowrap;

      &.string {
        background: #e8f4fd;
        color: #1890ff;
      }

      &.number {
        background: #fff2e8;
        color: #fa8c16;
      }

      &.boolean {
        background: #f6ffed;
        color: #52c41a;
      }

      &.null {
        background: #f5f5f5;
        color: #8c8c8c;
      }

      &:contains('array') {
        background: #fff1f0;
        color: #ff4d4f;
      }

      &:contains('object') {
        background: #f9f0ff;
        color: #722ed1;
      }
    }

    .item-value {
      color: var(--el-text-color-regular);
      word-break: break-all;
      flex: 1;
      min-width: 0;
    }
  }

  .item-children {
    border-left: 1px solid var(--el-border-color-lighter);
    margin-left: 6px;
  }
}

// Mobile responsive adjustments
@media (max-width: 768px) {
  .json-tree-item {
    .item-header {
      padding: 1px 2px;
      gap: 4px;
      min-height: 18px;

      .expand-icon {
        width: 10px;
        height: 10px;
        font-size: 10px;
      }

      .item-type {
        font-size: 9px;
        padding: 0px 2px;
      }
    }

    .item-children {
      margin-left: 4px;
    }
  }
}
</style>

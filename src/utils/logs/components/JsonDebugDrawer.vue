<template>
  <div>
    <!-- JSON Payload Drawer -->
    <el-drawer
      v-model="visible"
      direction="ltr"
      :modal="false"
      :show-close="false"
      :lock-scroll="false"
      :close-on-click-modal="false"
      :append-to-body="true"
      :size="drawerSize"
      class="json-payload-drawer"
      :z-index="99999"
    >
      <template #header>
        <div class="drawer-header">
          <h3>{{ title }}</h3>
          <div class="drawer-actions">
            <div class="width-control">
              <el-text size="small">Width:</el-text>
              <el-input
                v-model.number="drawerWidth"
                size="small"
                type="number"
                :min="300"
                :max="1200"
                style="width: 80px"
                @change="updateDrawerWidth"
              />
              <el-text size="small">px</el-text>
            </div>
            <el-button size="small" @click="copyToClipboard" :icon="DocumentCopy"> Copy </el-button>
            <el-button size="small" @click="closeDrawer" :icon="Close"> Close </el-button>
          </div>
        </div>
      </template>

      <div class="drawer-content">
        <div class="payload-info">
          <el-text type="info" size="small">
            Fields: {{ payloadData ? Object.keys(payloadData).length : 0 }} |
            {{ subtitle }}
          </el-text>
        </div>

        <!-- Search and Controls Bar -->
        <div v-if="payloadData" class="controls-bar">
          <div class="search-container">
            <el-input
              v-model="searchTerm"
              placeholder="Search keys and values..."
              size="small"
              clearable
              :prefix-icon="Search"
              class="search-input"
            />
          </div>
          <div class="control-buttons">
            <el-button
              size="small"
              @click="toggleExpandCollapse"
              :icon="isAllExpanded ? Minus : Plus"
              :type="isAllExpanded ? 'warning' : 'primary'"
            >
              {{ isAllExpanded ? 'Collapse All' : 'Expand All' }}
            </el-button>
          </div>
        </div>

        <div class="json-tree-container">
          <div v-if="payloadData && isDrawerStable" class="json-tree">
            <JsonTreeItem
              v-for="(value, key) in payloadData"
              :key="key"
              :node-key="key"
              :value="value"
              :level="0"
              :search-term="searchTerm"
              :force-expand="forceExpandAll"
              :force-collapse="forceCollapseAll"
              @reset-force-states="resetForceStates"
            />
          </div>
          <div v-else-if="payloadData && !isDrawerStable" class="loading-tree">
            <el-text type="info" size="small">Loading...</el-text>
          </div>
          <div v-else class="no-payload">
            <el-text type="placeholder">Click "Logs" to view payload</el-text>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, DocumentCopy, Search, Plus, Minus } from '@element-plus/icons-vue'
import JsonTreeItem from './JsonTreeItem.vue'

const props = defineProps( {
  modelValue : {
    type : Boolean,
    default : false
  },
  payloadData : {
    type : Object,
    default : null
  },
  title : {
    type : String,
    default : 'Request Payload'
  },
  subtitle : {
    type : String,
    default : 'Click refresh to update'
  }
} )

const emit = defineEmits( ['update:modelValue'] )

const visible = computed( {
  get : () => props.modelValue,
  set : value => emit( 'update:modelValue', value )
} )

// Search and expand/collapse functionality
const searchTerm = ref( '' )
const forceExpandAll = ref( false )
const forceCollapseAll = ref( false )
const isAllExpanded = ref( false )

// Drawer width functionality
const drawerWidth = ref( 500 )
const actualDrawerWidth = ref( 500 )
const drawerSize = computed( () => `${actualDrawerWidth.value}px` )

// Debounce function
const debounce = ( func, wait ) => {
  let timeout
  return function executedFunction( ...args ) {
    const later = () => {
      clearTimeout( timeout )
      func( ...args )
    }
    clearTimeout( timeout )
    timeout = setTimeout( later, wait )
  }
}

// Debounced width update function
const debouncedWidthUpdate = debounce( newWidth => {
  // Validate and constrain the width
  let constrainedWidth = newWidth
  if ( constrainedWidth < 300 ) constrainedWidth = 300
  if ( constrainedWidth > 1200 ) constrainedWidth = 1200

  actualDrawerWidth.value = constrainedWidth

  // Update the input if it was constrained
  if ( constrainedWidth !== newWidth ) {
    drawerWidth.value = constrainedWidth
  }
}, 300 )

// Watch for changes in drawerWidth and debounce updates
watch( drawerWidth, newWidth => {
  if ( newWidth && typeof newWidth === 'number' ) {
    debouncedWidthUpdate( newWidth )
  }
} )

const updateDrawerWidth = () => {
  // This function is now handled by the watcher
  debouncedWidthUpdate( drawerWidth.value )
}

const closeDrawer = () => {
  visible.value = false
}

// Add safety check for component stability
const isDrawerStable = ref( true )

// Watch for drawer visibility changes to prevent rapid state changes
watch( visible, ( newVal, oldVal ) => {
  if ( newVal !== oldVal ) {
    isDrawerStable.value = false
    setTimeout( () => {
      isDrawerStable.value = true
    }, 150 ) // Small delay to ensure component is stable
  }
} )

const copyToClipboard = async() => {
  try {
    const jsonString = JSON.stringify( props.payloadData, null, 2 )
    await navigator.clipboard.writeText( jsonString )
    ElMessage.success( 'Payload copied to clipboard!' )
  } catch ( error ) {
    console.error( 'Failed to copy to clipboard:', error )
    ElMessage.error( 'Failed to copy to clipboard' )
  }
}

const toggleExpandCollapse = () => {
  if ( isAllExpanded.value ) {
    // Currently expanded, so collapse all
    forceExpandAll.value = false
    forceCollapseAll.value = true
    isAllExpanded.value = false
  } else {
    // Currently collapsed, so expand all
    forceCollapseAll.value = false
    forceExpandAll.value = true
    isAllExpanded.value = true
  }

  // Reset force states after a brief moment to allow tree items to respond
  setTimeout( () => {
    forceExpandAll.value = false
    forceCollapseAll.value = false
  }, 100 )
}

const resetForceStates = () => {
  forceExpandAll.value = false
  forceCollapseAll.value = false
}

defineOptions( {
  name : 'JsonDebugDrawer'
} )
</script>

<style scoped lang="scss">
// JSON Payload Drawer styles - Maximum z-index to override all elements
:deep(.json-payload-drawer) {
  z-index: 99999 !important;
  position: fixed !important;

  .el-drawer {
    z-index: 99999 !important;
    position: fixed !important;
  }

  .el-drawer__container {
    z-index: 99999 !important;
    position: fixed !important;
  }

  .el-drawer__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    z-index: 99999 !important;
  }

  .el-drawer__header {
    z-index: 99999 !important;
    margin-bottom: unset !important;
  }
}

// Global override to ensure drawer appears above sidebar
:global(.json-payload-drawer) {
  z-index: 99999 !important;
}

// Target the specific drawer when it's appended to body
:global(body > .el-drawer.json-payload-drawer) {
  z-index: 99999 !important;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  width: 100%;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    flex: 1;
  }

  .drawer-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    align-items: center;

    .width-control {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
      border: 1px solid var(--el-border-color-lighter);

      .el-text {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }
  }
}

.drawer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;

  .payload-info {
    margin-bottom: 12px;
    padding: 8px 12px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
  }

  .controls-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: var(--el-fill-color-extra-light);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;

    .search-container {
      flex: 1;
      min-width: 200px;

      .search-input {
        width: 100%;
      }
    }

    .control-buttons {
      display: flex;
      gap: 6px;
      flex-shrink: 0;

      .el-button {
        font-size: 12px;
        padding: 4px 8px;
        min-height: 28px;

        &--primary {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }

        &--warning {
          background-color: var(--el-color-warning);
          border-color: var(--el-color-warning);
        }
      }
    }
  }

  .json-tree-container {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  .json-tree {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
  }

  .no-payload {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: var(--el-text-color-placeholder);
  }

  .loading-tree {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80px;
    color: var(--el-text-color-secondary);
  }
}

// JSON Tree Item styles
.json-tree-item {
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

// Mobile responsive adjustments for drawer
@media (max-width: 768px) {
  :deep(.json-payload-drawer) {
    .el-drawer {
      width: 90vw !important;
    }
  }

  .drawer-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;

    h3 {
      text-align: center;
      font-size: 14px;
    }

    .drawer-actions {
      justify-content: center;
    }
  }

  .drawer-content {
    padding: 12px;

    .json-tree {
      font-size: 11px;
    }
  }

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

:global(div:has(> .json-payload-drawer.el-drawer)) {
  width: 300px !important;
}
</style>

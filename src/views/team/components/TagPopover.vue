<template>
  <el-popover trigger="click" placement="top" :width="width">
    <!-- Trigger button -->
    <template #reference>
      <el-button type="info" plain size="small">
        {{ items.length }}
        {{ items.length === 1 ? singularLabel : pluralLabel }}
      </el-button>
    </template>

    <!-- Popover content -->
    <div class="popover-container">
      <!-- Search -->
      <el-input
        v-model="search"
        :placeholder="`Search ${pluralLabel}...`"
        clearable
        size="small"
        class="popover-search"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- Scrollable tags -->
      <div class="popover-tags">
        <slot v-for="item in filteredItems" :key="itemKey(item)" :item="item" />
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps( {
  items : {
    type : Array,
    default : () => []
  },
  singularLabel : {
    type : String,
    default : 'item'
  },
  pluralLabel : {
    type : String,
    default : 'items'
  },
  searchKey : {
    type : [String, Function],
    default : 'name' // string key or function
  },
  itemKey : {
    type : Function,
    default : item => item.id ?? item.name
  },
  width : {
    type : [String, Number],
    default : 320
  }
} )

const search = ref( '' )

const filteredItems = computed( () => {
  if ( !search.value ) return props.items

  return props.items.filter( item => {
    let label = ''

    if ( typeof props.searchKey === 'function' ) {
      label = props.searchKey( item )
    } else if ( typeof props.searchKey === 'string' ) {
      label = item[props.searchKey]
    }

    return String( label || '' )
      .toLowerCase()
      .includes( search.value.toLowerCase() )
  } )
} )
</script>

<style scoped lang="scss">
.popover-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popover-search {
  margin-bottom: 6px;
}

.popover-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px; /* limit height */
  overflow-y: auto;
  padding-right: 4px;
}
</style>

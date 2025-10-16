<template>
  <el-tree-select
    v-model="selectedIds"
    :data="treeData"
    :props="defaultProps"
    multiple
    check-strictly
    show-checkbox
    node-key="id"
    :default-expand-all="false"
    :filterable="true"
    :render-after-expand="false"
    :placeholder="t('common.filterByEquipmentPlaceholder')"
    :style="{ width }"
    clearable
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="maxCollapseTags"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElTreeSelect } from 'element-plus'
import { getEquipmentTree } from '@/api/equipment'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const treeData = ref( [] )

const props = defineProps( {
  modelValue : {
    type : Array,
    default : () => []
  },
  maxCollapseTags : {
    type : Number,
    default : 2
  },
  width : {
    type : String,
    default : '100%'
  }
} )

// Use computed binding to sync with parent
const selectedIds = computed( {
  get : () => props.modelValue,
  set : val => emit( 'update:modelValue', val )
} )

const defaultProps = {
  label : node => ( node.code ? `${node.name} (${node.code})` : node.name ),
  value : 'id',
  children : 'children'
}

onMounted( async() => {
  try {
    const res = await getEquipmentTree()
    treeData.value = res.data || []
  } catch ( err ) {
    console.error( 'Failed to fetch equipment tree:', err )
  }
} )

const emit = defineEmits( ['update:modelValue', 'change'] )
</script>

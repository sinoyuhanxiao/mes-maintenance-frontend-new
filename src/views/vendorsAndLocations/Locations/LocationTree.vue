<template>
  <div>
    <el-input v-model="filterText" placeholder="Search Location" clearable style="margin-bottom: 10px" />
    <el-scrollbar>
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="defaultProps"
        highlight-current
        node-key="id"
        :filter-node-method="filterNode"
        @node-click="onNodeClick"
        accordion
      />
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, defineExpose } from 'vue'

const props = defineProps({
  treeData: {
    type: Array,
    required: true,
  },
  defaultProps: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['node-click'])

const treeRef = ref()
const filterText = ref('')

const filterNode = (value, data) => {
  if (!value) return true
  return data.name?.toLowerCase().includes(value.toLowerCase())
}

watch(filterText, async val => {
  treeRef.value?.filter(val)
  await nextTick()

  const getFirstMatchedNode = nodes => {
    for (const node of nodes) {
      if (filterNode(val, node)) return node
      if (node.children?.length) {
        const match = getFirstMatchedNode(node.children)
        if (match) return match
      }
    }
    return null
  }

  const firstMatched = getFirstMatchedNode(props.treeData)
  if (firstMatched) {
    emit('node-click', { id: firstMatched.id })
    nextTick(() => {
      treeRef.value?.setCurrentKey(firstMatched.id)
    })
  }
})

const onNodeClick = node => {
  emit('node-click', node)
}

defineExpose({
  treeRef,
})
</script>

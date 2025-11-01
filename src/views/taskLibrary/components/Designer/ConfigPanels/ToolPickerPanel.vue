<template>
  <el-dialog
    :model-value="visible"
    title="Select Tools"
    width="600px"
    @update:model-value="$emit('close')"
    @close="$emit('close')"
    top="8vh"
  >
    <div class="tools-picker">
      <!-- Search -->
      <div class="search-section">
        <el-input v-model="searchQuery" placeholder="Search tools..." clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Available Tools -->
      <div class="available-section">
        <h4>Available Tools</h4>
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="filteredTools.length === 0" class="empty-tools">
          <el-empty description="No tools found" :image-size="60" />
        </div>
        <div v-else class="tools-list">
          <div
            v-for="tool in filteredTools"
            :key="tool.tool_id"
            class="tool-item"
            :class="{ selected: isToolSelected(tool.tool_id) }"
            @click="toggleTool(tool)"
          >
            <div class="tool-info">
              <div class="tool-name">{{ tool.name }}</div>
              <div v-if="tool.spec" class="tool-spec">{{ tool.spec }}</div>
            </div>
            <div class="tool-actions">
              <el-checkbox :model-value="isToolSelected(tool.tool_id)" @click.stop @change="toggleTool(tool)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Tools -->
      <div v-if="localSelectedTools.length > 0" class="selected-section">
        <div class="selected-section-header">
          <h4>Selected Tools ({{ localSelectedTools.length }})</h4>
          <el-button type="text" size="small" @click="clearAllTools" class="clear-all-btn"> Clear All </el-button>
        </div>
        <div class="selected-tools">
          <el-tag
            v-for="tool in getSelectedToolObjects()"
            :key="tool.tool_id"
            closable
            @close="removeSelectedTool(tool.tool_id)"
            class="selected-tool-tag"
          >
            {{ tool.name }}
            <span v-if="tool.spec" class="tool-spec">- {{ tool.spec }}</span>
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('close')">Cancel</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          Save Selection ({{ localSelectedTools.length }})
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash-unified'
import { Search } from '@element-plus/icons-vue'
import { searchTools } from '@/api/resources'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  stepId: {
    type: String,
    required: true,
  },
  selectedTools: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'close'])

const searchQuery = ref('')
const availableTools = ref([])
const localSelectedTools = ref([])
// Cache full metadata for selected tools so search does not hide them
const selectedToolCache = ref(new Map())
const saveLoading = ref(false)
// eslint-disable-next-line vue/no-dupe-keys
const loading = ref(false)

// Watch for selected tools changes
watch(
  () => props.selectedTools,
  newTools => {
    // Normalize to numeric IDs to avoid string/number mismatches
    if (newTools.length > 0 && typeof newTools[0] === 'object') {
      localSelectedTools.value = newTools.map(tool => {
        const id = Number(tool.tool_id)
        // Seed/refresh cache with provided metadata
        selectedToolCache.value.set(id, {
          tool_id: id,
          name: tool.name,
          spec: tool.spec || '',
        })
        return id
      })
    } else {
      localSelectedTools.value = newTools.map(id => Number(id))
    }
  },
  { immediate: true }
)

const filteredTools = computed(() => {
  if (!searchQuery.value) {
    return availableTools.value
  }

  const query = searchQuery.value.toLowerCase()
  return availableTools.value.filter(
    tool => tool.name.toLowerCase().includes(query) || (tool.spec && tool.spec.toLowerCase().includes(query))
  )
})

const isToolSelected = toolId => {
  return localSelectedTools.value.includes(toolId)
}

const toggleTool = tool => {
  const isSelected = isToolSelected(tool.tool_id)

  if (isSelected) {
    removeSelectedTool(tool.tool_id)
  } else {
    // Cache metadata so selected list is not affected by search
    selectedToolCache.value.set(Number(tool.tool_id), {
      tool_id: Number(tool.tool_id),
      name: tool.name,
      spec: tool.spec || '',
    })
    addSelectedTool(tool.tool_id)
  }
}

const addSelectedTool = toolId => {
  if (!localSelectedTools.value.includes(toolId)) {
    localSelectedTools.value.push(toolId)
  }
}

const removeSelectedTool = toolId => {
  localSelectedTools.value = localSelectedTools.value.filter(id => id !== toolId)
  selectedToolCache.value.delete(Number(toolId))
}

const clearAllTools = () => {
  localSelectedTools.value = []
  selectedToolCache.value.clear()
}

const getSelectedToolObjects = () => {
  // Build selected list from cache to avoid coupling with availableTools filtering
  return localSelectedTools.value.map(id => {
    const cached = selectedToolCache.value.get(Number(id))
    if (cached) return cached
    // Fallback: try to find in currently loaded available tools
    const found = availableTools.value.find(t => Number(t.tool_id) === Number(id))
    if (found) {
      const obj = { tool_id: Number(found.tool_id), name: found.name, spec: found.spec || '' }
      selectedToolCache.value.set(obj.tool_id, obj)
      return obj
    }
    // Last resort: minimal object
    return { tool_id: Number(id), name: `Tool #${id}`, spec: '' }
  })
}

const handleSave = () => {
  saveLoading.value = true

  // Convert tool IDs to tool objects for the save event
  const selectedToolObjects = getSelectedToolObjects().map(tool => ({
    tool_id: tool.tool_id,
    name: tool.name,
    spec: tool.spec,
  }))

  setTimeout(() => {
    emit('save', props.stepId, selectedToolObjects)
    saveLoading.value = false
  }, 300) // Simulate save delay
}

const loadTools = async () => {
  loading.value = true
  try {
    const response = await searchTools(1, 20, 'name', 'ASC', {
      keyword: searchQuery.value || null,
    })
    const list = response?.data?.content || []
    // Normalize backend payload to the panel's expected structure
    availableTools.value = list.map(item => ({
      tool_id: Number(item.id),
      name: item.name,
      // Use code primarily; fallback to tool class name
      spec: item.code || (item.tool_class && item.tool_class.name) || '',
    }))
    // Refresh cache entries for selected tools found in current page
    availableTools.value.forEach(t => {
      if (localSelectedTools.value.includes(Number(t.tool_id))) {
        selectedToolCache.value.set(Number(t.tool_id), {
          tool_id: Number(t.tool_id),
          name: t.name,
          spec: t.spec || '',
        })
      }
    })
  } catch (error) {
    console.error('Tool load failed:', error)
    availableTools.value = []
  } finally {
    loading.value = false
  }
}

// Debounced server-side search when keyword changes
const debouncedSearch = debounce(() => {
  // Only query when dialog is visible to avoid unnecessary calls
  if (props.visible) {
    loadTools()
  }
}, 300)

watch(
  () => searchQuery.value,
  () => {
    debouncedSearch()
  }
)

// Load tools when dialog opens
watch(
  () => props.visible,
  isVisible => {
    if (isVisible && availableTools.value.length === 0) {
      loadTools()
    }
  }
)

onMounted(() => {
  if (props.visible) {
    loadTools()
  }
})
</script>

<style scoped>
.tools-picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
}

.search-section {
  margin-bottom: 8px;
}

.selected-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selected-section h4,
.available-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.selected-section-header h4 {
  margin: 0;
}

.clear-all-btn {
  color: #f56c6c;
  font-size: 12px;
  padding: 4px 8px;
}

.clear-all-btn:hover {
  color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.1);
}

.selected-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.selected-tool-tag {
  margin: 0;
}

.tool-spec {
  opacity: 0.7;
  font-size: 11px;
}

.available-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-container {
  padding: 20px;
}

.empty-tools {
  text-align: center;
  padding: 40px 20px;
}

.tools-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  max-height: 300px;
}

.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-item:hover {
  background: #f5f7fa;
}

.tool-item.selected {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.tool-item .tool-spec {
  font-size: 12px;
  color: #606266;
}

.tool-actions {
  margin-left: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<template>
  <div class="standard-card" :class="{ focused: focused }" @click="handleCardClick">
    <div class="card-content">
      <!-- Row 1: Checkbox + Title -->
      <div class="row-1">
        <el-checkbox v-model="checked" class="card-checkbox" @change="handleCheckboxChange" />
        <el-text class="card-title" :title="template.name" style="width: 200px" truncated>
          {{ template.name }}
        </el-text>
      </div>

      <!-- Row 2: Description -->
      <!--      <div class="row-2" v-if="template.description">-->
      <!--        <p class="card-description">{{ template.description }}</p>-->
      <!--      </div>-->

      <!-- Row 3: Tags + Rules -->
      <div class="row-3 card-tags">
        <div class="tags-left">
          <el-tag
            v-if="categoryLabel"
            :type="template.category === 'general' ? 'primary' : 'warning'"
            size="small"
            class="tag-item"
          >
            {{ categoryLabel }}
          </el-tag>
        </div>

        <div class="rules-count">{{ rulesCount }} rules</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  focused: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['selection'])

const checked = ref(props.selected)

const rulesCount = computed(() => props.template?.items?.length || 0)

const categoryLabel = computed(() => {
  const category = props.template?.category
  if (!category) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
})

// Watch for external changes to selected prop
watch(
  () => props.selected,
  newValue => {
    checked.value = newValue
  }
)

const handleCheckboxChange = value => {
  if (value) {
    handleCheck()
  } else {
    handleUncheck()
  }
}

const handleCheck = () => {
  emit('selection', {
    id: props.template.id,
    action: 'check',
    data: props.template,
  })
}

const handleUncheck = () => {
  emit('selection', {
    id: props.template.id,
    action: 'uncheck',
    data: props.template,
  })
}

const handleCardClick = () => {
  emit('selection', {
    id: props.template.id,
    action: 'focus',
    data: props.template,
  })
}
</script>

<style scoped>
.standard-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  margin-bottom: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.standard-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}

.standard-card.focused {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.15);
}

.card-checkbox {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px 12px 40px;
  flex: 1;
}

.row-1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.card-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.row-2 {
  margin: 4px 0;
}

.card-description {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.row-3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.tags-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rules-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.tag-item {
  --el-tag-border-color: #e4e7ed;
}

:deep(.el-text.is-truncated) {
  max-width: 80%;
}
</style>

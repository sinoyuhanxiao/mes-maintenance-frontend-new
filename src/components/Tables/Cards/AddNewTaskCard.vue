<template>
  <div class="template-card" :class="{ focused: focused }" @click="handleCardClick">
    <div class="card-content">
      <!-- Row 1: Checkbox + Title -->
      <div class="row-1">
        <el-checkbox v-model="checked" class="card-checkbox" @change="handleCheckboxChange" />
        <el-text class="card-title" :title="template.name" truncated>
          {{ template.name }}
        </el-text>
      </div>

      <!-- Row 2: Tags + Steps -->
      <div class="row-2 card-tags">
        <div class="tags-left">
          <el-tag v-if="categoryLabel" size="small" class="tag-item">
            {{ categoryLabel }}
          </el-tag>

          <el-tag v-if="assetLabel" size="small" type="info" class="tag-item">
            {{ assetLabel }}
          </el-tag>

          <el-tag v-if="template.estimated_minutes" size="small" type="warning" class="tag-item">
            {{ template.estimated_minutes }} min
          </el-tag>
        </div>

        <div class="steps-count">{{ stepsCount }} steps</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps( {
  template : {
    type : Object,
    required : true
  },
  selected : {
    type : Boolean,
    default : false
  },
  focused : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['selection'] )

const checked = ref( props.selected )

const stepsCount = computed( () => props.template?.steps?.length || 0 )

const categoryLabel = computed( () => {
  const category = props.template?.category
  if ( !category ) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
} )

const assetLabel = computed( () => {
  const a = props.template?.applicable_assets
  if ( !a || a.length === 0 ) return ''
  return a.length === 1 ? a[0] : `${a.length} assets`
} )

// Watch for external changes to selected prop
watch(
  () => props.selected,
  newValue => {
    checked.value = newValue
  }
)

const handleCheckboxChange = value => {
  if ( value ) {
    handleCheck()
  } else {
    handleUncheck()
  }
}

const handleCheck = () => {
  emit( 'selection', {
    id : props.template.id,
    action : 'check',
    data : props.template
  } )
}

const handleUncheck = () => {
  emit( 'selection', {
    id : props.template.id,
    action : 'uncheck',
    data : props.template
  } )
}

const handleCardClick = () => {
  emit( 'selection', {
    id : props.template.id,
    action : 'focus',
    data : props.template
  } )
}
</script>

<style scoped>
.template-card {
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

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}

.template-card.focused {
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
}

.card-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.row-2 {
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

.steps-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.tag-item {
  --el-tag-border-color: #e4e7ed;
}
</style>

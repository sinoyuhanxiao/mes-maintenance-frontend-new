<template>
  <div class="standard-card">
    <div class="card-content">
      <!-- Row 1: Checkbox + Title -->
      <div class="row-1">
        <el-checkbox v-model="checked" class="card-checkbox" @change="handleCheckboxChange" />
        <el-text class="card-title" :title="template.name" truncated>
          {{ template.name }}
        </el-text>
      </div>

      <!-- Row 2: Tags + Rules -->
      <div class="row-2 card-tags">
        <div class="tags-left">
          <el-tag v-if="template.category" size="small" class="tag-item">
            {{ template.category }}
          </el-tag>
        </div>

        <div class="rules-count">{{ rulesCount }} rules</div>
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
  }
} )

const emit = defineEmits( ['selection'] )

const checked = ref( props.selected )

const rulesCount = computed( () => props.template?.rules?.length || 0 )

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

.rules-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.tag-item {
  --el-tag-border-color: #e4e7ed;
}
</style>

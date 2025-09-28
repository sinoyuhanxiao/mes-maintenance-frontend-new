<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="680px"
    top="10vh"
    append-to-body
    class="review-standards-dialog"
    @close="handleCancel"
  >
    <div class="dialog-intro">
      <el-icon class="intro-icon"><Document /></el-icon>
      <div>
        <p class="intro-title">Review associated standards before starting execution.</p>
        <p class="intro-subtitle">Please confirm all rules have been reviewed.</p>
      </div>
    </div>

    <div ref="listRef" class="standards-wrapper" @scroll="handleScroll">
      <template v-if="hasStandards">
        <div v-for="standard in standards" :key="standard.id || standard.name" class="standard-card">
          <div class="standard-header">
            <div class="standard-name">{{ standard.name || 'Standard' }}</div>
            <el-tag v-if="standard.category" size="small" type="info" effect="plain">{{
              formatCategory(standard.category)
            }}</el-tag>
          </div>
          <p v-if="standard.description" class="standard-description">{{ standard.description }}</p>
          <ul class="rules-list" v-if="standard.items && standard.items.length">
            <li v-for="(rule, index) in standard.items" :key="index">
              <span class="rule-index">{{ index + 1 }}.</span>
              <span>{{ rule }}</span>
            </li>
          </ul>
          <div v-else class="empty-rule">No rules provided for this standard.</div>
        </div>
      </template>
      <el-empty v-else description="No standards associated with this work order." :image-size="120" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" :disabled="confirmDisabled" @click="handleConfirm">Confirm &amp; Continue</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { Document } from '@element-plus/icons-vue'

const props = defineProps( {
  modelValue : {
    type : Boolean,
    default : false
  },
  standards : {
    type : Array,
    default : () => []
  },
  workOrderName : {
    type : String,
    default : ''
  }
} )

const emit = defineEmits( ['update:modelValue', 'confirm', 'cancel'] )

const dialogTitle = computed( () => {
  return props.workOrderName ? `Review Standards — ${props.workOrderName}` : 'Review Standards'
} )

const hasStandards = computed( () => Array.isArray( props.standards ) && props.standards.length > 0 )

const listRef = ref()
const confirmDisabled = ref( true )

const formatCategory = category => {
  if ( !category ) return ''
  if ( typeof category === 'string' ) return category
  if ( typeof category === 'object' ) {
    return category.name || category.label || ''
  }
  return ''
}

const closeDialog = value => {
  emit( 'update:modelValue', value )
}

const handleCancel = () => {
  closeDialog( false )
  emit( 'cancel' )
}

const handleConfirm = () => {
  closeDialog( false )
  emit( 'confirm' )
}

const updateScrollState = () => {
  if ( !listRef.value ) {
    confirmDisabled.value = false
    return
  }
  const el = listRef.value
  const isScrollable = el.scrollHeight > el.clientHeight
  if ( !isScrollable ) {
    confirmDisabled.value = false
    return
  }
  const threshold = 8
  const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
  confirmDisabled.value = !reachedBottom
}

const handleScroll = () => {
  updateScrollState()
}

const resetScrollState = async() => {
  await nextTick()
  if ( listRef.value ) {
    listRef.value.scrollTop = 0
  }
  updateScrollState()
}

watch(
  () => props.modelValue,
  value => {
    if ( value ) {
      confirmDisabled.value = true
      resetScrollState()
    }
  }
)

watch(
  () => props.standards,
  () => {
    resetScrollState()
  }
)

onMounted( () => {
  updateScrollState()
} )

onBeforeUnmount( () => {
  confirmDisabled.value = false
} )
</script>

<style scoped>
.review-standards-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}

.dialog-intro {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0 16px;
}

.intro-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  margin-top: 2px;
}

.intro-title {
  margin: 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.intro-subtitle {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.standards-wrapper {
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.standard-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 16px 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.standard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.standard-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.standard-description {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.rules-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rules-list li {
  display: flex;
  gap: 6px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
}

.rule-index {
  font-weight: 600;
  color: var(--el-color-primary);
}

.empty-rule {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

<template>
  <el-dialog
    :model-value="modelValue"
    title="Review Standards"
    width="600px"
    top="10vh"
    append-to-body
    class="review-standards-dialog"
    @close="handleCancel"
  >
    <div class="dialog-content">
      <div ref="listRef" class="standards-list" @scroll="handleScroll">
        <template v-if="hasStandards">
          <div v-for="standard in standards" :key="standard.id || standard.name" class="standard-item">
            <div class="standard-title">
              <span class="standard-name">{{ standard.name || 'Standard' }}</span>
              <el-tag v-if="standard.category" size="small" type="info" effect="plain">{{
                formatCategory(standard.category)
              }}</el-tag>
            </div>
            <ul class="rules-list" v-if="standard.items && standard.items.length">
              <li v-for="(rule, index) in standard.items" :key="index">
                {{ rule }}
              </li>
            </ul>
          </div>
        </template>
        <el-empty v-else description="No standards to review" :image-size="80" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" size="default">Cancel</el-button>
        <el-button type="primary" :disabled="confirmDisabled" @click="handleConfirm" size="default">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'

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
.review-standards-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px 20px;
  }

  :deep(.el-dialog__body) {
    padding: 10px 20px 20px 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 0 20px 20px 20px;
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-message {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  text-align: center;
  line-height: 1.5;
}

.standards-list {
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px;
}

.standard-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px 16px;
  background: var(--el-fill-color-blank);
  transition: all 0.2s ease;
}

.standard-item:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-fill-color-light);
}

.standard-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.standard-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.rules-list {
  list-style: disc;
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rules-list li {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 120px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .review-standards-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 0 auto;
    }
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>

<template>
  <div class="step-file">
    <el-upload
      :disabled="disabled"
      :file-list="fileList"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :before-upload="() => false"
      action=""
      multiple
    >
      <el-button :disabled="disabled" size="small" type="primary" plain>
        <el-icon><Upload /></el-icon>
        Upload Files
      </el-button>
    </el-upload>
    <div v-if="step.description" class="step-description">
      {{ step.description }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const fileList = ref([])

watch(
  () => props.modelValue,
  newValue => {
    fileList.value = Array.isArray(newValue) ? newValue : []
  },
  { immediate: true }
)

const handleFileChange = (file, fileListUpdated) => {
  fileList.value = fileListUpdated
  emit('update:modelValue', fileList.value)
}

const handleFileRemove = (file, fileListUpdated) => {
  fileList.value = fileListUpdated
  emit('update:modelValue', fileList.value)
}
</script>

<style scoped>
.step-file {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  padding: 6px 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
</style>

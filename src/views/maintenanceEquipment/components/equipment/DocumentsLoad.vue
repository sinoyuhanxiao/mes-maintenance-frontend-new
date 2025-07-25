<template>
  <div class="t3-documents-load">
    <div class="t3-documents-header">
      <el-text >
        No documents uploaded. Please upload the equipment manual.
      </el-text>
      <el-divider />
    </div>
    <div class="t3-documents-content">
      <el-upload
        class="upload-demo"
        drag
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
        <div class="el-upload__tip">
            pdf files with a size of less than 500kb
        </div>
        </template>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.t3-documents-load {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.t3-documents-header {
  flex-shrink: 0;
  text-align: left;
}

.t3-documents-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

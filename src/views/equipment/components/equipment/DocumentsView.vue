<template>
  <div class="t3-documents-view">
    <div class="t3-documents-header">
      <el-text>{{ documentTitle }}</el-text>
      <div class="header-actions">
        <el-button @click="downloadPdf">
          <el-icon style="margin-right: 10px"><Download /></el-icon>
          Download
        </el-button>
        <el-button @click="openInNewTab">
          <el-icon style="margin-right: 10px"><Link /></el-icon>
          Open in New Tab
        </el-button>
      </div>
    </div>
    <div class="t3-documents-content">
      <div v-if="pdfUrl" class="pdf-container">
        <!-- Direct PDF embed (browser's native viewer) -->
        <iframe
          :src="directPdfUrl"
          class="pdf-viewer"
          frameborder="0"
          allowfullscreen
          @load="onIframeLoad"
          @error="onIframeError"
        />
      </div>
      <div v-else class="no-pdf">
        <el-empty description="No PDF selected">
          <el-button type="primary" @click="selectPdf">Select PDF</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Download, Link } from '@element-plus/icons-vue'

const props = defineProps({
  pdfUrl: {
    type: String,
    default: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  },
  documentTitle: {
    type: String,
    default: 'Equipment Manual',
  },
})

const iframeError = ref(false)
const directPdfUrl = computed(() => {
  if (!props.pdfUrl) return ''
  return `${props.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`
})

async function downloadPdf() {
  if (props.pdfUrl) {
    try {
      const response = await fetch(props.pdfUrl, {
        mode: 'cors',
        headers: {
          Accept: 'application/pdf',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      downloadBlob(blob)
    } catch (err) {
      console.error('Download failed:', err)
      window.open(props.pdfUrl, '_blank')
    }
  }
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = props.documentTitle + '.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function openInNewTab() {
  if (props.pdfUrl) {
    window.open(props.pdfUrl, '_blank')
  }
}

function selectPdf() {
  console.log('Select PDF clicked')
}

function onIframeLoad() {
  console.log('PDF loaded successfully in browser native viewer')
  iframeError.value = false
}

function onIframeError() {
  console.error('PDF failed to load in browser native viewer')
  iframeError.value = true
}

onMounted(() => {
  console.log('PDF viewer component mounted - using browser native viewer')
})
</script>

<style scoped>
.t3-documents-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.t3-documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.t3-documents-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pdf-container {
  height: calc(100vh - 350px);
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  overflow: hidden;
}

.pdf-viewer {
  height: 100%;
  width: 100%;
  border-radius: 5px;
}

.no-pdf {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

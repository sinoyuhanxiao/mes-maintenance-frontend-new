<template>
  <el-dialog
    v-model="isVisible"
    title="Work Order PDF Preview"
    width="95%"
    :before-close="handleClose"
    class="pdf-preview-dialog"
    top="2vh"
  >
    <div class="pdf-preview-container">
      <!-- Toolbar for pdf preview -->
      <div class="pdf-preview-toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button type="primary" @click="printPdf">
              <el-icon><Printer /></el-icon>
              Print PDF
            </el-button>
            <el-button @click="downloadPdf">
              <el-icon><Download /></el-icon>
              Download PDF
            </el-button>
            <el-button @click="openInNewWindow">
              <el-icon><View /></el-icon>
              Open in New Window
            </el-button>
          </el-button-group>
        </div>

        <div class="toolbar-center">
          <!-- Page Navigation -->
          <div class="page-navigation">
            <el-button size="small" :disabled="currentPage <= 1" @click="previousPage">
              <el-icon><ArrowLeft /></el-icon>
              Previous
            </el-button>

            <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} </span>

            <el-button size="small" :disabled="currentPage >= totalPages" @click="nextPage">
              Next
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="toolbar-right">
          <!-- Zoom Controls -->
          <div class="zoom-controls">
            <el-button size="small" :disabled="zoomLevel <= 0.5" @click="zoomOut">
              <el-icon><ZoomOut /></el-icon>
            </el-button>

            <span class="zoom-info">{{ Math.round(zoomLevel * 100) }}%</span>

            <el-button size="small" :disabled="zoomLevel >= 2" @click="zoomIn">
              <el-icon><ZoomIn /></el-icon>
            </el-button>

            <el-button size="small" @click="resetZoom"> Reset </el-button>
          </div>
        </div>
      </div>

      <!-- PDF Content with Scrolling -->
      <div class="pdf-preview-content print-simulation" ref="pdfPreviewContent">
        <div class="pdf-content-wrapper" :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }">
          <WorkOrderPdf v-if="workOrder" :work-order="workOrder" ref="pdfComponent" class="preview-print-mode" />
        </div>
      </div>

      <!-- Page Indicators -->
      <div class="page-indicators">
        <div
          v-for="page in totalPages"
          :key="page"
          class="page-indicator"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import WorkOrderPdf from '../Reports/WorkOrderPdf.vue'
import { Printer, Download, View, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  workOrder: {
    type: Object,
    default: null,
  },
})

// Emits
const emit = defineEmits(['update:visible', 'close'])

// State
const currentPage = ref(1)
const totalPages = ref(2) // Will be calculated dynamically
const zoomLevel = ref(1)
const pdfPreviewContent = ref(null)

// Computed
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Methods
const handleClose = () => {
  currentPage.value = 1
  zoomLevel.value = 1
  emit('close')
}

const ensurePdfComponentRendered = () => {
  const pdfElement = document.querySelector('.pdf-preview-content .work-order-pdf')
  if (pdfElement) {
    // Force a reflow to ensure all styles are applied
    // eslint-disable-next-line no-unused-expressions
    pdfElement.offsetHeight

    // Add a class to indicate the component is ready for export
    pdfElement.classList.add('pdf-ready-for-export')

    // Calculate actual number of pages
    calculateActualPageCount()
  }
}

// Calculate the actual number of pages based on content height and print simulation
const calculateActualPageCount = () => {
  const pdfElement = document.querySelector('.pdf-preview-content .work-order-pdf')
  if (!pdfElement) return

  // Create an iframe for accurate print simulation
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.top = '-9999px'
  iframe.style.left = '-9999px'
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  iframe.style.border = 'none'

  document.body.appendChild(iframe)

  // Create a complete HTML document for accurate measurement
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.4; background: white; }
          @page { size: A4; margin: 0; }
          ${getPdfStyles()}
          .pdf-page {
            width: 210mm;
            min-height: 257mm; /* A4 height minus padding */
            padding: 20mm;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
          }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        ${pdfElement.outerHTML}
      </body>
    </html>
  `

  // Write the HTML to the iframe
  iframe.contentDocument.open()
  iframe.contentDocument.write(printHTML)
  iframe.contentDocument.close()

  // Wait for the iframe to load and then count pages
  setTimeout(() => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      const pages = iframeDoc.querySelectorAll('.pdf-page')
      const actualPageCount = pages.length

      // Update totalPages if different
      if (actualPageCount !== totalPages.value && actualPageCount > 0) {
        totalPages.value = actualPageCount
      }
    } catch (error) {
      console.warn('Could not calculate page count:', error)
      // Fallback to counting existing pages
      const pages = pdfElement.querySelectorAll('.pdf-page')
      totalPages.value = pages.length
    }

    // Cleanup
    document.body.removeChild(iframe)
  }, 1000)
}

// Setup scroll listener for automatic page detection
const setupScrollListener = () => {
  if (!pdfPreviewContent.value) return

  const scrollContainer = pdfPreviewContent.value

  const handleScroll = () => {
    const pages = scrollContainer.querySelectorAll('.pdf-page')
    if (!pages.length) return

    const containerTop = scrollContainer.scrollTop
    const containerHeight = scrollContainer.clientHeight
    const viewportCenter = containerTop + containerHeight / 2

    // Find which page is most visible in the viewport
    let closestPage = 1
    let closestDistance = Infinity

    pages.forEach((page, index) => {
      const pageTop = page.offsetTop
      const pageHeight = page.offsetHeight
      const pageCenter = pageTop + pageHeight / 2
      const distance = Math.abs(viewportCenter - pageCenter)

      if (distance < closestDistance) {
        closestDistance = distance
        closestPage = index + 1
      }
    })

    if (closestPage !== currentPage.value) {
      currentPage.value = closestPage
    }
  }

  scrollContainer.addEventListener('scroll', handleScroll)

  // Cleanup function
  const cleanup = () => {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }

  // Store cleanup function for later use
  scrollContainer._scrollCleanup = cleanup
}

// PDF Preview Methods
const printPdf = async () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    ElMessage.error('Unable to open print window. Please check popup blockers.')
    return
  }

  // Get the PDF component HTML and ensure it's ready
  const pdfElement = document.querySelector('.pdf-preview-content .work-order-pdf')
  if (!pdfElement) {
    ElMessage.error('PDF content not found')
    return
  }

  // Wait for component to be fully rendered if not ready
  if (!pdfElement.classList.contains('pdf-ready-for-export')) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ensurePdfComponentRendered()
  }

  const htmlContent = pdfElement.outerHTML

  // Create print-optimized HTML document with exact same layout as preview
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Work Order ${props.workOrder?.id || 'Export'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.4; background: white; }
          @page {
            size: A4;
            margin: 0;
          }
          ${getPdfStyles()}
          /* Ensure consistent page layout */
          .pdf-page {
            width: 210mm;
            min-height: 257mm; /* A4 height minus padding */
            padding: 20mm;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
          }
          .pdf-page:last-child {
            page-break-after: avoid;
          }
          .page-break {
            page-break-before: always;
            break-before: page;
          }
          @media print {
            .work-order-pdf { margin: 0; padding: 0; }
            .pdf-page {
              margin: 0;
              page-break-after: always;
            }
            .pdf-page:last-child {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `

  printWindow.document.write(printHTML)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
}

const downloadPdf = async () => {
  try {
    // Check if html2pdf is available
    if (typeof window.html2pdf === 'undefined') {
      ElMessage.error('PDF download requires html2pdf library. Using print instead.')
      printPdf()
      return
    }

    // Create a temporary container with the same styles as print
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.top = '-9999px'
    tempContainer.style.left = '-9999px'
    tempContainer.style.width = '210mm'
    tempContainer.style.height = 'auto'

    // Get the PDF component HTML and ensure it's ready
    const pdfElement = document.querySelector('.pdf-preview-content .work-order-pdf')
    if (!pdfElement) {
      ElMessage.error('PDF content not found')
      return
    }

    // Wait for component to be fully rendered if not ready
    if (!pdfElement.classList.contains('pdf-ready-for-export')) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      ensurePdfComponentRendered()
    }

    // Create styled HTML for download
    const styledHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.4; background: white;">
        <style>
          ${getPdfStyles()}
        </style>
        ${pdfElement.outerHTML}
      </div>
    `

    tempContainer.innerHTML = styledHTML
    document.body.appendChild(tempContainer)

    const filename = `WorkOrder_${props.workOrder?.id || 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        foreignObjectRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    }

    await window.html2pdf().set(opt).from(tempContainer.firstChild).save()

    // Cleanup
    document.body.removeChild(tempContainer)

    ElMessage.success(`PDF downloaded: ${filename}`)
  } catch (error) {
    console.error('Download error:', error)
    ElMessage.error('Failed to download PDF. Please try print instead.')
  }
}

const openInNewWindow = () => {
  const newWindow = window.open('', '_blank', 'width=900,height=1200')

  if (!newWindow) {
    ElMessage.error('Unable to open new window. Please check popup blockers.')
    return
  }

  const pdfElement = document.querySelector('.pdf-preview-content .work-order-pdf')
  if (!pdfElement) {
    ElMessage.error('PDF content not found')
    return
  }

  const htmlContent = pdfElement.outerHTML

  const newWindowHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Work Order ${props.workOrder?.id || 'Preview'}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
          }
          ${getPdfStyles()}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `

  newWindow.document.write(newWindowHTML)
  newWindow.document.close()
}

const getPdfStyles = () => {
  // Return the complete PDF styles from WorkOrderPdf component
  return `
    /* PDF Layout Styles */
    .work-order-pdf {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333333;
      line-height: 1.4;
      background: white;
    }

    /* Page Setup */
    .pdf-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 20mm;
      box-sizing: border-box;
      background: white;
      position: relative;
    }

    .page-break {
      page-break-before: always;
    }

    /* Header Styles */
    .pdf-header {
      margin-bottom: 15mm;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 5mm;
      border-bottom: 2px solid #0085a4;
      margin-bottom: 10mm;
    }

    .logo-section {
      display: flex;
      align-items: center;
    }

    .logo-placeholder {
      width: 40px;
      height: 40px;
      background: #0085a4;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }

    .logo-text {
      color: white;
      font-weight: bold;
      font-size: 16px;
    }

    .company-info {
      text-align: right;
    }

    .company-line {
      font-size: 9px;
      color: #555555;
      line-height: 1.2;
      margin-bottom: 2px;
    }

    .title-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .work-order-title {
      font-size: 24px;
      font-weight: bold;
      color: #0085a4;
      letter-spacing: 1px;
      margin: 0;
    }

    .work-order-id {
      font-size: 14px;
      color: #0085a4;
      margin-top: 4px;
    }

    .date-badge {
      background: #0085a4;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: bold;
    }

    /* Section Styles */
    .pdf-section {
      margin-bottom: 15mm;
    }

    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #0085a4;
      margin: 0 0 8mm 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .subsection-title {
      font-size: 10px;
      font-weight: bold;
      color: #0085a4;
      margin: 0 0 5mm 0;
      text-transform: uppercase;
    }

    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20mm;
    }

    /* Overview Section */
    .overview-section {
      padding: 10mm 0;
      border-bottom: 1px solid #cccccc;
    }

    .field-group {
      margin-bottom: 8mm;
    }

    .field-label {
      font-size: 9px;
      font-weight: bold;
      color: #0085a4;
      text-transform: uppercase;
      display: block;
      margin-bottom: 3mm;
    }

    .field-value {
      font-size: 11px;
      font-weight: bold;
      color: #333;
      margin-bottom: 2mm;
    }

    .field-subvalue {
      font-size: 9px;
      color: #666;
      margin-bottom: 1mm;
    }

    .field-contact {
      font-size: 9px;
      color: #666;
    }

    .field-description {
      font-size: 9px;
      color: #666;
      margin-top: 2mm;
    }

    /* Print Styles */
    @media print {
      .work-order-pdf {
        margin: 0;
        padding: 0;
      }

      .pdf-page {
        margin: 0;
        padding: 20mm;
        page-break-after: always;
      }

      .pdf-page:last-child {
        page-break-after: avoid;
      }

      .page-break {
        page-break-before: always;
      }

      @page {
        size: A4;
        margin: 0;
      }
    }
  `
}

// Page Navigation Methods
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToPage(currentPage.value)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToPage(currentPage.value)
  }
}

const goToPage = page => {
  currentPage.value = page
  scrollToPage(page)
}

const scrollToPage = page => {
  if (!pdfPreviewContent.value) return

  const pages = pdfPreviewContent.value.querySelectorAll('.pdf-page')
  if (pages && pages[page - 1]) {
    pages[page - 1].scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Zoom Control Methods
const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.25)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.25)
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

// Watchers
watch(
  () => props.visible,
  isVisible => {
    if (isVisible && props.workOrder) {
      currentPage.value = 1
      zoomLevel.value = 1

      // Add scroll listener after modal opens and component is rendered
      nextTick(() => {
        setTimeout(() => {
          setupScrollListener()
          // Ensure the PDF component is fully rendered
          ensurePdfComponentRendered()
        }, 500)
      })
    }
  }
)

// Watch for work order changes to recalculate pages
watch(
  () => props.workOrder,
  newWorkOrder => {
    if (newWorkOrder && props.visible) {
      // Reset page count and recalculate after component renders
      currentPage.value = 1
      setTimeout(() => {
        calculateActualPageCount()
      }, 1500) // Give more time for complex layouts
    }
  }
)

defineOptions({
  name: 'PdfPreviewModal',
})
</script>

<style scoped lang="scss">
/* PDF Preview Modal Styles */
.pdf-preview-dialog {
  :deep(.el-dialog) {
    margin: 2vh auto !important;
    height: 96vh;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    flex: 1;
    overflow: hidden;
  }
}

.pdf-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-preview-toolbar {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 20px;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-info {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  min-width: 100px;
  text-align: center;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-info {
  font-size: 12px;
  color: #606266;
  min-width: 50px;
  text-align: center;
}

.pdf-preview-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 20px;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  position: relative;
}

.pdf-content-wrapper {
  transition: transform 0.3s ease;
  transform-origin: top center;
}

.pdf-preview-content :deep(.work-order-pdf) {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.pdf-preview-content :deep(.pdf-page) {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pdf-preview-content :deep(.pdf-page:last-child) {
  margin-bottom: 0;
}

/* Print Simulation Styles for Preview */
.pdf-preview-content.print-simulation :deep(.pdf-page) {
  /* Simulate print page constraints */
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  box-sizing: border-box;
  background: white;
  position: relative;
  page-break-inside: avoid;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pdf-preview-content.print-simulation :deep(.page-break) {
  /* Force page breaks in preview to match print */
  display: block;
  height: 0;
  page-break-before: always;
  break-before: page;
}

/* Apply print styles to preview */
.pdf-preview-content.print-simulation :deep(.pdf-footer) {
  position: absolute;
  bottom: 15mm;
  left: 20mm;
  right: 20mm;
  text-align: center;
}

.page-indicators {
  padding: 10px 20px;
  background: #f5f7fa;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
}

.page-indicator {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
}

.page-indicator:hover {
  border-color: #0085a4;
  color: #0085a4;
}

.page-indicator.active {
  background: #0085a4;
  border-color: #0085a4;
  color: white;
}

/* Responsive adjustments for PDF preview */
@media (max-width: 1024px) {
  .pdf-preview-toolbar {
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    justify-content: center;
  }

  .zoom-controls {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .pdf-preview-dialog {
    :deep(.el-dialog) {
      width: 98% !important;
      margin: 1vh auto !important;
      height: 98vh;
    }
  }

  .pdf-preview-toolbar {
    padding: 8px 10px;
    flex-direction: column;
    gap: 8px;
  }

  .toolbar-left :deep(.el-button-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .toolbar-left :deep(.el-button) {
    font-size: 11px;
    padding: 4px 8px;
  }

  .page-navigation {
    gap: 6px;
  }

  .page-navigation :deep(.el-button) {
    font-size: 11px;
    padding: 4px 8px;
  }

  .page-info {
    font-size: 12px;
    min-width: 80px;
  }

  .zoom-controls {
    gap: 4px;
  }

  .zoom-controls :deep(.el-button) {
    font-size: 11px;
    padding: 4px 6px;
  }

  .zoom-info {
    font-size: 11px;
    min-width: 40px;
  }

  .pdf-preview-content {
    padding: 10px 5px;
  }

  .pdf-content-wrapper {
    max-width: 100%;
  }

  .page-indicators {
    padding: 8px 10px;
    gap: 4px;
  }

  .page-indicator {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .pdf-preview-dialog {
    :deep(.el-dialog) {
      width: 100% !important;
      margin: 0 !important;
      height: 100vh;
      border-radius: 0;
    }
  }

  .pdf-preview-toolbar {
    padding: 6px 8px;
  }

  .toolbar-left :deep(.el-button) {
    font-size: 10px;
    padding: 3px 6px;
  }

  .page-navigation :deep(.el-button) {
    font-size: 10px;
    padding: 3px 6px;
  }

  .zoom-controls :deep(.el-button) {
    font-size: 10px;
    padding: 3px 4px;
  }

  .pdf-preview-content {
    padding: 5px;
  }
}
</style>

<template>
  <div class="pdf-export-test">
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>PDF Export Test</span>
          <el-button type="primary" @click="testPdfExport">
            <el-icon><Download /></el-icon>
            Test PDF Export
          </el-button>
        </div>
      </template>

      <div class="test-content">
        <el-alert
          title="Vue Component-Based PDF Export"
          type="info"
          description="This test demonstrates the new Vue component-based PDF export system that replaces jsPDF."
          show-icon
          :closable="false"
        />

        <el-divider />

        <div class="export-options">
          <h3>Export Methods</h3>
          <el-radio-group v-model="selectedMethod" class="method-group">
            <el-radio label="print" size="large">
              <div class="method-option">
                <strong>Browser Print</strong>
                <div class="method-desc">Uses browser's native print dialog (Recommended)</div>
              </div>
            </el-radio>
            <el-radio label="html2pdf" size="large" :disabled="!isHtml2PdfAvailable">
              <div class="method-option">
                <strong>HTML2PDF</strong>
                <div class="method-desc">Direct PDF download (Requires html2pdf.js library)</div>
              </div>
            </el-radio>
            <el-radio label="puppeteer" size="large" :disabled="!isPuppeteerAvailable">
              <div class="method-option">
                <strong>Puppeteer</strong>
                <div class="method-desc">Server-side generation (Requires backend endpoint)</div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <el-divider />

        <div class="sample-data">
          <h3>Sample Work Order Data</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Work Order ID">{{ sampleWorkOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="Title">{{ sampleWorkOrder.name }}</el-descriptions-item>
            <el-descriptions-item label="Status">{{ sampleWorkOrder.state.name }}</el-descriptions-item>
            <el-descriptions-item label="Priority">{{ sampleWorkOrder.priority.name }}</el-descriptions-item>
            <el-descriptions-item label="Type">{{ sampleWorkOrder.work_type.name }}</el-descriptions-item>
            <el-descriptions-item label="Due Date">{{ formatDate(sampleWorkOrder.due_date) }}</el-descriptions-item>
            <el-descriptions-item label="Created By">{{ sampleWorkOrder.created_by }}</el-descriptions-item>
            <el-descriptions-item label="Assigned To">{{ sampleWorkOrder.assigned_to }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <div class="preview-section">
          <h3>PDF Preview</h3>
          <el-button @click="showPreview = !showPreview" type="text">
            {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          </el-button>

          <div v-if="showPreview" class="preview-container">
            <WorkOrderPdf :work-order="sampleWorkOrder" />
          </div>
        </div>

        <el-divider />

        <div class="export-actions">
          <el-button-group>
            <el-button type="primary" @click="testPdfExport" :loading="isExporting" size="large">
              <el-icon><Download /></el-icon>
              Export PDF
            </el-button>
            <el-button @click="previewInNewWindow" size="large">
              <el-icon><View /></el-icon>
              Preview in New Window
            </el-button>
          </el-button-group>
        </div>

        <div v-if="lastExportResult" class="export-result">
          <el-alert
            :title="lastExportResult.success ? 'Export Successful' : 'Export Failed'"
            :type="lastExportResult.success ? 'success' : 'error'"
            :description="lastExportResult.message"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, View } from '@element-plus/icons-vue'
import WorkOrderPdf from './WorkOrderPdf.vue'
import { convertToLocalTime } from '@/utils/datetime'

// Reactive data
const selectedMethod = ref( 'print' )
const isExporting = ref( false )
const showPreview = ref( false )
const lastExportResult = ref( null )

// Sample work order data
const sampleWorkOrder = ref( {
  id : 'WO-2024-001',
  name : 'Preventive Maintenance - Conveyor Belt System',
  description :
    'Scheduled preventive maintenance for conveyor belt system including belt inspection, tension adjustment, and lubrication of drive components.',
  state : { name : 'In Progress' },
  priority : { name : 'High' },
  work_type : { name : 'Preventive' },
  due_date : '2024-08-15T16:00:00Z',
  created_at : new Date().toISOString(),
  created_by : 'Erik Yu',
  assigned_to : 'Mike Johnson',
  customer : 'Internal Maintenance',
  customerAddress : 'Plant A - Production Floor',
  customerContact : 'maintenance@company.com'
} )

// Computed properties
const isHtml2PdfAvailable = computed( () => {
  return typeof window !== 'undefined' && typeof window.html2pdf !== 'undefined'
} )

const isPuppeteerAvailable = computed( () => {
  // This would check if the server endpoint is available
  return false // For demo purposes, assume not available
} )

// Methods
const formatDate = dateString => {
  if ( !dateString ) return 'N/A'
  return convertToLocalTime( dateString, 'DD MMM, YYYY' )
}

const testPdfExport = async() => {
  isExporting.value = true
  lastExportResult.value = null

  try {
    // Import the Vue PDF exporter
    const { VueWorkOrderPDFExporter } = await import( '@/utils/pdfExportVue' )

    // Create exporter instance
    const exporter = new VueWorkOrderPDFExporter()

    // Export options based on selected method
    const options = {
      method : selectedMethod.value
    }

    // Add method-specific options
    if ( selectedMethod.value === 'html2pdf' ) {
      options.html2pdfOptions = {
        margin : 0,
        filename : `WorkOrder_${sampleWorkOrder.value.id}_${new Date().toISOString().split( 'T' )[0]}.pdf`,
        image : { type : 'jpeg', quality : 0.98 },
        html2canvas : {
          scale : 2,
          useCORS : true,
          letterRendering : true
        },
        jsPDF : {
          unit : 'mm',
          format : 'a4',
          orientation : 'portrait'
        }
      }
    }

    // Generate PDF
    const result = await exporter.exportWorkOrder( sampleWorkOrder.value, options )

    if ( result.success ) {
      lastExportResult.value = {
        success : true,
        message : `PDF export successful using ${result.method} method. File: ${result.filename}`
      }
      ElMessage.success( 'PDF export completed successfully!' )
    } else {
      lastExportResult.value = {
        success : false,
        message : `Export failed: ${result.error}`
      }
      ElMessage.error( 'PDF export failed' )
    }
  } catch ( error ) {
    console.error( 'PDF Export Test Error:', error )
    lastExportResult.value = {
      success : false,
      message : `Export error: ${error.message}`
    }
    ElMessage.error( 'PDF export test failed' )
  } finally {
    isExporting.value = false
  }
}

const previewInNewWindow = () => {
  // Create a new window with the PDF content for preview
  const previewWindow = window.open( '', '_blank', 'width=800,height=1000' )

  if ( !previewWindow ) {
    ElMessage.error( 'Unable to open preview window. Please check popup blockers.' )
    return
  }

  // Get the component HTML (this is a simplified version)
  const previewHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Work Order Preview - ${sampleWorkOrder.value.id}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
          }
          .preview-note {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 20px;
            color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="preview-note">
          <strong>Preview Mode:</strong> This is a simplified preview.
          Use the Export PDF button for the full formatted document.
        </div>
        <h1>Work Order ${sampleWorkOrder.value.id}</h1>
        <h2>${sampleWorkOrder.value.name}</h2>
        <p><strong>Description:</strong> ${sampleWorkOrder.value.description}</p>
        <p><strong>Status:</strong> ${sampleWorkOrder.value.state.name}</p>
        <p><strong>Priority:</strong> ${sampleWorkOrder.value.priority.name}</p>
        <p><strong>Type:</strong> ${sampleWorkOrder.value.work_type.name}</p>
        <p><strong>Due Date:</strong> ${formatDate( sampleWorkOrder.value.due_date )}</p>
        <p><strong>Created By:</strong> ${sampleWorkOrder.value.created_by}</p>
        <p><strong>Assigned To:</strong> ${sampleWorkOrder.value.assigned_to}</p>
      </body>
    </html>
  `

  previewWindow.document.write( previewHTML )
  previewWindow.document.close()
}

defineOptions( {
  name : 'PdfExportTest'
} )
</script>

<style scoped>
.pdf-export-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-content {
  padding: 20px 0;
}

.method-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.method-option {
  margin-left: 10px;
}

.method-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.preview-container {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  background: #f9f9f9;
  max-height: 600px;
  overflow-y: auto;
}

.export-actions {
  text-align: center;
  margin: 20px 0;
}

.export-result {
  margin-top: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .pdf-export-test {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .preview-container {
    padding: 10px;
  }
}
</style>

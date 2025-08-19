<template>
  <div class="todo-view">
    <!-- Left Panel - Work Order List -->
    <div class="left-panel">
      <!-- Todo-specific Filters (Status tabs and sorting) -->
      <div v-show="false" class="todo-specific-filters">
        <!-- Status Tabs -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="todo-tabs">
          <el-tab-pane :label="$t('workOrder.tabs.todo')" name="todo" />
          <el-tab-pane :label="$t('workOrder.tabs.done')" name="done" />
        </el-tabs>

        <!-- Sort Options -->
        <div class="sort-options">
          <div class="sort-label">{{ $t('workOrder.sort.sortBy') }}:</div>
          <el-select v-model="sortBy" @change="handleSortChange" size="small" style="width: 180px">
            <el-option :label="$t('workOrder.sort.priorityHighest')" value="priority-desc" />
            <el-option :label="$t('workOrder.sort.priorityLowest')" value="priority-asc" />
            <el-option :label="$t('workOrder.sort.dueDateNearest')" value="dueDate-asc" />
            <el-option :label="$t('workOrder.sort.dueDateFarthest')" value="dueDate-desc" />
            <el-option :label="$t('workOrder.sort.createdNewest')" value="created-desc" />
            <el-option :label="$t('workOrder.sort.createdOldest')" value="created-asc" />
          </el-select>
        </div>
      </div>

      <!-- Work Order Cards -->
      <div class="work-order-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="displayedWorkOrders && displayedWorkOrders.length === 0" class="empty-list">
          <el-empty :description="$t('workOrder.messages.noData')" :image-size="80" />
        </div>

        <div v-else class="list-content">
          <!-- Pagination Info -->
          <div class="pagination-info">
            <div class="info-text">
              {{
                $t('workOrder.pagination.showing', {
                  start: paginationInfo.start,
                  end: paginationInfo.end,
                  total: paginationInfo.total,
                })
              }}
            </div>
            <el-select v-model="internalPageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
              <el-option :label="'10'" :value="10" />
              <el-option :label="'20'" :value="20" />
              <el-option :label="'50'" :value="50" />
            </el-select>
          </div>

          <!-- Cards Container -->
          <div class="cards-container">
            <el-row :gutter="16">
              <el-col v-for="workOrder in displayedWorkOrders" :key="workOrder.id">
                <WorkOrderCard
                  :work-order="workOrder"
                  :is-selected="selectedWorkOrder?.id === workOrder.id"
                  @select="selectWorkOrder"
                  @action="handleCardAction"
                />
              </el-col>
            </el-row>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination-controls" v-if="paginationInfo.total > internalPageSize">
            <el-pagination
              :current-page="internalCurrentPage"
              :page-size="internalPageSize"
              :total="paginationInfo.total"
              layout="total, prev, pager, next, jumper"
              :small="true"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
              hide-on-single-page
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Work Order Detail or Create -->
    <div class="right-panel">
      <!-- Work Order Detail View -->
      <WorkOrderDetail
        v-if="currentRightPanelView === 'detail'"
        :work-order="selectedWorkOrder"
        @edit="handleEdit"
        @share="handleShare"
        @export="handleExport"
        @status-change="handleStatusChange"
        @add-parts="handleAddParts"
        @add-time="handleAddTime"
        @add-costs="handleAddCosts"
        @view-procedure="handleViewProcedure"
        @add-comment="handleAddComment"
      />

      <!-- Work Order Create View -->
      <WorkOrderCreate
        v-else-if="currentRightPanelView === 'create'"
        @back-to-detail="showDetailView"
        @work-order-created="handleWorkOrderCreated"
      />

      <!-- Work Order Edit View -->
      <WorkOrderEdit
        v-else-if="currentRightPanelView === 'edit'"
        :work-order="workOrderToEdit"
        @back-to-detail="showDetailView"
        @work-order-updated="handleWorkOrderUpdated"
      />
    </div>

    <!-- PDF Preview Modal -->
    <el-dialog
      v-model="showPdfPreview"
      title="Work Order PDF Preview"
      width="95%"
      :before-close="
        () => {
          showPdfPreview = false
          pdfPreviewData = null
          currentPage = 1
          zoomLevel = 1
        }
      "
      class="pdf-preview-dialog"
      top="2vh"
    >
      <div class="pdf-preview-container">
        <!-- Enhanced Toolbar -->
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

        <!-- PDF Content with Enhanced Scrolling -->
        <div class="pdf-preview-content print-simulation" ref="pdfPreviewContent">
          <div class="pdf-content-wrapper" :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }">
            <WorkOrderPdf
              v-if="pdfPreviewData"
              :work-order="pdfPreviewData"
              ref="pdfComponent"
              class="preview-print-mode"
            />
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import WorkOrderCard from './WorkOrderCard.vue'
import WorkOrderDetail from './WorkOrderDetail.vue'
import WorkOrderCreate from './WorkOrderCreate.vue'
import WorkOrderEdit from './WorkOrderEdit.vue'
import WorkOrderPdf from '../WorkOrderPdf.vue'
import { Printer, Download, View, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from '@element-plus/icons-vue'

// Props
const props = defineProps( {
  workOrders : {
    type : Array,
    default : () => []
  },
  loading : {
    type : Boolean,
    default : false
  },
  filters : {
    type : Object,
    default : () => ( {} )
  },
  total : {
    type : Number,
    default : 0
  },
  currentPage : {
    type : Number,
    default : 1
  },
  pageSize : {
    type : Number,
    default : 10
  }
} )

// Emits
const emit = defineEmits( [
  'edit',
  'delete',
  'status-change',
  'refresh',
  'work-order-created',
  'work-order-updated',
  'page-change',
  'page-size-change',
  'tab-change'
] )

const { t } = useI18n()

// State
const selectedWorkOrder = ref( null )
const activeTab = ref( 'todo' )
const sortBy = ref( 'priority-desc' )
const currentRightPanelView = ref( 'detail' ) // 'detail', 'create', or 'edit'
const workOrderToEdit = ref( null )

// PDF Preview state
const showPdfPreview = ref( false )
const pdfPreviewData = ref( null )
// eslint-disable-next-line vue/no-dupe-keys
const currentPage = ref( 1 )
const totalPages = ref( 2 ) // Will be calculated dynamically
const zoomLevel = ref( 1 )
const pdfPreviewContent = ref( null )

// Use pagination from props instead of local state
const internalCurrentPage = ref( props.currentPage )
const internalPageSize = ref( props.pageSize )

// Server handles all filtering, sorting, and pagination
// Use work orders directly from props - no client-side processing needed
const displayedWorkOrders = computed( () => {
  // Server provides correctly filtered, sorted, and paginated data
  // Ensure we always return an array to prevent template errors
  const workOrders = Array.isArray( props.workOrders ) ? props.workOrders : []

  // Debug logging to verify pagination data flow
  console.log( '🔍 TodoView displayedWorkOrders computed:', {
    count : workOrders.length,
    currentPage : internalCurrentPage.value,
    pageSize : internalPageSize.value,
    total : props.total,
    firstItemId : workOrders[0]?.id,
    firstItemName : workOrders[0]?.name,
    allIds : workOrders.map( wo => wo.id )
  } )

  return workOrders
} )

const paginationInfo = computed( () => {
  const total = props.total
  const start = total === 0 ? 0 : ( internalCurrentPage.value - 1 ) * internalPageSize.value + 1
  const end = Math.min( internalCurrentPage.value * internalPageSize.value, total )

  return {
    start,
    end,
    total
  }
} )

// Methods
// eslint-disable-next-line no-unused-vars
const getPriorityValue = priority => {
  const priorityMap = {
    Urgent : 4,
    High : 3,
    Medium : 2,
    Low : 1
  }
  return priorityMap[priority] || 0
}

const selectWorkOrder = workOrder => {
  selectedWorkOrder.value = workOrder
}

const handleTabChange = tabName => {
  activeTab.value = tabName
  // Clear selection when switching tabs
  selectedWorkOrder.value = null

  // Emit tab change to parent for server-side filtering
  const statusFilter = tabName === 'todo' ? 'pending,in_progress' : 'completed'
  emit( 'tab-change', { tab : tabName, statusFilter } )
}

const handleSortChange = sortValue => {
  sortBy.value = sortValue
}

const handleCardAction = ( { action, workOrder } ) => {
  switch ( action ) {
    case 'edit':
      handleEdit( workOrder )
      break
    case 'view':
      selectWorkOrder( workOrder )
      break
    case 'delete':
      handleDelete( workOrder )
      break
    default:
      console.warn( `Unhandled action: ${action}`, workOrder )
  }
}

const handleEdit = workOrder => {
  // Show edit view in right panel instead of emitting to parent
  workOrderToEdit.value = workOrder
  currentRightPanelView.value = 'edit'
  selectedWorkOrder.value = workOrder
}

const handleDelete = workOrder => {
  emit( 'delete', workOrder )
}

const handleShare = workOrder => {
  // Implement share functionality
  ElMessage.success( t( 'workOrder.messages.shareSuccess' ) )
}

const handleExport = async workOrder => {
  try {
    // Show PDF preview instead of auto-printing
    showPdfPreview.value = true
    pdfPreviewData.value = workOrder
    currentPage.value = 1
    zoomLevel.value = 1

    // Add scroll listener after modal opens and component is rendered
    setTimeout( () => {
      setupScrollListener()
      // Ensure the PDF component is fully rendered
      ensurePdfComponentRendered()
    }, 500 )

    ElMessage.success( 'PDF preview opened' )
  } catch ( error ) {
    console.error( 'Export error:', error )
    ElMessage.error( 'Failed to open PDF preview. Please try again.' )
  }
}

// Ensure PDF component is fully rendered with all styles
const ensurePdfComponentRendered = () => {
  const pdfElement = document.querySelector( '.pdf-preview-content .work-order-pdf' )
  if ( pdfElement ) {
    // Force a reflow to ensure all styles are applied
    // eslint-disable-next-line no-unused-expressions
    pdfElement.offsetHeight

    // Add a class to indicate the component is ready for export
    pdfElement.classList.add( 'pdf-ready-for-export' )

    // Calculate actual number of pages
    calculateActualPageCount()
  }
}

// Calculate the actual number of pages based on content height and print simulation
const calculateActualPageCount = () => {
  const pdfElement = document.querySelector( '.pdf-preview-content .work-order-pdf' )
  if ( !pdfElement ) return

  // Create a print simulation container
  const printSimContainer = document.createElement( 'div' )
  printSimContainer.style.position = 'absolute'
  printSimContainer.style.top = '-9999px'
  printSimContainer.style.left = '-9999px'
  printSimContainer.style.width = '210mm'
  printSimContainer.style.height = 'auto'
  printSimContainer.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif"

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

  // Create an iframe for accurate print simulation
  const iframe = document.createElement( 'iframe' )
  iframe.style.position = 'absolute'
  iframe.style.top = '-9999px'
  iframe.style.left = '-9999px'
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  iframe.style.border = 'none'

  document.body.appendChild( iframe )

  // Write the HTML to the iframe
  iframe.contentDocument.open()
  iframe.contentDocument.write( printHTML )
  iframe.contentDocument.close()

  // Wait for the iframe to load and then count pages
  setTimeout( () => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      const pages = iframeDoc.querySelectorAll( '.pdf-page' )
      const actualPageCount = pages.length

      // Update totalPages if different
      if ( actualPageCount !== totalPages.value && actualPageCount > 0 ) {
        totalPages.value = actualPageCount
        console.log( `Updated page count to: ${actualPageCount}` )
      }
    } catch ( error ) {
      console.warn( 'Could not calculate page count:', error )
      // Fallback to counting existing pages
      const pages = pdfElement.querySelectorAll( '.pdf-page' )
      totalPages.value = pages.length
    }

    // Cleanup
    document.body.removeChild( iframe )
  }, 1000 )
}

// Setup scroll listener for automatic page detection
const setupScrollListener = () => {
  if ( !pdfPreviewContent.value ) return

  const scrollContainer = pdfPreviewContent.value

  const handleScroll = () => {
    const pages = scrollContainer.querySelectorAll( '.pdf-page' )
    if ( !pages.length ) return

    const containerTop = scrollContainer.scrollTop
    const containerHeight = scrollContainer.clientHeight
    const viewportCenter = containerTop + containerHeight / 2

    // Find which page is most visible in the viewport
    let closestPage = 1
    let closestDistance = Infinity

    pages.forEach( ( page, index ) => {
      const pageTop = page.offsetTop
      const pageHeight = page.offsetHeight
      const pageCenter = pageTop + pageHeight / 2
      const distance = Math.abs( viewportCenter - pageCenter )

      if ( distance < closestDistance ) {
        closestDistance = distance
        closestPage = index + 1
      }
    } )

    if ( closestPage !== currentPage.value ) {
      currentPage.value = closestPage
    }
  }

  scrollContainer.addEventListener( 'scroll', handleScroll )

  // Cleanup function
  const cleanup = () => {
    scrollContainer.removeEventListener( 'scroll', handleScroll )
  }

  // Store cleanup function for later use
  scrollContainer._scrollCleanup = cleanup
}

// PDF Preview Methods
const printPdf = async() => {
  // Create a new window for printing
  const printWindow = window.open( '', '_blank' )

  if ( !printWindow ) {
    ElMessage.error( 'Unable to open print window. Please check popup blockers.' )
    return
  }

  // Get the PDF component HTML and ensure it's ready
  const pdfElement = document.querySelector( '.pdf-preview-content .work-order-pdf' )
  if ( !pdfElement ) {
    ElMessage.error( 'PDF content not found' )
    return
  }

  // Wait for component to be fully rendered if not ready
  if ( !pdfElement.classList.contains( 'pdf-ready-for-export' ) ) {
    await new Promise( resolve => setTimeout( resolve, 1000 ) )
    ensurePdfComponentRendered()
  }

  const htmlContent = pdfElement.outerHTML

  // Create print-optimized HTML document with exact same layout as preview
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Work Order ${pdfPreviewData.value?.id || 'Export'}</title>
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

  printWindow.document.write( printHTML )
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout( () => {
      printWindow.print()
      printWindow.close()
    }, 500 )
  }
}

const downloadPdf = async() => {
  try {
    // Check if html2pdf is available
    if ( typeof window.html2pdf === 'undefined' ) {
      ElMessage.error( 'PDF download requires html2pdf library. Using print instead.' )
      printPdf()
      return
    }

    // Create a temporary container with the same styles as print
    const tempContainer = document.createElement( 'div' )
    tempContainer.style.position = 'absolute'
    tempContainer.style.top = '-9999px'
    tempContainer.style.left = '-9999px'
    tempContainer.style.width = '210mm'
    tempContainer.style.height = 'auto'

    // Get the PDF component HTML and ensure it's ready
    const pdfElement = document.querySelector( '.pdf-preview-content .work-order-pdf' )
    if ( !pdfElement ) {
      ElMessage.error( 'PDF content not found' )
      return
    }

    // Wait for component to be fully rendered if not ready
    if ( !pdfElement.classList.contains( 'pdf-ready-for-export' ) ) {
      await new Promise( resolve => setTimeout( resolve, 1000 ) )
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
    document.body.appendChild( tempContainer )

    const filename = `WorkOrder_${pdfPreviewData.value?.id || 'Export'}_${new Date().toISOString().split( 'T' )[0]}.pdf`

    const opt = {
      margin : 0,
      filename,
      image : { type : 'jpeg', quality : 0.98 },
      html2canvas : {
        scale : 2,
        useCORS : true,
        letterRendering : true,
        allowTaint : true,
        foreignObjectRendering : true
      },
      jsPDF : {
        unit : 'mm',
        format : 'a4',
        orientation : 'portrait'
      }
    }

    await window.html2pdf().set( opt ).from( tempContainer.firstChild ).save()

    // Cleanup
    document.body.removeChild( tempContainer )

    ElMessage.success( `PDF downloaded: ${filename}` )
  } catch ( error ) {
    console.error( 'Download error:', error )
    ElMessage.error( 'Failed to download PDF. Please try print instead.' )
  }
}

const openInNewWindow = () => {
  const newWindow = window.open( '', '_blank', 'width=900,height=1200' )

  if ( !newWindow ) {
    ElMessage.error( 'Unable to open new window. Please check popup blockers.' )
    return
  }

  const pdfElement = document.querySelector( '.pdf-preview-content .work-order-pdf' )
  if ( !pdfElement ) {
    ElMessage.error( 'PDF content not found' )
    return
  }

  const htmlContent = pdfElement.outerHTML

  const newWindowHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Work Order ${pdfPreviewData.value?.id || 'Preview'}</title>
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

  newWindow.document.write( newWindowHTML )
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

    /* Instructions Section */
    .instructions-section {
      margin: 15mm 0;
    }

    .instruction-steps {
      display: flex;
      flex-direction: column;
      gap: 8mm;
    }

    .instruction-step {
      display: flex;
      gap: 5mm;
      padding: 5mm;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #0085a4;
    }

    .step-number {
      background: #0085a4;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      flex-shrink: 0;
    }

    .step-content {
      flex: 1;
    }

    .step-title {
      font-size: 10px;
      font-weight: bold;
      color: #333;
      margin: 0 0 3mm 0;
      text-transform: uppercase;
    }

    .step-details {
      display: flex;
      gap: 10mm;
    }

    .step-info {
      flex: 1;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 3mm;
      font-size: 9px;
      color: #666;
      margin-bottom: 2mm;
    }

    .icon-user::before { content: "👤"; }
    .icon-clock::before { content: "🕐"; }
    .icon-check::before { content: "✓"; color: #0085a4; }

    .step-requirements {
      flex: 1;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 3mm;
      font-size: 9px;
      color: #666;
      margin-bottom: 2mm;
    }

    /* Technician Section */
    .technician-section {
      padding: 8mm 0;
      border-bottom: 1px solid #eee;
    }

    .tech-info {
      margin-top: 3mm;
    }

    .tech-name {
      font-size: 11px;
      font-weight: bold;
      color: #333;
    }

    .tech-contact {
      font-size: 9px;
      color: #666;
      margin-top: 1mm;
    }

    .service-date {
      font-size: 11px;
      font-weight: bold;
      color: #333;
      margin-top: 3mm;
    }

    /* Approval Section */
    .approval-section {
      padding: 8mm 0;
      border-bottom: 1px solid #eee;
    }

    .approval-fields {
      margin-top: 5mm;
    }

    .approval-field {
      margin-bottom: 5mm;
    }

    .approval-field label {
      font-size: 8px;
      color: #666;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2mm;
    }

    .signature-line {
      border-bottom: 1px solid #ccc;
      height: 8mm;
      width: 100%;
    }

    .date-line {
      font-size: 10px;
      color: #333;
      padding: 2mm 0;
      border-bottom: 1px solid #ccc;
    }

    .price-details {
      margin-top: 5mm;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 2mm 0;
      font-size: 10px;
      border-bottom: 1px solid #eee;
    }

    .price-row.total-row {
      font-weight: bold;
      color: #0085a4;
      border-bottom: 2px solid #0085a4;
      margin-top: 3mm;
    }

    /* Footer */
    .pdf-footer {
      position: absolute;
      bottom: 15mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
    }

    .footer-note {
      font-size: 8px;
      color: #666;
      margin-bottom: 5mm;
      font-style: italic;
    }

    .footer-branding {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3mm;
    }

    .social-icons {
      display: flex;
      gap: 3mm;
    }

    .social-icon {
      width: 20px;
      height: 20px;
      background: #0085a4;
      color: white;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }

    .footer-budget {
      display: flex;
      align-items: center;
      gap: 5mm;
    }

    .budget-label {
      background: #0085a4;
      color: white;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: bold;
    }

    .budget-amount {
      font-size: 14px;
      font-weight: bold;
      color: #0085a4;
    }

    .footer-copyright {
      font-size: 8px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 3mm;
    }

    /* Asset Section */
    .asset-section {
      margin-bottom: 10mm;
    }

    .asset-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5mm;
    }

    .asset-field {
      padding: 3mm;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .asset-field label {
      font-size: 8px;
      color: #666;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2mm;
    }

    .asset-field .field-value {
      font-size: 10px;
      font-weight: bold;
      color: #333;
    }

    /* Table Styles */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5mm;
      font-size: 9px;
    }

    .data-table th {
      background: #0085a4;
      color: white;
      padding: 3mm;
      text-align: left;
      font-weight: bold;
      font-size: 8px;
      text-transform: uppercase;
    }

    .data-table td {
      padding: 2mm 3mm;
      border-bottom: 1px solid #eee;
    }

    .data-table tbody tr:nth-child(even) {
      background: #f8f9fa;
    }

    .data-table tfoot .total-row {
      background: #f0f0f0;
      font-weight: bold;
      color: #0085a4;
    }

    .data-table tfoot .total-row td {
      border-top: 2px solid #0085a4;
      padding: 3mm;
    }

    /* Safety Section */
    .safety-checklist {
      display: flex;
      flex-direction: column;
      gap: 3mm;
    }

    .safety-item {
      display: flex;
      align-items: flex-start;
      gap: 3mm;
      padding: 3mm;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .safety-checkbox {
      width: 15px;
      height: 15px;
      border: 2px solid #ccc;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
    }

    .safety-checkbox.checked {
      background: #0085a4;
      border-color: #0085a4;
      color: white;
    }

    .safety-text {
      flex: 1;
    }

    .safety-requirement {
      font-size: 10px;
      font-weight: bold;
      color: #333;
      margin-bottom: 1mm;
    }

    .safety-notes {
      font-size: 9px;
      color: #666;
    }

    /* Timeline Section */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 3mm;
    }

    .timeline-item {
      display: flex;
      gap: 5mm;
      padding: 3mm;
      border-left: 3px solid #0085a4;
      background: #f8f9fa;
      border-radius: 0 4px 4px 0;
    }

    .timeline-date {
      font-size: 8px;
      color: #666;
      min-width: 25mm;
      flex-shrink: 0;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-action {
      font-size: 10px;
      font-weight: bold;
      color: #333;
      margin-bottom: 1mm;
    }

    .timeline-performer {
      font-size: 9px;
      color: #0085a4;
      margin-bottom: 1mm;
    }

    .timeline-details {
      font-size: 9px;
      color: #666;
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
  if ( currentPage.value > 1 ) {
    currentPage.value--
    scrollToPage( currentPage.value )
  }
}

const nextPage = () => {
  if ( currentPage.value < totalPages.value ) {
    currentPage.value++
    scrollToPage( currentPage.value )
  }
}

const goToPage = page => {
  currentPage.value = page
  scrollToPage( page )
}

const scrollToPage = page => {
  if ( !pdfPreviewContent.value ) return

  const pages = pdfPreviewContent.value.querySelectorAll( '.pdf-page' )
  if ( pages && pages[page - 1] ) {
    pages[page - 1].scrollIntoView( {
      behavior : 'smooth',
      block : 'start'
    } )
  }
}

// Zoom Control Methods
const zoomIn = () => {
  if ( zoomLevel.value < 2 ) {
    zoomLevel.value = Math.min( 2, zoomLevel.value + 0.25 )
  }
}

const zoomOut = () => {
  if ( zoomLevel.value > 0.5 ) {
    zoomLevel.value = Math.max( 0.5, zoomLevel.value - 0.25 )
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const handleStatusChange = ( { workOrder, status } ) => {
  emit( 'status-change', { workOrder, status } )
}

const handleAddParts = () => {
  // Implement add parts functionality
  ElMessage.info( t( 'workOrder.tracking.addParts' ) )
}

const handleAddTime = () => {
  // Implement add time functionality
  ElMessage.info( t( 'workOrder.tracking.addTime' ) )
}

const handleAddCosts = () => {
  // Implement add costs functionality
  ElMessage.info( t( 'workOrder.tracking.addCosts' ) )
}

const handleViewProcedure = () => {
  // Implement view procedure functionality
  ElMessage.info( t( 'workOrder.tracking.viewProcedure' ) )
}

const handleAddComment = ( { workOrder, comment } ) => {
  // Implement add comment functionality
  ElMessage.success( t( 'workOrder.comments.add' ) )
}

// Pagination methods
const handlePageChange = page => {
  console.log( '🔄 TodoView handlePageChange:', { from : internalCurrentPage.value, to : page } )
  internalCurrentPage.value = page
  // Emit to parent to handle server-side pagination
  emit( 'page-change', page )
  // Clear selection when changing pages to avoid confusion
  selectedWorkOrder.value = null
  console.log( '📤 TodoView emitted page-change event:', page )
}

const handlePageSizeChange = newPageSize => {
  console.log( '🔄 TodoView handlePageSizeChange:', { from : internalPageSize.value, to : newPageSize } )
  internalPageSize.value = newPageSize
  internalCurrentPage.value = 1 // Reset to first page when changing page size
  // Emit to parent to handle server-side pagination
  emit( 'page-size-change', newPageSize )
  selectedWorkOrder.value = null
  console.log( '📤 TodoView emitted page-size-change event:', newPageSize )
}

// Watchers
watch(
  () => props.workOrders,
  newWorkOrders => {
    // Auto-select first work order if none selected
    if ( newWorkOrders.length > 0 && !selectedWorkOrder.value ) {
      selectedWorkOrder.value = displayedWorkOrders.value[0]
    }
  },
  { immediate : true }
)

// Watch for prop changes to sync internal state
watch(
  () => props.currentPage,
  ( newPage, oldPage ) => {
    console.log( '👁️ TodoView currentPage prop changed:', { from : oldPage, to : newPage } )
    internalCurrentPage.value = newPage
  }
)

watch(
  () => props.pageSize,
  ( newPageSize, oldPageSize ) => {
    console.log( '👁️ TodoView pageSize prop changed:', { from : oldPageSize, to : newPageSize } )
    internalPageSize.value = newPageSize
  }
)

watch(
  () => props.workOrders,
  ( newWorkOrders, oldWorkOrders ) => {
    console.log( '👁️ TodoView workOrders prop changed:', {
      oldCount : oldWorkOrders?.length || 0,
      newCount : newWorkOrders?.length || 0,
      newFirstId : newWorkOrders?.[0]?.id,
      newIds : newWorkOrders?.map( wo => wo.id ) || []
    } )
  }
)

// Watch for filter changes to reset pagination
watch(
  () => props.filters,
  () => {
    internalCurrentPage.value = 1
    emit( 'page-change', 1 )
    selectedWorkOrder.value = null
  },
  { deep : true }
)

// Watch for PDF preview data changes to recalculate pages
watch(
  () => pdfPreviewData.value,
  newData => {
    if ( newData && showPdfPreview.value ) {
      // Reset page count and recalculate after component renders
      currentPage.value = 1
      setTimeout( () => {
        calculateActualPageCount()
      }, 1500 ) // Give more time for complex layouts
    }
  }
)

// Watch for preview visibility to ensure proper setup
watch(
  () => showPdfPreview.value,
  isVisible => {
    if ( isVisible && pdfPreviewData.value ) {
      // Reset and recalculate when preview opens
      currentPage.value = 1
      setTimeout( () => {
        ensurePdfComponentRendered()
      }, 1000 )
    }
  }
)

// Reset pagination when tab or sort changes
watch(
  [activeTab, sortBy],
  () => {
    internalCurrentPage.value = 1
    emit( 'page-change', 1 )
    selectedWorkOrder.value = null
  },
  { deep : true }
)

// Methods for create functionality
const showCreateForm = () => {
  currentRightPanelView.value = 'create'
  selectedWorkOrder.value = null
}

const showDetailView = () => {
  currentRightPanelView.value = 'detail'
  workOrderToEdit.value = null
  // Auto-select first work order if none selected
  if ( !selectedWorkOrder.value && displayedWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = displayedWorkOrders.value[0]
  }
}

const handleWorkOrderCreated = newWorkOrder => {
  console.log( '📨 TodoView received work-order-created event:', newWorkOrder )

  // Emit to parent component
  emit( 'work-order-created', newWorkOrder )
  console.log( '📤 TodoView forwarded event to parent (index.vue)' )

  // DON'T call showDetailView() immediately - let parent handle selection after refresh
  // showDetailView()
}

const handleWorkOrderUpdated = updatedWorkOrder => {
  // Update the work order in the list
  const index = displayedWorkOrders.value.findIndex( wo => wo.id === updatedWorkOrder.id )
  if ( index !== -1 ) {
    // Replace the work order in the list
    displayedWorkOrders.value[index] = updatedWorkOrder
  }

  // Update selected work order if it's the same one
  if ( selectedWorkOrder.value && selectedWorkOrder.value.id === updatedWorkOrder.id ) {
    selectedWorkOrder.value = updatedWorkOrder
  }

  // Clear edit state and return to detail view
  workOrderToEdit.value = null
  currentRightPanelView.value = 'detail'

  // Emit to parent for any additional handling
  emit( 'work-order-updated', updatedWorkOrder )

  ElMessage.success( 'Work order updated successfully' )
}

// Method to select work order by ID (for external use)
const selectWorkOrderById = workOrderId => {
  console.log( '🎯 selectWorkOrderById called with ID:', workOrderId )
  console.log(
    '📄 Current displayedWorkOrders:',
    displayedWorkOrders.value.map( wo => ( {
      id : wo.id,
      name : wo.name,
      state_id : wo.state_id,
      status : wo.status
    } ) )
  )

  const workOrder = displayedWorkOrders.value.find( wo => wo.id === workOrderId )
  if ( workOrder ) {
    console.log( '✅ Found work order:', workOrder )
    selectedWorkOrder.value = workOrder
    currentRightPanelView.value = 'detail'
    console.log( '📍 Auto-selected work order:', workOrder.name || workOrder.id )
    return true
  }
  console.warn( '❌ Work order not found in displayedWorkOrders' )
  console.log(
    '🔍 Available IDs:',
    displayedWorkOrders.value.map( wo => wo.id )
  )
  return false
}

// Expose methods for parent component
defineExpose( {
  showCreateForm,
  showDetailView,
  selectWorkOrderById
} )

// Lifecycle
onMounted( () => {
  // Auto-select first work order
  if ( displayedWorkOrders.value.length > 0 ) {
    selectedWorkOrder.value = displayedWorkOrders.value[0]
  }
} )

defineOptions( {
  name : 'TodoView'
} )
</script>

<style scoped lang="scss">
.todo-view {
  display: flex;
  height: 100%;
  gap: 10px;
}

.left-panel {
  width: 30%;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .todo-specific-filters {
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid var(--el-border-color-light);

    .todo-tabs {
      margin-bottom: 16px;

      :deep(.el-tabs__header) {
        margin: 0;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
      }

      :deep(.el-tabs__item) {
        font-size: 14px;
        font-weight: 500;
      }
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 8px;

      .sort-label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        font-weight: 500;
      }
    }
  }
}

.work-order-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);

  .loading-container {
    padding: 16px;
  }

  .empty-list {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .list-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .pagination-info {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background: var(--el-bg-color);

      .info-text {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .cards-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
      min-height: 550px; // Ensure space for at least 5 cards (5 * 110px)
      overflow-x: hidden;

      // Custom scrollbar
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: var(--el-fill-color-lighter);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-fill-color-dark);
        border-radius: 3px;

        &:hover {
          background: var(--el-fill-color-darker);
        }
      }
    }

    .pagination-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      background: var(--el-bg-color);

      :deep(.el-pagination) {
        .el-pager li {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
        }

        .btn-prev,
        .btn-next {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
        }

        .el-pagination__total,
        .el-pagination__jump {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.right-panel {
  flex: 1;
  padding-bottom: 40px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

// Responsive design
@media (max-width: 1024px) {
  .todo-view {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    width: 100%;
    min-width: auto;
    max-height: 50vh;
  }

  .right-panel {
    min-height: 50vh;
  }
}

@media (max-width: 768px) {
  .todo-view {
    gap: 12px;
  }

  .left-panel {
    max-height: 40vh;
  }

  .work-order-list {
    padding-right: 0;

    .list-content {
      .pagination-info {
        padding: 8px 12px;
        font-size: 12px;

        .el-select {
          width: 80px;
        }
      }

      .cards-container {
        :deep(.work-order-card) {
          .card-content {
            .content-main {
              .card-title {
                font-size: 14px;
              }

              .card-meta {
                font-size: 11px;
              }
            }

            .card-thumbnail-circle {
              width: 50px;
              height: 50px;

              .circular-image {
                width: 50px;
                height: 50px;
              }

              .image-slot-circle {
                width: 50px;
                height: 50px;
                font-size: 16px;
              }
            }
          }
        }
      }

      .pagination-controls {
        padding: 8px 12px;

        :deep(.el-pagination) {
          .el-pager li {
            min-width: 24px;
            height: 24px;
            line-height: 24px;
            font-size: 11px;
          }

          .btn-prev,
          .btn-next {
            min-width: 24px;
            height: 24px;
            line-height: 24px;
          }

          .el-pagination__total,
          .el-pagination__jump {
            font-size: 11px;
          }
        }
      }
    }
  }
}

/* PDF Preview Modal Styles */
.pdf-preview-dialog {
  .el-dialog {
    margin: 2vh auto !important;
    height: 96vh;
    display: flex;
    flex-direction: column;
  }

  .el-dialog__body {
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

.pdf-preview-content .work-order-pdf {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.pdf-preview-content .pdf-page {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pdf-preview-content .pdf-page:last-child {
  margin-bottom: 0;
}

/* Print Simulation Styles for Preview */
.pdf-preview-content.print-simulation {
  /* Apply print-like constraints to preview */
}

.pdf-preview-content.print-simulation .work-order-pdf.preview-print-mode {
  /* Force print layout in preview */
}

.pdf-preview-content.print-simulation .pdf-page {
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

.pdf-preview-content.print-simulation .page-break {
  /* Force page breaks in preview to match print */
  display: block;
  height: 0;
  page-break-before: always;
  break-before: page;
}

/* Apply print styles to preview */
.pdf-preview-content.print-simulation .pdf-footer {
  position: absolute;
  bottom: 15mm;
  left: 20mm;
  right: 20mm;
  text-align: center;
}

/* Ensure consistent content flow */
.pdf-preview-content.print-simulation .pdf-section {
  break-inside: avoid-page;
}

.pdf-preview-content.print-simulation .instruction-step {
  break-inside: avoid;
}

.pdf-preview-content.print-simulation .data-table {
  break-inside: avoid;
}

.pdf-preview-content.print-simulation .timeline-item {
  break-inside: avoid;
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
    .el-dialog {
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

  .toolbar-left .el-button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .toolbar-left .el-button {
    font-size: 11px;
    padding: 4px 8px;
  }

  .page-navigation {
    gap: 6px;
  }

  .page-navigation .el-button {
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

  .zoom-controls .el-button {
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
    .el-dialog {
      width: 100% !important;
      margin: 0 !important;
      height: 100vh;
      border-radius: 0;
    }
  }

  .pdf-preview-toolbar {
    padding: 6px 8px;
  }

  .toolbar-left .el-button {
    font-size: 10px;
    padding: 3px 6px;
  }

  .page-navigation .el-button {
    font-size: 10px;
    padding: 3px 6px;
  }

  .zoom-controls .el-button {
    font-size: 10px;
    padding: 3px 4px;
  }

  .pdf-preview-content {
    padding: 5px;
  }
}
</style>

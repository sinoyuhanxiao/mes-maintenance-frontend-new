import { createApp } from 'vue'
import WorkOrderPdf from '@/components/WorkOrder/WorkOrderPdf.vue'

/**
 * Vue Component-based PDF Export Service for CMMS Work Orders
 * Generates PDF using HTML/CSS rendering instead of jsPDF
 */
export class VueWorkOrderPDFExporter {
  constructor() {
    this.tempContainer = null
  }

  /**
   * Main export function using Vue component
   */
  async exportWorkOrder(workOrder, options = {}) {
    try {
      // Create temporary container for rendering
      this.tempContainer = document.createElement('div')
      this.tempContainer.style.position = 'absolute'
      this.tempContainer.style.top = '-9999px'
      this.tempContainer.style.left = '-9999px'
      this.tempContainer.style.width = '210mm'
      this.tempContainer.style.height = 'auto'
      document.body.appendChild(this.tempContainer)

      // Create Vue app instance with the PDF component
      const app = createApp(WorkOrderPdf, {
        workOrder: workOrder || this.generateSampleData(),
      })

      // Mount the component
      const componentInstance = app.mount(this.tempContainer)

      // Wait for component to render
      await this.$nextTick()

      // Generate PDF using browser print or external library
      const result = await this.generatePDF(componentInstance, options)

      // Cleanup
      this.cleanup(app)

      return { success: true, ...result }
    } catch (error) {
      console.error('Vue PDF Export Error:', error)
      this.cleanup()
      return { success: false, error: error.message }
    }
  }

  /**
   * Generate PDF from rendered Vue component
   */
  async generatePDF(componentInstance, options = {}) {
    const method = options.method || 'print'

    switch (method) {
      case 'print':
        return this.generatePDFViaPrint(componentInstance)
      case 'html2pdf':
        return this.generatePDFViaHtml2Pdf(componentInstance, options)
      case 'puppeteer':
        return this.generatePDFViaPuppeteer(componentInstance, options)
      default:
        throw new Error(`Unsupported PDF generation method: ${method}`)
    }
  }

  /**
   * Generate PDF using browser print functionality
   */
  async generatePDFViaPrint(componentInstance) {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      throw new Error('Unable to open print window. Please check popup blockers.')
    }

    // Get the rendered HTML
    const htmlContent = this.tempContainer.innerHTML

    // Create print-optimized HTML document
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Work Order ${componentInstance.workOrder?.id || 'Export'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333333;
              line-height: 1.4;
              background: white;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            @media print {
              .pdf-page {
                page-break-after: always;
                margin: 0;
                padding: 20mm;
              }
              
              .pdf-page:last-child {
                page-break-after: avoid;
              }
              
              .page-break {
                page-break-before: always;
              }
            }
            
            /* Include all the component styles here */
            ${this.getComponentStyles()}
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `

    // Write content to print window
    printWindow.document.write(printHTML)
    printWindow.document.close()

    // Wait for content to load
    await new Promise(resolve => {
      printWindow.onload = resolve
      setTimeout(resolve, 1000) // Fallback timeout
    })

    // Trigger print dialog
    printWindow.print()

    // Close print window after a delay
    setTimeout(() => {
      printWindow.close()
    }, 1000)

    const filename = this.generateFilename(componentInstance.workOrder)
    return { filename, method: 'print' }
  }

  /**
   * Generate PDF using html2pdf library (if available)
   */
  async generatePDFViaHtml2Pdf(componentInstance, options) {
    // Check if html2pdf is available
    if (typeof window.html2pdf === 'undefined') {
      throw new Error('html2pdf library not found. Please include html2pdf.js')
    }

    const element = this.tempContainer.firstChild
    const filename = this.generateFilename(componentInstance.workOrder)

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      ...options.html2pdfOptions,
    }

    await window.html2pdf().set(opt).from(element).save()

    return { filename, method: 'html2pdf' }
  }

  /**
   * Generate PDF using Puppeteer (server-side)
   */
  async generatePDFViaPuppeteer(componentInstance, options) {
    // This would require a server-side endpoint
    const htmlContent = this.tempContainer.innerHTML
    const styles = this.getComponentStyles()

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        styles,
        options: options.puppeteerOptions || {},
      }),
    })

    if (!response.ok) {
      throw new Error('Server-side PDF generation failed')
    }

    const blob = await response.blob()
    const filename = this.generateFilename(componentInstance.workOrder)

    // Download the PDF
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    return { filename, method: 'puppeteer' }
  }

  /**
   * Get component styles as string
   */
  getComponentStyles() {
    // This would contain all the styles from WorkOrderPdf.vue
    // For now, return a basic set - in production, this should be extracted from the component
    return `
      .work-order-pdf { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.4; background: white; }
      .pdf-page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm; box-sizing: border-box; background: white; position: relative; }
      .page-break { page-break-before: always; }
      .pdf-header { margin-bottom: 15mm; }
      .header-top { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 5mm; border-bottom: 2px solid #0085a4; margin-bottom: 10mm; }
      .logo-placeholder { width: 40px; height: 40px; background: #0085a4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; }
      .logo-text { color: white; font-weight: bold; font-size: 16px; }
      .company-info { text-align: right; }
      .company-line { font-size: 9px; color: #555555; line-height: 1.2; margin-bottom: 2px; }
      .title-block { display: flex; justify-content: space-between; align-items: center; }
      .work-order-title { font-size: 24px; font-weight: bold; color: #0085a4; letter-spacing: 1px; margin: 0; }
      .work-order-id { font-size: 14px; color: #0085a4; margin-top: 4px; }
      .date-badge { background: #0085a4; color: white; padding: 4px 10px; border-radius: 4px; font-size: 9px; font-weight: bold; }
      .section-title { font-size: 14px; font-weight: bold; color: #0085a4; margin: 0 0 8mm 0; text-transform: uppercase; letter-spacing: 0.5px; }
      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20mm; }
      .field-label { font-size: 9px; font-weight: bold; color: #0085a4; text-transform: uppercase; display: block; margin-bottom: 3mm; }
      .field-value { font-size: 11px; font-weight: bold; color: #333; margin-bottom: 2mm; }
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 5mm; font-size: 9px; }
      .data-table th { background: #0085a4; color: white; padding: 3mm; text-align: left; font-weight: bold; font-size: 8px; text-transform: uppercase; }
      .data-table td { padding: 2mm 3mm; border-bottom: 1px solid #eee; }
      .data-table tbody tr:nth-child(even) { background: #f8f9fa; }
    `
  }

  /**
   * Generate sample data for demonstration
   */
  generateSampleData() {
    return {
      id: 'WO-2024-001',
      name: 'Preventive Maintenance - Conveyor Belt System',
      description:
        'Scheduled preventive maintenance for conveyor belt system including belt inspection, tension adjustment, and lubrication of drive components.',
      state: { name: 'In Progress' },
      priority: { name: 'High' },
      work_type: { name: 'Preventive' },
      due_date: '2024-08-15T16:00:00Z',
      created_at: new Date().toISOString(),
      created_by: 'Erik Yu',
      assigned_to: 'Mike Johnson',
      customer: 'Internal Maintenance',
      customerAddress: 'Plant A - Production Floor',
      customerContact: 'maintenance@company.com',
    }
  }

  /**
   * Generate filename for the PDF
   */
  generateFilename(workOrder) {
    const date = new Date().toISOString().split('T')[0]
    const id = workOrder?.id || 'WO-UNKNOWN'
    return `WorkOrder_${id}_${date}.pdf`
  }

  /**
   * Cleanup temporary elements and Vue app
   */
  cleanup(app = null) {
    if (app) {
      app.unmount()
    }

    if (this.tempContainer && this.tempContainer.parentNode) {
      this.tempContainer.parentNode.removeChild(this.tempContainer)
    }

    this.tempContainer = null
  }

  /**
   * Utility method to wait for next tick
   */
  $nextTick() {
    return new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  }
}

/**
 * Convenience function for quick PDF export
 */
export async function exportWorkOrderToPDF(workOrder, options = {}) {
  const exporter = new VueWorkOrderPDFExporter()
  return await exporter.exportWorkOrder(workOrder, options)
}

/**
 * Export default instance
 */
export default VueWorkOrderPDFExporter

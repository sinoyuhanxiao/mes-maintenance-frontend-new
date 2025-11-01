import { jsPDF } from 'jspdf'
import { convertToLocalTime } from '@/utils/datetime'

/**
 * Simple PDF Export Service for CMMS Work Orders
 * Basic implementation without autoTable to test jsPDF functionality
 */
export class SimpleWorkOrderPDFExporter {
  constructor() {
    this.doc = null
    this.currentY = 0
    this.pageHeight = 297 // A4 height in mm
    this.pageWidth = 210 // A4 width in mm
    this.margin = 20
    this.lineHeight = 6
  }

  /**
   * Main export function
   */
  async exportWorkOrder(workOrder, sampleData = null) {
    try {
      // Initialize PDF document
      this.doc = new jsPDF('p', 'mm', 'a4')
      this.currentY = this.margin

      // Use sample data if provided, otherwise use actual work order data
      const data = sampleData || this.generateSampleData(workOrder)

      // Generate PDF sections
      this.addHeader(data)
      this.addWorkOrderOverview(data)
      this.addSimpleContent(data)

      // Generate filename and save
      const filename = this.generateFilename(data)
      this.doc.save(filename)

      return { success: true, filename }
    } catch (error) {
      console.error('PDF Export Error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Add company header with branding
   */
  addHeader(data) {
    // Company logo area (placeholder)
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(this.margin, this.currentY, 40, 20, 'F')

    // Company name and title
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('FPS CMMS', this.margin + 45, this.currentY + 8)

    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Work Order Management', this.margin + 45, this.currentY + 15)

    // Export info (right aligned)
    this.doc.setFontSize(10)
    const exportDate = new Date().toLocaleString()
    const exportText = `Exported: ${exportDate}`
    this.doc.text(exportText, this.pageWidth - this.margin, this.currentY + 8, { align: 'right' })

    const pageText = 'Page 1'
    this.doc.text(pageText, this.pageWidth - this.margin, this.currentY + 15, { align: 'right' })

    this.currentY += 30
    this.addSeparator()
  }

  /**
   * Add work order overview section (simple text format)
   */
  addWorkOrderOverview(data) {
    this.addSectionTitle('Work Order Overview')

    // Add overview information as simple text
    const overviewItems = [
      ['Work Order ID:', data.workOrderId],
      ['Title:', data.title],
      ['Status:', data.status],
      ['Priority:', data.priority],
      ['Category:', data.category],
      ['Due Date:', this.formatDate(data.dueDate)],
      ['Created By:', data.createdByName],
      ['Assigned To:', data.assignedToName],
    ]

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')

    overviewItems.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(value || 'N/A', this.margin + 40, this.currentY)
      this.currentY += this.lineHeight
    })

    this.currentY += 10
  }

  /**
   * Add simple content sections
   */
  addSimpleContent(data) {
    // Asset Information
    this.addSectionTitle('Asset Information')
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')

    const assetInfo = [
      `Asset ID: ${data.assetId}`,
      `Asset Name: ${data.assetName}`,
      `Serial Number: ${data.assetSerialNumber}`,
      `Location: ${data.locationPath}`,
      `Manufacturer: ${data.manufacturer || 'N/A'}`,
      `Model: ${data.model || 'N/A'}`,
    ]

    assetInfo.forEach(info => {
      this.doc.text(info, this.margin, this.currentY)
      this.currentY += this.lineHeight
    })

    this.currentY += 10

    // Work Instructions
    this.addSectionTitle('Work Instructions')

    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Problem Description:', this.margin, this.currentY)
    this.currentY += this.lineHeight

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    const problemText = this.doc.splitTextToSize(data.reportedProblem, this.pageWidth - 2 * this.margin)
    this.doc.text(problemText, this.margin, this.currentY)
    this.currentY += problemText.length * this.lineHeight + 10

    // Work Steps
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Work Steps:', this.margin, this.currentY)
    this.currentY += this.lineHeight

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    data.workInstructions.forEach((instruction, index) => {
      const stepText = `${index + 1}. ${instruction}`
      const wrappedText = this.doc.splitTextToSize(stepText, this.pageWidth - 2 * this.margin - 10)
      this.doc.text(wrappedText, this.margin + 5, this.currentY)
      this.currentY += wrappedText.length * this.lineHeight + 2
    })
  }

  /**
   * Add section title
   */
  addSectionTitle(title) {
    this.checkPageBreak(20)

    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(51, 51, 51)
    this.doc.text(title, this.margin, this.currentY)

    // Add underline
    this.doc.setDrawColor(51, 51, 51)
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2)

    this.currentY += 10
    this.doc.setTextColor(0, 0, 0) // Reset to black
  }

  /**
   * Add separator line
   */
  addSeparator() {
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 5
  }

  /**
   * Check if page break is needed
   */
  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A'
    return convertToLocalTime(dateString, 'YYYY-MM-DD')
  }

  /**
   * Generate comprehensive sample data for demonstration
   */
  generateSampleData(workOrder) {
    return {
      // Basic work order info
      workOrderId: workOrder?.id || 'WO-2024-001',
      title: workOrder?.name || 'Preventive Maintenance - Conveyor Belt System',
      status: workOrder?.state?.name || 'In Progress',
      priority: workOrder?.priority?.name || 'High',
      category: workOrder?.work_type?.name || 'Preventive',
      dueDate: workOrder?.due_date || '2024-08-15T16:00:00Z',
      createdByName: workOrder?.created_by || 'Erik Yu',
      assignedToName: workOrder?.assigned_to || 'Mike Johnson',
      reportedProblem:
        workOrder?.description ||
        'Scheduled preventive maintenance for conveyor belt system including belt inspection, tension adjustment, and lubrication of drive components.',

      // Asset information
      assetId: 'CONV-001',
      assetName: 'Main Production Conveyor',
      assetSerialNumber: 'CB-2023-4567',
      locationPath: 'Plant A > Production Floor > Line 1 > Conveyor System',
      manufacturer: 'Industrial Conveyor Corp',
      model: 'IC-2000X',
      installDate: '2023-01-15T00:00:00Z',

      // Work instructions
      workInstructions: [
        'Perform lockout/tagout procedures on conveyor system',
        'Inspect belt for wear, cracks, and proper alignment',
        'Check and adjust belt tension to manufacturer specifications',
        'Lubricate drive motor bearings and gearbox',
        'Test emergency stop systems and safety guards',
        'Clean debris from belt path and rollers',
        'Document all findings and measurements',
      ],
    }
  }

  /**
   * Generate filename for the PDF
   */
  generateFilename(data) {
    const date = new Date().toISOString().split('T')[0]
    return `WorkOrder_${data.workOrderId}_${date}.pdf`
  }
}

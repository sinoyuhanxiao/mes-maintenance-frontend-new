import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { convertToLocalTime } from '@/utils/datetime'

/**
 * Comprehensive PDF Export Service for CMMS Work Orders
 * Generates professional, compliance-ready PDF documents
 */
export class WorkOrderPDFExporter {
  constructor() {
    this.doc = null
    this.currentY = 0
    this.pageHeight = 297 // A4 height in mm
    this.pageWidth = 210 // A4 width in mm
    this.margin = 20
    this.lineHeight = 6
    this.sectionSpacing = 12
  }

  /**
   * Main export function
   */
  async exportWorkOrder( workOrder, sampleData = null ) {
    try {
      // Initialize PDF document
      this.doc = new jsPDF( 'p', 'mm', 'a4' )
      this.currentY = this.margin

      // Use sample data if provided, otherwise use actual work order data
      const data = sampleData || this.generateSampleData( workOrder )

      // Generate PDF sections
      this.addHeader( data )
      this.addWorkOrderOverview( data )
      this.addAssetInformation( data )
      this.addPersonnelInformation( data )
      this.addWorkInstructions( data )
      this.addPartsAndMaterials( data )
      this.addTimeTracking( data )
      this.addSafetyRequirements( data )
      this.addActivityTimeline( data )
      this.addApprovalWorkflow( data )
      this.addFooter( data )

      // Generate filename and save
      const filename = this.generateFilename( data )
      this.doc.save( filename )

      return { success : true, filename }
    } catch ( error ) {
      console.error( 'PDF Export Error:', error )
      return { success : false, error : error.message }
    }
  }

  /**
   * Add company header with branding
   */
  addHeader( data ) {
    // Company logo area (placeholder)
    this.doc.setFillColor( 240, 240, 240 )
    this.doc.rect( this.margin, this.currentY, 40, 20, 'F' )

    // Company name and title
    this.doc.setFontSize( 20 )
    this.doc.setFont( 'helvetica', 'bold' )
    this.doc.text( 'FPS CMMS', this.margin + 45, this.currentY + 8 )

    this.doc.setFontSize( 14 )
    this.doc.setFont( 'helvetica', 'normal' )
    this.doc.text( 'Work Order Management', this.margin + 45, this.currentY + 15 )

    // Export info (right aligned)
    this.doc.setFontSize( 10 )
    const exportDate = new Date().toLocaleString()
    const exportText = `Exported: ${exportDate}`
    this.doc.text( exportText, this.pageWidth - this.margin, this.currentY + 8, { align : 'right' } )

    const pageText = 'Page 1'
    this.doc.text( pageText, this.pageWidth - this.margin, this.currentY + 15, { align : 'right' } )

    this.currentY += 30
    this.addSeparator()
  }

  /**
   * Add work order overview section
   */
  addWorkOrderOverview( data ) {
    this.addSectionTitle( 'Work Order Overview' )

    // Create overview table
    const overviewData = [
      ['Work Order ID', data.workOrderId],
      ['Title', data.title],
      ['Status', data.status],
      ['Priority', data.priority],
      ['Category', data.category],
      ['Due Date', this.formatDate( data.dueDate )],
      ['Created By', data.createdByName],
      ['Assigned To', data.assignedToName]
    ]

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Field', 'Value']],
      body : overviewData,
      theme : 'grid',
      styles : { fontSize : 10 },
      headStyles : { fillColor : [66, 139, 202] },
      margin : { left : this.margin, right : this.margin }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add asset information section
   */
  addAssetInformation( data ) {
    this.addSectionTitle( 'Asset Information' )

    const assetData = [
      ['Asset ID', data.assetId],
      ['Asset Name', data.assetName],
      ['Serial Number', data.assetSerialNumber],
      ['Location', data.locationPath],
      ['Manufacturer', data.manufacturer || 'N/A'],
      ['Model', data.model || 'N/A'],
      ['Install Date', this.formatDate( data.installDate )]
    ]

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Field', 'Value']],
      body : assetData,
      theme : 'grid',
      styles : { fontSize : 10 },
      headStyles : { fillColor : [92, 184, 92] },
      margin : { left : this.margin, right : this.margin }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add personnel information section
   */
  addPersonnelInformation( data ) {
    this.addSectionTitle( 'Personnel Information' )

    const personnelData = data.personnel.map( person => [
      person.name,
      person.role,
      person.certifications.join( ', ' ),
      person.contactInfo,
      person.assignedDate ? this.formatDate( person.assignedDate ) : 'N/A'
    ] )

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Name', 'Role', 'Certifications', 'Contact', 'Assigned Date']],
      body : personnelData,
      theme : 'grid',
      styles : { fontSize : 9 },
      headStyles : { fillColor : [240, 173, 78] },
      margin : { left : this.margin, right : this.margin }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add work instructions section
   */
  addWorkInstructions( data ) {
    this.addSectionTitle( 'Work Instructions' )

    // Problem description
    this.doc.setFontSize( 11 )
    this.doc.setFont( 'helvetica', 'bold' )
    this.doc.text( 'Problem Description:', this.margin, this.currentY )
    this.currentY += this.lineHeight

    this.doc.setFont( 'helvetica', 'normal' )
    this.doc.setFontSize( 10 )
    const problemText = this.doc.splitTextToSize( data.reportedProblem, this.pageWidth - 2 * this.margin )
    this.doc.text( problemText, this.margin, this.currentY )
    this.currentY += problemText.length * this.lineHeight + 5

    // Work instructions
    this.doc.setFontSize( 11 )
    this.doc.setFont( 'helvetica', 'bold' )
    this.doc.text( 'Work Steps:', this.margin, this.currentY )
    this.currentY += this.lineHeight

    this.doc.setFont( 'helvetica', 'normal' )
    this.doc.setFontSize( 10 )
    data.workInstructions.forEach( ( instruction, index ) => {
      const stepText = `${index + 1}. ${instruction}`
      const wrappedText = this.doc.splitTextToSize( stepText, this.pageWidth - 2 * this.margin - 10 )
      this.doc.text( wrappedText, this.margin + 5, this.currentY )
      this.currentY += wrappedText.length * this.lineHeight + 2
    } )

    this.currentY += this.sectionSpacing
  }

  /**
   * Add parts and materials section
   */
  addPartsAndMaterials( data ) {
    this.addSectionTitle( 'Parts and Materials' )

    const partsData = data.partsUsed.map( part => [
      part.partNumber,
      part.description,
      part.quantity.toString(),
      `$${part.unitCost.toFixed( 2 )}`,
      `$${part.totalCost.toFixed( 2 )}`,
      part.vendor,
      part.stockLocation
    ] )

    // Add total row
    const totalCost = data.partsUsed.reduce( ( sum, part ) => sum + part.totalCost, 0 )
    partsData.push( ['', '', '', '', `$${totalCost.toFixed( 2 )}`, 'TOTAL', ''] )

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Part Number', 'Description', 'Qty', 'Unit Cost', 'Total Cost', 'Vendor', 'Location']],
      body : partsData,
      theme : 'grid',
      styles : { fontSize : 9 },
      headStyles : { fillColor : [217, 83, 79] },
      margin : { left : this.margin, right : this.margin },
      didParseCell : function( data ) {
        // Highlight total row
        if ( data.row.index === partsData.length - 1 ) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [245, 245, 245]
        }
      }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add time tracking section
   */
  addTimeTracking( data ) {
    this.addSectionTitle( 'Time Tracking' )

    const timeData = data.laborLog.map( entry => [
      entry.technicianName,
      this.formatDateTime( entry.startTime ),
      this.formatDateTime( entry.stopTime ),
      `${entry.hoursWorked.toFixed( 2 )}h`,
      `$${entry.hourlyRate.toFixed( 2 )}`,
      `$${entry.totalCost.toFixed( 2 )}`,
      entry.activityNotes
    ] )

    // Add total row
    const totalHours = data.laborLog.reduce( ( sum, entry ) => sum + entry.hoursWorked, 0 )
    const totalLaborCost = data.laborLog.reduce( ( sum, entry ) => sum + entry.totalCost, 0 )
    timeData.push( ['', '', '', `${totalHours.toFixed( 2 )}h`, '', `$${totalLaborCost.toFixed( 2 )}`, 'TOTAL'] )

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Technician', 'Start Time', 'End Time', 'Hours', 'Rate', 'Cost', 'Notes']],
      body : timeData,
      theme : 'grid',
      styles : { fontSize : 8 },
      headStyles : { fillColor : [91, 192, 222] },
      margin : { left : this.margin, right : this.margin },
      didParseCell : function( data ) {
        // Highlight total row
        if ( data.row.index === timeData.length - 1 ) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [245, 245, 245]
        }
      }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add section title
   */
  addSectionTitle( title ) {
    this.checkPageBreak( 20 )

    this.doc.setFontSize( 14 )
    this.doc.setFont( 'helvetica', 'bold' )
    this.doc.setTextColor( 51, 51, 51 )
    this.doc.text( title, this.margin, this.currentY )

    // Add underline
    this.doc.setDrawColor( 51, 51, 51 )
    this.doc.line( this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2 )

    this.currentY += 10
    this.doc.setTextColor( 0, 0, 0 ) // Reset to black
  }

  /**
   * Add separator line
   */
  addSeparator() {
    this.doc.setDrawColor( 200, 200, 200 )
    this.doc.line( this.margin, this.currentY, this.pageWidth - this.margin, this.currentY )
    this.currentY += 5
  }

  /**
   * Check if page break is needed
   */
  checkPageBreak( requiredSpace ) {
    if ( this.currentY + requiredSpace > this.pageHeight - this.margin ) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  /**
   * Format date for display
   */
  formatDate( dateString ) {
    if ( !dateString ) return 'N/A'
    return convertToLocalTime( dateString, 'YYYY-MM-DD' )
  }

  /**
   * Format datetime for display
   */
  formatDateTime( dateString ) {
    if ( !dateString ) return 'N/A'
    return convertToLocalTime( dateString, 'YYYY-MM-DD HH:mm' )
  }

  /**
   * Add safety requirements section
   */
  addSafetyRequirements( data ) {
    this.addSectionTitle( 'Safety Requirements' )

    const safetyData = data.safetyRequirements.map( req => [
      req.requirement,
      req.compliance ? 'Yes' : 'No',
      req.notes || 'N/A',
      req.verifiedBy || 'N/A'
    ] )

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Requirement', 'Compliance', 'Notes', 'Verified By']],
      body : safetyData,
      theme : 'grid',
      styles : { fontSize : 9 },
      headStyles : { fillColor : [217, 83, 79] },
      margin : { left : this.margin, right : this.margin }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add activity timeline section
   */
  addActivityTimeline( data ) {
    this.addSectionTitle( 'Activity Timeline' )

    const timelineData = data.activityTimeline.map( activity => [
      this.formatDateTime( activity.timestamp ),
      activity.action,
      activity.performedBy,
      activity.details || 'N/A'
    ] )

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Timestamp', 'Action', 'Performed By', 'Details']],
      body : timelineData,
      theme : 'grid',
      styles : { fontSize : 9 },
      headStyles : { fillColor : [138, 109, 59] },
      margin : { left : this.margin, right : this.margin }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add approval workflow section
   */
  addApprovalWorkflow( data ) {
    this.addSectionTitle( 'Approval Workflow' )

    const approvalData = data.approvalWorkflow.map( approval => [
      approval.step,
      approval.approver,
      approval.status,
      this.formatDateTime( approval.timestamp ),
      approval.comments || 'N/A'
    ] )

    autoTable( this.doc, {
      startY : this.currentY,
      head : [['Step', 'Approver', 'Status', 'Timestamp', 'Comments']],
      body : approvalData,
      theme : 'grid',
      styles : { fontSize : 9 },
      headStyles : { fillColor : [119, 119, 119] },
      margin : { left : this.margin, right : this.margin }
    } )

    this.currentY = this.doc.lastAutoTable.finalY + this.sectionSpacing
  }

  /**
   * Add footer with compliance information
   */
  addFooter( data ) {
    // Move to bottom of page
    this.currentY = this.pageHeight - 30

    this.addSeparator()

    // Compliance standards
    this.doc.setFontSize( 8 )
    this.doc.setFont( 'helvetica', 'normal' )
    const complianceText = `Compliance Standards: ${data.complianceStandards.join( ', ' )}`
    this.doc.text( complianceText, this.margin, this.currentY )
    this.currentY += 5

    // Digital signature info
    if ( data.digitalSignature ) {
      const signatureText = `Digital Signature: ${data.digitalSignature.substring( 0, 32 )}...`
      this.doc.text( signatureText, this.margin, this.currentY )
      this.currentY += 5
    }

    // Export metadata
    const exportInfo = `Generated by: ${data.exportedBy.userName} | Export Time: ${this.formatDateTime(
      data.exportTimestamp
    )}`
    this.doc.text( exportInfo, this.margin, this.currentY )
  }

  /**
   * Generate comprehensive sample data for demonstration
   */
  generateSampleData( workOrder ) {
    return {
      // Basic work order info
      workOrderId : workOrder?.id || 'WO-2024-001',
      title : workOrder?.name || 'Preventive Maintenance - Conveyor Belt System',
      status : workOrder?.state?.name || 'In Progress',
      priority : workOrder?.priority?.name || 'High',
      category : workOrder?.work_type?.name || 'Preventive',
      dueDate : workOrder?.due_date || '2024-08-15T16:00:00Z',
      createdByName : workOrder?.created_by || 'Erik Yu',
      assignedToName : workOrder?.assigned_to || 'Mike Johnson',
      reportedProblem :
        workOrder?.description ||
        'Scheduled preventive maintenance for conveyor belt system including belt inspection, tension adjustment, and lubrication of drive components.',

      // Asset information
      assetId : 'CONV-001',
      assetName : 'Main Production Conveyor',
      assetSerialNumber : 'CB-2023-4567',
      locationPath : 'Plant A > Production Floor > Line 1 > Conveyor System',
      manufacturer : 'Industrial Conveyor Corp',
      model : 'IC-2000X',
      installDate : '2023-01-15T00:00:00Z',

      // Personnel
      personnel : [
        {
          name : 'Mike Johnson',
          role : 'Lead Technician',
          certifications : ['Mechanical Systems', 'Safety Level 2'],
          contactInfo : 'mike.johnson@company.com',
          assignedDate : '2024-08-10T08:00:00Z'
        },
        {
          name : 'Sarah Davis',
          role : 'Electrical Technician',
          certifications : ['Electrical Systems', 'LOTO Certified'],
          contactInfo : 'sarah.davis@company.com',
          assignedDate : '2024-08-10T08:00:00Z'
        }
      ],

      // Work instructions
      workInstructions : [
        'Perform lockout/tagout procedures on conveyor system',
        'Inspect belt for wear, cracks, and proper alignment',
        'Check and adjust belt tension to manufacturer specifications',
        'Lubricate drive motor bearings and gearbox',
        'Test emergency stop systems and safety guards',
        'Clean debris from belt path and rollers',
        'Document all findings and measurements'
      ],

      // Parts used
      partsUsed : [
        {
          partNumber : 'LUB-001',
          description : 'High-temp bearing grease',
          quantity : 2,
          unitCost : 25.5,
          totalCost : 51.0,
          vendor : 'Industrial Supply Co',
          stockLocation : 'Storeroom A-12'
        },
        {
          partNumber : 'BELT-TENS-001',
          description : 'Belt tension adjustment kit',
          quantity : 1,
          unitCost : 85.0,
          totalCost : 85.0,
          vendor : 'Conveyor Parts Inc',
          stockLocation : 'Storeroom B-05'
        }
      ],

      // Labor log
      laborLog : [
        {
          technicianName : 'Mike Johnson',
          startTime : '2024-08-10T08:00:00Z',
          stopTime : '2024-08-10T12:00:00Z',
          hoursWorked : 4.0,
          hourlyRate : 45.0,
          totalCost : 180.0,
          activityNotes : 'Belt inspection and tension adjustment'
        },
        {
          technicianName : 'Sarah Davis',
          startTime : '2024-08-10T10:00:00Z',
          stopTime : '2024-08-10T12:00:00Z',
          hoursWorked : 2.0,
          hourlyRate : 42.0,
          totalCost : 84.0,
          activityNotes : 'Electrical system testing and safety verification'
        }
      ],

      // Safety requirements
      safetyRequirements : [
        {
          requirement : 'LOTO procedures completed',
          compliance : true,
          notes : 'All energy sources isolated and tagged',
          verifiedBy : 'Safety Officer'
        },
        {
          requirement : 'PPE requirements met',
          compliance : true,
          notes : 'Hard hat, safety glasses, steel-toed boots worn',
          verifiedBy : 'Mike Johnson'
        },
        {
          requirement : 'Confined space permit',
          compliance : false,
          notes : 'Not required for this work',
          verifiedBy : 'N/A'
        }
      ],

      // Activity timeline
      activityTimeline : [
        {
          timestamp : '2024-08-08T14:30:00Z',
          action : 'Work Order Created',
          performedBy : 'Erik Yu',
          details : 'Scheduled preventive maintenance'
        },
        {
          timestamp : '2024-08-09T09:15:00Z',
          action : 'Assigned to Technician',
          performedBy : 'Maintenance Supervisor',
          details : 'Assigned to Mike Johnson'
        },
        {
          timestamp : '2024-08-10T08:00:00Z',
          action : 'Work Started',
          performedBy : 'Mike Johnson',
          details : 'Began on-site inspection'
        },
        {
          timestamp : '2024-08-10T12:00:00Z',
          action : 'Work Completed',
          performedBy : 'Mike Johnson',
          details : 'All maintenance tasks completed successfully'
        }
      ],

      // Approval workflow
      approvalWorkflow : [
        {
          step : 'Supervisor Review',
          approver : 'Tom Wilson',
          status : 'Approved',
          timestamp : '2024-08-10T13:00:00Z',
          comments : 'Work completed according to procedures'
        },
        {
          step : 'Quality Assurance',
          approver : 'Lisa Chen',
          status : 'Pending',
          timestamp : null,
          comments : null
        }
      ],

      // Compliance and metadata
      complianceStandards : ['ISO55000', '21CFR11', 'ISA-95'],
      digitalSignature : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      exportTimestamp : new Date().toISOString(),
      exportedBy : {
        userId : 'system',
        userName : 'CMMS Export Service'
      }
    }
  }

  /**
   * Generate filename for the PDF
   */
  generateFilename( data ) {
    const date = new Date().toISOString().split( 'T' )[0]
    return `WorkOrder_${data.workOrderId}_${date}.pdf`
  }
}

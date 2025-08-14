/**
 * Test file for PDF export functionality
 * Run this in browser console to test PDF generation
 */

import { WorkOrderPDFExporter } from './pdfExport.js'

// Test function to verify PDF export
export async function testPDFExport() {
  try {
    console.log( 'Starting PDF export test...' )

    // Create sample work order data
    const sampleWorkOrder = {
      id : 'WO-TEST-001',
      name : 'Test Work Order - Pump Maintenance',
      state : { name : 'Completed' },
      priority : { name : 'High' },
      work_type : { name : 'Corrective' },
      due_date : '2024-08-15T16:00:00Z',
      created_by : 'Test User',
      assigned_to : 'Test Technician',
      description : 'Test work order for PDF export functionality verification'
    }

    // Create exporter instance
    const exporter = new WorkOrderPDFExporter()

    // Export PDF with sample data
    const result = await exporter.exportWorkOrder( sampleWorkOrder )

    if ( result.success ) {
      console.log( '✅ PDF export test successful!' )
      console.log( '📄 Generated file:', result.filename )
      return true
    } else {
      console.error( '❌ PDF export test failed:', result.error )
      return false
    }
  } catch ( error ) {
    console.error( '❌ PDF export test error:', error )
    return false
  }
}

// Auto-run test if in browser environment
if ( typeof window !== 'undefined' ) {
  console.log( 'PDF Export Test Module Loaded' )
  console.log( 'Run testPDFExport() to test PDF generation' )
}

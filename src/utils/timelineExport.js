/**
 * Timeline Export Utility Module
 * Provides reusable functions for exporting timeline data in various formats
 *
 * Usage Example:
 * import { exportTimeline, generateTimestampedFilename } from '@/utils/timelineExport'
 *
 * const result = exportTimeline(timelineEvents, 'excel', 'my-timeline', {
 *   currentWorkOrderId: 123,
 *   includeMetadata: true
 * })
 *
 * Supported formats: 'excel', 'csv', 'json'
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { downloadByData } from '@/utils/files'

/**
 * Convert timeline events to formatted data array
 * @param {Array} timelineEvents - Array of timeline event objects
 * @param {Object} options - Export options
 * @returns {Array} Formatted data array
 */
export function formatTimelineData( timelineEvents, options = {} ) {
  const { includeHeaders = true, dateFormat = 'YYYY-MM-DD HH:mm:ss' } = options

  if ( !Array.isArray( timelineEvents ) || timelineEvents.length === 0 ) {
    return []
  }

  const headers = [
    'Work Order ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Category',
    'Start Date/Time',
    'Due Date',
    'Task Count',
    'Duration',
    'Assignees',
    'Is Overdue',
    'Is Current'
  ]

  const formattedData = []

  if ( includeHeaders ) {
    formattedData.push( headers )
  }

  timelineEvents.forEach( event => {
    const row = [
      event.id || '-',
      event.title || '-',
      event.description || '-',
      event.status || '-',
      event.priority?.name || event.priority || '-',
      event.category?.name || event.category || '-',
      event.timestamp || '-',
      event.dueDate || '-',
      event.taskCount !== undefined ? event.taskCount : '-',
      event.duration || '-',
      event.assignees ? event.assignees.map( a => a.name ).join( ', ' ) : '-',
      event.isOverdue ? 'Yes' : 'No',
      event.isCurrent ? 'Yes' : 'No'
    ]
    formattedData.push( row )
  } )

  return formattedData
}

/**
 * Export timeline data to CSV format
 * @param {Array} timelineEvents - Array of timeline event objects
 * @param {String} filename - Export filename (without extension)
 * @param {Object} options - Export options
 */
export function exportTimelineToCSV( timelineEvents, filename = 'timeline-export', options = {} ) {
  try {
    const formattedData = formatTimelineData( timelineEvents, options )

    if ( formattedData.length === 0 ) {
      throw new Error( 'No data to export' )
    }

    // Convert to CSV format
    const csvContent = formattedData
      .map( row => row.map( cell => `"${String( cell ).replace( /"/g, '""' )}"` ).join( ',' ) )
      .join( '\n' )

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent

    // Download the file
    downloadByData( csvWithBOM, `${filename}.csv`, 'text/csv;charset=utf-8' )

    return {
      success : true,
      message : 'Timeline exported to CSV successfully',
      recordCount : formattedData.length - 1 // Exclude header row
    }
  } catch ( error ) {
    console.error( 'CSV Export Error:', error )
    return {
      success : false,
      message : `Failed to export CSV: ${error.message}`,
      error
    }
  }
}

/**
 * Export timeline data to Excel format
 * @param {Array} timelineEvents - Array of timeline event objects
 * @param {String} filename - Export filename (without extension)
 * @param {Object} options - Export options
 */
export function exportTimelineToExcel( timelineEvents, filename = 'timeline-export', options = {} ) {
  try {
    const { sheetName = 'Timeline Data', includeMetadata = true } = options

    const formattedData = formatTimelineData( timelineEvents, options )

    if ( formattedData.length === 0 ) {
      throw new Error( 'No data to export' )
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet( formattedData )

    // Set column widths for better formatting
    const columnWidths = [
      { wch : 12 }, // Work Order ID
      { wch : 25 }, // Title
      { wch : 30 }, // Description
      { wch : 12 }, // Status
      { wch : 10 }, // Priority
      { wch : 15 }, // Category
      { wch : 20 }, // Start Date/Time
      { wch : 20 }, // Due Date
      { wch : 12 }, // Task Count
      { wch : 10 }, // Duration
      { wch : 20 }, // Assignees
      { wch : 12 }, // Is Overdue
      { wch : 12 } // Is Current
    ]
    worksheet['!cols'] = columnWidths

    // Apply header styling
    const headerRange = XLSX.utils.decode_range( worksheet['!ref'] )
    for ( let col = headerRange.s.c; col <= headerRange.e.c; col++ ) {
      const cellAddress = XLSX.utils.encode_cell( { r : 0, c : col } )
      if ( worksheet[cellAddress] ) {
        worksheet[cellAddress].s = {
          font : { bold : true, color : { rgb : 'FFFFFF' }},
          fill : { bgColor : { indexed : 64 }, fgColor : { rgb : '366092' }},
          alignment : { horizontal : 'center', vertical : 'center' }
        }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet( workbook, worksheet, sheetName )

    // Add metadata sheet if requested
    if ( includeMetadata ) {
      const metadataData = [
        ['Export Information'],
        ['Generated At', new Date().toLocaleString()],
        ['Total Records', formattedData.length - 1],
        ['File Format', 'Excel (.xlsx)'],
        [''],
        ['Column Descriptions'],
        ['Work Order ID', 'Unique identifier for the work order'],
        ['Title', 'Work order title/name'],
        ['Description', 'Work order description'],
        ['Status', 'Current status of the work order'],
        ['Priority', 'Priority level assigned to the work order'],
        ['Category', 'Work order category/type'],
        ['Start Date/Time', 'When the work order was started'],
        ['Due Date', 'When the work order is due'],
        ['Task Count', 'Number of tasks in the work order'],
        ['Duration', 'Time taken to complete (if completed)'],
        ['Assignees', 'Personnel assigned to the work order'],
        ['Is Overdue', 'Whether the work order is overdue'],
        ['Is Current', 'Whether this is the current work order being viewed']
      ]

      const metadataSheet = XLSX.utils.aoa_to_sheet( metadataData )
      XLSX.utils.book_append_sheet( workbook, metadataSheet, 'Export Info' )
    }

    // Generate Excel file and save
    const excelBuffer = XLSX.write( workbook, { bookType : 'xlsx', type : 'array' } )
    const blob = new Blob( [excelBuffer], { type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
    saveAs( blob, `${filename}.xlsx` )

    return {
      success : true,
      message : 'Timeline exported to Excel successfully',
      recordCount : formattedData.length - 1 // Exclude header row
    }
  } catch ( error ) {
    console.error( 'Excel Export Error:', error )
    return {
      success : false,
      message : `Failed to export Excel: ${error.message}`,
      error
    }
  }
}

/**
 * Export timeline data to JSON format
 * @param {Array} timelineEvents - Array of timeline event objects
 * @param {String} filename - Export filename (without extension)
 * @param {Object} options - Export options
 */
export function exportTimelineToJSON( timelineEvents, filename = 'timeline-export', options = {} ) {
  try {
    const { includeMetadata = true, prettyPrint = true } = options

    if ( !Array.isArray( timelineEvents ) || timelineEvents.length === 0 ) {
      throw new Error( 'No data to export' )
    }

    const exportData = {
      exportInfo : includeMetadata
        ? {
          generatedAt : new Date().toISOString(),
          totalRecords : timelineEvents.length,
          fileFormat : 'JSON'
        }
        : undefined,
      timelineEvents
    }

    // Remove undefined exportInfo if not including metadata
    if ( !includeMetadata ) {
      delete exportData.exportInfo
    }

    const jsonContent = prettyPrint ? JSON.stringify( exportData, null, 2 ) : JSON.stringify( exportData )

    downloadByData( jsonContent, `${filename}.json`, 'application/json;charset=utf-8' )

    return {
      success : true,
      message : 'Timeline exported to JSON successfully',
      recordCount : timelineEvents.length
    }
  } catch ( error ) {
    console.error( 'JSON Export Error:', error )
    return {
      success : false,
      message : `Failed to export JSON: ${error.message}`,
      error
    }
  }
}

/**
 * Multi-format export function
 * @param {Array} timelineEvents - Array of timeline event objects
 * @param {String} format - Export format ('csv', 'excel', 'json')
 * @param {String} filename - Export filename (without extension)
 * @param {Object} options - Export options
 */
export function exportTimeline( timelineEvents, format = 'excel', filename = 'timeline-export', options = {} ) {
  // Mark current work order if currentWorkOrderId is provided
  if ( options.currentWorkOrderId ) {
    timelineEvents = timelineEvents.map( event => ( {
      ...event,
      isCurrent : String( event.id ) === String( options.currentWorkOrderId )
    } ) )
  }

  switch ( format.toLowerCase() ) {
    case 'csv':
      return exportTimelineToCSV( timelineEvents, filename, options )
    case 'excel':
    case 'xlsx':
      return exportTimelineToExcel( timelineEvents, filename, options )
    case 'json':
      return exportTimelineToJSON( timelineEvents, filename, options )
    default:
      return {
        success : false,
        message : `Unsupported export format: ${format}. Supported formats: csv, excel, json`
      }
  }
}

/**
 * Generate default filename with timestamp
 * @param {String} prefix - Filename prefix
 * @param {String} format - File format
 * @returns {String} Generated filename
 */
export function generateTimestampedFilename( prefix = 'timeline-export', format = 'excel' ) {
  const timestamp = new Date().toISOString().replace( /[:.]/g, '-' ).slice( 0, 19 ) // Remove milliseconds and timezone

  return `${prefix}-${timestamp}`
}

// Default export for convenience
export default {
  exportTimeline,
  exportTimelineToCSV,
  exportTimelineToExcel,
  exportTimelineToJSON,
  formatTimelineData,
  generateTimestampedFilename
}

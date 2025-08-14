import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export function testPDFSetup() {
  try {
    console.log( 'Testing jsPDF setup...' )

    // Create a simple PDF
    const doc = new jsPDF()

    // Check if autoTable is available
    console.log( 'autoTable available:', typeof doc.autoTable )
    console.log( 'jsPDF version:', jsPDF.version )

    if ( typeof doc.autoTable === 'function' ) {
      console.log( '✅ autoTable is properly loaded' )

      // Test basic autoTable functionality
      doc.autoTable( {
        head : [['Name', 'Value']],
        body : [['Test', 'Success']],
        startY : 20
      } )

      // Save test PDF
      doc.save( 'test.pdf' )
      console.log( '✅ Test PDF generated successfully' )
      return true
    } else {
      console.error( '❌ autoTable is not available' )
      return false
    }
  } catch ( error ) {
    console.error( '❌ PDF setup test failed:', error )
    return false
  }
}

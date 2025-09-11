<template>
  <div class="work-order-pdf" ref="pdfContainer">
    <!-- Page 1: Header and Overview -->
    <div class="pdf-page">
      <!-- Header -->
      <header class="pdf-header">
        <div class="header-top">
          <div class="logo-section">
            <div class="logo-placeholder">
              <span class="logo-text">FPS</span>
            </div>
          </div>
          <div class="company-info">
            <div class="company-line">FPS CMMS Solutions</div>
            <div class="company-line">1234 Maintenance Way, Suite 100</div>
            <div class="company-line">Victoria, BC V8W 2C5, Canada</div>
            <div class="company-line">E: support@fpscmms.com | T: +1 250 555 0198</div>
          </div>
        </div>
        <div class="title-block">
          <div class="title-left">
            <h1 class="work-order-title">WORK ORDER</h1>
            <div class="work-order-id">#{{ workOrder.id }}</div>
          </div>
          <div class="title-right">
            <div class="date-badge">{{ formatDate(workOrder.created_at) }}</div>
          </div>
        </div>
      </header>

      <!-- Work Order Overview -->
      <section class="pdf-section overview-section">
        <div class="section-grid">
          <div class="overview-left">
            <div class="field-group">
              <label class="field-label">CUSTOMER</label>
              <div class="field-value">{{ workOrder.customer || 'Internal Maintenance' }}</div>
              <div class="field-subvalue">{{ workOrder.customerAddress || 'Internal Department' }}</div>
              <div class="field-contact">{{ workOrder.customerContact || 'maintenance@company.com' }}</div>
            </div>
          </div>
          <div class="overview-right">
            <div class="field-group">
              <label class="field-label">SERVICE REQUEST</label>
              <div class="field-value">{{ workOrder.name }}</div>
              <div class="field-description">{{ workOrder.description }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Detailed Order Instructions -->
      <section class="pdf-section instructions-section">
        <h2 class="section-title">DETAILED ORDER INSTRUCTIONS</h2>
        <div class="instruction-steps">
          <div v-for="(instruction, index) in workInstructions" :key="index" class="instruction-step">
            <div class="step-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ instruction.title }}</h3>
              <div class="step-details">
                <div class="step-info">
                  <div class="info-item">
                    <i class="icon-user"></i>
                    <span>{{ instruction.assignee || 'Technician' }}</span>
                  </div>
                  <div class="info-item">
                    <i class="icon-clock"></i>
                    <span>{{ instruction.duration || '30 min' }}</span>
                  </div>
                </div>
                <div class="step-requirements">
                  <div class="requirement-item" v-for="req in instruction.requirements" :key="req">
                    <i class="icon-check"></i>
                    <span>{{ req }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Technician Information -->
      <section class="pdf-section technician-section">
        <div class="section-grid">
          <div class="tech-left">
            <h3 class="subsection-title">TECHNICIAN INFORMATION</h3>
            <div class="tech-info">
              <div class="tech-name">{{ workOrder.assigned_to || 'Mark Smith (Senior Technician)' }}</div>
              <div class="tech-contact">(555) 234 567</div>
            </div>
          </div>
          <div class="tech-right">
            <h3 class="subsection-title">SCHEDULED SERVICE DATE</h3>
            <div class="service-date">{{ formatDate(workOrder.due_date) }}</div>
          </div>
        </div>
      </section>

      <!-- Approval Section -->
      <section class="pdf-section approval-section">
        <div class="section-grid">
          <div class="approval-left">
            <h3 class="subsection-title">APPROVAL</h3>
            <div class="approval-fields">
              <div class="approval-field">
                <label>CUSTOMER</label>
                <div class="signature-line"></div>
              </div>
              <div class="approval-field">
                <label>TECHNICIAN</label>
                <div class="signature-line"></div>
              </div>
              <div class="approval-field">
                <label>DATE</label>
                <div class="date-line">{{ formatDate(new Date()) }}</div>
              </div>
            </div>
          </div>
          <div class="approval-right">
            <h3 class="subsection-title">PRICE DETAILS</h3>
            <div class="price-details">
              <div class="price-row">
                <span>LABOR</span>
                <span>${{ calculateLaborCost() }}</span>
              </div>
              <div class="price-row">
                <span>PARTS</span>
                <span>${{ calculatePartsCost() }}</span>
              </div>
              <div class="price-row">
                <span>TAX (10%)</span>
                <span>${{ calculateTax() }}</span>
              </div>
              <div class="price-row total-row">
                <span>TOTAL</span>
                <span>${{ calculateTotal() }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="pdf-footer">
        <div class="footer-note">
          *Please review and approve the work order to authorize the maintenance and repair tasks.
        </div>
        <div class="footer-branding">
          <div class="social-icons">
            <span class="social-icon">f</span>
            <span class="social-icon">P</span>
            <span class="social-icon">t</span>
          </div>
          <div class="footer-budget">
            <span class="budget-label">BUDGET</span>
            <span class="budget-amount">${{ calculateTotal() }}</span>
          </div>
        </div>
        <div class="footer-copyright">© {{ new Date().getFullYear() }} FPS CMMS Solutions – All rights reserved.</div>
      </footer>
    </div>

    <!-- Page 2: Detailed Information -->
    <div class="pdf-page page-break" style="page-break-before: always">
      <!-- Asset Information -->
      <section class="pdf-section asset-section">
        <h2 class="section-title">ASSET INFORMATION</h2>
        <div class="asset-grid">
          <div class="asset-field">
            <label>Asset ID</label>
            <div class="field-value">{{ assetInfo.id }}</div>
          </div>
          <div class="asset-field">
            <label>Asset Name</label>
            <div class="field-value">{{ assetInfo.name }}</div>
          </div>
          <div class="asset-field">
            <label>Serial Number</label>
            <div class="field-value">{{ assetInfo.serialNumber }}</div>
          </div>
          <div class="asset-field">
            <label>Location</label>
            <div class="field-value">{{ assetInfo.location }}</div>
          </div>
          <div class="asset-field">
            <label>Manufacturer</label>
            <div class="field-value">{{ assetInfo.manufacturer }}</div>
          </div>
          <div class="asset-field">
            <label>Model</label>
            <div class="field-value">{{ assetInfo.model }}</div>
          </div>
        </div>
      </section>

      <!-- Parts and Materials -->
      <section class="pdf-section parts-section">
        <h2 class="section-title">PARTS AND MATERIALS</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Cost</th>
              <th>Total Cost</th>
              <th>Vendor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in partsUsed" :key="part.partNumber">
              <td>{{ part.partNumber }}</td>
              <td>{{ part.description }}</td>
              <td>{{ part.quantity }}</td>
              <td>${{ part.unitCost.toFixed(2) }}</td>
              <td>${{ part.totalCost.toFixed(2) }}</td>
              <td>{{ part.vendor }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4">TOTAL PARTS COST</td>
              <td>${{ calculatePartsCost() }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- Time Tracking -->
      <section class="pdf-section time-section">
        <h2 class="section-title">TIME TRACKING</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Technician</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in laborLog" :key="entry.id">
              <td>{{ entry.technicianName }}</td>
              <td>{{ formatDateTime(entry.startTime) }}</td>
              <td>{{ formatDateTime(entry.stopTime) }}</td>
              <td>{{ entry.hoursWorked.toFixed(2) }}h</td>
              <td>${{ entry.hourlyRate.toFixed(2) }}</td>
              <td>${{ entry.totalCost.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="5">TOTAL LABOR COST</td>
              <td>${{ calculateLaborCost() }}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- Safety Requirements -->
      <section class="pdf-section safety-section">
        <h2 class="section-title">SAFETY REQUIREMENTS</h2>
        <div class="safety-checklist">
          <div v-for="req in safetyRequirements" :key="req.requirement" class="safety-item">
            <div class="safety-checkbox" :class="{ checked: req.compliance }">
              <span v-if="req.compliance">✓</span>
            </div>
            <div class="safety-text">
              <div class="safety-requirement">{{ req.requirement }}</div>
              <div class="safety-notes" v-if="req.notes">{{ req.notes }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Activity Timeline -->
      <section class="pdf-section timeline-section">
        <h2 class="section-title">ACTIVITY TIMELINE</h2>
        <div class="timeline">
          <div v-for="activity in activityTimeline" :key="activity.timestamp" class="timeline-item">
            <div class="timeline-date">{{ formatDateTime(activity.timestamp) }}</div>
            <div class="timeline-content">
              <div class="timeline-action">{{ activity.action }}</div>
              <div class="timeline-performer">{{ activity.performedBy }}</div>
              <div class="timeline-details" v-if="activity.details">{{ activity.details }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { convertToLocalTime } from '@/utils/datetime'

// Props
// eslint-disable-next-line no-unused-vars
const props = defineProps( {
  workOrder : {
    type : Object,
    required : true
  }
} )

// Refs
const pdfContainer = ref( null )

// Computed properties for sample data
const workInstructions = computed( () => [
  {
    title : 'VISUAL INSPECTION AND CHECK FOR VISIBLE SIGNS OF WEAR OR DAMAGE',
    assignee : 'Inspection (0.5 hr)',
    duration : '30 min',
    requirements : ['Visual inspection', 'Documentation']
  },
  {
    title : 'COMPRESSOR REPLACEMENT',
    assignee : 'Removal and Installation (3hrs)',
    duration : '3 hrs',
    requirements : ['Mounting Hardware - 1 set', 'Electrical Connectors - 2 pcs']
  },
  {
    title : 'REFRIGERANT REFILL AND SYSTEM TESTING',
    assignee : 'Refilling and leak test (1 hr)',
    duration : '1 hr',
    requirements : ['Leak Detection Dye - 1pc', 'Pressure Gauge - 1pc']
  }
] )

const assetInfo = computed( () => ( {
  id : 'CONV-001',
  name : 'Main Production Conveyor',
  serialNumber : 'CB-2023-4567',
  location : 'Plant A > Production Floor > Line 1',
  manufacturer : 'Industrial Conveyor Corp',
  model : 'IC-2000X'
} ) )

const partsUsed = computed( () => [
  {
    partNumber : 'LUB-001',
    description : 'High-temp bearing grease',
    quantity : 2,
    unitCost : 25.5,
    totalCost : 51.0,
    vendor : 'Industrial Supply Co'
  },
  {
    partNumber : 'BELT-TENS-001',
    description : 'Belt tension adjustment kit',
    quantity : 1,
    unitCost : 85.0,
    totalCost : 85.0,
    vendor : 'Conveyor Parts Inc'
  },
  {
    partNumber : 'COMP-REP-001',
    description : 'Compressor replacement unit',
    quantity : 1,
    unitCost : 450.0,
    totalCost : 450.0,
    vendor : 'HVAC Solutions Ltd'
  }
] )

const laborLog = computed( () => [
  {
    id : 1,
    technicianName : 'Mike Johnson',
    startTime : '2024-08-10T08:00:00Z',
    stopTime : '2024-08-10T12:00:00Z',
    hoursWorked : 4.0,
    hourlyRate : 45.0,
    totalCost : 180.0
  },
  {
    id : 2,
    technicianName : 'Sarah Davis',
    startTime : '2024-08-10T10:00:00Z',
    stopTime : '2024-08-10T12:00:00Z',
    hoursWorked : 2.0,
    hourlyRate : 42.0,
    totalCost : 84.0
  }
] )

const safetyRequirements = computed( () => [
  {
    requirement : 'LOTO procedures completed',
    compliance : true,
    notes : 'All energy sources isolated and tagged'
  },
  {
    requirement : 'PPE requirements met',
    compliance : true,
    notes : 'Hard hat, safety glasses, steel-toed boots worn'
  },
  {
    requirement : 'Confined space permit',
    compliance : false,
    notes : 'Not required for this work'
  },
  {
    requirement : 'Hot work permit',
    compliance : false,
    notes : 'No welding or cutting required'
  }
] )

const activityTimeline = computed( () => [
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
] )

// Methods
const formatDate = dateString => {
  if ( !dateString ) return 'N/A'
  return convertToLocalTime( dateString, 'DD MMM, YYYY' )
}

const formatDateTime = dateString => {
  if ( !dateString ) return 'N/A'
  return convertToLocalTime( dateString, 'DD/MM/YYYY HH:mm' )
}

const calculatePartsCost = () => {
  return partsUsed.value.reduce( ( sum, part ) => sum + part.totalCost, 0 ).toFixed( 2 )
}

const calculateLaborCost = () => {
  return laborLog.value.reduce( ( sum, entry ) => sum + entry.totalCost, 0 ).toFixed( 2 )
}

const calculateTax = () => {
  const subtotal = parseFloat( calculatePartsCost() ) + parseFloat( calculateLaborCost() )
  return ( subtotal * 0.1 ).toFixed( 2 )
}

const calculateTotal = () => {
  const subtotal = parseFloat( calculatePartsCost() ) + parseFloat( calculateLaborCost() )
  const tax = parseFloat( calculateTax() )
  return ( subtotal + tax ).toFixed( 2 )
}

// Expose methods for external use
defineExpose( {
  pdfContainer,
  print : () => window.print()
} )
</script>

<style scoped>
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
  page-break-inside: avoid;
}

.page-break {
  page-break-before: always;
  break-before: page;
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
  text-transform: uppercase;
}

.work-order-id {
  font-size: 14px;
  color: #0085a4;
  margin-top: 4px;
  font-weight: 600;
}

.date-badge {
  background: #0085a4;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

/* Section Styles */
.pdf-section {
  margin-bottom: 15mm;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #0085a4;
  margin: 0 0 8mm 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid #0085a4;
  padding-bottom: 2mm;
}

.subsection-title {
  font-size: 12px;
  font-weight: bold;
  color: #0085a4;
  margin: 0 0 5mm 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  font-size: 10px;
  font-weight: bold;
  color: #0085a4;
  text-transform: uppercase;
  display: block;
  margin-bottom: 3mm;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2mm;
  line-height: 1.3;
}

.field-subvalue {
  font-size: 10px;
  color: #666;
  margin-bottom: 1mm;
  line-height: 1.3;
}

.field-contact {
  font-size: 10px;
  color: #666;
  line-height: 1.3;
}

.field-description {
  font-size: 10px;
  color: #666;
  margin-top: 2mm;
  line-height: 1.4;
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
  width: 35px;
  height: 35px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 133, 164, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 11px;
  font-weight: bold;
  color: #333;
  margin: 0 0 3mm 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.3;
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

.icon-user::before {
  content: '👤';
}
.icon-clock::before {
  content: '🕐';
}
.icon-check::before {
  content: '✓';
  color: #0085a4;
}

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
  padding: 4mm;
  text-align: left;
  font-weight: bold;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #006b87;
}

.data-table td {
  padding: 3mm;
  border-bottom: 1px solid #eee;
  font-size: 9px;
  line-height: 1.3;
}

.data-table tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.data-table tbody tr:hover {
  background: #e3f2fd;
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
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  font-weight: bold;
}

.safety-checkbox.checked {
  background: #0085a4;
  border-color: #0085a4;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 133, 164, 0.3);
}

.safety-text {
  flex: 1;
}

.safety-requirement {
  font-size: 11px;
  font-weight: bold;
  color: #333;
  margin-bottom: 1mm;
  line-height: 1.3;
}

.safety-notes {
  font-size: 10px;
  color: #666;
  line-height: 1.3;
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
    min-height: 257mm; /* A4 height minus padding */
  }

  .pdf-page:last-child {
    page-break-after: avoid;
  }

  .page-break {
    page-break-before: always;
  }

  /* Ensure sections don't break awkwardly */
  .pdf-section {
    break-inside: avoid-page;
  }

  .instruction-step {
    break-inside: avoid;
  }

  .data-table {
    break-inside: avoid;
  }

  .timeline-item {
    break-inside: avoid;
  }

  @page {
    size: A4;
    margin: 0;
  }
}

/* Screen Preview Styles */
@media screen {
  .work-order-pdf {
    background: #f0f0f0;
    padding: 20px;
  }

  .pdf-page {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
}

/* Screen Preview Styles */
@media screen {
  .work-order-pdf {
    background: #f0f0f0;
    padding: 20px;
  }

  .pdf-page {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
}
</style>

<template>
  <div class="work-order-detail" v-if="workOrder">
    <!-- Detail Header -->
    <div class="detail-header">
      <div class="header-main">
        <h2 class="detail-title">{{ workOrder.name }}</h2>
        <div class="header-meta">
          <span class="work-order-id">#{{ workOrder.id }}</span>
          <span class="created-date">
            {{ $t('workOrder.form.createdOn') }}: {{ formatDate(workOrder.created_at) }}
          </span>
        </div>
      </div>

      <div class="header-actions">
        <el-button type="primary" size="small" @click="$emit('edit', workOrder)">
          <el-icon><Edit /></el-icon>
          {{ $t('workOrder.actions.edit') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('share', workOrder)">
          <el-icon><Share /></el-icon>
          {{ $t('workOrder.actions.share') }}
        </el-button>
      </div>
    </div>

    <!-- Status and Priority Section -->
    <div class="detail-section">
      <div class="section-row">
        <div class="field-group">
          <label class="field-label">{{ $t('workOrder.table.state') }}</label>
          <el-select v-model="localStatus" @change="handleStatusChange" size="small" style="width: 150px">
            <el-option label="Ready" value="Ready" />
            <el-option label="On Hold" value="On Hold" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Completed" value="Completed" />
          </el-select>
        </div>

        <div class="field-group">
          <label class="field-label">{{ $t('workOrder.table.priority') }}</label>
          <PriorityTag :priority="workOrder.priority" />
        </div>

        <div class="field-group">
          <label class="field-label">{{ $t('workOrder.table.assignedTo') }}</label>
          <span class="field-value">{{ workOrder.created_by || 'Unassigned' }}</span>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <div class="detail-section" v-if="workOrder.description">
      <h3 class="section-title">{{ $t('workOrder.table.description') }}</h3>
      <div class="description-content">
        <p>{{ workOrder.description }}</p>
      </div>
    </div>

    <!-- Work Order Details -->
    <div class="detail-section">
      <h3 class="section-title">{{ $t('workOrder.details.title') }}</h3>
      <div class="details-grid">
        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.workType') }}</label>
          <WorkTypeTag :work-type="workOrder.work_type" />
        </div>

        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.category') }}</label>
          <CategoryTag :category="workOrder.category" />
        </div>

        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.estimatedTime') }}</label>
          <span class="detail-value">
            {{ workOrder.estimated_minutes ? `${workOrder.estimated_minutes} min` : '-' }}
          </span>
        </div>

        <div class="detail-item">
          <label class="detail-label">{{ $t('workOrder.table.dueDate') }}</label>
          <span class="detail-value" :class="{ overdue: isOverdue }">
            {{ workOrder.due_date ? formatDate(workOrder.due_date) : '-' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Attachments Section -->
    <div class="detail-section" v-if="hasAttachments">
      <h3 class="section-title">{{ $t('workOrder.attachments.title') }}</h3>
      <div class="attachments-grid">
        <div v-for="(image, index) in workOrder.image_list" :key="index" class="attachment-item">
          <el-image :src="image" fit="cover" :preview-src-list="workOrder.image_list" class="attachment-image">
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </div>

    <!-- Tracking Section -->
    <div class="detail-section">
      <h3 class="section-title">{{ $t('workOrder.tracking.title') }}</h3>
      <div class="tracking-actions">
        <el-button type="default" size="small" @click="$emit('add-parts')">
          <el-icon><Plus /></el-icon>
          {{ $t('workOrder.tracking.viewPartsUsage') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('add-time')">
          <el-icon><Timer /></el-icon>
          {{ $t('workOrder.tracking.viewTimeLogs') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('add-costs')">
          <el-icon><Money /></el-icon>
          {{ $t('workOrder.tracking.viewSafetyMeasures') }}
        </el-button>
        <el-button type="default" size="small" @click="$emit('view-procedure')">
          <el-icon><Document /></el-icon>
          {{ $t('workOrder.tracking.viewProcedure') }}
        </el-button>
      </div>
    </div>

    <!-- Recurrence Info Card -->
    <div v-if="isRecurring" class="detail-section recurrence-info-card">
      <div class="info-card">
        <div class="info-card-header">
          <el-icon class="info-card-icon"><Calendar /></el-icon>
          <el-text class="section-title">Schedule conditions</el-text>
        </div>
        <div class="info-card-content">
          <div class="schedule-line">This Work Order will repeat based on time.</div>
          <div class="schedule-line">
            Repeats every week on Tuesday, Friday and Saturday after completion of this Work Order.
          </div>
          <div class="schedule-line">
            Automatically continued from
            <span style="color: #409eff; text-decoration: underline; cursor: pointer" @click="() => {}">
              Daily Wash - Washin Washer
            </span>
            (due 04/30/2024)
          </div>
        </div>
      </div>
    </div>

    <!-- Related Assets Section -->
    <div class="detail-section related-assets-section">
      <h3 class="section-title">Related Assets</h3>
      <div class="assets-container">
        <div class="asset-card" @click="openAssetTreeModal">
          <div class="asset-image">
            <div class="asset-icon">
              <el-icon><Setting /></el-icon>
            </div>
          </div>
          <div class="asset-name">Steam Peeler</div>
        </div>
      </div>
    </div>

    <!-- Time & Cost Tracking Card -->
    <div class="detail-section time-cost-tracking-card">
      <h3 class="section-title">Tracking</h3>

      <!-- Tracking Tabs -->
      <el-tabs v-model="activeTrackingTab" class="tracking-tabs">
        <!-- Parts Usage Tab -->
        <el-tab-pane label="Parts Usage" name="partsUsage">
          <div class="tab-content">
            <div class="tab-header">
              <h4 class="tab-title">Parts Cost</h4>
              <el-button type="text" size="small" @click="openPartsCostModal" class="add-edit-link">
                Add / Edit
              </el-button>
            </div>

            <div class="parts-cost-table">
              <el-table :data="partsCostData" size="small" class="cost-table">
                <el-table-column prop="part" label="Part" min-width="120" />
                <el-table-column prop="location" label="Location" width="100" />
                <el-table-column prop="quantity" label="Quantity" width="80" align="center" />
                <el-table-column prop="unitCost" label="Unit Cost" width="100" align="right" />
              </el-table>

              <div class="cost-footer">
                <div class="cost-total">
                  <span class="cost-label">Parts Cost:</span>
                  <span class="cost-value">$107.00</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Time Logs Tab -->
        <el-tab-pane label="Time Logs" name="timeLogs">
          <div class="tab-content">
            <div class="tab-header">
              <h4 class="tab-title">Labor Time Tracking</h4>
              <el-button type="text" size="small" @click="openTimeLogsModal" class="add-edit-link">
                Add / Edit
              </el-button>
            </div>

            <div class="time-logs-table">
              <el-table :data="timeLogsData" size="small" class="logs-table">
                <el-table-column prop="technician" label="Technician" min-width="120" />
                <el-table-column prop="date" label="Date" width="100" />
                <el-table-column prop="startTime" label="Start Time" width="100" align="center" />
                <el-table-column prop="endTime" label="End Time" width="100" align="center" />
                <el-table-column prop="duration" label="Duration" width="80" align="center" />
                <el-table-column prop="hourlyRate" label="Rate/Hr" width="80" align="right" />
                <el-table-column prop="totalCost" label="Total" width="80" align="right" />
              </el-table>

              <div class="cost-footer">
                <div class="cost-total">
                  <span class="cost-label">Labor Cost:</span>
                  <span class="cost-value">$240.00</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Safety Measures Tab -->
        <el-tab-pane label="Safety Measures" name="safetyMeasures">
          <div class="tab-content">
            <div class="tab-header">
              <h4 class="tab-title">Safety Checklist & Measures</h4>
              <el-button type="text" size="small" @click="openSafetyModal" class="add-edit-link">
                Add / Edit
              </el-button>
            </div>

            <div class="safety-measures-content">
              <div class="safety-section">
                <h5 class="safety-section-title">Pre-Work Safety Checks</h5>
                <div class="safety-checklist">
                  <div v-for="item in safetyChecklistData" :key="item.id" class="safety-item">
                    <el-checkbox v-model="item.completed" :disabled="true">
                      {{ item.description }}
                    </el-checkbox>
                    <span class="safety-status" :class="item.completed ? 'completed' : 'pending'">
                      {{ item.completed ? 'Completed' : 'Pending' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="safety-section">
                <h5 class="safety-section-title">Required PPE</h5>
                <div class="ppe-list">
                  <el-tag v-for="ppe in requiredPPE" :key="ppe" type="warning" size="small" class="ppe-tag">
                    {{ ppe }}
                  </el-tag>
                </div>
              </div>

              <div class="safety-section">
                <h5 class="safety-section-title">Safety Notes</h5>
                <div class="safety-notes">
                  <p>• Ensure machine is completely powered down before starting work</p>
                  <p>• Use lockout/tagout procedures for electrical isolation</p>
                  <p>• Verify zero energy state before proceeding</p>
                  <p>• Keep emergency stop accessible at all times</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Procedures Tab -->
        <el-tab-pane label="Procedures" name="procedures">
          <div class="tab-content">
            <div class="tab-header">
              <h4 class="tab-title">Maintenance Procedures</h4>
              <el-button type="text" size="small" @click="openProceduresModal" class="add-edit-link">
                Add / Edit
              </el-button>
            </div>

            <div class="procedures-content">
              <div class="procedure-form">
                <div v-for="(step, index) in procedureSteps" :key="step.id" class="procedure-step">
                  <div class="step-header">
                    <span class="step-number">{{ index + 1 }}</span>
                    <h5 class="step-title">{{ step.title }}</h5>
                    <el-tag
                      :type="
                        step.status === 'completed' ? 'success' : step.status === 'in-progress' ? 'warning' : 'info'
                      "
                      size="small"
                    >
                      {{ step.status.replace('-', ' ').toUpperCase() }}
                    </el-tag>
                  </div>

                  <div class="step-content">
                    <p class="step-description">{{ step.description }}</p>

                    <!-- Different form types based on step type -->
                    <div v-if="step.type === 'inspection'" class="inspection-form">
                      <div class="form-row">
                        <label>Visual Inspection Result:</label>
                        <el-select v-model="step.inspectionResult" size="small" style="width: 150px" disabled>
                          <el-option label="Pass" value="pass" />
                          <el-option label="Fail" value="fail" />
                          <el-option label="Needs Attention" value="attention" />
                        </el-select>
                      </div>
                      <div class="form-row">
                        <label>Notes:</label>
                        <el-input v-model="step.notes" type="textarea" :rows="2" disabled />
                      </div>
                    </div>

                    <div v-else-if="step.type === 'measurement'" class="measurement-form">
                      <div class="form-row">
                        <label>{{ step.measurementLabel }}:</label>
                        <el-input v-model="step.measurementValue" size="small" style="width: 100px" disabled />
                        <span class="unit">{{ step.unit }}</span>
                        <span class="range">(Range: {{ step.expectedRange }})</span>
                      </div>
                      <div class="form-row">
                        <label>Within Tolerance:</label>
                        <el-radio-group v-model="step.withinTolerance" size="small" disabled>
                          <el-radio :label="true">Yes</el-radio>
                          <el-radio :label="false">No</el-radio>
                        </el-radio-group>
                      </div>
                    </div>

                    <div v-else-if="step.type === 'replacement'" class="replacement-form">
                      <div class="form-row">
                        <label>Component Replaced:</label>
                        <el-checkbox v-model="step.componentReplaced" disabled>
                          {{ step.componentName }}
                        </el-checkbox>
                      </div>
                      <div class="form-row">
                        <label>New Part Number:</label>
                        <el-input v-model="step.newPartNumber" size="small" style="width: 200px" disabled />
                      </div>
                      <div class="form-row">
                        <label>Installation Date:</label>
                        <el-date-picker v-model="step.installationDate" type="date" size="small" disabled />
                      </div>
                    </div>

                    <div v-else-if="step.type === 'calibration'" class="calibration-form">
                      <div class="form-row">
                        <label>Calibration Method:</label>
                        <el-select v-model="step.calibrationMethod" size="small" style="width: 200px" disabled>
                          <el-option label="Digital Multimeter" value="dmm" />
                          <el-option label="Pressure Gauge" value="pressure" />
                          <el-option label="Temperature Probe" value="temperature" />
                        </el-select>
                      </div>
                      <div class="form-row">
                        <label>Before Calibration:</label>
                        <el-input v-model="step.beforeValue" size="small" style="width: 100px" disabled />
                        <span class="unit">{{ step.unit }}</span>
                      </div>
                      <div class="form-row">
                        <label>After Calibration:</label>
                        <el-input v-model="step.afterValue" size="small" style="width: 100px" disabled />
                        <span class="unit">{{ step.unit }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Parts Cost Modal -->
    <el-dialog
      v-model="partsCostModalVisible"
      title="Parts Cost Management"
      width="600px"
      :before-close="handlePartsCostModalClose"
    >
      <div class="modal-content">
        <p>This is a stub modal for Parts Cost Management.</p>
        <p>Here you would be able to add, edit, and manage parts costs for this work order.</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="partsCostModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handlePartsCostSave">Save</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Time Logs Modal -->
    <el-dialog v-model="timeLogsModalVisible" title="Time Logs Management" width="700px">
      <div class="modal-content">
        <p>This is a stub modal for Time Logs Management.</p>
        <p>Here you would be able to add, edit, and manage labor time tracking for this work order.</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timeLogsModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="timeLogsModalVisible = false">Save</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Safety Modal -->
    <el-dialog v-model="safetyModalVisible" title="Safety Measures Management" width="600px">
      <div class="modal-content">
        <p>This is a stub modal for Safety Measures Management.</p>
        <p>Here you would be able to add, edit, and manage safety checklists and procedures.</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="safetyModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="safetyModalVisible = false">Save</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Procedures Modal -->
    <el-dialog v-model="proceduresModalVisible" title="Procedures Management" width="800px">
      <div class="modal-content">
        <p>This is a stub modal for Procedures Management.</p>
        <p>Here you would be able to add, edit, and manage maintenance procedures and steps.</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="proceduresModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="proceduresModalVisible = false">Save</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Asset Tree Modal -->
    <el-dialog v-model="assetTreeModalVisible" title="Equipment Tree - Steam Peeler" width="900px">
      <div class="asset-tree-content">
        <!-- Parent Level -->
        <div class="tree-level parent-level">
          <h4 class="level-title">Parent Equipment</h4>
          <div class="equipment-node parent-node" @click="navigateToEquipment('parent')">
            <div class="node-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">Food Processing Line A</div>
              <div class="node-type">Production Line</div>
            </div>
          </div>
        </div>

        <!-- Current Level -->
        <div class="tree-level current-level">
          <h4 class="level-title">Current Equipment</h4>
          <div class="equipment-node current-node" @click="navigateToEquipment('current')">
            <div class="node-icon highlighted">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">Steam Peeler</div>
              <div class="node-type">Processing Equipment</div>
              <div class="node-status">
                <el-tag type="warning" size="small">Under Maintenance</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Sub-components Level -->
        <div class="tree-level subcomponents-level">
          <h4 class="level-title">Sub-components</h4>
          <div class="subcomponents-grid">
            <div v-for="component in steamPeelerComponents" :key="component.id" class="equipment-node sub-node" @click="navigateToEquipment('sub', component)">
              <div class="node-icon">
                <el-icon>
                  <component :is="component.icon" />
                </el-icon>
              </div>
              <div class="node-info">
                <div class="node-name">{{ component.name }}</div>
                <div class="node-type">{{ component.type }}</div>
                <div class="node-status">
                  <el-tag :type="component.statusType" size="small">{{ component.status }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assetTreeModalVisible = false">Close</el-button>
          <el-button type="primary" @click="viewAssetDetails">View Full Tree</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Comments Section -->
    <div class="detail-section">
      <h3 class="section-title">{{ $t('workOrder.comments.title') }}</h3>
      <div class="comments-container">
        <el-input
          v-model="newComment"
          type="textarea"
          :placeholder="$t('workOrder.comments.placeholder')"
          :rows="3"
          class="comment-input"
        />
        <el-button
          type="primary"
          size="small"
          @click="addComment"
          :disabled="!newComment.trim()"
          style="margin-top: 8px"
        >
          {{ $t('workOrder.comments.add') }}
        </el-button>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-detail">
    <el-empty :description="$t('workOrder.selectWorkOrder')" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Edit,
  Share,
  Plus,
  Timer,
  Money,
  Document,
  Picture,
  Calendar,
  Setting
} from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import PriorityTag from '../PriorityTag.vue'
import WorkTypeTag from '../WorkTypeTag.vue'
import CategoryTag from '../CategoryTag.vue'

// Props
const props = defineProps( {
  workOrder : {
    type : Object,
    default : null
  }
} )

// Emits
const emit = defineEmits( [
  'edit',
  'share',
  'status-change',
  'add-parts',
  'add-time',
  'add-costs',
  'view-procedure',
  'add-comment'
] )

// State
const localStatus = ref( '' )
const newComment = ref( '' )
const activeTrackingTab = ref( 'partsUsage' )
const partsCostModalVisible = ref( false )
const timeLogsModalVisible = ref( false )
const safetyModalVisible = ref( false )
const proceduresModalVisible = ref( false )
const assetTreeModalVisible = ref( false )

// Hardcoded parts cost data
const partsCostData = ref( [
  {
    part : 'Bearing - SKF 6205',
    location : 'A1-B2',
    quantity : 2,
    unitCost : '$25.50'
  },
  {
    part : 'Oil Filter - Mann W712',
    location : 'C3-D4',
    quantity : 1,
    unitCost : '$18.00'
  },
  {
    part : 'Gasket Set - OEM',
    location : 'E5-F6',
    quantity : 1,
    unitCost : '$38.00'
  }
] )

// Hardcoded time logs data
const timeLogsData = ref( [
  {
    technician : 'John Smith',
    date : '2024-07-15',
    startTime : '08:00',
    endTime : '10:30',
    duration : '2.5h',
    hourlyRate : '$35.00',
    totalCost : '$87.50'
  },
  {
    technician : 'Mike Johnson',
    date : '2024-07-15',
    startTime : '10:30',
    endTime : '12:00',
    duration : '1.5h',
    hourlyRate : '$40.00',
    totalCost : '$60.00'
  },
  {
    technician : 'Sarah Wilson',
    date : '2024-07-16',
    startTime : '09:00',
    endTime : '11:15',
    duration : '2.25h',
    hourlyRate : '$42.00',
    totalCost : '$94.50'
  }
] )

// Hardcoded safety checklist data
const safetyChecklistData = ref( [
  {
    id : 1,
    description : 'Verify machine is powered down and locked out',
    completed : true
  },
  {
    id : 2,
    description : 'Check for zero energy state',
    completed : true
  },
  {
    id : 3,
    description : 'Ensure proper PPE is worn',
    completed : true
  },
  {
    id : 4,
    description : 'Verify emergency stop accessibility',
    completed : false
  },
  {
    id : 5,
    description : 'Check work area for hazards',
    completed : false
  }
] )

// Required PPE list
const requiredPPE = ref( ['Safety Glasses', 'Hard Hat', 'Steel-toe Boots', 'Cut-resistant Gloves', 'High-vis Vest'] )

// Hardcoded procedure steps data
const procedureSteps = ref( [
  {
    id : 1,
    title : 'Visual Inspection of Bearing Housing',
    description : 'Inspect bearing housing for cracks, wear, or damage',
    type : 'inspection',
    status : 'completed',
    inspectionResult : 'pass',
    notes : 'No visible damage detected. Housing appears in good condition.'
  },
  {
    id : 2,
    title : 'Measure Vibration Levels',
    description : 'Use vibration meter to check machine vibration levels',
    type : 'measurement',
    status : 'completed',
    measurementLabel : 'Vibration Level',
    measurementValue : '2.1',
    unit : 'mm/s',
    expectedRange : '0.5 - 3.0 mm/s',
    withinTolerance : true
  },
  {
    id : 3,
    title : 'Replace Oil Filter',
    description : 'Remove old oil filter and install new one',
    type : 'replacement',
    status : 'in-progress',
    componentReplaced : true,
    componentName : 'Oil Filter - Mann W712',
    newPartNumber : 'W712/75',
    installationDate : new Date( '2024-07-15' )
  },
  {
    id : 4,
    title : 'Calibrate Pressure Sensor',
    description : 'Calibrate hydraulic pressure sensor to ensure accurate readings',
    type : 'calibration',
    status : 'pending',
    calibrationMethod : 'pressure',
    beforeValue : '145.2',
    afterValue : '150.0',
    unit : 'PSI'
  }
] )

// Hardcoded steam peeler components data
const steamPeelerComponents = ref( [
  {
    id : 'SIS-001',
    name : 'Steam Injection System',
    type : 'Heating Component',
    status : 'Operational',
    statusType : 'success',
    icon : 'Timer',
    lastMaintenance : '2024-06-15',
    nextService : '2024-09-15',
    level : 'sub'
  },
  {
    id : 'PD-002',
    name : 'Peeling Drum',
    type : 'Mechanical Component',
    status : 'Needs Inspection',
    statusType : 'warning',
    icon : 'Setting',
    lastMaintenance : '2024-05-20',
    nextService : '2024-07-20',
    level : 'sub'
  },
  {
    id : 'WSN-003',
    name : 'Water Spray Nozzles',
    type : 'Cleaning Component',
    status : 'Operational',
    statusType : 'success',
    icon : 'Money',
    lastMaintenance : '2024-07-01',
    nextService : '2024-10-01',
    level : 'sub'
  },
  {
    id : 'DC-004',
    name : 'Discharge Conveyor',
    type : 'Transport Component',
    status : 'Under Maintenance',
    statusType : 'danger',
    icon : 'Document',
    lastMaintenance : '2024-07-10',
    nextService : '2024-07-25',
    level : 'sub'
  },
  {
    id : 'CP-005',
    name : 'Control Panel',
    type : 'Control Component',
    status : 'Operational',
    statusType : 'success',
    icon : 'Edit',
    lastMaintenance : '2024-06-30',
    nextService : '2024-12-30',
    level : 'sub'
  }
] )

// Computed
const isOverdue = computed( () => {
  return props.workOrder?.due_date && new Date( props.workOrder.due_date ) < new Date()
} )

const hasAttachments = computed( () => {
  return props.workOrder?.image_list && props.workOrder.image_list.length > 0
} )

const isRecurring = computed( () => {
  // Check if work order has recurrence (not type 1 which means "Does not repeat")
  return props.workOrder?.recurrence_type?.id && props.workOrder.recurrence_type.id !== 1
} )

// Watchers
watch(
  () => props.workOrder,
  newWorkOrder => {
    if ( newWorkOrder ) {
      localStatus.value = newWorkOrder.state?.name || 'Ready'
    }
  },
  { immediate : true }
)

// Methods
const formatDate = dateString => {
  return convertToLocalTime( dateString )
}

const handleStatusChange = newStatus => {
  emit( 'status-change', { workOrder : props.workOrder, status : newStatus } )
}

const addComment = () => {
  if ( newComment.value.trim() ) {
    emit( 'add-comment', { workOrder : props.workOrder, comment : newComment.value } )
    newComment.value = ''
  }
}

// Modal Methods
const openPartsCostModal = () => {
  partsCostModalVisible.value = true
}

const handlePartsCostModalClose = () => {
  partsCostModalVisible.value = false
}

const handlePartsCostSave = () => {
  // TODO: Implement save functionality
  console.log( 'Saving parts cost data...' )
  partsCostModalVisible.value = false
}

const openTimeLogsModal = () => {
  timeLogsModalVisible.value = true
}

const openSafetyModal = () => {
  safetyModalVisible.value = true
}

const openProceduresModal = () => {
  proceduresModalVisible.value = true
}

const openAssetTreeModal = () => {
  assetTreeModalVisible.value = true
}

const viewAssetDetails = () => {
  // TODO: Implement asset details view
  console.log( 'Viewing asset details for Steam Peeler...' )
  assetTreeModalVisible.value = false
}

const navigateToEquipment = ( level, equipment = null ) => {
  // TODO: Implement navigation to equipment details page
  let equipmentName = ''

  if ( level === 'parent' ) {
    equipmentName = 'Food Processing Line A'
    console.log( 'Navigating to Food Processing Line A details...' )
  } else if ( level === 'current' ) {
    equipmentName = 'Steam Peeler'
    console.log( 'Navigating to Steam Peeler details...' )
  } else if ( level === 'sub' && equipment ) {
    equipmentName = equipment.name
    console.log( `Navigating to ${equipment.name} details...` )
  }

  // For now, just show a message
  ElMessage.success( `Navigation to ${equipmentName} will be implemented` )
}

defineOptions( {
  name : 'WorkOrderDetail'
} )
</script>

<style scoped lang="scss">
.work-order-detail {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  .header-main {
    flex: 1;

    .detail-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .header-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      .work-order-id {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
  }

  .section-row {
    display: flex;
    gap: 70px;
    flex-wrap: wrap;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .field-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }

    .field-value {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }
}

.description-content {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 6px;

  p {
    margin: 0;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  .detail-item {
    .detail-label {
      display: block;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .detail-value {
      font-size: 14px;
      color: var(--el-text-color-primary);

      &.overdue {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }
  }
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;

  .attachment-item {
    .attachment-image {
      width: 100%;
      height: 120px;
      border-radius: 6px;
      overflow: hidden;
    }

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 120px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      font-size: 24px;
    }
  }
}

.tracking-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.comments-container {
  .comment-input {
    width: 100%;
  }
}

// Recurrence Info Card
.recurrence-info-card {
  .info-card {
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
    border-radius: 8px;
    padding: 16px;

    .info-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .info-card-icon {
        color: var(--el-color-primary);
        font-size: 18px;
        margin-right: 8px;
      }

      .section-title {
        margin: 0;
        color: var(--el-color-primary);
        font-size: 16px;
      }
    }

    .info-card-content {
      .schedule-line {
        font-size: 14px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// Time & Cost Tracking Card
.time-cost-tracking-card {
  .tracking-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      font-weight: 500;
    }

    .tab-content {
      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .tab-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin: 0;
        }

        .add-edit-link {
          color: var(--el-color-primary);
          font-size: 13px;
          padding: 0;

          &:hover {
            color: var(--el-color-primary-dark-2);
          }
        }
      }

      .parts-cost-table,
      .time-logs-table {
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        overflow: hidden;

        .cost-table,
        .logs-table {
          :deep(.el-table__header) {
            background: var(--el-fill-color-light);
          }

          :deep(.el-table__body) {
            font-size: 13px;
          }

          :deep(.el-table td),
          :deep(.el-table th) {
            padding: 8px 12px;
          }
        }

        .cost-footer {
          background: var(--el-fill-color-lighter);
          padding: 12px 16px;
          border-top: 1px solid var(--el-border-color-light);

          .cost-total {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .cost-label {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .cost-value {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-color-success);
            }
          }
        }
      }

      // Safety Measures Content
      .safety-measures-content {
        .safety-section {
          margin-bottom: 24px;

          .safety-section-title {
            font-size: 15px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin: 0 0 12px 0;
            border-bottom: 1px solid var(--el-border-color-lighter);
            padding-bottom: 4px;
          }

          .safety-checklist {
            .safety-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid var(--el-border-color-lighter);

              &:last-child {
                border-bottom: none;
              }

              .safety-status {
                font-size: 12px;
                font-weight: 500;
                padding: 2px 8px;
                border-radius: 4px;

                &.completed {
                  background: var(--el-color-success-light-9);
                  color: var(--el-color-success);
                }

                &.pending {
                  background: var(--el-color-warning-light-9);
                  color: var(--el-color-warning);
                }
              }
            }
          }

          .ppe-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .ppe-tag {
              margin: 0;
            }
          }

          .safety-notes {
            p {
              margin: 4px 0;
              font-size: 14px;
              line-height: 1.5;
              color: var(--el-text-color-regular);
            }
          }
        }
      }

      // Procedures Content
      .procedures-content {
        .procedure-form {
          .procedure-step {
            border: 1px solid var(--el-border-color-light);
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;

            .step-header {
              background: var(--el-fill-color-light);
              padding: 12px 16px;
              display: flex;
              align-items: center;
              gap: 12px;

              .step-number {
                background: var(--el-color-primary);
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
              }

              .step-title {
                flex: 1;
                margin: 0;
                font-size: 15px;
                font-weight: 500;
                color: var(--el-text-color-primary);
              }
            }

            .step-content {
              padding: 16px;

              .step-description {
                margin: 0 0 16px 0;
                font-size: 14px;
                color: var(--el-text-color-regular);
                line-height: 1.5;
              }

              .inspection-form,
              .measurement-form,
              .replacement-form,
              .calibration-form {
                .form-row {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin-bottom: 12px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  label {
                    min-width: 140px;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--el-text-color-primary);
                  }

                  .unit {
                    font-size: 13px;
                    color: var(--el-text-color-secondary);
                    margin-left: 4px;
                  }

                  .range {
                    font-size: 12px;
                    color: var(--el-text-color-placeholder);
                    margin-left: 8px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Related Assets Section
.related-assets-section {
  .assets-container {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .asset-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 120px;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .asset-image {
        margin-bottom: 8px;

        .asset-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--el-color-primary-light-9);
          border: 2px solid var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--el-color-primary);
          font-size: 24px;
        }
      }

      .asset-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-align: center;
        line-height: 1.4;
      }
    }
  }
}

// Asset Tree Modal
.asset-tree-content {
  position: relative;
  padding: 20px 0;

  .tree-level {
    margin-bottom: 32px;

    .level-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--el-border-color-light);
    }

    .equipment-node {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      background: var(--el-bg-color);
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: var(--el-color-primary);
      }

      .node-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: var(--el-fill-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        color: var(--el-text-color-secondary);

        &.highlighted {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          border: 2px solid var(--el-color-primary);
        }
      }

      .node-info {
        flex: 1;

        .node-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .node-type {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }

        .node-status {
          display: flex;
          align-items: center;
        }
      }

      &.parent-node {
        background: var(--el-color-info-light-9);
        border-color: var(--el-color-info-light-7);
      }

      &.current-node {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        border-width: 2px;
      }

      &.sub-node {
        background: var(--el-fill-color-lighter);
      }
    }

    &.subcomponents-level {
      .subcomponents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;

        .equipment-node {
          margin-bottom: 0;
        }
      }
    }
  }

  .tree-connections {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;

    .connection-line {
      position: absolute;
      background: var(--el-color-primary-light-7);

      &.parent-to-current {
        width: 2px;
        height: 40px;
        left: 50%;
        top: 120px;
        transform: translateX(-50%);
      }

      &.current-to-subs {
        width: 2px;
        height: 40px;
        left: 50%;
        top: 280px;
        transform: translateX(-50%);
      }
    }
  }
}

// Modal styles
.modal-content {
  padding: 20px 0;
  text-align: center;
  color: var(--el-text-color-secondary);

  p {
    margin: 8px 0;
    line-height: 1.6;
  }
}

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

// Responsive design
@media (max-width: 768px) {
  .work-order-detail {
    padding: 16px;
  }

  .detail-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      align-self: stretch;
    }
  }

  .section-row {
    flex-direction: column;
    gap: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .tracking-actions {
    flex-direction: column;
  }
}
</style>

<template>
  <div class="work-order-detail" v-if="workOrder">
    <!-- Detail Header -->
    <div class="detail-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <h2 class="detail-title">{{ workOrder.name }}</h2>
            <div class="header-meta">
              <span class="work-order-id">#{{ workOrder.id }}</span>
              <span class="created-date">
                {{ $t('workOrder.form.createdOn') }}: {{ formatDate(workOrder.created_at) }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="header-actions">
            <el-dropdown trigger="click" @command="handleHeaderAction">
              <el-button type="text" size="small" class="action-button">
                <el-icon class="rotated-icon"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>
                    {{ $t('workOrder.actions.edit') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="share">
                    <el-icon><Share /></el-icon>
                    {{ $t('workOrder.actions.share') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="export" divided>
                    <el-icon><Download /></el-icon>
                    {{ $t('workOrder.actions.export') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- General Detail Section -->
    <div class="detail-section">
      <el-descriptions :column="4" class="general-details-descriptions">
        <el-descriptions-item :label="$t('workOrder.table.state')">
          <el-select v-model="localStatus" @change="handleStatusChange" size="small" style="width: 150px">
            <el-option label="Ready" value="Ready" />
            <el-option label="On Hold" value="On Hold" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="Completed" value="Completed" />
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.priority')">
          <PriorityTag :priority="workOrder.priority" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.assignedTo')">
          <span class="field-value">{{ workOrder.created_by || 'Unassigned' }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.workType')">
          <WorkTypeTag :work-type="workOrder.work_type" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.category')">
          <CategoryTag :category="workOrder.category" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.estimatedTime')">
          <span class="detail-value">
            {{ workOrder.estimated_minutes ? `${workOrder.estimated_minutes} min` : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.dueDate')">
          <span class="detail-value" :class="{ overdue: isOverdue }">
            {{ workOrder.due_date ? formatDate(workOrder.due_date) : '-' }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Description Section -->
    <div class="detail-section" v-if="workOrder.description">
      <el-descriptions :column="1" class="general-details-descriptions">
        <el-descriptions-item :label="$t('workOrder.table.description')">
          <div class="description-content">
            <p>{{ workOrder.description }}</p>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Attachments Section -->
    <div class="detail-section" v-if="hasAttachments">
      <el-divider />
      <h3 class="section-title">{{ $t('workOrder.attachments.title') }}</h3>
      <el-row :gutter="12">
        <el-col :span="6" v-for="(image, index) in workOrder.image_list" :key="index">
          <div class="attachment-item">
            <el-image :src="image" fit="cover" :preview-src-list="workOrder.image_list" class="attachment-image">
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Schedule Conditions Section -->
    <div v-if="isRecurring" class="detail-section schedule-conditions-section">
      <!-- Schedule Conditions Card -->
      <div class="schedule-conditions-card">
        <!-- Header -->
        <div class="schedule-header">
          <div class="header-left">
            <div class="decorative-line"></div>
            <h3 class="schedule-title">{{ $t('workOrder.schedule.title') }}</h3>
          </div>
          <el-button
            type="default"
            size="small"
            @click="openTimelineModal"
            :title="$t('workOrder.schedule.viewTimeline')"
            class="timeline-button"
          >
            <el-icon><View /></el-icon>
            {{ $t('workOrder.schedule.viewTimeline') }}
          </el-button>
        </div>

        <!-- Content Grid -->
        <div class="schedule-content-grid">
          <!-- Repeat Type -->
          <div class="data-section">
            <div class="data-label">{{ $t('workOrder.schedule.repeatTypeLabel') }}</div>
            <div class="data-value">{{ $t('workOrder.schedule.timeBased') }}</div>
          </div>

          <!-- Frequency -->
          <div class="data-section">
            <div class="data-label">{{ $t('workOrder.schedule.frequencyLabel') }}</div>
            <div class="data-value">{{ $t('workOrder.schedule.weeklyPattern') }}</div>
          </div>

          <!-- Continued From -->
          <div class="data-section">
            <div class="data-label">{{ $t('workOrder.schedule.continuedFromLabel') }}</div>
            <div class="data-value linked-value" @click="navigateToLinkedOrder">Daily Wash - Washin Washer</div>
          </div>

          <!-- Weekly Pattern -->
          <div class="data-section weekly-pattern-section">
            <div class="data-label">{{ $t('workOrder.schedule.weeklyPatternLabel') }}</div>
            <div class="day-indicators">
              <div v-for="day in weekDays" :key="day.name" class="day-indicator" :class="{ active: day.active }">
                {{ day.name.charAt(0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Assets Section -->
    <div class="detail-section related-assets-section">
      <el-divider />
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

    <!-- Location Section -->
    <div class="detail-section related-assets-section">
      <el-divider />
      <h3 class="section-title">{{ $t('workOrder.location.title') }}</h3>
      <div class="assets-container">
        <div class="asset-card" @click="openLocationTreeModal">
          <div class="asset-image">
            <div class="asset-icon">
              <el-icon><Location /></el-icon>
            </div>
          </div>
          <div class="asset-name">{{ currentLocationName }}</div>
        </div>
      </div>
    </div>

    <!-- Vendors Section -->
    <div class="detail-section vendors-section">
      <el-divider />
      <h3 class="section-title">{{ $t('workOrder.vendors.title') }}</h3>
      <div class="vendors-container">
        <div v-for="vendor in vendorList" :key="vendor.id" class="vendor-card" @click="handleVendorClick(vendor)">
          <div class="vendor-header">
            <div class="vendor-avatar">
              <el-avatar :size="48" :src="vendor.avatar" :alt="vendor.name">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>
            <div class="vendor-info">
              <div class="vendor-name">{{ vendor.name }}</div>
              <div class="vendor-rating">
                <el-rate v-model="vendor.rating" disabled size="small" show-score />
              </div>
            </div>
          </div>
          <div class="vendor-details">
            <div class="vendor-contact">
              <div class="contact-item">
                <el-icon class="contact-icon"><Message /></el-icon>
                <a :href="`mailto:${vendor.email}`" class="vendor-email" @click.stop>
                  {{ vendor.email }}
                </a>
              </div>
              <div class="contact-item">
                <el-icon class="contact-icon"><Location /></el-icon>
                <span class="vendor-address">{{ vendor.address }}</span>
              </div>
            </div>
            <div class="vendor-actions">
              <el-button type="primary" size="small" @click.stop="contactVendor(vendor)">
                <el-icon><Phone /></el-icon>
                {{ $t('workOrder.vendors.contactVendor') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Time & Cost Tracking Card -->
    <div class="detail-section time-cost-tracking-card">
      <el-divider />
      <h3 class="section-title">Tracking</h3>

      <!-- Tracking Tabs -->
      <el-tabs v-model="activeTrackingTab" class="tracking-tabs">
        <!-- Combined Costs Tab -->
        <el-tab-pane label="Costs" name="costs">
          <div class="tab-content">
            <!-- Parts Cost Section -->
            <div class="cost-section">
              <div class="tab-header">
                <h4 class="tab-title">Parts Cost</h4>
                <el-button type="text" size="small" @click="openPartsCostModal" class="add-edit-link"> Edit </el-button>
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

            <!-- Labor Cost Section -->
            <div class="cost-section">
              <div class="tab-header">
                <h4 class="tab-title">Labor Time Tracking</h4>
                <el-button type="text" size="small" @click="openTimeLogsModal" class="add-edit-link"> Edit </el-button>
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

            <!-- Total Cost Summary -->
            <div class="cost-section">
              <div class="tab-header">
                <h4 class="tab-title">Total Cost Summary</h4>
              </div>

              <div class="total-cost-table">
                <el-table :data="costSummaryData" size="small" class="cost-table">
                  <el-table-column prop="description" label="Description" min-width="120" />
                  <el-table-column prop="amount" label="Amount" width="100" align="right" />
                </el-table>

                <div class="cost-footer total-footer">
                  <div class="cost-total">
                    <span class="cost-label">Total Cost:</span>
                    <span class="cost-value total-amount">$347.00</span>
                  </div>
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
              <el-button type="text" size="small" @click="openSafetyModal" class="add-edit-link"> Edit </el-button>
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
              <el-button type="text" size="small" @click="openProceduresModal" class="add-edit-link"> Edit </el-button>
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
            <div
              v-for="component in steamPeelerComponents"
              :key="component.id"
              class="equipment-node sub-node"
              @click="navigateToEquipment('sub', component)"
            >
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

    <!-- Location Tree Modal -->
    <el-dialog
      v-model="locationTreeModalVisible"
      :title="$t('workOrder.location.locationTreeTitle', { location: currentLocationName })"
      width="900px"
    >
      <div class="location-tree-content">
        <div class="tree-container">
          <el-tree
            :data="locationTreeData"
            :props="locationTreeProps"
            :expand-on-click-node="false"
            :highlight-current="true"
            :current-node-key="currentLocationKey"
            :indent="40"
            node-key="id"
            class="location-tree"
            @node-click="handleLocationNodeClick"
            default-expand-all
          >
            <template #default="{ data }">
              <div class="location-node" :class="{ 'current-location': data.id === currentLocationKey }">
                <div class="left-info">
                  <div class="location-icon">
                    <el-icon>
                      <component :is="data.icon" />
                    </el-icon>
                  </div>
                  <div class="location-info">
                    <div class="location-name">{{ data.name }}</div>
                    <div class="location-type">{{ data.type }}</div>
                  </div>
                </div>
                <div v-if="data.id === currentLocationKey" class="location-badge">
                  <el-tag type="success" size="small">{{ $t('workOrder.location.currentLocation') }}</el-tag>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="locationTreeModalVisible = false">{{ $t('workOrder.location.close') }}</el-button>
          <el-button type="primary" @click="viewLocationDetails">{{ $t('workOrder.location.viewFullTree') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Work Order Timeline Modal -->
    <el-dialog
      v-model="timelineModalVisible"
      :title="$t('workOrder.timeline.title')"
      width="900px"
      :before-close="handleTimelineModalClose"
      class="timeline-modal"
    >
      <div class="timeline-content">
        <!-- Stats Bar Header -->
        <div class="timeline-stats-bar">
          <div class="filter-controls">
            <div class="date-range-filter">
              <label class="filter-label">{{ $t('workOrder.timeline.timeRange') }}</label>
              <el-date-picker
                v-model="timelineFilter.dateRange"
                type="daterange"
                :range-separator="$t('workOrder.timeline.to')"
                :start-placeholder="$t('workOrder.timeline.startDate')"
                :end-placeholder="$t('workOrder.timeline.endDate')"
                size="small"
                class="date-range-picker"
              />
            </div>
            <el-button type="primary" size="small" @click="applyTimelineFilter" class="apply-filter-btn">
              {{ $t('workOrder.timeline.apply') }}
            </el-button>
          </div>

          <div class="metrics-group">
            <div class="metric-item">
              <span class="metric-value">{{ filteredTimelineEvents.length }}</span>
              <span class="metric-label">{{ $t('workOrder.timeline.totalEvents') }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-value">{{ averageTimeConsumed }}</span>
              <span class="metric-label">{{ $t('workOrder.timeline.avgTimeConsumed') }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline Body -->
        <div class="timeline-body">
          <el-timeline class="work-order-timeline">
            <el-timeline-item
              v-for="event in filteredTimelineEvents"
              :key="event.id"
              :timestamp="event.timestamp"
              :type="event.type"
              :color="event.color"
              :icon="event.icon"
              placement="top"
              :hollow="event.hollow"
              size="large"
            >
              <div class="event-card">
                <div class="event-header">
                  <h5 class="event-title">{{ event.title }}</h5>
                  <div class="event-badges">
                    <el-tag :type="getStatusTagType(event.status)" size="small">
                      {{ event.status }}
                    </el-tag>
                    <el-tag v-if="isEventOverdue(event)" type="danger" size="small" class="overdue-badge">
                      {{ $t('workOrder.timeline.overdue') }}
                    </el-tag>
                  </div>
                </div>

                <p class="event-description">{{ event.description }}</p>

                <div class="event-details">
                  <div class="detail-item" v-if="event.duration">
                    <span class="detail-label">{{ $t('workOrder.timeline.duration') }}:</span>
                    <span class="detail-value">{{ event.duration }}</span>
                  </div>

                  <div class="detail-item" v-if="event.assignees && event.assignees.length > 0">
                    <span class="detail-label">{{ $t('workOrder.timeline.assignees') }}:</span>
                    <div class="assignees-list">
                      <el-avatar
                        v-for="assignee in event.assignees.slice(0, 2)"
                        :key="assignee.id"
                        :size="24"
                        :src="assignee.avatar"
                        class="assignee-avatar"
                      >
                        {{ assignee.name.charAt(0) }}
                      </el-avatar>
                      <span v-if="event.assignees.length > 2" class="overflow-indicator">
                        +{{ event.assignees.length - 2 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timelineModalVisible = false">{{ $t('workOrder.actions.cancel') }}</el-button>
          <el-button type="primary" @click="exportTimeline">
            <el-icon><Download /></el-icon>
            {{ $t('workOrder.timeline.export') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Activity Panel Section -->
    <div class="detail-section">
      <el-divider />
      <h3 class="section-title">{{ $t('workOrder.activity.title') }}</h3>
      <ActivityPanel :work-order="workOrder" @add-comment="handleAddComment" />
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
  Document,
  Picture,
  Setting,
  Location,
  User,
  Phone,
  Download,
  Plus,
  ShoppingCart,
  Tools,
  Search,
  View,
  MoreFilled
} from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import PriorityTag from '../PriorityTag.vue'
import WorkTypeTag from '../WorkTypeTag.vue'
import CategoryTag from '../CategoryTag.vue'
import ActivityPanel from '../ActivityPanel.vue'

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
  'export',
  'status-change',
  'add-parts',
  'add-time',
  'add-costs',
  'view-procedure',
  'add-comment'
] )

// State
const localStatus = ref( '' )
const activeTrackingTab = ref( 'costs' )
const partsCostModalVisible = ref( false )
const timeLogsModalVisible = ref( false )
const safetyModalVisible = ref( false )
const proceduresModalVisible = ref( false )
const assetTreeModalVisible = ref( false )
const locationTreeModalVisible = ref( false )
const timelineModalVisible = ref( false )

// Timeline filter state
const timelineFilter = ref( {
  dateRange : null
} )

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

// Cost summary data
const costSummaryData = ref( [
  {
    description : 'Parts Cost',
    amount : '$107.00'
  },
  {
    description : 'Labor Cost',
    amount : '$240.00'
  }
] )

// Hardcoded time logs data
const timeLogsData = ref( [
  {
    technician : 'Erik Yellow',
    date : '2024-07-15',
    startTime : '08:00',
    endTime : '10:30',
    duration : '2.5h',
    hourlyRate : '$35.00',
    totalCost : '$87.50'
  },
  {
    technician : 'King Harry',
    date : '2024-07-15',
    startTime : '10:30',
    endTime : '12:00',
    duration : '1.5h',
    hourlyRate : '$40.00',
    totalCost : '$60.00'
  },
  {
    technician : 'Steve Buhao',
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

// Week days for schedule display
const weekDays = ref( [
  { name : 'Mon', active : false },
  { name : 'Tue', active : true },
  { name : 'Wed', active : false },
  { name : 'Thu', active : false },
  { name : 'Fri', active : true },
  { name : 'Sat', active : true },
  { name : 'Sun', active : false }
] )

// Timeline events data - Recurring Work Orders Timeline
const timelineEvents = ref( [
  {
    id : 1,
    title : 'Daily Wash - Washin Washer #001',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-06-15 08:00',
    type : 'success',
    color : '#67c23a',
    icon : Plus,
    status : 'Completed',
    hollow : false,
    duration : '2h 30m',
    plannedEnd : '2024-06-15 10:30',
    actualEnd : '2024-06-15 10:30',
    assignees : [
      { id : 1, name : 'Eric Yellow', avatar : 'https://via.placeholder.com/40' },
      { id : 2, name : 'Chang Duan', avatar : 'https://via.placeholder.com/40' }
    ]
  },
  {
    id : 2,
    title : 'Daily Wash - Washin Washer #002',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-06-18 08:00',
    type : 'success',
    color : '#67c23a',
    icon : User,
    status : 'Completed',
    hollow : false,
    duration : '2h 15m',
    plannedEnd : '2024-06-18 10:30',
    actualEnd : '2024-06-18 10:15',
    assignees : [
      { id : 1, name : 'John Smith', avatar : 'https://via.placeholder.com/40' },
      { id : 3, name : 'Sarah Wilson', avatar : 'https://via.placeholder.com/40' }
    ]
  },
  {
    id : 3,
    title : 'Daily Wash - Washin Washer #003',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-06-21 08:00',
    type : 'warning',
    color : '#e6a23c',
    icon : ShoppingCart,
    status : 'Completed',
    hollow : false,
    duration : '3h 45m',
    plannedEnd : '2024-06-21 10:30',
    actualEnd : '2024-06-21 11:45',
    assignees : [
      { id : 2, name : 'Mike Johnson', avatar : 'https://via.placeholder.com/40' },
      { id : 4, name : 'David Chen', avatar : 'https://via.placeholder.com/40' },
      { id : 5, name : 'Lisa Wang', avatar : 'https://via.placeholder.com/40' }
    ]
  },
  {
    id : 4,
    title : 'Daily Wash - Washin Washer #004',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-06-25 08:00',
    type : 'primary',
    color : '#409eff',
    icon : Tools,
    status : 'In Progress',
    hollow : false,
    duration : '1h 30m',
    plannedEnd : '2024-06-25 10:30',
    actualEnd : null,
    assignees : [{ id : 1, name : 'John Smith', avatar : 'https://via.placeholder.com/40' }]
  },
  {
    id : 5,
    title : 'Daily Wash - Washin Washer #005',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-06-28 08:00',
    type : 'success',
    color : '#67c23a',
    icon : Plus,
    status : 'Completed',
    hollow : false,
    duration : '2h 00m',
    plannedEnd : '2024-06-28 10:30',
    actualEnd : '2024-06-28 10:00',
    assignees : [
      { id : 3, name : 'Sarah Wilson', avatar : 'https://via.placeholder.com/40' },
      { id : 4, name : 'David Chen', avatar : 'https://via.placeholder.com/40' }
    ]
  },
  {
    id : 6,
    title : 'Daily Wash - Washin Washer #006',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-07-02 08:00',
    type : 'info',
    color : '#909399',
    icon : Tools,
    status : 'Completed',
    hollow : false,
    duration : '2h 45m',
    plannedEnd : '2024-07-02 10:30',
    actualEnd : '2024-07-02 10:45',
    assignees : [{ id : 2, name : 'Mike Johnson', avatar : 'https://via.placeholder.com/40' }]
  },
  {
    id : 7,
    title : 'Daily Wash - Washin Washer #007',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-07-05 08:00',
    type : 'info',
    color : '#909399',
    icon : Search,
    status : 'Pending',
    hollow : true,
    duration : null,
    plannedEnd : '2024-07-05 10:30',
    actualEnd : null,
    assignees : [
      { id : 1, name : 'John Smith', avatar : 'https://via.placeholder.com/40' },
      { id : 3, name : 'Sarah Wilson', avatar : 'https://via.placeholder.com/40' }
    ]
  },
  {
    id : 8,
    title : 'Daily Wash - Washin Washer #008',
    description : 'Recurring maintenance work order for daily washing cycle',
    timestamp : '2024-07-09 08:00',
    type : 'info',
    color : '#909399',
    icon : Search,
    status : 'Pending',
    hollow : true,
    duration : null,
    plannedEnd : '2024-07-09 10:30',
    actualEnd : null,
    assignees : [{ id : 4, name : 'David Chen', avatar : 'https://via.placeholder.com/40' }]
  }
] )

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

// Location tree data
const locationTreeData = ref( [
  {
    id : 'building-a',
    name : 'Manufacturing Building A',
    type : 'Building',
    icon : 'OfficeBuilding',
    children : [
      {
        id : 'floor-1',
        name : 'Ground Floor',
        type : 'Floor',
        icon : 'Grid',
        children : [
          {
            id : 'room-101',
            name : 'Production Area 101',
            type : 'Production Room',
            icon : 'Setting'
          },
          {
            id : 'room-102',
            name : 'Storage Room 102',
            type : 'Storage Room',
            icon : 'Box'
          },
          {
            id : 'room-103',
            name : 'Quality Control Lab 103',
            type : 'Laboratory',
            icon : 'Monitor'
          }
        ]
      },
      {
        id : 'floor-2',
        name : 'Second Floor',
        type : 'Floor',
        icon : 'Grid',
        children : [
          {
            id : 'room-201',
            name : 'Processing Area 201',
            type : 'Processing Room',
            icon : 'Setting'
          },
          {
            id : 'room-202',
            name : 'Equipment Room 202',
            type : 'Equipment Room',
            icon : 'Tools'
          }
        ]
      }
    ]
  },
  {
    id : 'building-b',
    name : 'Warehouse Building B',
    type : 'Building',
    icon : 'OfficeBuilding',
    children : [
      {
        id : 'floor-b1',
        name : 'Main Floor',
        type : 'Floor',
        icon : 'Grid',
        children : [
          {
            id : 'room-b101',
            name : 'Raw Materials Storage',
            type : 'Storage Area',
            icon : 'Box'
          },
          {
            id : 'room-b102',
            name : 'Finished Goods Storage',
            type : 'Storage Area',
            icon : 'Box'
          }
        ]
      }
    ]
  }
] )

// Location tree props for el-tree
const locationTreeProps = {
  children : 'children',
  label : 'name'
}

// Current location (this would normally come from the work order data)
const currentLocationKey = ref( 'room-201' )
const currentLocationName = computed( () => {
  // Find the current location name from the tree data
  const findLocationName = ( nodes, targetId ) => {
    for ( const node of nodes ) {
      if ( node.id === targetId ) {
        return node.name
      }
      if ( node.children ) {
        const found = findLocationName( node.children, targetId )
        if ( found ) return found
      }
    }
    return null
  }
  return findLocationName( locationTreeData.value, currentLocationKey.value ) || 'Processing Area 201'
} )

// Vendor list data (hardcoded for now, will be replaced by API data later)
const vendorList = ref( [
  {
    id : 'vendor-001',
    name : 'Yellow Guy Solutions',
    email : 'contact@yellowguy.com',
    address : '1234 YellowGuy Blvd, Manufacturing District, City 12345',
    avatar : 'http://10.10.12.12:9000/sv-file-bucket/yellow_guy.png',
    rating : 4.8,
    specialties : ['Industrial Equipment', 'Automation Systems'],
    phone : '+1 (555) 123-4567',
    website : 'https://techflow.com'
  },
  {
    id : 'vendor-002',
    name : 'Hurry-up Co.',
    email : 'harry@up.com',
    address : 'King Ave, Parts Valley, City Dong Yang, Zhe Jiang, China',
    avatar : 'http://10.10.12.12:9000/sv-file-bucket/hurry.png',
    rating : 4.5,
    specialties : ['Mechanical Components', 'Custom Fabrication'],
    phone : '+1 (555) 987-6543',
    website : 'https://precisionparts.com'
  },
  {
    id : 'vendor-003',
    name : 'FPS Food Process Solutions',
    email : 'support@fpscorp.ca',
    address : 'Suite 110, 13911 Wireless Way, Richmond, BC',
    avatar :
      'https://images.squarespace-cdn.com/content/v1/52e97c67e4b0525e2491c5ef/1504302955120-JNIRG02UAKIER9RZFC5R/favicon.ico?format=100w',
    rating : 4.9,
    specialties : ['Preventive Maintenance', 'Emergency Repairs'],
    phone : '+1 (555) 456-7890',
    website : 'https://maintainmax.com'
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

const handleAddComment = commentData => {
  emit( 'add-comment', { workOrder : props.workOrder, ...commentData } )
}

const handleHeaderAction = action => {
  switch ( action ) {
    case 'edit':
      emit( 'edit', props.workOrder )
      break
    case 'share':
      emit( 'share', props.workOrder )
      break
    case 'export':
      emit( 'export', props.workOrder )
      break
    default:
      console.warn( `Unhandled header action: ${action}` )
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

// Location tree modal methods
const openLocationTreeModal = () => {
  locationTreeModalVisible.value = true
}

const viewLocationDetails = () => {
  // TODO: Implement location details view
  console.log( 'Viewing location details...' )
  locationTreeModalVisible.value = false
}

const handleLocationNodeClick = data => {
  // TODO: Implement location node click functionality
  console.log( `Clicked on location: ${data.name}` )
  ElMessage.success( `Selected location: ${data.name}` )
}

// Vendor methods
const handleVendorClick = vendor => {
  // TODO: Implement vendor details view
  console.log( `Viewing vendor details: ${vendor.name}` )
  ElMessage.info( `Viewing details for ${vendor.name}` )
}

const contactVendor = vendor => {
  // TODO: Implement vendor contact functionality
  console.log( `Contacting vendor: ${vendor.name}` )
  ElMessage.success( `Contacting ${vendor.name} at ${vendor.phone}` )
}

// Timeline modal methods
const openTimelineModal = () => {
  timelineModalVisible.value = true
}

const handleTimelineModalClose = () => {
  timelineModalVisible.value = false
}

const exportTimeline = () => {
  // TODO: Implement timeline export functionality
  console.log( 'Exporting timeline data...' )
  ElMessage.success( 'Timeline export will be implemented' )
  timelineModalVisible.value = false
}

// const getActiveDays = () => {
//   return weekDays.value.filter( day => day.active ).length
// }

const navigateToLinkedOrder = () => {
  // TODO: Implement navigation to linked work order
  console.log( 'Navigating to linked work order...' )
  ElMessage.info( 'Navigation to linked work order will be implemented' )
}

// Timeline filtering and computed properties
const filteredTimelineEvents = computed( () => {
  if ( !timelineFilter.value.dateRange ) {
    return timelineEvents.value
  }

  const [startDate, endDate] = timelineFilter.value.dateRange
  return timelineEvents.value.filter( event => {
    const eventDate = new Date( event.timestamp )
    return eventDate >= startDate && eventDate <= endDate
  } )
} )

const averageTimeConsumed = computed( () => {
  const completedEvents = filteredTimelineEvents.value.filter( event => event.status === 'Completed' && event.duration )

  if ( completedEvents.length === 0 ) return '0h 0m'

  const totalMinutes = completedEvents.reduce( ( total, event ) => {
    const duration = event.duration
    const hours = parseInt( duration.match( /(\d+)h/ )?.[1] || '0' )
    const minutes = parseInt( duration.match( /(\d+)m/ )?.[1] || '0' )
    return total + hours * 60 + minutes
  }, 0 )

  const avgMinutes = Math.round( totalMinutes / completedEvents.length )
  const hours = Math.floor( avgMinutes / 60 )
  const mins = avgMinutes % 60

  return `${hours}h ${mins}m`
} )

const applyTimelineFilter = () => {
  // Filter is automatically applied through computed property
  ElMessage.success( 'Timeline filter applied' )
}

const getStatusTagType = status => {
  const statusMap = {
    Completed : 'success',
    'In Progress' : 'primary',
    Pending : 'info'
  }
  return statusMap[status] || 'info'
}

const isEventOverdue = event => {
  if ( !event.plannedEnd || !event.actualEnd ) return false
  return new Date( event.actualEnd ) > new Date( event.plannedEnd )
}

defineOptions( {
  name : 'WorkOrderDetail'
} )
</script>

<style scoped lang="scss">
.work-order-detail {
  background: var(--el-bg-color);
  border-radius: 8px;
  margin-top: 24px;
  padding: 0 24px 24px 24px;
  height: 100%;
  overflow-y: auto;
  position: relative; // Add relative positioning
}

.detail-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky; // Use sticky instead of fixed for better behavior
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;

  .header-main {
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
    justify-content: flex-end;

    .action-button {
      padding: 4px;
      color: var(--el-text-color-secondary);

      &:hover {
        color: var(--el-color-primary);
      }

      .rotated-icon {
        transform: rotate(90deg);
      }
    }
  }
}

.detail-section {
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
  }

  .section-row {
    display: flex;
    gap: 12px;
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

  // Custom styling for el-descriptions to match original design
  .general-details-descriptions {
    :deep(.el-descriptions__header) {
      margin-bottom: 0;
    }

    :deep(.el-descriptions__body) {
      background: transparent;
    }

    :deep(.el-descriptions__table) {
      border: none;
      border-collapse: separate;
      border-spacing: 0 16px;
    }

    :deep(.el-descriptions__cell) {
      padding: 0 70px 0 0;
      border: none;
      vertical-align: top;

      &:last-child {
        padding-right: 0;
      }
    }

    :deep(.el-descriptions__label) {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
      margin-bottom: 4px;
      display: block;
    }

    :deep(.el-descriptions__content) {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  .work-order-details-descriptions {
    :deep(.el-descriptions__cell) {
      padding: 0 16px 16px 0;

      &:last-child {
        padding-right: 0;
      }
    }
  }
}

.description-content {
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

// Attachments grid styles removed - replaced by el-row/el-col

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

// Tracking actions styles removed - replaced by el-row/el-col

// Schedule Conditions Section
.schedule-conditions-section {
  margin-top: 24px;
  .schedule-conditions-card {
    background: linear-gradient(to right, #f9fafb, #eff6ff);
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .decorative-line {
          width: 8px;
          height: 32px;
          background-color: var(--el-color-primary);
          border-radius: 4px;
        }

        .schedule-title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #111827;
        }
      }

      .timeline-button {
        border-color: #bfdbfe;
        color: #2563eb;
        background: transparent;
        font-size: 14px;
        font-weight: 500;

        &:hover {
          background-color: #eff6ff;
          border-color: #93c5fd;
        }

        .el-icon {
          margin-right: 8px;
        }
      }
    }

    .schedule-content-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      align-items: center;

      @media (max-width: 1023px) {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .data-section {
        &.weekly-pattern-section {
          @media (min-width: 1024px) {
            text-align: right;
          }
        }

        .data-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 400;
        }

        .data-value {
          font-size: 14px;
          color: #111827;
          font-weight: 400;

          &.linked-value {
            color: #2563eb;
            cursor: pointer;
            transition: color 0.2s ease;

            &:hover {
              color: #1d4ed8;
            }
          }
        }

        .day-indicators {
          display: flex;
          gap: 4px;
          justify-content: flex-start;

          @media (max-width: 1023px) {
            justify-content: center;
          }

          @media (min-width: 1024px) {
            justify-content: flex-end;
          }

          .day-indicator {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 400;
            transition: all 0.2s ease;

            &.active {
              background-color: var(--el-color-primary);
              color: white;
            }

            &:not(.active) {
              background-color: #e5e7eb;
              color: #6b7280;
            }
          }
        }
      }
    }
  }
}

// Timeline Modal Styles
.timeline-modal {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    color: white;
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        font-size: 18px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  .timeline-content {
    .timeline-stats-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: var(--el-fill-color-lighter);
      border-bottom: 1px solid var(--el-border-color-light);

      .filter-controls {
        display: flex;
        align-items: center;
        gap: 16px;

        .date-range-filter {
          display: flex;
          align-items: center;
          gap: 8px;

          .filter-label {
            font-size: 14px;
            color: var(--el-text-color-primary);
            font-weight: 500;
            white-space: nowrap;
          }

          .date-range-picker {
            width: 280px;
          }
        }

        .apply-filter-btn {
          white-space: nowrap;
        }
      }

      .metrics-group {
        display: flex;
        gap: 32px;

        .metric-item {
          text-align: center;

          .metric-value {
            display: block;
            font-size: 20px;
            font-weight: 700;
            color: var(--el-color-primary);
            line-height: 1;
          }

          .metric-label {
            display: block;
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }
    }

    .timeline-body {
      .work-order-timeline {
        padding: 24px;
        max-height: 500px;
        overflow-y: auto;

        :deep(.el-timeline-item__timestamp) {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          font-weight: 500;
        }

        :deep(.el-timeline-item__node) {
          border-width: 3px;
        }

        :deep(.el-timeline-item__wrapper) {
          padding-left: 32px;
        }

        .event-card {
          background: white;
          border: 1px solid var(--el-border-color-light);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;

          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;

            .event-title {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              flex: 1;
            }

            .event-badges {
              display: flex;
              gap: 8px;
              flex-shrink: 0;

              .overdue-badge {
                margin-left: 4px;
              }
            }
          }

          .event-description {
            margin: 0 0 16px 0;
            font-size: 14px;
            color: var(--el-text-color-regular);
            line-height: 1.5;
          }

          .event-details {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .detail-item {
              display: flex;
              align-items: center;
              gap: 8px;

              .detail-label {
                font-size: 13px;
                color: var(--el-text-color-secondary);
                font-weight: 500;
                min-width: 80px;
              }

              .detail-value {
                font-size: 13px;
                color: var(--el-text-color-primary);
                font-weight: 500;
              }

              .assignees-list {
                display: flex;
                align-items: center;
                gap: 8px;

                .assignee-avatar {
                  border: 2px solid var(--el-border-color-light);
                  font-size: 12px;
                  font-weight: 600;
                }

                .overflow-indicator {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                  background: var(--el-fill-color-light);
                  padding: 4px 8px;
                  border-radius: 12px;
                  border: 1px solid var(--el-border-color-light);
                }
              }
            }
          }
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

      // Cost sections spacing
      .cost-section {
        margin-bottom: 32px;

        &:last-of-type {
          margin-bottom: 24px;
        }
      }

      .parts-cost-table,
      .time-logs-table,
      .total-cost-table {
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

              &.total-amount {
                font-size: 18px;
                font-weight: 700;
                color: var(--el-color-primary);
              }
            }
          }

          &.total-footer {
            background: var(--el-color-primary-light-9);
            border-top: 2px solid var(--el-color-primary-light-7);

            .cost-label {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-color-primary);
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

// Location Tree Modal
.location-tree-content {
  padding: 20px 0;

  .tree-container {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: 16px;
    background: var(--el-bg-color);

    .location-tree {
      :deep(.el-tree-node__content) {
        padding: 18px 0;
        margin-bottom: 4px;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          background: var(--el-fill-color-light);
        }
      }

      :deep(.el-tree-node__expand-icon) {
        color: var(--el-color-primary);
        font-size: 16px;
      }

      //:deep(.el-tree-node.is-current > .el-tree-node__content) {
      //  background: var(--el-color-primary-light-9);
      //  border: 1px solid var(--el-color-primary);
      //}

      .location-node {
        display: flex;
        align-items: center;
        justify-content: space-between; // ⬅️ Separate left/right groups
        width: 100%;
        padding: 8px 12px;
        cursor: pointer;

        &.current-location {
          background: var(--el-color-success-light-9);
          border-radius: 6px;
          border: 1px solid var(--el-color-success);
        }

        .left-info {
          display: flex;
          align-items: center;

          .location-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: var(--el-fill-color-light);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 20px;
            color: var(--el-color-primary);
            border: 1px solid var(--el-border-color-light);
          }

          .location-info {
            display: flex;
            flex-direction: column;

            .location-name {
              font-size: 15px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 2px;
            }

            .location-type {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .location-badge {
          // no need for margin-left: auto anymore
        }
      }
    }
  }
}

// Vendors Section
.vendors-section {
  .vendors-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;

    .vendor-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .vendor-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .vendor-avatar {
          margin-right: 12px;
        }

        .vendor-info {
          flex: 1;

          .vendor-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
            line-height: 1.4;
          }

          .vendor-rating {
            :deep(.el-rate) {
              height: auto;
              line-height: 1;
            }

            :deep(.el-rate__text) {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-left: 4px;
            }
          }
        }
      }

      .vendor-details {
        .vendor-contact {
          margin-bottom: 16px;

          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;

            &:last-child {
              margin-bottom: 0;
            }

            .contact-icon {
              width: 16px;
              height: 16px;
              margin-right: 8px;
              color: var(--el-color-primary);
              flex-shrink: 0;
            }

            .vendor-email {
              color: var(--el-color-primary);
              text-decoration: none;
              transition: color 0.2s ease;

              &:hover {
                color: var(--el-color-primary-dark-2);
                text-decoration: underline;
              }
            }

            .vendor-address {
              color: var(--el-text-color-regular);
              line-height: 1.4;
            }
          }
        }

        .vendor-actions {
          display: flex;
          justify-content: flex-end;

          .el-button {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
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
}
</style>

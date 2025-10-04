<template>
  <div class="work-order-detail" v-if="workOrder">
    <!-- Detail Header -->
    <div class="detail-header">
      <el-row justify="space-between" align="top" :gutter="16">
        <el-col :span="18">
          <div class="header-main">
            <div class="title-row">
              <h2 class="detail-title">{{ workOrder.name }}</h2>
              <span class="work-order-id">#{{ workOrder.id }}</span>
            </div>
            <div class="meta-info">
              <span class="created-date">
                {{ $t('workOrder.form.createdOn') }}: {{ formatDate(workOrder.created_at) }}
              </span>
              <span v-if="workOrder.updated_at" class="updated-date">
                Updated: {{ formatDate(workOrder.updated_at) }}
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="header-actions">
            <el-button
              class="edit-button"
              type="primary"
              plain
              size="default"
              @click="emit('edit', workOrder)"
              :aria-label="$t('workOrder.actions.edit')"
            >
              <el-icon style="margin-right: 4px"><Edit /></el-icon>
              {{ $t('workOrder.actions.edit') }}
            </el-button>
            <el-dropdown trigger="click" @command="handleHeaderAction">
              <el-button type="text" size="default" class="action-button">
                <el-icon class="rotated-icon"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="share">
                    <el-icon><Share /></el-icon>
                    {{ $t('workOrder.actions.share') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    {{ $t('workOrder.actions.export') }}
                  </el-dropdown-item>
                  <StartWorkOrderAction :work-order="workOrder" @start="handleStartWorkOrder" />
                  <el-dropdown-item command="delete" divided class="delete-item">
                    <el-icon><Delete /></el-icon>
                    {{ $t('workOrder.actions.delete') }}
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
          <span class="detail-value">{{ workOrder.state?.name || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="workOrder.code" label="Work Order Code">
          <span class="detail-value work-order-code">{{ workOrder.code }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.priority')">
          <PriorityTag :priority="workOrder.priority" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.assignedTo')">
          <span class="field-value">{{ workOrder.created_by || 'Unassigned' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Updated By">
          <span class="field-value">{{ workOrder.updated_by || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.workType')">
          <WorkTypeTag :work-type="workOrder.work_type" />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.category')">
          <div class="category-tag-list" v-if="categoryTags.length">
            <CategoryTag v-for="category in categoryTags" :key="categoryKey(category)" :category="category" />
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.estimatedTime')">
          <span class="detail-value">
            {{ workOrder.estimated_minutes ? `${workOrder.estimated_minutes} min` : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item v-if="workOrder.vendor_ids?.length" label="Vendors">
          <span class="detail-value">{{ workOrder.vendor_ids.join(', ') }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="workOrder.request" label="Related Request">
          <span class="detail-value linked-value" @click="viewRequest(workOrder.request)">
            {{ workOrder.request.name }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Dates Section -->
    <div class="detail-section dates-section">
      <el-descriptions :column="4" class="dates-descriptions">
        <el-descriptions-item label="Start Date">
          <span class="detail-value">
            {{ workOrder.start_date ? formatDate(workOrder.start_date) : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="End Date">
          <span class="detail-value">
            {{ workOrder.end_date ? formatDate(workOrder.end_date) : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.table.dueDate')">
          <span class="detail-value" :class="{ incomplete: isIncomplete }">
            {{ workOrder.due_date ? formatDate(workOrder.due_date) : '-' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="Recurrence Type">
          <div class="recurrence-value-container">
            <div class="recurrence-value-container">
              <span
                class="detail-value"
                :class="{ 'recurrence-clickable': isRecurring }"
                v-if="isRecurring"
                @click="openTimelineModal"
                :style="{ cursor: isRecurring ? 'pointer' : 'default' }"
              >
                {{ workOrder.recurrence_type.name }}
              </span>
              <span v-else class="detail-value">
                {{ workOrder.recurrence_type.name }}
              </span>
              <el-icon v-if="isRecurring" class="timeline-icon" @click="openTimelineModal">
                <View />
              </el-icon>
            </div>
          </div>
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

    <!-- Related Equipment Section -->
    <div class="detail-section" v-if="workOrder.equipment_node_ids?.length">
      <el-divider />
      <h3 class="section-title">Related Equipment</h3>
      <div v-if="loadingEquipment" class="loading-container">
        <el-skeleton :rows="2" animated />
      </div>
      <div v-else-if="hasValidEquipment" class="equipment-grid">
        <el-tooltip
          v-for="equipment in validEquipmentList"
          :key="`equipment-${equipment.id}-${equipment.name}`"
          effect="light"
          placement="top"
          popper-class="equipment-tooltip-popper"
        >
          <template #content>
            <div class="equipment-tooltip">
              <div v-if="equipment.manufacturer"><strong>Manufacturer:</strong> {{ equipment.manufacturer.name }}</div>
              <div v-if="equipment.location?.name"><strong>Location:</strong> {{ equipment.location.name }}</div>
              <div v-if="equipment.person_in_charge">
                <strong>Person in Charge:</strong> {{ equipment.person_in_charge }}
              </div>
              <div v-if="!equipment.manufacturer && !equipment.location?.name && !equipment.person_in_charge">
                No additional details available
              </div>
            </div>
          </template>
          <div class="equipment-card" @click="handleEquipmentClick(equipment)">
            <div class="equipment-image">
              <el-image
                v-if="equipment.image_list?.length"
                :src="equipment.image_list[0]"
                fit="cover"
                class="equipment-thumbnail"
              >
                <template #error>
                  <div class="equipment-icon">
                    <el-icon><Tools /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-else class="equipment-icon">
                <el-icon><Tools /></el-icon>
              </div>
            </div>
            <div class="equipment-info">
              <div class="equipment-name">{{ equipment.name || `Equipment ${equipment.id}` }}</div>
              <div class="equipment-code">Code : {{ equipment.code }}</div>
            </div>
          </div>
        </el-tooltip>
      </div>
      <div v-else class="no-equipment">
        <el-empty description="No equipment details available" :image-size="60" />
      </div>
    </div>

    <!-- Work Order Progress Section -->
    <div class="detail-section" v-if="workOrderProgress">
      <el-divider />
      <div class="progress-header">
        <h3 class="section-title">Task Progress</h3>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Total Tasks:</span>
            <span class="stat-value">{{ workOrderProgress.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Completed:</span>
            <span class="stat-value completed">{{ workOrderProgress.completed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Failed:</span>
            <span class="stat-value failed">{{ workOrderProgress.failed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Remaining:</span>
            <span class="stat-value">{{ workOrderProgress.remaining }}</span>
          </div>
        </div>
      </div>
      <div class="progress-section">
        <div class="progress-bar-container">
          <div class="custom-progress-bar">
            <div
              class="progress-segment completed"
              :style="{ width: `${(workOrderProgress.completed / workOrderProgress.total) * 100}%` }"
            ></div>
            <div
              class="progress-segment failed"
              :style="{ width: `${(workOrderProgress.failed / workOrderProgress.total) * 100}%` }"
            ></div>
            <div
              class="progress-segment remaining"
              :style="{ width: `${(workOrderProgress.remaining / workOrderProgress.total) * 100}%` }"
            ></div>
          </div>
          <div class="progress-text">
            {{ workOrderProgress.completed }} of {{ workOrderProgress.total }} tasks completed
          </div>
        </div>
      </div>
    </div>

    <!-- Attachments Section - Following equipment details pattern -->
    <div class="detail-section" v-if="hasAttachments || hasFileAttachments">
      <el-divider />

      <!-- Images Section -->
      <div v-if="hasAttachments" class="images-section">
        <el-descriptions :column="1">
          <el-descriptions-item label="Images">
            <div class="image-gallery">
              <el-image
                v-for="(imagePath, index) in workOrder.image_list"
                :key="index"
                :src="imagePath"
                :preview-src-list="workOrder.image_list"
                fit="cover"
                class="workorder-image"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Files Section -->
      <div v-if="hasFileAttachments" class="files-section">
        <el-descriptions :column="1" direction="vertical">
          <el-descriptions-item label="Files">
            <div class="file-list">
              <div v-for="file in processedFileList" :key="file.id || file.name" class="file-item">
                <el-link :href="file.url" target="_blank" :icon="getFileIcon(file.type)" class="file-link">
                  {{ file.name }}
                </el-link>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- Schedule Conditions Section -->
    <div v-if="isRecurring" class="detail-section schedule-conditions-section" v-show="false">
      <el-divider />
      <div class="schedule-header" ref="scheduleSection">
        <h3 class="section-title">{{ $t('workOrder.schedule.title') }}</h3>
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

      <!-- Schedule Details -->
      <el-descriptions :column="4" class="general-details-descriptions" style="margin-left: 4px !important">
        <el-descriptions-item :label="$t('workOrder.schedule.repeatTypeLabel')">
          <span class="detail-value">{{ $t('workOrder.schedule.timeBased') }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.schedule.frequencyLabel')">
          <span class="detail-value">{{ $t('workOrder.schedule.weeklyPattern') }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('workOrder.schedule.continuedFromLabel')">
          <span class="detail-value linked-value" @click="navigateToLinkedOrder">Daily Wash - Washin Washer</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Time & Cost Tracking Card -->
    <div class="detail-section time-cost-tracking-card">
      <!-- Tracking Tabs -->
      <el-tabs v-model="activeTrackingTab" class="tracking-tabs">
        <!-- Tasks Tab -->
        <el-tab-pane label="Tasks" name="tasks">
          <div class="tab-content">
            <div class="tasks-container" :class="{ 'no-tasks': !taskEntries.length }">
              <!-- Filter Bar -->
              <div v-if="taskEntries.length" class="tasks-filter-bar">
                <el-input
                  v-model="searchInput"
                  placeholder="Search by task name or code"
                  clearable
                  class="filter-search"
                  size="default"
                  @input="handleSearchInput"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select
                  v-model="taskFilters.state"
                  placeholder="State"
                  clearable
                  class="filter-select"
                  size="default"
                >
                  <el-option label="Ready" value="Ready" />
                  <el-option label="In progress" value="In progress" />
                  <el-option label="Completed" value="Completed" />
                  <el-option label="Failed" value="Failed" />
                </el-select>
                <el-select
                  v-model="taskFilters.assignee"
                  placeholder="Personnel"
                  clearable
                  class="filter-select"
                  size="default"
                >
                  <el-option
                    v-for="assignee in uniqueAssignees"
                    :key="assignee"
                    :label="assignee"
                    :value="assignee"
                  />
                </el-select>
                <el-select
                  v-model="taskFilters.timeSpent"
                  placeholder="Time spent"
                  clearable
                  class="filter-select"
                  size="default"
                >
                  <el-option label="Less than 15 min" value="lt15" />
                  <el-option label="15 - 30 min" value="15to30" />
                  <el-option label="More than 30 min" value="gt30" />
                </el-select>
              </div>

              <!-- Tasks List -->
              <div v-if="filteredTaskEntries.length" class="tasks-list">
                <WorkOrderTaskCard
                  v-for="(task, index) in filteredTaskEntries"
                  :key="task.id || index"
                  :task="task"
                  @preview="handleTaskPreview"
                  class="task-card"
                />
              </div>
              <div v-else-if="taskEntries.length && !filteredTaskEntries.length" class="no-data-placeholder">
                <el-empty description="No tasks match the filters" :image-size="120" />
              </div>
              <div v-else class="no-data-placeholder">
                <el-empty description="No Tasks" :image-size="120" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Standards Tab -->
        <el-tab-pane label="Standards" name="standards">
          <div class="tab-content">
            <div class="standards-container" :class="{ 'no-standards': !workOrder.standards?.length }">
              <div v-if="workOrder.standards?.length" class="standards-list">
                <div
                  v-for="standard in workOrder.standards"
                  :key="standard.id"
                  class="standard-item standard-card"
                  @click="handleStandardPreview(standard)"
                >
                  <div class="standard-header">
                    <span class="standard-name">{{ standard.name }}</span>
                    <span class="standard-code">{{ standard.code }}</span>
                  </div>
                  <!--                  <div v-if="standard.description" class="standard-description">{{ standard.description }}</div>-->
                  <div class="standard-tags">
                    <el-tag v-if="standard.category" size="small" class="tag-item">
                      {{ formatCategoryName(standard.category) }}
                    </el-tag>
                    <el-tag v-if="standard.library_instance == false" size="small" type="success" class="tag-item">
                      Work Order Only
                    </el-tag>
                  </div>
                </div>
              </div>
              <div v-else class="no-data-placeholder">
                <el-empty description="No Standards" :image-size="120" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Costs Tab -->
<!--        <el-tab-pane label="Costs" name="costs">-->
<!--          <div class="tab-content">-->
<!--            <div class="no-data-placeholder">-->
<!--              <el-empty description="No Cost Data" :image-size="120" />-->
<!--            </div>-->
<!--          </div>-->
<!--        </el-tab-pane>-->
      </el-tabs>
    </div>

    <!-- Work Order Timeline Modal -->
    <el-dialog
      v-model="timelineModalVisible"
      :title="$t('workOrder.timeline.title')"
      width="850px"
      :before-close="handleTimelineModalClose"
      top="10vh"
      class="timeline-modal"
    >
      <div v-if="timelineLoading" class="timeline-loading">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="!isRecurring" class="timeline-empty">
        <el-empty description="This work order does not have recurring instances" :image-size="80" />
      </div>
      <div v-else-if="timelineEvents.length === 0" class="timeline-empty">
        <el-empty description="No recurring work orders found" :image-size="80" />
      </div>
      <Timeline v-else :timeline-events="timelineEvents" :current-work-order-id="workOrder.id" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="timelineModalVisible = false" style="margin-right: 12px">{{
            $t('workOrder.actions.cancel')
          }}</el-button>
          <el-dropdown @command="handleExportFormat" :disabled="timelineEvents.length === 0">
            <el-button type="primary" :disabled="timelineEvents.length === 0">
              <el-icon style="margin-right: 8px"><Download /></el-icon>
              {{ $t('workOrder.timeline.export') }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="csv">
                  <el-icon><DocumentCopy /></el-icon>
                  Export as CSV
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Modal for Recurring Work Orders -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="Delete Work Order"
      width="480px"
      :before-close="() => (deleteDialogVisible = false)"
      class="delete-dialog"
    >
      <div class="delete-dialog-content">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <div class="delete-message">
          <h4>This is a recurring work order</h4>
          <p>Choose which work orders you want to delete:</p>
        </div>
      </div>

      <template #footer>
        <div class="delete-dialog-footer">
          <el-button @click="deleteDialogVisible = false" :disabled="deleting"> Cancel </el-button>
          <el-button type="warning" @click="handleDeleteConfirmation('individual')" :loading="deleting">
            <el-icon><DocumentDelete /></el-icon>
            Individual
          </el-button>
          <el-button type="danger" @click="handleDeleteConfirmation('recurrence')" :loading="deleting">
            <el-icon><DocumentDelete /></el-icon>
            Recurrence
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

  <!-- Task Preview Dialog -->
  <el-dialog
    v-model="showTaskPreviewDialog"
    :title="`Task Details: ${
      selectedTaskForPreview?.task_name ||
      selectedTaskForPreview?.name ||
      selectedTaskForPreview?.taskListText ||
      'Task'
    }`"
    width="1000px"
    :before-close="handleTaskPreviewClose"
    class="task-preview-modal"
    top="10vh"
    style="height: 75vh"
  >
    <!-- Tabs for Logs and Steps -->
    <el-tabs v-model="activeTaskPreviewTab" class="task-preview-tabs">
      <!-- Logs Tab -->
      <el-tab-pane label="Logs" name="logs">
        <TaskLogsView
          v-if="showTaskPreviewDialog && selectedTaskForPreview?.id"
          :task-entry-id="selectedTaskForPreview.id"
          :task="selectedTaskForPreview"
        />
      </el-tab-pane>

      <!-- Steps Tab -->
      <el-tab-pane label="Steps Template" name="steps">
        <StepsPreview
          v-if="showTaskPreviewDialog"
          :key="selectedTaskTemplateId || selectedTaskForPreview?.id || 'task-preview'"
          :template-id="selectedTaskTemplateId"
          :steps="selectedTaskSteps"
          :interactive="false"
          :show-mode-switch="false"
          style="height: 53vh !important; overflow-y: auto"
        />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="preview-dialog-footer">
        <el-button @click="handleTaskPreviewClose">Close</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- Standard Preview Dialog -->
  <el-dialog
    v-model="showStandardPreviewDialog"
    :title="`Preview: ${previewStandardData?.name || 'Standard'}`"
    width="700px"
    top="5vh"
    class="preview-dialog"
  >
    <StandardsPreview
      v-if="showStandardPreviewDialog && previewStandardData && !previewStandardData.isStandalone"
      :standard-id="previewStandardData.standardId || previewStandardData.id"
    />
    <!-- Standalone Standard Preview -->
    <div
      v-else-if="showStandardPreviewDialog && previewStandardData && previewStandardData.isStandalone"
      class="standalone-standard-preview"
    >
      <div class="standard-details">
        <!-- Fixed Header Section -->
        <div class="fixed-header-section">
          <div class="standard-tabs-header">
            <el-tabs v-model="standalonePreviewTab" class="details-tabs">
              <el-tab-pane label="General" name="general"></el-tab-pane>
              <el-tab-pane label="Standard Rules" name="rules"></el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="scrollable-content">
          <div class="tab-content-wrapper">
            <!-- General Tab Content -->
            <div v-if="standalonePreviewTab === 'general'" class="tab-pane-content">
              <div class="overview-card">
                <div class="card-content">
                  <el-descriptions :column="2" direction="vertical">
                    <el-descriptions-item width="50%" label="Category">
                      {{ previewStandardData.category || 'Uncategorized' }}
                    </el-descriptions-item>
                    <el-descriptions-item width="50%" label="Total Rules">
                      <span class="info-value highlight">{{ previewStandardData.items?.length || 0 }} rules</span>
                    </el-descriptions-item>
                    <el-descriptions-item width="50%" label="Type">
                      <el-tag type="primary" size="small">Work Order Only</el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>

              <div class="description-card" v-if="previewStandardData.description">
                <div class="card-header">
                  <h3 class="card-title">Description</h3>
                </div>
                <div class="card-content">
                  <div class="description-text">
                    {{ previewStandardData.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Standard Rules Tab Content -->
            <div v-if="standalonePreviewTab === 'rules'" class="tab-pane-content">
              <div v-if="previewStandardData.items && previewStandardData.items.length > 0" class="rules-list">
                <div class="card-header">
                  <h3 class="card-title">Standard Rules</h3>
                  <el-tag type="warning" size="small">Read Only</el-tag>
                </div>
                <div class="rules-container">
                  <div v-for="(rule, index) in previewStandardData.items" :key="index" class="rule-item">
                    <div class="rule-number">{{ index + 1 }}</div>
                    <div class="rule-content">
                      <div class="rule-text">{{ rule }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-rules">
                <el-empty description="No standard rules defined yet" :image-size="60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- Empty State -->
  <div v-if="!workOrder" class="empty-detail">
    <el-empty :description="$t('workOrder.selectWorkOrder')" :image-size="120" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Edit,
  Share,
  Picture,
  Download,
  View,
  MoreFilled,
  Tools,
  Delete,
  Warning,
  Document,
  DocumentDelete,
  VideoCamera,
  Microphone,
  ArrowDown,
  DocumentCopy,
  Search
} from '@element-plus/icons-vue'
import { convertToLocalTime } from '@/utils/datetime'
import { exportTimeline as exportTimelineData, generateTimestampedFilename } from '@/utils/timelineExport'
import { getEquipmentById } from '@/api/equipment'
import { deleteIndividualWorkOrder, deleteRecurrenceWorkOrders, getWorkOrdersByRecurrence } from '@/api/work-order'
import { getTaskEntryById } from '@/api/task-entry'
import PriorityTag from '../Display/PriorityTag.vue'
import WorkTypeTag from '../Display/WorkTypeTag.vue'
import CategoryTag from '../Display/CategoryTag.vue'
import Timeline from '../Timeline/Timeline.vue'
import WorkOrderTaskCard from './WorkOrderTaskCard.vue'
import StepsPreview from '@/components/TaskLibrary/StepsPreview.vue'
import StandardsPreview from '@/components/TaskLibrary/StandardsPreview.vue'
import StartWorkOrderAction from '@/components/WorkOrder/Actions/StartWorkOrderAction.vue'
import TaskLogsView from '@/components/WorkOrder/Logs/TaskLogsView.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Router
const router = useRouter()

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
  'add-parts',
  'add-time',
  'add-costs',
  'view-procedure',
  'add-comment',
  'delete',
  'start-work-order'
] )

// State
const activeTrackingTab = ref( 'tasks' )
const showTaskPreviewDialog = ref( false )
const selectedTaskForPreview = ref( null )
const timelineModalVisible = ref( false )
const equipmentDetails = ref( [] )
const loadingEquipment = ref( false )
const deleteDialogVisible = ref( false )
const deleting = ref( false )
const scheduleSection = ref( null )
const taskEntries = ref( [] )
const taskPreviewLoading = ref( false )
const selectedTaskTemplateId = ref( '' )
const selectedTaskSteps = ref( [] )
const timelineLoading = ref( false )

// Standard preview state
const showStandardPreviewDialog = ref( false )
const previewStandardData = ref( null )
const standalonePreviewTab = ref( 'general' )

// Timeline events data - Populated from recurring work orders
const timelineEvents = ref( [] )

// Task filters
const taskFilters = ref( {
  search : '',
  state : '',
  assignee : '',
  timeSpent : ''
} )

// Task preview tab state
const activeTaskPreviewTab = ref( 'logs' )

// Search input with debounce
const searchInput = ref( '' )
let searchDebounceTimer = null

// Computed
const isIncomplete = computed( () => {
  return props.workOrder?.state?.id === 13 || props.workOrder?.state?.name === 'Incomplete'
} )

const hasAttachments = computed( () => {
  return props.workOrder?.image_list && props.workOrder.image_list.length > 0
} )

const categoryTags = computed( () => {
  const workOrder = props.workOrder
  if ( !workOrder ) return []
  if ( Array.isArray( workOrder.categories ) && workOrder.categories.length ) {
    return workOrder.categories
  }
  if ( Array.isArray( workOrder.category_list ) && workOrder.category_list.length ) {
    return workOrder.category_list
  }
  if ( workOrder.category ) {
    return [workOrder.category]
  }
  return []
} )

const categoryKey = category => {
  if ( category && typeof category === 'object' ) {
    return category.id ?? category.name ?? JSON.stringify( category )
  }
  return category
}

const isRecurring = computed( () => {
  // Check if work order has recurrence (not type 1 which means "Does not repeat")
  const recurrenceType = props.workOrder?.recurrence_type

  if ( !recurrenceType ) {
    return false
  }

  // Debug: log the recurrence type for debugging
  console.log( 'IsRecurring check:', recurrenceType )

  // If it has an id, check if it's not 1 ("Does not repeat")
  if ( recurrenceType.id ) {
    return recurrenceType.id !== 1
  }

  // If it's a string, check if it's not "Does not repeat"
  if ( typeof recurrenceType === 'string' ) {
    return recurrenceType.toLowerCase() !== 'does not repeat' && recurrenceType.toLowerCase() !== 'none'
  }

  // If it's an object with name property
  if ( recurrenceType.name ) {
    return recurrenceType.name.toLowerCase() !== 'does not repeat' && recurrenceType.name.toLowerCase() !== 'none'
  }

  return false
} )

const workOrderProgress = computed( () => {
  const progress = props.workOrder?.work_order_progress
  if ( !progress ) return null

  const total = progress.total_task_amount || 0
  const completed = progress.completed_task_amount || 0
  const failed = progress.failed_task_amount || 0
  const percentage = total > 0 ? Math.round( ( completed / total ) * 100 ) : 0

  return {
    total,
    completed,
    failed,
    percentage,
    remaining : total - completed - failed
  }
} )

const hasFileAttachments = computed( () => {
  return props.workOrder?.file_list && props.workOrder.file_list.length > 0
} )

const validEquipmentList = computed( () => {
  if ( !equipmentDetails.value || !Array.isArray( equipmentDetails.value ) ) {
    return []
  }
  return equipmentDetails.value.filter( eq => eq && eq.id && eq.name )
} )

const hasValidEquipment = computed( () => {
  return validEquipmentList.value.length > 0
} )

// Unique assignees for filter dropdown
const uniqueAssignees = computed( () => {
  const assigneesSet = new Set()

  taskEntries.value.forEach( task => {
    const personnel = task?.personnel
    if ( !personnel ) return

    if ( Array.isArray( personnel ) ) {
      personnel.forEach( p => {
        if ( typeof p === 'string' && p ) assigneesSet.add( p )
        if ( typeof p === 'object' && p.name ) assigneesSet.add( p.name )
      } )
    } else if ( typeof personnel === 'object' && personnel.name ) {
      assigneesSet.add( personnel.name )
    } else if ( typeof personnel === 'string' && personnel ) {
      assigneesSet.add( personnel )
    }
  } )

  return Array.from( assigneesSet ).sort()
} )

// Filtered task entries
const filteredTaskEntries = computed( () => {
  let filtered = taskEntries.value

  // Filter by search
  if ( taskFilters.value.search ) {
    const searchLower = taskFilters.value.search.toLowerCase()
    filtered = filtered.filter( task => {
      const name = task.name || task.task_name || task.label || task.taskListText || ''
      const id = task.id || ''
      return name.toLowerCase().includes( searchLower ) || String( id ).toLowerCase().includes( searchLower )
    } )
  }

  // Filter by state
  if ( taskFilters.value.state ) {
    filtered = filtered.filter( task => {
      const stateName = task?.state?.name || ''
      return stateName.toLowerCase() === taskFilters.value.state.toLowerCase()
    } )
  }

  // Filter by assignee
  if ( taskFilters.value.assignee ) {
    filtered = filtered.filter( task => {
      const personnel = task?.personnel
      if ( !personnel ) return false

      if ( Array.isArray( personnel ) ) {
        return personnel.some( p => {
          const name = typeof p === 'string' ? p : p?.name || ''
          return name === taskFilters.value.assignee
        } )
      } else if ( typeof personnel === 'object' && personnel.name ) {
        return personnel.name === taskFilters.value.assignee
      } else if ( typeof personnel === 'string' ) {
        return personnel === taskFilters.value.assignee
      }

      return false
    } )
  }

  // Filter by time spent
  if ( taskFilters.value.timeSpent ) {
    filtered = filtered.filter( task => {
      const timeTakenSec = task?.time_taken_sec || 0
      const minutes = Math.round( timeTakenSec / 60 )

      switch ( taskFilters.value.timeSpent ) {
        case 'lt15':
          return minutes < 15
        case '15to30':
          return minutes >= 15 && minutes <= 30
        case 'gt30':
          return minutes > 30
        default:
          return true
      }
    } )
  }

  return filtered
} )

// Process file list to match equipment details pattern
const processedFileList = computed( () => {
  if ( !props.workOrder?.file_list || !Array.isArray( props.workOrder.file_list ) ) {
    return []
  }

  return props.workOrder.file_list.map( ( url, index ) => {
    const urlParts = url.split( '/' )
    const filename = urlParts[urlParts.length - 1] || `file_${index + 1}`

    // Clean filename by removing timestamp prefixes
    const cleanFilename = filename.replace( /\d{17}/, '' )

    return {
      id : index,
      name : decodeURIComponent( cleanFilename ),
      url,
      type : getFileTypeFromName( cleanFilename )
    }
  } )
} )

const normalizeTaskList = taskList => {
  if ( !Array.isArray( taskList ) ) {
    taskEntries.value = []
    return
  }

  const existingEntriesMap = new Map(
    Array.isArray( taskEntries.value ) ? taskEntries.value.map( entry => [entry.id, entry] ) : []
  )

  taskEntries.value = taskList.map( ( item, index ) => {
    if ( typeof item === 'string' || typeof item === 'number' ) {
      const id = String( item ).trim()
      const label = String( item )
      const lookupKey = id || `task-${index}`
      const existing = existingEntriesMap.get( lookupKey )

      if ( existing ) {
        return {
          ...existing,
          id : lookupKey,
          label,
          taskListText : label,
          hasValidId : Boolean( id ),
          index
        }
      }

      return {
        id : lookupKey,
        label,
        taskListText : label,
        hasValidId : Boolean( id ),
        index
      }
    }

    if ( item && typeof item === 'object' && !Array.isArray( item ) ) {
      const rawId = item.id || item._id || item.task_id || item.taskId || item.reference_id || ''
      const id = String( rawId ).trim()
      const labelCandidate = item.task_list_text || item.taskListText || item.task_name || item.name || id || ''

      const label = labelCandidate || `Task ${index + 1}`
      const lookupKey = id || `task-${index}`
      const existing = existingEntriesMap.get( lookupKey )

      if ( existing ) {
        return {
          ...existing,
          ...item, // Preserve all original task data
          id : lookupKey,
          label,
          taskListText : label,
          hasValidId : Boolean( id ),
          index
        }
      }

      return {
        ...item, // Preserve all original task data including category, equipment_node, time_estimate_sec, etc.
        id : lookupKey,
        label,
        taskListText : label,
        hasValidId : Boolean( id ),
        index
      }
    }

    return {
      id : `task-${index}`,
      label : `Task ${index + 1}`,
      taskListText : `Task ${index + 1}`,
      hasValidId : false,
      index
    }
  } )
}

const resetTaskState = () => {
  taskEntries.value = []
  selectedTaskTemplateId.value = ''
  selectedTaskForPreview.value = null
  selectedTaskSteps.value = []
  taskPreviewLoading.value = false
  showTaskPreviewDialog.value = false
  selectedTaskSteps.value = []
}

const resolveTaskTemplateId = task => {
  if ( !task || typeof task !== 'object' ) {
    return ''
  }

  return task.template_id || task.templateId || task.templateID || ''
}

// Equipment loading function
const loadEquipmentDetails = async() => {
  if ( !props.workOrder?.equipment_node_ids?.length ) {
    equipmentDetails.value = []
    return
  }

  try {
    loadingEquipment.value = true
    const equipmentPromises = props.workOrder.equipment_node_ids.map( id =>
      getEquipmentById( id ).catch( error => {
        console.warn( `Failed to load equipment ${id}:`, error )
        return null
      } )
    )

    const results = await Promise.all( equipmentPromises )
    equipmentDetails.value = results
      .filter( result => result?.data && result.data.id )
      .map( result => ( {
        ...result.data,
        // Ensure we have fallback values for required fields
        id : result.data.id,
        name : result.data.name || `Equipment ${result.data.id}`,
        manufacturer : result.data.manufacturer || null,
        location : result.data.location || null,
        person_in_charge : result.data.person_in_charge || null,
        image_list : result.data.image_list || [],
        type : result.data.type || result.data.equipment_type || 'Equipment'
      } ) )
  } catch ( error ) {
    console.error( 'Failed to load equipment details:', error )
    equipmentDetails.value = []
  } finally {
    loadingEquipment.value = false
  }
}

// Watchers
watch(
  () => props.workOrder,
  newWorkOrder => {
    if ( newWorkOrder ) {
      // Load equipment details when work order changes
      loadEquipmentDetails()
      resetTaskState()
      normalizeTaskList( newWorkOrder.task_list )
    } else {
      resetTaskState()
    }
  },
  { immediate : true }
)

watch(
  () => props.workOrder?.task_list,
  newTaskList => {
    if ( props.workOrder ) {
      selectedTaskTemplateId.value = ''
      selectedTaskForPreview.value = null
      showTaskPreviewDialog.value = false
      selectedTaskSteps.value = []
      normalizeTaskList( newTaskList )
    } else {
      resetTaskState()
    }
  }
)

// Methods
const formatDate = ( dateString, use25HourFormat = false ) => {
  if ( !dateString ) return '-'

  if ( use25HourFormat ) {
    // 25-hour format (00:00 - 24:59)
    const date = new Date( dateString )
    const year = date.getFullYear()
    const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
    const day = String( date.getDate() ).padStart( 2, '0' )
    let hours = date.getHours()
    const minutes = String( date.getMinutes() ).padStart( 2, '0' )

    // Convert to 25-hour format where 24:xx represents the next day's midnight hour
    if ( hours === 0 && date.getDate() !== new Date( dateString ).getDate() ) {
      hours = 24
    }

    const formattedHours = String( hours ).padStart( 2, '0' )
    return `${year}-${month}-${day} ${formattedHours}:${minutes}`
  }

  return convertToLocalTime( dateString )
}

const handleStartWorkOrder = () => {
  emit( 'start-work-order', props.workOrder )
}

const handleHeaderAction = action => {
  switch ( action ) {
    case 'start':
      handleStartWorkOrder()
      break
    case 'edit':
      emit( 'edit', props.workOrder )
      break
    case 'share':
      emit( 'share', props.workOrder )
      break
    case 'export':
      emit( 'export', props.workOrder )
      break
    case 'delete':
      handleDeleteWorkOrder()
      break
    default:
      console.warn( `Unhandled header action: ${action}` )
  }
}

// Delete methods
const handleDeleteWorkOrder = () => {
  if ( isRecurring.value ) {
    // For recurring work orders, show confirmation dialog with two options
    deleteDialogVisible.value = true
  } else {
    // For non-recurring work orders, show simple confirmation
    ElMessageBox.confirm(
      'This action will permanently delete this work order. This cannot be undone.',
      'Delete Work Order',
      {
        confirmButtonText : 'Delete',
        cancelButtonText : 'Cancel',
        type : 'warning',
        confirmButtonClass : 'el-button--danger'
      }
    )
      .then( async() => {
        await performDeleteIndividual()
      } )
      .catch( () => {
        // User cancelled
      } )
  }
}

const performDeleteIndividual = async() => {
  try {
    deleting.value = true
    await deleteIndividualWorkOrder( props.workOrder.id )
    ElMessage.success( 'Work order deleted successfully' )
    emit( 'delete', { workOrder : props.workOrder, type : 'individual' } )
  } catch ( error ) {
    console.error( 'Failed to delete work order:', error )
    ElMessage.error( 'Failed to delete work order' )
  } finally {
    deleting.value = false
  }
}

const performDeleteRecurrence = async() => {
  try {
    deleting.value = true
    await deleteRecurrenceWorkOrders( props.workOrder.recurrence_uuid )
    ElMessage.success( 'All recurring work orders deleted successfully' )
    emit( 'delete', { workOrder : props.workOrder, type : 'recurrence' } )
    deleteDialogVisible.value = false
  } catch ( error ) {
    console.error( 'Failed to delete recurring work orders:', error )
    ElMessage.error( 'Failed to delete recurring work orders' )
  } finally {
    deleting.value = false
  }
}

const handleDeleteConfirmation = async type => {
  if ( type === 'individual' ) {
    await performDeleteIndividual()
    deleteDialogVisible.value = false
  } else if ( type === 'recurrence' ) {
    await performDeleteRecurrence()
  }
}

// Timeline modal methods
const openTimelineModal = async() => {
  timelineModalVisible.value = true

  // Only fetch timeline data if this is a recurring work order
  if ( !isRecurring.value || !props.workOrder?.recurrence_uuid ) {
    timelineEvents.value = []
    return
  }

  try {
    timelineLoading.value = true
    const response = await getWorkOrdersByRecurrence( props.workOrder.recurrence_uuid, 1, 50 )
    const workOrders = response.data.content || []

    // Transform work orders into timeline events
    timelineEvents.value = transformWorkOrdersToTimeline( workOrders )
  } catch ( error ) {
    console.error( 'Failed to load recurring work orders for timeline:', error )
    ElMessage.error( 'Failed to load timeline data' )
    timelineEvents.value = []
  } finally {
    timelineLoading.value = false
  }
}

const handleTimelineModalClose = () => {
  timelineModalVisible.value = false
}

const handleExportFormat = async format => {
  try {
    if ( !timelineEvents.value || timelineEvents.value.length === 0 ) {
      ElMessage.warning( 'No timeline data available to export' )
      return
    }

    // Generate timestamped filename
    const filename = generateTimestampedFilename( `work-order-${props.workOrder.id}-timeline` )

    // Export with selected format and current work order highlighting
    const result = exportTimelineData( timelineEvents.value, format, filename, {
      currentWorkOrderId : props.workOrder.id,
      sheetName : `Work Order ${props.workOrder.id} Timeline`,
      includeMetadata : true
    } )

    if ( result.success ) {
      ElMessage.success( `${result.message} (${result.recordCount} records)` )
      timelineModalVisible.value = false
    } else {
      ElMessage.error( result.message )
    }
  } catch ( error ) {
    console.error( 'Timeline export failed:', error )
    ElMessage.error( 'Failed to export timeline data' )
  }
}

// Transform work orders into timeline events
const transformWorkOrdersToTimeline = workOrders => {
  if ( !Array.isArray( workOrders ) ) return []

  return workOrders
    .sort( ( a, b ) => new Date( a.start_date || a.created_at ) - new Date( b.start_date || b.created_at ) )
    .map( ( workOrder, index ) => {
      const isCompleted = workOrder.state?.name?.toLowerCase() === 'completed'
      const isInProgress = workOrder.state?.name?.toLowerCase() === 'in progress'
      const isIncomplete = ( workOrder.state?.id === 13 || workOrder.state?.name === 'Incomplete' ) && !isCompleted
      const taskCount = Array.isArray( workOrder.task_list ) ? workOrder.task_list.length : 0

      return {
        id : workOrder.id,
        title : workOrder.name || `Work Order #${workOrder.id}`,
        description : workOrder.description || 'No description provided',
        timestamp : formatDate( workOrder.start_date || workOrder.created_at, true ), // 25-hour format
        type : isIncomplete ? 'danger' : isCompleted ? 'success' : isInProgress ? 'primary' : 'info',
        color : isIncomplete ? '#f56c6c' : isCompleted ? '#67c23a' : isInProgress ? '#409eff' : '#909399',
        icon : 'DocumentChecked',
        hollow : !isCompleted,
        status : workOrder.state?.name || 'Pending',
        isIncomplete,
        dueDate : workOrder.due_date,
        category : workOrder.category || workOrder.categories,
        priority : workOrder.priority,
        taskCount,
        duration : workOrder.estimated_minutes ? `${workOrder.estimated_minutes}m` : null,
        plannedEnd : workOrder.due_date,
        actualEnd : workOrder.finished_at,
        assignees : workOrder.created_by
          ? [
            {
              id : 1,
              name : String( workOrder.created_by ).trim() || 'Unknown',
              avatar : ''
            }
          ]
          : []
      }
    } )
}

// Task preview handlers
const handleTaskPreview = async task => {
  if ( !task || !task.id || task.hasValidId === false ) {
    ElMessage.warning( 'Task preview is unavailable for this entry.' )
    return
  }

  const openPreview = ( taskData, templateId = '', steps = [] ) => {
    const normalizedTemplateId = templateId || ''
    const normalizedSteps = Array.isArray( steps ) ? steps : []

    if ( !normalizedTemplateId && normalizedSteps.length === 0 ) {
      ElMessage.warning( 'Task preview is unavailable for this entry.' )
      return false
    }

    selectedTaskForPreview.value = taskData
    selectedTaskTemplateId.value = normalizedTemplateId
    selectedTaskSteps.value = normalizedSteps.map( step => ( { ...step } ) )
    showTaskPreviewDialog.value = true
    return true
  }

  if ( task.cachedTask ) {
    const cachedTemplateId = task.cachedTemplateId || resolveTaskTemplateId( task.cachedTask ) || ''
    const cachedSteps = Array.isArray( task.cachedTask.steps ) ? task.cachedTask.steps : []

    if ( openPreview( task.cachedTask, cachedTemplateId, cachedSteps ) ) {
      return
    }
  }

  if ( taskPreviewLoading.value ) {
    return
  }

  selectedTaskTemplateId.value = ''
  selectedTaskForPreview.value = null
  selectedTaskSteps.value = []

  try {
    taskPreviewLoading.value = true
    const response = await getTaskEntryById( task.id )
    const taskData = response?.data

    if ( !taskData ) {
      ElMessage.error( 'Failed to load task details.' )
      return
    }

    if ( task.taskListText || task.label ) {
      taskData.taskListText = task.taskListText || task.label
    }

    const templateId = resolveTaskTemplateId( taskData ) || ''
    const steps = Array.isArray( taskData.steps ) ? taskData.steps : []

    if ( !openPreview( taskData, templateId, steps ) ) {
      return
    }

    const entryIndex = taskEntries.value.findIndex( entry => entry.id === task.id )
    if ( entryIndex !== -1 ) {
      const updatedEntry = {
        ...taskEntries.value[entryIndex],
        cachedTask : taskData,
        cachedTemplateId : templateId,
        hasValidId : true
      }
      taskEntries.value.splice( entryIndex, 1, updatedEntry )
    }
  } catch ( error ) {
    console.error( 'Failed to load task preview:', error )
    ElMessage.error( 'Failed to load task preview.' )
  } finally {
    taskPreviewLoading.value = false
  }
}

const handleTaskPreviewClose = () => {
  showTaskPreviewDialog.value = false
  selectedTaskForPreview.value = null
  selectedTaskTemplateId.value = ''
  taskPreviewLoading.value = false
  selectedTaskSteps.value = []
  activeTaskPreviewTab.value = 'logs' // Reset to default tab
}

// Standard preview handlers
const handleStandardPreview = standardData => {
  previewStandardData.value = standardData
  showStandardPreviewDialog.value = true
}

// Utility function to format category names
const formatCategoryName = category => {
  if ( !category ) return ''
  // Convert kebab-case or snake_case to Title Case
  return category
    .split( /[-_]/ )
    .map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase() )
    .join( ' ' )
}

const navigateToLinkedOrder = () => {
  ElMessage.info( 'Navigation to linked work order will be implemented by Yellow Guy' )
}

// File helper functions following equipment details pattern
const getFileIcon = fileType => {
  switch ( fileType?.toLowerCase() ) {
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return Picture
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return VideoCamera
    case 'audio':
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return Microphone
    case 'pdf':
    case 'document':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return Document
    case 'download':
    case 'zip':
    case 'rar':
    case '7z':
      return Download
    default:
      return Document
  }
}

const getFileTypeFromName = fileName => {
  if ( !fileName ) return 'document'

  const extension = fileName.split( '.' ).pop()?.toLowerCase()

  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg']
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz']

  if ( imageTypes.includes( extension ) ) return 'image'
  if ( videoTypes.includes( extension ) ) return 'video'
  if ( audioTypes.includes( extension ) ) return 'audio'
  if ( archiveTypes.includes( extension ) ) return 'download'

  return 'document'
}

const viewRequest = request => {
  ElMessage.info( `Navigation to request ${request.name} will be implemented` )
}

const scrollToScheduleSection = () => {
  if ( scheduleSection.value ) {
    scheduleSection.value.scrollIntoView( { behavior : 'smooth', block : 'start' } )
  } else {
    // Fallback: try to find the schedule section by class
    const scheduleElement = document.querySelector( '.schedule-conditions-section .schedule-header' )
    if ( scheduleElement ) {
      scheduleElement.scrollIntoView( { behavior : 'smooth', block : 'start' } )
    } else {
      console.warn( 'Schedule section not found for scrolling' )
    }
  }
}

const handleEquipmentClick = equipment => {
  if ( !equipment?.id ) {
    ElMessage.warning( 'Equipment information is not available' )
    return
  }

  // Navigate to maintenance equipment page with equipment ID as query parameter
  router.push( {
    path : '/maintenance/equipment',
    query : { equipmentId : equipment.id }
  } )
}

// Handle search input with debounce (300ms)
const handleSearchInput = value => {
  if ( searchDebounceTimer ) {
    clearTimeout( searchDebounceTimer )
  }

  searchDebounceTimer = setTimeout( () => {
    taskFilters.value.search = value
  }, 300 )
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
  position: relative;
}

.detail-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  z-index: 10;

  .header-main {
    .title-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 8px;

      .detail-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
        line-height: 1.4;
      }

      .work-order-id {
        color: var(--el-color-primary);
        font-weight: 500;
        font-size: 14px;
      }
    }

    .meta-info {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      flex-wrap: wrap;
    }

    .header-meta {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      flex-wrap: wrap;

      .work-order-code {
        color: var(--el-color-success);
        font-weight: 500;
      }

      .linked-value {
        color: var(--el-color-primary);
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--el-color-primary-dark-2);
          text-decoration: underline;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    align-items: center;

    .edit-button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

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
    margin: 36px 0px;
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
      width: 100%;
      table-layout: fixed;
    }

    :deep(.el-descriptions__cell) {
      padding: 0 24px 12px 0;
      border: none;
      vertical-align: top;
      width: 25%;

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

  // Dates section specific styling
  .dates-descriptions {
    :deep(.el-descriptions__table) {
      border: none;
      border-collapse: separate;
      border-spacing: 0 16px;
      width: 100%;
      table-layout: fixed;
      margin-top: -10px;
    }

    :deep(.el-descriptions__cell) {
      padding: 0 24px 0 0;
      border: none;
      vertical-align: top;
      width: 25%;

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
      line-height: 1.4;

      .recurrence-clickable {
        color: var(--el-color-primary) !important;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;

        &:hover {
          color: var(--el-color-primary-dark-2) !important;
          text-decoration: underline;
          transform: translateY(-1px);
        }
      }
    }
  }
}

.category-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

      &.incomplete {
        color: var(--el-color-danger);
        font-weight: 500;
      }
    }
  }
}

// Recurrence value container styling
.recurrence-value-container {
  display: flex;
  align-items: center;
  gap: 8px;

  .timeline-icon {
    font-size: 16px;
    color: var(--el-color-primary);
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s ease;

    &:hover {
      opacity: 1;
      color: var(--el-color-primary-dark-2);
      transform: scale(1.1);
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

// Schedule Conditions Section
.schedule-conditions-section {
  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;

    .timeline-button {
      font-size: 13px;
      font-weight: 500;
      padding: 8px 12px;

      &:hover {
        background-color: var(--el-color-primary-light-8);
        border-color: var(--el-color-primary-light-3);
        color: var(--el-color-primary-dark-2);
      }

      .el-icon {
        margin-right: 6px;
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

  .timeline-loading,
  .timeline-empty {
    padding: 40px 20px;
    text-align: center;
  }
}

// Time & Cost Tracking Card
.time-cost-tracking-card {
  margin-top: 36px;
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

.empty-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

// Work Order Progress Styles
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0px;
  flex-wrap: wrap;
  gap: 16px;

  .section-title {
    margin: 0;
    flex-shrink: 0;
  }

  .progress-stats {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;

      .stat-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);

        &.completed {
          color: var(--el-color-success);
        }

        &.failed {
          color: var(--el-color-danger);
        }
      }
    }
  }
}

.progress-section {
  .progress-bar-container {
    margin: 20px 0;

    .custom-progress-bar {
      display: flex;
      height: 12px;
      border-radius: 100px;
      overflow: hidden;
      background-color: var(--el-fill-color-light);

      .progress-segment {
        height: 100%;
        transition: width 0.3s ease;

        &.completed {
          background-color: var(--el-color-primary);
        }

        &.failed {
          background-color: var(--el-color-danger);
        }

        &.remaining {
          background-color: var(--el-fill-color-light);
        }
      }
    }

    .progress-text {
      text-align: center;
      font-size: 15px;
      color: var(--el-text-color-secondary);
      margin: 24px 0;
    }
  }
}

// Equipment Grid Styles
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 48px;

  .equipment-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    background: var(--el-bg-color);
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .equipment-image,
    .equipment-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .equipment-icon {
      background: var(--el-color-primary-light-9);

      .el-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }
    }

    .equipment-thumbnail {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .equipment-info {
      flex: 1;
      margin-left: 12px;

      .equipment-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .equipment-code {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// Equipment Tooltip Styles
.equipment-tooltip {
  padding: 6px 12px;
  background: white !important;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 280px;

  div {
    margin-bottom: 8px;
    color: var(--el-text-color-primary);

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      margin-right: 8px;
      color: var(--el-text-color-regular);
      font-weight: 600;
    }
  }
}

// File Attachments Styles
.attachments-subsection {
  margin-bottom: 24px;
  margin-left: 4px;

  .subsection-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }
}

.file-list {
  .file-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--el-bg-color);

    .file-icon {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      background: var(--el-color-info-light-9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;

      .el-icon {
        font-size: 16px;
        color: var(--el-color-info);
      }
    }

    .file-info {
      flex: 1;

      .file-name {
        font-size: 14px;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .file-actions {
        .el-button {
          padding: 0;
          font-size: 12px;
        }
      }
    }
  }
}

// Standards and Tasks Lists
.standards-list,
.tasks-list {
  .standard-item,
  .task-item {
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    margin-bottom: 8px;
    background: var(--el-bg-color);
    padding: 12px;
  }
}

.standards-list {
  .standard-item {
    .standard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      margin-left: 4px;

      .standard-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .standard-code {
        font-size: 12px;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        padding: 2px 8px;
        border-radius: 4px;
      }
    }

    .standard-description {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .standard-tags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
      margin-left: 4px;
    }
  }
}

.tasks-list {
  .task-item {
    display: flex;
    align-items: center;

    .task-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--el-color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
      margin-right: 12px;
    }

    .task-info {
      flex: 1;

      .task-id {
        font-size: 14px;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .task-status {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// No Data Placeholder
.no-data-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: 200px;
}

.loading-container {
  padding: 20px;
}

.no-equipment {
  padding: 20px;
  text-align: center;
}

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

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .progress-stats {
      align-self: stretch;
      justify-content: space-between;
      gap: 16px;

      .stat-item {
        min-width: 60px;
      }
    }
  }
}

// Global tooltip styles for equipment tooltips
:deep(.equipment-tooltip-popper) {
  background: white !important;
  border: 1px solid var(--el-border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  padding: 0 !important;

  .el-tooltip__content {
    background: white !important;
    color: var(--el-text-color-primary) !important;
    border-radius: 8px !important;
    padding: 0 !important;
  }

  .el-popper__arrow::before {
    background: white !important;
    border: 1px solid var(--el-border-color) !important;
  }
}

// Delete Item Styles
:deep(.delete-item) {
  color: var(--el-color-danger) !important;

  &:hover {
    background-color: var(--el-color-danger-light-9) !important;
    color: var(--el-color-danger-dark-2) !important;
  }

  .el-icon {
    color: var(--el-color-danger) !important;
  }
}

// Delete Dialog Styles
.delete-dialog {
  :deep(.el-dialog__header) {
    background: var(--el-color-warning-light-9);
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: var(--el-color-warning-dark-2);
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: var(--el-color-warning-dark-2);

        &:hover {
          color: var(--el-color-warning);
        }
      }
    }
  }

  .delete-dialog-content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;

    .warning-icon {
      font-size: 32px;
      color: var(--el-color-warning);
      margin-top: 4px;
    }

    .delete-message {
      flex: 1;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.5;
      }
    }
  }

  .delete-dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .el-button {
      padding: 12px 20px;
      font-weight: 500;

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

// Images and Files sections styling - matching equipment details pattern
.images-section,
.files-section {
  margin-bottom: 20px;

  :deep(.el-descriptions) {
    margin: 0;
  }

  :deep(.el-descriptions__cell) {
    padding: 8px 0;
    border: none;
    vertical-align: top;
  }

  :deep(.el-descriptions__label) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: 600;
    margin-bottom: 8px;
    display: block;
  }

  :deep(.el-descriptions__content) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }
}

.image-gallery {
  display: flex;
  flex-direction: row;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
}

.workorder-image {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f0f9ff;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  text-decoration: none;
  color: var(--el-color-info);

  &:hover {
    color: var(--el-color-primary-dark-2);
  }
}

:deep(.images-section .el-descriptions__label, .files-section .el-descriptions__label) {
  font-weight: 500;
}

:deep(.el-descriptions__label.el-descriptions__cell:not(.is-bordered-label).is-vertical-label) {
  font-weight: 500;
}

// Task Preview Modal
.task-preview-modal {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .task-preview-tabs {
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
  }

  .preview-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;

    .el-button {
      padding: 8px 16px;
      font-weight: 500;
    }
  }

  :deep(.steps-preview-container) {
    padding: 0;
  }
}

// Enhanced Tasks List Styling matching WorkOrderCreate target styles
.tasks-container {
  min-height: 120px;
  flex: 1;
}

.tasks-filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 150px;
}

@media (max-width: 768px) {
  .tasks-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-search,
  .filter-select {
    width: 100%;
  }
}

.standards-container {
  width: 97.5%;
  min-height: 120px;
  flex: 1;
}

.tasks-list,
.standards-list {
  display: flex;
  flex-direction: column;
}

.task-card {
  transition: all 0.2s ease;
}

.standard-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.standard-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tasks-container.no-tasks,
.standards-container.no-standards {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Standalone Standard Preview Styles (matching WorkOrderCreate component)
.standalone-standard-preview {
  padding: 0;
  overflow: visible;

  .standard-details {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .fixed-header-section {
    position: sticky;
    top: 0;
    z-index: 3;
    background: #fff;
  }

  .scrollable-content {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .scrollable-content::-webkit-scrollbar {
    width: 6px;
  }

  .scrollable-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .scrollable-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .details-tabs {
    height: 100%;
  }

  // Card Components - matching StandardsPreview exactly
  .overview-card,
  .description-card {
    background: white;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .card-header {
    padding: 8px 24px 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .card-content {
    padding: 12px 24px 12px 24px;
  }

  .info-value {
    color: #606266;
    font-weight: 200;
    font-size: 14px;
    text-align: right;
    margin-right: 20px;
  }

  .info-value.highlight {
    color: #409eff;
    font-weight: 600;
  }

  // Description Card
  .description-text {
    color: #303133;
    line-height: 1.7;
    font-size: 14px;
    padding: 16px 16px 16px 0px;
    border-radius: 6px;
    max-height: 32vh;
    overflow-y: auto;
  }

  // Rules List - matching StandardsPreview exactly
  .rules-list {
    margin-bottom: 24px;
  }

  .rules-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 24px 24px 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .rule-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.3s ease;
  }

  .rule-item:hover {
    border-color: #409eff;
    background: #f0f7ff;
  }

  .rule-number {
    width: 23px;
    height: 23px;
    background: #409eff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .rule-content {
    flex: 1;
    margin-right: 12px;
  }

  .rule-text {
    color: #303133;
    line-height: 1.6;
    font-size: 14px;
  }

  .empty-rules {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

  // Tab styling matching StandardsPreview
  :deep(.el-tabs__item.is-top) {
    font-size: 16px;
    width: 50%;
  }

  :deep(.el-tabs__nav.is-top) {
    width: 100%;
  }

  // Custom scrollbar for rules container only
  .rules-container::-webkit-scrollbar {
    width: 6px;
  }

  .rules-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .rules-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .rules-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  // Custom scrollbar for description text
  .description-text::-webkit-scrollbar {
    width: 6px;
  }

  .description-text::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .description-text::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .description-text::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}
</style>

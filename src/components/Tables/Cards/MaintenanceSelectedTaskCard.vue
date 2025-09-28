<template>
  <div class="template-card">
    <!-- Card Content -->
    <div class="card-content">
      <!-- Row 1: Title + Kebab Menu -->
      <div class="row-1">
        <div class="title-with-badges">
          <el-text class="card-title" :title="template.name" truncated>
            {{ template.name }}
          </el-text>

          <el-tag v-if="isAdhoc" size="small" type="primary" effect="plain" class="adhoc-tag"> Work Order Only </el-tag>
        </div>

        <!-- Action Icons -->
        <div class="action-icons">
          <el-icon class="view-icon" @click.stop="handlePreview" title="Preview">
            <View />
          </el-icon>
          <el-dropdown class="kebab-dropdown" @click.stop>
            <el-icon class="kebab-icon">
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleEdit">Edit</el-dropdown-item>
                <el-dropdown-item @click="openAssigneeDialog">Assign</el-dropdown-item>
                <el-dropdown-item divided @click="handleDelete">Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Row 2: Tags + Steps -->
      <div class="row-2 card-tags">
        <div class="tags-left">
          <el-tag v-if="categoryLabel" size="small" class="tag-item">
            {{ categoryLabel }}
          </el-tag>

          <el-tag v-if="assetLabel" size="small" type="info" class="tag-item">
            {{ assetLabel }}
          </el-tag>

          <el-tag v-if="template.estimated_minutes" size="small" type="warning" class="tag-item">
            {{ template.estimated_minutes }} min
          </el-tag>
        </div>

        <div class="steps-count">{{ stepsCount }} steps</div>
      </div>

      <!-- Row 3: Assignees Section (only show when there are assignees) -->
      <div v-if="hasAssignees" class="row-3">
        <div class="assignees-section">
          <div class="assignees-header">
            <el-icon class="assignee-icon"><User /></el-icon>
            <span class="assignees-label">Assigned to:</span>
            <div class="assigned-users">
              <el-tag
                v-for="user in assignedUsers"
                :key="user.id"
                size="small"
                closable
                @close="removeAssignee(user.id)"
                type="primary"
                effect="plain"
              >
                {{ user.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { MoreFilled, View, User } from '@element-plus/icons-vue'

const props = defineProps( {
  template : {
    type : Object,
    required : true
  },
  assigneeOptions : {
    type : Array,
    default : () => []
  }
} )

const emit = defineEmits( ['selection', 'assignee-update', 'open-assignee-dialog'] )

const stepsCount = computed( () => {
  // Use new backend format total_steps if available, fallback to old format
  return props.template?.total_steps ?? props.template?.steps?.length ?? 0
} )

const categoryLabel = computed( () => {
  const category = props.template?.category
  if ( !category ) return ''
  if ( typeof category === 'object' ) {
    return category.name || category.label || ''
  }
  if ( typeof category === 'number' ) {
    return props.template?.category_name || props.template?.categoryLabel || ''
  }
  return category
} )

const isAdhoc = computed( () => props.template?.source === 'adhoc' )

const assetLabel = computed( () => {
  const a = props.template?.applicable_assets
  if ( !a || a.length === 0 ) return ''
  return a.length === 1 ? a[0] : `${a.length} assets`
} )

// Assignee-related computed properties
const taskAssigneeIds = computed( () => {
  return props.template?.payload?.assignee_ids || props.template?.assignee_ids || []
} )

const assignedUsers = computed( () => {
  return props.assigneeOptions.filter( user => taskAssigneeIds.value.includes( user.id ) )
} )

const hasAssignees = computed( () => {
  return assignedUsers.value.length > 0
} )

const availableUsers = computed( () => {
  return props.assigneeOptions || []
} )

// Assignee management methods
const removeAssignee = userId => {
  const updatedAssigneeIds = taskAssigneeIds.value.filter( id => id !== userId )
  updateTaskAssignees( updatedAssigneeIds )
}

const openAssigneeDialog = () => {
  emit( 'open-assignee-dialog', {
    taskId : props.template.id,
    taskData : props.template,
    currentAssigneeIds : taskAssigneeIds.value
  } )
}

const updateTaskAssignees = newAssigneeIds => {
  emit( 'assignee-update', {
    taskId : props.template.id,
    assigneeIds : newAssigneeIds,
    taskData : props.template
  } )
}

const handleEdit = () => {
  emit( 'selection', {
    id : props.template.id,
    action : 'edit',
    data : props.template
  } )
}

const handlePreview = () => {
  emit( 'selection', {
    id : props.template.id,
    action : 'preview',
    data : props.template
  } )
}

const handleDelete = () => {
  ElMessageBox.confirm( `Are you sure you want to delete the task "${props.template.name}"?`, 'Confirm Delete', {
    confirmButtonText : 'Delete',
    cancelButtonText : 'Cancel',
    type : 'warning'
  } )
    .then( () => {
      emit( 'selection', {
        id : props.template.id,
        action : 'delete',
        data : props.template
      } )
    } )
    .catch( () => {
      // User cancelled - no action needed
    } )
}
</script>

<style scoped>
.template-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  margin-bottom: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  position: relative;
}

.row-1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title-with-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.card-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.view-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 16px;
  color: #909399;
}

.view-icon:hover {
  background-color: var(--el-fill-color-light);
  color: #409eff;
}

.kebab-dropdown {
  flex-shrink: 0;
}

.adhoc-tag {
  flex-shrink: 0;
}

.kebab-icon {
  transform: rotate(90deg);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-size: 16px;
  color: #909399;
}

.kebab-icon:hover {
  background-color: var(--el-fill-color-light);
  color: #409eff;
}

.row-2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.tags-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.row-3 {
  display: flex;
  justify-content: space-between;
}

.steps-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.tag-item {
  --el-tag-border-color: #e4e7ed;
}

/* Assignee Section Styles */
.row-3 {
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-extra-light);
  padding-top: 8px;
}

.assignees-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.assignees-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.assignee-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

.assignees-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.assigned-users {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}
</style>

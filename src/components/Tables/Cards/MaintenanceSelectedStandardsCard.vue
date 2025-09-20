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

          <el-tag v-if="isStandalone" size="small" type="info" effect="plain" class="standalone-tag">
            Work Order Only
          </el-tag>
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
                <el-dropdown-item divided @click="handleDelete">Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Row 2: Description -->
      <!--      <div class="row-2" v-if="template.description">-->
      <!--        <p class="card-description">{{ template.description }}</p>-->
      <!--      </div>-->

      <!-- Row 3: Tags + Rules -->
      <div class="row-3 card-tags">
        <div class="tags-left">
          <el-tag
            v-if="categoryLabel"
            :type="template.category === 'general' ? 'primary' : 'warning'"
            size="small"
            class="tag-item"
          >
            {{ categoryLabel }}
          </el-tag>
        </div>

        <div class="steps-count">{{ stepsCount }} rules</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { MoreFilled, View } from '@element-plus/icons-vue'

const props = defineProps( {
  template : {
    type : Object,
    required : true
  }
} )

const emit = defineEmits( ['selection'] )

const isStandalone = computed( () => props.template?.isStandalone === true )

const stepsCount = computed( () => props.template?.steps?.length || props.template?.items?.length || 0 )

const categoryLabel = computed( () => {
  const category = props.template?.category
  if ( !category ) return ''
  // Handle both string and object formats
  return typeof category === 'object' ? category.name : category
} )

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
  ElMessageBox.confirm( `Are you sure you want to delete the standard "${props.template.name}"?`, 'Confirm Delete', {
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

.standalone-tag {
  flex-shrink: 0;
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
  margin: 4px 0;
}

.card-description {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.row-3 {
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
</style>

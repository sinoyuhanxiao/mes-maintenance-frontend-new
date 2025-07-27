<template>
  <div class="new-work-order">
    <h1>{{ $t('workOrder.newWorkOrder') }}</h1>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="150px" class="work-order-form">
      <!-- Work Order Name and Description -->
      <el-form-item :label="$t('workOrder.form.name')" prop="name" required :show-message="false">
        <el-input v-model="form.name" :placeholder="$t('workOrder.placeholder.workOrderName')" clearable />
      </el-form-item>

      <el-form-item :label="$t('workOrder.form.description')">
        <el-input
          v-model="form.description"
          type="textarea"
          :placeholder="$t('workOrder.placeholder.description')"
          style="width: 500px"
          clearable
        />
      </el-form-item>

      <el-form-item :label="$t('workOrder.form.haltType')" required>
        <el-switch
          v-model="form.halt_type"
          :active-value="1"
          :inactive-value="0"
          inline-prompt
          :active-text="$t('common.yes')"
          :inactive-text="$t('common.no')"
          style="--el-switch-on-color: #f65650; width: 70px"
        />
      </el-form-item>

      <!-- Equipment Selection -->
      <div class="equipment">
        <el-form-item :label="$t('workOrder.form.assets')" required>
          <el-row gutter="5">
            <el-col :span="20">
              <el-form-item label="" class="form-item" prop="production_line_id" :show-message="false" required>
                <el-select
                  class="equipment-fields"
                  v-model="selectedValues.productionLineId"
                  :placeholder="$t('workOrder.form.productionLine')"
                  clearable
                  @change="handleProductionLineChange"
                >
                  <el-option
                    v-for="item in commonDataStore.productionLines"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="20">
              <el-form-item label="" class="form-item">
                <el-select
                  class="equipment-fields"
                  v-model="selectedValues.equipmentGroupId"
                  :placeholder="$t('workOrder.form.equipmentGroup')"
                  clearable
                  :disabled="!hasEquipmentGroups"
                  @change="handleEquipmentGroupChange"
                >
                  <el-option v-for="item in equipmentGroups" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="20">
              <el-form-item label="" class="form-item">
                <el-select
                  class="equipment-fields"
                  v-model="selectedValues.equipmentId"
                  :placeholder="$t('workOrder.form.equipment')"
                  clearable
                  :disabled="!hasEquipments"
                  @change="handleEquipmentChange"
                >
                  <el-option v-for="item in equipments" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="20">
              <el-form-item label="" class="form-item">
                <el-select
                  class="equipment-fields"
                  v-model="selectedValues.componentId"
                  :placeholder="$t('workOrder.form.component')"
                  clearable
                  :disabled="!hasComponents"
                  @change="handleComponentChange"
                >
                  <el-option v-for="item in components" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
      </div>

      <!-- Classification Section -->
      <div class="categorization">
        <el-form-item :label="$t('workOrder.form.classification')" required>
          <el-col :span="20">
            <el-form-item label="" class="form-item" prop="priority_id" :show-message="false">
              <el-select v-model="form.priority_id" :placeholder="$t('workOrder.placeholder.selectPriority')" clearable>
                <el-option
                  v-for="item in commonDataStore.priorities"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="" class="form-item" prop="category_id" :show-message="false">
              <el-select v-model="form.category_id" :placeholder="$t('workOrder.placeholder.selectCategory')" clearable>
                <el-option
                  v-for="item in commonDataStore.categories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="20">
            <el-form-item label="" class="form-item" prop="work_type_id" :show-message="false">
              <el-select
                v-model="form.work_type_id"
                :placeholder="$t('workOrder.placeholder.selectWorkType')"
                clearable
              >
                <el-option
                  v-for="item in commonDataStore.workTypes"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
      </div>

      <!-- Recurrence and Upload Sections -->
      <RecurrenceEditor v-model:recurrence-setting="form.recurrence_setting" />
      <UploadEditor v-model:image-list="form.image_list" v-model:files-list="form.files_list" />

      <!-- Submit Button -->
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">
          {{ $t('workOrder.actions.submit') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import RecurrenceEditor from '@/views/workOrder/components/recurrenceEditor.vue'
import UploadEditor from '@/views/workOrder/components/upload.vue'
import { uploadMultipleToMinio } from '@/api/minio'
import { useTagsViewStore } from '@/store'
import { useCommonDataStore } from '@/store/modules/commonData'
import { createWorkOrder } from '@/api/workorder'
import { useWorkOrderForm } from '@/composables/useWorkOrder'
import { useEquipment } from '@/composables/useEquipment'
import { useErrorHandler } from '@/composables/useErrorHandler'

// Composables
const router = useRouter()
const { t } = useI18n()
const tagsViewStore = useTagsViewStore()
const commonDataStore = useCommonDataStore()
const { handleAsync, showSuccess } = useErrorHandler()

// Form composable
const { form, rules, validateForm } = useWorkOrderForm()

// Equipment composable
const {
  equipmentGroups,
  equipments,
  components,
  selectedValues,
  hasEquipmentGroups,
  hasEquipments,
  hasComponents,
  handleProductionLineChange,
  handleEquipmentGroupChange,
  handleEquipmentChange,
  handleComponentChange
} = useEquipment()

// Refs
const formRef = ref( null )
const loading = ref( false )
// Methods
const uploadFilesToServer = async() => {
  try {
    let uploadedImages = []
    let uploadedFiles = []

    // Upload images if they exist
    if ( form.image_list.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( form.image_list )
      uploadedImages = imageRes.data.uploadedFiles || []
      console.log( '🖼 Images uploaded successfully:', uploadedImages )
      form.image_list = uploadedImages.map( file => file.url )
    }

    // Upload files if they exist
    if ( form.files_list.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( form.files_list )
      uploadedFiles = fileRes.data.uploadedFiles || []
      console.log( '📄 Files uploaded successfully:', uploadedFiles )
      form.files_list = uploadedFiles.map( file => file.url )
    }

    console.log( '✅ Current image list after upload:', form.image_list )
    console.log( '✅ Current file list after upload:', form.files_list )
    showSuccess( t( 'workOrder.messages.uploadSuccess' ) )
  } catch ( err ) {
    console.error( '❌ File upload failed:', err )
    throw new Error( t( 'workOrder.messages.uploadFailed' ) )
  }
}

const submitForm = async() => {
  try {
    const isValid = await validateForm( formRef.value )
    if ( !isValid ) return

    loading.value = true

    await handleAsync(
      async() => {
        // Upload files first
        await uploadFilesToServer()

        // Sync equipment selections to form
        form.production_line_id = selectedValues.productionLineId
        form.equipment_group_id = selectedValues.equipmentGroupId
        form.equipment_id = selectedValues.equipmentId
        form.component_id = selectedValues.componentId

        const payload = { ...form }

        const { data } = await createWorkOrder( payload )
        console.log( '✅ Work order created successfully:', data )

        showSuccess( t( 'workOrder.messages.createSuccess' ) )

        // Close current tab and navigate
        tagsViewStore.DEL_VIEW( router.currentRoute.value )
        router.push( '/workOrder/complex' )
      },
      {
        context : 'createWorkOrder',
        customMessage : t( 'workOrder.messages.createFailed' ),
        loadingRef : loading
      }
    )
  } catch ( error ) {
    console.error( '❌ Work order creation failed:', error )
    loading.value = false
  }
}
// Watchers
watch(
  () => form.recurrence_setting,
  newVal => {
    form.recurrence_type = newVal.recurrence_type
    console.log( '📅 recurrence_setting changed:', newVal )
  },
  { deep : true }
)

// Lifecycle
onMounted( async() => {
  try {
    await Promise.all( [
      commonDataStore.fetchPriorities(),
      commonDataStore.fetchWorkTypes(),
      commonDataStore.fetchCategories(),
      commonDataStore.fetchProductionLines()
    ] )
  } catch ( error ) {
    console.error( 'Failed to initialize form data:', error )
  }
} )

defineOptions( {
  name : 'NewWorkOrder'
} )
</script>

<style scoped lang="scss">
.new-work-order {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    color: var(--el-text-color-primary);
    margin-bottom: 24px;
    font-weight: 600;
  }
}

.work-order-form {
  max-width: 800px;
  margin: 0 auto;

  .equipment,
  .categorization {
    max-width: 100%;

    .form-item {
      padding-bottom: 10px;
      margin-bottom: 0;
    }
  }

  .equipment-fields,
  .el-input,
  .el-select {
    width: 100%;
    max-width: 500px;
  }

  // Form sections spacing
  .equipment,
  .categorization {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--el-bg-color-page);
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);
  }
}

// Responsive design
@media (max-width: 768px) {
  .new-work-order {
    padding: 10px;
  }

  .work-order-form {
    .equipment-fields,
    .el-input,
    .el-select {
      max-width: 100%;
    }
  }
}

// Accessibility improvements
.el-form-item {
  &:focus-within {
    .el-form-item__label {
      color: var(--el-color-primary);
    }
  }
}

// Loading state
.el-button.is-loading {
  pointer-events: none;
}
</style>

<template>
  <div class="sp-form" v-loading="submitting">
    <div class="form-header">
      <div class="title">
        <span v-if="form.id">{{ 'Edit Spare Part' }}</span>

        <span v-else>{{ 'Create Spare Part' }}</span>

        <div style="gap: 38px">
          <span
            v-if="form.id"
            style="color: var(--el-text-color-secondary); font-weight: 400; font-size: 14px; margin-right: 38px"
          >
            ID: #{{ form.id }}
          </span>

          <span style="margin-right: 38px; font-size: 14px; font-weight: 500; color: var(--el-text-color-secondary)">
            {{ 'Created At: ' + formatAsLocalDateTimeString(form.created_at) }}
          </span>

          <span
            v-if="form?.created_by"
            style="margin-right: 38px; font-size: 14px; font-weight: 500; color: var(--el-text-color-secondary)"
          >
            {{ 'Created By: ' + form?.created_by?.first_name + ' ' + form?.created_by?.last_name }}
          </span>
        </div>
      </div>
    </div>

    <div class="form-body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="180px" label-position="top" class="two-col-form">
        <div class="form-row">
          <el-form-item :label="t('common.name')" prop="name"><el-input v-model="form.name" /></el-form-item>

          <el-form-item :label="'Manufacturer Code'" prop="code">
            <el-input v-model="form.code" />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item :label="'Universal Code'" prop="universal_code">
            <el-input v-model="form.universal_code" />
          </el-form-item>

          <el-form-item :label="'Category'" prop="category_id">
            <el-select v-model="form.category_id" filterable>
              <el-option v-for="c in sparePartClassOptions"
:key="c.id"
:label="c.name"
:value="c.id"
            /></el-select>
          </el-form-item>
        </div>

        <div class="form-row">
          <!--          <el-form-item :label="'Manufacturer'" prop="manufacturer_id">-->
          <!--            <el-select v-model="form.manufacturer_id" filterable>-->
          <!--              <el-option v-for="m in manufacturerOptions" :key="m.id" :label="m.name" :value="m.id"/></el-select>-->
          <!--          </el-form-item>-->

          <el-form-item prop="reorder_point">
            <template #label>
              <span>
                Reorder Point
                <el-tooltip
                  effect="dark"
                  content="Stock level below the reorder point will be indicated as low stock"
                  placement="top"
                >
                  <el-icon class="info-icon">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>

            <el-input-number
              v-model="form.reorder_point"
              :min="1"
              :max="form.maximum_stock_level"
              style="width: 100%"
              value-on-clear="min"
            />
          </el-form-item>
        </div>

        <!--        <div class="form-row">-->
        <!--          <el-form-item :label="'Minimum Stock'" prop="minimum_stock_level">-->
        <!--            <el-input-number v-model="form.minimum_stock_level" :min="0" style="width: 100%"/>-->
        <!--          </el-form-item>-->

        <!--          <el-form-item :label="'Maximum Stock Level'" prop="maximum_stock_level">-->
        <!--            <el-input-number v-model="form.maximum_stock_level" :min="1" style="width: 100%" />-->
        <!--          </el-form-item>-->
        <!--        </div>-->

        <div class="form-row">
          <el-form-item class="full-width" :label="t('common.description')" prop="description">
            <el-input type="textarea" v-model="form.description" :autosize="{ minRows: 2, maxRows: 6 }" />
          </el-form-item>
        </div>

        <!-- Material Lots -->
        <el-divider />

        <div class="form-section form-card-section">
          <el-form-item>
            <template #label>
              <div class="section-header">
                <span class="section-title">
                  <el-icon class="section-icon icon-color"><Place /></el-icon>

                  Material Lot
                </span>

                <div v-if="form.material_lots?.length > 0" class="form-section-card-actions">
                  <el-button size="default" @click="openLotForm" :icon="Plus"> Add Material Lot </el-button>

                  <el-button size="default" @click="handleDeleteAll('material-lot')" :icon="Delete">
                    Clear All ({{ form.material_lots?.length }})
                  </el-button>
                </div>
              </div>
            </template>

            <div class="form-card-container" :class="{ 'no-form-card': form.material_lots.length === 0 }">
              <!-- Empty State -->
              <div v-if="form.material_lots.length === 0" class="empty-form-card">
                <div class="empty-content">
                  <el-icon class="empty-icon"><Place /></el-icon>

                  <h4>No Material Lots</h4>

                  <p>Add material Lot information</p>

                  <el-button type="primary" @click="openLotForm">
                    <el-icon><Plus /></el-icon>

                    Add Material Lot
                  </el-button>
                </div>
              </div>

              <!-- Material Lot Card List -->
              <div v-else class="card-list">
                <div v-for="(lot, i) in form.material_lots" :key="i">
                  <el-card shadow="never">
                    <div class="card-content-row">
                      <el-text class="card-title">
                        {{ lot.id ? 'Lot # ' + lot.id : 'New Material Lot' }}
                      </el-text>

                      <div class="card-action">
                        <el-button size="small" @click="openLotForm(lot, i)">{{ 'Edit' }}</el-button>

                        <el-button size="small" type="danger" @click="removeLot(i, lot.id)">{{ 'Delete' }}</el-button>
                      </div>
                    </div>

                    <div class="card-content-row">
                      <div>{{ 'Unit in stock' }}: {{ lot.unit_in_stock ?? '-' }}</div>

                      <div>{{ 'Location' }}: {{ getLocationNameById(lot.location_id || null) }}</div>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- Material Supplier -->
        <el-divider />
        <div class="form-section form-card-section">
          <el-form-item>
            <template #label>
              <div class="section-header">
                <span class="section-title">
                  <el-icon class="section-icon icon-color"><Van /></el-icon>

                  Material Vendor
                </span>

                <div v-if="form.material_suppliers?.length > 0" class="form-section-card-actions">
                  <el-button size="default" @click="openSupplierForm()" :icon="Plus"> Add Material Vendor </el-button>

                  <el-button size="default" @click="handleDeleteAll('material-supplier')" :icon="Delete">
                    Clear All ({{ form.material_suppliers?.length }})
                  </el-button>
                </div>
              </div>
            </template>

            <div class="form-card-container" :class="{ 'no-form-card': form.material_suppliers.length === 0 }">
              <!-- Empty State -->
              <div v-if="form.material_suppliers.length === 0" class="empty-form-card">
                <div class="empty-content">
                  <el-icon class="empty-icon"><Van /></el-icon>

                  <h4>No Material Vendors</h4>

                  <p>Add material Vendor information</p>

                  <el-button type="primary" @click="openSupplierForm()">
                    <el-icon><Plus /></el-icon>

                    Add Material Vendor
                  </el-button>
                </div>
              </div>

              <!-- Material Supplier Card List -->
              <div v-else>
                <div class="card-list">
                  <div v-for="(ms, i) in form.material_suppliers" :key="i">
                    <el-card shadow="never">
                      <div class="card-content-row">
                        <div class="card-title">{{ findVendorName(ms.vendor_id) }}</div>

                        <div class="row actions">
                          <el-button size="small" @click="openSupplierForm(ms, i)">{{ t('common.edit') }}</el-button>

                          <el-button size="small" @click="removeVendor(i)" type="danger">{{
                            t('common.delete')
                          }}</el-button>
                        </div>
                      </div>

                      <div class="card-content-row">
                        <div>{{ 'Unit Price' }}: {{ ms.currency }} {{ ms.unit_price ?? '-' }}</div>

                        <div>{{ 'Lead Time Days' }}: {{ ms.lead_time_days ?? '-' }}</div>

                        <div>{{ 'Order Code' }}: {{ ms.order_code || '-' }}</div>
                      </div>
                    </el-card>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- Images -->
        <el-divider content-position="left">{{ 'Attachments' }}</el-divider>

        <!-- Image and File Upload Section -->
        <div class="form-section">
          <div class="upload-section">
            <FileUploadMultiple
              ref="fileUploadRef"
              @update:imageList="handleImageListUpdate"
              @update:filesList="handleFilesListUpdate"
              @update:removedExistingImages="handleRemovedExistingImages"
              @update:removedExistingFiles="handleRemovedExistingFiles"
              :existing-image-list="existingImages"
              :existing-file-list="existingFiles"
              :image-label="'Images'"
              :file-label="'Files'"
              upload-type="both"
              :max-images="5"
              :max-files="10"
            />
          </div>
        </div>
      </el-form>

      <!-- Popups -->
      <MaterialLotForm v-model="showLotFormDialog" :value="editingLot" @save="saveLot" />

      <MaterialSupplierForm
        v-model="showSupplierFormDialog"
        :value="editingSupplier"
        :selected-vendor-ids="selectedVendorIds"
        @save="saveVendor"
      />
    </div>

    <div class="form-actions">
      <el-button @click="$emit('cancel')">{{ 'Cancel' }}</el-button>

      <el-button type="warning" @click="reset(false)">{{ 'Reset' }}</el-button>

      <el-button type="primary" @click="submit">{{ 'Confirm' }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MaterialLotForm from './MaterialLotForm.vue'
import MaterialSupplierForm from './MaterialSupplierForm.vue'
import { Delete, Van, Place, Plus, QuestionFilled } from '@element-plus/icons-vue'
import {
  createInventory,
  createSparePart,
  deleteInventory,
  getAllSparePartClasses,
  updateInventory,
  updateSparePart
} from '@/api/resources'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { searchManufacturers } from '@/api/manufacturer'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import { uploadMultipleToMinio } from '@/api/minio'
import { searchVendors } from '@/api/vendor'
import { formatAsLocalDateTimeString } from '@/utils/datetime'

const props = defineProps( {
  data : {
    type : Object,
    default : null
  },
  all_locations : {
    type : Array,
    default : () => []
  }
} )

const emit = defineEmits( ['cancel', 'confirm'] )

const { t } = useI18n()
const formRef = ref()
const fileUploadRef = ref()
const submitting = ref( false )

const form = reactive( getEmptySparePart() )
const originalSnapShotForm = reactive( {} )

const sparePartClassOptions = ref( [] )
// const manufacturerOptions = ref( [] )
const vendorOptions = ref( [] )
const selectedVendorIds = computed( () => new Set( form.material_suppliers.map( ms => ms.vendor_id ) ) )

const rules = {
  name : [{ required : true, message : 'Name is required', trigger : 'blur' }],
  code : [{ required : true, message : 'Manufacturer code is required', trigger : 'change' }],
  universal_code : [{ required : true, message : 'Universal code is required', trigger : 'change' }]
}

// File and image states
const existingImages = ref( [] )
const existingFiles = ref( [] )
const newImages = ref( [] )
const newFiles = ref( [] )
const newImageUrls = ref( [] )
const newFileUrls = ref( [] )
const removedImageUrls = ref( [] )
const removedFileUrls = ref( [] )

const handleImageListUpdate = images => {
  // Track NEW images separately (File objects from FileUploadMultiple component)
  newImages.value = images
}

const handleFilesListUpdate = files => {
  // Track NEW files separately (File objects from FileUploadMultiple component)
  newFiles.value = files
}

const handleRemovedExistingImages = removedUrls => {
  removedImageUrls.value = removedUrls
}

const handleRemovedExistingFiles = removedUrls => {
  removedFileUrls.value = removedUrls
}

// Watcher to set up form on editing spare part data
watch(
  () => props.data,
  newData => {
    if ( newData ) {
      const transformedData = transformSparePartData( newData )
      Object.assign( form, transformedData )

      // performs deep copy on transformed data
      Object.assign( originalSnapShotForm, JSON.parse( JSON.stringify( transformedData ) ) )
    } else {
      reset( true )
      Object.keys( originalSnapShotForm ).forEach( k => delete originalSnapShotForm[k] )
    }
  },
  { immediate : true }
)

// Adjust reorder point to always less or equal to max stock level
watch(
  () => form.maximum_stock_level,
  newMax => {
    if ( newMax < form.reorder_point ) {
      form.reorder_point = newMax
    }
  }
)

function getEmptySparePart() {
  return {
    id : null,
    code : '',
    name : '',
    universal_code : '',
    category_id : null,
    // manufacturer_id : null,
    reorder_point : 1,
    minimum_stock_level : 0,
    maximum_stock_level : 100000,
    description : '',
    material_lots : [],
    material_suppliers : [],
    image_list : [],
    file_list : []
  }
}

function transformSparePartVendor( sparePartVendors = [] ) {
  return sparePartVendors.map( spv => ( {
    vendor_id : spv.vendor?.id ?? spv.vendor_id ?? null,
    order_code : spv.order_code,
    lead_time_days : spv.lead_time_days,
    unit_price : spv.unit_price,
    price_uom_id : spv.price_uom?.id ?? spv.price_uom.id ?? 23
  } ) )
}

function transformInventories( inventories = [] ) {
  return inventories
    .filter( inv => inv && inv.status !== 0 )
    .map( inv => ( {
      id : inv.id,
      location_id : inv.location?.status === 1 ? inv.location?.id : null,
      unit_in_stock : inv.unit_in_stock,
      inventory_type_id : inv.material_type?.id ?? null,
      batch_number : inv.batch_number ?? null
    } ) )
}

function transformSparePartData( v ) {
  if ( !v ) {
    return getEmptySparePart()
  }

  existingImages.value = v.image_list
  existingFiles.value = v.file_list

  return {
    id : v.id,
    name : v.name,
    code : v.code,
    universal_code : v.universal_code,
    category_id : v.spare_parts_class?.status === 1 ? v.spare_parts_class.id : null,
    // manufacturer_id : v.manufacturer?.id ?? null,
    reorder_point : v.reorder_point ?? 1,
    minimum_stock_level : v.minimum_stock_level ?? 0,
    maximum_stock_level : v.maximum_stock_level ?? 100000,
    description : v.description ?? '',
    material_lots : transformInventories( v.inventories ) || [],
    material_suppliers : transformSparePartVendor( v.spare_part_vendors ) || [],
    image_list : v.image_list || [],
    file_list : v.file_list || [],
    created_at : v.created_at,
    created_by : v.created_by,
    updated_at : v.updated_at,
    updated_by : v.updated_by
  }
}

async function reset( skipConfirmation = false ) {
  if ( !skipConfirmation ) {
    await ElMessageBox.confirm(
      'Are you sure you want to reset the form? All unsaved changes will be lost.',
      'Warning',
      {
        type : 'warning',
        confirmButtonText : t( 'common.confirm' ),
        cancelButtonText : t( 'common.cancel' ),
        distinguishCancelAndClose : true
      }
    )
  }

  if ( originalSnapShotForm === null ) {
    Object.assign( form, getEmptySparePart() )
  } else {
    Object.assign( form, originalSnapShotForm )
  }

  fileUploadRef?.value?.resetNewFileLists()

  existingImages.value = form.image_list
  existingFiles.value = form.file_list
  newImages.value = []
  newFiles.value = []
  newImageUrls.value = []
  newFileUrls.value = []
  removedImageUrls.value = []
  removedFileUrls.value = []
}

const buildCreateSparePartPayload = entry => {
  // Clean up material_suppliers
  const spare_part_vendors_payload = entry.material_suppliers.map( material => ( {
    vendor_id : material.vendor_id,
    order_code : material.order_code,
    lead_time_days : material.lead_time_days,
    unit_price : material.unit_price,
    price_uom_id : material.price_uom_id
  } ) )

  return {
    name : entry.name,
    code : entry.code,
    universal_code : entry.universal_code,
    description : entry.description,
    spare_parts_class_id : entry.category_id,
    quantity_uom_id : 26, // TODO: add a quantity unit select, hardcoded to unit "each" for now
    image_list : entry.image_list,
    file_list : entry.file_list,
    // current_stock : 0 // dont need to provide as it is declared in material lot?
    reorder_point : entry.reorder_point,
    maximum_stock_level : entry.maximum_stock_level,
    minimum_stock_level : 0,
    // manufacturer_id : entry.manufacturer_id,
    spare_part_vendors : spare_part_vendors_payload || []
  }
}

function isDifferent( a, b ) {
  return JSON.stringify( a ) !== JSON.stringify( b )
}

const buildUpdateSparePartPayload = ( entry, original ) => {
  const payload = {}

  if ( entry.name !== original.name ) {
    payload.name = entry.name
  }

  if ( entry.code !== original.code ) {
    payload.code = entry.code
  }

  if ( entry.universal_code !== original.universal_code ) {
    payload.universal_code = entry.universal_code
  }

  if ( entry.description !== original.description ) {
    payload.description = entry.description
  }

  if ( entry.category_id !== original.category_id ) {
    payload.spare_parts_class_id = entry.category_id
  }

  // if ( entry.manufacturer_id !== original.manufacturer_id ) {
  //   payload.manufacturer_id = entry.manufacturer_id
  // }

  if ( entry.reorder_point !== original.reorder_point ) {
    payload.reorder_point = entry.reorder_point
  }

  // if ( entry.minimum_stock_level !== original.minimum_stock_level ) {
  //   payload.minimum_stock_level = entry.minimum_stock_level
  // }

  // if ( entry.maximum_stock_level !== original.maximum_stock_level ) {
  //   payload.maximum_stock_level = entry.maximum_stock_level
  // }

  if ( isDifferent( entry.material_suppliers, original.material_suppliers ) ) {
    payload.vendor_requests = entry.material_suppliers
  }

  if ( isDifferent( entry.image_list, original.image_list ) ) {
    payload.image_list = entry.image_list
  }

  if ( isDifferent( entry.file_list, original.file_list ) ) {
    payload.file_list = entry.file_list
  }

  return payload
}

function buildInventoryPatchPayload( updatedLot, originalLots = [] ) {
  const original = originalLots.find( l => l.id === updatedLot.id )
  if ( !original ) {
    return
  }

  const payload = {}
  if ( updatedLot.location_id !== original.location_id ) {
    payload.location_id = updatedLot.location_id
  }

  if ( updatedLot.unit_in_stock !== original.unit_in_stock ) {
    payload.unit_in_stock = updatedLot.unit_in_stock
  }

  if ( updatedLot.batch_number !== original.batch_number ) {
    payload.batch_number = updatedLot.batch_number
  }

  if ( updatedLot.inventory_type_id !== original.inventory_type_id ) {
    payload.inventory_type_id = updatedLot.inventory_type_id
  }

  return payload
}

async function processInventoryCrud( materialId ) {
  // CREATE new lots
  for ( const lot of toBeCreateLots.value ) {
    const payload = {
      location_id : lot.location_id,
      unit_in_stock : lot.unit_in_stock ?? 0,
      inventory_type_id : lot.inventory_type_id ?? 3,
      batch_number : lot.batch_number ?? '',
      material_id : materialId
    }

    try {
      await createInventory( payload )
      ElMessage.success( `Created inventory for ${payload.batch_number || 'new lot'}` )
    } catch ( err ) {
      console.error( 'Create inventory failed:', err )
      ElMessage.error( 'Failed to create inventory lot' )
    }
  }

  // UPDATE existing lots
  for ( const lot of toBeUpdateLots.value ) {
    const payload = buildInventoryPatchPayload( lot, originalSnapShotForm.material_lots )
    if ( Object.keys( payload ).length === 0 ) continue
    try {
      await updateInventory( lot.id, payload )
      ElMessage.success( `Updated inventory #${lot.id}` )
    } catch ( err ) {
      console.error( 'Update inventory failed:', err )
      ElMessage.error( `Failed to update inventory #${lot.id}` )
    }
  }

  // DELETE removed lots
  for ( const id of toBeDeleteLotIds.value ) {
    try {
      await deleteInventory( id )

      ElMessage.success( `Deleted inventory #${id}` )
    } catch ( err ) {
      console.error( 'Delete inventory failed:', err )
      ElMessage.error( `Failed to delete inventory #${id}` )
    }
  }

  // Clear after processing
  toBeCreateLots.value = []
  toBeUpdateLots.value = []
  toBeDeleteLotIds.value = []
}

async function submit() {
  submitting.value = true
  try {
    const valid = await validate( formRef.value )

    if ( !valid ) {
      return
    }

    // Upload new files to MinIO
    if ( newImages.value.length > 0 || newFiles.value.length > 0 ) {
      await uploadFilesToServer()
    }

    // Combine existing files with newly uploaded files
    let finalImageList = [...( existingImages.value || [] ), ...( newImageUrls.value || [] )]
    let finalFileList = [...( existingFiles.value || [] ), ...( newFileUrls.value || [] )]

    // Filter out removed files
    finalImageList = finalImageList.filter( url => !removedImageUrls.value.includes( url ) )
    finalFileList = finalFileList.filter( url => !removedFileUrls.value.includes( url ) )

    // Update form with final file lists
    form.image_list = finalImageList
    form.file_list = finalFileList

    if ( form.id ) {
      await updateSparePart( form.id, buildUpdateSparePartPayload( form, originalSnapShotForm ) )
      ElMessage.success( 'Spare part updated successfully.' )
    } else {
      const res = await createSparePart( buildCreateSparePartPayload( form ) )
      form.id = res.data.id
      ElMessage.success( 'Spare part created successfully.' )
    }

    // Process inventories after spare part CRUD
    await processInventoryCrud( form.id )

    // notify root view to clean up selected and close form
    emit( 'confirm', form.id )
  } catch ( e ) {
    console.error( 'Error submitting spare part:', e )
    ElMessage.error( 'Error submitting spare part form' )
  } finally {
    submitting.value = false
  }
}

function validate( refEl ) {
  return new Promise( resolve => {
    refEl.validate( v => resolve( v ) )
  } )
}

// Material supplier form state
const showSupplierFormDialog = ref( false )
const editingSupplier = ref( null )

function openSupplierForm( vo = null, index = -1 ) {
  editingSupplier.value = vo ? { ...vo, _index : index } : null
  showSupplierFormDialog.value = true
}

function saveVendor( payload ) {
  if ( payload._index != null && payload._index > -1 ) {
    form.material_suppliers.splice( payload._index, 1, stripIndex( payload ) )
  } else {
    form.material_suppliers.push( stripIndex( payload ) )
  }
}

function removeVendor( i ) {
  form.material_suppliers.splice( i, 1 )
}

function stripIndex( o ) {
  const c = { ...o }
  delete c._index
  return c
}

function findVendorName( id ) {
  return vendorOptions.value.find( v => v.id === id )?.name || `#${id}`
}

// Material lot form state
const showLotFormDialog = ref( false )
const editingLot = ref( null )
const toBeCreateLots = ref( [] )
const toBeUpdateLots = ref( [] )
const toBeDeleteLotIds = ref( [] )

function openLotForm( lot = null, index = -1 ) {
  editingLot.value = lot ? { ...lot, _index : index } : null
  showLotFormDialog.value = true
}

function saveLot( payload ) {
  if ( payload._index != null && payload._index > -1 ) {
    form.material_lots.splice( payload._index, 1, stripIndex( payload ) )

    if ( payload.id ) {
      toBeUpdateLots.value.push( payload )
    }
  } else {
    form.material_lots.push( stripIndex( payload ) )
    toBeCreateLots.value.push( payload )
  }
}

function removeLot( i, lot_id ) {
  form.material_lots.splice( i, 1 )

  // Track delete lot request by its id
  if ( lot_id ) {
    toBeDeleteLotIds.value.push( lot_id )
  }
}

function handleDeleteAll( type ) {
  switch ( type ) {
    case 'material-lot':
      form.material_lots = []
      break
    case 'material-supplier':
      form.material_suppliers = []
      break

    default:
      break
  }
}

function getLocationNameById( id ) {
  if ( !id ) {
    return '-'
  }

  const loc = props.all_locations.find( loc => loc.id === id )
  return loc?.name || `#${id}`
}

// Upload files to MinIO server
const uploadFilesToServer = async() => {
  try {
    // Upload NEW images if they exist
    if ( newImages.value.length > 0 ) {
      const imageRes = await uploadMultipleToMinio( newImages.value )
      const uploadedImages = imageRes.data.uploadedFiles || []
      newImageUrls.value = uploadedImages.map( file => file.url )
    }

    // Upload NEW files if they exist
    if ( newFiles.value.length > 0 ) {
      const fileRes = await uploadMultipleToMinio( newFiles.value )
      const uploadedFiles = fileRes.data.uploadedFiles || []
      newFileUrls.value = uploadedFiles.map( file => file.url )
    }

    return { newImageUrls : newImageUrls.value, newFileUrls : newFileUrls.value }
  } catch ( error ) {
    console.error( 'File upload failed:', error )
    throw new Error( 'File upload failed' )
  }
}

async function loadSparePartClasses() {
  try {
    const response = await getAllSparePartClasses( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    sparePartClassOptions.value = response?.data || []
  } catch ( err ) {
    console.error( 'Failed to load spare part classes:', err )
    ElMessage.error( 'Error loading spare part classes data' )
  }
}

// async function loadManufacturer() {
//   try {
//     const response = await searchManufacturers( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
//     manufacturerOptions.value = response?.data?.content || []
//   } catch ( err ) {
//     console.error( 'Failed to load manufacturers:', err )
//     ElMessage.error( 'Error loading manufacturers data' )
//   }
// }

async function loadVendor() {
  try {
    const response = await searchVendors( { status_ids : [1] }, 1, 1000, 'id', 'ASC' )
    vendorOptions.value = response?.data?.content || []
  } catch ( err ) {
    console.error( 'Failed to load vendors:', err )
    ElMessage.error( 'Error loading vendors data' )
  }
}

onMounted( async() => {
  await loadSparePartClasses()
  await loadVendor()
  // await loadManufacturer()
} )
</script>

<style scoped lang="scss">
.sp-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%; /* parent container should provide a defined height, e.g., dialog or page */
}

.form-header {
  padding: 12px 16px 12px 0;
  margin-left: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-header .title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: baseline;
}

/* Scrollable middle section */
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Fixed actions on bottom */
.form-actions {
  padding: 12px 16px 12px 0;
  margin-left: 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.two-col-form .form-row {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.two-col-form .full-width {
  grid-column: 1 / -1;
}

/* Single column vertical list */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Arrange info left, actions right */
.card-content-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* handle small screen gracefully */
  flex-direction: row;
  gap: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* Actions stay on the right */
.card-action {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
}

.row {
  font-size: 13px;
}

.list-row {
  margin-bottom: 8px;
}

.supplier-section {
  background: #fbfff9;
  border-radius: 6px;
  padding: 12px;
}

// Section-specific styling

.form-card-section {
  background: #fbfff9;
  border-radius: 6px;
  padding: 12px;
}

// Task and Standard containers
.form-card-container {
  min-height: 120px;
  flex: 1;
}

// Direct card stacking lists
.form-card-list {
  display: flex;
  flex-direction: column;
}

// Individual card styling
.task-card,
.standard-card {
  width: 100%;
}

.form-card-container.no-form-card {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-form-card {
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #c0c4cc;
}

.empty-content {
  h4 {
    margin: 0 0 0 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  p {
    margin: -8px 0 6px 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

// Section header with actions
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    gap: 8px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .section-icon {
    font-size: 18px;

    &.icon-color {
      color: var(--el-text-color-secondary);
    }
  }
}

form-section-card-actions {
  display: flex;
  gap: 5px;
}
</style>

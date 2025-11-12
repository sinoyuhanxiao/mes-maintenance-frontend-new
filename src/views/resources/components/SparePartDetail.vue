<template>
  <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden">
    <div v-if="loading">
      <el-skeleton v-for="i in 2" :key="i" style="padding: 20px" animated />
    </div>

    <div v-else class="sp-detail">
      <div class="header">
        <div>
          <div>
            <span
              style="
                margin: 0px 12px 0px 0px;
                font-size: 20px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                line-height: 1.4;
              "
            >
              {{ data?.name }}
            </span>

            <span style="color: var(--el-color-primary); font-weight: 500; font-size: 14px"> #{{ data?.id }} </span>
          </div>

          <div>
            <span style="margin-right: 38px; font-size: 14px; font-weight: 500; color: var(--el-text-color-secondary)">
              {{ 'Created At: ' + formatAsLocalDateTimeString(data?.created_at) }}
            </span>

            <span
              v-if="data?.created_by"
              style="margin-right: 38px; font-size: 14px; font-weight: 500; color: var(--el-text-color-secondary)"
            >
              {{ 'Created By: ' + data?.created_by?.first_name + ' ' + data?.created_by?.last_name }}
            </span>

            <span style="margin-right: 38px; font-size: 14px; font-weight: 500; color: var(--el-text-color-secondary)">
              {{ 'Updated At: ' + formatAsLocalDateTimeString(data?.updated_at) }}
            </span>

            <span
              v-if="data?.updated_by"
              style="font-size: 14px; font-weight: 500; color: var(--el-text-color-secondary)"
            >
              {{ 'Updated By: ' + data?.updated_by?.first_name + ' ' + data?.updated_by?.last_name }}
            </span>
          </div>
        </div>

        <div class="actions">
          <el-button :icon="Edit" type="primary" plain @click="emit('edit')">{{ t('common.edit') }}</el-button>
          <el-button :icon="Delete" type="danger" plain @click="emit('delete')">{{ t('common.delete') }}</el-button>
        </div>
      </div>

      <div class="scroll-area">
        <!-- Definition -->
        <el-descriptions :column="4" class="general-details-descriptions">
          <el-descriptions-item :label="'Manufacturer Code'">
            <span class="detail-value">
              {{ data?.code || '-' }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item :label="'Universal Code'">
            {{ data?.universal_code || '-' }}
          </el-descriptions-item>

          <el-descriptions-item :label="'Category'">
            {{ data?.spare_parts_class?.name || '-' }}
          </el-descriptions-item>

          <el-descriptions-item :label="'Average Unit Price'">
            <span v-if="avgCost.avg !== null">{{ avgCost.avg }}</span>

            <span v-else>-</span>
          </el-descriptions-item>

          <el-descriptions-item :label="'Total Stock'">
            <span
              class="stat-value"
              :class="{
                'out-of-stock': data?.current_stock <= 0,
                'low-stock': data?.current_stock > 0 && data?.current_stock <= (data?.reorder_point ?? 0),
                'in-stock': data?.current_stock > (data?.reorder_point ?? 0),
              }"
            >
              {{ data?.current_stock ?? 0 }}
            </span>
          </el-descriptions-item>

          <el-descriptions-item :label="'Reorder Point'">
            <template #label>
              <span>
                Reorder Point
                <el-tooltip
                  effect="dark"
                  content="Used to indicate for low stock when total stock is below the reorder point"
                  placement="top"
                >
                  <el-icon class="info-icon">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>

            {{ data?.reorder_point ?? 0 }}
          </el-descriptions-item>

          <el-descriptions-item :label="'Description'" :span="4">
            <span class="detail-value">
              {{ data.description || '-' }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Attachments Section -->
        <div class="detail-section" v-if="hasImageAttachments || hasFileAttachments">
          <el-divider />

          <h3 class="section-title">Attachments</h3>

          <!-- Images Section -->
          <div v-if="hasImageAttachments" class="images-section">
            <el-descriptions :column="1">
              <el-descriptions-item label="Images">
                <div class="image-gallery">
                  <el-image
                    v-for="(imagePath, index) in data.image_list"
                    :key="index"
                    :src="imagePath"
                    :preview-src-list="data.image_list"
                    fit="cover"
                    class="individual-image-display"
                  >
                    <template #error>
                      <div class="error-image-display">
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

        <!-- Material Lots -->
        <div>
          <el-divider />

          <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center">
            <h3 class="section-title">Material Lots</h3>

            <div v-if="data.inventories?.length > 0">
              <el-button :icon="Coordinate" :type="'success'" plain @click="handleCreateLotTransaction">{{
                'Adjust Stock'
              }}</el-button>
            </div>
          </div>

          <div class="card-list" v-if="data.inventories?.length">
            <el-card v-for="(lot, i) in data.inventories" :key="i" shadow="never">
              <div class="card-root-content">
                <div class="request-image">
                  <div class="request-icon">
                    <el-icon><Place /></el-icon>
                  </div>
                </div>

                <div class="card-info">
                  <div class="card-row">
                    <div class="title">
                      {{ 'Lot # ' + lot.id || '-' }}
                    </div>
                  </div>

                  <div class="card-row">
                    <div class="row-value">
                      {{ 'Number of Units' }}:
                      <span :style="{ color: lot.unit_in_stock === 0 ? 'var(--el-color-danger)' : 'inherit' }">
                        {{ lot.unit_in_stock ?? '-' }}
                      </span>
                    </div>

                    <div class="row-value">{{ 'Location' }}: {{ getLocationNameById(lot.location?.id) || '-' }}</div>

                    <!--                  <div class="row-value">-->
                    <!--                    {{ 'Batch Number' }}: {{ lot.batch_number || '-' }}-->
                    <!--                  </div>-->
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <el-empty v-else :description="'No Material Lots'" :image-size="60" />

          <LotTransactionsTable :inventory_transaction_logs="inventory_transaction_logs" />
        </div>

        <!-- Material Vendors -->
        <div>
          <el-divider />

          <h3 class="section-title">Material Vendor</h3>

          <div class="card-list" v-if="data?.spare_part_vendors?.length">
            <el-card v-for="(spv, i) in data.spare_part_vendors" :key="i" shadow="never">
              <div class="card-root-content">
                <div class="request-image">
                  <div class="request-icon">
                    <el-icon><Van /></el-icon>
                  </div>
                </div>

                <div class="card-info">
                  <div class="card-row">
                    <div class="title">
                      {{ spv.vendor?.name || '-' }}
                    </div>
                  </div>

                  <div class="card-row">
                    <div class="row-value">
                      {{ 'Unit Price' }}: {{ spv.unit_price ?? '-' }}
                      {{ spv.unit_price != null ? ' ' + spv.price_uom?.name : '' }}
                    </div>

                    <div class="row-value">{{ 'Lead Time Days' }}: {{ spv.lead_time_days ?? '-' }}</div>

                    <div class="row-value">{{ 'Order Code' }}: {{ spv.order_code || '-' }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else :description="'No Material Vendor'" :image-size="60" />
        </div>

        <!-- Related Equipment -->
        <div>
          <el-divider />

          <h3 class="section-title">Related Equipment</h3>

          <div class="card-list" v-if="relatedEquipment?.length">
            <el-card v-for="(equipment, i) in relatedEquipment" :key="i" shadow="never">
              <div class="card-root-content">
                <div class="request-image">
                  <div class="request-icon">
                    <el-icon><Tools /></el-icon>
                  </div>
                </div>

                <div class="card-info">
                  <div class="card-row">
                    <div class="title">
                      {{ equipment?.name || '-' }}
                    </div>
                  </div>

                  <div class="card-row">
                    <div class="row-value">{{ 'ID' }}: {{ equipment?.id ?? '-' }}</div>
                    <div class="row-value">{{ 'Code' }}: {{ equipment?.code ?? '-' }}</div>
                    <div class="row-value">{{ 'Type' }}: {{ equipment?.node_type?.default_label ?? '-' }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else :description="'No Related Equipment'" :image-size="60" />
        </div>

        <!-- Manufacturer -->
        <!--      <div class="detail-section">-->
        <!--        <h3 class="section-title">Manufacturer</h3>-->

        <!--        <div v-if="data.manufacturer" class="request-grid">-->
        <!--          <el-tooltip effect="light" placement="top" popper-class="request-tooltip-popper">-->
        <!--            <template #content>-->
        <!--              <div class="request-tooltip">-->
        <!--                <div><strong>Name:</strong> {{ data.manufacturer.name }}</div>-->
        <!--              </div>-->
        <!--            </template>-->

        <!--            <div class="request-card" @click="handleManufacturerClicked(data.manufacturer)">-->
        <!--              <div class="request-image">-->
        <!--                <el-image-->
        <!--                  v-if="data.manufacturer.image_list?.length"-->
        <!--                  :src="data.manufacturer.image_list[0]"-->
        <!--                  fit="cover"-->
        <!--                  class="request-thumbnail"-->
        <!--                >-->
        <!--                  <template #error>-->
        <!--                    <div class="request-icon">-->
        <!--                      <el-icon><Van /></el-icon>-->
        <!--                    </div>-->
        <!--                  </template>-->
        <!--                </el-image>-->

        <!--                <div v-else class="request-icon">-->
        <!--                  <el-icon><Van /></el-icon>-->
        <!--                </div>-->
        <!--              </div>-->

        <!--              <div class="request-info">-->
        <!--                <div class="request-name">{{ data.manufacturer.name }}</div>-->

        <!--                <div class="request-code">Code : {{ data.manufacturer.code }}</div>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </el-tooltip>-->
        <!--        </div>-->
        <!--        <div v-else class="request-no-data">-->
        <!--          <el-empty description="No manufacturer details available" :image-size="60" />-->
        <!--        </div>-->
        <!--      </div>-->
      </div>
    </div>
  </div>

  <MaterialLotTransactionForm
    v-model="showLotTransactionFormDialog"
    :material_id="data?.id"
    :material_name="data?.name"
    @lot-transaction-submitted="handleLotTransactionSubmitted"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Download,
  Microphone,
  Picture,
  VideoCamera,
  Document,
  Van,
  Place,
  Delete,
  Edit,
  Tools,
  Coordinate,
  QuestionFilled
} from '@element-plus/icons-vue'
import { computeAverageVendorCost } from '@/composables/useSparePart'
import { formatAsLocalDateTimeString } from '@/utils/datetime'
import { searchEquipmentNodes } from '@/api/equipment'
import MaterialLotTransactionForm from '@/views/resources/components/MaterialLotTransactionForm.vue'
import LotTransactionsTable from '@/views/resources/components/LotTransactionsTable.vue'

const props = defineProps( {
  data : {
    type : Object,
    required : true
  },
  inventory_transaction_logs : {
    type : Array,
    default : () => []
  },
  all_locations : {
    type : Array,
    default : () => []
  },
  loading : {
    type : Boolean,
    default : false
  }
} )

const emit = defineEmits( ['edit', 'delete', 'refresh'] )
const { t } = useI18n()
const relatedEquipment = ref( [] )

watch(
  () => props.data?.id,
  async newId => {
    if ( newId ) {
      await loadRelatedEquipment( newId )
    }
  },
  { immediate : true }
)

const showLotTransactionFormDialog = ref( false )

const avgCost = computed( () => computeAverageVendorCost( props.data?.spare_part_vendors || [] ) )

const hasImageAttachments = computed( () => {
  return props.data?.image_list && props.data.image_list.length > 0
} )

const hasFileAttachments = computed( () => {
  return props.data?.file_list && props.data.file_list.length > 0
} )

const processedFileList = computed( () => {
  if ( !props.data?.file_list || !Array.isArray( props.data.file_list ) ) {
    return []
  }

  return props.data.file_list.map( ( url, index ) => {
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

function handleCreateLotTransaction() {
  showLotTransactionFormDialog.value = true
}

function handleLotTransactionSubmitted() {
  emit( 'refresh' )
}

// function handleManufacturerClicked( manufacturer ) {
//   emit( 'viewManufacturerDetail', manufacturer.id )
// }

function getLocationNameById( id ) {
  if ( !id ) {
    return '-'
  }

  const loc = props.all_locations.find( loc => loc.id === id )
  return loc?.name
}

async function loadRelatedEquipment( id ) {
  if ( !id ) {
    return
  }

  try {
    const res = await searchEquipmentNodes(
      {
        spare_part_ids : [id]
      },
      1,
      1000,
      'createdAt',
      'DESC'
    )

    relatedEquipment.value = res.data.content.filter( e => e?.status === 1 )
  } catch ( e ) {}
}
</script>

<style scoped lang="scss">
.sp-detail {
  display: flex;
  flex-direction: column;
  height: 100%; /* occupy full height of parent container */
  overflow: hidden; /* prevent body scrolling */
}

/* Fixed header */
.sp-detail .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 12px 0;
  margin-left: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

/* Scrollable content area */
.sp-detail .scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.card-list {
  display: flex;
  flex-direction: column; /* vertical stack */
  gap: 10px; /* space between cards */
}

.card-list :deep(.el-card) {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
}

.card-root-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 50px;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.card-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
  text-align: left;
}

.row-value {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.label {
  font-weight: 600;
  margin-bottom: 4px;
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
    margin-bottom: 8px;
    display: block;
    font-weight: 400;
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

.individual-image-display {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  flex-shrink: 0;
}

.error-image-display {
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

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 36px 0px;
}

.title {
  font-weight: 600;
}

.card-root-content .request-image {
  flex-shrink: 0;
}

.card-root-content .request-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 22px;
    color: var(--el-color-primary);
  }
}

// Request Grid Styles
.request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 48px;

  .request-card {
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

    .request-image,
    .request-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .request-icon {
      background: var(--el-color-primary-light-9);

      .el-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }

      &.workorder-request-icon {
        background: var(--el-color-success-light-9);

        .el-icon {
          color: var(--el-color-success);
        }
      }
    }

    .request-thumbnail {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    .request-info {
      flex: 1;
      margin-left: 12px;
      min-width: 0;

      .request-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .request-code {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.request-no-data {
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);

  &.in-stock {
    color: var(--el-color-success);
  }

  &.low-stock {
    color: var(--el-color-warning);
  }

  &.out-of-stock {
    color: var(--el-color-danger);
  }
}

// Work Order Progress Styles
.progress-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;

  .section-title {
    margin: 0;
    flex-shrink: 0;
  }

  .progress-stats {
    display: flex;
    flex: 1;
    justify-content: space-around;
    gap: 120px;
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

        &.in-stock {
          color: var(--el-color-success);
        }

        &.low-stock {
          color: var(--el-color-warning);
        }

        &.out-of-stock {
          color: var(--el-color-danger);
        }
      }
    }
  }
}
</style>

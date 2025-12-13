<template>
  <div class="sp-list">
    <div
      style="
        display: flex;
        flex-direction: row;
        padding: 8px;
        justify-content: space-between;
        border-bottom: 1px solid var(--el-border-color-lighter);
        align-items: center;
      "
    >
      <div style="font-size: 13px; color: var(--el-text-color-secondary)">
        {{
          'Showing ' +
          `${(currentPage - 1) * selectedPageSize + 1} to ${
            currentPage * selectedPageSize > total ? total : currentPage * selectedPageSize
          } of ${total} items`
        }}
      </div>

      <div>
        <el-select v-model="selectedPageSize" @change="handlePageSizeChange" size="small" style="width: 100px">
          <el-option v-for="size in allPageSizes" :key="size" :label="size" :value="size" />
        </el-select>
      </div>
    </div>

    <div class="list-scroll-area">
      <div v-if="loading">
        <el-skeleton v-for="i in 5" :key="i" style="padding: 20px" animated />
      </div>

      <div v-else>
        <el-empty v-if="!list?.length" :description="t('common.noData')" />

        <el-row :gutter="16" style="margin: 0">
          <el-col v-for="item in list" :key="item.id" style="padding: 0">
            <el-card
              shadow="hover"
              @click="handleClicked(item)"
              class="card"
              :class="{
                selected: props.modelValue === item.id,
                'low-stock': item.current_stock <= (item.reorder_point ?? 0),
                'out-of-stock': item.current_stock <= 0,
              }"
            >
              <!-- Card Header -->
              <div class="card-header">
                <div class="card-id">#{{ item.id }}</div>
              </div>

              <!-- Card Content -->
              <div class="card-content">
                <!-- Main Content Area -->
                <div class="content-main">
                  <!-- Part Title -->
                  <h4 class="card-title" :title="item.name">
                    {{ item.name }}
                  </h4>

                  <!-- Code -->
                  <div class="card-meta">
                    <span class="meta-label">Code:</span>
                    <span class="meta-value">{{ item.code || '-' }}</span>
                  </div>

                  <!-- Location -->
                  <div v-if="item.inventories && item.inventories.length > 0" class="card-meta">
                    <span class="meta-label">Location:</span>
                    <el-tooltip
                      placement="top"
                      effect="dark"
                      :content="item.inventories.map(inv => inv.location?.name).join(', ')"
                    >
                      <span class="meta-value ellipsis">{{ formatFirstLocation(item.inventories) }}</span>
                    </el-tooltip>
                  </div>

                  <!-- Stock and Price -->
                  <div class="card-meta">
                    <span class="meta-label">Stock:</span>
                    <span class="meta-value" :class="{
                      'stock-critical': item.current_stock <= 0,
                      'stock-warning': item.current_stock > 0 && item.current_stock <= (item.reorder_point ?? 0),
                      'stock-normal': item.current_stock > (item.reorder_point ?? 0)
                    }">
                      {{ item.current_stock ?? 0 }} {{ item.quantity_uom.name }}
                    </span>
                  </div>

                  <div class="card-meta">
                    <span class="meta-label">Avg Price:</span>
                    <span class="meta-value">{{ item.average_unit_cost?.avg ? '$' + item.average_unit_cost?.avg : '-' }}</span>
                  </div>

                  <!-- Status and Category Badges -->
                  <div class="card-badges">
                    <el-tag v-if="item.current_stock <= 0" type="danger" size="small">Out Of Stock</el-tag>
                    <el-tag v-else-if="item.current_stock <= (item.reorder_point ?? 0)" type="warning" size="small">Low Stock</el-tag>
                    <el-tag v-if="item.spare_parts_class" type="info" size="small">
                      {{ item.spare_parts_class?.name }}
                    </el-tag>
                  </div>
                </div>

                <!-- Circular Thumbnail on Right -->
                <div class="card-thumbnail-circle">
                  <el-image
                    :src="item.image_list?.[0] || ''"
                    fit="cover"
                    :preview-src-list="item.image_list"
                    :class="['circular-image', { 'no-image': !item.image_list || !item.image_list.length }]"
                    :z-index="2000"
                    preview-teleported
                  >
                    <template #error>
                      <div class="image-slot-circle">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="pagination" v-if="total > 0">
      <el-pagination
        layout="prev, pager, next, jumper"
        v-model:current-page="currentPage"
        :page-size="selectedPageSize"
        :pager-count="5"
        :total="total"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import { Picture } from '@element-plus/icons-vue'

const props = defineProps( {
  list : { type : Array, default : () => [] },
  loading : { type : Boolean, default : false },
  total : { type : Number, default : 0 },
  page : {
    type : Number,
    required : true
  },
  modelValue : {
    type : Number,
    default : null
  }
} )

const emits = defineEmits( ['select', 'page-change', 'page-size-change', 'update:modelValue'] )

const { t } = useI18n()

const currentPage = ref( props.page )
const selectedPageSize = ref( 20 )
const allPageSizes = [10, 20, 50]

function handleClicked( item ) {
  emits( 'update:modelValue', item.id )
  emits( 'select', item.id )
}

function handlePageChange( newPage ) {
  currentPage.value = newPage
  emits( 'page-change', newPage )
}

function handlePageSizeChange( newPageSize ) {
  selectedPageSize.value = newPageSize
  emits( 'page-size-change', newPageSize )
}

function formatFirstLocation( inventories ) {
  const names = inventories.map( inv => inv.location?.name ).filter( Boolean )

  if ( names.length === 0 ) {
    return '-'
  }

  if ( names.length === 1 ) {
    return names[0]
  }

  return `${names[0]} (+${names.length - 1} more)`
}

// Sync local page number with root components' page number
watch(
  () => props.page,
  ( newVal ) => {
    currentPage.value = newVal
  }
)

</script>

<style scoped lang="scss">
.sp-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  overflow: hidden;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .card-id {
    font-weight: 600;
    color: var(--el-color-primary);
    font-size: 14px;
  }
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .content-main {
    flex: 1;
    min-width: 0; // Prevents flex item from overflowing

    .card-title {
      font-size: 17px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin: 0 0 12px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      margin-bottom: 8px;
      font-size: 13px;
      align-items: center;

      .meta-label {
        color: var(--el-text-color-secondary);
        margin-right: 8px;
        min-width: 80px;
        font-weight: 500;
        flex-shrink: 0;
      }

      .meta-value {
        color: var(--el-text-color-primary);
        flex: 1;
        min-width: 0;

        &.stock-critical {
          color: var(--el-color-danger);
          font-weight: 600;
        }

        &.stock-warning {
          color: var(--el-color-warning);
          font-weight: 600;
        }

        &.stock-normal {
          color: var(--el-color-success);
          font-weight: 600;
        }
      }
    }

    .card-badges {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
  }
}

:deep(.el-card) {
  --el-card-border-radius: 8px;
  --el-card-padding: 16px;
}

.card {
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.low-stock {
    border-left: 2px solid var(--el-color-warning);
  }

  &.out-of-stock {
    border-left: 2px solid var(--el-color-danger);
  }
}

/* scrollable card list */
.list-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 0;
  display: flex;
  flex-direction: column;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 3px;

    &:hover {
      background: var(--el-text-color-secondary);
    }
  }

  :deep(.el-skeleton) {
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    padding: 20px;
  }
}

/* keep pagination visible at bottom */
.pagination {
  flex-shrink: 0;
  background: #fff;
  padding: 8px 0;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--el-border-color-lighter);
}

.card-thumbnail-circle {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  margin-left: 10px;

  .circular-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--el-border-color-lighter);
    background: white;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
      transform: scale(1.05);
    }

    &.no-image {
      cursor: default;

      &:hover {
        border-color: var(--el-border-color-lighter);
        transform: none;
      }
    }

    // Only apply border-radius to the image container, not the preview
    :deep(.el-image__inner) {
      border-radius: 50%;
      object-fit: cover;
    }

    // Ensure preview functionality works correctly
    :deep(.el-image__preview) {
      border-radius: 0 !important;
    }
  }

  .image-slot-circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 24px;
    border-radius: 50%;
  }
}
</style>

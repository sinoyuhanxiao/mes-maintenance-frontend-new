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

        <el-row :gutter="16" style="margin: 0; gap: 6px">
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
              <div class="cards-container">
                <div class="meta">
                  <div class="id ellipsis">#{{ item.id }}</div>

                  <div class="title ellipsis">{{ item.name }}</div>

                  <div class="sub ellipsis">{{ 'Manufacturer Code' }}: {{ item.code || '-' }}</div>

                  <!-- Associated Inventory Location  -->
                  <div v-if="item.inventories && item.inventories.length > 0">
                    <el-tooltip
                        placement="top"
                        effect="dark"
                        :content="item.inventories.map(inv => inv.location?.name).join(', ')"
                    >
                      <div class="sub ellipsis">
                        At
                        {{ formatFirstLocation(item.inventories) }}
                      </div>
                    </el-tooltip>
                  </div>

<!--                  <div class="sub ellipsis">{{ 'Universal Code' }}: {{ item.universal_code || '-' }}</div>-->

                  <div class="evenly">
                    <div class="sub" style="white-space: nowrap; margin-right: 6px">
                      {{ 'Total Quantity' }}: {{ item.current_stock ?? 0 }}

                      {{ item.quantity_uom.name }}
                    </div>

                    <div class="sub ellipsis">{{ 'Avg. Unit Price' }}: {{ item.average_unit_cost?.avg ? '$' + item.average_unit_cost?.avg : '-' }}</div>
                  </div>

                  <div class="stock-tags">
                    <el-tag v-if="item.current_stock <= 0" type="danger" size="small">{{ 'Out Of Stock' }}</el-tag>

                    <el-tag v-else-if="item.current_stock <= (item.reorder_point ?? 0)" type="warning" size="small">
                      {{ 'Low Stock' }}
                    </el-tag>

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

.meta {
  gap: 8px;
}

.meta .title {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
}

.meta .id {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 14px;
  margin-bottom: 4px;
}

.meta .sub {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.stock {
  margin-top: 6px;
  font-weight: 500;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.evenly {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

:deep(.el-card) {
  --el-card-border-radius: 8px;
}

.card {
  cursor: pointer;
  transition: all 0.2s ease;

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

.cards-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* meta: 70% width */
.cards-container .meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  box-sizing: border-box;
  min-width: 0;
}

/* image: 30% width */
.cards-container .image {
  flex: 0 0 30%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-tags {
  display: flex;
  gap: 10px;
}

/* make image fill its area nicely */
.thumb {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
}

/* scrollable card list */
.list-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px; /* avoid overlap with scrollbar */
  display: flex;
  flex-direction: column;

  :deep(.el-skeleton) {
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
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

<template>
  <div class="t2-sub-items">
    <!-- LEFT: Image -->
    <div class="image" :class="{ 'no-border': items.length === 0 }">
      <template v-if="loading">
        <div class="loading-text"></div>
      </template>

      <template v-else-if="hasValidImage">
        <el-image
          :src="imageUrl"
          :alt="imageAlt"
          fit="contain"
          :preview-src-list="[imageUrl]"
          :hide-on-click-modal="true"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </template>

      <template v-else>
        <div class="no-image-text">No exploded view available</div>
      </template>
    </div>

    <!-- RIGHT: Cards -->
    <div v-if="items.length > 0" class="label-cards">
      <div v-for="(item, index) in items" :key="item.id" class="card-wrapper" @click="onCardClick(item.id)">
        <EquipmentSubItemCard
          :number="index + 1"
          :text="item.text"
          :text-type="item.textType || 'default'"
          :text-size="item.textSize || 'default'"
          :circle-color="item.circleColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import EquipmentSubItemCard from './components/EquipmentSubItemCard.vue'
import { getEquipmentById, getEquipmentSubtree } from '@/api/equipment.js'

const props = defineProps({
  equipmentId: { type: [Number, String], required: true },
})
const emit = defineEmits(['request-select-node'])

const imageUrl = ref('')
const imageAlt = ref('Equipment image')
const items = ref([])
const loading = ref(false)

const BLUE = 'var(--el-color-primary)'
const unwrap = resp => resp?.data?.data ?? resp?.data ?? resp ?? {}

const hasValidImage = computed(() => !!imageUrl.value && !/default-image|null|undefined|^$/.test(imageUrl.value))

async function load() {
  if (!props.equipmentId) return
  loading.value = true
  try {
    const d = unwrap(await getEquipmentById(props.equipmentId)) || {}
    const exploded = d.exploded_view_drawing ?? d.explodedViewDrawing ?? d.exploded_view ?? ''
    imageUrl.value = exploded && !/null|undefined|^$/.test(exploded) ? exploded : ''
    imageAlt.value = d.name ? `Exploded view of ${d.name}` : 'Equipment image'

    const root = unwrap(await getEquipmentSubtree(props.equipmentId)) || {}
    const children = Array.isArray(root.children) ? root.children : []
    items.value = children.map((c, i) => ({
      id: c.id,
      text: c.name || c.label || `Item ${i + 1}`,
      textType: 'default',
      textSize: 'default',
      circleColor: BLUE,
    }))
  } catch {
    imageUrl.value = ''
    items.value = []
  } finally {
    loading.value = false
  }
}

function onCardClick(id) {
  emit('request-select-node', Number(id))
}

onMounted(load)
watch(() => props.equipmentId, load, { immediate: false })
</script>

<style scoped>
.t2-sub-items {
  display: flex;
  width: 100%;
  height: 56svh;
  overflow: hidden;
}

@media (min-width: 1920px) {
  .t2-sub-items {
    height: 68dvh;
  }
}

.t2-sub-items > .image,
.t2-sub-items > .label-cards {
  min-width: 0;
}

/* Image section */
.image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-right: 1px solid #eee;
  background-color: #fff;
}

/* Remove border when no subitems */
.image.no-border {
  border-right: none;
}

/* Status text styles */
.loading-text,
.no-image-text {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 15px;
  color: #999;
}
.loading-text {
  color: #aaa;
}

/* Right panel */
.label-cards {
  width: clamp(170px, 24vw, 320px);
  overflow-y: auto;
  padding: 0 12px;
  background: #fff;
  border-left: 1px solid #eee;
}

@media (max-width: 900px) {
  .label-cards {
    width: clamp(160px, 28vw, 220px);
  }
}

.card-wrapper {
  cursor: pointer;
  transition: transform 0.15s ease;
  margin-bottom: 10px;
}
.card-wrapper:hover {
  transform: translateY(-2px);
}
</style>

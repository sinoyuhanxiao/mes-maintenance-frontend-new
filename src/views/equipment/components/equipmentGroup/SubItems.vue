<template>
  <div class="t2-sub-items">
    <!-- LEFT: Image -->
    <div class="image">
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
    </div>

    <!-- RIGHT: Cards -->
    <div class="label-cards">
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
import { ref, onMounted, watch } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import EquipmentSubItemCard from './components/EquipmentSubItemCard.vue'
import defaultImageUrl from '@/assets/imgs/default-image.png'
import { getEquipmentById, getEquipmentSubtree } from '@/api/equipment.js'

const props = defineProps( {
  equipmentId : { type : [Number, String], required : true }
} )

const emit = defineEmits( ['request-select-node'] )

const imageUrl = ref( defaultImageUrl )
const imageAlt = ref( 'Equipment image' )
const items = ref( [] )

const BLUE = 'var(--el-color-primary)'
const unwrap = resp => resp?.data?.data ?? resp?.data ?? resp ?? {}

async function load() {
  if ( !props.equipmentId ) return
  try {
    const d = unwrap( await getEquipmentById( props.equipmentId ) ) || {}
    imageUrl.value = d.exploded_view_drawing ?? d.explodedViewDrawing ?? d.exploded_view ?? defaultImageUrl
    imageAlt.value = d.name ? `Exploded view of ${d.name}` : 'Equipment image'

    const root = unwrap( await getEquipmentSubtree( props.equipmentId ) ) || {}
    const children = Array.isArray( root.children ) ? root.children : []
    items.value = children.map( ( c, i ) => ( {
      id : c.id,
      text : c.name || c.label || `Item ${i + 1}`,
      textType : 'default',
      textSize : 'default',
      circleColor : BLUE
    } ) )
  } catch {
    imageUrl.value = defaultImageUrl
    items.value = []
  }
}

function onCardClick( id ) {
  emit( 'request-select-node', Number( id ) )
}

onMounted( load )
watch( () => props.equipmentId, load, { immediate : false } )
</script>

<style scoped>
/* Base: smaller screens use ~55% viewport height */
.t2-sub-items {
  display: flex;
  width: 100%;
  height: 56svh; /* smaller devices */
  overflow: hidden; /* keep tab body from scrolling */
}

/* Large monitors: bump to ~70% viewport height */
@media (min-width: 1920px) {
  .t2-sub-items {
    height: 68dvh; /* desktops/monitors */
  }
}

/* Let both columns shrink when space is tight */
.t2-sub-items > .image,
.t2-sub-items > .label-cards {
  min-width: 0;
}

/* Image column */
.image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Cards column — responsive width */
.label-cards {
  width: clamp(170px, 24vw, 320px);
  border-left: 1px solid #eee;
  overflow-y: auto;
  padding: 0 12px;
  background: #fff;
}

/* Optional: make it a bit tighter on tablets */
@media (max-width: 900px) {
  .label-cards {
    width: clamp(160px, 28vw, 220px);
  }
}

.card-wrapper {
  cursor: pointer;
  transition: transform 0.15s ease;
  margin-bottom: 10px; /* spacing between cards */
}
.card-wrapper:hover {
  transform: translateY(-2px);
}
</style>

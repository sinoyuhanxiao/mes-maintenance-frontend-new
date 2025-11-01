<template>
  <div class="location-path">
    <el-descriptions :column="1" direction="vertical">
      <el-descriptions-item :label="label">
        <el-breadcrumb :separator-icon="ArrowRight">
          <template v-if="computedPath.length">
            <el-breadcrumb-item v-for="loc in computedPath" :key="loc.id" class="loc-item">
              <span v-if="clickable" class="loc-clickable" @click="() => $emit('item-click', loc)">
                {{ loc.name }}
              </span>
              <span v-else>{{ loc.name }}</span>
            </el-breadcrumb-item>
          </template>

          <el-breadcrumb-item v-else>{{ emptyText }}</el-breadcrumb-item>
        </el-breadcrumb>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { getLocationPathById } from '@/api/location.js'

/**
 * Flexible API:
 * - Pass `path` directly (array of {id,name})
 * - OR pass `locationId` and let this component fetch the path.
 */
const props = defineProps( {
  label : { type : String, default : 'Location Path' },
  emptyText : { type : String, default : 'No location path available' },
  path : { type : Array, default : () => [] }, // direct data (wins if non-empty)
  locationId : { type : [Number, String], default : null }, // fetch if provided and path empty
  clickable : { type : Boolean, default : false } // emit click events on crumbs
} )

const emits = defineEmits( ['item-click', 'fetch-error'] )

const fetchedPath = ref( [] )

const computedPath = computed( () => {
  if ( props.path && props.path.length ) return props.path
  return fetchedPath.value || []
} )

async function fetchPath() {
  if ( !props.locationId || ( props.path && props.path.length ) ) return
  try {
    const resp = await getLocationPathById( props.locationId )
    fetchedPath.value = resp?.data || []
  } catch ( e ) {
    emits( 'fetch-error', e )
    fetchedPath.value = []
  }
}

onMounted( fetchPath )
watch( () => props.locationId, fetchPath )
</script>

<style scoped>
.location-path :deep(.el-breadcrumb__item) {
  line-height: 1.6;
}
.loc-clickable {
  cursor: pointer;
  text-decoration: underline;
}
</style>

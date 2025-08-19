<template>
  <!-- <el-text>{{ localData }}</el-text> -->
  <el-card>
    <div class="details-layout">
      <div class="details-panel">
        <el-descriptions :column="3" direction="vertical" label-width="33%">
          <el-descriptions-item :span="1" label="Part Name">{{ localData.name }}</el-descriptions-item>
          <el-descriptions-item :span="1" label="Material Code">{{ localData.code }}</el-descriptions-item>
          <el-descriptions-item :span="1" label="Inventory Code">{{ localData.universal_code }}</el-descriptions-item>

          <el-descriptions-item label="Manufacturer">{{
            localData.manufacturer ? localData.manufacturer.name : 'n/a'
          }}</el-descriptions-item>
          <el-descriptions-item label="Spare Part Class">{{
            localData.spare_parts_class ? localData.spare_parts_class.name : ''
          }}</el-descriptions-item>
          <el-descriptions-item label="Reorder Point">{{ localData.reorder_point }}</el-descriptions-item>

          <el-descriptions-item label="Current Stock">
            <el-text :type="localData.current_stock < localData.minimum_stock_level ? 'danger' : ''">
              {{ localData.current_stock }}
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="Minimum Stock">{{ localData.minimum_stock_level }}</el-descriptions-item>
          <el-descriptions-item label="Maximum Stock">{{ localData.maximum_stock_level }}</el-descriptions-item>

          <el-descriptions-item label="Description"
:span="3"
            ><span v-if="localData.description" style="padding: 5px">{{
              localData.description
            }}</span></el-descriptions-item
          >
        </el-descriptions>

        <div class="displays">
          <el-card>
            <el-text tag="b">Related Assets</el-text>
            <hr />
            <!-- <el-text>{{ nodes }}</el-text> -->
            <el-breadcrumb v-if="nodes" style="padding-top: 10px" :separator-icon="Minus">
              <el-breadcrumb-item v-for="node in nodes" :key="node.id" :label="node.name">{{
                node.name
              }}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-text v-if="!nodes || nodes.length == 0">No Associated Asssets</el-text>
          </el-card>
        </div>

        <div class="displays">
          <el-card>
            <el-text tag="b">Related Images</el-text>
            <hr />
            <img
              v-if="localData.image_list"
              :src="localData.image_list"
              style="border-radius: 100%; max-height: 150px; aspect-ratio: 1/0.75"
            />
            <el-text v-if="!localData.image_list">No Attached Images</el-text>
          </el-card>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Minus } from '@element-plus/icons-vue'
import { getEquipmentNodes } from '../../../api/equipment'

const props = defineProps( {
  data : Object
} )

const localData = ref( props.data )
const nodes = ref( null )

async function getNodeData() {
  const response = await getEquipmentNodes( 1, 100, 'name', 'ASC', { spare_part_ids : [props.data.id] } )

  nodes.value = response.data.content
}

watch(
  () => props.data,
  newData => {
    localData.value = { ...newData }
    getNodeData()
  },
  { immediate : true, deep : true },
  console.log( localData.value )
)
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: 652px;
  height: 592px;
}

.details-panel {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  flex: 1;
  gap: 1rem;
}

.displays {
  margin-top: 10px;
}

@media (max-width: 1600px) {
  .details-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    max-height: 377px;
  }
}
</style>

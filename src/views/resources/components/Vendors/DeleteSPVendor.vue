<template>
  <el-dialog style="top: 20%"
width="500"
title="Remove Vendor"
v-model="removeVendor"
    ><ConfirmDeletion :data="toRemove"
@removeVendor="handleRemove"
@close="removeVendor = false"
  /></el-dialog>
  <el-card>
    <div class="details-layout">
      <el-descriptions class="descriptions" :column="2" :label-width="100" title="Ordering">
        <el-descriptions-item width="50%" label="Ordering Code:">{{ props.spvData.order_code }}</el-descriptions-item>
        <el-descriptions-item label="Unit Price:">
          {{
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.spvData.unit_price)
          }}</el-descriptions-item
        >
        <el-descriptions-item label="Currency:">{{ props.spvData.price_uom.name }}</el-descriptions-item>
        <el-descriptions-item label="Lead Time:">{{ props.spvData.lead_time_days }} Days</el-descriptions-item>
      </el-descriptions>

      <!-- <el-descriptions class="descriptions" :column="2" :label-width="100" title="Part">
        <el-descriptions-item width="50%" label="Part Name:">{{ props.spvData.name }}</el-descriptions-item>
        <el-descriptions-item label="Part Code:">{{ props.spvData.code }}</el-descriptions-item>
        <el-descriptions-item label="Reorder Point:">{{ props.spvData.reorder_point }}</el-descriptions-item>
        <el-descriptions-item label="Current Stock:">{{ props.spvData.current_stock }}</el-descriptions-item>
      </el-descriptions> -->

      <el-descriptions class="descriptions" :column="2" :label-width="100" title="Vendor">
        <el-descriptions-item width="50%" label="Vendor:">{{ props.spvData.vendor.name }}</el-descriptions-item>
        <el-descriptions-item label="Phone:">{{ props.spvData.vendor.phone_number }}</el-descriptions-item>
        <el-descriptions-item label="Email:">{{ props.spvData.vendor.email }}</el-descriptions-item>
      </el-descriptions>
      <!-- Delete Button  -->
    </div>
    <div>
      <el-form-item><el-button @click="deleteVendor" type="danger">Remove Vendor</el-button></el-form-item>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import ConfirmDeletion from './ConfirmDeletion.vue'
import { updateSparePart } from '../../../../api/resources'
import { ElMessage } from 'element-plus'

const props = defineProps( {
  spvData : Object,
  sparePart : Object
} )

const existingVendors = ref( [] )

const removalRequest = ref( [] )

watch(
  [() => props.spvData, () => props.sparePart],
  ( [newSpv, newSparePart] ) => {
    existingVendors.value =
      newSparePart?.spare_part_vendors?.map( v => ( {
        vendor_id : v.vendor?.id ?? null,
        order_code : v.order_code ?? null,
        lead_time_days : v.lead_time_days ?? null,
        unit_price : v.unit_price ?? null,
        price_uom_id : v.price_uom?.id ?? null
      } ) ) ?? []

    removalRequest.value = existingVendors.value.filter( v => v.vendor_id != newSpv.vendor.id )
  },
  { deep : true, immediate : true }
)

const emit = defineEmits( ['deletedVendor'] )

const removeVendor = ref( null )
const toRemove = ref( null )

const vendorDeleted = vendor => {
  ElMessage( {
    message : 'Spare Part Vendor Removed: ' + vendor,
    type : 'success'
  } )
}

function deleteVendor() {
  toRemove.value = props.spvData
  removeVendor.value = true
}

async function handleRemove() {
  const newSparePartVendor = await updateSparePart( props.sparePart.id, {
    code : props.sparePart.code,
    vendor_requests : removalRequest.value
  } )
  if ( newSparePartVendor ) {
    emit( 'deletedVendor', newSparePartVendor.data )
    vendorDeleted( props.spvData.vendor.name )
    removeVendor.value = false
  }
}
</script>

<style scoped>
.details-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.descriptions {
  margin-top: 10px;
  margin-bottom: 10px;
}

@media (max-width: 1600px) {
  .details-layout {
    /* height: 375px; */
    overflow-y: auto;
    padding: 5px;
  }
}
</style>

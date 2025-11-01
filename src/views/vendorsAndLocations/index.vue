<template>
  <MesLayout title="Vendors & Locations" view-mode="todo">
    <template #head>
      <UnifiedVendorLocationFilters :key="activeTab" :active-tab="activeTab" @create="handleCreate" />
    </template>

    <template #body>
      <VendorAndLocationsSplitView
        ref="splitViewRef"
        v-model:activeTab="activeTab"
        :show-create-dialog="showCreateDialog"
        @update:show-create-dialog="val => (showCreateDialog = val)"
      />
    </template>
  </MesLayout>
</template>

<script setup>
import { ref } from 'vue'
import MesLayout from '@/components/MesLayout/src/index.vue'
import UnifiedVendorLocationFilters from '@/views/vendorsAndLocations/Vendors/UnifiedVendorLocationFilters.vue'
import VendorAndLocationsSplitView from '@/views/vendorsAndLocations/Vendors/VendorAndLocationsSplitView.vue'

const activeTab = ref( 'vendors' )
const showCreateDialog = ref( false )
const splitViewRef = ref( null )

const handleCreate = () => {
  showCreateDialog.value = true
}
</script>

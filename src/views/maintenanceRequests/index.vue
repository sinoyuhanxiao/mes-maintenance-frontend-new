<template>
  <div class="maintenance-requests-container">
    <MaintenanceRequestsView ref="mainViewRef" />
  </div>
</template>

<script setup>
import MaintenanceRequestsView from './views/MaintenanceRequestsView.vue'

defineOptions( {
  name : 'MaintenanceRequestsIndex'
} )
</script>

<style scoped>
.maintenance-requests-container {
  height: 100%;
}
</style>

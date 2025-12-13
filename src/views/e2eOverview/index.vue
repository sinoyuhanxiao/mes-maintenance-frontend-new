<template>
  <div class="e2e-overview-container">
    <!-- Top Metrics Bar -->
    <MetricsBar :metrics="liveMetrics" @oee-click="handleOeeClick" />

    <!-- Panzoom Carousel -->
    <PanzoomCarousel :is-e2e-mode="true" :machine-oee-data="machineOEEData" :style="{ height: panzoomHeight }" />

    <!-- OEE Detail Drawer -->
    <OEEDrawer v-model:visible="showOeeDrawer" @close="handleOeeDrawerClose" @oee-update="handleOeeUpdate" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MetricsBar from './components/MetricsBar.vue'
import PanzoomCarousel from '@/components/PanzoomCarousel'
import OEEDrawer from './components/OEEDrawer.vue'

// ========================================
// METRICS CONFIGURATION CENTER
// Modify these values to customize all metrics behavior
// ========================================
const METRICS_CONFIG = {
  // Overall Equipment Effectiveness (OEE)
  OEE : {
    min : 60.0, // Minimum OEE percentage (French fries production)
    max : 85.0, // Maximum OEE percentage (French fries production)
    maxVariation : 0.5, // Maximum variation per update (±0.5%)
    decimals : 1, // Number of decimal places to display
    updateInterval : 1000 // Update every second (milliseconds)
  },

  // Production Today
  PRODUCTION : {
    min : 0, // Starting production (tons) at beginning of day
    max : 65, // Target production (tons) at end of day
    target : 66, // Daily production target (tons)
    variation : 2, // Random variation (+/- tons)
    decimals : 2, // Number of decimal places to display
    updateInterval : 12000, // Update every 2 minutes (milliseconds)
    timeBased : true // Progress based on time of day (true) or random (false)
  },

  // Active Work Orders
  WORK_ORDERS : {
    activeMin : 80, // Minimum active work orders
    activeMax : 100, // Maximum active work orders
    totalMin : 100, // Minimum total work orders
    totalMax : 120, // Maximum total work orders
    updateInterval : 100000 // Update every 10 seconds (milliseconds)
  },

  // Active Alarms
  ALARMS : {
    min : 0, // Minimum number of alarms
    max : 25, // Maximum number of alarms
    updateInterval : 60000 // Update every 1 minute (milliseconds)
  },

  // Active Workforce
  WORKFORCE : {
    min : 56, // Minimum personnel count
    max : 89, // Maximum personnel count
    updateInterval : 10000 // Update every 10 seconds (milliseconds)
  }
}

// Helper function to get initial shift based on current browser time
const getInitialShift = () => {
  const currentHour = new Date().getHours()
  return currentHour >= 7 && currentHour < 19 ? 'Day Shift' : 'Night Shift'
}

// Live Metrics Data - Initial values set from configuration
const liveMetrics = ref( {
  oee : 72.5, // Start at mid-range for realistic French fries production OEE
  previousOee : 72.5, // Track previous OEE for trend calculation
  productionCount : METRICS_CONFIG.PRODUCTION.min,
  productionTarget : METRICS_CONFIG.PRODUCTION.target,
  activeWorkOrders : METRICS_CONFIG.WORK_ORDERS.activeMin,
  totalWorkOrders : METRICS_CONFIG.WORK_ORDERS.totalMin,
  alertCount : METRICS_CONFIG.ALARMS.min,
  currentShift : getInitialShift(), // Dynamically set based on browser time
  workforceCount : METRICS_CONFIG.WORKFORCE.min
} )

// Dynamic panzoom height
const panzoomHeight = ref( 'auto' )

// OEE Drawer visibility
const showOeeDrawer = ref( false )

// Machine OEE data from drawer
const machineOEEData = ref( {} )

// Timer references for cleanup
const oeeTimer = null
let productionTimer = null
let alarmsTimer = null
let workforceTimer = null
let workOrdersTimer = null
let shiftTimer = null

// OEE update function - COMMENTED OUT: Now controlled by OEE Drawer
// Updates with small incremental changes for realistic variation
// const updateOEE = () => {
//   const config = METRICS_CONFIG.OEE
//   const currentOEE = liveMetrics.value.oee

//   // Store previous OEE for trend calculation
//   liveMetrics.value.previousOee = currentOEE

//   // Generate a small random variation between -maxVariation and +maxVariation
//   const variation = ( Math.random() - 0.5 ) * 2 * config.maxVariation

//   // Apply variation and constrain within min/max bounds
//   let newOEE = currentOEE + variation
//   newOEE = Math.max( config.min, Math.min( config.max, newOEE ) )

//   liveMetrics.value.oee = parseFloat( newOEE.toFixed( config.decimals ) )
// }

// Production update function - Uses METRICS_CONFIG.PRODUCTION
const updateProduction = () => {
  const config = METRICS_CONFIG.PRODUCTION
  let newProduction

  if ( config.timeBased ) {
    // Time-based progression throughout the day
    const now = new Date()
    const startOfDay = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0 )
    const endOfDay = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59 )
    const dayProgress = ( now - startOfDay ) / ( endOfDay - startOfDay )

    const baseProduction = dayProgress * config.max
    const randomVariation = ( Math.random() - 0.5 ) * config.variation
    newProduction = Math.max( config.min, Math.min( config.max, baseProduction + randomVariation ) )
  } else {
    // Random value between min and max
    const range = config.max - config.min
    newProduction = Math.random() * range + config.min
  }

  liveMetrics.value.productionCount = parseFloat( newProduction.toFixed( config.decimals ) )
}

// Alarms update function - Uses METRICS_CONFIG.ALARMS
const updateAlarms = () => {
  const config = METRICS_CONFIG.ALARMS
  const range = config.max - config.min + 1
  liveMetrics.value.alertCount = Math.floor( Math.random() * range ) + config.min
}

// Workforce update function - Uses METRICS_CONFIG.WORKFORCE
const updateWorkforce = () => {
  const config = METRICS_CONFIG.WORKFORCE
  const range = config.max - config.min + 1
  liveMetrics.value.workforceCount = Math.floor( Math.random() * range ) + config.min
}

// Work Orders update function - Uses METRICS_CONFIG.WORK_ORDERS
const updateWorkOrders = () => {
  const config = METRICS_CONFIG.WORK_ORDERS
  const activeRange = config.activeMax - config.activeMin + 1
  const totalRange = config.totalMax - config.totalMin + 1

  liveMetrics.value.activeWorkOrders = Math.floor( Math.random() * activeRange ) + config.activeMin
  liveMetrics.value.totalWorkOrders = Math.floor( Math.random() * totalRange ) + config.totalMin
}

// Shift update function - Determines shift based on browser time
// Day Shift: 7:00 AM - 7:00 PM (07:00 - 19:00)
// Night Shift: 7:00 PM - 7:00 AM (19:00 - 07:00)
const updateShift = () => {
  const now = new Date()
  const currentHour = now.getHours()

  // Day shift is from 7 AM (7) to 7 PM (19)
  if ( currentHour >= 7 && currentHour < 19 ) {
    liveMetrics.value.currentShift = 'Day Shift'
  } else {
    liveMetrics.value.currentShift = 'Night Shift'
  }
}

// Start all metric update timers - Uses METRICS_CONFIG for intervals
const startMetricUpdates = () => {
  // Initial updates
  // updateOEE() // COMMENTED OUT: Now controlled by OEE Drawer
  updateProduction()
  updateAlarms()
  updateWorkforce()
  updateWorkOrders()
  updateShift()

  // Set up intervals using centralized configuration
  // oeeTimer = setInterval( updateOEE, METRICS_CONFIG.OEE.updateInterval ) // COMMENTED OUT: Now controlled by OEE Drawer
  productionTimer = setInterval( updateProduction, METRICS_CONFIG.PRODUCTION.updateInterval )
  alarmsTimer = setInterval( updateAlarms, METRICS_CONFIG.ALARMS.updateInterval )
  workforceTimer = setInterval( updateWorkforce, METRICS_CONFIG.WORKFORCE.updateInterval )
  workOrdersTimer = setInterval( updateWorkOrders, METRICS_CONFIG.WORK_ORDERS.updateInterval )
  // Update shift every minute to catch shift changes
  shiftTimer = setInterval( updateShift, 60000 )
}

// Stop all metric update timers
const stopMetricUpdates = () => {
  if ( oeeTimer ) clearInterval( oeeTimer )
  if ( productionTimer ) clearInterval( productionTimer )
  if ( alarmsTimer ) clearInterval( alarmsTimer )
  if ( workforceTimer ) clearInterval( workforceTimer )
  if ( workOrdersTimer ) clearInterval( workOrdersTimer )
  if ( shiftTimer ) clearInterval( shiftTimer )
}

// Handle OEE card click
const handleOeeClick = () => {
  showOeeDrawer.value = true
}

// Handle OEE drawer close
const handleOeeDrawerClose = () => {
  showOeeDrawer.value = false
}

// Handle OEE update from drawer
const handleOeeUpdate = oeeData => {
  // Store previous OEE for trend calculation
  liveMetrics.value.previousOee = liveMetrics.value.oee

  // Update current OEE from drawer
  liveMetrics.value.oee = oeeData.oee

  // Update machine OEE data for hotspots
  machineOEEData.value = oeeData.machineOEEData || {}
}

const updatePanzoomHeight = () => {
  // Get the heights of all header elements
  const navbar = document.querySelector( '.fixed-header .navbar' )
  const tagsView = document.querySelector( '#tags-view-container' )
  const metricsBar = document.querySelector( '.metrics-bar' )

  const navbarHeight = navbar ? navbar.offsetHeight : 0
  const tagsViewHeight = tagsView ? tagsView.offsetHeight : 0
  const metricsBarHeight = metricsBar ? metricsBar.offsetHeight : 0

  // Calculate available height: viewport - navbar - tags - metrics bar - bottom margin
  const availableHeight = window.innerHeight - navbarHeight - tagsViewHeight - metricsBarHeight - 20

  panzoomHeight.value = `${Math.max( availableHeight, 300 )}px`
}

let resizeTimer = null
const handleResize = () => {
  // Debounce resize events to avoid excessive updates
  clearTimeout( resizeTimer )
  resizeTimer = setTimeout( () => {
    updatePanzoomHeight()
  }, 100 )
}

onMounted( () => {
  // Start metric updates
  startMetricUpdates()

  // Delay panzoom height calculation to ensure DOM is fully rendered
  setTimeout( () => {
    updatePanzoomHeight()
  }, 100 )
  window.addEventListener( 'resize', handleResize )
} )

onBeforeUnmount( () => {
  // Stop metric updates
  stopMetricUpdates()

  window.removeEventListener( 'resize', handleResize )
  if ( resizeTimer ) {
    clearTimeout( resizeTimer )
  }
} )
</script>

<style lang="scss" scoped>
.e2e-overview-container {
  width: 100%;
  height: 100%;
  background-color: rgb(240, 242, 245);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  .panzoom-wrapper {
    .panzoom-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: grab;
      background-color: #ffffff;
      position: relative;

      &:active {
        cursor: grabbing;
      }
    }
  }
}
</style>

<style lang="scss">
// Global style for Element Plus scrollbar when containing e2e-overview
.el-scrollbar__view:has(> .e2e-overview-container) {
  height: 100%;
}
</style>

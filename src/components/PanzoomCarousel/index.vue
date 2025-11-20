<template>
  <div class="panzoom-wrapper" :class="{ 'e2e-mode': isE2eMode }">
    <!-- Zoom Controls -->
    <ZoomControls
      :panzoom-enabled="panzoomEnabled"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @reset="handleReset"
      @fullscreen="toggleFullscreen"
      @toggle-panzoom="togglePanzoom"
    />

    <!-- Activity Feed Toggle Button -->
    <div class="activity-toggle" @click="toggleActivityFeed">
      <el-icon><WarnTriangleFilled /></el-icon>
      <span v-if="unreadActivities > 0" class="badge">{{ unreadActivities }}</span>
    </div>

    <!-- Panzoom Container -->
    <div ref="panzoomContainer" class="panzoom-container" :class="{ 'panzoom-enabled': panzoomEnabled }">
      <!-- Carousel Navigation Arrows -->
      <div class="carousel-arrow carousel-arrow-left" @click="handlePrevImage">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="carousel-arrow carousel-arrow-right" @click="handleNextImage">
        <el-icon><ArrowRight /></el-icon>
      </div>

      <div ref="panzoomElement" class="panzoom-scene">
        <!-- Main E2E Image -->
        <img
          ref="e2eImage"
          :src="carouselImages[currentImageIndex].src"
          :alt="carouselImages[currentImageIndex].alt"
          class="e2e-image"
          @load="onImageLoad"
        />

        <!-- Equipment Hotspots with Status Badges -->
        <div
          v-for="zone in equipmentZones"
          :key="zone.id"
          class="equipment-hotspot"
          :class="[`status-${zone.status}`, zone.machineType]"
          :style="zone.position"
          @click="handleZoneClick(zone)"
          @mouseenter="handleZoneHover(zone, true)"
          @mouseleave="handleZoneHover(zone, false)"
        >
          <StatusBadge :status="zone.status" :show-pulse="zone.hasAlert" />
          <span class="equipment-label">{{ zone.name }}</span>
        </div>
      </div>

      <!-- Status Legend -->
      <div class="status-legend">
        <div class="legend-title">Equipment Status</div>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-dot operational"></span>
            <span>Operational</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot warning"></span>
            <span>Warning</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot error"></span>
            <span>Error</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot idle"></span>
            <span>Idle</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Minimap (shown when zoomed in) -->
    <div v-if="isZoomed" class="minimap" :style="minimapBackgroundStyle">
      <div class="minimap-viewport" :style="minimapViewportStyle"></div>
    </div>

    <!-- Activity Feed Panel -->
    <ActivityFeed :activities="recentActivities" :visible="showActivityFeed" @close="toggleActivityFeed" />

    <!-- Equipment Detail Modal -->
    <EquipmentModal v-if="selectedZone" :zone="selectedZone" :visible="showModal" @close="handleModalClose" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Panzoom from 'panzoom'
import { WarnTriangleFilled, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import ZoomControls from '@/views/e2eOverview/components/ZoomControls.vue'
import StatusBadge from '@/views/e2eOverview/components/StatusBadge.vue'
import ActivityFeed from '@/views/e2eOverview/components/ActivityFeed.vue'
import EquipmentModal from '@/views/e2eOverview/components/EquipmentModal.vue'
import fpsE2eImage from '@/assets/fps_e2e.png'
import fpsPackagingImage from '@/assets/fps_packaging.JPG'

// Router
const router = useRouter()

// Props
// eslint-disable-next-line no-unused-vars
const props = defineProps( {
  isE2eMode : {
    type : Boolean,
    default : false
  }
} )

// ========================================
// STATUS UPDATE CONFIGURATION CENTER
// Modify these values to customize status behavior
// ========================================
const STATUS_UPDATE_CONFIG = {
  updateInterval : 5000, // Update every 5 seconds (milliseconds)
  statusRatios : {
    operational : 0.7,
    warning : 0.05,
    error : 0.05,
    idle : 0.1
  }
}

// Panzoom instance
const panzoomInstance = ref( null )
const panzoomContainer = ref( null )
const panzoomElement = ref( null )
const e2eImage = ref( null )
const isZoomed = ref( false )
const currentZoom = ref( 1 )
const currentPan = ref( { x : 0, y : 0 } )

// UI State
const showActivityFeed = ref( false )
const showModal = ref( false )
const selectedZone = ref( null )
const hoveredZone = ref( null )
const unreadActivities = ref( 3 )
const currentImageIndex = ref( 0 )
const panzoomEnabled = ref( false )

// Carousel images
const carouselImages = ref( [
  {
    id : 1,
    src : fpsE2eImage,
    alt : 'FPS E2E Production Line'
  },
  {
    id : 2,
    src : fpsPackagingImage,
    alt : 'FPS Packaging Line'
  }
] )

// Equipment Zones for Image 1 (fps_e2e.png) - 9 Machines from FPS E2E Line
const equipmentZonesImage1 = ref( [
  {
    id : 1,
    name : 'Raw Receiving',
    machineType : 'raw-receiving',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-10',
    position : {
      left : '28%',
      top : '11%',
      width : '17%',
      height : '25%'
    },
    details : {
      uptime : '99.2%',
      throughput : '850 units/hr',
      nextMaintenance : '2025-01-25',
      description : 'Truck offloading, rock traps, waste hopper, storage bins'
    }
  },
  {
    id : 2,
    name : 'Pulsed Electric Field (PEF)',
    machineType : 'pef-system',
    status : 'warning',
    hasAlert : true,
    lastMaintenance : '2025-01-11',
    position : {
      left : '16%',
      top : '20%',
      width : '6%',
      height : '15%'
    },
    details : {
      uptime : '97.8%',
      throughput : '820 units/hr',
      nextMaintenance : '2025-01-26',
      description : 'OPTICEPT® dual conveyor belt chamber with PEF generator'
    }
  },
  {
    id : 3,
    name : 'Blanching',
    machineType : 'blancher',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-09',
    position : {
      left : '13%',
      top : '48%',
      width : '26%',
      height : '16%'
    },
    details : {
      uptime : '98.5%',
      throughput : '840 units/hr',
      nextMaintenance : '2025-01-24',
      description : 'Multi zone belt blanchers with hot and cold water'
    }
  },
  {
    id : 4,
    name : 'Drying',
    machineType : 'dryer',
    status : 'idle',
    hasAlert : false,
    lastMaintenance : '2025-01-08',
    position : {
      left : '20%',
      top : '65%',
      width : '20%',
      height : '18%'
    },
    details : {
      uptime : '94.2%',
      throughput : '750 units/hr',
      nextMaintenance : '2025-01-15',
      description : 'Stainless-steel dryer with air circulation'
    }
  },
  {
    id : 5,
    name : 'SAPP',
    machineType : 'sapp-system',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-10',
    position : {
      left : '15%',
      top : '70%',
      width : '5%',
      height : '15%'
    },
    details : {
      uptime : '96.5%',
      throughput : '810 units/hr',
      nextMaintenance : '2025-01-23',
      description : 'Sodium acid pyrophosphate mixing and dosing system'
    }
  },
  {
    id : 6,
    name : 'Battering',
    machineType : 'batter-mixer',
    status : 'error',
    hasAlert : true,
    lastMaintenance : '2025-01-11',
    position : {
      left : '40%',
      top : '52%',
      width : '6%',
      height : '12%'
    },
    details : {
      uptime : '99.1%',
      throughput : '860 units/hr',
      nextMaintenance : '2025-01-27',
      description : 'Dry batter handling from superbag to hopper'
    }
  },
  {
    id : 7,
    name : 'Frying',
    machineType : 'fryer',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-07',
    position : {
      left : '46%',
      top : '45%',
      width : '18%',
      height : '20%'
    },
    details : {
      uptime : '78.3%',
      throughput : '0 units/hr',
      nextMaintenance : '2025-01-20',
      description : 'Single and two-stage fryers with circulation system'
    }
  },
  {
    id : 8,
    name : 'Freezing',
    machineType : 'freezer',
    status : 'warning',
    hasAlert : true,
    lastMaintenance : '2025-01-12',
    position : {
      left : '60%',
      top : '30%',
      width : '28%',
      height : '22%'
    },
    details : {
      uptime : '97.2%',
      throughput : '830 units/hr',
      nextMaintenance : '2025-01-28',
      description : 'PulseFlow™ IQF freezing and chilling solutions'
    }
  }
] )

// Equipment Zones for Image 2 (fps_packaging.JPG)
const equipmentZonesImage2 = ref( [
  {
    id : 5,
    name : 'Palletizer',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-10',
    position : {
      left : '1%',
      top : '30%',
      width : '20%',
      height : '30%'
    },
    details : {
      uptime : '99.2%',
      throughput : '850 units/hr',
      nextMaintenance : '2025-01-25'
    }
  },
  {
    id : 6,
    name : 'Case Transport',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-09',
    position : {
      left : '22%',
      top : '22%',
      width : '12%',
      height : '50%'
    },
    details : {
      uptime : '98.5%',
      throughput : '820 units/hr',
      nextMaintenance : '2025-01-22'
    }
  },
  {
    id : 7,
    name : 'Case Packing',
    status : 'warning',
    hasAlert : true,
    lastMaintenance : '2025-01-08',
    position : {
      left : '44%',
      top : '30%',
      width : '26%',
      height : '50%'
    },
    details : {
      uptime : '94.5%',
      throughput : '720 units/hr',
      nextMaintenance : '2025-01-15'
    }
  },
  {
    id : 8,
    name : 'Case Handling',
    status : 'operational',
    hasAlert : false,
    lastMaintenance : '2025-01-11',
    position : {
      left : '34%',
      top : '55%',
      width : '9%',
      height : '20%'
    },
    details : {
      uptime : '97.8%',
      throughput : '780 units/hr',
      nextMaintenance : '2025-01-23'
    }
  },
  {
    id : 9,
    name : 'Bag Inspection',
    status : 'error',
    hasAlert : true,
    lastMaintenance : '2025-01-07',
    position : {
      left : '70%',
      top : '48%',
      width : '15%',
      height : '20%'
    },
    details : {
      uptime : '78.3%',
      throughput : '0 units/hr',
      nextMaintenance : '2025-01-20'
    }
  },
  {
    id : 10,
    name : 'Bag Packaging',
    status : 'idle',
    hasAlert : false,
    lastMaintenance : '2025-01-06',
    position : {
      left : '86%',
      top : '28%',
      width : '14%',
      height : '53%'
    },
    details : {
      uptime : '85.2%',
      throughput : '0 units/hr',
      nextMaintenance : '2025-01-18'
    }
  }
] )

// Computed property for current equipment zones
const equipmentZones = computed( () => {
  return currentImageIndex.value === 0 ? equipmentZonesImage1.value : equipmentZonesImage2.value
} )

// Recent Activities - Hardcoded for demo with e2e-overview equipment context
const recentActivities = ref( [
  {
    id : 1,
    timestamp : '11:45',
    type : 'alert',
    message : 'Battering System: Critical error detected - Hopper level sensor malfunction',
    severity : 'danger'
  },
  {
    id : 2,
    timestamp : '11:32',
    type : 'alert',
    message : 'Freezing System: Temperature warning - PulseFlow™ IQF chamber running 2°C above target',
    severity : 'warning'
  },
  {
    id : 3,
    timestamp : '11:18',
    type : 'alert',
    message : 'PEF System: OPTICEPT® dual conveyor performance degradation warning',
    severity : 'warning'
  },
  {
    id : 4,
    timestamp : '11:05',
    type : 'maintenance',
    message : 'Frying System: Scheduled oil quality check completed successfully',
    severity : 'success'
  },
  {
    id : 5,
    timestamp : '10:52',
    type : 'production',
    message : 'Raw Receiving: Storage bin capacity at 85% - 12,800 units processed',
    severity : 'info'
  },
  {
    id : 6,
    timestamp : '10:38',
    type : 'maintenance',
    message : 'Blanching System: Multi-zone belt maintenance completed',
    severity : 'success'
  },
  {
    id : 7,
    timestamp : '10:24',
    type : 'production',
    message : 'SAPP System: Sodium acid pyrophosphate dosing calibrated - throughput 810 units/hr',
    severity : 'info'
  },
  {
    id : 8,
    timestamp : '10:15',
    type : 'status',
    message : 'Drying System: Changed to Idle status for scheduled inspection',
    severity : 'info'
  },
  {
    id : 9,
    timestamp : '09:58',
    type : 'alert',
    message : 'Bag Inspection: Critical equipment malfunction - throughput dropped to 0 units/hr',
    severity : 'danger'
  },
  {
    id : 10,
    timestamp : '09:42',
    type : 'alert',
    message : 'Case Packing: Warning - packing speed reduced to 720 units/hr',
    severity : 'warning'
  },
  {
    id : 11,
    timestamp : '09:28',
    type : 'maintenance',
    message : 'Palletizer: Preventive maintenance check completed - uptime 99.2%',
    severity : 'success'
  },
  {
    id : 12,
    timestamp : '09:15',
    type : 'production',
    message : 'Case Transport: Operating at optimal capacity - 820 units/hr throughput',
    severity : 'info'
  },
  {
    id : 13,
    timestamp : '09:05',
    type : 'status',
    message : 'Bag Packaging: System returned to Idle status after shift change',
    severity : 'info'
  }
] )

// Minimap background style - shows current image
const minimapBackgroundStyle = computed( () => {
  return {
    backgroundImage : `url(${carouselImages.value[currentImageIndex.value].src})`,
    backgroundSize : 'cover',
    backgroundPosition : 'center',
    backgroundRepeat : 'no-repeat'
  }
} )

// Minimap viewport style - accurately reflects the visible area
const minimapViewportStyle = computed( () => {
  // Viewport size is inverse of zoom (when zoomed 2x, viewport shows 50% of image)
  const viewportWidthPercent = 100 / currentZoom.value
  const viewportHeightPercent = 100 / currentZoom.value

  // Calculate viewport position based on pan
  // When you pan to the right (positive x), the viewport should move left (negative)
  // The pan values are in pixels, we need to convert to percentage
  if ( !panzoomContainer.value ) {
    return {
      left : '0%',
      top : '0%',
      width : `${viewportWidthPercent}%`,
      height : `${viewportHeightPercent}%`
    }
  }

  const containerWidth = panzoomContainer.value.offsetWidth
  const containerHeight = panzoomContainer.value.offsetHeight

  // The pan represents how much the scene has moved
  // To get the viewport position: we need to calculate what portion of the scaled content is visible
  const scaledWidth = containerWidth * currentZoom.value
  const scaledHeight = containerHeight * currentZoom.value

  // Convert pan pixels to percentage of the full scaled content
  const leftPercent = ( -currentPan.value.x / scaledWidth ) * 100
  const topPercent = ( -currentPan.value.y / scaledHeight ) * 100

  return {
    left : `${Math.max( 0, Math.min( 100 - viewportWidthPercent, leftPercent ) )}%`,
    top : `${Math.max( 0, Math.min( 100 - viewportHeightPercent, topPercent ) )}%`,
    width : `${viewportWidthPercent}%`,
    height : `${viewportHeightPercent}%`
  }
} )

// Initialize Panzoom
const initPanzoom = () => {
  if ( panzoomElement.value ) {
    panzoomInstance.value = Panzoom( panzoomElement.value, {
      maxZoom : 3,
      minZoom : 0.5,
      bounds : true,
      boundsPadding : 0.1,
      zoomDoubleClickSpeed : 1
    } )

    // Listen to zoom/pan changes
    panzoomInstance.value.on( 'zoom', instance => {
      const transform = instance.getTransform()
      currentZoom.value = transform.scale
      isZoomed.value = transform.scale > 1.1
    } )

    panzoomInstance.value.on( 'pan', instance => {
      const transform = instance.getTransform()
      currentPan.value = { x : transform.x, y : transform.y }
    } )

    // Disable panzoom by default
    if ( panzoomInstance.value ) {
      panzoomInstance.value.pause()
    }

    // Enable wheel zoom on the container (conditionally based on panzoomEnabled)
    if ( panzoomContainer.value ) {
      panzoomContainer.value.addEventListener( 'wheel', e => {
        if ( panzoomEnabled.value ) {
          e.preventDefault()
          panzoomInstance.value.zoomWithWheel( e )
        }
      } )
    }
  }
}

// Image loaded handler
const onImageLoad = () => {
  nextTick( () => {
    initPanzoom()
    // Set initial zoom state: transform: matrix(0.937723, 0, 0, 0.937723, 74.9317, 42.0809)
    if ( panzoomInstance.value ) {
      panzoomInstance.value.zoomAbs( 0, 0, 0.937723 )
      panzoomInstance.value.moveTo( 74.9317, 42.0809 )
    }
  } )
}

// Zoom handlers
const handleZoomIn = () => {
  if ( panzoomInstance.value ) {
    const centerX = panzoomContainer.value.offsetWidth / 2
    const centerY = panzoomContainer.value.offsetHeight / 2
    panzoomInstance.value.smoothZoom( centerX, centerY, 1.2 )
  }
}

const handleZoomOut = () => {
  if ( panzoomInstance.value ) {
    const centerX = panzoomContainer.value.offsetWidth / 2
    const centerY = panzoomContainer.value.offsetHeight / 2
    panzoomInstance.value.smoothZoom( centerX, centerY, 0.8 )
  }
}

const handleReset = () => {
  if ( panzoomInstance.value ) {
    panzoomInstance.value.zoomAbs( 0, 0, 0.937723 )
    panzoomInstance.value.moveTo( 74.9317, 42.0809 )
  }
}

const toggleFullscreen = () => {
  if ( !document.fullscreenElement ) {
    panzoomContainer.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Toggle panzoom enable/disable
const togglePanzoom = () => {
  panzoomEnabled.value = !panzoomEnabled.value
  if ( panzoomInstance.value ) {
    if ( panzoomEnabled.value ) {
      panzoomInstance.value.resume()
    } else {
      panzoomInstance.value.pause()
      // Reset view when disabling
      handleReset()
    }
  }
}

// Zone interaction handlers
const handleZoneClick = zone => {
  // Special handling for Freezer - open Production Freezing page in new tab
  if ( zone.machineType === 'freezer' || zone.name === 'Freezing' ) {
    router.push( '/production/freezing' )
  }

  // Temporarily disabled for other zones - no popup on click
  // selectedZone.value = zone
  // showModal.value = true
}

const handleZoneHover = ( zone, isHovering ) => {
  hoveredZone.value = isHovering ? zone.id : null
}

const handleModalClose = () => {
  showModal.value = false
  setTimeout( () => {
    selectedZone.value = null
  }, 300 )
}

// Activity feed toggle
const toggleActivityFeed = () => {
  showActivityFeed.value = !showActivityFeed.value
  if ( showActivityFeed.value ) {
    unreadActivities.value = 0
  }
}

// Carousel navigation
const handlePrevImage = () => {
  currentImageIndex.value = ( currentImageIndex.value - 1 + carouselImages.value.length ) % carouselImages.value.length
  handleReset()
}

const handleNextImage = () => {
  currentImageIndex.value = ( currentImageIndex.value + 1 ) % carouselImages.value.length
  handleReset()
}

// Status update timer
let statusUpdateTimer = null

// Random status assignment function based on configured ratios
const getRandomStatus = () => {
  const { statusRatios } = STATUS_UPDATE_CONFIG
  const random = Math.random()
  let cumulative = 0

  // Build cumulative probability distribution
  const statuses = ['operational', 'warning', 'error', 'idle']
  for ( const status of statuses ) {
    cumulative += statusRatios[status]
    if ( random <= cumulative ) {
      return status
    }
  }

  // Fallback to operational if something goes wrong
  return 'operational'
}

// Update all equipment status indicators randomly
const updateEquipmentStatuses = () => {
  // Update Image 1 equipment zones
  equipmentZonesImage1.value.forEach( zone => {
    zone.status = getRandomStatus()
  } )

  // Update Image 2 equipment zones
  equipmentZonesImage2.value.forEach( zone => {
    zone.status = getRandomStatus()
  } )
}

// Start status update timer
const startStatusUpdates = () => {
  // Initial update
  updateEquipmentStatuses()

  // Set up interval
  statusUpdateTimer = setInterval( updateEquipmentStatuses, STATUS_UPDATE_CONFIG.updateInterval )
}

// Stop status update timer
const stopStatusUpdates = () => {
  if ( statusUpdateTimer ) {
    clearInterval( statusUpdateTimer )
    statusUpdateTimer = null
  }
}

// Utility functions
// eslint-disable-next-line no-unused-vars
const getStatusText = status => {
  const statusMap = {
    operational : 'Running',
    warning : 'Warning',
    error : 'Error',
    idle : 'Idle'
  }
  return statusMap[status] || status
}

// eslint-disable-next-line no-unused-vars
const formatDate = dateStr => {
  const date = new Date( dateStr )
  const now = new Date()
  const diffDays = Math.floor( ( now - date ) / ( 1000 * 60 * 60 * 24 ) )

  if ( diffDays === 0 ) return 'Today'
  if ( diffDays === 1 ) return 'Yesterday'
  if ( diffDays < 7 ) return `${diffDays} days ago`
  return dateStr
}

// Keyboard shortcuts
const handleKeyDown = e => {
  // Only allow zoom shortcuts when panzoom is enabled
  if ( panzoomEnabled.value ) {
    if ( e.key === '+' || e.key === '=' ) {
      handleZoomIn()
    } else if ( e.key === '-' || e.key === '_' ) {
      handleZoomOut()
    } else if ( e.key === '0' ) {
      handleReset()
    }
  }

  // Arrow keys work regardless of panzoom state
  if ( e.key === 'ArrowLeft' ) {
    handlePrevImage()
  } else if ( e.key === 'ArrowRight' ) {
    handleNextImage()
  }
}

onMounted( () => {
  window.addEventListener( 'keydown', handleKeyDown )
  // Start status updates
  startStatusUpdates()
} )

onBeforeUnmount( () => {
  if ( panzoomInstance.value ) {
    panzoomInstance.value.dispose()
  }
  window.removeEventListener( 'keydown', handleKeyDown )
  // Stop status updates
  stopStatusUpdates()
} )
</script>

<style lang="scss" scoped>
.panzoom-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #1a1a1a;
  border-radius: 8px;
  margin: 0 0 20px 0;
  box-shadow: 0 -3px 31px 0 rgb(0 0 0 / 5%), 0 6px 20px 0 rgb(0 0 0 / 2%);

  &.e2e-mode {
    margin: 0 20px 0 20px;
  }
}

.panzoom-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: default;
  background-color: #ffffff;
  position: relative;

  &.panzoom-enabled {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

.panzoom-scene {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.e2e-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  pointer-events: none;
}

.equipment-hotspot {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 4px;
  background-color: rgba(0, 133, 164, 0);
  z-index: 10;

  &:hover {
    transform: scale(1.02);

    &.status-operational {
      background-color: rgba(48, 176, 143, 0.15);
      border: 2px solid rgba(48, 176, 143, 0.6);
      box-shadow: 0 0 15px rgba(48, 176, 143, 0.4);
    }

    &.status-warning {
      background-color: rgba(254, 193, 113, 0.15);
      border: 2px solid rgba(254, 193, 113, 0.6);
      box-shadow: 0 0 15px rgba(254, 193, 113, 0.4);
    }

    &.status-error {
      background-color: rgba(192, 54, 57, 0.15);
      border: 2px solid rgba(192, 54, 57, 0.6);
      box-shadow: 0 0 15px rgba(192, 54, 57, 0.4);
    }

    &.status-idle {
      background-color: rgba(100, 116, 139, 0.15);
      border: 2px solid rgba(100, 116, 139, 0.6);
      box-shadow: 0 0 15px rgba(100, 116, 139, 0.4);
    }
  }

  &:active {
    transform: scale(0.98);

    &.status-operational {
      background-color: rgba(48, 176, 143, 0.25);
      border: 2px solid rgba(48, 176, 143, 0.8);
    }

    &.status-warning {
      background-color: rgba(254, 193, 113, 0.25);
      border: 2px solid rgba(254, 193, 113, 0.8);
    }

    &.status-error {
      background-color: rgba(192, 54, 57, 0.25);
      border: 2px solid rgba(192, 54, 57, 0.8);
    }

    &.status-idle {
      background-color: rgba(100, 116, 139, 0.25);
      border: 2px solid rgba(100, 116, 139, 0.8);
    }
  }

  &.dryer {
    transform: rotate(-15deg);

    &:hover {
      transform: rotate(-15deg) scale(1.02);
    }

    &:active {
      transform: rotate(-15deg) scale(0.98);
    }

    .equipment-label {
      transform: translateX(-50%) rotate(15deg);
    }
  }

  &.blancher {
    transform: rotate(-15deg);

    &:hover {
      transform: rotate(-15deg) scale(1.02);
    }

    &:active {
      transform: rotate(-15deg) scale(0.98);
    }

    .equipment-label {
      transform: translateX(-50%) rotate(15deg);
    }
  }

  &.fryer {
    transform: rotate(-15deg);

    &:hover {
      transform: rotate(-15deg) scale(1.02);
    }

    &:active {
      transform: rotate(-15deg) scale(0.98);
    }

    .equipment-label {
      transform: translateX(-50%) rotate(15deg);
    }
  }

  &.freezer {
    transform: rotate(-15deg);

    &:hover {
      transform: rotate(-15deg) scale(1.02);
    }

    &:active {
      transform: rotate(-15deg) scale(0.98);
    }

    .equipment-label {
      transform: translateX(-50%) rotate(15deg);
    }
  }
}

.equipment-label {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  background: #0085a4;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.equipment-hotspot:hover .equipment-label {
  opacity: 1;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0085a4;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background: #0085a4;
    color: #ffffff;
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &.carousel-arrow-left {
    left: 20px;
  }

  &.carousel-arrow-right {
    right: 20px;
  }
}

.status-legend {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;

  .legend-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .legend-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #666;

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &.operational {
        background-color: #30b08f;
        box-shadow: 0 0 8px rgba(48, 176, 143, 0.5);
      }

      &.warning {
        background-color: #fec171;
        box-shadow: 0 0 8px rgba(254, 193, 113, 0.5);
      }

      &.error {
        background-color: #c03639;
        box-shadow: 0 0 8px rgba(192, 54, 57, 0.5);
      }

      &.idle {
        background-color: #64748b;
      }
    }
  }
}

.activity-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 48px;
  height: 48px;
  background: #0085a4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 133, 164, 0.4);
  transition: all 0.3s ease;

  &:hover {
    background: #006b87;
    transform: scale(1.1);
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #c03639;
    color: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    border: 2px solid #1a1a1a;
  }
}

.minimap {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 180px;
  height: 120px;
  border-radius: 8px;
  border: 3px solid rgba(0, 133, 164, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 50;

  .minimap-viewport {
    position: absolute;
    border: 2px solid #ff6b00;
    background: rgba(255, 107, 0, 0.2);
    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.3);
    transition: all 0.1s ease;
  }
}

// Responsive adjustments
@media (max-width: 1600px) {
  .panzoom-wrapper {
    margin: 0 0 15px 0;
  }

  .status-legend {
    padding: 12px;

    .legend-title {
      font-size: 13px;
      margin-bottom: 10px;
    }

    .legend-item {
      font-size: 12px;
    }
  }
}

@media (max-width: 768px) {
  .panzoom-wrapper {
    margin: 0 0 10px 0;
  }

  .status-legend {
    top: 10px;
    right: 10px;
    padding: 10px;
  }

  .activity-toggle {
    top: 10px;
    left: 10px;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .minimap {
    width: 140px;
    height: 90px;
    top: 10px;
    right: 10px;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 20px;

    &.carousel-arrow-left {
      left: 10px;
    }

    &.carousel-arrow-right {
      right: 10px;
    }
  }
}
</style>
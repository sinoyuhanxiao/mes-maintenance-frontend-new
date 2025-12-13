<template>
  <el-drawer
    v-model="drawerVisible"
    title="Production Line OEE Details"
    direction="rtl"
    size="800px"
    :before-close="handleClose"
  >
    <template #header>
      <div class="drawer-header-content">
        <div class="title-with-info">
          <span class="drawer-title">Production Line OEE Details</span>
          <el-tooltip placement="bottom" effect="light" :width="300">
            <template #content>
              <div class="formula-tooltip-content">
                <div class="formula-item">
                  <strong>OEE Calculation:</strong>
                  <div>OEE = Availability × Performance × Quality / 10,000</div>
                </div>
                <div class="formula-item">
                  <strong>Total Line OEE:</strong>
                  <div>Average of all machine OEEs</div>
                </div>
              </div>
            </template>
            <el-icon class="info-icon">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
        <el-switch
          v-model="autoSimulation"
          active-text="Auto-Simulation"
          inactive-text="Manual Mode"
          @change="handleSimulationToggle"
        />
      </div>
    </template>
    <div class="oee-drawer-content">
      <!-- Total OEE Display -->
      <div class="total-oee-section">
        <div class="total-oee-header" @click="toggleBreakdown">
          <div class="total-oee-main">
            <div class="total-oee-label">Total Line OEE</div>
            <div class="total-oee-value">{{ totalOEE.toFixed( 1 ) }}%</div>
          </div>
          <el-icon class="expand-icon" :class="{ expanded : showBreakdown }">
            <ArrowDown />
          </el-icon>
        </div>
        <el-collapse-transition>
          <div v-show="showBreakdown" class="total-oee-breakdown">
            <div class="breakdown-item">
              <span class="breakdown-label">Availability:</span>
              <span class="breakdown-value">{{ totalAvailability.toFixed( 1 ) }}%</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Performance:</span>
              <span class="breakdown-value">{{ totalPerformance.toFixed( 1 ) }}%</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Quality:</span>
              <span class="breakdown-value">{{ totalQuality.toFixed( 1 ) }}%</span>
            </div>
          </div>
        </el-collapse-transition>
      </div>

      <!-- Machine OEE Table -->
      <div class="machine-table-section">
        <div class="section-header">
          <h3>FPS E2E Production Line (8 Machines)</h3>
        </div>
        <el-table :data="e2eMachines" stripe border style="width: 100%">
          <el-table-column prop="name" label="Machine Name" min-width="180" />
          <el-table-column label="Availability (%)" min-width="140">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.availability"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                :disabled="autoSimulation"
                size="small"
                controls-position="right"
                @change="handleValueChange"
              />
            </template>
          </el-table-column>
          <el-table-column label="Performance (%)" min-width="140">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.performance"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                :disabled="autoSimulation"
                size="small"
                controls-position="right"
                @change="handleValueChange"
              />
            </template>
          </el-table-column>
          <el-table-column label="Quality (%)" min-width="140">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quality"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                :disabled="autoSimulation"
                size="small"
                controls-position="right"
                @change="handleValueChange"
              />
            </template>
          </el-table-column>
          <el-table-column label="OEE (%)" min-width="120">
            <template #default="scope">
              <div class="oee-cell" :class="getOEEClass( calculateMachineOEE( scope.row ) )">
                {{ calculateMachineOEE( scope.row ).toFixed( 1 ) }}%
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="section-header" style="margin-top: 30px">
          <h3>FPS Packaging Line (6 Machines)</h3>
        </div>
        <el-table :data="packagingMachines" stripe border style="width: 100%">
          <el-table-column prop="name" label="Machine Name" min-width="180" />
          <el-table-column label="Availability (%)" min-width="140">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.availability"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                :disabled="autoSimulation"
                size="small"
                controls-position="right"
                @change="handleValueChange"
              />
            </template>
          </el-table-column>
          <el-table-column label="Performance (%)" min-width="140">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.performance"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                :disabled="autoSimulation"
                size="small"
                controls-position="right"
                @change="handleValueChange"
              />
            </template>
          </el-table-column>
          <el-table-column label="Quality (%)" min-width="140">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quality"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.5"
                :disabled="autoSimulation"
                size="small"
                controls-position="right"
                @change="handleValueChange"
              />
            </template>
          </el-table-column>
          <el-table-column label="OEE (%)" min-width="120">
            <template #default="scope">
              <div class="oee-cell" :class="getOEEClass( calculateMachineOEE( scope.row ) )">
                {{ calculateMachineOEE( scope.row ).toFixed( 1 ) }}%
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { QuestionFilled, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps( {
  visible : {
    type : Boolean,
    required : true
  }
} )

const emit = defineEmits( ['update:visible', 'close', 'oee-update'] )

// Drawer visibility control
const drawerVisible = computed( {
  get : () => props.visible,
  set : val => emit( 'update:visible', val )
} )

// Auto-simulation state
const autoSimulation = ref( false )
const simulationInterval = ref( 1000 ) // 1 second
let simulationTimer = null

// Breakdown visibility state
const showBreakdown = ref( true )

// Toggle breakdown visibility
const toggleBreakdown = () => {
  showBreakdown.value = !showBreakdown.value
}

// FPS E2E Production Line Machines (8 machines from Image 1)
// Initial values biased towards excellent performance (>85% OEE)
const e2eMachines = ref( [
  { id : 1, name : 'Raw Receiving', availability : 94.5, performance : 92.3, quality : 97.2 }, // ~84.8% -> improved
  { id : 2, name : 'Pulsed Electric Field (PEF)', availability : 93.7, performance : 94.2, quality : 96.8 }, // ~85.6% excellent!
  { id : 3, name : 'Blanching', availability : 95.1, performance : 93.5, quality : 98.1 }, // ~87.2% excellent!
  { id : 4, name : 'Drying', availability : 87.3, performance : 85.9, quality : 93.4 }, // ~70.0% (keep some lower)
  { id : 5, name : 'SAPP', availability : 94.8, performance : 93.6, quality : 97.7 }, // ~86.7% excellent!
  { id : 6, name : 'Battering', availability : 88.9, performance : 87.4, quality : 94.3 }, // ~73.2% (keep some lower)
  { id : 7, name : 'Frying', availability : 95.6, performance : 94.1, quality : 97.8 }, // ~88.0% excellent!
  { id : 8, name : 'Freezing', availability : 93.4, performance : 92.7, quality : 96.2 }, // ~83.3% good
] )

// FPS Packaging Line Machines (6 machines from Image 2)
// Initial values biased towards excellent performance (>85% OEE)
const packagingMachines = ref( [
  { id : 9, name : 'Palletizer', availability : 96.2, performance : 94.8, quality : 98.5 }, // ~89.8% excellent!
  { id : 10, name : 'Case Transport', availability : 95.7, performance : 93.4, quality : 97.1 }, // ~86.8% excellent!
  { id : 11, name : 'Case Packing', availability : 88.5, performance : 86.2, quality : 93.9 }, // ~71.6% (keep some lower)
  { id : 12, name : 'Case Handling', availability : 94.1, performance : 93.3, quality : 96.8 }, // ~85.0% excellent!
  { id : 13, name : 'Bag Inspection', availability : 87.6, performance : 84.9, quality : 92.7 }, // ~68.9% (keep some lower)
  { id : 14, name : 'Bag Packaging', availability : 93.3, performance : 92.1, quality : 95.2 }, // ~81.8% good
] )

// Calculate individual machine OEE
const calculateMachineOEE = machine => {
  return ( machine.availability * machine.performance * machine.quality ) / 10000
}

// Calculate total line metrics (average of all machines)
const allMachines = computed( () => [...e2eMachines.value, ...packagingMachines.value] )

const totalAvailability = computed( () => {
  const sum = allMachines.value.reduce( ( acc, machine ) => acc + machine.availability, 0 )
  return sum / allMachines.value.length
} )

const totalPerformance = computed( () => {
  const sum = allMachines.value.reduce( ( acc, machine ) => acc + machine.performance, 0 )
  return sum / allMachines.value.length
} )

const totalQuality = computed( () => {
  const sum = allMachines.value.reduce( ( acc, machine ) => acc + machine.quality, 0 )
  return sum / allMachines.value.length
} )

// Per-machine OEE data lookup object
const machineOEEData = computed( () => {
  const data = {}
  allMachines.value.forEach( machine => {
    data[machine.name] = {
      oee : calculateMachineOEE( machine ),
      availability : machine.availability,
      performance : machine.performance,
      quality : machine.quality
    }
  } )
  return data
} )

const totalOEE = computed( () => {
  const sum = allMachines.value.reduce( ( acc, machine ) => acc + calculateMachineOEE( machine ), 0 )
  return sum / allMachines.value.length
} )

// Reusable emit function for OEE updates
const emitOeeUpdate = () => {
  emit( 'oee-update', {
    oee : totalOEE.value,
    availability : totalAvailability.value,
    performance : totalPerformance.value,
    quality : totalQuality.value,
    machineOEEData : machineOEEData.value
  } )
}

// Get OEE class for color coding
const getOEEClass = oee => {
  if ( oee >= 85 ) return 'oee-excellent'
  if ( oee >= 70 ) return 'oee-good'
  if ( oee >= 50 ) return 'oee-fair'
  return 'oee-poor'
}

// Handle value change
const handleValueChange = () => {
  // Values are automatically updated via v-model
  // Emit OEE update when values change
  emitOeeUpdate()
}

// Watch totalOEE for changes and emit updates
watch( totalOEE, () => {
  emitOeeUpdate()
} )

// Emit initial OEE data on mount (even when drawer is closed)
onMounted( () => {
  emitOeeUpdate()
} )

// Simulate random A/P/Q changes
// Biased towards higher values to ensure at least half the equipment is green (>85% OEE)
const simulateRandomChanges = () => {
  const randomAdjust = ( value, maxChange = 2, targetRange = { min : 85, max : 95 } ) => {
    // Bias towards target range to get more green equipment
    const targetMid = ( targetRange.min + targetRange.max ) / 2

    // If value is below target, bias upward
    if ( value < targetRange.min ) {
      const upwardBias = Math.random() * maxChange * 1.5 // 50% more likely to go up
      const newValue = value + upwardBias
      return Math.max( 0, Math.min( 100, parseFloat( newValue.toFixed( 1 ) ) ) )
    }

    // If value is above target max, bias downward
    if ( value > targetRange.max ) {
      const downwardBias = Math.random() * maxChange * -1.5
      const newValue = value + downwardBias
      return Math.max( 0, Math.min( 100, parseFloat( newValue.toFixed( 1 ) ) ) )
    }

    // If in target range, normal random walk
    const change = ( Math.random() - 0.5 ) * 2 * maxChange
    const newValue = value + change
    return Math.max( 0, Math.min( 100, parseFloat( newValue.toFixed( 1 ) ) ) )
  }

  // Update E2E machines with bias towards excellent performance
  e2eMachines.value.forEach( machine => {
    machine.availability = randomAdjust( machine.availability, 2, { min : 90, max : 97 } )
    machine.performance = randomAdjust( machine.performance, 2, { min : 90, max : 96 } )
    machine.quality = randomAdjust( machine.quality, 1, { min : 95, max : 99 } ) // Quality stays high
  } )

  // Update Packaging machines with bias towards excellent performance
  packagingMachines.value.forEach( machine => {
    machine.availability = randomAdjust( machine.availability, 2, { min : 90, max : 97 } )
    machine.performance = randomAdjust( machine.performance, 2, { min : 90, max : 96 } )
    machine.quality = randomAdjust( machine.quality, 1, { min : 95, max : 99 } ) // Quality stays high
  } )
}

// Handle simulation toggle
const handleSimulationToggle = enabled => {
  if ( enabled ) {
    // Start simulation
    simulationTimer = setInterval( simulateRandomChanges, simulationInterval.value )
  } else {
    // Stop simulation
    if ( simulationTimer ) {
      clearInterval( simulationTimer )
      simulationTimer = null
    }
  }
}

// Handle drawer close
const handleClose = done => {
  // Keep simulation running when drawer closes (user requested this behavior)
  emit( 'close' )
  done()
}

// Watch for drawer visibility changes - COMMENTED OUT: Simulation continues when drawer is closed
// watch( () => props.visible, newVal => {
//   if ( !newVal ) {
//     // Stop simulation when drawer is hidden
//     if ( autoSimulation.value ) {
//       autoSimulation.value = false
//       if ( simulationTimer ) {
//         clearInterval( simulationTimer )
//         simulationTimer = null
//       }
//     }
//   }
// } )

// Cleanup on unmount
onBeforeUnmount( () => {
  if ( simulationTimer ) {
    clearInterval( simulationTimer )
    simulationTimer = null
  }
} )
</script>

<style lang="scss" scoped>
.oee-drawer-content {
  padding: 0 0 20px 0;
}

.total-oee-section {
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .total-oee-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 28px 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    background: linear-gradient(to bottom, #f0f8fa 0%, #ffffff 100%);
    border-bottom: 2px solid #d4e9f0;

    &:hover {
      background: linear-gradient(to bottom, #e6f4f8 0%, #f0f8fa 100%);
      box-shadow: inset 0 1px 3px rgba(0, 133, 164, 0.08);
    }

    &:active {
      background: #e6f4f8;
    }

    .total-oee-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .total-oee-label {
        font-size: 12px;
        font-weight: 600;
        color: #909399;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .total-oee-value {
        font-size: 48px;
        font-weight: 700;
        color: #303133;
        letter-spacing: -1px;
      }
    }

    .expand-icon {
      font-size: 20px;
      color: #909399;
      transition: all 0.3s ease;
      position: absolute;
      right: 24px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f5f7fa;

      &:hover {
        background: #e4e7ed;
        color: #606266;
      }

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .total-oee-breakdown {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #e4e7ed;
    padding: 0;

    .breakdown-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;
      padding: 20px 16px;
      background: #fafbfc;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 32px;
        height: 3px;
        background: #e4e7ed;
        border-radius: 0 0 2px 2px;
      }

      &:hover {
        background: #ffffff;

        &::before {
          background: #909399;
        }

        .breakdown-value {
          color: #0085a4;
        }
      }

      .breakdown-label {
        font-size: 12px;
        font-weight: 600;
        color: #909399;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .breakdown-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        letter-spacing: -0.5px;
        transition: color 0.3s ease;
      }
    }
  }
}

.drawer-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 20px;

  .title-with-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .drawer-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .info-icon {
    font-size: 18px;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: #0085a4;
      transform: scale(1.1);
    }
  }
}

.machine-table-section {
  margin-bottom: 24px;

  .section-header {
    margin-bottom: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
      padding: 0 0 8px 0;
      border-bottom: 2px solid #0085a4;
    }
  }

  .oee-cell {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;

    &.oee-excellent {
      background: rgba(48, 176, 143, 0.15);
      color: #30b08f;
    }

    &.oee-good {
      background: rgba(254, 193, 113, 0.15);
      color: #f39c12;
    }

    &.oee-fair {
      background: rgba(192, 54, 57, 0.15);
      color: #c03639;
    }

    &.oee-poor {
      background: rgba(100, 116, 139, 0.15);
      color: #64748b;
    }
  }
}

.formula-tooltip-content {
  padding: 8px 4px;

  .formula-item {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      display: block;
      color: #303133;
      font-size: 13px;
      margin-bottom: 4px;
    }

    div {
      color: #606266;
      font-size: 12px;
      line-height: 1.6;
      padding-left: 8px;
    }
  }
}

// Override Element Plus table styles for better appearance
:deep(.el-table) {
  font-size: 13px;

  .el-table__header th {
    background: #f5f7fa;
    color: #333;
    font-weight: 600;
  }

  .el-input-number {
    width: 100%;
  }

  .el-input-number.is-disabled .el-input__inner {
    background-color: #f5f7fa;
    cursor: not-allowed;
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e7ed;
  font-weight: 600;
  color: #333;
}

:deep(.el-drawer__body) {
  padding: 20px;
}

// Responsive adjustments
@media (max-width: 768px) {
  .total-oee-section {
    .total-oee-header {
      padding: 20px 16px;

      .total-oee-main {
        gap: 12px;
        flex-direction: column;
        align-items: center;

        .total-oee-label {
          font-size: 12px;
        }

        .total-oee-value {
          font-size: 36px;
        }
      }

      .expand-icon {
        right: 16px;
        width: 28px;
        height: 28px;
        font-size: 18px;
      }
    }

    .total-oee-breakdown {
      grid-template-columns: 1fr;

      .breakdown-item {
        padding: 16px;

        .breakdown-value {
          font-size: 24px;
        }
      }
    }
  }
}
</style>

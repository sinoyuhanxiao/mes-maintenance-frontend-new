<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :lg="6" v-for="item in cardList" :key="item.id">
        <YuCard
          :start="item.start"
          :end="item.end"
          :duration="item.duration"
          :title="item.title"
          :prefix="item.prefix"
          :postfix="item.postfix"
          :precision="item.precision"
        >
          <template #icon>
            <i class="fr" :class="item.icon"></i>
          </template>
          <template #badge>
            <span class="badge" :class="item.badge.className">{{ item.badge.txt }}</span>
          </template>
          <template #info>{{ item.info }}</template>
        </YuCard>
      </el-col>
    </el-row>

    <div class="dashboard-image-container">
      <div class="image-wrapper">
        <img src="@/assets/fps_new_line_2025.JPG" alt="FPS New Line 2025" class="dashboard-image" />
        <!-- Palletizer Equipment Hover Area -->
        <div
          class="equipment-hotspot palletizer-hotspot"
          :style="palletizer"
          @click="handleEquipmentClick('palletizer')"
        >
          <span class="equipment-label">Palletizer</span>
        </div>
        <!-- Case Transport Equipment Hover Area -->
        <div
          class="equipment-hotspot case-transport-hotspot"
          :style="case_transport"
          @click="handleEquipmentClick('case_transport')"
        >
          <span class="equipment-label">Case Transport</span>
        </div>
        <!-- Case Packing Equipment Hover Area -->
        <div
          class="equipment-hotspot case-packing-hotspot"
          :style="case_packing"
          @click="handleEquipmentClick('case_packing')"
        >
          <span class="equipment-label">Case Packing</span>
        </div>
        <!-- Case Handling Equipment Hover Area -->
        <div
          class="equipment-hotspot case-handling-hotspot"
          :style="case_handling"
          @click="handleEquipmentClick('case_handling')"
        >
          <span class="equipment-label">Case Handling</span>
        </div>
        <!-- Bag Inspection Equipment Hover Area -->
        <div
          class="equipment-hotspot bag-inspection-hotspot"
          :style="bag_inspection"
          @click="handleEquipmentClick('bag_inspection')"
        >
          <span class="equipment-label">Bag Inspection</span>
        </div>
        <!-- Bag Packaging Equipment Hover Area -->
        <div
          class="equipment-hotspot bag-packaging-hotspot"
          :style="bag_packaging"
          @click="handleEquipmentClick('bag_packaging')"
        >
          <span class="equipment-label">Bag Packaging</span>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :sm="24" :lg="16">
        <div class="chart-wrapper">
          <div class="chart-title">Weekly Maintenance Activities</div>
          <BarChart :key="`bar-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <div class="chart-title">Maintenance Cost Distribution</div>
          <PieChart :key="`pie-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="table-section">
      <el-col :span="24">
        <div class="table-wrapper">
          <div class="table-title">Recent Work Orders</div>
          <WorkOrderTable />
        </div>
      </el-col>
    </el-row>

    <!-- New Widgets Row 1: Equipment Availability & Maintenance Request Status -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <div class="chart-title">Equipment Availability Trend (30 Days)</div>
          <LineChart :key="`line-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <div class="chart-title">Maintenance Request Status Distribution</div>
          <DonutChart :key="`donut-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
    </el-row>

    <!-- New Widgets Row 2: Resource Utilization, Completion Rate & Downtime -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :sm="24" :lg="10">
        <div class="chart-wrapper">
          <div class="chart-title">Resource Utilization (Top 10)</div>
          <HorizontalBarChart :key="`hbar-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="7">
        <div class="chart-wrapper">
          <div class="chart-title">Work Order Completion Rate</div>
          <GaugeChart :key="`gauge-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="7">
        <div class="chart-wrapper">
          <div class="chart-title">Equipment Downtime (Weekly)</div>
          <StackedBarChart :key="`stacked-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
    </el-row>

    <!-- New Widgets Row 3: Task Execution Time & Top Equipment -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :sm="24" :lg="14">
        <div class="chart-wrapper">
          <div class="chart-title">Task Execution Time Trend (8 Weeks)</div>
          <AreaChart :key="`area-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="10">
        <div class="chart-wrapper">
          <div class="chart-title">Top Equipment by Maintenance Frequency</div>
          <TopEquipmentChart :key="`top-${chartRenderKey}`" :height="chartHeight" />
        </div>
      </el-col>
    </el-row>

    <!-- New Widgets Row 4: Equipment Status Table -->
    <el-row :gutter="20" class="table-section">
      <el-col :span="24">
        <div class="table-wrapper">
          <div class="table-title">Equipment Status Overview</div>
          <EquipmentStatusTable />
        </div>
      </el-col>
    </el-row>

    <!-- New Widgets Row 5: Resource Inventory Table -->
    <el-row :gutter="20" class="table-section" v-show="false">
      <el-col :span="24">
        <div class="table-wrapper">
          <div class="table-title">Resource Inventory Status</div>
          <ResourceInventoryTable />
        </div>
      </el-col>
    </el-row>

    <!-- New Widgets Row 6: Maintenance Requests Table -->
    <el-row :gutter="20" class="table-section">
      <el-col :span="24">
        <div class="table-wrapper">
          <div class="table-title">Recent Maintenance Requests</div>
          <MaintenanceRequestsTable />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import YuCard from './components/Card/index.vue'
import BarChart from './components/BarChart.vue'
import PieChart from './components/PieChart.vue'
import WorkOrderTable from './components/TransactionTable.vue'
// New chart components
import LineChart from './components/LineChart.vue'
import DonutChart from './components/DonutChart.vue'
import HorizontalBarChart from './components/HorizontalBarChart.vue'
import GaugeChart from './components/GaugeChart.vue'
import StackedBarChart from './components/StackedBarChart.vue'
import AreaChart from './components/AreaChart.vue'
import TopEquipmentChart from './components/TopEquipmentChart.vue'
// New table components
import EquipmentStatusTable from './components/EquipmentStatusTable.vue'
import ResourceInventoryTable from './components/ResourceInventoryTable.vue'
import MaintenanceRequestsTable from './components/MaintenanceRequestsTable.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Responsive chart height based on screen size
const chartHeight = ref( '350px' )
// Key to force chart re-render on significant resize
const chartRenderKey = ref( 0 )

// Equipment positions on the factory floor image
const palletizer = ref( {
  left : '5%',
  top : '28%',
  width : '16%',
  height : '45%'
} )

const case_transport = ref( {
  left : '22%',
  top : '28%',
  width : '12%',
  height : '48%'
} )

const case_packing = ref( {
  left : '42%',
  top : '37%',
  width : '24%',
  height : '48%'
} )

const case_handling = ref( {
  left : '34%',
  top : '60%',
  width : '8%',
  height : '20%'
} )

const bag_inspection = ref( {
  left : '66.5%',
  top : '52%',
  width : '12%',
  height : '28%'
} )

const bag_packaging = ref( {
  left : '80%',
  top : '22%',
  width : '14%',
  height : '60%'
} )

// Handle equipment hotspot click
const handleEquipmentClick = equipmentType => {
  console.log( `Clicked on equipment: ${equipmentType}` )
  // TODO: Add navigation or modal display logic here
}

const updateChartHeight = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  const previousHeight = chartHeight.value

  // For laptop screens with limited height (around 1520x600)
  if ( width <= 1600 && height <= 768 ) {
    chartHeight.value = '250px'
  } else if ( width <= 1600 ) {
    chartHeight.value = '300px'
  } else if ( width <= 768 ) {
    chartHeight.value = '230px'
  } else {
    chartHeight.value = '350px'
  }

  // Force re-render if height changed significantly (crossing breakpoints)
  if ( previousHeight !== chartHeight.value ) {
    chartRenderKey.value++
  }
}

let resizeTimer = null
const handleResize = () => {
  // Debounce resize events to avoid excessive updates
  clearTimeout( resizeTimer )
  resizeTimer = setTimeout( () => {
    updateChartHeight()
  }, 100 )
}

onMounted( () => {
  updateChartHeight()
  window.addEventListener( 'resize', handleResize )
} )

onBeforeUnmount( () => {
  window.removeEventListener( 'resize', handleResize )
  if ( resizeTimer ) {
    clearTimeout( resizeTimer )
  }
} )

const cardList = ref( [
  {
    id : 1,
    start : 0,
    end : 287,
    duration : 1500,
    title : 'Work Orders',
    icon : 'yu-icon-lifangti',
    badge : {
      className : 'bg-info',
      txt : '+12.4%'
    },
    info : 'From previous period'
  },
  {
    id : 2,
    start : 0,
    end : 5234,
    duration : 1500,
    prefix : '$',
    title : 'Maintenance Cost',
    icon : 'yu-icon-chanpin1',
    badge : {
      className : 'bg-danger',
      txt : '+18.7%'
    },
    info : 'From previous period'
  },
  {
    id : 3,
    start : 0,
    end : 3.8,
    duration : 1500,
    postfix : 'hrs',
    precision : 1,
    title : 'Average Downtime',
    icon : 'yu-icon-jiagebiaoqian',
    badge : {
      className : 'bg-warning',
      txt : '-8.3%'
    },
    info : 'From previous period'
  },
  {
    id : 4,
    start : 0,
    end : 124,
    duration : 1500,
    title : 'Equipment Inspected',
    icon : 'yu-icon-icon_xinyong_xianxing_jijin-129',
    badge : {
      className : 'bg-info',
      txt : '+15.2%'
    },
    info : 'From previous period'
  }
] )
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .dashboard-image-container {
    border-radius: 8px;
    background-color: #ffffff !important;
    padding: 20px;
    box-sizing: border-box;
    margin-bottom: 20px;
    box-shadow: 0 -3px 31px 0 rgb(0 0 0 / 5%), 0 6px 20px 0 rgb(0 0 0 / 2%);
    display: flex;
    justify-content: center;
    align-items: center;

    .image-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .dashboard-image {
      width: 100%;
      height: auto;
      max-width: 100%;
      border-radius: 4px;
      object-fit: contain;
      background-color: #ffffff !important;
      display: block;
    }

    .equipment-hotspot {
      position: absolute;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      border-radius: 4px;
      background-color: rgba(64, 158, 255, 0);

      .equipment-label {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        color: #0085a4;
        background: #0085a433;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 1;
        pointer-events: none;
      }

      &:hover {
        background-color: rgba(0, 133, 164, 0.15);
        border: 2px solid rgba(0, 133, 164, 0.6);
        box-shadow: 0 0 15px rgba(0, 133, 164, 0.4);
        transform: scale(1.02);
      }

      &:active {
        background-color: rgba(64, 158, 255, 0.25);
        border: 2px solid rgba(64, 158, 255, 0.8);
        transform: scale(0.98);
      }
    }

    .palletizer-hotspot {
      z-index: 10;
    }

    .case-transport-hotspot {
      z-index: 10;
    }

    .case-packing-hotspot {
      z-index: 10;
    }

    .case-handling-hotspot {
      z-index: 10;
    }

    .bag-inspection-hotspot {
      z-index: 10;
    }

    .bag-packaging-hotspot {
      z-index: 10;
    }
  }

  .charts-section {
    margin-bottom: 20px;
  }

  .chart-wrapper {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 -3px 31px 0 rgb(0 0 0 / 5%), 0 6px 20px 0 rgb(0 0 0 / 2%);
    height: 420px;

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f5;
    }
  }

  .table-section {
    margin-bottom: 20px;
  }

  .table-wrapper {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 -3px 31px 0 rgb(0 0 0 / 5%), 0 6px 20px 0 rgb(0 0 0 / 2%);
    overflow-x: auto;

    .table-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f5;
    }
  }

  // Responsive styles for smaller screens
  @media (max-width: 1600px) {
    padding: 20px;

    .dashboard-image-container {
      padding: 15px;
      margin-bottom: 15px;
    }

    .charts-section,
    .table-section {
      margin-bottom: 15px;
    }

    .chart-wrapper {
      padding: 15px;
      height: 350px;

      .chart-title {
        font-size: 16px;
        margin-bottom: 12px;
        padding-bottom: 10px;
      }
    }

    .table-wrapper {
      padding: 15px;

      .table-title {
        font-size: 16px;
        margin-bottom: 12px;
        padding-bottom: 10px;
      }
    }
  }

  // Extra responsive adjustments for very constrained screens
  @media (max-width: 1600px) and (max-height: 768px) {
    padding: 16px;

    .dashboard-image-container {
      padding: 12px;
      margin-bottom: 12px;
    }

    .charts-section,
    .table-section {
      margin-bottom: 12px;
    }

    .chart-wrapper {
      padding: 12px;
      height: 300px;

      .chart-title {
        font-size: 15px;
        margin-bottom: 10px;
        padding-bottom: 8px;
      }
    }

    .table-wrapper {
      padding: 12px;

      .table-title {
        font-size: 15px;
        margin-bottom: 10px;
        padding-bottom: 8px;
      }
    }
  }

  // Mobile and tablet adjustments
  @media (max-width: 768px) {
    padding: 12px;

    .dashboard-image-container {
      padding: 10px;
      margin-bottom: 10px;
    }

    .charts-section,
    .table-section {
      margin-bottom: 10px;
    }

    .chart-wrapper {
      padding: 10px;
      height: 280px;

      .chart-title {
        font-size: 14px;
        margin-bottom: 8px;
        padding-bottom: 6px;
      }
    }

    .table-wrapper {
      padding: 10px;

      .table-title {
        font-size: 14px;
        margin-bottom: 8px;
        padding-bottom: 6px;
      }
    }
  }
}
</style>

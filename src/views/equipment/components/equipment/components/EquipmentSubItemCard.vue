<template>
  <el-card class="sub-item-card" shadow="hover">
    <div class="card-content">
      <div class="number-circle">
        <span class="number">{{ number }}</span>
      </div>
      <div class="text-content">
        <el-text>
          {{ text }}
        </el-text>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineProps( {
  number : {
    type : [String, Number],
    default : 1
  },
  text : {
    type : String,
    default : 'Sub-Item Text'
  },
  circleColor : {
    type : String,
    default : '#409EFF' // Element Plus primary color
  }
} )
</script>

<style scoped>
.sub-item-card {
  margin-bottom: 8px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.number-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid v-bind(circleColor);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.number {
  color: v-bind(circleColor);
  font-size: 14px;
  font-weight: 600;
}

.text-content {
  flex: 1;
}
</style>

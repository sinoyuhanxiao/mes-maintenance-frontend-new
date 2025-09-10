<template>
  <div @click="handleSelectedWorkorder" class="wo-card">
    <el-card class="card-style">
      <div class="card-content">
        <div class="wo-info-card">
          <el-descriptions :column="4" direction="vertical">
            <el-descriptions-item :label="wo.name">
              <div>WO Code: {{ wo.code }}</div>
              <div>Due Date: {{ convertToLocalTime(wo.due_date) }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="wo-icons-card">
          <div>
            <el-text type="info" size="small">{{ wo.state?.name }}</el-text>
          </div>
          <div>
            <el-text size="small" :style="{ color: wo.priority?.id === 1 ? 'red' : '' }"
              ><i
                class="fa-solid fa-circle-dot"
                style="font-size: 8px; margin-right: 2px; vertical-align: middle; margin-bottom: 3px"
              ></i
              >{{ wo.priority?.name }}</el-text
            >
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// import { priorities, states } from '../../utils'
import { ref, onMounted } from 'vue'
import router from '../../../router/index'
import { convertToLocalTime } from '../../../utils/datetime'

const woData = defineProps({
  wo: Object,
  module: Number,
})

const fontSize = ref('14px')

const emit = defineEmits(['requestData'])

onMounted(() => {
  if (window.innerWidth > 1600) {
    fontSize.value = '20px'
  }
})

function handleSelectedWorkorder() {
  if (woData.module === 2) {
    emit('requestData', woData.wo)
  } else {
    console.log(woData.wo.id)
    router.push({ name: 'ViewWorkOrder', params: { id: woData.wo.id } })
  }
}
</script>

<style scoped>
.card-style {
  width: 100%;
  border-radius: 10px;
}

.wo-card {
  /* border-bottom: solid 1px darkgray; */
  padding: 0px;
  background-color: transparent;
  cursor: pointer;
  border-radius: 10px;
}

.wo-card:hover {
  background-color: lightblue;
  opacity: 0.9;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
}

.wo-info-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
  /* background-color: lightblue; */
  align-items: flex-start;
  justify-content: space-between;
}

.wo-icons-card {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 1600px) {
  .wo-info-card {
    gap: 0.1rem;
  }

  .wo-icons-card {
    gap: 0.1rem;
    align-items: flex-end;
  }

  .card-content {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.1rem;
  }
}
</style>

<template>
  <el-card @click="sendEmit()" style="width: 100%; border-radius: 10px; cursor: pointer">
    <div class="card-container">
      <div class="left-container">
        <div>
          <el-text type="primary">#{{ props.data.id }}</el-text>
        </div>
        <div>
          <el-text tag="b">{{ props.data.name }}</el-text>
        </div>
        <div class="description-container">
          <el-descriptions :column="1" direction="horizontal">
            <el-descriptions-item label="Abbreviation: ">{{ props.data.code }}</el-descriptions-item>
            <el-descriptions-item label="Phone Number: ">{{ props.data.phone_number }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <div class="right-container">
        <!-- <div class="close-icon" v-if="showClose " >
          <el-icon><Close /></el-icon>
        </div> -->
        <el-image
          style="width: 80px; border-radius: 100%; aspect-ratio: 1/1"
          :src="props.data.image_list ? props.data.image_list[0] : null"
        />
        <!-- <el-text>{{ props.data.image_list[0] }}</el-text> -->
        <el-text style="margin-top: 20px">{{ props.data.address }}</el-text>
      </div>
    </div>
    <hr />
    <div v-if="spData">
      <el-text tag="b">Ordering Details</el-text>
      <div class="order-details">
        <el-descriptions :column="4" direction="horizontal" style="width: 100%; margin-top: 10px">
          <el-descriptions-item :span="1" label="Order Code: ">{{ props.spData.order_code }}</el-descriptions-item>
          <el-descriptions-item :span="1" label="Unit Price: ">
            {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.spData.unit_price) }}
          </el-descriptions-item>
          <el-descriptions-item :span="1" label="Currency: ">{{ props.spData.price_uom.name }}</el-descriptions-item>
          <el-descriptions-item :span="1" label="Lead Time: "
            >{{ props.spData.lead_time_days }} Days</el-descriptions-item
          >
        </el-descriptions>
      </div>
    </div>
  </el-card>
</template>

<script setup>
// import { Close } from '@element-plus/icons-vue'
// import { ref } from 'vue'
const props = defineProps({
  data: Object,
  spData: Object,
})

const emit = defineEmits(['existing', 'new'])

function sendEmit() {
  console.log(props.spData)
  if (props.spData) {
    console.log('existing sent')
    emit('existing', props)
  } else {
    emit('new', props.data.vendor)
  }
}
</script>

<style scoped>
.card-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
}

.left-container {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.description-container {
  display: flex;
  flex-direction: column;
}

.order-details {
  display: flex;
  flex-direction: row;
}

.right-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.close-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  color: red;
}
</style>

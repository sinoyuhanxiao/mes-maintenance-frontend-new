<template>
  <div class="spare-parts-card">
    <el-card style="width: 100%; border-radius: 10px">
      <div @click="handleEmit" class="card-container">
        <div class="left-container">
          <div>
            <el-text type="primary">#{{ props.data.id }}</el-text>
          </div>
          <div>
            <el-text tag="b">{{ props.data.name }}</el-text>
          </div>
          <div class="description-container">
            <el-descriptions :column="1" direction="horizontal">
              <el-descriptions-item label="Material Code:">{{ props.data.code }}</el-descriptions-item>
              <el-descriptions-item label="Inventory Code:">{{ props.data.universal_code }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <div class="right-container">
          <div>
            <el-descriptions :column="1" direction="horizontal">
              <el-descriptions-item label="Current Stock:">
                <el-text :type="props.data.current_stock < props.data.minimum_stock_level ? 'danger' : ''">
                  {{ props.data.current_stock }} units
                </el-text>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <el-image
            :fit="fill"
            style="width: 90px; border-radius: 100%; aspect-ratio: 1/1"
            :src="props.data.image_list"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object,
})

const emit = defineEmits(['selection'])

function handleEmit() {
  emit('selection', props.data)
}
</script>

<style scoped>
.card-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
}

.spare-parts-card {
  padding: 1px;
  border-radius: 10px;
}

.spare-parts-card:hover {
  background-color: lightblue;
  opacity: 0.9;
}

.left-container {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  max-width: 60%;
}

.description-container {
  display: flex;
  flex-direction: column;
}

.right-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}
</style>

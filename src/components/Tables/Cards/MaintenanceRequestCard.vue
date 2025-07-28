<template>
  <div @click="emitSelectRequest" class="request-card">
    <el-card class="card-style">
      <div class="card-content">
        <div class="request-info-card">
          <div>
            <el-text type="primary">#{{ data.id }}</el-text>
          </div>
          <div>
            <el-text tag="b">{{ data.name }}</el-text>
          </div>
          <div>
            <el-text>Created At: {{ convertToLocalTime(data.created_at) }}</el-text>
          </div>
          <div>
            <el-text>Created By: {{ data.created_by }}</el-text>
          </div>
        </div>
        <div class="img-container">
          <img
            :src="
              data.image_path !== null
                ? data.image_path
                : 'https://tse1.mm.bing.net/th/id/OIP.eFMincbRCUMEdAvlQvzyNgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3'
            "
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// import { priorities, states } from '../../utils'
// import router from '../../router/router'
import { convertToLocalTime } from '../../../utils/datetime'

const reqData = defineProps( {
  data : Object
} )

const emit = defineEmits( ['selection'] )

function emitSelectRequest() {
  emit( 'selection', reqData.data )
}
</script>

<style scoped>
.card-style {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.request-card {
  /* border-bottom: solid 1px darkgray; */
  padding: 1px;
  background-color: transparent;
  cursor: pointer;
  border-radius: 10px;
}

.request-card:hover {
  background-color: lightblue;
  opacity: 0.9;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.request-info-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  /* background-color: lightblue; */
  align-items: flex-start;
  justify-content: space-between;
}

.title-text {
  margin: 0;
  font-size: 18px;
  font-weight: 100;
}

.img-container {
  display: flex;
  flex-direction: row;
}

.img-container img {
  border-radius: 100%;
  width: 5vw;
  height: 10vh;
}

@media (max-width: 1600px) {
  .request-info-card {
    gap: 0.1rem;
  }

  .title-text {
    font-size: 12px;
  }

  .card-content {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.1rem;
  }
}
</style>

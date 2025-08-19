<template>
  <div>
    <template v-if="images?.length">
      <div class="flex flex-wrap gap-2">
        <el-image
          v-for="(img, i) in images"
          :key="i"
          :src="img"
          :preview-src-list="images"
          style="width: 200px; height: 200px; border-radius: 4px"
          fit="cover"
          preview-teleported
        />
      </div>
    </template>
    <!--    <template v-else>-->
    <!--      <div class="text-gray-400 text-sm text-center py-6">No image available</div>-->
    <!--    </template>-->
  </div>
</template>

<script setup>
defineProps( {
  images : {
    type : Array,
    default : () => []
  }
} )
</script>

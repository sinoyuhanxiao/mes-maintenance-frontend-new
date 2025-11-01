<template>
  <span>{{ formattedTime }}</span>
</template>

<script setup>
import { formatAsLocalDateTimeString } from '@/utils/datetime.js'
import { computed } from 'vue'

const props = defineProps({
  value: { type: String, required: false },
})

const formattedTime = computed(() => formatAsLocalDateTimeString(props.value))
</script>

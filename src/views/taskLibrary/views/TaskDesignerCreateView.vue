<template>
  <TemplateDesignerView />
</template>

<script setup>
import TemplateDesignerView from './TemplateDesignerView.vue'

defineOptions({
  // Match route name so keep-alive include works
  name: 'TaskDesigner',
})
</script>

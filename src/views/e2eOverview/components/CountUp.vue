<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps( {
  endVal : {
    type : Number,
    required : true
  },
  duration : {
    type : Number,
    default : 2
  },
  startVal : {
    type : Number,
    default : 0
  }
} )

const displayValue = ref( props.startVal )

const animateCount = () => {
  const startTime = Date.now()
  const startValue = displayValue.value
  const endValue = props.endVal
  const duration = props.duration * 1000

  const animate = () => {
    const now = Date.now()
    const progress = Math.min( ( now - startTime ) / duration, 1 )
    const easeOutQuad = progress * ( 2 - progress )

    displayValue.value = Math.floor( startValue + ( endValue - startValue ) * easeOutQuad )

    if ( progress < 1 ) {
      requestAnimationFrame( animate )
    } else {
      displayValue.value = endValue
    }
  }

  requestAnimationFrame( animate )
}

watch(
  () => props.endVal,
  () => {
    animateCount()
  }
)

onMounted( () => {
  animateCount()
} )
</script>

<script>
export default {
  name : 'CountUp'
}
</script>

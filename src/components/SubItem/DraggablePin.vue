<template>
  <div class="draggable-pin" :class="{ editing: isEditMode }" :style="pinStyle" v-pin-draggable="pinDraggableConfig">
    <div class="pin-circle" :style="{ backgroundColor: circleColor }">
      <span class="pin-number">{{ number }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps( {
  id : Number,
  number : Number,
  text : String,
  position : Object,
  circleColor : String,
  isEditMode : Boolean
} )

const emit = defineEmits( ['position-change'] )

const pinStyle = computed( () => ( {
  left : `${props.position.x}%`,
  top : `${props.position.y}%`,
  position : 'absolute',
  zIndex : 10
} ) )

const pinDraggableConfig = computed( () => {
  console.log( 'DraggablePin computed config, isEditMode:', props.isEditMode )
  return {
    isEditMode : props.isEditMode,
    pinId : props.id,
    onPositionChange : ( pinId, x, y ) => {
      emit( 'position-change', pinId, x, y )
    }
  }
} )
</script>

<style scoped>
.draggable-pin {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  user-select: none;
}

.draggable-pin.editing {
  cursor: move;
}

.pin-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.draggable-pin:hover .pin-circle {
  transform: scale(1.1);
}

.pin-number {
  color: white;
  font-weight: bold;
  font-size: 14px;
}
</style>

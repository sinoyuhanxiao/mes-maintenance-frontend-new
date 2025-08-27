const pinDraggable = {
  mounted( el, binding ) {
    let isDragging = false
    let startX, startY, initialLeft, initialTop

    const onMouseDown = e => {
      // Access the current binding value from the element
      const currentBinding = el._currentBinding || binding.value
      console.log( 'Mouse down on pin, isEditMode:', currentBinding?.isEditMode )
      if ( !currentBinding || !currentBinding.isEditMode ) return

      console.log( 'Starting drag' )
      isDragging = true
      startX = e.clientX
      startY = e.clientY

      const rect = el.getBoundingClientRect()
      const parentRect = el.parentElement.getBoundingClientRect()

      initialLeft = ( ( rect.left - parentRect.left ) / parentRect.width ) * 100
      initialTop = ( ( rect.top - parentRect.top ) / parentRect.height ) * 100

      document.addEventListener( 'mousemove', onMouseMove )
      document.addEventListener( 'mouseup', onMouseUp )

      e.preventDefault()
      e.stopPropagation()
    }

    const onMouseMove = e => {
      if ( !isDragging ) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      const parentRect = el.parentElement.getBoundingClientRect()

      let newLeft = initialLeft + ( deltaX / parentRect.width ) * 100
      let newTop = initialTop + ( deltaY / parentRect.height ) * 100

      // Constrain to image bounds (0-100%)
      newLeft = Math.max( 0, Math.min( 100, newLeft ) )
      newTop = Math.max( 0, Math.min( 100, newTop ) )

      console.log( 'Dragging pin to:', newLeft, newTop )

      // Emit position change - let Vue handle the visual update
      const currentBinding = el._currentBinding || binding.value
      if ( currentBinding && currentBinding.onPositionChange ) {
        currentBinding.onPositionChange( currentBinding.pinId, newLeft, newTop )
      }
    }

    const onMouseUp = () => {
      isDragging = false
      document.removeEventListener( 'mousemove', onMouseMove )
      document.removeEventListener( 'mouseup', onMouseUp )
    }

    el.addEventListener( 'mousedown', onMouseDown )

    // Store the current binding value for comparison
    el._currentBinding = binding.value

    // Cleanup
    el._cleanup = () => {
      el.removeEventListener( 'mousedown', onMouseDown )
      document.removeEventListener( 'mousemove', onMouseMove )
      document.removeEventListener( 'mouseup', onMouseUp )
    }
  },

  updated( el, binding ) {
    // Update the stored binding value when it changes
    el._currentBinding = binding.value
    console.log( 'Directive updated, isEditMode:', binding.value?.isEditMode )
  },

  unmounted( el ) {
    if ( el._cleanup ) {
      el._cleanup()
    }
  }
}

export default pinDraggable

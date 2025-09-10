import { ref } from 'vue'

const TOUR_COMPLETED_KEY = 'designer-tour-completed'

export function useDesignerTour() {
  const isOpen = ref( false )

  function start() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function onFinish() {
    localStorage.setItem( TOUR_COMPLETED_KEY, 'true' )
    close()
  }

  function hasCompletedTour() {
    return localStorage.getItem( TOUR_COMPLETED_KEY ) === 'true'
  }

  function resetTourCompletion() {
    localStorage.removeItem( TOUR_COMPLETED_KEY )
  }

  return {
    isOpen,
    start,
    close,
    onFinish,
    hasCompletedTour,
    resetTourCompletion
  }
}

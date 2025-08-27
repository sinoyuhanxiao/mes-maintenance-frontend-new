const STORAGE_KEY_PREFIX = 'equipment_pins_'

export const savePinPositions = ( entityId, tierType, pins ) => {
  const key = `${STORAGE_KEY_PREFIX}${tierType}_${entityId}`
  try {
    localStorage.setItem( key, JSON.stringify( pins ) )
    return true
  } catch ( error ) {
    console.error( 'Failed to save pin positions to localStorage:', error )
    return false
  }
}

export const loadPinPositions = ( entityId, tierType ) => {
  const key = `${STORAGE_KEY_PREFIX}${tierType}_${entityId}`
  try {
    const data = localStorage.getItem( key )
    return data ? JSON.parse( data ) : null
  } catch ( error ) {
    console.error( 'Failed to load pin positions from localStorage:', error )
    return null
  }
}

export const clearPinPositions = ( entityId, tierType ) => {
  const key = `${STORAGE_KEY_PREFIX}${tierType}_${entityId}`
  try {
    localStorage.removeItem( key )
    return true
  } catch ( error ) {
    console.error( 'Failed to clear pin positions from localStorage:', error )
    return false
  }
}

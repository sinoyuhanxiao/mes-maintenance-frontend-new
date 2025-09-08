import { reactive } from 'vue'

// Global state cache for designer tabs
const stateCache = reactive( new Map() )

/**
 * Global cleanup function for designer cache - can be called from anywhere
 * @param {string} path - Route path to clear from cache
 */
export function clearDesignerCacheByPath( path ) {
  const { clearStateByPath } = useDesignerStateCache()
  return clearStateByPath( path )
}

/**
 * Composable for managing designer state persistence across tagView tabs
 * Provides per-tab state caching for Create and Edit modes
 */
export function useDesignerStateCache() {
  // Generate cache key based on route
  const generateCacheKey = route => {
    if ( route.params.id ) {
      // Edit mode: include template ID for unique tab identification
      return `designer-edit-${route.params.id}`
    } else {
      // Create mode: static key for new template creation
      return 'designer-create'
    }
  }

  // Save current state to cache
  const saveState = ( route, state ) => {
    const cacheKey = generateCacheKey( route )

    // Create a deep copy of the state to avoid reactivity issues
    const cachedState = {
      templateForm : JSON.parse( JSON.stringify( state.templateForm || {} ) ),
      originalTemplate : state.originalTemplate ? JSON.parse( JSON.stringify( state.originalTemplate ) ) : null,
      currentTemplate : state.currentTemplate ? JSON.parse( JSON.stringify( state.currentTemplate ) ) : null,
      hasUnsavedChanges : state.hasUnsavedChanges || false,
      designerState : state.designerState ? JSON.parse( JSON.stringify( state.designerState ) ) : null,
      // Track template identity for validation
      templateId : ( state.currentTemplate && ( state.currentTemplate.id || state.currentTemplate.template_id ) )
        || ( route.params && route.params.id ) || null,
      // Cache timestamp for cleanup purposes
      timestamp : Date.now(),
      // Store route info for validation
      routePath : route.path,
      routeParams : route.params ? JSON.parse( JSON.stringify( route.params ) ) : {}
    }

    stateCache.set( cacheKey, cachedState )
    console.log( `[Designer State Cache] Saved state for key: ${cacheKey}` )
  }

  // Save by explicit cache key (stable key independent of reactive route)
  const saveStateByKey = ( cacheKey, state, routeLike = null, templateId = null ) => {
    const cachedState = {
      templateForm : JSON.parse( JSON.stringify( state.templateForm || {} ) ),
      originalTemplate : state.originalTemplate ? JSON.parse( JSON.stringify( state.originalTemplate ) ) : null,
      currentTemplate : state.currentTemplate ? JSON.parse( JSON.stringify( state.currentTemplate ) ) : null,
      hasUnsavedChanges : state.hasUnsavedChanges || false,
      designerState : state.designerState ? JSON.parse( JSON.stringify( state.designerState ) ) : null,
      templateId : templateId || ( state.currentTemplate && ( state.currentTemplate.id || state.currentTemplate.template_id ) ) || null,
      timestamp : Date.now(),
      routePath : routeLike?.path || null,
      routeParams : routeLike?.params ? JSON.parse( JSON.stringify( routeLike.params ) ) : {}
    }
    stateCache.set( cacheKey, cachedState )
    console.log( `[Designer State Cache] Saved state for key: ${cacheKey}` )
  }

  // Restore state from cache
  const restoreState = route => {
    const cacheKey = generateCacheKey( route )
    const cachedState = stateCache.get( cacheKey )

    if ( cachedState ) {
      // Validate that cached state matches current route
      const routeMatches = cachedState.routePath === route.path
      const paramsMatch = JSON.stringify( cachedState.routeParams ) === JSON.stringify( route.params || {} )
      const idMatch = !route.params?.id || !cachedState.templateId
        || String( cachedState.templateId ) === String( route.params.id )

      if ( routeMatches && paramsMatch && idMatch ) {
        console.log( `[Designer State Cache] Restored state for key: ${cacheKey}` )
        return {
          templateForm : cachedState.templateForm,
          originalTemplate : cachedState.originalTemplate,
          currentTemplate : cachedState.currentTemplate,
          hasUnsavedChanges : cachedState.hasUnsavedChanges,
          designerState : cachedState.designerState
        }
      } else {
        console.log( `[Designer State Cache] Cached state route mismatch for key: ${cacheKey}, removing` )
        stateCache.delete( cacheKey )
      }
    }

    console.log( `[Designer State Cache] No cached state found for key: ${cacheKey}` )
    return null
  }

  const restoreStateByKey = cacheKey => {
    const cachedState = stateCache.get( cacheKey )
    if ( cachedState ) {
      return {
        templateForm : cachedState.templateForm,
        originalTemplate : cachedState.originalTemplate,
        currentTemplate : cachedState.currentTemplate,
        hasUnsavedChanges : cachedState.hasUnsavedChanges,
        designerState : cachedState.designerState
      }
    }
    return null
  }

  // Restore state by templateId with optional migration to the correct key for the given route
  const restoreStateByTemplateId = (templateId, route = null) => {
    if (!templateId) return null

    let foundEntry = null
    let foundKey = null
    for (const [key, state] of stateCache.entries()) {
      const stateId = state.templateId || state.currentTemplate?.id || state.currentTemplate?.template_id
      if (String(stateId) === String(templateId)) {
        foundEntry = state
        foundKey = key
        break
      }
    }

    if (!foundEntry) return null

    // If a target route is provided, migrate this entry under the correct key
    if (route) {
      const newKey = generateCacheKey(route)
      const migrated = {
        ...foundEntry,
        routePath: route.path,
        routeParams: route.params ? JSON.parse(JSON.stringify(route.params)) : {},
        timestamp: Date.now(),
      }
      stateCache.set(newKey, migrated)
      if (foundKey !== newKey) {
        stateCache.delete(foundKey)
      }
      foundEntry = migrated
    }

    return {
      templateForm: foundEntry.templateForm,
      originalTemplate: foundEntry.originalTemplate,
      currentTemplate: foundEntry.currentTemplate,
      hasUnsavedChanges: foundEntry.hasUnsavedChanges,
      designerState: foundEntry.designerState,
    }
  }

  // Check if state exists in cache
  const hasCachedState = route => {
    const cacheKey = generateCacheKey( route )
    return stateCache.has( cacheKey )
  }

  const hasCachedStateByKey = cacheKey => stateCache.has( cacheKey )

  // Clear specific cached state
  const clearState = route => {
    const cacheKey = generateCacheKey( route )
    const deleted = stateCache.delete( cacheKey )
    if ( deleted ) {
      console.log( `[Designer State Cache] Cleared state for key: ${cacheKey}` )
    }
    return deleted
  }

  const clearStateByKey = cacheKey => {
    const deleted = stateCache.delete( cacheKey )
    if ( deleted ) {
      console.log( `[Designer State Cache] Cleared state for key: ${cacheKey}` )
    }
    return deleted
  }

  // Clear state by path (for cleanup when tabs are closed)
  const clearStateByPath = path => {
    let deleted = false
    for ( const [key, state] of stateCache.entries() ) {
      if ( state.routePath === path ) {
        stateCache.delete( key )
        console.log( `[Designer State Cache] Cleared state by path: ${path}, key: ${key}` )
        deleted = true
      }
    }
    return deleted
  }

  // Clear all cached states (useful for memory management)
  const clearAllStates = () => {
    const count = stateCache.size
    stateCache.clear()
    console.log( `[Designer State Cache] Cleared all ${count} cached states` )
  }

  // Cleanup old cached states (older than 1 hour by default)
  const cleanupOldStates = ( maxAge = 60 * 60 * 1000 ) => {
    const now = Date.now()
    let cleaned = 0

    for ( const [key, state] of stateCache.entries() ) {
      if ( now - state.timestamp > maxAge ) {
        stateCache.delete( key )
        cleaned++
      }
    }

    if ( cleaned > 0 ) {
      console.log( `[Designer State Cache] Cleaned up ${cleaned} old states` )
    }

    return cleaned
  }

  // Get cache statistics for debugging
  const getCacheStats = () => {
    return {
      totalCached : stateCache.size,
      cacheKeys : Array.from( stateCache.keys() ),
      cacheDetails : Array.from( stateCache.entries() ).map( ( [key, state] ) => ( {
        key,
        routePath : state.routePath,
        hasUnsavedChanges : state.hasUnsavedChanges,
        stepsCount : state.templateForm?.steps?.length || 0,
        timestamp : new Date( state.timestamp ).toISOString()
      } ) )
    }
  }

  return {
    saveState,
    saveStateByKey,
    restoreState,
    restoreStateByKey,
    restoreStateByTemplateId,
    hasCachedState,
    hasCachedStateByKey,
    clearState,
    clearStateByKey,
    clearStateByPath,
    clearAllStates,
    cleanupOldStates,
    getCacheStats
  }
}

import { defineStore } from 'pinia'
import { clearDesignerCacheByPath } from '@/composables/designer/useDesignerStateCache'

const useTagsViewStore = defineStore( {
  id : 'tagsView',
  state : () => {
    return {
      visitedViews : [],
      cachedViews : [],
      currentClose : ''
    }
  },
  actions : {
    ADD_VIEW( view ) {
      this.ADD_VISITED_VIEW( view )
      this.ADD_CACHED_VIEW( view )
    },
    DEL_VIEW( view ) {
      return new Promise( resolve => {
        this.DEL_VISITED_VIEW( view )
        this.DEL_CACHED_VIEW( view )
        resolve( {
          visitedViews : [...this.visitedViews],
          cachedViews : [...this.cachedViews]
        } )
      } )
    },
    DEL_OTHERS_VIEWS( view ) {
      return new Promise( resolve => {
        this.DEL_OTHERS_VISITED_VIEWS( view )
        this.DEL_OTHERS_CACHED_VIEWS( view )
        resolve( [...this.visitedViews] )
      } )
    },
    DEL_ALL_VIEWS( view ) {
      return new Promise( resolve => {
        this.DEL_ALL_VISITED_VIEWS( view )
        this.DEL_ALL_CACHED_VIEWS( view )
        resolve( {
          visitedViews : [...this.visitedViews],
          cachedViews : [...this.cachedViews]
        } )
      } )
    },

    ADD_VISITED_VIEW( view ) {
      // Special handling for Production routes - use single tab
      if ( view.path && view.path.startsWith( '/production' ) ) {
        const existingProductionView = this.visitedViews.find( v => v.path && v.path.startsWith( '/production' ) )

        if ( existingProductionView ) {
          // Update existing Production tab
          existingProductionView.path = view.path
          existingProductionView.name = view.name
          existingProductionView.fullPath = view.fullPath
          existingProductionView.query = view.query
          existingProductionView.meta = view.meta
          existingProductionView.title = `Production - ${view.meta.title}`
          return
        } else {
          // Create new Production tab with custom title
          this.visitedViews.push(
            Object.assign( {}, view, {
              title : `Production - ${view.meta.title}`
            } )
          )
          return
        }
      }

      // Standard behavior for non-Production routes
      if ( this.visitedViews.some( v => v.path === view.path ) ) return
      this.visitedViews.push(
        Object.assign( {}, view, {
          title : view.meta.title || 'no-name'
        } )
      )
    },

    UPDATE_VISITED_VIEW_TITLE( path, newTitle ) {
      const view = this.visitedViews.find( v => v.path === path )
      if ( view ) {
        view.title = newTitle
      }
    },
    ADD_CACHED_VIEW( view ) {
      if ( this.cachedViews.includes( view.name ) ) {
        return
      }
      if ( !view.meta.noCache ) {
        this.cachedViews.push( view.name )
      }
    },

    DEL_VISITED_VIEW( view ) {
      for ( const [i, v] of this.visitedViews.entries() ) {
        if ( v.path === view.path ) {
          this.visitedViews.splice( i, 1 )
          // Clear designer state cache for this path if it's a designer route
          if ( view.path && view.path.includes( '/maintenance-library/designer' ) ) {
            clearDesignerCacheByPath( view.path )
          }
          break
        }
      }
    },
    DEL_CACHED_VIEW( view ) {
      const index = this.cachedViews.indexOf( view.name )
      index > -1 && this.cachedViews.splice( index, 1 )
    },

    DEL_OTHERS_VISITED_VIEWS( view ) {
      // Clear designer cache for all views except current and affix
      this.visitedViews.forEach( v => {
        if ( !v.meta.affix && v.path !== view.path && v.path && v.path.includes( '/maintenance-library/designer' ) ) {
          clearDesignerCacheByPath( v.path )
        }
      } )
      this.visitedViews = this.visitedViews.filter( v => {
        return v.meta.affix || v.path === view.path
      } )
    },
    DEL_OTHERS_CACHED_VIEWS( view ) {
      const index = this.cachedViews.indexOf( view.name )
      if ( index > -1 ) {
        this.cachedViews = this.cachedViews.slice( index, index + 1 )
      } else {
        this.cachedViews = []
      }
    },

    DEL_ALL_VISITED_VIEWS() {
      // Clear designer cache for all non-affix views
      this.visitedViews.forEach( v => {
        if ( !v.meta.affix && v.path && v.path.includes( '/maintenance-library/designer' ) ) {
          clearDesignerCacheByPath( v.path )
        }
      } )
      const affixTags = this.visitedViews.filter( tag => tag.meta.affix )
      this.visitedViews = affixTags
    },
    DEL_ALL_CACHED_VIEWS() {
      this.cachedViews = []
    },

    UPDATE_VISITED_VIEW( view ) {
      for ( let v of this.visitedViews ) {
        if ( v.path === view.path ) {
          v = Object.assign( v, view )
          break
        }
      }
    },
    CURRENT_CLOSE( name ) {
      this.currentClose = name || ''
    }
  }
} )
export default useTagsViewStore

import MesStreetMap from './src/index.vue'
export const StreetMap = Object.assign( MesStreetMap, {
  install( app ) {
    app.component( MesStreetMap.name, MesStreetMap )
  }
} )

export default StreetMap

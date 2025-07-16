import MesThumb from './src/index.vue'
export const Thumb = Object.assign( MesThumb, {
  install( app ) {
    app.component( MesThumb.name, MesThumb )
  }
} )

export default Thumb

import MesSvgIcon from './src/index.vue'
export const SvgIcon = Object.assign( MesSvgIcon, {
  install( app ) {
    app.component( MesSvgIcon.name, MesSvgIcon )
  }
} )

export default SvgIcon

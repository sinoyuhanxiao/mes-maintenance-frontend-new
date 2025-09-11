import MesLayout from './src/index.vue'
export const Layout = Object.assign( MesLayout, {
  install( app ) {
    app.component( MesLayout.name, MesLayout )
  }
} )

export default Layout

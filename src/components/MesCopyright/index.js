import MesCopyright from './src/index.vue'
export const Copyright = Object.assign(MesCopyright, {
  install(app) {
    app.component(MesCopyright.name, MesCopyright)
  },
})

export default Copyright

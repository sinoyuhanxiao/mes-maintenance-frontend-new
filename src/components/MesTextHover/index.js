import MesTextHover from './src/index.vue'
export const TextHover = Object.assign(MesTextHover, {
  install(app) {
    app.component(MesTextHover.name, MesTextHover)
  },
})

export default TextHover

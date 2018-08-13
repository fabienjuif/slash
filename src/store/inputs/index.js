import keyboard from './keyboard'

export default store => {
  store.bindings.set({
    jump: 67, // c
    shield: 86, // v
    left: 37, // left arrow
    right: 39, // right arrow
    up: 38, // top arrow
    bottom: 40, // bottom arrow
  })

  store.inputs.set({
    // skills
    jump: false,
    shield: false,
    // movements
    left: false,
    right: false,
    up: false,
    bottom: false,
  })

  keyboard(store)
}

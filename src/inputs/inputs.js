import Keyboard from './keyboard'
import Touch from './touch'

/**
 * @param {Object} bindings Object as Map (code => { keyCode / zone })
 */
const create = (bindings) => {
  const codes = Object.keys(bindings)
  const keys = {}

  codes.forEach((code) => {
    keys[code] = false
  })

  return {
    codes,
    keys,
    keyboard: Keyboard.create(bindings),
    touch: Touch.create(bindings),
  }
}

const update = (inputs) => {
  inputs.keyboard = Keyboard.update(inputs.keyboard)
  inputs.touch = Touch.update(inputs.touch)

  const { codes, keyboard, touch } = inputs

  codes.forEach((code) => {
    inputs.keys[code] = keyboard.keys[code] || touch.keys[code]
  })

  return inputs
}

const clear = (inputs) => {
  inputs.keyboard = Keyboard.clear(inputs.keyboard)
  inputs.touch = Touch.clear(inputs.touch)

  return inputs
}

export default {
  create,
  update,
  clear,
}

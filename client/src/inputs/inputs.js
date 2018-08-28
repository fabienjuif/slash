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
    bindings,
    listeners: [],
    keyboard: Keyboard.create(bindings),
    touch: Touch.create(bindings),
  }
}

const addListener = (inputs, listener) => {
  inputs.listeners.push(listener)
}

const update = (inputs) => {
  const { codes, keyboard, touch, listeners } = inputs

  codes.forEach((code) => {
    const before = inputs.keys[code]
    const after = keyboard.keys[code] || touch.keys[code]
    inputs.keys[code] = after

    if (before !== after) {
      listeners.forEach(listener => listener({ code, before, after }))
    }
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
  addListener,
  update,
  clear,
}

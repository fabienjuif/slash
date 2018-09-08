import Keyboard from './keyboard'
import Touch from './touch'

/**
 * @param {Object} bindings Object as Map (code => { keyCode / zone })
 */
const create = (bindings, { server } = {}) => {
  const codes = Object.keys(bindings)
  const keys = {}
  const delayedKeys = {}

  codes.forEach((code) => {
    keys[code] = false
    delayedKeys[code] = false
  })

  return {
    server,
    codes,
    keys,
    delayedKeys,
    bindings,
    listeners: [],
    keyboard: Keyboard.create(bindings),
    touch: Touch.create(bindings),
  }
}

const setLatencyKeys = (inputs, keys) => {
  setTimeout(
    () => Object.assign(inputs.delayedKeys, keys),
    inputs.server.latency,
  )
}

const update = (inputs) => {
  const { codes, keyboard, touch } = inputs
  const keys = {}

  let changed = false
  codes.forEach((code) => {
    const before = inputs.keys[code]
    const after = keyboard.keys[code] || touch.keys[code]
    keys[code] = after

    if (before !== after) changed = true
  })

  // realtime inputs
  Object.assign(inputs.keys, keys)

  // latency inputs
  if (inputs.server && changed) setLatencyKeys(inputs, keys)

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

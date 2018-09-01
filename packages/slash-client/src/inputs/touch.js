/**
 * @param {Object} bindings Object as Map(code -> zone: ({ x, y, width, height }))
 */
const create = (bindings) => {
  const inputs = {
    id: 'touch',
    keys: {},
    identifiers: {},
    touched: false,
    handle: undefined,
    handleStop: undefined,
  }

  const codes = Object.keys(bindings)

  codes.forEach((code) => {
    inputs.identifiers[code] = undefined
    inputs.keys[code] = false
  })

  inputs.handleStop = (event) => {
    const { changedTouches } = event

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier } = changedTouches[i]

      for (let j = 0; j < codes.length; j += 1) {
        const code = codes[j]

        if (inputs.identifiers[code] === identifier) {
          inputs.keys[code] = false
          inputs.identifiers[code] = undefined
        }
      }
    }
  }

  inputs.handle = (event) => {
    const { changedTouches } = event

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { clientX, clientY, identifier } = changedTouches[i]

      for (let j = 0; j < codes.length; j += 1) {
        const code = codes[j]
        inputs.touched = true

        if (inputs.identifiers[code] === undefined || (inputs.identifiers[code] === identifier)) {
          const { zone } = bindings[code]

          if (!zone) return

          inputs.keys[code] = (
            clientX >= zone.x &&
            clientX <= zone.x + zone.width &&
            clientY >= zone.y &&
            clientY <= zone.y + zone.height
          )

          if (inputs.keys[code]) inputs.identifiers[code] = identifier
        }
      }
    }
  }

  window.addEventListener('touchstart', inputs.handle)
  window.addEventListener('touchmove', inputs.handle)
  window.addEventListener('touchend', inputs.handleStop)
  window.addEventListener('touchcancel', inputs.handleStop)
  window.addEventListener('touchleave', inputs.handleStop)

  return inputs
}

const clear = (inputs) => {
  const { handle, handleStop } = inputs

  window.removeEventListener('touchstart', handle)
  window.removeEventListener('touchmove', handle)
  window.removeEventListener('touchend', handleStop)
  window.removeEventListener('touchcancel', handleStop)
  window.removeEventListener('touchleave', handleStop)

  return inputs
}

export default {
  create,
  clear,
}

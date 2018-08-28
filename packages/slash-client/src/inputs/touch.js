/**
 * @param {Object} bindings Object as Map(code -> zone: ({ x, y, width, height }))
 */
const create = (bindings) => {
  const identifiers = {}
  const keys = {}
  const codes = Object.keys(bindings)

  codes.forEach((code) => {
    identifiers[code] = undefined
    keys[code] = false
  })

  const handleStop = (event) => {
    const { changedTouches } = event

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { identifier } = changedTouches[i]

      for (let j = 0; j < codes.length; j += 1) {
        const code = codes[j]

        if (identifiers[code] === identifier) {
          keys[code] = false
          identifiers[code] = undefined
        }
      }
    }
  }

  const handle = (event) => {
    const { changedTouches } = event

    for (let i = 0; i < changedTouches.length; i += 1) {
      const { clientX, clientY, identifier } = changedTouches[i]

      for (let j = 0; j < codes.length; j += 1) {
        const code = codes[j]

        if (identifiers[code] === undefined || (identifiers[code] === identifier)) {
          const { zone } = bindings[code]

          keys[code] = (
            clientX >= zone.x &&
            clientX <= zone.x + zone.width &&
            clientY >= zone.y &&
            clientY <= zone.y + zone.height
          )

          if (keys[code]) identifiers[code] = identifier
        }
      }
    }
  }

  window.addEventListener('touchstart', handle)
  window.addEventListener('touchmove', handle)
  window.addEventListener('touchend', handleStop)
  window.addEventListener('touchcancel', handleStop)
  window.addEventListener('touchleave', handleStop)

  return {
    id: 'touch',
    keys,
    identifiers,
    handle,
    handleStop,
  }
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

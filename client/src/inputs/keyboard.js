/**
 * @param {Object} bindings Object as Map(code -> keyCode)
 */
const create = (bindings) => {
  const codes = Object.keys(bindings)
  const keys = {}

  codes.forEach((code) => {
    keys[code] = false
  })

  const reactKey = (event) => {
    const { keyCode, type, key } = event

    const code = codes.find(c => (
      bindings[c].keyCode === keyCode ||
      bindings[c].key === key
    ))
    if (!code) return

    keys[code] = (type === 'keydown')
    event.preventDefault()
  }

  window.addEventListener('keydown', reactKey)
  window.addEventListener('keyup', reactKey)

  return {
    id: 'keyboard',
    keys,
    reactKey,
    bindings,
  }
}

const clear = (inputs) => {
  window.removeEventListener('keydown', inputs.reactKey)
  window.removeEventListener('keyup', inputs.reactKey)

  return inputs
}

export default {
  create,
  clear,
}

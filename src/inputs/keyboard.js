/**
 * @param {Object} bindings Object as Map(code -> keyCode)
 */
const create = (bindings) => {
  const keyCodes = Object.values(bindings).map(binding => binding.keyCode)
  const codes = Object.keys(bindings)
  const keys = {}

  codes.forEach((code) => {
    keys[code] = false
  })

  const reactKey = ({ keyCode, type }) => {
    if (!keyCodes.includes(keyCode)) return

    const code = codes.find(code => bindings[code].keyCode === keyCode)
    keys[code] = (type === 'keydown')
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
  update: inputs => inputs,
}

const defaultBindings = {
  enter: 13, // enter key
  test: 84, // t key
}

const create = ({ bindings = defaultBindings } = {}) => {
  const inputs = {
    keys: {
      enter: false,
      test: false,
    },
  }

  const entries = Object.entries(bindings)

  const reactKey = ({ keyCode, type }) => {
    const entry = entries.find(([key, value]) => value === keyCode)
    if (!entry) return

    const [key] = entry
    inputs.keys[key] = type === 'keydown'
  }

  window.addEventListener('keydown', reactKey)
  window.addEventListener('keyup', reactKey)

  return Object.assign(
    inputs,
    {
      reactKey,
      bindings,
    },
  )
}

const clear = (inputs) => {
  window.removeEventListener('keydown', inputs.reactKey)
  window.removeEventListener('keyup', inputs.reactKey)
}

export default {
  create,
  clear,
}

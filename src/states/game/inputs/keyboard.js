import Inputs from './inputs'

// TODO: this code should be merge with Gameover/inputs and Welcome/Inputs
const defaultBindings = {
  jump: 67, // c
  shield: 86, // v
  left: 37, // left arrow
  right: 39, // right arrow
  up: 38, // top arrow
  down: 40, // bottom arrow
  enter: 13, // enter key
}

const create = ({ bindings = defaultBindings } = {}) => {
  const inputs = Inputs.create('keyboard')
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

const update = () => {
}

export default {
  create,
  clear,
  update,
}

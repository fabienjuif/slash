import Inputs from './inputs'

const defaultBindings = {
  jump: 67, // c
  shield: 86, // v
  left: 37, // left arrow
  right: 39, // right arrow
  up: 38, // top arrow
  down: 40, // bottom arrow
}

const create = (entity, { game, bindings = defaultBindings }) => {
  const inputs = Inputs.create(entity, { game })

  const entries = Object.entries(bindings)

  const reactKey = ({ keyCode, type }) => {
    const entry = entries.find(([key, value]) => value === keyCode)
    if (!entry) return

    const [key] = entry
    inputs.keys[key] = type === 'keydown'
  }

  // TODO: clear them
  window.addEventListener('keydown', reactKey)
  window.addEventListener('keyup', reactKey)

  return Object.assign(
    inputs,
    {
      bindings,
    },
  )
}

export default {
  create,
  clear: () => {},
  update: Inputs.update,
}

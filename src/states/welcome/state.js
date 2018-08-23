import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'
import Entity from './entities/entity'

const bindings = {
  enter: {
    keyCode: 13,
    zone: {
      x: 95,
      y: 340,
      width: 300,
      height: 25,
    },
  },
}

const create = () => ({
  inputs: undefined,
  entities: [],
  staticEntities: [],
})

const prepare = (state) => {
  const { renderer, staticEntities } = state

  state.inputs = Inputs.create(bindings)

  state.staticEntities.push(Entity.create('ui'))

  Renderer.addToStage(renderer, staticEntities)
}

const update = (state) => {
  state.inputs = Inputs.update(state.inputs)

  const { inputs } = state
  const { keys, touch } = inputs

  if (keys.enter) {
    state.isTouched = !!touch.keys.enter
    return 'game'
  }

  return 'welcome'
}

// TODO: merge code about this (in states)
const clear = (state) => {
  Inputs.clear(state.inputs)
  state.entities.forEach(Entity.clear)
  state.staticEntities.forEach(Entity.clear)
  state.entities = []
  state.staticEntities = []
}

export default {
  create,
  prepare,
  clear,
  update,
}

import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'
import Skill from '../../skill' // TODO: rename it 'timer' ?
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
  more: {
    key: '+',
  },
  less: {
    key: '-',
  },
}

const create = () => ({
  inputs: undefined,
  iaCount: 2, // TODO: rename aiCount
  entities: [],
  staticEntities: [],
  skills: {
    ai: Skill.create('ai', { cooldown: 150, last: 0 }),
  },
})

const prepare = (state) => {
  const { renderer, staticEntities } = state

  state.inputs = Inputs.create(bindings)

  staticEntities.push(Entity.create('ui', state))

  Renderer.addToStage(renderer, staticEntities)
}

const update = (state) => {
  const { inputs, staticEntities, skills } = state
  const { keys, touch } = inputs

  state.inputs = Inputs.update(inputs)

  if (keys.enter) {
    state.isTouched = !!touch.keys.enter
    return 'game'
  }

  // TODO: move this into UI entity ?
  if (!Skill.isCooldown(skills.ai)) {
    if (keys.more || keys.less) Skill.trigger(skills.ai)
    if (keys.more) state.iaCount += 1
    if (keys.less) state.iaCount -= 1
    if (state.iaCount < 1) state.iaCount = 1
  }

  state.staticEntities = staticEntities.filter(Entity.draw)

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

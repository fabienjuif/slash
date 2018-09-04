import { Timer } from 'slash-utils'
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
  online: {
    key: 'o',
    zone: {
      x: window.innerWidth - 210,
      y: 10,
      width: 200,
      height: 200,
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
  aiCount: 2,
  entities: [],
  staticEntities: [],
  timers: {
    ai: Timer.create('ai', { cooldown: 150, last: 0 }),
  },
})

const prepare = (state) => {
  const { renderer, staticEntities } = state

  state.inputs = Inputs.create(bindings)

  staticEntities.push(Entity.create('ui', state))

  Renderer.addToStage(renderer, staticEntities)
}

const update = (state) => {
  const { inputs, staticEntities, timers } = state
  const { keys, touch } = inputs

  state.inputs = Inputs.update(inputs)
  state.isTouched = touch.touched

  if (keys.online) return 'lobby'
  if (keys.enter) {
    state.server = undefined
    return 'game'
  }

  // TODO: move this into UI entity ?
  if (!Timer.isCooldown(timers.ai)) {
    if (keys.more || keys.less) Timer.trigger(timers.ai)
    if (keys.more) state.aiCount += 1
    if (keys.less) state.aiCount -= 1
    if (state.aiCount < 1) state.aiCount = 1
  }

  state.staticEntities = staticEntities.filter(Entity.draw)

  return 'welcome'
}

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

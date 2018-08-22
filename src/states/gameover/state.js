import { Text } from 'pixi.js'
import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'
import State from '../state'

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

const create = (renderer) => {
  const state = State.create('gameover', { renderer })

  state.ui = new Text('Gameover', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  state.inputs = undefined

  return state
}

const prepare = (state, previous) => {
  const { ui, renderer } = state
  const { player } = previous

  state.inputs = Inputs.create(bindings)

  Renderer.addToStage(renderer, { graphics: ui })

  const whyStr = player.hp > 0 ? 'You win 💪' : 'You loose 😱'
  const why = new Text(whyStr, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  why.position.x = 30
  why.position.y = 30
  Renderer.addToStage(renderer, { graphics: why })

  const hint = new Text('Press <enter> to restart', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  hint.position.x = 30
  hint.position.y = 60
  Renderer.addToStage(renderer, { graphics: hint })

  const touch = new Text('Or <touch> here (mobile)', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  touch.position.x = 95
  touch.position.y = 340
  Renderer.addToStage(renderer, { graphics: touch })
}

const update = (state) => {
  state.inputs = Inputs.update(state.inputs)

  const { inputs } = state

  if (inputs.keys.enter) return 'welcome'
  return 'gameover'
}

const clear = (state) => {
  Inputs.clear(state.inputs)
}

export default {
  create,
  prepare,
  update,
  clear,
}

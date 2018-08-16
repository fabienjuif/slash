import { Text } from 'pixi.js'
import Renderer from '../../renderer/renderer'
import State from '../state'
import Inputs from './inputs'

const create = (renderer) => {
  const state = State.create('gameover', { renderer })

  state.ui = new Text('Gameover', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })

  return state
}

const prepare = (state, previous) => {
  const { ui, renderer } = state
  const { player } = previous
  state.inputs = Inputs.create()

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
}

const update = (state) => {
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

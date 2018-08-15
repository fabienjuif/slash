import { Text } from 'pixi.js'
import Renderer from '../renderer/renderer'
import State from './state'

const create = (renderer) => {
  const state = State.create('gameover', { renderer })

  state.ui = new Text('Gameover', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })

  return state
}

const prepare = (state, previous) => {
  const { ui, renderer } = state
  const { inputs } = previous
  state.inputs = inputs.player

  Renderer.addToStage(renderer, { graphics: ui })
}

const update = (state) => {
  const { inputs } = state

  if (inputs.keys.enter) return 'game'
  return 'gameover'
}

export default {
  create,
  prepare,
  update,
}

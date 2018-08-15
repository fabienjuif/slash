import { Text } from 'pixi.js'
import Renderer from '../renderer/renderer'
import State from './state'

const create = (renderer) => {
  const state = State.create('gameover', { renderer })

  state.ui = new Text('Gameover', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })

  return state
}

const prepare = (state) => {
  const { ui, renderer } = state

  Renderer.addToStage(renderer, { graphics: ui })
}

const update = () => {}

export default {
  create,
  prepare,
  update,
}

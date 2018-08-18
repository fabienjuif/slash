import { Text, Rectangle, Graphics } from 'pixi.js'
import Renderer from '../../renderer/renderer'
import State from '../state'
import Inputs from './inputs'

const create = (renderer) => {
  const state = State.create('test', { renderer })

  state.ui = new Text('Test', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  state.skill = new Graphics()

  return state
}

const prepare = (state) => {
  const { ui, skill, renderer } = state
  state.inputs = Inputs.create()

  Renderer.addToStage(renderer, { graphics: ui })
  Renderer.addToStage(renderer, { graphics: skill })

}

const update = (state) => {
  const { skill, inputs, ui } = state

  // update inputs
  Inputs.update(inputs)
  const { shield, jump, left, down, up, right } = inputs.keys

  // update ui
  skill.clear()

  // shield
  skill.beginFill(0x42B37F)
  skill.drawCircle(window.innerWidth - 30, window.innerHeight - 30, shield ? 20 : 25)
  skill.endFill()

  // jump
  skill.beginFill(0xAE2D2D)
  skill.drawCircle(window.innerWidth - 90, window.innerHeight - 30, jump ? 20 : 25)
  skill.endFill()

  // stick (outline)
  skill.lineStyle(2, 0xffffff)
  skill.drawCircle(50, window.innerHeight - 50, 40)
  skill.endFill()

  // stick (inner)
  skill.beginFill(0xffffff)
  skill.drawCircle(50 + (left ? -10 : 0) + (right ? 10 : 0), window.innerHeight - 50 + (up ? -10 : 0) + (down ? 10 : 0), 10)
  skill.endFill()

  return 'test'
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

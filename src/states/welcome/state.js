import { Text, Container } from 'pixi.js'
import Renderer from '../../renderer/renderer'
import State from '../state'
import Inputs from './inputs'

const create = (renderer) => {
  const state = State.create('welcome', { renderer })

  state.inputs = Inputs.create()
  state.ui = new Container()

  let x = 0
  let y = 0
  const text = (text) => {
    const textContainer = state.ui.addChild(new Text(text, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
    textContainer.x = x
    textContainer.y = y

    y+= 20
  }
  text('Welcome to slash')
  x += 100
  y += 50
  text('Here are the rules')
  text('You have two skills to learn:')
  x +=100
  text('1. <C> to SLASH')
  text('2. <V> to shield')
  x -=100
  y += 50
  text('You are against 2 AI, try to kill them by slashing through them!')
  y += 50
  text('Press <enter> to start ⚡️')

  return state
}

const prepare = (state) => {
  const { ui, renderer } = state
  state.inputs = Inputs.create()

  Renderer.addToStage(renderer, { graphics: ui })
}

const update = (state) => {
  const { inputs } = state

  if (inputs.keys.enter) return 'game'
  if (inputs.keys.test) return 'test'
  return 'welcome'
}

const clear = (state) => {
  Inputs.clear(state.inputs)
}

export default {
  create,
  prepare,
  clear,
  update,
}

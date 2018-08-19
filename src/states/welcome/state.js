import { Text, Container, Graphics } from 'pixi.js'
import Renderer from '../../renderer/renderer'
import State from '../state'
import Keyboard from './inputs/keyboard'
import Touch from './inputs/touch'

const create = (renderer) => {
  const state = State.create('welcome', { renderer })

  state.inputs = []
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
  y += 50
  text('Or <touch> here (mobile)')

  return state
}

const prepare = (state) => {
  const { ui, renderer } = state

  state.inputs = [
    Keyboard.create(),
    Touch.create(),
  ]

  Renderer.addToStage(renderer, { graphics: ui })
}

const update = (state) => {
  const { inputs } = state

  for (let i = 0; i < inputs.length; i += 1) {
    if (inputs[i].keys.enter) {
      state.inputsType = inputs[i].type
      return 'game'
    }
  }

  return 'welcome'
}

const clear = (state) => {
  Keyboard.clear(state.inputs[0])
  Touch.clear(state.inputs[1])
}

export default {
  create,
  prepare,
  clear,
  update,
}

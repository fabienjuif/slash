import { Text, Container } from 'pixi.js'
import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'

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

const create = () => {
  const state = {
    inputs: undefined,
    ui: new Container(),
  }

  let x = 0
  let y = 0
  const printText = (text) => {
    const textContainer = state.ui.addChild(new Text(text, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
    textContainer.x = x
    textContainer.y = y

    y += 20
  }
  printText('Welcome to slash')
  x += 100
  y += 50
  printText('Here are the rules')
  printText('You have two skills to learn:')
  x += 100
  printText('1. <C> to SLASH')
  printText('2. <V> to shield')
  x -= 100
  y += 50
  printText('You are against 2 AI, try to kill them by slashing through them!')
  y += 50
  printText('Press <enter> to start ⚡️')
  y += 50
  printText('Or <touch> here (mobile)')

  return state
}

const prepare = (state) => {
  const { ui, renderer } = state

  state.inputs = Inputs.create(bindings)

  Renderer.addToStage(renderer, { graphics: ui })
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

const clear = (state) => {
  Inputs.clear(state.inputs)
}

export default {
  create,
  prepare,
  clear,
  update,
}

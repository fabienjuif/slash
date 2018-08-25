import { Container, Text } from 'pixi.js'

const create = (state) => {
  const entity = {
    graphics: new Container(),
    state,
  }

  return entity
}

const draw = (entity) => {
  const { graphics, state } = entity

  graphics.removeChildren()

  let x = 0
  let y = 0
  const printText = (text) => {
    const textContainer = graphics.addChild(new Text(text, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
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
  printText(`You are against ${state.aiCount} (press +/- to adjust) AI`)
  x += 20
  y += 20
  printText('Try to kill them by slashing through them!')
  x -= 20
  y += 30
  printText('Press <enter> to start ⚡️')
  y += 50
  printText('Or <touch> here (mobile)')

  return true
}

export default {
  create,
  draw,
}

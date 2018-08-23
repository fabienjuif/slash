import { Container, Text } from 'pixi.js'

const create = () => {
  const ui = {
    graphics: new Container(),
  }

  let x = 0
  let y = 0
  const printText = (text) => {
    const textContainer = ui.graphics.addChild(new Text(text, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
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

  return ui
}

export default {
  create,
}

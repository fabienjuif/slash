import { Text, Container } from 'pixi.js'

const create = ({ player }) => {
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
  printText(player.hp > 0 ? 'You win 💪' : 'You loose 😱')
  x += 100
  y += 250
  printText('Press <enter> to restart')
  y += 50
  printText('Or <touch> here (mobile)')

  return ui
}

const clear = (ui) => {
  const { graphics } = ui

  graphics.destroy({ children: true, texture: true })
}

export default {
  collides: () => {},
  update: () => true,
  draw: () => true,
  create,
  clear,
}

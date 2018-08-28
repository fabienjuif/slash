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
  x += 20
  y += 100
  printText(`You did ${player.kills} kill(s) !`)
  x += 80
  y += 150
  printText('Press <enter> to restart')
  y += 50
  printText('Or <touch> here (mobile)')

  return ui
}

export default {
  create,
}

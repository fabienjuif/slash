import { Container, Text } from 'pixi.js'

const create = (server) => {
  const entity = {
    graphics: new Container(),
    server,
  }

  return entity
}

const draw = (entity) => {
  const { graphics, server } = entity

  graphics.removeChildren()

  let y = 0
  const printPlayer = (player) => {
    const textContainer = graphics.addChild(new Text(player.id, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
    textContainer.x = 10
    textContainer.y = y

    y += 20
  }
  if (server.game) server.game.players.forEach(printPlayer)
  const textContainer = graphics.addChild(new Text('Type <enter> to mark you ready', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
  textContainer.x = 20
  textContainer.y = y + 20

  return true
}

export default {
  create,
  draw,
}

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
    const textContainer = graphics.addChild(new Text(player.name, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
    textContainer.x = 10
    textContainer.y = y

    y += 20
  }
  if (server.game) server.game.players.forEach(printPlayer)

  return true
}

export default {
  create,
  draw,
}

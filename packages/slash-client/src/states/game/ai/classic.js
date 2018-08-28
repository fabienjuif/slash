import { chance, choose } from 'slash-utils'

const create = game => ({
  id: 'ai-classic',
  game,
  entity: undefined,
  lastxDirection: 0,
  lastyDirection: 0,
  player: game.entities.find(entity => entity.id === 'player'),
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    shield: false,
    jump: false,
    enter: false,
  },
})

const update = (ai) => {
  const { entity, player, lastxDirection, lastyDirection, keys } = ai
  const { body } = entity

  const isPlayerClose = how => (
    Math.abs(player.body.position.x - body.position.x) < how &&
    Math.abs(player.body.position.y - body.position.y) < how
  )

  // try to jump or shield
  keys.jump = chance(isPlayerClose(300) ? 3 : 100)
  keys.shield = chance(isPlayerClose(200) ? 30 : 500)

  // move
  let playerXDirection = 1
  let playerYDirection = 1
  if (body.position.x > player.body.position.x) playerXDirection = -1
  if (body.position.y > player.body.position.y) playerYDirection = -1

  ai.lastxDirection = choose(
    [lastxDirection, isPlayerClose(400) ? 50 : 30],
    [playerXDirection, isPlayerClose(300) ? 50 : (isPlayerClose(400) ? 5 : 1)], // eslint-disable-line no-nested-ternary
    -1,
    1,
    0,
  )
  ai.lastyDirection = choose(
    [lastyDirection, isPlayerClose(400) ? 50 : 30],
    [playerYDirection, isPlayerClose(300) ? 50 : (isPlayerClose(400) ? 5 : 1)], // eslint-disable-line no-nested-ternary
    -1,
    1,
    0,
  )

  keys.up = (ai.lastyDirection < 0)
  keys.down = (ai.lastyDirection > 0)
  keys.left = (ai.lastxDirection < 0)
  keys.right = (ai.lastxDirection > 0)
}

export default {
  create,
  update,
}

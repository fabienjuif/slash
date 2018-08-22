import { Common } from 'matter-js'

const create = (game) => {
  return {
    id: 'ai-classic',
    game,
    entity: undefined,
    lastxDirection: 0,
    lastyDirection: 0,
    player: game.physics.entities.find(entity => entity.id === 'player'),
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      shield: false,
      jump: false,
      enter: false,
    },
  }
}

const update = (ai) => {
  const { entity, player, lastxDirection, lastyDirection, keys } = ai
  const { body } = entity

  const isPlayerClose = (
    Math.abs(player.body.position.x - body.position.x) < 200 &&
    Math.abs(player.body.position.y - body.position.y) < 200
  )

  // try to jump (TODO: use lodash random)
  keys.jump = Common.choose([...Array.from({ length: isPlayerClose ? 10 : 50 }).map(() => false), true])

  // try to shield (TODO: use lodash random)
  keys.shield = Common.choose([...Array.from({ length: isPlayerClose ? 50 : 100 }).map(() => false), true])

  // move
  let xDirection = 1
  let yDirection = 1
  if (body.position.x > player.body.position.x) xDirection = -1
  if (body.position.y > player.body.position.y) yDirection = -1

  ai.lastxDirection = Common.choose([0, lastxDirection, lastxDirection, lastxDirection, lastxDirection, lastxDirection, xDirection])
  ai.lastyDirection = Common.choose([0, lastyDirection, lastyDirection, lastyDirection, lastyDirection, lastyDirection, yDirection])

  keys.up = (ai.lastyDirection < 0)
  keys.down = (ai.lastyDirection > 0)
  keys.left = (ai.lastxDirection < 0)
  keys.right = (ai.lastxDirection > 0)
}

export default {
  create,
  update,
}

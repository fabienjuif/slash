import { Common, Body, Vector } from 'matter-js'
import Skill from '../skills/skill'
import Inputs from './inputs'

const clear = (inputs) => {
  inputs.keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    shield: false,
    jump: false,
  }

  inputs.cleared = true
}

const create = (player, { players }) => {
  const inputs = Object.assign(
    Inputs.create(player, { players }),
    {
      lastxDirection: 0,
      lastyDirection: 0,
      cleared: false,
    }
  )

  return inputs
}

const update = (inputs) => {
  const { player, players, lastxDirection, lastyDirection, keys, cleared } = inputs
  const { skills, physics } = player

  // dead -> clear all
  if (!cleared && Skill.isCooldown(skills.dead)) clear(inputs)

  // helper
  const isPlayerClose = (
    Math.abs(players[0].physics.position.x - player.physics.position.x) < 200 &&
    Math.abs(players[0].physics.position.y - player.physics.position.y) < 200
  )

  // try to jump (TODO: use lodash random)
  inputs.keys.jump = Common.choose([...Array.from({ length: isPlayerClose ? 10 : 50 }).map(() => false), true])

  // try to shield (TODO: use lodash random)
  inputs.keys.shield = Common.choose([...Array.from({ length: isPlayerClose ? 50 : 100 }).map(() => false), true])

  // move
  let xDirection = 1
  let yDirection = 1
  if (physics.position.x > players[0].physics.position.x) xDirection = -1
  if (physics.position.y > players[0].physics.position.y) yDirection = -1

  inputs.lastxDirection = Common.choose([0, lastxDirection, lastxDirection, lastxDirection, lastxDirection, lastxDirection, xDirection])
  inputs.lastyDirection = Common.choose([0, lastyDirection, lastyDirection, lastyDirection, lastyDirection, lastyDirection, yDirection])

  keys.up = (inputs.lastyDirection < 0)
  keys.down = (inputs.lastyDirection > 0)
  keys.left = (inputs.lastxDirection < 0)
  keys.right = (inputs.lastxDirection > 0)

  Inputs.update(inputs)
}

export default {
  create,
  update,
}

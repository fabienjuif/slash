import { Common, Body, Vector } from 'matter-js'
import Skill from '../skills/skill'
import Inputs from './inputs'

const create = (player, { players }) => {
  const inputs = Object.assign(
    Inputs.create(player, { players }),
    {
      lastxDirection: 0,
      lastyDirection: 0,
      intervals: {
        shield: 0,
        jump: 0,
        move: 0,
      },
    }
  )

  inputs.intervals.shield = setInterval(() => {
    inputs.keys.shield = Common.choose([true, false])
  }, 1000)

  inputs.intervals.jump = setInterval(() => {
    let notJumpChances = 5
    if (
      Math.abs(players[0].physics.position.x - player.physics.position.x) < 200 &&
      Math.abs(players[0].physics.position.y - player.physics.position.y) < 200
    ) {
      notJumpChances = 1
    }

    inputs.keys.jump = Common.choose([...Array.from({ length: notJumpChances }).map(() => false), true])
  }, 500)

  inputs.intervals.move = setInterval(() => {
    const { player, players, lastxDirection, lastyDirection, keys } = inputs
    const { skills, physics } = player

    if (Skill.isChanneling(skills.jump)) return

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

    Skill.trigger(skills.move)
  }, 10)

  return inputs
}

const clear = inputs => {
  const { intervals } = inputs
  const { shield, jump, move } = intervals

  if (shield) clearInterval(shield)
  if (jump) clearInterval(jump)
  if (move) clearInterval(move)
}

export default {
  create,
  clear,
  update: Inputs.update,
}

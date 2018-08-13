import { Common, Body, Vector } from 'matter-js'
import Skill from '../skills/skill'
import Inputs from './inputs'

const create = (player, { players, pause = false }) => {
  const inputs = Object.assign(
    Inputs.create(player, { players }),
    {
      pause,
      lastxDirection: 0,
      lastyDirection: 0,
      intervals: {
        shield: 0,
        jump: 0,
      },
    }
  )

  inputs.intervals.shield = setInterval(() => {
    if (inputs.pause) return
    Skill.trigger(player.skills.shield)
  }, 200)

  inputs.intervals.jump = setInterval(() => {
    if (inputs.pause) return
    if (Skill.isCooldown(player.skills.jump)) return

    let notJumpChances = 5
    if (
      Math.abs(players[0].physics.position.x - player.physics.position.x) < 200 &&
      Math.abs(players[0].physics.position.y - player.physics.position.y) < 200
    ) {
      notJumpChances = 1
    }

    if (Common.choose([...Array.from({ length: notJumpChances }).map(() => false), true])) {
      Skill.trigger(player.skills.jump)
    }
  }, 500)

  return inputs
}

const clear = inputs => {
  const { intervals } = inputs
  const { shield, jump } = intervals

  if (shield) clearInterval(shield)
  if (jump) clearInterval(jump)
}

const update = inputs => {
  if (inputs.pause) return

  const { player, players, lastxDirection, lastyDirection } = inputs
  const { skills, physics } = player
  const { jump } = skills

  if (!Skill.isChanneling(jump)) {
    let xDirection = 1
    let yDirection = 1
    if (physics.position.x > players[0].physics.position.x) xDirection = -1
    if (physics.position.y > players[0].physics.position.y) yDirection = -1

    inputs.lastxDirection = Common.choose([0, lastxDirection, lastxDirection, lastxDirection, lastxDirection, lastxDirection, xDirection])
    inputs.lastyDirection = Common.choose([0, lastyDirection, lastyDirection, lastyDirection, lastyDirection, lastyDirection, yDirection])

    // looking to deplacement direction
    player.looking.x = inputs.lastxDirection
    player.looking.y = inputs.lastyDirection

    // TODO: should no mutate this here
    Body.setVelocity(physics, Vector.mult({ x: inputs.lastxDirection, y: inputs.lastyDirection }, 20))
  }
}

const pause = inputs => {
  inputs.pause = true
}

export default {
  create,
  clear,
  update,
  pause,
}

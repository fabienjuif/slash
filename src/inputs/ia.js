import { Common, Body, Vector } from 'matter-js'
import Skill from '../skills/skill'
import Inputs from './inputs'

const create = (player, { players }) => {
  const inputs = Inputs.create(player, { players })

  return Object.assign(inputs, {
    lastxDirection: 0,
    lastyDirection: 0,
    intervals: {
      // shield
      shield: setInterval(() => {
        Skill.trigger(player.skills.shield)
      }, 200),

      // jump
      jump: setInterval(() => {
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
      }, 500),
    },
  })
}

const clear = inputs => {
  const { intervals } = inputs
  const { shield, jump } = intervals

  if (shield) clearInterval(shield)
  if (jump) clearInterval(jump)
}

const update = inputs => {
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

export default {
  create,
  clear,
  update,
}

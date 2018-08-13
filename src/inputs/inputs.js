import Skill from '../skills/skill'

const create = (player, { players }) => {
  return {
    player,
    players,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      shield: false,
      jump: false,
    },
  }
}

const update = inputs => {
  const { player, keys } = inputs
  const { skills } = player

  const { up, down, left, right, shield, jump } = keys

  if (jump && !Skill.isChanneling(jump)) {
    Skill.trigger(skills.jump)
    return
  }

  let x = 0
  let y = 0

  if (up) y -= 1
  if (down) y = 1
  if (right) x = 1
  if (left) x = -1
  if (!up && !down) y = 0
  if (!right && !left) x = 0

  // looking to deplacement direction
  player.moving.x = x
  player.moving.y = y
  player.looking.x = x
  player.looking.y = y

  Skill.trigger(skills.move)

  if (shield) {
    Skill.trigger(skills.shield)
  }
}

export default {
  create,
  update,
}

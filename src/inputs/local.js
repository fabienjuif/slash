import { Common, Body, Vector } from 'matter-js'
import Skill from '../skills/skill'
import Inputs from './inputs'

const defaultBindings = {
  jump: 67, // c
  shield: 86, // v
  left: 37, // left arrow
  right: 39, // right arrow
  up: 38, // top arrow
  down: 40, // bottom arrow
}

const create = (player, { players, bindings = defaultBindings }) => {
  const inputs = Inputs.create(player, { players })

  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    shield: false,
    jump: false,
  }

  const entries = Object.entries(bindings)

  const reactKey = ({ keyCode, type }) => {
    const entry = entries.find(([key, value]) => value === keyCode)
    if (!entry) return

    const [key] = entry
    keys[key] = type === 'keydown'
  }

  // TODO: clear them
  window.addEventListener('keydown', reactKey)
  window.addEventListener('keyup', reactKey)

  return Object.assign(inputs, {
    keys,
    bindings,
  })
}

// TODO: update should be in sprite class and we can give it inputs
// not the other way around ?
const update = inputs => {
  const { player, keys } = inputs
  const { skills, physics } = player

  // TODO: make it common with bot
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

  // TODO: don't move physics here
  Body.setVelocity(physics, Vector.mult({ x, y }, 20))

  // looking to deplacement direction
  player.looking.x = x
  player.looking.y = y

  if (shield) {
    Skill.trigger(skills.shield)
  }
}

export default {
  create,
  clear: () => {},
  update,
}

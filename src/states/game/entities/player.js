import { Graphics } from 'pixi.js'
import { Bodies, Body, Vector, Pair } from 'matter-js'
import Skill from '../skill'

const create = ({ id, x, y, inputs, color = 0xff00ff }) => {
  const skills = {
    jump: Skill.create('jump', { cooldown: 1000, last: 100 }),
    shield: Skill.create('shield', { cooldown: 90, last: 100 }),
    dead: Skill.create('dead', { cooldown: Infinity, last: 100 }),
  }

  return {
    graphics: new Graphics(),
    body: Bodies.circle(x, y, 35),
    inputs,
    id,
    color,
    looking: { x: 1, y: 0 },
    moving: { x: 0, y: 0 },
    hp: 100,
    skills,
  }
}

const update = (player) => {
  const { body, skills, looking, moving, inputs } = player
  const { jump, shield, dead } = skills
  const { keys } = inputs

  // if player is dead for good (after channeling effect we ask for removal)
  if (Skill.isCooldown(dead) && !Skill.isChanneling(dead)) return false

  if (keys.jump) Skill.trigger(jump)
  if (keys.shield) Skill.trigger(shield)

  let x = 0
  let y = 0
  if (keys.up) y -= 1
  if (keys.down) y = 1
  if (keys.right) x = 1
  if (keys.left) x = -1
  if (!keys.up && !keys.down) y = 0
  if (!keys.right && !keys.left) x = 0

  // looking to deplacement direction
  moving.x = x
  moving.y = y
  looking.x = x
  looking.y = y

  // jump skill block the moving one
  if (Skill.isChanneling(jump)) Body.setVelocity(body, Vector.mult(looking, 20))
  else Body.setVelocity(body, Vector.mult(moving, 10))

  // remove some hp when channeling shield
  if (Skill.isChanneling(shield)) player.hp -= (Date.now() - shield.since) / 100

  // check if player is not dead
  if (player.hp > 0) return true
  Skill.trigger(dead)

  return true
}

const draw = (player) => {
  const { skills, color, graphics, body } = player
  const { jump, shield, dead } = skills

  graphics.clear()

  let circleSize = 40
  if (Skill.isChanneling(dead)) circleSize = (dead.until - Date.now()) * 10
  if (Skill.isCooldown(jump)) circleSize = 35 // show cooldown

  if (!Skill.isChanneling(dead) && Skill.isChanneling(shield)) graphics.beginFill(color)

  graphics.lineStyle(2, color)
  if (Skill.isChanneling(jump)) graphics.lineStyle(2, 0xffffff)

  graphics.drawCircle(body.position.x, body.position.y, circleSize)
  graphics.endFill()
}

const collides = (entity, other, pair) => {
  // if other entity is not a player, it does nothing
  if (other.type !== 'player') return

  // entityA is not a slasher -> do nothing
  if (!Skill.isChanneling(entity.skills.jump) || Skill.isChanneling(other.skills.shield)) return

  // inactive so both bodies can pass through
  Pair.setActive(pair, false)

  // someone that sucessfully touch an other player get a jump that last longer
  // FIXME: don't mutate object
  entity.skills.jump.until += 100

  // other entity loose hp
  // FIXME: don't mutate object
  other.hp -= 20 // the player will be 'dead' in next frame (next update)
}

const clear = (player) => {
  const { graphics } = player

  graphics.clear()
}

export default {
  create,
  update,
  draw,
  collides,
  clear,
}

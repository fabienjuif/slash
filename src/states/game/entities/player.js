import { Graphics } from 'pixi.js'
import { Bodies, Body, Vector, Pair, World } from 'matter-js'
import Skill from '../skill'
import Entity from './entity'

const create = (id, { x, y, inputs, color = 0xff00ff }) => {
  const body = Bodies.circle(x, y, 35)
  const graphics = new Graphics()

  const skills = {
    jump: Skill.create('jump', { cooldown: 1000, last: 100 }),
    shield: Skill.create('shield', { cooldown: 90, last: 100 }),
    dead: Skill.create('dead', { cooldown: Infinity, last: 100 }),
  }

  const entity = Object.assign(
    Entity.create('player', { graphics, body, inputs }),
    {
      id,
      color,
      looking: { x: 1, y: 0 },
      moving: { x: 0, y: 0 },
      hp: 100,
      skills,
    },
  )

  if (inputs) {
    inputs.entity = entity
  }

  return entity
}

const update = (player) => {
  const { body, skills, looking, moving, inputs } = player
  const { jump, shield, dead } = skills
  const { keys } = inputs

  if (Skill.isCooldown(dead)) return

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
  if (Skill.isChanneling(jump)) {
    Body.setVelocity(body, Vector.mult(looking, 20))
  } else {
    Body.setVelocity(body, Vector.mult(moving, 10))
  }

  // remove some hp when channeling shield
  if (Skill.isChanneling(shield)) {
    player.hp -= (Date.now() - shield.since) / 100
    if (player.hp <= 0) Skill.trigger(dead)
  }
}

const draw = (player) => {
  const { skills, color, graphics, body } = player
  const { jump, shield, dead } = skills

  graphics.clear()

  if (Skill.isCooldown(dead) && !Skill.isChanneling(dead)) return

  let circleSize = 40
  if (Skill.isChanneling(dead)) circleSize = (dead.until - Date.now()) * 10
  if (Skill.isCooldown(jump)) circleSize = 35 // show cooldown

  if (!Skill.isChanneling(dead) && Skill.isChanneling(shield)) graphics.beginFill(color)

  graphics.lineStyle(2, color)
  if (Skill.isChanneling(jump)) graphics.lineStyle(2, 0xffffff)

  graphics.drawCircle(body.position.x, body.position.y, circleSize)
  graphics.endFill()
}

const collides = (physics, pair, entityA, entityB) => {
  // if other entity is not a player, it does nothing
  if (entityB.type !== 'player') return

  // entityA is the slasher
  if (Skill.isChanneling(entityA.skills.jump) && !Skill.isChanneling(entityB.skills.shield)) {
    // inactive so both bodies can pass through
    Pair.setActive(pair, false)

    // someone that sucessfully touch an other player get a jump that last longer
    // FIXME: don't mutate object
    entityA.skills.jump.until += 100
  }

  // entityB is the slasher
  if (Skill.isChanneling(entityB.skills.jump) && !Skill.isChanneling(entityA.skills.shield)) {
    entityA.hp -= 20 // FIXME: don't mutate object
    if (entityA.hp <= 0) {
      Skill.trigger(entityA.skills.dead)
      World.remove(physics.engine.world, entityA.body)
    }
  }
}

export default {
  create,
  update,
  draw,
  collides,
}

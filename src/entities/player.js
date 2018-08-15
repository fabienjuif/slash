import { Graphics } from 'pixi.js'
import { Bodies, Body, Vector } from 'matter-js'
import Entity from './entity'
import Skill from '../skills/skill'

const create = (id, { x, y, color = 0xff00ff }) => {
  const physics = Bodies.circle(x, y, 35)
  const graphics = new Graphics()

  const skills = {
    jump: Skill.create('jump', { cooldown: 1000, last: 100 }),
    shield: Skill.create('shield', { cooldown: 90, last: 100 }),
    move: Skill.create('move', { cooldown: 0, last: Infinity }),
    dead: Skill.create('dead', { cooldown: Infinity, last: 100 }),
  }

  return Object.assign(
    Entity.create('player', { graphics, physics }),
    {
      id,
      color,
      looking: { x: 1, y: 0 },
      moving: { x: 0, y: 0 },
      hp: 100,
      skills,
    },
  )
}

const update = player => {
  const { physics, skills, looking, moving } = player
  const { jump, shield, dead } = skills

  // jump skill block the moving one
  if (Skill.isChanneling(jump)) {
    Body.setVelocity(physics, Vector.mult(looking, 20))
  } else {
    Body.setVelocity(physics, Vector.mult(moving, 10))
  }

  // remove some hp when channeling shield
  if (Skill.isChanneling(shield)) {
    player.hp -= (Date.now() - shield.since) / 1000
    if (player.hp <= 0) Skill.trigger(dead)
  }
}

const draw = player => {
  const { skills, color, graphics, physics } = player
  const { jump, shield, dead } = skills

  graphics.clear()

  if (Skill.isCooldown(dead) && !Skill.isChanneling(dead)) return

  let circleSize = 40
  if (Skill.isChanneling(dead)) circleSize = (dead.until - Date.now()) * 10
  if (Skill.isCooldown(jump)) circleSize = 35 // show cooldown

  if (!Skill.isChanneling(dead) && Skill.isChanneling(shield)) graphics.beginFill(color)

  graphics.lineStyle(2, color)
  if (Skill.isChanneling(jump)) graphics.lineStyle(2, 0xffffff)

  graphics.drawCircle(physics.position.x, physics.position.y, circleSize)
  graphics.endFill()
}

export default {
  create,
  update,
  draw,
}

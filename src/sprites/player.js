import * as PIXI from 'pixi.js'
import { Bodies, Body, Vector } from 'matter-js'
import Skill from '../skills/skill'

const create = (id, { x, y, color = 0xff00ff }) => {
  const physics = Bodies.circle(x, y, 35)
  physics.label = id

  const graphics = new PIXI.Graphics()

  return {
    id,
    label: id,
    graphics,
    physics,
    color,
    looking: { x: 1, y: 0 },
    hp: 100,
    dead: Infinity,
    skills: {
      jump: Skill.create('jump', { cooldown: 1000, last: 100 }),
      shield: Skill.create('shield', { cooldown: 90, last: 100 }),
    },
  }
}

// TODO: make dead a channeling skill without cooldown
const isDead = player => isFinite(player.dead)

const update = player => {
  const { physics, skills, looking } = player
  const { jump } = skills

  if (Skill.isChanneling(jump)) {
    Body.setVelocity(physics, Vector.mult(looking, 40))
  }
}

const draw = player => {
  const { skills, dead, color, graphics, physics } = player
  const { jump, shield } = skills

  graphics.clear()

  if (dead + 100 <= Date.now()) return

  let circleSize = 40
  if (isDead(player)) circleSize = (Date.now() - dead) * 10
  if (Skill.isCooldown(jump)) circleSize = 35 // show cooldown

  if (!isDead(player) && Skill.isChanneling(shield)) graphics.beginFill(color)

  graphics.lineStyle(2, color)
  if (Skill.isChanneling(jump)) graphics.lineStyle(2, 0xffffff)

  graphics.drawCircle(physics.position.x, physics.position.y, circleSize)
  graphics.endFill()
}

export default {
  create,
  update,
  draw,
  isDead,
}

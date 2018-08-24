import { Container, Graphics } from 'pixi.js'
import { Bodies, Body, Vector, Pair } from 'matter-js'
import Sprites from '../../../sprites'
import Skill from '../skill'

const create = ({ id, x, y, inputs, color = 0xff00ff }) => {
  const skills = {
    jump: Skill.create('jump', { cooldown: 1000, last: 100 }),
    shield: Skill.create('shield', { cooldown: 90, last: 100 }),
    dead: Skill.create('dead', { cooldown: Infinity, last: 100 }),
    invulnerability: Skill.create('invulnerability', { cooldown: 0, last: 500 }),
  }

  const entity = {
    graphics: new Container(),
    body: Bodies.circle(x, y, 25),
    inputs,
    id,
    color,
    looking: { x: 1, y: 0 },
    moving: { x: 0, y: 0 },
    hp: 100,
    skills,
    invulnerabilityEffect: 0,
  }

  const sprites = Sprites.create()
  Promise
    .all(Sprites.load(sprites, '/textures.json', true))
    .then(() => {
      entity.animations = Sprites.asAnimatedSprites(sprites, ['adventurer-hurt', 'adventurer-attack1', 'adventurer-run', 'adventurer-smrslt', 'adventurer-idle'])
      entity.animations.forEach((animation) => {
        animation.animationSpeed = 0.2
        animation.scale = { x: 2, y: 2 }
        animation.position.x = -50
        animation.position.y = -45
        entity.graphics.addChild(animation)
      })
    })

  // show collision + IA or not
  const graphics = new Graphics()
  graphics.lineStyle(1, color)
  graphics.drawCircle(0, 0, 25)
  entity.graphics.addChild(graphics)

  // life bar
  entity.graphics.addChild(new Graphics()).name = 'lifebar'

  return entity
}

const update = (player) => {
  const { body, skills, looking, moving, inputs } = player
  const { jump, shield, dead } = skills
  const { keys } = inputs

  // if player is dead we remove it from physical engine
  if (Skill.isCooldown(dead)) return false

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
  moving.x = (y === 0 ? x : x * 0.62) // 0.62 = 1 - Math.tan(45deg)
  moving.y = (x === 0 ? y : y * 0.62)
  looking.x = (y === 0 ? x : x * 0.62)
  looking.y = (x === 0 ? y : y * 0.62)

  // jump skill block the moving one
  if (Skill.isChanneling(jump)) Body.setVelocity(body, Vector.mult(looking, 15))
  else Body.setVelocity(body, Vector.mult(moving, 5))

  // remove some hp when channeling shield
  if (Skill.isChanneling(shield)) player.hp -= (Date.now() - shield.since) / 100

  // check if player is not dead
  if (player.hp <= 0) Skill.trigger(dead)

  return true
}

const draw = (player) => {
  const { skills, animations, inputs, graphics, body, hp } = player
  const { jump, shield, dead, invulnerability } = skills
  const { up, down, left, right } = inputs.keys

  if (!animations) return true

  // if player is dead for good (after channeling effect we ask for removal)
  if (Skill.isCooldown(dead) && !Skill.isChanneling(dead)) {
    graphics.visible = false
    return false
  }

  animations.forEach((animation) => { animation.visible = false })

  let animationName = 'adventurer-idle'
  if (Skill.isChanneling(dead)) animationName = 'adventurer-hurt'
  else if (Skill.isChanneling(jump)) animationName = 'adventurer-attack1'
  else if (Skill.isChanneling(shield)) animationName = 'adventurer-smrslt' // TODO: how to print both shield + jump ?
  else if (up || down || left || right) animationName = 'adventurer-run'
  // TODO: if (Skill.isCooldown(jump)) circleSize = 35 // show cooldown
  // TODO: REMOVE ? if (!Skill.isChanneling(dead) && Skill.isChanneling(shield)) graphics.beginFill(color)

  const animation = animations.get(animationName)
  animation.visible = true

  // lifebar
  const lifebar = graphics.getChildByName('lifebar')
  lifebar.clear()
  lifebar.lineStyle(1, 0x734C4C, 1, 1)
  lifebar.beginFill(0xDE1414, 0.2)
  lifebar.drawRect(-20, -50, 40, 5)
  lifebar.endFill()
  lifebar.lineStyle(0)
  lifebar.beginFill(0xDE1414)
  lifebar.drawRect(-20, -50, 40 * (hp / 100), 5)
  lifebar.endFill()

  // show invulnerability
  if (Skill.isChanneling(invulnerability)) {
    player.invulnerabilityEffect += 1
    if (player.invulnerabilityEffect % 5 === 0) {
      graphics.alpha = graphics.alpha === 0.5 ? 0.1 : 0.5
    }
  } else {
    player.invulnerabilityEffect = 0
    graphics.alpha = 1
  }

  // move graphics
  graphics.position.x = body.position.x
  graphics.position.y = body.position.y

  return true
}

const collides = (entity, other, pair) => {
  // if other entity is not a player, it does nothing
  if (other.type !== 'player') return

  // does nothing if
  // - entity is not a slasher
  // - other channeling its shield
  // - other is invulnerable
  if (!Skill.isChanneling(entity.skills.jump)) return
  if (Skill.isChanneling(other.skills.shield)) return
  if (Skill.isChanneling(other.skills.invulnerability)) return

  // inactive so both bodies can pass through
  Pair.setActive(pair, false)

  // someone that sucessfully touch an other player get its jump cooldown reset
  // FIXME: don't mutate object
  entity.skills.jump.next = Date.now()

  // other entity loose hp
  // FIXME: don't mutate object
  other.hp -= 50

  // other entity becomes invulnerable
  Skill.trigger(other.skills.invulnerability)
}

export default {
  create,
  update,
  draw,
  collides,
}

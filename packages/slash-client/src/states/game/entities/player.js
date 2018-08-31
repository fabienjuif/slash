import { Container, Graphics, Text } from 'pixi.js'
import { Bodies, Body, Vector, Pair } from 'matter-js'
import Sprites from '../../../sprites'
import Timer from '../../../timer'

const create = ({ id, position, inputs, color = 0xff00ff }) => {
  const timers = {
    jump: Timer.create('jump', { cooldown: 3000, last: 100 }),
    shield: Timer.create('shield', { cooldown: 90, last: 100 }),
    dead: Timer.create('dead', { cooldown: Infinity, last: 100 }),
    invulnerability: Timer.create('invulnerability', { cooldown: 0, last: 500 }),
  }

  const entity = {
    graphics: new Container(),
    body: Bodies.circle(position.x, position.y, 25),
    inputs,
    id,
    color,
    looking: { x: 1, y: 0 },
    moving: { x: 0, y: 0 },
    hp: 100,
    timers,
    kills: 0,
    invulnerabilityEffect: 0,
    animations: new Map(),
    lastAnimationName: 'adventurer-idle',
  }

  const sprites = Sprites.create()
  Promise
    .all(Sprites.load(sprites, '/textures.json', true))
    .then(() => {
      entity.animations = Sprites.asAnimatedSprites(sprites, ['adventurer-hurt', 'adventurer-attack1', 'adventurer-run', 'adventurer-smrslt', 'adventurer-idle'])
      entity.animations.forEach((animation, name) => {
        entity.graphics.addChild(animation)

        // default values
        animation.animationSpeed = 0.2
        animation.scale = { x: 2, y: 2 }
        animation.position.x = -50
        animation.position.y = -45

        // override some values
        if (name === 'adventurer-attack1') {
          animation.animationSpeed = 1
        }

        // start the first animation
        if (entity.lastAnimationName === name) {
          animation.visible = true
          animation.gotoAndPlay(0)
        }
      })
    })

  Promise
    .all(Sprites.load(sprites, '/static-textures.json', false))
    .then(() => {
      // TODO: make it a sub entity
      const cross = entity.graphics.addChild(Sprites.asTilingSprites(sprites, 'cross'))
      const killedNumber = entity.graphics.addChild(new Text('0', { fill: 'black', fontFamily: 'Courier New', fontSize: 15 }))
      killedNumber.name = 'killedNumber'
      cross.scale = { x: 0.3, y: 0.3 }
      cross.position.x = 25
      cross.position.y = -62
      killedNumber.position.x = 35
      killedNumber.position.y = -55
    })

  // show collision + IA or not
  const graphics = new Graphics()
  graphics.lineStyle(1, color)
  graphics.drawCircle(0, 0, 25)
  entity.graphics.addChild(graphics)

  // life bar
  // TODO: make it a sub entity
  entity.graphics.addChild(new Graphics()).name = 'lifebar'

  return entity
}

const update = (entity, delta) => {
  const { body, timers, looking, moving, inputs } = entity
  const { jump, shield, dead } = timers
  const { keys } = inputs

  // if player is dead we remove it from physical engine
  if (Timer.isCooldown(dead)) return false

  if (keys.jump) Timer.trigger(jump)
  if (keys.shield) Timer.trigger(shield)

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

  // move using `setPosition` and scale it with time since `setVelocity` doesn't scale with time (yet ?)
  let velocity = 0.5
  let where = moving
  if (Timer.isChanneling(jump)) {
    velocity = 1.5
    where = looking
  }
  Body.setPosition(body, Vector.add(body.position, Vector.mult(where, velocity * delta)))

  // remove some hp when channeling shield
  if (Timer.isChanneling(shield)) entity.hp -= (Date.now() - shield.since) / 100

  // check if player is not dead
  if (entity.hp <= 0) {
    if (entity.lastTouchedBy) entity.lastTouchedBy.kills += 1
    Timer.trigger(dead)
  }

  return true
}

const draw = (entity) => {
  const { looking, timers, animations, inputs, graphics, body, hp, lastAnimationName } = entity
  const { jump, shield, dead, invulnerability } = timers
  const { up, down, left, right } = inputs.keys

  // the game is not ready
  if (animations.size === 0) return true

  // if player is dead for good (after channeling effect we ask for removal)
  if (Timer.isCooldown(dead) && !Timer.isChanneling(dead)) {
    graphics.visible = false
    return false
  }

  let animationName = 'adventurer-idle'
  if (Timer.isChanneling(dead)) animationName = 'adventurer-hurt'
  else if (Timer.isChanneling(jump)) animationName = 'adventurer-attack1'
  else if (Timer.isChanneling(shield)) animationName = 'adventurer-smrslt' // TODO: how to print both shield + jump ?
  else if (up || down || left || right) animationName = 'adventurer-run'
  // TODO: if (Timer.isCooldown(jump)) circleSize = 35 // show cooldown
  // TODO: REMOVE ? if (!Timer.isChanneling(dead) && Timer.isChanneling(shield)) graphics.beginFill(color)

  const animation = animations.get(animationName)
  const lastAnimation = animations.get(lastAnimationName)

  // when we change animation -> start the new one
  if (animationName !== lastAnimationName) {
    entity.lastAnimationName = animationName
    lastAnimation.visible = false

    animation.gotoAndPlay(0)
    animation.visible = true
  }

  // scale to the looking position
  if (looking.x < 0) {
    animation.position.x = 50
    animation.scale.x = -2
  } else {
    animation.position.x = -50
    animation.scale.x = 2
  }

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
  if (Timer.isChanneling(invulnerability)) {
    entity.invulnerabilityEffect += 1
    if (entity.invulnerabilityEffect % 5 === 0) {
      graphics.alpha = graphics.alpha === 0.5 ? 0.1 : 0.5
    }
  } else {
    entity.invulnerabilityEffect = 0
    graphics.alpha = 1
  }

  // kill number
  graphics.getChildByName('killedNumber').text = entity.kills.toString()

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

  if (!Timer.isChanneling(entity.timers.jump)) return
  if (Timer.isChanneling(other.timers.shield)) return

  // inactive so both bodies can pass through
  Pair.setActive(pair, false)

  // invulnerability can pass through, but we don't do more
  if (Timer.isChanneling(other.timers.invulnerability)) return

  // other entity loose hp
  // FIXME: don't mutate object
  other.hp -= 50

  // other entity becomes invulnerable
  Timer.trigger(other.timers.invulnerability)

  // register as the player who last touch the other
  other.lastTouchedBy = entity

  // someone that sucessfully touch an other player
  // - gets its jump cooldown reset
  //   > this is not reset to Date.now() because the player certainly can't release the timer in 0ms
  // - steal some life
  entity.timers.jump.next = Date.now() + 200
  entity.hp += 20
  if (entity.hp > 100) entity.hp = 100
}

export default {
  create,
  update,
  draw,
  collides,
}

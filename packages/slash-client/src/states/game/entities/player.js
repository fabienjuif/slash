import { Container, Graphics, Text } from 'pixi.js'
import { Timer } from 'slash-utils'
import Sprites from '../../../sprites'

const create = (player) => {
  const entity = Object.assign(
    player,
    {
      color: 0xff00ff,
      graphics: new Container(),
      animations: new Map(),
      lastAnimationName: 'adventurer-idle',
    },
  )

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
  graphics.lineStyle(1, entity.color)
  graphics.drawCircle(0, 0, 25)
  entity.graphics.addChild(graphics)

  // life bar
  // TODO: make it a sub entity
  entity.graphics.addChild(new Graphics()).name = 'lifebar'

  return entity
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
  // TODO: there is a condition because sprite can be not loaded
  // TODO: with the other TODO above making it a sub entity maybe it would resolve both
  if (graphics.getChildByName('killedNumber')) {
    graphics.getChildByName('killedNumber').text = entity.kills.toString()
  }

  // move graphics
  graphics.position.x = body.position.x
  graphics.position.y = body.position.y

  return true
}

export default {
  create,
  draw,
}

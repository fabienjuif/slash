import { Bodies, Body, Vector, Pair } from 'matter-js'
import { Timer } from 'slash-utils'

const create = ({ id, position, inputs, isAI = false }) => ({
  type: 'player',
  isAI,
  inputs,
  id,
  body: Bodies.circle(position.x, position.y, 25),
  hp: 100,
  kills: 0,
  invulnerabilityEffect: 0,
  moving: {
    x: 0,
    y: 0,
  },
  looking: {
    x: 1,
    y: 0,
  },
  timers: {
    jump: Timer.create('jump', { cooldown: 3000, last: 100 }),
    shield: Timer.create('shield', { cooldown: 90, last: 100 }),
    dead: Timer.create('dead', { cooldown: Infinity, last: 100 }),
    invulnerability: Timer.create('invulnerability', { cooldown: 0, last: 500 }),
  },
})

const isDead = entity => Timer.isCooldown(entity.timers.dead)

const update = (entity, delta) => {
  const { body, timers, looking, moving, inputs, serverPlayer } = entity // TODO: remove serverPlayer
  const { jump, shield, dead } = timers
  const { keys } = (serverPlayer || inputs)

  // if player is dead we remove it from physical engine
  if (isDead(entity)) return

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

const getView = player => Object.assign(
  {},
  player,
  {
    inputs: { // TODO:
      keys: {},
    },
    position: player.body.position,
    client: undefined,
    body: undefined,
  },
)

export default {
  create,
  update,
  collides,
  isDead,
  getView,
}

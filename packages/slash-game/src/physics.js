import { Engine, World, Body, Events } from 'matter-js'
import Player from './entities/player'

const create = () => {
  const engine = Engine.create()
  const { world } = engine
  world.gravity = { x: 0, y: 0 }
  // engine.enableSleeping = true TODO

  const physics = {
    engine,
    world,
    fakedFrequence: (1000 / 60), // this is what we inject into physical engine (matter)
    realFrequence: (1000 / 120), // but in real life we target this frequence, here it means we run twice the engine per frame
    tickToCatchUp: 0, // number of milliseconds to catch up in cases where delta / frequence is not a round number
  }

  // register collisions
  Events.on(engine, 'collisionActive', (event) => {
    const { pairs } = event

    for (let i = 0; i < pairs.length; i += 1) {
      const { bodyA, bodyB } = pairs[i]

      const collides = [
        [bodyA.entity, bodyB.entity, pairs[i]],
        [bodyB.entity, bodyA.entity, pairs[i]], // both side
      ]

      for (let j = 0; j < collides.length; j += 1) {
        const collide = collides[j]
        const [entity] = collide

        if (entity.type === 'player') {
          Player.collides(...collide)
        }
      }
    }
  })

  return physics
}

const add = (physics, entities) => {
  World.add(
    physics.world,
    [].concat(entities).map((entity) => {
      const { body } = entity

      // this is to retrieve entity from body
      // it is useful in `collides` for example
      body.entity = entity

      return body
    }),
  )
}

const update = (physics, delta) => {
  const { engine, world, realFrequence, fakedFrequence } = physics
  const { bodies } = world

  // engine
  // - run the engine several times, so we have the feeling the game is fast
  // - also, this avoid collision detecting issue since CCD is not implemented yet in matter-js
  const ticks = (delta / realFrequence)
  let ticksInt = Math.floor(ticks)
  physics.tickToCatchUp += (ticks - ticksInt)
  if (physics.tickToCatchUp >= 1) {
    physics.tickToCatchUp -= 1
    ticksInt += 1
  }
  for (let i = 0; i < ticksInt; i += 1) {
    // entities
    // FIXME: look at friction, etc on bodies to avoid them to turn instead of doing this
    bodies.forEach(body => Body.setAngle(body, 0))

    // matter-js
    Engine.update(engine, fakedFrequence) // fixed frequence
  }
}

const remove = (physics, entities) => {
  entities.forEach(({ body }) => World.remove(physics.world, body))
}

export default {
  create,
  add,
  update,
  remove,
}

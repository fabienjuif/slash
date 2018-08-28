import { Engine, World, Body, Events } from 'matter-js'
import Entity from './entities/entity'

const create = () => {
  const engine = Engine.create()
  engine.world.gravity = { x: 0, y: 0 }
  // engine.enableSleeping = true

  const physics = {
    engine,
    world: engine.world,
    fakedFrequence: (1000 / 60), // this is what we inject into physical engine (matter)
    realFrequence: (1000 / 120), // but in real life we target this frequence, here it means we run twice the engine per frame
    tickToCatchUp: 0, // number of milliseconds to catch up in cases where delta / frequence is not a round number
  }

  // register collisions
  Events.on(engine, 'collisionActive', (event) => {
    const { pairs } = event

    for (let i = 0; i < pairs.length; i += 1) {
      const { bodyA, bodyB } = pairs[i]

      Entity.collides(bodyA.entity, bodyB.entity, pairs[i])
      Entity.collides(bodyB.entity, bodyA.entity, pairs[i])
    }
  })

  return physics
}

const add = (physics, entities) => {
  World.add(physics.world, [].concat(entities).map(entity => entity.body))
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
    // - remove them is not alive anymore
    bodies.forEach((body) => {
      const { entity } = body

      Body.setAngle(body, 0) // FIXME: look at friction, etc on bodies to avoid them to turn instead of doing this

      if (!Entity.update(entity, realFrequence)) World.remove(engine.world, body)
    })

    // matter-js
    Engine.update(engine, fakedFrequence) // fixed frequence
  }
}

export default {
  create,
  add,
  update,
}

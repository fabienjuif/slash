import { Engine, World, Body, Events } from 'matter-js'
import Entity from './entities/entity'

const create = () => {
  const engine = Engine.create()
  engine.world.gravity = { x: 0, y: 0 }
  // engine.enableSleeping = true

  const physics = {
    engine,
    world: engine.world,
    perLoop: 2,
  }

  // register collisions
  Events.on(engine, 'collisionStart', (event) => {
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
  const { perLoop, engine, world } = physics
  const { bodies } = world

  // entities
  // - remove them is not alive anymore
  bodies.forEach((body) => {
    const { entity } = body

    Body.setAngle(body, 0) // FIXME: look at friction, etc on bodies to avoid them to turn instead of doing this

    if (!Entity.update(entity)) World.remove(engine.world, body)
  })

  // engine
  // - run the engine several times, so we have the feeling the game is fast
  // - also, this avoid collision detecting issue since CCD is not implemented yet in matter-js
  let lastLoop = Date.now()
  for (let i = 0; i < perLoop; i += 1) {
    Engine.update(engine, i === 0 ? delta : (Date.now() - lastLoop))
    lastLoop = Date.now()
  }
}

export default {
  create,
  add,
  update,
}

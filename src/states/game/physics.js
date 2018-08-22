import { Engine, World, Body, Events } from 'matter-js'
import Entity from './entities/entity'

const create = () => {
  const engine = Engine.create()
  engine.world.gravity = { x: 0, y: 0 }
  // engine.enableSleeping = true

  const physics = {
    engine,
    world: engine.world,
    entities: [],
    perLoop: 2,
  }

  // register collisions
  Events.on(engine, 'collisionStart', (event) => {
    var pairs = event.pairs

    for (var i = 0; i < pairs.length; i++) {
      const { bodyA, bodyB } = pairs[i]

      Entity.collides(bodyA.entity, bodyB.entity, pairs[i])
      Entity.collides(bodyB.entity, bodyA.entity, pairs[i])
    }
  })

  return physics
}

const add = (physics, entities) => {
  physics.entities = physics.entities.concat(entities)
  World.add(physics.world, [].concat(entities).map(entity => entity.body))
}

const update = (physics, delta) => {
  // entities
  for (let i = 0; i < physics.entities.length; i+= 1) {
    const entity = physics.entities[i]

    Body.setAngle(entity.body, 0) // FIXME: look at friction, etc on bodies to avoid them to turn instead of doing this
    Entity.update(entity)
  }

  // engine
  // - run the engine several times, so we have the feeling the game is fast
  // - also, this avoid collision detecting issue since CCD is not implemented yet in matter-js
  let lastLoop = Date.now()
  for (let i = 0; i < physics.perLoop; ++i) {
    Engine.update(physics.engine, i === 0 ? delta : (Date.now() - lastLoop))
    lastLoop = Date.now()
  }
}

export default {
  create,
  add,
  update,
}

import Player from './player'

const create = (type, { graphics, body } = {}) => {
  const entity = {
    type,
    body,
    graphics,
  }

  if (body) body.entity = entity

  return entity
}

const update = (entity) => {
  if (entity.type === 'player') Player.update(entity)
  // we don't need to update wall physics
}

const collides = (physics, pair, entityA, entityB) => {
  if (entityA.type === 'player') Player.collides(physics, pair, entityA, entityB)
  // we don't need to handle wall collision
}

export default {
  create,
  update,
  collides: (physics, pair, entityA, entityB) => {
    collides(physics, pair, entityA, entityB)
    collides(physics, pair, entityB, entityA)
  },
}

import Player from './player'
import Wall from './wall'

const create = (type, { graphics, body, inputs } = {}) => {
  const entity = {
    type,
    body,
    graphics,
    inputs,
  }

  if (body) body.entity = entity

  return entity
}

const update = (entity) => {
  // update sub entities
  if (entity.type === 'player') Player.update(entity)
  // we don't need to update wall physics
}

const collides = (physics, pair, entityA, entityB) => {
  if (entityA.type === 'player') Player.collides(physics, pair, entityA, entityB)
  // we don't need to handle wall collision
}

const draw = (entity) => {
  if (entity.type === 'player') Player.draw(entity)
  else if (entity.type === 'wall') Wall.draw(entity)
}

export default {
  create,
  update,
  draw,
  collides: (physics, pair, entityA, entityB) => {
    collides(physics, pair, entityA, entityB)
    collides(physics, pair, entityB, entityA)
  },
}

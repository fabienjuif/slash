import Player from './player'

const create = (type, { graphics, physics } = {}) => {
  const entity = {
    type,
    physics,
    graphics,
  }

  if (physics) physics.entity = entity

  return entity
}

const update = (entity) => {
  if (entity.type === 'player') Player.update(entity)
  // we don't need to update wall physics
}

export default {
  create,
  update,
}

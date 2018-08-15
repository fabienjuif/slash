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

export default {
  create,
  update,
}

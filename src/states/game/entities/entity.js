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

const route = fnName => (entity, ...args) => {
  if (entity.type === 'player') return Player[fnName](entity, ...args)
  if (entity.type === 'wall') return Wall[fnName](entity, ...args)
}

export default {
  create,
  update: route('update'),
  draw: route('draw'),
  clear: route('clear'),
  collides: route('collides'),
}

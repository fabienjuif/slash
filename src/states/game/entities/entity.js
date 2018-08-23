import Player from './player'
import Wall from './wall'

const create = (type, options) => {
  let entity
  if (type === 'player') entity = Player.create(options)
  if (type === 'wall') entity = Wall.create(options)

  if (!entity) return undefined

  // this is for matter-js (collides)
  if (entity.body) entity.body.entity = entity

  return Object.assign(
    entity,
    {
      type,
    },
  )
}

const route = fnName => (entity, ...args) => {
  if (entity.type === 'player') return Player[fnName](entity, ...args)
  if (entity.type === 'wall') return Wall[fnName](entity, ...args)
  return undefined
}

export default {
  create,
  update: route('update'),
  draw: route('draw'),
  clear: route('clear'),
  collides: route('collides'),
}

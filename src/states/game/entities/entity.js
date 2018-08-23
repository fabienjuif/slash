import Player from './player'
import Wall from './wall'
import TouchUI from './touchUI'
import SkillsCooldown from './skillsCooldown'

const create = (type, options) => {
  let entity
  if (type === 'player') entity = Player.create(options)
  if (type === 'wall') entity = Wall.create(options)
  if (type === 'touchUI') entity = TouchUI.create(options)
  if (type === 'skillsCooldown') entity = SkillsCooldown.create(options)

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
  if (entity.type === 'touchUI') return TouchUI[fnName](entity, ...args)
  if (entity.type === 'skillsCooldown') return SkillsCooldown[fnName](entity, ...args)

  return undefined
}

export default {
  create,
  update: route('update'),
  draw: route('draw'),
  clear: route('clear'),
  collides: route('collides'),
}

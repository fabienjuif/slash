import UI from './ui'

// TODO: merge it with other file that have same name
const create = (type, options) => {
  let entity
  if (type === 'ui') entity = UI.create(options)

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
  if (entity.type === 'ui') return UI[fnName](entity, ...args)

  return undefined
}

export default {
  create,
  update: route('update'),
  draw: route('draw'),
  clear: route('clear'),
  collides: route('collides'),
}

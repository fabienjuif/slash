const create = factories => (type, options) => {
  const factory = factories[type]

  let entity
  if (factory) entity = factory.create(options)

  if (!entity) return undefined

  const finalEntity = Object.assign(
    entity,
    {
      type,
    },
  )

  // this is for matter-js (collides)
  if (finalEntity.body) finalEntity.body.entity = finalEntity

  return finalEntity
}

const route = (factories, defaultReturnValue) => fnName => (entity, ...args) => {
  const factory = factories[entity.type]
  const fn = factory && factory[fnName]

  if (fn) return fn(entity, ...args)

  return defaultReturnValue
}

const clear = factories => (entity, ...args) => {
  if (entity.graphics) entity.graphics.destroy({ children: true })

  route(factories)('clear')(entity, ...args)
}

export default factories => ({
  create: create(factories),
  clear: clear(factories),
  update: route(factories, true)('update'),
  draw: route(factories, true)('draw'),
  collides: route(factories)('collides'),
})

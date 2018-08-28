import Renderer from '../../renderer/renderer'
import Server from '../../server'
import Entity from './entities/entity'

const create = () => ({
  entities: [],
  staticEntities: [],
  server: undefined,
})

const prepare = (state) => {
  const { renderer, staticEntities } = state

  state.server = Server.create()
  staticEntities.push(Entity.create('ui', state.server))

  Renderer.addToStage(renderer, staticEntities)
}

const update = (state) => {
  const { server, staticEntities } = state

  // TODO: print a message 'connecting...'
  if (!server.game) return 'lobby'

  if (server.game.started) return 'game'

  state.staticEntities = staticEntities.filter(Entity.draw)

  return 'lobby'
}

const clear = (state) => {
  state.entities.forEach(Entity.clear)
  state.staticEntities.forEach(Entity.clear)
  state.entities = []
  state.staticEntities = []
}

export default {
  create,
  prepare,
  clear,
  update,
}

import Renderer from '../../renderer/renderer'
import Server from '../../server'
import Inputs from '../../inputs/inputs'
import Entity from './entities/entity'

const bindings = {
  enter: {
    keyCode: 13,
    zone: {
      x: 95,
      y: 340,
      width: 300,
      height: 25,
    },
  },
}

const create = () => ({
  entities: [],
  staticEntities: [],
  server: undefined,
  inputs: undefined,
})

const prepare = (state) => {
  const { renderer, staticEntities } = state

  state.server = Server.create()
  state.inputs = Inputs.create(bindings)
  staticEntities.push(Entity.create('ui', state.server))

  Renderer.addToStage(renderer, staticEntities)
}

const update = (state) => {
  const { server, staticEntities } = state

  // TODO: print a message 'connecting...'
  if (!server.game) return 'lobby'
  if (server.game.started) return 'game'

  state.inputs = Inputs.update(state.inputs)
  if (state.inputs.keys.enter) Server.emit(server, 'ready>set')

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

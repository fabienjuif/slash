import { random } from 'slash-utils'
import { getWalls } from 'slash-generators'
import Physics from './physics'
import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'
import Server from '../../server'
import Entity from './entities/entity'
import AI from './ai/classic'

const add = (state, entities) => {
  const { physics } = state

  Physics.add(physics, entities)

  state.entities = state.entities.concat(entities)

  return entities
}

const create = ({ worldSize }) => ({
  ai: [],
  worldSize,
  entities: [],
  staticEntities: [],
})

const prepare = (state, previous) => {
  const { worldSize, isTouched, server } = state

  // create physic engine
  state.physics = Physics.create()

  // grass
  state.entities.push(Entity.create('grass', { width: worldSize.x, height: worldSize.y }))

  // walls
  add(state, ((server && server.game.walls) || getWalls(worldSize)).map(wall => Entity.create('wall', wall)))

  // player
  // - inputs
  // - entity
  state.inputs = Inputs.create({
    jump: {
      keyCode: 67, // c
      zone: {
        x: window.innerWidth - 150,
        y: window.innerHeight - 85,
        width: 80,
        height: 80,
      },
    },
    shield: {
      keyCode: 86, // v
      zone: {
        x: window.innerWidth - 85,
        y: window.innerHeight - 140,
        width: 80,
        height: 80,
      },
    },
    left: {
      keyCode: 37, // left arrow
      zone: {
        x: 5,
        y: window.innerHeight - 200,
        width: 80,
        height: 195,
      },
    },
    right: {
      keyCode: 39, // right arrow
      zone: {
        x: 125,
        y: window.innerHeight - 200,
        width: 80,
        height: 195,
      },
    },
    up: {
      keyCode: 38, // top arrow
      zone: {
        x: 5,
        y: window.innerHeight - 200,
        width: 195,
        height: 80,
      },
    },
    down: {
      keyCode: 40, // bottom arrow
      zone: {
        x: 5,
        y: window.innerHeight - 85,
        width: 195,
        height: 80,
      },
    },
  })

  // internet version
  if (server) {
    state.player = add(state, Entity.create(
      'player',
      {
        id: 'player',
        world: state.physics.world,
        inputs: state.inputs,
        position: server.player.position,
        server,
      },
    ))

    // add other players
    add(state, server.players.map(player => Entity.create(
      'player',
      {
        id: player.name,
        inputs: player,
        position: player.position,
        server,
      },
    )))
  } else {
    state.player = add(state, Entity.create('player', { id: 'player', world: state.physics.world, inputs: state.inputs, position: { x: worldSize.x / 2, y: worldSize.y / 2 } }))

    // AI version
    state.ai = Array.from({ length: previous.aiCount }).map(() => AI.create(state))
    const aiEntities = add(state, state.ai.map(inputs => Entity.create(
      'player',
      {
        id: 'ai',
        inputs,
        position: { x: random(100, worldSize.x - 100), y: random(100, worldSize.y - 100) },
        color: 0xfffff00,
      },
    )))
    aiEntities.forEach((entity) => {
      entity.inputs.entity = entity
    })
  }

  // UI
  if (isTouched) state.staticEntities.push(Entity.create('touchUI', { inputs: state.inputs }))
  state.staticEntities.push(Entity.create('ui', { player: state.player }))

  // add entities to renderer
  const { player, renderer, staticEntities, entities } = state
  Renderer.addToStage(renderer, { graphics: renderer.viewport })
  Renderer.addToStage(renderer, staticEntities)
  Renderer.addToViewport(renderer, entities)

  // follow the player (camera)
  Renderer.follow(renderer, player)
}

const update = (state, delta) => {
  const { physics, player, staticEntities, ai, entities, server } = state

  // update player inputs
  state.inputs = Inputs.update(state.inputs)

  // update server
  if (server) {
    Server.update(server, player)
    if (
      player.hp <= 0 ||
      entities.filter(entity => entity.type === 'player').length < 2
    ) return 'gameover'
  }

  // update ai
  ai.forEach(AI.update)

  // update physics (and its entities)
  Physics.update(physics, delta)

  // draw static entities (TODO: clear entities that are removed)
  state.staticEntities = staticEntities.filter(Entity.draw)

  // draw entities (TODO: clear entities that are removed)
  state.entities = entities.filter(Entity.draw)

  // next server tick
  if (server) Server.synchronize(server)

  // is it gameover ?
  if (
    !server && (
      player.hp <= 0 ||
      entities.filter(entity => entity.type === 'player').length < 2
    )
  ) return 'gameover'

  return 'game'
}

const clear = (state) => {
  Inputs.clear(state.inputs)
  state.entities.forEach(Entity.clear)
  state.staticEntities.forEach(Entity.clear)
  state.entities = []
  state.staticEntities = []
  if (state.server) Server.clear(state.server)
}

export default {
  create,
  prepare,
  update,
  clear,
}

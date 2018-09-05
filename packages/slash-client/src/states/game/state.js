import Game from 'slash-game'
import { random } from 'slash-utils'
import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'
import Entity from './entities/entity'

const create = ({ worldSize }) => ({
  game: undefined,
  player: undefined,
  worldSize,
  entities: [],
  staticEntities: [],
})

const prepare = (state, previous) => {
  const { worldSize, isTouched } = state

  state.game = Game.create({ width: worldSize.x, height: worldSize.y })

  // grass
  state.entities.push(Entity.create('grass', { width: worldSize.x, height: worldSize.y }))

  // walls
  state.entities.push(...state.game.walls.map(wall => Entity.create('wall', wall))) // TODO: better handle this

  // player
  // - inputs
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
  state.player = Game.addPlayer(
    state.game,
    {
      id: 'player',
      position: {
        x: 300,
        y: 300,
      },
      inputs: state.inputs,
    },
  )

  // AIs
  Array.from({ length: previous.aiCount }).forEach((value, index) => Game.addAI(
    state.game,
    {
      id: `ai-classic-${index}`,
      position: {
        x: random(100, worldSize.x - 100),
        y: random(100, worldSize.y - 100),
      },
    },
  ))

  // add players entities
  state.entities.push(...state.game.players.map(player => Entity.create('player', player))) // TODO: better handle this

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
  const { staticEntities, entities } = state

  // update player inputs
  // TODO: should go to the server
  // then come back will moving effects
  state.inputs = Inputs.update(state.inputs)

  // update game engine
  const gameState = Game.update(state.game, delta)
  if (gameState === 'gameover') return 'gameover'

  // draw static entities (TODO: clear entities that are removed)
  state.staticEntities = staticEntities.filter(Entity.draw)

  // draw entities (TODO: clear entities that are removed)
  state.entities = entities.filter(Entity.draw)

  // is it gameover ?
  return 'game'
}

const clear = (state) => {
  Inputs.clear(state.inputs)
  state.entities.forEach(Entity.clear)
  state.staticEntities.forEach(Entity.clear)
  state.entities = []
  state.staticEntities = []
}

export default {
  create,
  prepare,
  update,
  clear,
}

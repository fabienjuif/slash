import { Body } from 'matter-js'
import getWalls from './generators/walls'
import Physics from './physics'
import Player from './entities/player'
import Wall from './entities/wall'
import AI from './ai/classic'

const DELTA_TARGET = (1000 / 60) // 60 FPS

const addPlayer = (game, player) => {
  const entity = Player.create(player)

  Player.setPosition(
    entity,
    {
      x: 200 + (game.players.length * 500),
      y: 200 + (game.players.length * 500),
    },
  )

  Physics.add(game.physics, entity)
  game.players.push(entity)

  return entity
}

/**
 *
 * @param {*} game
 * @param {Object} player the AI player to add
 * @param {Any} player.id its id
 * @param {Object} player.position its position (x/y)
 */
const addAI = (game, player) => {
  const ai = AI.create(game)
  const entity = addPlayer(
    game,
    Object.assign(
      player,
      {
        inputs: ai,
      },
    ),
  )

  ai.entity = entity
  game.ais.push(ai)
}

const generateRing = (game) => {
  // set the ring proportionnaly to the player count
  const width = ((game.players.length - 1) * 500) + 400
  const height = ((game.players.length - 1) * 500) + 400

  game.width = width
  game.height = height

  // remove old walls
  Physics.remove(game.physics, game.walls)

  // generate new walls
  game.walls = getWalls({ width, height }).map(Wall.create)
  Physics.add(game.physics, game.walls)
}

const create = ({ width, height, walls, players = [] }) => {
  const game = {
    width,
    height,
    start: undefined,
    started: false,
    ended: false,
    physics: Physics.create(),
    walls: [],
    players: [],
    ais: [],
  }

  // TODO: remove `getWall` generator
  game.walls = (walls || getWalls({ width, height })).map(Wall.create)
  Physics.add(game.physics, game.walls)

  // players and AI
  game.players = players.map((player) => {
    if (player.isAI) return addAI(game, player)
    return addPlayer(game, player)
  })

  return game
}

const update = (game, delta) => {
  // update AIs
  game.ais.forEach(AI.update)

  // update physics and its entities
  game.players.forEach(player => Player.update(player, delta))
  Physics.update(game.physics, delta)

  // remove dead players
  const deadPlayers = game.players.filter(Player.isDead)
  Physics.remove(game.physics, deadPlayers)

  // is it gameover ?
  if (game.players.length - deadPlayers.length <= 1) return 'gameover'

  return 'game'
}

const synchronize = (current, next, delta) => {
  // game
  current.started = next.started
  current.start = next.start

  // players
  current.players.forEach((player, index) => {
    // TODO: call Player.synchronize ?
    const nextPlayer = next.players[index]

    Object.assign(player.inputs.keys, nextPlayer.inputs.keys)
    Object.assign(player.timers, nextPlayer.timers)
    Object.assign(player.moving, nextPlayer.moving)
    Object.assign(player.looking, nextPlayer.looking)
    player.kills = nextPlayer.kills
    player.hp = nextPlayer.hp

    const newPosition = {
      x: player.body.position.x + ((nextPlayer.position.x - player.body.position.x) * delta / (5 * DELTA_TARGET)),
      y: player.body.position.y + ((nextPlayer.position.y - player.body.position.y) * delta / (5 * DELTA_TARGET)),
    }
    Body.setPosition(player.body, newPosition)
  })

  if (next.ended) return 'gameover'
  return 'game'
}

const getView = game => ({
  started: game.started,
  start: game.start,
  ended: game.ended,
  players: game.players.map(Player.getView),
})

const getInitView = game => Object.assign(
  {},
  game,
  getView(game),
  {
    interval: undefined,
    physics: undefined,
    ais: undefined,
    walls: game.walls.map(Wall.getView),
  },
)

export default {
  create,
  update,
  addPlayer,
  addAI,
  getView,
  getInitView,
  synchronize,
  generateRing,
}

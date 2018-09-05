import { remove } from 'lodash-es'
import { Body } from 'matter-js'
import { getWalls } from 'slash-generators'
import Physics from './physics'
import Player from './entities/player'
import Wall from './entities/wall'
import AI from './ai/classic'

const addPlayer = (game, player) => {
  const entity = Player.create(player)

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

const create = ({ width, height, walls, players = [], start = Date.now() }) => {
  const game = {
    width,
    height,
    start,
    physics: Physics.create(),
    walls: [],
    players: [],
    ais: [],
  }

  // TODO: remove `getWall` generator
  // TODO: at leat change the signature
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
  Physics.remove(game.physics, remove(game.players, Player.isDead))

  // is it gameover ?
  if (game.players.length <= 1) return 'gameover'

  return 'game'
}

const synchronize = (current, next/* , delta TODO: use it for interpolation */) => {
  // game
  current.ended = next.ended
  current.started = next.started

  // players
  current.players.forEach((player, index) => {
    // TODO: call Player.synchronize ?
    const nextPlayer = next.players[index]

    Object.assign(player.inputs.keys, nextPlayer.inputs.keys)
    Object.assign(player.timers, nextPlayer.timers)
    Object.assign(player.moving, nextPlayer.moving)
    Object.assign(player.looking, nextPlayer.looking)
    player.hp = nextPlayer.hp

    Body.setPosition(player.body, nextPlayer.position)

    // TODO: interpolation
    // TODO: process distance to catch it instead of hardcoded 1
    // if (player.body.position.x < (nextPlayer.position.x - 10)) player.interpolation.x = 1
    // if (player.body.position.x > (nextPlayer.position.x + 10)) player.interpolation.x = -1
    // if (player.body.position.y < (nextPlayer.position.y - 10)) player.interpolation.y = 1
    // if (player.body.position.y > (nextPlayer.position.y + 10)) player.interpolation.y = -1
  })
}

const getView = game => Object.assign(
  {},
  game,
  {
    interval: undefined,
    physics: undefined,
    ais: undefined,
    walls: game.walls.map(Wall.getView),
    players: game.players.map(Player.getView),
  },
)

export default {
  create,
  update,
  addPlayer,
  addAI,
  getView,
  synchronize,
}

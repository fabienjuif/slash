import { remove } from 'lodash-es'
import { getWalls } from 'slash-generators'
import Physics from './physics'
import Player from './entities/player'
import Wall from './entities/wall'
import AI from './ai/classic'

const create = ({ width, height }) => {
  const game = {
    width,
    height,
    physics: Physics.create(),
    players: [],
    walls: [],
    ais: [],
  }

  // TODO: remove `getWall` generator
  // TODO: at leat change the signature
  game.walls = getWalls({ width, height }).map(Wall.create)
  Physics.add(game.physics, game.walls)

  return game
}

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

export default {
  create,
  update,
  addPlayer,
  addAI,
}

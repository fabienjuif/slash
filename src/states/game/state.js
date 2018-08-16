import { Text } from 'pixi.js'
import { random } from 'lodash-es'
import Physics from './physics'
import Renderer from '../../renderer/renderer'
import State from '../state'
import Entity from './entities/entity'
import Wall from './entities/wall'
import Player from './entities/player'
import Skill from './skill'
import IA from './inputs/ia'
import LocalInputs from './inputs/local'

const WALL_WIDTH = 100

const add = (state, entities) => {
  const { physics } = state

  Physics.add(physics, entities)

  state.entities = state.entities.concat(entities)

  return entities
}

const create = (renderer, { worldSize }) => {
  const state = State.create('game', { renderer })
  state.inputs.ia = []
  state.worldSize = worldSize

  // add ui
  state.ui = new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })

  return state
}

const prepare = (state) => {
  const { worldSize } = state

  // create physic engine
  state.physics = Physics.create()

  // add entities
  // - player
  state.player = add(state, Player.create('player', { x: worldSize.x / 2, y: worldSize.y / 2 }))
  state.inputs.player = LocalInputs.create(state.player, { game: state })
  // - enemies
  const ias = add(state, Array.from({ length: 2 }).map(() => Player.create('ia', { x: random(100, worldSize.x - 100), y: random(100, worldSize.y - 100), color: 0xfffff00 })))
  ias.forEach(ia => state.inputs.ia.push(IA.create(ia, { game: state })))
  // - walls around the level
  add(state, Wall.create(0, 0, worldSize.x, WALL_WIDTH))
  add(state, Wall.create(0, 0, WALL_WIDTH, worldSize.y))
  add(state, Wall.create(worldSize.x - WALL_WIDTH, 0, WALL_WIDTH, worldSize.y))
  add(state, Wall.create(0, worldSize.y - WALL_WIDTH, worldSize.x, WALL_WIDTH))
  // - walls inside the level
  for (let i = 0; i < worldSize.x / WALL_WIDTH; i += 1) {
    for (let j = 0; j < worldSize.y / WALL_WIDTH; j += 1) {
      if (random(0, 10) === 0) {
        add(state, Wall.create(i * WALL_WIDTH, j * WALL_WIDTH, WALL_WIDTH, WALL_WIDTH))
      }
    }
  }

  // add entities to renderer
  const { player, entities, ui, renderer } = state
  Renderer.addToStage(renderer, { graphics: renderer.viewport })
  Renderer.addToStage(renderer, { graphics: ui })
  Renderer.addToViewport(renderer, entities)

  // follow the player (camera)
  Renderer.follow(renderer, player)
}

const update = (state, delta) => {
  const { physics, inputs, player, entities } = state

  // update inputs
  inputs.ia.forEach(IA.update)
  LocalInputs.update(inputs.player)

  // update physics
  Physics.update(physics, delta)

  // update ui
  const print = ['jump', 'shield'].map(skillName => {
    const skill = player.skills[skillName]
    const cooldown = Skill.isCooldown(skill) ? `${skill.next - Date.now()}`.padStart(7, ' ') : 'ready !'
    return `${skillName}(${String.fromCharCode(inputs.player.bindings[skillName])}): ${cooldown}`
  })
  print.push(`${Math.floor(player.hp)} HP`)
  state.ui.text = print.join(' | ')

  // update entities
  state.entities.forEach(Entity.draw)

  // is it gameover ?
  if (player.hp <= 0) return 'gameover'
  if (entities.filter(entity => entity.type === 'player' && entity.hp > 0).length > 1) return 'game'
  return 'gameover'
}

const clear = (state) => {
  LocalInputs.clear(state.inputs.player)
  state.entities = []
}

export default {
  create,
  prepare,
  update,
  clear,
}

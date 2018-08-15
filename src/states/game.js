import { Text } from 'pixi.js'
import { random } from 'lodash-es'
import Physics from '../physics/physics'
import Renderer from '../renderer/renderer'
import Wall from '../entities/wall'
import Player from '../entities/player'
import IA from '../inputs/ia' // TODO: should be into a sub directory since this inputs depends on state
import LocalInputs from '../inputs/local' // TODO: should be into a sub directory since this inputs depends on state
import Skill from '../skills/skill'
import State from './state'

const WALL_WIDTH = 100

const add = (state, entities) => {
  const { physics, renderer } = state
  const asArray = [].concat(entities)

  Physics.add(physics, entities)
  Renderer.addToViewport(renderer, entities)

  state.entities = state.entities.concat(entities)

  // bind inputs
  asArray.forEach((entity) => {
    if (!entity.type === 'player') return

    if (entity.id === 'ia') {
      state.inputs.ia.push(IA.create(entity, { game: state })) // TODO: impact ia
    } else if (entity.id === 'player') {
      state.inputs.player = LocalInputs.create(entity, { game: state }) // TODO: impact localinputs
    }
  })

  return entities
}

const create = (renderer, { worldSize }) => {
  const physics = Physics.create()

  const state = State.create('game', { renderer, physics })
  state.inputs.ia = []

  // add ui
  const ui = new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  state.ui = ui
  Renderer.addToStage(renderer, { graphics: ui }) // TODO: renderer should use state stage (1 stage par state)

  // add entities
  // - player
  state.player = add(state, Player.create('player', { x: worldSize.x / 2, y: worldSize.y / 2 }))
  // - enemies
  add(state, Array.from({ length: 2 }).map(() => Player.create('ia', { x: random(100, worldSize.x - 100), y: random(100, worldSize.y - 100), color: 0xfffff00 })))
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

  // viewport will follow the player
  Renderer.follow(renderer, state.player)

  return state
}

const update = (state, delta) => {
  const { physics, inputs, player } = state

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
}

export default {
  create,
  update,
  add,
}

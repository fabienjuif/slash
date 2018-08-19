import { Text, Graphics } from 'pixi.js'
import { random } from 'lodash-es'
import Physics from './physics'
import Renderer from '../../renderer/renderer'
import State from '../state'
import Entity from './entities/entity'
import Wall from './entities/wall'
import Player from './entities/player'
import Skill from './skill'
import AI from './inputs/ai'
import Keyboard from './inputs/keyboard'
import Touch from './inputs/touch'

const WALL_WIDTH = 100

const add = (state, entities) => {
  const { physics } = state

  Physics.add(physics, entities)

  state.entities = state.entities.concat(entities)

  return entities
}

const create = (renderer, { worldSize }) => {
  const state = State.create('game', { renderer })
  state.inputs.ai = []
  state.worldSize = worldSize

  // add ui
  state.ui = {
    infos: new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }),
    touch: undefined,
  }

  return state
}

const prepare = (state) => {
  const { worldSize, inputsType } = state

  let inputs
  if (inputsType === 'keyboard') {
    inputs = Keyboard.create()
  }
  if (inputsType === 'touch') {
    inputs = Touch.create()
    state.ui.touch = new Graphics()
  }

  // create physic engine
  state.physics = Physics.create()

  // add entities
  // - player
  state.player = add(state, Player.create('player', { inputs, x: worldSize.x / 2, y: worldSize.y / 2 }))
  // - enemies
  add(state, Array.from({ length: 1 }).map(() => Player.create('ai', { inputs: AI.create({ game: state }), x: random(100, worldSize.x - 100), y: random(100, worldSize.y - 100), color: 0xfffff00 })))
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
  Renderer.addToStage(renderer, { graphics: state.ui.infos })
  if (state.ui.touch) Renderer.addToStage(renderer, { graphics: state.ui.touch })
  Renderer.addToViewport(renderer, entities)

  // follow the player (camera)
  Renderer.follow(renderer, player)
}

const update = (state, delta) => {
  const { physics, player, entities, ui } = state

  // update entities
  state.entities.forEach(Entity.update)

  // update physics
  Physics.update(physics, delta)

  // update ui
  const print = ['jump', 'shield'].map(skillName => {
    const { bindings } = player.inputs
    const skill = player.skills[skillName]
    const cooldown = Skill.isCooldown(skill) ? `${skill.next - Date.now()}`.padStart(7, ' ') : 'ready !'

    const bindTxt = bindings ? ` (${String.fromCharCode(player.inputs.bindings[skillName])})`: ''
    return `${skillName}${bindTxt}: ${cooldown}`
  })
  print.push(`${Math.floor(player.hp)} HP`)
  ui.infos.text = print.join(' | ')

  // touch ui
  const { jump, shield, up, down, left, right } = player.inputs.keys

  if (ui.touch) {
    ui.touch.clear()
    // - shield
    ui.touch.beginFill(0x42B37F)
    ui.touch.drawCircle(window.innerWidth - 45, window.innerHeight - 100, shield ? 35 : 40)
    ui.touch.endFill()
    // - jump
    ui.touch.beginFill(0xAE2D2D)
    ui.touch.drawCircle(window.innerWidth - 110, window.innerHeight - 45, jump ? 35 : 40)
    ui.touch.endFill()
    // - stick (outline)
    ui.touch.lineStyle(2, 0xffffff)
    ui.touch.drawCircle(105, window.innerHeight - 105, 100)
    ui.touch.endFill()
    // - stick (inner)
    ui.touch.beginFill(0xffffff)
    ui.touch.drawCircle(105 + (left ? -30 : 0) + (right ? 30 : 0), window.innerHeight - 105 + (up ? -30 : 0) + (down ? 30 : 0), 25)
    ui.touch.endFill()
  }

  // draw entities
  state.entities.forEach(Entity.draw)

  // is it gameover ?
  if (player.hp <= 0) return 'gameover'
  if (entities.filter(entity => entity.type === 'player' && entity.hp > 0).length > 1) return 'game'
  return 'gameover'
}

const clear = (state) => {
  state.entities.forEach(Entity.clear)
  state.entities = []
}

export default {
  create,
  prepare,
  update,
  clear,
}

import { Text, Graphics } from 'pixi.js'
import { random } from 'lodash-es'
import { World } from 'matter-js'
import Physics from './physics'
import Renderer from '../../renderer/renderer'
import Inputs from '../../inputs/inputs'
import State from '../state'
import Entity from './entities/entity'
import Wall from './entities/wall'
import Player from './entities/player'
import Skill from './skill'
import AI from './ai/classic'

const bindings = {
  jump: {
    keyCode: 67, // c
    zone: {
      x: window.innerWidth - 150,
      y: window.innerHeight - 85,
      width: 80,
      height: 80,
    }
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
}

const WALL_WIDTH = 100

const add = (state, entities) => {
  const { physics } = state

  Physics.add(physics, entities)

  return entities
}

const create = (renderer, { worldSize }) => {
  const state = State.create('game', { renderer })

  return Object.assign(
    state,
    {
      ai: [],
      worldSize,
      ui: {
        infos: new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }),
        touch: new Graphics(),
      },
    },
  )
}

const prepare = (state) => {
  const { worldSize } = state

  // create physic engine
  state.physics = Physics.create()

  // player
  // - inputs
  // - entity
  state.inputs = Inputs.create(bindings)
  state.player = add(state, Player.create('player', { world: state.physics.world, inputs: state.inputs, x: worldSize.x / 2, y: worldSize.y / 2 }))

  // walls
  // - outside the level
  add(state, Wall.create(0, 0, worldSize.x, WALL_WIDTH))
  add(state, Wall.create(0, 0, WALL_WIDTH, worldSize.y))
  add(state, Wall.create(worldSize.x - WALL_WIDTH, 0, WALL_WIDTH, worldSize.y))
  add(state, Wall.create(0, worldSize.y - WALL_WIDTH, worldSize.x, WALL_WIDTH))
  // - inside the level
  for (let i = 0; i < worldSize.x / WALL_WIDTH; i += 1) {
    for (let j = 0; j < worldSize.y / WALL_WIDTH; j += 1) {
      if (random(0, 10) === 0) {
        add(state, Wall.create(i * WALL_WIDTH, j * WALL_WIDTH, WALL_WIDTH, WALL_WIDTH))
      }
    }
  }

  // AI
  state.ai = Array.from({ length: 2 }).map(() => AI.create(state))
  add(state, state.ai.map((inputs) => Player.create('ai', { inputs, x: random(100, worldSize.x - 100), y: random(100, worldSize.y - 100), color: 0xfffff00 })))

  // add entities to renderer
  const { player, ui, renderer, physics } = state
  Renderer.addToStage(renderer, { graphics: renderer.viewport })
  Renderer.addToStage(renderer, { graphics: ui.infos })
  Renderer.addToStage(renderer, { graphics: ui.touch })
  Renderer.addToViewport(renderer, physics.entities)

  // follow the player (camera)
  Renderer.follow(renderer, player)
}

const update = (state, delta) => {
  const { physics, player, ui, isTouched, ai } = state

  // update player inputs
  state.inputs = Inputs.update(state.inputs)

  // update ai
  ai.forEach(AI.update)

  // update physics (and entities)
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
  if (isTouched) {
    const { jump, shield, up, down, left, right } = player.inputs.keys

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
  physics.entities.forEach(Entity.draw)

  // is it gameover ?
  if (
    player.hp <= 0 ||
    physics.entities.filter(entity => entity.type === 'player').length < 2
  ) return 'gameover'

  return 'game'
}

const clear = (state) => {
  Inputs.clear(state.inputs)
}

export default {
  create,
  prepare,
  update,
  clear,
}

import { Text } from 'pixi.js'
import { random } from 'lodash-es'

import Physics from './physics/physics'
import Renderer from './renderer/renderer'
import Wall from './entities/wall'
import Player from './entities/player'
import Skill from './skills/skill'
import IA from './inputs/ia'
import LocalInputs from './inputs/local'

const TEST_PERF = false
const FAST = false || TEST_PERF
const PIXI = true

const physics = Physics.create()

const WORLD_SIZE = {
  x: 3200,
  y: 2400,
}

const player = Player.create('player', { x: WORLD_SIZE.x / 2, y: WORLD_SIZE.y / 2 })
const enemies = Array.from({ length: 2 }).map((_, index) => Player.create(`enemy-${index}`, { x: random(100, WORLD_SIZE.x - 100), y: random(100, WORLD_SIZE.y - 100), color: 0xfffff00 }))

// walls around the level
const walls = [
  Wall.create(0, 0, WORLD_SIZE.x, 100), //
  Wall.create(0, 0, 100, WORLD_SIZE.y), //
  Wall.create(WORLD_SIZE.x - 100, 0, 100, WORLD_SIZE.y), //
  Wall.create(0, WORLD_SIZE.y - 100, WORLD_SIZE.x, 100), //
]

// wall inside the level
const WALL_WIDTH = 100
const maxWallX = WORLD_SIZE.x / WALL_WIDTH
const maxWallY = WORLD_SIZE.y / WALL_WIDTH

for (let i = 0; i < maxWallX; i += 1) {
  for (let j = 0; j < maxWallY; j += 1) {
    if (random(0, 10) === 0) {
      walls.push(Wall.create(i * WALL_WIDTH, j * WALL_WIDTH, WALL_WIDTH, WALL_WIDTH))
    }
  }
}

Physics.add(physics, player)
Physics.add(physics, enemies)
Physics.add(physics, walls)

const renderer = Renderer.create(window.innerWidth, window.innerHeight, WORLD_SIZE.x, WORLD_SIZE.y, { matter: PIXI ? undefined : physics.engine })
Renderer.follow(renderer, player)
Renderer.addToViewport(renderer, player);
[...walls, ...enemies].forEach(entity => Renderer.addToViewport(renderer, entity))

// draw walls only once since it doesnt move
Wall.draw(walls)

const ui = (delta) => {
  const skills = ['jump', 'shield']
  const bindings = localInputs.bindings

  const print = skills.map(skillName => {
    const skill = player.skills[skillName]

    const cooldown = Skill.isCooldown(skill) ? `${skill.next - Date.now()}`.padStart(7, ' ') : 'ready !'

    return `${skillName}(${String.fromCharCode(bindings[skillName])}): ${cooldown}`
  })

  print.push(`${Math.floor(player.hp)} HP`)

  if (lastUI) Renderer.removeFromStage(renderer, { graphics: lastUI })
  lastUI = Renderer.addToStage(renderer, { graphics: new Text(print.join(' | '), { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }) })

  if (lastFPS) Renderer.removeFromStage(renderer, { graphics: lastFPS })
  const fps = new Text(1000 / delta, { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  fps.position.y = window.innerHeight - 30
  fps.position.x = window.innerWidth - 50
  lastFPS = Renderer.addToStage(renderer, { graphics: fps })
}

// TODO: move it to renderer object
const renderPixi = (delta) => {
  Player.draw(player)
  enemies.forEach(enemy => Player.draw(enemy))

  ui(delta)
}

let lastUI
let lastFPS

const iaInputs = enemies.map(enemy => IA.create(enemy, { players: [player] }))
const localInputs = LocalInputs.create(player, { players: enemies })

let lastLoop = Date.now()
const getDelta = () => {
  const now = Date.now()
  const delta = now - lastLoop

  lastLoop = now

  return delta
}

let nbLoops = 0
const start = Date.now()
const loop = () => {
  if (TEST_PERF) {
    if (nbLoops > 1000) {
      const duration = Date.now() - start
      window.alert(`${nbLoops} loops in ${duration}ms => ${duration / nbLoops} ms per loop`)
      return
    }

    nbLoops++
  }

  // loop delta
  const loopDelta = getDelta()

  // update inputs
  iaInputs.forEach(ia => IA.update(ia))
  LocalInputs.update(localInputs)

  // update physics
  Physics.update(physics, loopDelta)

  // draw
  renderPixi(loopDelta)
  Renderer.update(renderer)

  // register next loop
  if (FAST) setTimeout(loop, 0)
  else window.requestAnimationFrame(loop)
}
if (FAST) setTimeout(loop, 0)
else window.requestAnimationFrame(loop)

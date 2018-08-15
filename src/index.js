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

Renderer.addToViewport(renderer, player)
Renderer.addToViewport(renderer, enemies)
Renderer.addToViewport(renderer, walls)

const skillsText = new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
Renderer.addToStage(renderer, { graphics: skillsText })
const fpsText = new Text('0', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
fpsText.position.y = window.innerHeight - 30
fpsText.position.x = window.innerWidth - 50
Renderer.addToStage(renderer, { graphics: fpsText })

const ui = (delta) => {
  const skills = ['jump', 'shield']
  const bindings = localInputs.bindings

  const print = skills.map(skillName => {
    const skill = player.skills[skillName]

    const cooldown = Skill.isCooldown(skill) ? `${skill.next - Date.now()}`.padStart(7, ' ') : 'ready !'

    return `${skillName}(${String.fromCharCode(bindings[skillName])}): ${cooldown}`
  })

  print.push(`${Math.floor(player.hp)} HP`)

  skillsText.text = print.join(' | ')
  fpsText.text = (1000 / delta)
}

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
  const delta = getDelta()

  // update inputs
  iaInputs.forEach(ia => IA.update(ia))
  LocalInputs.update(localInputs)

  // update physics
  Physics.update(physics, delta)

  // draw
  ui(delta)
  Renderer.update(renderer)

  // register next loop
  if (FAST) setTimeout(loop, 0)
  else window.requestAnimationFrame(loop)
}
if (FAST) setTimeout(loop, 0)
else window.requestAnimationFrame(loop)

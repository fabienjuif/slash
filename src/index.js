import { Text } from 'pixi.js'
import { random } from 'lodash-es'
import { Engine, World, Body, Events, Pair, Sleeping } from 'matter-js'

import Wall from './sprites/wall'
import Player from './sprites/player'
import Skill from './skills/skill'
import IA from './inputs/ia'
import LocalInputs from './inputs/local'
import Renderer from './renderer/renderer'

const FAST = false

// create an engine
var engine = Engine.create()
engine.world.gravity = { x: 0, y: 0 }
engine.enableSleeping = true
// - accuracy needed
const RUN_ENGINE_PER_LOOP = 2

const WORLD_SIZE = {
  x: 3200,
  y: 2400,
}

const player = Player.create('player', { x: WORLD_SIZE.x / 2, y: WORLD_SIZE.y / 2 })
const enemies = Array.from({ length: 10 }).map((_, index) => Player.create(`enemy-${index}`, { x: random(100, WORLD_SIZE.x - 100), y: random(100, WORLD_SIZE.y - 100), color: 0xfffff00 }))

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


World.add(engine.world, [player.physics, ...[...walls, ...enemies].map(({ physics }) => physics)])

const renderer = Renderer.create(window.innerWidth, window.innerHeight, WORLD_SIZE.x, WORLD_SIZE.y, /* { matter: engine } */)
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

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs

  // change object colours to show those starting a collision
  for (var i = 0; i < pairs.length; i++) {
    const { bodyA, bodyB } = pairs[i]

    // if (['player', 'enemy'].includes(bodyA.label) && ['player', 'enemy'].includes(bodyB.label)) {
    //   if (Skill.isChanneling(enemy.skills.jump) && !Skill.isChanneling(player.skills.shield)) {
    //     Pair.setActive(pairs[i], false)
    //     player.hp -= 50
    //     if (player.hp <= 0) {
    //       Skill.trigger(player.skills.dead)
    //       World.remove(engine.world, player.physics)
    //     }
    //   }

    //   if (Skill.isChanneling(player.skills.jump) && !Skill.isChanneling(enemy.skills.shield)) {
    //     Pair.setActive(pairs[i], false)
    //     enemy.hp -= 50
    //     if (enemy.hp <= 0) {
    //       Skill.trigger(enemy.skills.dead)
    //       World.remove(engine.world, enemy.physics)
    //     }
    //   }
    // }
  }
})

let lastLoop = Date.now()
const getDelta = () => {
  const now = Date.now()
  const delta = now - lastLoop

  lastLoop = now

  return delta
}

const loop = () => {
  // loop delta
  const loopDelta = getDelta()

  // update inputs
  iaInputs.forEach(ia => IA.update(ia))
  LocalInputs.update(localInputs)

  // update physics
  Sleeping.set(player.physics, false)
  // console.log('player sleep', player.physics.isSleeping)
  engine.world.bodies.forEach(body => Body.setAngle(body, 0))
  Player.update(player)
  enemies.map(enemy => Player.update(enemy))
  // - run the engine several times, so we have the feeling the game is fast
  // - also, this avoid collision detecting issue since CCD is not implemented yet in matter-js
  for (let i = 0; i < RUN_ENGINE_PER_LOOP; ++i) {
    Engine.update(engine, getDelta())
  }

  // draw
  renderPixi(loopDelta)
  Renderer.update(renderer)

  // register next loop
  if (!FAST) window.requestAnimationFrame(loop)
}
if (FAST) interval = setInterval(loop, 0)
else window.requestAnimationFrame(loop)

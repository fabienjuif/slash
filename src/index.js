import * as PIXI from 'pixi.js'
import Viewport from 'pixi-viewport'

import { Engine, World, Body, Vector, Events, Pair, Common } from 'matter-js'

import Wall from './sprites/wall'
import Player from './sprites/player'
import Skill from './skills/skill'
import IA from './inputs/ia'
import LocalInputs from './inputs/local'

// create an engine
var engine = Engine.create()
engine.world.gravity = { x: 0, y: 0 }

// FIXME: move it to a directory one we need debug
// create a renderer
// var render = Render.create({
//   element: document.body,
//   engine: engine,
//   options: {
//     width: window.innerWidth,
//     height: window.innerHeight,
//     pixelRatio: 0.8,
//     wireframeBackground: '#222',
//     hasBounds: false,
//     wireframes: true,
//     showDebug: true,
//     showBroadphase: true,
//     showBounds: true,
//     showVelocity: true,
//     showAxes: true,
//     showPositions: true,
//     showIds: true,
//     showVertexNumbers: true,
//   },
// })

const WORLD_SIZE = {
  x: 1600,
  y: 1200,
}

const player = Player.create('player', { x: WORLD_SIZE.x / 2, y: WORLD_SIZE.y / 2 })
const enemy = Player.create('enemy', { x: 400, y: 400, color: 0xffff00 })

const walls = [
  Wall.create(0, 0, WORLD_SIZE.x, 100), //
  Wall.create(0, 0, 100, WORLD_SIZE.y), //
  Wall.create(WORLD_SIZE.x - 100, 0, 100, WORLD_SIZE.y), //
  Wall.create(0, WORLD_SIZE.y - 100, WORLD_SIZE.x, 100), //
]

// add all of the bodies to the world
World.add(engine.world, [player.physics, enemy.physics, ...walls.map(({ physics }) => physics)])

// run the engine
Engine.run(engine)

// run the renderer
// Render.run(render)

const renderer = PIXI.autoDetectRenderer(innerWidth, innerHeight, {
  backgroundColor: 0x000000,
})
const stage = new PIXI.Container()
document.body.appendChild(renderer.view)
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: WORLD_SIZE.x,
  worldHeight: WORLD_SIZE.y,
})
viewport.follow(player.physics.position, { speed: 20, radius: 100 })
viewport.addChild(player.graphics)
viewport.addChild(enemy.graphics)
walls.forEach(wall => viewport.addChild(wall.graphics))

stage.addChild(viewport)

// draw walls only once since it doesnt move
Wall.draw(walls)

const renderPixi = () => {
  Player.draw(player)
  Player.draw(enemy)

  renderer.render(stage)
}

let lastUI
let lastFPS
var lastLoop = Date.now()

// TODO: clear intervals one game is over or when ia is dead
const ia = IA.create(enemy, { players: [player] })
const localInputs = LocalInputs.create(player, { players: [enemy] })

const ui = () => {
  const skills = Object.values(player.skills)
  const bindings = localInputs.bindings
  const print = skills.map(({ id, next }) => {
    let cooldown = 'ready !'
    if (next >= Date.now()) cooldown = `${next - Date.now()}`.padStart(7, ' ')

    return `${id}(${String.fromCharCode(bindings[id])}): ${cooldown}`
  })

  print.push(`${player.hp} HP`)
  print.push(`${enemy.hp} E.HP`)

  if (lastUI) stage.removeChild(lastUI)
  lastUI = stage.addChild(new PIXI.Text(print.join(' | '), { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))

  if (lastFPS) stage.removeChild(lastFPS)
  var thisLoop = Date.now()
  const fps = new PIXI.Text(1000 / (thisLoop - lastLoop), { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  fps.position.y = window.innerHeight - 30
  fps.position.x = window.innerWidth - 50
  lastFPS = stage.addChild(fps)
  lastLoop = thisLoop
}

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs

  // change object colours to show those starting a collision
  for (var i = 0; i < pairs.length; i++) {
    const { bodyA, bodyB } = pairs[i]

    if (['player', 'enemy'].includes(bodyA.label) && ['player', 'enemy'].includes(bodyB.label)) {
      if (Skill.isChanneling(enemy.skills.jump) && !Skill.isChanneling(player.skills.shield)) {
        Pair.setActive(pairs[i], false)
        player.hp -= 50
        if (player.hp <= 0) {
          player.dead = Date.now()
          World.remove(engine.world, player.physics)
        }
      }

      if (Skill.isChanneling(player.skills.jump) && !Skill.isChanneling(enemy.skills.shield)) {
        Pair.setActive(pairs[i], false)
        enemy.hp -= 50
        if (enemy.hp <= 0) {
          enemy.dead = Date.now()
          World.remove(engine.world, enemy.physics)
        }
      }
    }
  }
})

const loop = () => {
  window.requestAnimationFrame(loop)

  // update physics
  Player.update(player)
  Player.update(enemy)

  ui()

  IA.update(ia)
  LocalInputs.update(localInputs)

  renderPixi()

  // Render.lookAt(render, boxA, { x: 500, y: 500 })

  engine.world.bodies.forEach(body => Body.setAngle(body, 0))
}
loop()

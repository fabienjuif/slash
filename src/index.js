import * as PIXI from 'pixi.js'
import Viewport from 'pixi-viewport'

import { Engine, World, Body, Vector, Events, Pair } from 'matter-js'
import store from './store/index'
import wallFactory from './sprites/wall'
import playerFactory from './sprites/player'

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

const player = playerFactory(WORLD_SIZE.x / 2, WORLD_SIZE.y / 2, 'player')
const enemy = playerFactory(400, 400, 'enemy')

var walls = [wallFactory(0, 0, WORLD_SIZE.x, 100), wallFactory(0, 0, 100, WORLD_SIZE.y), wallFactory(WORLD_SIZE.x - 100, 0, 100, WORLD_SIZE.y), wallFactory(0, WORLD_SIZE.y - 100, WORLD_SIZE.x, 100)]

// add all of the bodies to the world
World.add(engine.world, [player.physics, enemy.physics, ...walls.map(({ physics }) => physics)])

// run the engine
Engine.run(engine)

// run the renderer
// Render.run(render)

//
let looking = { x: 1, y: 0 }

const move = () => {
  const { up, right, bottom, left } = store.inputs.get()

  let x = 0
  let y = 0
  if (up) y = -1
  if (bottom) y = 1
  if (right) x = 1
  if (left) x = -1
  if (!up && !bottom) y = 0
  if (!left && !right) x = 0

  Body.setVelocity(player.physics, Vector.mult({ x, y }, 20))
}

const look = () => {
  const { up, right, bottom, left } = store.inputs.get()

  if (up) looking.y = -1
  if (bottom) looking.y = 1
  if (right) looking.x = 1
  if (left) looking.x = -1

  if (!up && !bottom && (left || right)) looking.y = 0
  if (!left && !right && (up || bottom)) looking.x = 0
}

const jump = () => {
  if (player.jump >= Date.now()) {
    Body.setVelocity(player.physics, Vector.mult(looking, 40))
    return true
  }

  const { id, running } = store.skills.get('jump')
  if (!running) return false

  // running it one time
  store.skills.update({ id, running: false })

  player.jump = Date.now() + 100
  return true
}

const shield = () => {
  const { id, running } = store.skills.get('shield')
  if (!running) return false

  // running it one time
  store.skills.update({ id, running: false })

  player.shield = Date.now() + 100
  return true
}

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
stage.addChild(viewport)

// // activate plugins
// viewport
//     .drag()
//     .wheel()

const graphics = new PIXI.Graphics()
const playerGraphics = new PIXI.Graphics()
viewport.addChild(graphics)
viewport.addChild(playerGraphics)

const renderPixi = () => {
  playerGraphics.clear()
  graphics.clear()

  // player
  if (player.shield >= Date.now()) playerGraphics.beginFill(0xff00ff)
  if (player.jump >= Date.now()) {
    playerGraphics.lineStyle(2, 0xffffff)
  } else {
    playerGraphics.lineStyle(2, 0xff00ff)
  }
  playerGraphics.drawCircle(player.physics.position.x, player.physics.position.y, 40)
  playerGraphics.endFill()
  viewport.follow(player.physics.position, { speed: 20, radius: 100 })

  // enemy
  if (!enemy.dead || enemy.dead > Date.now() - 100) {
    const circleSize = enemy.dead ? (Date.now() - enemy.dead) * 10 : 40
    graphics.lineStyle(2, 0xffff00)
    graphics.drawCircle(enemy.physics.position.x, enemy.physics.position.y, circleSize)
    graphics.endFill()
  }

  // walls
  walls.forEach(wall => {
    graphics.lineStyle(0, 0xff00ff)
    graphics.beginFill(0x00ffff)
    graphics.drawRect(wall.graphics.x, wall.graphics.y, wall.graphics.width, wall.graphics.height)
    graphics.endFill()
  })

  renderer.render(stage)
}

let lastUI
const ui = () => {
  const skills = store.skills.getAsArray()
  const bindings = store.bindings.get()
  const print = skills.map(({ id, next }) => {
    let cooldown = 'ready !'
    if (next >= Date.now()) cooldown = `${next - Date.now()}`.padStart(7, ' ')

    return `${id}(${String.fromCharCode(bindings[id])}): ${cooldown}`
  })

  print.push(`${player.hp} HP`)
  print.push(`${enemy.hp} E.HP`)

  if (lastUI) stage.removeChild(lastUI)
  lastUI = stage.addChild(new PIXI.Text(print.join(' | '), { fill: 'white' }))
}

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs

  // change object colours to show those starting a collision
  for (var i = 0; i < pairs.length; i++) {
    const { bodyA, bodyB } = pairs[i]

    if (['player', 'enemy'].includes(bodyA.label) && ['player', 'enemy'].includes(bodyB.label)) {
      if (player.jump >= Date.now()) {
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

  ui()

  look()
  shield()
  if (!jump()) move()

  renderPixi()

  // Render.lookAt(render, boxA, { x: 500, y: 500 })

  engine.world.bodies.forEach(body => {
    Body.setAngle(body, 0)
  })
}
loop()

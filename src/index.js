import * as PIXI from 'pixi.js'
import Viewport from 'pixi-viewport'

import { Engine, World, Body, Vector, Events, Pair, Common } from 'matter-js'
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
// const playerGraphics = new PIXI.Graphics()
viewport.addChild(graphics)
// viewport.addChild(playerGraphics)

const renderPixi = () => {
  graphics.clear()

  // viewport
  viewport.follow(player.physics.position, { speed: 20, radius: 100 });

  // players
  const printPlayer = ({ shield, jump, physics, label, dead }) => {
    if (dead + 100 <= Date.now()) return
    const circleSize = dead ? (Date.now() - dead) * 10 : 40

    const color = label === 'player' ? 0xff00ff : 0xffff00
    if (!dead && shield >= Date.now()) graphics.beginFill(color)

    graphics.lineStyle(2, color)
    if (jump >= Date.now()) graphics.lineStyle(2, 0xffffff)

    graphics.drawCircle(physics.position.x, physics.position.y, circleSize)
    graphics.endFill()
  }

  printPlayer(player)
  printPlayer(enemy)

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
  lastUI = stage.addChild(new PIXI.Text(print.join(' | '), { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
}

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs

  // change object colours to show those starting a collision
  for (var i = 0; i < pairs.length; i++) {
    const { bodyA, bodyB } = pairs[i]

    if (['player', 'enemy'].includes(bodyA.label) && ['player', 'enemy'].includes(bodyB.label)) {
      if (enemy.jump >= Date.now() && player.shield < Date.now()) {
        Pair.setActive(pairs[i], false)
        player.hp -= 50
        if (player.hp <= 0) {
          player.dead = Date.now()
          World.remove(engine.world, player.physics)
        }
      }

      if (player.jump >= Date.now() && enemy.shield < Date.now()) {
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

const ia = () => {
  setInterval(() => {
    enemy.shield = Common.choose([enemy.shield, enemy.shield, Date.now() + 100])
  }, 200)

  setInterval(() => {
    if (enemy.jump < Date.now() - 1000) { // Cooldown
      // console.log(distance)
      let notJumpChances = 5
      if (
        Math.abs(enemy.physics.position.x - player.physics.position.x) < 200 &&
        Math.abs(enemy.physics.position.y - player.physics.position.y) < 200
      ) notJumpChances = 1

      enemy.jump = Common.choose([...Array.from({ length: notJumpChances }).map(() => enemy.jump), Date.now() + 100])
    }
  }, 500)
}

ia()

let lastxDirection = 0
let lastyDirection = 0

const loop = () => {
  window.requestAnimationFrame(loop)

  ui()

  look()
  shield()
  if (!jump()) move()

  // ia
  if (enemy.jump < Date.now()) {
    let xDirection = 1
    let yDirection = 1
    if (enemy.physics.position.x > player.physics.position.x) xDirection = -1
    if (enemy.physics.position.y > player.physics.position.y) yDirection = -1

    lastxDirection = Common.choose([0, lastxDirection, lastxDirection, lastxDirection, lastxDirection, lastxDirection, xDirection])
    lastyDirection = Common.choose([0, lastyDirection, lastyDirection, lastyDirection, lastyDirection, lastyDirection, yDirection])

    Body.setVelocity(enemy.physics, Vector.mult({ x: lastxDirection, y: lastyDirection }, 20))
  }

  renderPixi()

  // Render.lookAt(render, boxA, { x: 500, y: 500 })

  engine.world.bodies.forEach(body => {
    Body.setAngle(body, 0)
  })
}
loop()

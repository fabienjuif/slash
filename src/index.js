import { Engine, Render, World, Bodies, Body, Vector } from 'matter-js'
import store from './store/index'

// create an engine
var engine = Engine.create()
engine.world.gravity = { x: 0, y: 0 }

// create a renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: 0.8,
    wireframeBackground: '#222',
    hasBounds: false,
    wireframes: true,
    showDebug: true,
    showBroadphase: true,
    showBounds: true,
    showVelocity: true,
    showAxes: true,
    showPositions: true,
    showIds: true,
    showVertexNumbers: true,
  },
})

// create two boxes and a ground
const WORLD_SIZE = {
  x: 1600,
  y: 1200,
}

var boxA = Bodies.circle(WORLD_SIZE.x / 2, WORLD_SIZE.y / 2, 40, undefined, 10)
var boxB = Bodies.circle(10, 120, 40, undefined, 10)
var walls = [
  Bodies.rectangle(WORLD_SIZE.x / 2, 5, WORLD_SIZE.x, 100, { isStatic: true }),
  Bodies.rectangle(5, WORLD_SIZE.y / 2, 100, WORLD_SIZE.y, { isStatic: true }),
  Bodies.rectangle(WORLD_SIZE.x - 5, WORLD_SIZE.y / 2, 100, WORLD_SIZE.y, {
    isStatic: true,
  }),
  Bodies.rectangle(WORLD_SIZE.x / 2, WORLD_SIZE.y - 5, WORLD_SIZE.x, 100, {
    isStatic: true,
  }),
]

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ...walls])

// run the engine
Engine.run(engine)

// run the renderer
Render.run(render)

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

  Body.setVelocity(boxA, Vector.mult({ x, y }, 20))
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
  const { id, running } = store.skills.get('jump')
  if (!running) return false

  // running it one time
  store.skills.update({ id, running: false })

  Body.setVelocity(boxA, Vector.mult(looking, 60))
  return true
}

const shield = () => {
  const { id, running } = store.skills.get('shield')
  if (!running) return false

  // running it one time
  store.skills.update({ id, running: false })

  // TODO: Body.setVelocity(boxA, Vector.mult(looking, 60))
  return true
}

const ui = () => {
  console.clear()

  const skills = store.skills.getAsArray()
  const cooldowns = skills.map(({ id, next }) => {
    let cooldown = 'ready !'
    if (next >= Date.now()) cooldown = `${next - Date.now()}`.padStart(7, ' ')

    return `${id}: ${cooldown}`
  })

  console.log(cooldowns.join(' | '))
  console.log('')
  console.log('bindings: arrows / jump: c / shield: v')
}

const loop = () => {
  window.requestAnimationFrame(loop)

  ui()

  look()
  shield()
  if (!jump()) move()

  Render.lookAt(render, boxA, { x: 500, y: 500 })

  Body.setAngle(boxA, 0)
  Body.setAngle(boxB, 0)
}
loop()

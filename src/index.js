import * as PIXI from 'pixi.js'
import Viewport from 'pixi-viewport'

import { Engine, World, Body, Vector, Events, Pair, Common } from 'matter-js'

import Wall from './sprites/wall'
import Player from './sprites/player'
import Skill from './skills/skill'
import IA from './inputs/ia'
import LocalInputs from './inputs/local'
import Renderer from './renderer/renderer'

// create an engine
var engine = Engine.create()
engine.world.gravity = { x: 0, y: 0 }

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

World.add(engine.world, [player.physics, enemy.physics, ...walls.map(({ physics }) => physics)])

Engine.run(engine)

const renderer = Renderer.create(window.innerWidth, window.innerHeight, WORLD_SIZE.x, WORLD_SIZE.y, /* { matter: engine } */)
Renderer.follow(renderer, player)
Renderer.addToViewport(renderer, player)
Renderer.addToViewport(renderer, enemy)
walls.forEach(wall => Renderer.addToViewport(renderer, wall))

// draw walls only once since it doesnt move
Wall.draw(walls)

const ui = () => {
  const skills = ['jump', 'shield']
  const bindings = localInputs.bindings

  const print = skills.map(skillName => {
    const skill = player.skills[skillName]

    const cooldown = Skill.isCooldown(skill) ? `${skill.next - Date.now()}`.padStart(7, ' ') : 'ready !'

    return `${skillName}(${String.fromCharCode(bindings[skillName])}): ${cooldown}`
  })

  print.push(`${Math.floor(player.hp)} HP`)
  print.push(`${Math.floor(enemy.hp)} E.HP`)

  if (lastUI) Renderer.removeFromStage(renderer, { graphics: lastUI })
  lastUI = Renderer.addToStage(renderer, { graphics: new PIXI.Text(print.join(' | '), { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }) })

  if (lastFPS) Renderer.removeFromStage(renderer, { graphics: lastFPS })
  var thisLoop = Date.now()
  const fps = new PIXI.Text(1000 / (thisLoop - lastLoop), { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  fps.position.y = window.innerHeight - 30
  fps.position.x = window.innerWidth - 50
  lastFPS = Renderer.addToStage(renderer, { graphics: fps })
  lastLoop = thisLoop
}

// TODO: move it to renderer object
const renderPixi = () => {
  Player.draw(player)
  Player.draw(enemy)

  ui()
}

let lastUI
let lastFPS
var lastLoop = Date.now()

// TODO: clear intervals one game is over or when ia is dead
const ia = IA.create(enemy, { players: [player] })
const localInputs = LocalInputs.create(player, { players: [enemy] })

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
          Skill.trigger(player.skills.dead)
          World.remove(engine.world, player.physics)
        }
      }

      if (Skill.isChanneling(player.skills.jump) && !Skill.isChanneling(enemy.skills.shield)) {
        Pair.setActive(pairs[i], false)
        enemy.hp -= 50
        if (enemy.hp <= 0) {
          Skill.trigger(enemy.skills.dead)
          World.remove(engine.world, enemy.physics)
        }
      }
    }
  }
})

const loop = () => {
  window.requestAnimationFrame(loop)

  // update inputs
  IA.update(ia)
  LocalInputs.update(localInputs)

  // update physics
  Player.update(player)
  Player.update(enemy)

  // draw
  renderPixi()
  Renderer.update(renderer)

  engine.world.bodies.forEach(body => Body.setAngle(body, 0))
}
loop()

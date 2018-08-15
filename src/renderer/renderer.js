import { Container, autoDetectRenderer } from 'pixi.js'
import Viewport from 'pixi-viewport'
import { Render } from 'matter-js'
import Entity from '../entities/entity'

const create = (screenWidth, screenHeight, worldWidth, worldHeight, { matter = false } = {}) => {
  let renderer
  let viewport
  let stage

  if (matter) {
    renderer = Render.create({
      element: document.body,
      engine: matter,
      options: {
        width: screenWidth,
        height: screenHeight,
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

    Render.run(renderer)
  } else {
    renderer = autoDetectRenderer(screenWidth, screenHeight, {
      backgroundColor: 0x000000,
    })
    stage = new Container()
    document.body.appendChild(renderer.view)
    viewport = new Viewport({
      screenWidth,
      screenHeight,
      worldWidth,
      worldHeight,
    })
    stage.addChild(viewport)
  }

  return {
    follow: undefined,
    entities: [],
    renderer,
    viewport,
    stage,
    matter,
    width: screenWidth,
    height: screenHeight,
  }
}

const update = (renderer) => {
  const { matter, follow, entities } = renderer

  if (matter) {
    if (follow) {
      Render.lookAt(renderer.renderer, follow.body, { x: 500, y: 500 })
    }
  } else {
    entities.forEach(Entity.draw)
    renderer.renderer.render(renderer.stage)
  }
}

const add = (renderer, entities) => {
  renderer.entities = renderer.entities.concat(entities)
}

const addToViewport = (renderer, entities) => {
  const { matter, viewport } = renderer
  if (matter) return

  add(renderer, entities)

  return [].concat(entities).map(entity => viewport.addChild(entity.graphics))
}

const addToStage = (renderer, entities) => {
  const { matter, stage } = renderer
  if (matter) return

  add(renderer, entities)

  return [].concat(entities).map(entity => stage.addChild(entity.graphics))
}

const follow = (renderer, entity) => {
  const { matter, viewport } = renderer

  renderer.follow = entity

  if (!matter) {
    viewport.follow(entity.body.position, { speed: 20, radius: 100 })
  }
}

export default {
  create,
  update,
  addToStage,
  addToViewport,
  follow
}

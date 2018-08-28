import { Container, autoDetectRenderer, settings, SCALE_MODES } from 'pixi.js'
import Viewport from 'pixi-viewport'
import { Render } from 'matter-js'

const clear = (renderer) => {
  const {
    worldWidth,
    worldHeight,
    width,
    height,
  } = renderer

  renderer.followed = false
  renderer.stage = new Container()
  renderer.viewport = new Viewport({
    screenWidth: width,
    screenHeight: height,
    worldWidth,
    worldHeight,
  })
  renderer.stage.addChild(renderer.viewport)
}

const create = (screenWidth, screenHeight, worldWidth, worldHeight, { matter = false } = {}) => {
  let viewport
  let stage

  const renderer = {
    follow: undefined,
    followed: false,
    viewport,
    stage,
    matter,
    worldWidth,
    worldHeight,
    width: screenWidth,
    height: screenHeight,
  }

  if (matter) {
    renderer.renderer = Render.create({
      element: window.document.body,
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

    Render.run(renderer.renderer)
  } else {
    settings.MIPMAP_TEXTURES = false
    settings.SCALE_MODE = SCALE_MODES.NEAREST

    renderer.renderer = autoDetectRenderer(
      screenWidth,
      screenHeight,
      {
        backgroundColor: 0x000000,
        clearBeforeRender: false,
        roundPixels: true,
        forceFXAA: true,
        powerPreference: 'high-performance',
      },
    )
    window.document.body.appendChild(renderer.renderer.view)

    clear(renderer)
  }

  return renderer
}

const update = (renderer) => {
  const { matter, follow } = renderer

  if (matter) {
    if (follow) {
      Render.lookAt(renderer.renderer, follow.body, { x: 500, y: 500 })
    }
  } else {
    renderer.renderer.render(renderer.stage)
  }
}

const addToViewport = (renderer, entities) => {
  const { matter, viewport } = renderer
  if (matter) return entities; // TODO: remove semicolon with flatten

  [].concat(entities).map(entity => viewport.addChild(entity.graphics))

  return entities
}

const addToStage = (renderer, entities) => {
  const { matter, stage } = renderer
  if (matter) return entities; // TODO: remove semicolon with flatten

  [].concat(entities).map(entity => stage.addChild(entity.graphics))

  return entities
}

const follow = (renderer, entity) => {
  const { matter, viewport, followed } = renderer

  renderer.follow = entity

  if (!matter) {
    viewport.follow(entity.body.position, { speed: followed ? 20 : 0, radius: 100 })
    renderer.followed = true
  }
}

export default {
  create,
  update,
  addToStage,
  addToViewport,
  follow,
  clear,
}

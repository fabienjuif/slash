import { Container, autoDetectRenderer } from 'pixi.js'
import Viewport from 'pixi-viewport'
import { Render } from 'matter-js'

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
    renderer,
    viewport,
    stage,
    matter,
    width: screenWidth,
    height: screenHeight,
  }
}

const update = renderer => {
  const { matter, follow } = renderer

  if (matter) {
    if (follow) {
      Render.lookAt(renderer.renderer, follow.body, { x: 500, y: 500 })
    }
  } else {
    renderer.renderer.render(renderer.stage)
  }
}

const addToViewport = (renderer, object) => {
  const { matter, viewport } = renderer
  if (matter) return

  return viewport.addChild(object.graphics)
}

const addToStage = (renderer, object) => {
  const { matter, stage } = renderer
  if (matter) return

  return stage.addChild(object.graphics)
}

const removeFromStage = (renderer, object) => {
  const { matter, stage } = renderer
  if (matter) return

  return stage.removeChild(object.graphics)
}

const follow = (renderer, object) => {
  const { matter, viewport } = renderer

  renderer.follow = object

  if (!matter) {
    viewport.follow(object.body.position, { speed: 20, radius: 100 })
  }
}

export default {
  create,
  update,
  addToStage,
  removeFromStage,
  addToViewport,
  follow
}

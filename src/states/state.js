import { Container, Text } from 'pixi.js'
import Renderer from '../renderer/renderer'
import Game from './game'

const create = (id, { renderer, physics, viewport }) => {
  const stage = new Container()

  const fps = new Text('0', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  fps.position.y = window.innerHeight - 30
  fps.position.x = window.innerWidth - 50

  Renderer.addToStage(renderer, { graphics: fps })

  return {
    id,
    renderer,
    physics,
    viewport, // TODO: remove this ?
    stage, // TODO: renderer should use this stage (1 stage par state)
    fps,
    inputs: {},
    lastFPS: [],
    entities: [],
  }
}

const update = (state, delta) => {
  const { fps, lastFPS, renderer } = state

  // update fps
  lastFPS.push(1000 / delta)
  if (lastFPS.length > 10) {
    fps.text = lastFPS.reduce((acc, curr) => acc + curr, 0) / lastFPS.length
    state.lastFPS = []
  }

  // update scene based on state
  if (state.id === 'game') Game.update(state, delta)

  // draw
  Renderer.update(renderer)
}

export default {
  create,
  update,
}

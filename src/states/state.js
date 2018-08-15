import { Container, Text } from 'pixi.js'
import Renderer from '../renderer/renderer'
import Game from './game'
import Gameover from './gameover'

const create = (id, { renderer, physics, viewport }) => {
  const fps = new Text('0', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  fps.position.y = window.innerHeight - 30
  fps.position.x = window.innerWidth - 50

  return {
    id,
    renderer,
    physics,
    viewport, // TODO: remove this ?
    fps,
    inputs: {},
    lastFPS: [],
    entities: [],
  }
}

const update = (state, delta) => {
  const { id, fps, lastFPS, renderer } = state

  // update fps
  lastFPS.push(1000 / delta)
  if (lastFPS.length > 10) {
    fps.text = lastFPS.reduce((acc, curr) => acc + curr, 0) / lastFPS.length
    state.lastFPS = []
  }

  // update scene based on state
  let newState
  if (id === 'game') newState = Game.update(state, delta)
  else if (id === 'gameover') newState = Gameover.update(state, delta)

  // draw
  Renderer.update(renderer)

  return newState
}

const prepare = (state) => {
  const { id, renderer, fps } = state

  // create a new state
  renderer.stage = new Container()

  // add to stage
  Renderer.addToStage(renderer, { graphics: fps })

  // call other prepare
  if (id === 'game') Game.prepare(state)
  else if (id === 'gameover') Gameover.prepare(state)
}

export default {
  create,
  prepare,
  update,
}

import { Text } from 'pixi.js'
import Renderer from '../renderer/renderer'
import Game from './game/state'
import Gameover from './gameover/state'
import Welcome from './welcome/state'

const create = (id, renderer, options) => {
  const fps = new Text('0', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 })
  fps.position.y = 30
  fps.position.x = window.innerWidth - 50

  let state
  if (id === 'game') state = Game.create(options)
  if (id === 'gameover') state = Gameover.create(options)
  if (id === 'welcome') state = Welcome.create(options)

  return Object.assign(
    state,
    {
      id,
      renderer,
      fps,
      lastFPS: [],
    },
  )
}

const update = (state, delta) => {
  const { id, fps, lastFPS, renderer } = state

  // update fps
  lastFPS.push(1000 / delta)
  if (lastFPS.length > 10) {
    fps.text = Math.trunc(lastFPS.reduce((acc, curr) => acc + curr, 0) / lastFPS.length)
    state.lastFPS = []
  }

  // update scene based on state
  let newStateId
  if (id === 'game') newStateId = Game.update(state, delta)
  else if (id === 'gameover') newStateId = Gameover.update(state, delta)
  else if (id === 'welcome') newStateId = Welcome.update(state, delta)

  // draw
  Renderer.update(renderer)

  return newStateId
}

const prepare = (state, previous) => {
  const { id, renderer, fps } = state

  // get if touched
  if (previous) state.isTouched = previous.isTouched

  // clear renderer
  Renderer.clear(renderer)

  // add to stage
  Renderer.addToStage(renderer, { graphics: fps })

  // call other prepare
  if (id === 'game') Game.prepare(state, previous)
  else if (id === 'gameover') Gameover.prepare(state, previous)
  else if (id === 'welcome') Welcome.prepare(state, previous)
}

const clear = (state) => {
  const { id } = state

  if (id === 'game') Game.clear(state)
  else if (id === 'gameover') Gameover.clear(state)
  else if (id === 'welcome') Welcome.clear(state)
}

export default {
  create,
  prepare,
  update,
  clear,
}

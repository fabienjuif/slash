import Renderer from './renderer/renderer'
import Game from './states/game'
import Gameover from './states/gameover'
import State from './states/state'

const TEST_PERF = false
const FAST = false || TEST_PERF
const PIXI = true

const worldSize = {
  x: 3200,
  y: 2400,
}

const renderer = Renderer.create(window.innerWidth, window.innerHeight, worldSize.x, worldSize.y, { matter: PIXI ? undefined : physics.engine })

const states = {
  game: Game.create(renderer, { worldSize }),
  gameover: Gameover.create(renderer),
  // TODO: start
}

let previousState
let state = 'game'
let lastLoop = Date.now()
let nbLoops = 0
const start = Date.now()
const loop = () => {
  if (TEST_PERF) {
    if (nbLoops > 1000) {
      const duration = Date.now() - start
      window.alert(`${nbLoops} loops in ${duration}ms => ${duration / nbLoops} ms per loop`)
      return
    }

    nbLoops++
  }

  // loop delta
  const now = Date.now()
  const delta = now - lastLoop
  lastLoop = now

  // prepare next state
  if (previousState !== state) {
    states[state] = State.prepare(states[state], states[previousState])
    previousState = state
  }

  // update current state
  state = State.update(states[state], delta) || state

  // register next loop
  if (FAST) setTimeout(loop, 0)
  else window.requestAnimationFrame(loop)
}
if (FAST) setTimeout(loop, 0)
else window.requestAnimationFrame(loop)

import Renderer from './renderer/renderer'
import Game from './states/game'
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
  // TODO: start
  // TODO: gameover
}

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

  // update current state
  State.update(states[state], delta)

  // register next loop
  if (FAST) setTimeout(loop, 0)
  else window.requestAnimationFrame(loop)
}
if (FAST) setTimeout(loop, 0)
else window.requestAnimationFrame(loop)

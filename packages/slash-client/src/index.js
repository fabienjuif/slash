import Renderer from './renderer/renderer'
import State from './states/state'

const TEST_PERF = false
const FAST = false || TEST_PERF

const worldSize = {
  x: 3200,
  y: 2400,
}

const startGame = () => {
  const splash = window.document.getElementById('splash')
  if (splash) splash.style.zIndex = -10

  // 10 frames...
  // eslint-disable-next-line max-len
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    const renderer = Renderer.create(window.innerWidth, window.innerHeight, worldSize.x, worldSize.y)

    const states = {
      game: State.create('game', renderer, { worldSize }),
      gameover: State.create('gameover', renderer),
      welcome: State.create('welcome', renderer),
      lobby: State.create('lobby', renderer),
    }
    window.slash = { states }

    let previousStateId
    let stateId = 'welcome'
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

        nbLoops += 1
      }

      // loop delta
      const now = Date.now()
      const delta = now - lastLoop
      lastLoop = now

      // prepare next state
      const state = states[stateId]
      if (previousStateId !== stateId) {
        window.slash.stateId = stateId
        const previous = states[previousStateId]

        State.prepare(state, previous)
        if (previous) State.clear(previous)

        previousStateId = stateId
      }

      // update current state
      stateId = State.update(state, delta) || stateId

      // register next loop
      if (FAST) setTimeout(loop, 0)
      else window.requestAnimationFrame(loop)
    }
    if (FAST) setTimeout(loop, 0)
    else window.requestAnimationFrame(loop)
  }))))))))))
}

window.document.getElementById('askFullscreen').onclick = () => {
  if (window.document.body.mozRequestFullscreen) window.document.body.mozRequestFullscreen()
  if (window.document.body.webkitRequestFullscreen) window.document.body.webkitRequestFullscreen()

  window.document.onwebkitfullscreenchange = startGame
  window.document.onmozfullscreenchange = startGame
}

window.document.getElementById('askRegular').onclick = startGame

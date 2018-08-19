import Inputs from './inputs'

const create = () => {
  const inputs = Object.assign(
    Inputs.create('touch'),
    {
      identifiers: {
        stick: undefined,
        shield: undefined,
        jump: undefined,
        enter: undefined,
      },
    }
  )

  const handleStop = (e) => {
    const { changedTouches } = e

    for (let i = 0; i < changedTouches.length; ++i) {
      const { identifier } = changedTouches[i]

      if (inputs.identifiers.shield === identifier) {
        inputs.keys.shield = false
        inputs.identifiers.shield = undefined
      }
      if (inputs.identifiers.jump === identifier) {
        inputs.keys.jump = false
        inputs.identifiers.jump = undefined
      }
      if (inputs.identifiers.stick === identifier) {
        inputs.keys.up = false
        inputs.keys.down = false
        inputs.keys.left = false
        inputs.keys.right = false
        inputs.identifiers.stick = undefined
      }
    }
  }

  const handle = (e) => {
    const { changedTouches } = e

    for (let i = 0; i < changedTouches.length; ++i) {
      const { clientX, clientY, identifier } = changedTouches[i]

      if (inputs.identifiers.shield === undefined || (inputs.identifiers.shield === identifier)) {
        inputs.keys.shield = (
          clientX >= window.innerWidth - 85 &&
          clientX <= window.innerWidth - 5 &&
          clientY >= window.innerHeight - 140 &&
          clientY <= window.innerHeight - 60
        )

        if (inputs.keys.shield) {
          inputs.identifiers.shield = identifier
        }
      }

      if (inputs.identifiers.jump === undefined || (inputs.identifiers.jump === identifier)) {
        inputs.keys.jump = (
          clientX >= window.innerWidth - 150 &&
          clientX <= window.innerWidth - 70 &&
          clientY >= window.innerHeight - 85 &&
          clientY <= window.innerHeight - 5
        )

        if (inputs.keys.jump) {
          inputs.identifiers.jump = identifier
        }
      }

      if (inputs.identifiers.stick === undefined || (inputs.identifiers.stick === identifier)) {
        if (
          clientX >= 5 &&
          clientX <= 210 &&
          clientY >= window.innerHeight - 210 &&
          clientY <= window.innerHeight - 5
        ) {
          inputs.identifiers.stick = identifier

          const relativeX = clientX - 105
          const relativeY = clientY - (window.innerHeight - 105)

          inputs.keys.left = (relativeX < -15)
          inputs.keys.right = (relativeX > 15)
          inputs.keys.down = (relativeY > 15)
          inputs.keys.up = (relativeY < -15)
        } else {
          inputs.keys.up = false
          inputs.keys.down = false
          inputs.keys.left = false
          inputs.keys.right = false
        }
      }
    }
  }

  window.addEventListener('touchstart', handle)
  window.addEventListener('touchmove', handle)
  window.addEventListener('touchend', handleStop)
  window.addEventListener('touchcancel', handleStop)
  window.addEventListener('touchleave', handleStop)

  return Object.assign(
    inputs,
    {
      handle,
      handleStop,
    },
  )
}

const update = () => {}

const clear = (inputs) => {
  const { handle, handleStop } = inputs

  window.removeEventListener('touchstart', handle)
  window.removeEventListener('touchmove', handle)
  window.removeEventListener('touchend', handleStop)
  window.removeEventListener('touchcancel', handleStop)
  window.removeEventListener('touchleave', handleStop)
}

export default {
  create,
  clear,
  update,
}

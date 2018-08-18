// TODO: merge this code with welcome/inputs

const create = () => {
  const inputs = {
    identifiers: {
      stick: undefined,
      shield: undefined,
      jump: undefined,
      enter: undefined,
    },
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      shield: false,
      jump: false,
      enter: false,
    },
  }

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
        inputs.identifiers.stick = undefined
        inputs.keys.up = false
        inputs.keys.down = false
        inputs.keys.left = false
        inputs.keys.right = false
      }
    }
  }

  const handle = (e) => {
    const { changedTouches } = e

    for (let i = 0; i < changedTouches.length; ++i) {
      const { clientX, clientY, identifier } = changedTouches[i]

      if (inputs.identifiers.shield === undefined || (inputs.identifiers.shield === identifier)) {
        inputs.keys.shield = (
          clientX >= window.innerWidth - 55 &&
          clientY >= window.innerHeight - 55 &&
          clientX <= window.innerWidth - 5 &&
          clientY <= window.innerHeight - 5
        )

        if (inputs.keys.shield) {
          inputs.identifiers.shield = identifier
        }
      }

      if (inputs.identifiers.jump === undefined || (inputs.identifiers.jump === identifier)) {
        inputs.keys.jump = (
          clientX >= window.innerWidth - 115 &&
          clientY >= window.innerHeight - 55 &&
          clientX <= window.innerWidth - 65 &&
          clientY <= window.innerHeight - 5
        )

        if (inputs.keys.jump) {
          inputs.identifiers.jump = identifier
        }
      }

      if (inputs.identifiers.stick === undefined || (inputs.identifiers.stick === identifier)) {
        if (
          clientX >= 5 &&
          clientX <= 90 &&
          clientY >= window.innerHeight - 90 &&
          clientY <= window.innerHeight - 5
        ) {
          inputs.identifiers.stick = identifier

          const relativeX = clientX - 50
          const relativeY = clientY - (window.innerHeight - 50)

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
    },
  )
}

const update = (inputs) => {}

const clear = (inputs) => {
  window.removeEventListener('touchstart', inputs.handle)
  window.removeEventListener('touchend', inputs.handle)
  window.removeEventListener('touchleave', inputs.handle)
  window.removeEventListener('touchmove', inputs.handle)
}

export default {
  create,
  clear,
  update,
}

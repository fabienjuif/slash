const create = () => {
  const inputs = {
    type: 'touch',
    keys: {
      enter: false,
    },
  }

  const handleStop = () => {
    inputs.keys.enter = false
  }

  const handle = (e) => {
    const { changedTouches } = e

    for (let i = 0; i < changedTouches.length; ++i) {
      const { clientX, clientY } = changedTouches[i]

      inputs.keys.enter = (
        clientX >= 95 &&
        clientX <= 390 &&
        clientY >= 340 &&
        clientY <= 365
      )
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
}

import jump from './jump.mp3'
import shield from './shield.mp3'

let instance // singleton

const create = () => {
  if (instance) return instance

  const sounds = {
    jump: {
      url: jump,
      volume: 1,
      offset: 1,
      ends: 0.3,
    },
    shield: {
      url: shield,
      volume: 0.2,
      offset: 11.2,
      ends: 0.1,
    },
  }

  const soundContext = new window.AudioContext()

  Object.keys(sounds).forEach((key) => {
    const sound = sounds[key]

    const request = new window.XMLHttpRequest()
    request.open('GET', sound.url, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      soundContext.decodeAudioData(request.response, (newBuffer) => {
        sound.buffer = newBuffer
      })
    }

    request.send()
  })

  instance = {
    sounds,
    soundContext,
  }

  return instance
}

const play = (mixer, name) => {
  const { sounds, soundContext } = mixer
  const { buffer, volume, offset, ends } = sounds[name] || {}

  if (!buffer) return

  const source = soundContext.createBufferSource()
  source.buffer = buffer

  const gain = soundContext.createGain()
  gain.gain.value = volume

  gain.connect(soundContext.destination)
  source.connect(gain)
  source.start(0, offset, ends)
}

export default {
  create,
  play,
}

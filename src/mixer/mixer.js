import jump from './jump.mp3'
import shield from './shield.mp3'

const create = () => {
  const sounds = {
    jump: {
      url: jump,
      volume: 1,
      offset: 1,
      ends: .3,
    },
    shield: {
      url: shield,
      volume: .2,
      offset: 11.2,
      ends: .1,
    },
  }

  const soundContext = new AudioContext()

  Object.keys(sounds).forEach(key => {
    const sound = sounds[key]

    const request = new XMLHttpRequest()
    request.open('GET', sound.url, true)
    request.responseType = 'arraybuffer'

    request.onload = () => {
      soundContext.decodeAudioData(request.response, (newBuffer) => {
        sound.buffer = newBuffer
      })
    }

    request.send()
  })

  return {
    sounds,
    soundContext,
  }
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

import { loader, extras } from 'pixi.js'

// singleton
let instance

const create = () => {
  if (instance) return instance

  instance = {
    loaders: new Map(),
    textures: new Map(),
  }

  return instance
}

const load = (animations, sheetsPaths) => {
  const { textures, loaders } = animations

  return [].concat(sheetsPaths).map((path) => {
    let promise = loaders.get(path)
    if (promise) return promise

    promise = new Promise((resolve) => {
      loader
        .add(path)
        .load(() => {
          const sheet = loader.resources[path].spritesheet

          const regexp = /(.*)(-\d+)/ // sprites should be named `<name>-<frameId>` where <frameId> is a number
          sheet._frameKeys.forEach((key) => { // eslint-disable-line no-underscore-dangle
            // get animation name
            const name = regexp.exec(key)[1]

            // get animation
            let frames = textures.get(name)
            if (frames === undefined) frames = []

            // complete and save animation
            frames.push(sheet.textures[key])
            textures.set(name, frames)
          })

          resolve(path)
        })
    })

    loaders.set(path, promise)

    return promise
  })
}

const asAnimatedSprites = (animations, names) => {
  const { textures } = animations

  const animatedSprites = new Map()

  names.forEach((name) => {
    const animatedSprite = new extras.AnimatedSprite(textures.get(name))
    animatedSprites.set(name, animatedSprite)

    animatedSprite.play() // this is faster to run animations and never stop them
    animatedSprite.visible = false
  })

  return animatedSprites
}

const clear = () => {
  // TODO:
}

export default {
  create,
  load,
  clear,
  asAnimatedSprites,
}

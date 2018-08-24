import { loaders, extras } from 'pixi.js'

// singleton
let instance

const create = () => {
  if (instance) return instance

  instance = {
    promises: new Map(),
    animations: new Map(),
    textures: new Map(),
  }

  return instance
}

const load = (sprites, sheetsPaths, isAnimations = false) => {
  const { animations, promises, textures } = sprites

  return [].concat(sheetsPaths).map((path) => {
    let promise = promises.get(path)
    if (promise) return promise

    promise = new Promise((resolve) => {
      const loader = new loaders.Loader()
      loader
        .add(path)
        .load(() => {
          const sheet = loader.resources[path].spritesheet

          const regexp = /(.*)(-\d+)/ // sprites should be named `<name>-<frameId>` where <frameId> is a number
          sheet._frameKeys.forEach((key) => { // eslint-disable-line no-underscore-dangle
            const texture = sheet.textures[key]
            textures.set(key, texture)

            if (isAnimations) {
              // get animation name
              const name = regexp.exec(key)[1]

              // get animation
              let frames = animations.get(name)
              if (frames === undefined) frames = []

              // complete and save animation
              frames.push(texture)
              animations.set(name, frames)
            }
          })

          resolve(path)
        })
    })

    promises.set(path, promise)

    return promise
  })
}

const asAnimatedSprites = (sprites, names) => {
  const { animations } = sprites

  const animatedSprites = new Map()

  names.forEach((name) => {
    const animatedSprite = new extras.AnimatedSprite(animations.get(name))
    animatedSprites.set(name, animatedSprite)

    animatedSprite.play() // this is faster to run animations and never stop them
    animatedSprite.visible = false
  })

  return animatedSprites
}

const asTilingSprites = (sprites, names) => {
  const { textures } = sprites

  const tilingSprites = new Map()
  let lastTileingSprite;
  [].concat(names).forEach((name) => {
    const texture = textures.get(name)
    lastTileingSprite = new extras.TilingSprite(texture, texture.width, texture.height)
    tilingSprites.set(name, lastTileingSprite)
    lastTileingSprite.visible = true
  })

  return tilingSprites.size === 1 ? lastTileingSprite : tilingSprites
}

const clear = () => {
  // TODO:
}

export default {
  create,
  load,
  clear,
  asAnimatedSprites,
  asTilingSprites,
}

import { Container } from 'pixi.js'
import { Common } from 'matter-js'
import Sprites from '../../../sprites'

const create = ({ width, height }) => {
  const entity = {
    graphics: new Container(),
    drew: false,
  }

  const sprites = Sprites.create()
  Promise
    .all(Sprites.load(sprites, '/static-textures.json', false))
    .then(() => {
      Array
        .from({ length: Math.round(width / 32) })
        .forEach((valueX, indexX) => {
          Array
            .from({ length: Math.round(height / 32) })
            .forEach((valueY, indexY) => {
              const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
                sprites,
                Common.choose([
                  'generic-rpg-tile01',
                  'generic-rpg-tile03',
                  'generic-rpg-tile07',
                  'generic-rpg-tile11',
                  'generic-rpg-tile17',
                  'generic-rpg-tile18',
                  ...Array.from({ length: 400 }).map(() => 'generic-rpg-tile38'),
                ]),
              ))
              sprite.scale = { x: 2, y: 2 }
              sprite.position.x = indexX * 32
              sprite.position.y = indexY * 32
            })
        })

      // cache as bitmap (perf)
      entity.graphics.cacheAsBitmap = true
    })

  return entity
}

const draw = (entity) => {
  const { graphics, drew } = entity

  // already drew once ? Then this is enough since wall are statics
  if (drew) return true
  entity.drew = true

  graphics.position.x = 0
  graphics.position.y = 0

  return true
}

export default {
  create,
  draw,
}

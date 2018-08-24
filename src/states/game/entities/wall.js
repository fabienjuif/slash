import { Container } from 'pixi.js'
import { Bodies, Common } from 'matter-js'
import Sprites from '../../../sprites'

const create = ({ x, y, width, height }) => {
  const entity = {
    graphics: new Container(),
    body: Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true }),
    x,
    y,
    width,
    height,
    drew: false,
  }

  const sprites = Sprites.create()
  Promise
    .all(Sprites.load(sprites, '/static-textures.json', false))
    .then(() => {
      // add them
      // - right
      Array
        .from({ length: Math.round(height / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            Common.choose([
              'generic-rpg-tile47',
              'generic-rpg-tile48',
              'generic-rpg-tile49',
              'generic-rpg-tile50',
            ]),
          ))

          sprite.scale = { x: 2, y: 2 }
          sprite.position.x = width - 32
          sprite.position.y = 32 * index
        })
      // - left
      Array
        .from({ length: Math.round(height / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            Common.choose([
              'generic-rpg-tile10',
              'generic-rpg-tile12',
              'generic-rpg-tile14',
              'generic-rpg-tile16',
            ]),
          ))

          sprite.scale = { x: 2, y: 2 }
          sprite.position.x = 0
          sprite.position.y = 32 * index
        })
      // - top
      Array
        .from({ length: Math.round(height / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            Common.choose([
              'generic-rpg-tile02',
              'generic-rpg-tile06',
              'generic-rpg-tile08',
              'generic-rpg-tile21',
            ]),
          ))

          sprite.scale = { x: 2, y: 2 }
          sprite.position.x = 32 * index
          sprite.position.y = 0
        })
      // - bottom
      Array
        .from({ length: Math.round(height / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            Common.choose([
              'generic-rpg-tile52',
              'generic-rpg-tile53',
              'generic-rpg-tile54',
              'generic-rpg-tile55',
            ]),
          ))

          sprite.scale = { x: 2, y: 2 }
          sprite.position.x = 32 * index
          sprite.position.y = height - 32
        })

      // cache as bitmap (perf)
      entity.graphics.cacheAsBitmap = true
    })

  return entity
}

const draw = (wall) => {
  const { x, y, graphics, drew } = wall

  // already drew once ? Then this is enough since wall are statics
  if (drew) return true
  wall.drew = true

  graphics.position.x = x
  graphics.position.y = y

  return true
}

export default {
  create,
  draw,
}

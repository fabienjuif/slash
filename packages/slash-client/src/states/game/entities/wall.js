import { Container } from 'pixi.js'
import { choose } from 'slash-utils'
import Sprites from '../../../sprites'

const create = (wall) => {
  const entity = Object.assign(
    wall,
    {
      graphics: new Container(),
      drew: false,
    },
  )

  const sprites = Sprites.create()
  Promise
    .all(Sprites.load(sprites, '/static-textures.json', false))
    .then(() => {
      // add them
      // - right
      Array
        .from({ length: Math.round(entity.height / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            choose([
              'generic-rpg-tile47',
              'generic-rpg-tile48',
              'generic-rpg-tile49',
              'generic-rpg-tile50',
            ]),
          ))

          sprite.scale = { x: 2, y: 2 }
          sprite.position.x = entity.width - 32
          sprite.position.y = 32 * index
        })
      // - left
      Array
        .from({ length: Math.round(entity.height / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            choose([
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
        .from({ length: Math.round(entity.width / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            choose([
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
        .from({ length: Math.round(entity.width / 32) })
        .forEach((value, index) => {
          const sprite = entity.graphics.addChild(Sprites.asTilingSprites(
            sprites,
            choose([
              'generic-rpg-tile52',
              'generic-rpg-tile53',
              'generic-rpg-tile54',
              'generic-rpg-tile55',
            ]),
          ))

          sprite.scale = { x: 2, y: 2 }
          sprite.position.x = 32 * index
          sprite.position.y = entity.height - 32
        })

      // cache as bitmap (perf)
      // TODO: cache all layer of walls + grass ?
      entity.graphics.cacheAsBitmap = true
    })

  return entity
}

const draw = (entity) => {
  // already drew once ? Then this is enough since wall are statics
  if (entity.drew) return true
  entity.drew = true

  entity.graphics.position.x = (entity.body.position.x - entity.width / 2)
  entity.graphics.position.y = (entity.body.position.y - entity.height / 2)

  return true
}

export default {
  create,
  draw,
}

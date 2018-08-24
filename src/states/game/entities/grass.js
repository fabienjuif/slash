import { Graphics } from 'pixi.js'
import { Common } from 'matter-js'
import Sprites from '../../../sprites'

const create = ({ width, height }) => {
  const entity = {
    graphics: new Graphics(),
    drew: false,
  }

  entity.graphics.beginFill(0x00b897)
  entity.graphics.drawRect(0, 0, width, height)

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

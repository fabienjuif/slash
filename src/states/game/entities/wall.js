import { Graphics } from 'pixi.js'
import { Bodies } from 'matter-js'

const create = ({ x, y, width, height }) => ({
  graphics: new Graphics(),
  body: Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true }),
  x,
  y,
  width,
  height,
  drew: false,
})

const draw = (wall) => {
  const { x, y, width, height, graphics, drew } = wall

  // already drew once ? Then this is enough since wall are statics
  if (drew) return true
  wall.drew = true

  graphics.clear()
  graphics.lineStyle(0, 0xff00ff)
  graphics.beginFill(0x00ffff)
  graphics.drawRect(x, y, width, height)
  graphics.endFill()

  return true
}

export default {
  create,
  draw,
}

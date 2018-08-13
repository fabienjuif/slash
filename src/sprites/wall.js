import { Graphics } from 'pixi.js'
import { Bodies } from 'matter-js'

const create = (x, y, width, height) => {
  const physics = Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true })
  physics.label = 'wall'

  const graphics = new Graphics()

  return {
    x,
    y,
    width,
    height,
    physics,
    graphics,
  }
}

const drawOne = wall => {
  const { x, y, width, height, graphics } = wall

  graphics.clear()
  graphics.lineStyle(0, 0xff00ff)
  graphics.beginFill(0x00ffff)
  graphics.drawRect(x, y, width, height)
  graphics.endFill()
}

const draw = walls => {
  if (Array.isArray(walls)) return walls.forEach(wall => drawOne(wall))
  return drawOne(wall)
}

export default {
  create,
  draw,
}

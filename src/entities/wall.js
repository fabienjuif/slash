import { Graphics } from 'pixi.js'
import { Bodies } from 'matter-js'
import Entity from './entity'

const create = (x, y, width, height) => {
  const physics = Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true })
  const graphics = new Graphics()

  return Object.assign(
    Entity.create('wall', { graphics, physics }),
    {
      x,
      y,
      width,
      height,
    },
  )
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

const update = () => {}

export default {
  create,
  draw,
  update,
}

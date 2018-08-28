import { Graphics } from 'pixi.js'

const create = ({ inputs }) => ({
  graphics: new Graphics(),
  inputs,
})

const draw = (entity) => {
  const { graphics, inputs } = entity
  const { jump, shield, up, down, left, right } = inputs.keys

  graphics.clear()
  // - shield
  graphics.beginFill(0x42B37F)
  graphics.drawCircle(window.innerWidth - 45, window.innerHeight - 100, shield ? 35 : 40)
  graphics.endFill()
  // - jump
  graphics.beginFill(0xAE2D2D)
  graphics.drawCircle(window.innerWidth - 110, window.innerHeight - 45, jump ? 35 : 40)
  graphics.endFill()
  // - stick (outline)
  graphics.lineStyle(2, 0xffffff)
  graphics.drawCircle(105, window.innerHeight - 105, 100)
  graphics.endFill()
  // - stick (inner)
  graphics.beginFill(0xffffff)
  graphics.drawCircle(105 + (left ? -30 : 0) + (right ? 30 : 0), window.innerHeight - 105 + (up ? -30 : 0) + (down ? 30 : 0), 25)
  graphics.endFill()

  return true
}

export default {
  create,
  draw,
}

import { Bodies } from 'matter-js'

export default (x, y, width, height) => {
  const physics = Bodies.rectangle(x + width / 2, y + height / 2, width, height, { isStatic: true })
  physics.label = 'wall'

  return {
    graphics: {
      x,
      y,
      width,
      height,
    },
    physics,
  }
}

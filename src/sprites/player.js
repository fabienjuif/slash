import { Bodies, Body } from 'matter-js'

export default (x, y, label) => {
  const physics = Bodies.circle(x, y, 40)
  physics.label = label

  return {
    graphics: {
      x,
      y,
    },
    physics,
    shield: Date.now(),
    jump: Date.now(),
    hp: 100,
    dead: undefined,
  }
}

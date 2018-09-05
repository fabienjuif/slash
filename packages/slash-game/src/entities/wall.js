import { Bodies } from 'matter-js'

const create = ({ x, y, width, height }) => ({
  type: 'wall',
  width,
  height,
  body: Bodies.rectangle(
    x,
    y,
    width,
    height,
    {
      isStatic: true,
    },
  ),
})

const getView = wall => Object.assign(
  {},
  wall,
  {
    body: undefined,
    x: wall.body.position.x, // TODO: use `position` like player entity
    y: wall.body.position.y,
  },
)

export default {
  create,
  getView,
}

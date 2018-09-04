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

export default {
  create,
}

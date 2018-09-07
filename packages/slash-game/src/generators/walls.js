import { chance } from 'slash-utils'

const WALL_WIDTH = 100

export const getWall = ({ x = 0, y = 0, width = WALL_WIDTH, height = WALL_WIDTH } = {}) => ({
  x,
  y,
  width,
  height,
})

export default ({ width, height }) => {
  const walls = []

  // walls
  // - outside the level
  walls.push({ x: width / 2, y: WALL_WIDTH / 2, width: width - (2 * WALL_WIDTH), height: WALL_WIDTH }) // top
  walls.push({ x: WALL_WIDTH / 2, y: height / 2, height, width: WALL_WIDTH }) // left
  walls.push({ x: width + (WALL_WIDTH / -2), y: height / 2, height, width: WALL_WIDTH }) // right
  walls.push({ x: width / 2, y: height - (WALL_WIDTH / 2), width: width - (2 * WALL_WIDTH), height: WALL_WIDTH }) // bottom

  // - inside the level
  for (let i = 1; i < (width / WALL_WIDTH) - 1; i += 1) {
    for (let j = 1; j < (height / WALL_WIDTH) - 1; j += 1) {
      if (chance(10)) {
        walls.push({ x: (i * WALL_WIDTH) + (WALL_WIDTH / 2), y: (j * WALL_WIDTH) + (WALL_WIDTH / 2) })
      }
    }
  }

  return walls.map(getWall)
}

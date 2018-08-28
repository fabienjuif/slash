import { chance } from 'slash-utils'

const WALL_WIDTH = 100

export const getWall = ({ x = 0, y = 0, width = WALL_WIDTH, height = WALL_WIDTH } = {}) => ({
  x,
  y,
  width,
  height,
})

export const getWalls = (worldSize) => {
  const walls = []

  // walls
  // - outside the level
  walls.push({ width: worldSize.x })
  walls.push({ height: worldSize.y })
  walls.push({ x: (worldSize.x - WALL_WIDTH), height: worldSize.y })
  walls.push({ y: (worldSize.y - WALL_WIDTH), width: worldSize.x })

  // - inside the level
  for (let i = 0; i < worldSize.x / WALL_WIDTH; i += 1) {
    for (let j = 0; j < worldSize.y / WALL_WIDTH; j += 1) {
      if (chance(10)) {
        walls.push({ x: (i * WALL_WIDTH), y: (j * WALL_WIDTH) })
      }
    }
  }

  return walls.map(getWall)
}

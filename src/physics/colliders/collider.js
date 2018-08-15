import Player from './player'

const collides = (physics, pair, entityA, entityB) => {
  if (entityA.type === 'player') Player.collides(physics, pair, entityA, entityB)
  // we don't need to handle wall collision
}

export default {
  collides: (physics, pair, entityA, entityB) => {
    collides(physics, pair, entityA, entityB)
    collides(physics, pair, entityB, entityA)
  }
}

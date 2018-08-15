import { World, Pair } from 'matter-js'
import Skill from '../../skills/skill'

const collides = (physics, pair, entityA, entityB) => {
  // if other entity is not a player, it does nothing
  if (entityB.type !== 'player') return

  // entityA is the slasher
  if (Skill.isChanneling(entityA.skills.jump) && !Skill.isChanneling(entityB.skills.shield)) {
    // inactive so both bodies can pass through
    Pair.setActive(pair, false)

    // someone that sucessfully touch an other player get a jump that last longer
    // FIXME: don't mutate object
    entityA.skills.jump.until += 100
  }

  // entityB is the slasher
  if (Skill.isChanneling(entityB.skills.jump) && !Skill.isChanneling(entityA.skills.shield)) {
    entityA.hp -= 20 // FIXME: don't mutate object
    if (entityA.hp <= 0) {
      Skill.trigger(entityA.skills.dead)
      World.remove(physics.engine.world, entityA.body)
    }
  }
}

export default {
  collides,
}

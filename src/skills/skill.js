const create = (id, { cooldown, last }) => {
  return {
    id,
    cooldown,
    last,
    next: Date.now() - cooldown * 2,
    until: Date.now() - cooldown * 2,
  }
}

const trigger = skill => {
  const { cooldown, next, last } = skill

  if (next >= Date.now()) return skill

  skill.next = Date.now() + cooldown
  skill.until = Date.now() + last

  return skill
}

export default {
  create,
  trigger,
  isCooldown: skill => skill.next > Date.now(),
  isChanneling: skill => skill.until > Date.now(),
}

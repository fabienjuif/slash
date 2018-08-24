import Mixer from './mixer/mixer'

const create = (id, { cooldown, last }) => ({
  id,
  cooldown,
  last,
  mixer: Mixer.create(),
  since: Date.now(),
  next: Date.now() - cooldown * 2,
  until: Date.now() - cooldown * 2,
})

const trigger = (skill) => {
  const { cooldown, next, last, mixer, id } = skill

  if (next >= Date.now()) return skill

  skill.since = Date.now()
  skill.next = Date.now() + cooldown
  skill.until = Date.now() + last

  Mixer.play(mixer, id)

  return skill
}

export default {
  create,
  trigger,
  isCooldown: skill => skill.next > Date.now(),
  isChanneling: skill => skill.until > Date.now(),
}

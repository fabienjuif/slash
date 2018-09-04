// TODO: use `update` method and count time with it
// so we can pause game

const create = (id, { cooldown, last }) => ({
  id,
  cooldown,
  last,
  since: Date.now(),
  next: Date.now() - cooldown * 2,
  until: Date.now() - cooldown * 2,
})

const trigger = (timer) => {
  const { cooldown, next, last } = timer

  if (next >= Date.now()) return timer

  timer.since = Date.now()
  timer.next = Date.now() + cooldown
  timer.until = Date.now() + last

  return timer
}

export default {
  create,
  trigger,
  isCooldown: timer => timer.next > Date.now(),
  isChanneling: timer => timer.until > Date.now(),
}

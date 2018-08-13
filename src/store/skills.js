import { when } from 'k-ramel'

const getSkill = (id, cooldown) => ({
  id,
  cooldown,
  next: Date.now(),
  running: false,
  interval: 0,
})

const onKeyDown = name => ({ type, payload }) => type === '@@krf/UPDATE>INPUTS' && payload[name] === true
const onKeyUp = name => ({ type, payload }) => type === '@@krf/UPDATE>INPUTS' && payload[name] === false

const trigger = skillName => (action, store) => {
  let { interval, id, cooldown } = store.skills.get(skillName)
  if (interval) return

  const _trigger = () => {
    const input = store.inputs.get()[skillName]
    const { next, running } = store.skills.get(skillName)

    // don't trigger skill on theses cases
    if (
      // on cooldown
      next > Date.now() ||
      // key is not pressed anymore
      !input ||
      // skill is still running
      running
    )
      return

    // start skill cooldown
    store.skills.update({ id, running: true, next: Date.now() + cooldown })
  }
  _trigger()

  interval = setInterval(_trigger, cooldown + 10)

  store.skills.update({ id, interval })
}

const release = skillName => (action, store) => {
  const { id, interval } = store.skills.get(skillName)
  if (interval) clearInterval(interval)
  store.skills.update({ id, interval: 0 })
}

export default store => {
  store.skills.add(getSkill('jump', 1000))
  store.skills.add(getSkill('shield', 10))

  const skills = store.skills.getKeys()
  const listeners = []

  skills.forEach(skillName => {
    listeners.push(when(onKeyDown(skillName))(trigger(skillName)))
    listeners.push(when(onKeyUp(skillName))(release(skillName)))
  })

  store.listeners.add(listeners)
}

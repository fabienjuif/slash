import { Text } from 'pixi.js'
import Timer from '../../../timer'

const create = ({ player }) => ({
  graphics: new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }),
  player,
})

const draw = (entity) => {
  const { player, graphics } = entity
  const { inputs, timers } = player
  const { bindings } = inputs

  const print = ['jump', 'shield'].map((timerName) => {
    const timer = timers[timerName]
    const cooldown = Timer.isCooldown(timer) ? `${timer.next - Date.now()}`.padStart(7, ' ') : 'ready !'

    const bindTxt = ` (${String.fromCharCode(bindings[timerName].keyCode)})`
    return `${timerName}${bindTxt}: ${cooldown}`
  })
  print.push(`${Math.floor(player.hp)} HP`)
  graphics.text = print.join(' | ')

  return true
}

export default {
  create,
  draw,
}

import { Text } from 'pixi.js'
import Skill from '../skill'

const create = ({ player }) => ({
  graphics: new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }),
  player,
})

const draw = (ui) => {
  const { player, graphics } = ui
  const { inputs, skills } = player
  const { bindings } = inputs

  const print = ['jump', 'shield'].map((skillName) => {
    const skill = skills[skillName]
    const cooldown = Skill.isCooldown(skill) ? `${skill.next - Date.now()}`.padStart(7, ' ') : 'ready !'

    const bindTxt = ` (${String.fromCharCode(bindings[skillName].keyCode)})`
    return `${skillName}${bindTxt}: ${cooldown}`
  })
  print.push(`${Math.floor(player.hp)} HP`)
  graphics.text = print.join(' | ')

  return true
}

const clear = (ui) => {
  const { graphics } = ui

  graphics.destroy({ children: true, texture: true })
}

export default {
  collides: () => {},
  update: () => true,
  create,
  draw,
  clear,
}

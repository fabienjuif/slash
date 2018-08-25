import { Container, Graphics } from 'pixi.js'

const create = ({ player }) => {
  const graphics = new Container()

  const lifebar = graphics.addChild(new Graphics())
  lifebar.name = 'lifebar'

  const jump = graphics.addChild(new Graphics())
  jump.name = 'jump'

  const shield = graphics.addChild(new Graphics())
  shield.name = 'shield'

  return {
    graphics,
    player,
  }
}
const draw = (entity) => {
  const { graphics, player } = entity
  const { hp, timers } = player

  // lifebar
  const lifebar = graphics.getChildByName('lifebar')
  lifebar.clear()
  lifebar.lineStyle(1, 0x734C4C, 1, 1)
  lifebar.beginFill(0xDE1414, 0.2)
  lifebar.drawRect(300, window.innerHeight - 20, window.innerWidth - 600, 15)
  lifebar.endFill()
  lifebar.lineStyle(0)
  lifebar.beginFill(0xDE1414)
  lifebar.drawRect(300, window.innerHeight - 20, (window.innerWidth - 600) * (hp / 100), 15)
  lifebar.endFill()

  // jump
  const half = ((window.innerWidth - 600) / 2) - 3
  const percent = timer => Math.min(
    (1 - ((timer.next - Date.now()) / timer.cooldown)),
    1,
  )
  const jump = graphics.getChildByName('jump')
  jump.clear()
  jump.lineStyle(1, 0x213e82, 1, 1)
  jump.beginFill(0x3860bf, 0.2)
  jump.drawRect(300, window.innerHeight - 40, half, 15)
  jump.endFill()
  jump.lineStyle(0)
  jump.beginFill(0x3860bf)
  jump.drawRect(300, window.innerHeight - 40, (half * percent(timers.jump)), 15)
  jump.endFill()
  // - shield
  const shield = graphics.getChildByName('shield')
  shield.clear()
  shield.lineStyle(1, 0xd4d265, 1, 1)
  shield.beginFill(0xf7d61f, 0.2)
  shield.drawRect(300 + half + 6, window.innerHeight - 40, half, 15)
  shield.endFill()
  shield.lineStyle(0)
  shield.beginFill(0xf7d61f)
  shield.drawRect(300 + half + 6, window.innerHeight - 40, half * percent(timers.shield), 15)
  shield.endFill()


  return true
}

export default {
  create,
  draw,
}

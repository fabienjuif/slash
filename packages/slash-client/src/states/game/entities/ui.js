import { Container, Graphics, Text } from 'pixi.js'

const getTimerFromDiff = (diff) => {
  let remaining = diff

  const minutes = Math.floor(remaining / (60 * 1000))
  remaining -= (minutes * 60 * 1000)

  const seconds = Math.floor(remaining / 1000)
  remaining -= (seconds * 1000)

  const milliseconds = Math.floor(remaining / 10)
  remaining -= (milliseconds * 10)

  const pad = number => `${number}`.padStart(2, '0')

  return `${pad(minutes)}:${pad(seconds)}:${pad(milliseconds)}`
}

const create = ({ player, game, server }) => {
  const graphics = new Container()

  const timer = graphics.addChild(new Container())
  timer.name = 'timer'
  const timerBackground = timer.addChild(new Graphics())
  timerBackground.beginFill(0, 0.2)
  timerBackground.drawRect(0, 0, 120, 30)
  timerBackground.endFill()
  timer.position.x = window.innerWidth - 130
  timer.position.y = 10
  const timerText = timer.addChild(new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
  timerText.name = 'text'
  timerText.position.x = 10
  timerText.position.y = 5

  if (server) {
    const ping = graphics.addChild(new Container())
    ping.name = 'ping'
    const pingBackground = ping.addChild(new Graphics())
    pingBackground.beginFill(0, 0.2)
    pingBackground.drawRect(0, 0, 120, 30)
    pingBackground.endFill()
    ping.position.x = window.innerWidth - 130
    ping.position.y = 42
    const pingText = ping.addChild(new Text('', { fill: 'white', fontFamily: 'Courier New', fontSize: 20 }))
    pingText.name = 'text'
    pingText.position.x = 10
    pingText.position.y = 5
  }

  const lifebar = graphics.addChild(new Graphics())
  lifebar.name = 'lifebar'

  const jump = graphics.addChild(new Graphics())
  jump.name = 'jump'

  const shield = graphics.addChild(new Graphics())
  shield.name = 'shield'

  return {
    graphics,
    player,
    game,
    server,
  }
}

const draw = (entity) => {
  const { graphics, player, game, server } = entity
  const { hp, timers } = player

  // timer
  const timer = graphics.getChildByName('timer').getChildByName('text')
  timer.text = getTimerFromDiff(Date.now() - game.start)

  // ping
  if (server) {
    const ping = graphics.getChildByName('ping').getChildByName('text')
    ping.text = `${server.latency} ms`.padStart(8, ' ')
  }

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
  const percent = ({ next, cooldown }) => Math.min(
    (1 - ((next - Date.now()) / cooldown)),
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

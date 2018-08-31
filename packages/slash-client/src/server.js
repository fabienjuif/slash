import io from 'socket.io-client'

const create = () => {
  const server = {
    socket: io.connect(),
    token: undefined,
    game: undefined,
    player: undefined,
    players: [], // player without the local one
    playerByName: new Map(),
    framesSinceLastUpdate: 0,
  }

  server.socket.on('token>get', () => {
    server.token = window.localStorage.getItem('slash_token')
    server.socket.emit('token>set', server.token)
  })

  server.socket.on('token>set', (token) => {
    window.localStorage.setItem('slash_token', token)
    server.token = token
  })

  server.socket.on('game>set', (data) => {
    server.game = data

    server.player = server.game.players.find(player => player.name === server.token)
    server.players = server.game.players.filter(player => player !== server.player)

    server.game.players.forEach((player) => {
      server.playerByName.set(player.name, player)
    })
  })

  server.socket.on('player>add', (data) => {
    server.playerByName.set(data.name, data)
    if (data.name !== server.token) server.players.push(data)
    else server.player = data
  })

  server.socket.on('game>started', () => {
    server.game.started = true
  })

  server.socket.on('game>sync', (game) => {
    server.synced = false

    const { players } = game
    players.forEach((player) => {
      Object.assign(
        server.playerByName.get(player.name),
        player,
      )
    })

    server.synced = true
  })

  return server
}

const update = (server, entity) => {
  server.socket.emit(
    'sync>player',
    {
      position: entity.body.position,
      hp: entity.hp,
      keys: entity.inputs.keys,
    },
  )
}

const emit = (server, type, payload) => {
  server.socket.emit(type, payload)
}

const clear = (server) => {
  server.socket.disconnect()
  window.localStorage.removeItem('slash_token')
}

export default {
  create,
  update,
  emit,
  clear,
}

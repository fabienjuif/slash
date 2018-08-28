import io from 'socket.io-client'

const create = () => {
  const server = {
    socket: io.connect(),
    token: undefined,
    game: undefined,
    players: [], // player without the local one
    playerByName: new Map(),
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

    server.players = server.game.players.filter(player => player.name !== server.token)

    server.game.players.forEach((player) => {
      server.playerByName.set(player.name, player)
    })
  })

  server.socket.on('player>add', (data) => {
    server.game.players.push(data)
    server.playerByName.set(data.name, data)
    if (data.name !== server.token) server.players.push(data)
  })

  server.socket.on('game>started', () => {
    server.game.started = true
  })

  server.socket.on('key>set', (data) => {
    const { name, code, after } = data
    // TODO: make sure all references are updated?...
    server.playerByName.get(name).keys[code] = after
  })

  return server
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
  emit,
  clear,
}

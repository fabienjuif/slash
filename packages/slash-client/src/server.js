import io from 'socket.io-client'

const create = () => {
  const server = {
    socket: io.connect(),
    token: undefined,
    game: undefined,
    responded: true,
    latencyHistory: [],
    latency: 0,
  }

  server.socket.on('pong', (ms) => {
    // use 10 frames for latency smoothing
    server.latencyHistory.push(ms)
    if (server.latencyHistory.length >= 10) server.latencyHistory.shift()

    // latency
    server.latency = Math.round(server.latencyHistory.reduce((acc, curr) => acc + curr, 0) / server.latencyHistory.length)
  })

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
  })

  server.socket.on('game>started', () => {
    server.game.started = true
  })

  const sync = (game) => {
    Object.assign(server.game, game)
    server.responded = true
  }

  server.socket.on('game>sync', sync)
  server.socket.on('game>ended', sync)

  return server
}

const update = (server, inputs) => {
  server.socket.binary(false).emit(
    'sync>player',
    {
      keys: inputs.keys,
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

const getPlayer = (server, name) => server.playerByName.get(name)

export default {
  create,
  update,
  emit,
  clear,
  getPlayer,
}

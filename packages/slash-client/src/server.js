import io from 'socket.io-client'

const create = () => {
  const server = {
    socket: io.connect(),
    token: undefined,
    game: undefined,
    synchronized: false,
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
  })

  server.socket.on('game>started', () => {
    server.game.started = true
  })

  let nb = 0
  const sync = (game) => {
    if (server.synchronized) return

    Object.assign(server.game, game)
    if (nb === 10) console.log(game)
    nb += 1

    server.synchronized = false
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
const isSynchronized = server => server.synchronized
const synchronize = (server) => {
  server.synchronized = false
}

export default {
  create,
  update,
  emit,
  clear,
  getPlayer,
  isSynchronized,
  synchronize,
}

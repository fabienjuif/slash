import io from 'socket.io-client'

const create = () => {
  const server = {
    socket: io.connect(),
    token: undefined,
    players: [],
  }

  server.socket.on('token>get', () => {
    server.token = window.localStorage.getItem('slash_token')
    server.socket.emit('token>set', server.token)
  })

  server.socket.on('token>set', (token) => {
    window.localStorage.setItem('slash_token', token)
    server.token = token
  })

  return server
}

const clear = (server) => {
  server.socket.disconnect()
}

export default {
  create,
  clear,
}

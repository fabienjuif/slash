import Game from 'slash-game'

const create = ({ socket, token }) => ({
  token,
  socket,
  game: undefined,
  player: undefined,
  synchronized: true,
  isReady: false,
})

const setPlayerAndGame = (client, player, game) => {
  client.game = game
  client.player = player
}

const emitLobby = (client) => {
  client.socket.binary(false).emit('lobby>sync', Game.getInitView(client.game))
}

const emitStart = (client) => {
  client.socket.binary(false).emit('game>set', Game.getInitView(client.game))
  client.socket.binary(false).emit('game>started', { id: client.game.id })
}

const emitGameOver = (client) => {
  client.socket.binary(false).emit('game>ended', Game.getView(client.game))
}

const emitSync = (client) => { // TODO: use volatile messages ?
  if (client.synchronized) return

  client.socket.binary(false).emit('game>sync', Game.getView(client.game))
  client.synchronized = true
}

const listenSync = (client) => {
  client.socket.on('sync>player', (inputs) => {
    if (!client.synchronized) return

    Object.assign(client.player.inputs, inputs)
    client.synchronized = false
  })
}

const listenReady = (client) => {
  client.socket.on('ready>set', () => {
    console.log(client.token, 'is ready')
    client.isReady = true
  })
}

export default {
  create,
  setPlayerAndGame,
  emitLobby,
  emitStart,
  emitGameOver,
  emitSync,
  listenSync,
  listenReady,
}

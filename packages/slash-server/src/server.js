import Koa from 'koa'
import serve from 'koa-static'
import http from 'http'
import server from 'socket.io'
import uuid from 'uuid/v1' // TODO: use JWT instead
import Game from 'slash-game'

module.exports = (printDebug) => {
  const PORT = process.env.PORT || 3000
  const PWD = process.env.PWD // eslint-disable-line prefer-destructuring

  const koa = new Koa()
  const app = http.createServer(koa.callback())
  const io = server(app)
  const servePath = `${PWD}/../slash-client/dist`

  koa.use(serve(servePath))

  app.listen(PORT, () => {
    const { address, port, family } = app.address()
    if (printDebug) {
      console.log(`Listening on ${address} (${family}) on port ${port}`)
      console.log(`Serving ${servePath}`)
    }
  })

  let games = []
  let waitingGame = null
  const clientsBySocketId = new Map()
  const clientsByToken = new Map()

  io.on('connection', (socket) => {
    let client = { socket }
    console.log(`👋 | ????????-????-????-????-???????????? | ${client.socket.id}`)

    socket.on('token>set', (token) => {
      client = clientsByToken.get(token)
      if (!client) client = { token: uuid(), socket }

      client.socket = socket
      client.lastConnection = Date.now()
      client.synchronized = true

      const isNewClient = !clientsByToken.has(client.token)
      if (isNewClient) {
        console.log(`🎉 | ${client.token} | ${client.socket.id}`)
      } else {
        console.log(`🤝 | ${client.token} | ${client.socket.id}`)
      }

      clientsBySocketId.set(socket.id, client)
      clientsByToken.set(client.token, client)

      socket.emit('token>set', client.token)

      // get a game for this player
      if (isNewClient) { // TODO: handle reconnection
        if (!waitingGame) waitingGame = Game.create({ width: 1000, height: 1000 })
        client.game = waitingGame
        client.player = { id: client.token, inputs: { keys: {} }, position: { x: 200 + (client.game.players.length * 600), y: 200 + (client.game.players.length * 600) } }
        client.player = Game.addPlayer(client.game, client.player)
        client.player.client = client

        // start the game if all players are here
        if (client.game.players.length === 2) {
          waitingGame = undefined
          client.game.started = true // TODO: move it to slash-game
          client.game.start = Date.now() // TODO: move it to slash-game
          games.push(client.game)

          client.game.players.forEach((player) => {
            if (player.client.socket) {
              player.client.socket.binary(false).emit('game>set', Game.getInitView(client.game))
              player.client.socket.binary(false).emit('game>started', { id: client.game.id })
            }
          })

          client.game.interval = setInterval(
            () => {
              // update game
              if (Game.update(client.game, 1000 / 60) === 'gameover') { // TODO: don't hardcode delta
                games = games.filter(game => game !== client.game)

                client.game.ended = true
                client.game.players.forEach((player) => {
                  if (player.client.socket) {
                    player.client.socket.binary(false).emit('game>sync', Game.getView(client.game))
                  }
                })

                clearInterval(client.game.interval)
                console.log(`🚀 | ${games.length} games`)
              }

              // if game continues, send them to client that ask for it
              client.game.players.forEach((player) => {
                if (player.client.socket && !player.client.synchronized) {
                  player.client.socket.binary(false).emit('game>sync', Game.getView(client.game))
                  player.client.synchronized = true
                }
              })
            },
            1000 / 60, // 60 "FPS"
          )

          // try to free some memory
          if (games.length > 5) {
            games = games.filter((game) => {
              if ((game.start + 1200000 /* 20 min */) < Date.now()) {
                console.log(`💀 | timeout on game ${game.id}`)
                return false
              }

              return true
            })
          }
          console.log(`🚀 | ${games.length} games`)
        }
      } else {
        console.log(`🤗 | ${client.token} comes back to ${client.game.id} game`)
        client.socket.binary(false).emit('game>set', Game.getInitView(client.game))
        client.socket.binary(false).emit('game>started', { id: client.game.id })
      }
    })

    socket.on('sync>player', (inputs) => {
      if (!client.synchronized) return

      Object.assign(client.player.inputs, inputs)
      client.synchronized = false
    })

    socket.on('disconnect', () => {
      client.socket = undefined

      setTimeout(
        () => {
          if (!client.socket) {
            clientsByToken.delete(client.token)
            console.log(`💀 | ${client.token}`)
          }
        },
        2000,
      )

      console.log(`😨 | ${client.token} | ${socket.id}`)
      clientsBySocketId.delete(socket.id)
    })

    socket.emit('token>get')
  })

  return app
}

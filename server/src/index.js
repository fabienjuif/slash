const Koa = require('koa')
const serve = require('koa-static')
const http = require('http')
const server = require('socket.io')
const uuid = require('uuid/v1') // TODO: use JWT instead

const PORT = process.env.PORT || 3000
const PWD = process.env.PWD // eslint-disable-line prefer-destructuring

const koa = new Koa()
const app = http.createServer(koa.callback())
const io = server(app)

koa.use(serve(`${PWD}/dist`))

app.listen(PORT, () => {
  const { address, port, family } = app.address()
  console.log(`Listening on ${address} (${family}) on port ${port}`)
})

const games = [] // TODO: care memory leak
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
      if (!waitingGame) waitingGame = { id: uuid(), players: [] }
      client.game = waitingGame
      client.player = { name: client.token, client, keys: {} }
      socket.emit('game>set', { id: client.game.id, players: client.game.players.map(player => Object.assign({}, player, { client: undefined })) })

      // tells everybody that new player is here
      client.game.players.push(client.player)
      client.game.players.forEach((player) => {
        player.client.socket.emit('player>add', Object.assign({}, client.player, { client: undefined }))
      })

      // start the game if all players are here
      if (waitingGame.players.length === 2) {
        waitingGame.started = true
        games.push(waitingGame)
        const { id } = waitingGame
        client.game.players.forEach((player) => {
          player.client.socket.emit('game>started', { id })
        })
        waitingGame = undefined
      }
    }
  })

  socket.on('key>set', (key) => {
    const { code, after } = key

    // update locally
    client.player.keys[code] = after

    // tells everyone
    const { name } = client.player
    client.game.players.forEach((player) => {
      if (player.client.token === client.token) return

      player.client.socket.emit('key>set', { name, code, after })
    })
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

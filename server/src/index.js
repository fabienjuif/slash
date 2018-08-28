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

    if (clientsByToken.has(client.token)) {
      console.log(`🤝 | ${client.token} | ${client.socket.id}`)
    } else {
      console.log(`🎉 | ${client.token} | ${client.socket.id}`)
    }

    clientsBySocketId.set(socket.id, client)
    clientsByToken.set(client.token, client)

    socket.emit('token>set', client.token)
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

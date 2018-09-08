import Koa from 'koa'
import serve from 'koa-static'
import http from 'http'
import server from 'socket.io'
import uuid from 'uuid/v1' // TODO: use JWT instead
import Instance from './instance'

module.exports = (printDebug) => {
  const PORT = process.env.PORT || 3000
  const PWD = process.env.PWD // eslint-disable-line prefer-destructuring

  const koa = new Koa()
  const app = http.createServer(koa.callback())
  const io = server(app, { pingInterval: 200 })
  const servePath = `${PWD}/../slash-client/dist`

  koa.use(serve(servePath))

  app.listen(PORT, () => {
    const { address, port, family } = app.address()
    if (printDebug) {
      console.log(`👂 | ${address} (${family}) | port: ${port}`)
    }
  })

  let instance = Instance.create()
  let instances = []
  const tokens = new Map()

  io.on('connection', (socket) => {
    let user = { socket }
    console.log(`👋 | ????????-????-????-????-???????????? | ${user.socket.id}`)

    socket.on('token>set', (token) => {
      // attach token to socket --> this is a user
      user = tokens.get(token)
      const knownUser = !!user
      if (knownUser) {
        user.socket = socket
        console.log(`🤝 | ${user.token} | ${user.socket.id}`)
      } else {
        user = { token: uuid(), socket, lastConnection: Date.now() }
        tokens.set(user.token, user)
        console.log(`🎉 | ${user.token} | ${user.socket.id}`)
      }
      socket.emit('token>set', user.token)

      // add the user to the current instance --> it becomes a client
      // TODO: attach to its previous instance (handle reconnection)
      if (knownUser) Instance.addClient(user.instance, user)
      else {
        Instance.addClient(instance, user)
        user.instance = instance
      }

      // start the game if not already started
      if (Instance.startGameIfReady(instance)) {
        instances = instances.concat(instance).filter((currentInstance) => {
          if (currentInstance.game.ended) return false
          if ((currentInstance.game.start + 1200000 /* 20 min */) < Date.now()) {
            console.log(`💀 | timeout on game ${currentInstance.game.id}`)
            return false
          }

          return true
        })
        instance = Instance.create()

        console.log(`🚀 | ${instances.length} running`)
      }
    })

    socket.on('disconnect', () => {
      user.socket = undefined

      setTimeout(
        () => {
          if (!user.socket) {
            tokens.delete(user.token)
            console.log(`💀 | ${user.token}`)
          }
        },
        2000,
      )

      console.log(`😨 | ${user.token} | ${socket.id}`)
    })

    socket.emit('token>get')
  })

  return app
}

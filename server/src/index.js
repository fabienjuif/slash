const Koa = require('koa')
const serve = require('koa-static')
const http = require('http')
const server = require('socket.io')

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

io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })
  socket.on('my other event', (data) => {
    console.log(data)
  })
})

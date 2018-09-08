import Game from 'slash-game'
import Client from './client'

const create = () => ({
  game: Game.create({ width: 1000, height: 1000 }),
  clients: [],
  interval: undefined,
})

const addClient = (instance, { socket, token }) => {
  // create client
  const client = Client.create({ socket, token })

  // add client
  instance.clients.push(client)

  // find a player to the client
  let player
  if (instance.game.started) {
    // - this is a reconnexion case, we find the player matching the client toker
    player = instance.game.players.find(currentPlayer => currentPlayer.id === client.token)
  } else {
    // - this is a new game case, we create a player for this client
    player = Game.addPlayer(
      instance.game,
      {
        id: client.token,
        inputs: {
          keys: {},
        },
        position: {
          x: 200 + (instance.game.players.length * 600),
          y: 200 + (instance.game.players.length * 600),
        },
      },
    )
  }

  // attach player to the client // TODO: should we attach instance to player instead ?
  Client.setPlayerAndGame(client, player, instance.game)

  // listen to events
  Client.listenSync(client)

  // if the game is already started, then this is a reconnection
  // we re-emit 'start' to it
  if (instance.game.started) Client.emitStart(client)
}

const stop = (instance) => {
  if (instance.interval !== undefined) clearInterval(instance.interval)

  // set gameover to clients
  instance.game.ended = true // TODO: don't mutate game here
  instance.clients.forEach(Client.emitGameOver)
}

const update = (instance) => {
  // remove disconnected clients
  // they can be re-attached after by the server if needed
  instance.clients = instance.clients.filter(client => !client.socket.disconnected)

  // update game
  const gameState = Game.update(instance.game, 1000 / 60) // TODO: don't hardcode delta

  // end loop -> gameover ?
  if (gameState === 'gameover') {
    stop(instance)
  } else {
    instance.clients.forEach(Client.emitSync)
  }
}

const start = (instance) => {
  // send notification to all players
  instance.clients.forEach(Client.emitStart)

  // loop
  instance.game.interval = setInterval(() => update(instance), 1000 / 60) // 60 "FPS"
}


const startGameIfReady = (instance) => {
  // not ready
  if (instance.clients.length < 2) return false

  // already started
  if (instance.game.started) return false

  // start the game
  instance.game.started = true // TODO: move it to slash-game
  instance.game.start = Date.now() // TODO: move it to slash-game
  start(instance)
  return true
}

export default {
  create,
  stop,
  update,
  start,
  addClient,
  startGameIfReady,
}

import Game from 'slash-game'
import Client from './client'

const create = () => ({
  game: Game.create({ width: 10, height: 10 }), // create a fake game for lobby
  clients: [],
  intervals: [],
})

const addClient = (instance, { socket, token }) => {
  // remove disconnected clients
  // TODO: make it a self function
  instance.clients = instance.clients.filter(client => !client.socket.disconnected)

  // create client
  const client = Client.create({ socket, token })

  // add client
  instance.clients.push(client)

  // find a player to the client
  let player
  if (!instance.game.ended) {
    // - this is a reconnexion case, we find the player matching the client toker
    player = instance.game.players.find(currentPlayer => currentPlayer.id === client.token)
  }

  // - the player is not found (could be a new game, or a reconnexion past an ended game)
  if (!player) {
    player = Game.addPlayer(
      instance.game,
      {
        id: client.token,
        inputs: {
          keys: {},
        },
      },
    )
  }

  // attach player to the client // TODO: should we attach instance to player instead ?
  Client.setPlayerAndGame(client, player, instance.game)

  instance.clients.forEach(Client.emitLobby)

  // listen to events
  Client.listenReady(client)
  Client.listenSync(client)

  // if the game is already started, then this is a reconnection
  // we re-emit 'start' to it
  if (instance.game.started) Client.emitStart(client)
}

const stop = (instance) => {
  instance.intervals.forEach(clearInterval)

  // set gameover to clients
  instance.game.ended = true // TODO: don't mutate game here
  instance.clients.forEach(Client.emitGameOver)
}

const updateGame = (instance) => {
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

const startGame = (instance) => {
  // send notification to all players
  instance.clients.forEach(Client.emitStart)

  // loop
  instance.intervals.push(setInterval(() => updateGame(instance), 1000 / 60)) // 60 "FPS"
}

const run = (instance) => {
  // already started
  if (instance.game.started) return

  // wait for user to be ready
  const waitInterval = setInterval(
    () => {
      if (!instance.clients.find(client => !client.isReady) && instance.clients.length > 0) {
        // remove interval
        clearInterval(waitInterval)

        // start game
        // -- recreate a game
        Game.generateRing(instance.game)
        instance.game.started = true // TODO: move it to slash-game
        instance.game.start = Date.now() // TODO: move it to slash-game
        startGame(instance)
      }
    },
    200,
  )
  instance.intervals.push(waitInterval)
}

export default {
  create,
  stop,
  updateGame,
  startGame,
  addClient,
  run,
}

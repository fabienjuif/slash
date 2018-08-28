import chokidar from 'chokidar'

const watcher = chokidar.watch(['.', '../node_modules'])

let server = require('./server')(true)

if (process.env.NODE_ENV === 'development') {
  console.log('👀  Looking for changes')

  watcher.on('ready', () => {
    watcher.on('change', (path) => {
      const begin = Date.now()

      // don't listen too deep into node_modules, just one level is enough (I guess)
      if (path.includes('node_modules') && path.match(new RegExp('node_modules', 'g')).length > 1) return

      Object.keys(require.cache).forEach((id) => {
        delete require.cache[id]
      })

      if (server) server.close()
      server = require('./server')(false) // eslint-disable-line global-require
      console.log(`✨  Reloaded in ${Date.now() - begin}ms`)
    })
  })
}

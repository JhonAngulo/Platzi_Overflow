'use strict'

const Hapi = require('@hapi/hapi')
const inert = require('@hapi/inert')
const vision = require('@hapi/vision')
const handlebars = require('./lib/helpers')
const methods = require('./lib/methods')
const path = require('path')
const site = require('./controllers/site')
const good = require('@hapi/good')
const crumb = require('@hapi/crumb')

const routes = require('./routes')


const server = Hapi.server({
  port: process.env.port || 3000,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: path.join(__dirname, 'public')
    }
  }
})

async function init() {

  try {
    await server.register(inert)
    await server.register(vision)
    await server.register({
      plugin: good,
      options: {
        reporters: {
          console: [
            {
              module: '@hapi/good-console'
            },
            'stdout'
          ]
        }
      }
    })

    await server.register({
      plugin: crumb,
      options: {
        cookieOptions: {
          isSecure: process.env.NODE_ENV === 'prop'
        }
      }
    })

    await server.register({
      plugin: require('./lib/api'),
      options: {
        prefix: 'api'
      }
    })

    server.method('setAnswerRight', methods.setAnswerRight)
    server.method('getLast', methods.getLast, {
      cache: {
        expiresIn: 1000 * 60,
        generateTimeout: 2000
      }
    })

    server.state('user', {
      ttl: 1000 * 60 * 60 * 24 * 7,
      isSecure: process.env.NODE_ENV === 'prod',
      encoding: 'base64json'
    })

    server.views({
      engines: {
        hbs: handlebars
      },
      relativeTo: __dirname,
      path: 'views',
      layout: true,
      layoutPath: 'views'
    })

    server.ext('onPreResponse', site.fileNotFound)
    server.route(routes)

    await server.start()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  // console.log(`Server start in the ${server.info.uri}`)
  server.log('info', `Server start in the ${server.info.uri}`)

}

process.on('unhandledRejection', error => {
  // console.error('UnhandledRejection', error.message, error)
  server.log('UnhandledRejection', error)
})

process.on('uncaughtException', error => {
  // console.error('UncaughtException', error.message, error)
  server.log('UncaughtException', error)
})

init()
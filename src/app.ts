import fastify from 'fastify'
import websocket from '@fastify/websocket'
import swagger from '@fastify/swagger'
import scalarReference from '@scalar/fastify-api-reference'
import { pollRoutes } from './http/routes/poll-routes.js'

export const app = fastify({ logger: true })

app.register(swagger, {
  openapi: {
    info: {
      title: 'Poll System API',
      description: 'API de enquetes em tempo real',
      version: '1.0.0',
    },
  },
})

app.register(scalarReference, {
  routePrefix: '/docs',
  configuration: {
    url: '/documentation/json',
  },
})

app.register(websocket)
app.register(pollRoutes)
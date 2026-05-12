import { FastifyInstance } from 'fastify'
import { createPoll } from '../controllers/create-poll.js'
import { getPoll } from '../controllers/get-poll.js'
import { listPolls } from '../controllers/list-polls.js'
import { updatePoll } from '../controllers/update-poll.js'
import { deletePoll } from '../controllers/delete-poll.js'
import { voteOnPoll } from '../controllers/vote-on-poll.js'
import { pollResults } from '../controllers/poll-results.js'

export async function pollRoutes(app: FastifyInstance) {
  app.post('/polls', {
    schema: {
      tags: ['Polls'],
      summary: 'Criar uma enquete',
      body: {
        type: 'object',
        required: ['title', 'startsAt', 'endsAt', 'options'],
        properties: {
          title: { type: 'string' },
          startsAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time' },
          options: { type: 'array', items: { type: 'string' }, minItems: 3 },
        },
      },
      response: {
        201: {
          description: 'Enquete criada com sucesso',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string' },
            startsAt: { type: 'string' },
            endsAt: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  votes: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, createPoll)

  app.get('/polls', {
    schema: {
      tags: ['Polls'],
      summary: 'Listar enquetes',
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['NOT_STARTED', 'STARTED', 'IN_PROGRESS', 'FINISHED'] },
        },
      },
    },
  }, listPolls)

  app.get('/polls/:id', {
    schema: {
      tags: ['Polls'],
      summary: 'Buscar uma enquete',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, getPoll)

  app.put('/polls/:id', {
    schema: {
      tags: ['Polls'],
      summary: 'Editar uma enquete',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          startsAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time' },
          options: { type: 'array', items: { type: 'string' }, minItems: 3 },
        },
      },
    },
  }, updatePoll)

  app.delete('/polls/:id', {
    schema: {
      tags: ['Polls'],
      summary: 'Deletar uma enquete',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, deletePoll)

  app.post('/polls/:pollId/votes', {
    schema: {
      tags: ['Votes'],
      summary: 'Votar em uma opção',
      params: {
        type: 'object',
        properties: {
          pollId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['optionId'],
        properties: {
          optionId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, voteOnPoll)

  app.get('/polls/:pollId/results', { websocket: true }, pollResults)
}
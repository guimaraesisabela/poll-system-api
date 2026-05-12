import { FastifyRequest } from 'fastify'
import { WebSocket } from '@fastify/websocket'
import { z } from 'zod'
import { addClient, removeClient } from '../../lib/poll-sockets.js'

const pollResultsParams = z.object({
  pollId: z.string().uuid(),
})

export async function pollResults(socket: WebSocket, req: FastifyRequest) {
  const { pollId } = pollResultsParams.parse(req.params)

  addClient(pollId, socket)

  socket.on('close', () => {
    removeClient(pollId, socket)
  })
}
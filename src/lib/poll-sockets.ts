import { WebSocket } from '@fastify/websocket'

type Clients = Map<string, Set<WebSocket>>

export const pollClients: Clients = new Map()

export function addClient(pollId: string, socket: WebSocket) {
  if (!pollClients.has(pollId)) {
    pollClients.set(pollId, new Set())
  }
  pollClients.get(pollId)!.add(socket)
}

export function removeClient(pollId: string, socket: WebSocket) {
  pollClients.get(pollId)?.delete(socket)
}

export function broadcast(pollId: string, data: object) {
  const clients = pollClients.get(pollId)
  if (!clients) return

  const message = JSON.stringify(data)
  for (const client of clients) {
    client.send(message)
  }
}
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'

const deletePollParams = z.object({
  id: z.string().uuid(),
})

export async function deletePoll(req: FastifyRequest, reply: FastifyReply) {
  const { id } = deletePollParams.parse(req.params)

  const poll = await prisma.poll.findUnique({ where: { id } })

  if (!poll) {
    return reply.status(404).send({ message: 'Poll not found' })
  }

  await prisma.poll.delete({ where: { id } })

  return reply.status(204).send()
}
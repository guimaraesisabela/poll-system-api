import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { broadcast } from '../../lib/poll-sockets.js'

const voteParams = z.object({
  pollId: z.string().uuid(),
})

const voteBody = z.object({
  optionId: z.string().uuid(),
})

export async function voteOnPoll(req: FastifyRequest, reply: FastifyReply) {
  const { pollId } = voteParams.parse(req.params)
  const { optionId } = voteBody.parse(req.body)

  const option = await prisma.pollOption.findFirst({
    where: { id: optionId, pollId },
  })

  if (!option) {
    return reply.status(404).send({ message: 'Option not found' })
  }

  const updated = await prisma.pollOption.update({
    where: { id: optionId },
    data: { votes: { increment: 1 } },
  })

  broadcast(pollId, {
    optionId: updated.id,
    title: updated.title,
    votes: updated.votes,
  })

  return reply.status(201).send()
}
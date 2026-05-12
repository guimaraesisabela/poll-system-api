import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { getPollStatus } from '../../utils/get-poll-status.js'

const getPollParams = z.object({
  id: z.string().uuid(),
})

export async function getPoll(req: FastifyRequest, reply: FastifyReply) {
  const { id } = getPollParams.parse(req.params)

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { options: true },
  })

  if (!poll) {
    return reply.status(404).send({ message: 'Poll not found' })
  }

  const status = getPollStatus(poll.startsAt, poll.endsAt)

  if (status !== poll.status) {
    await prisma.poll.update({
      where: { id },
      data: { status },
    })
  }

  return reply.send({ ...poll, status })
}
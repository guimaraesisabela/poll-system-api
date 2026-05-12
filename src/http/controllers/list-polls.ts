import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { getPollStatus } from '../../utils/get-poll-status.js'

const listPollsQuery = z.object({
  status: z.enum(['NOT_STARTED', 'STARTED', 'IN_PROGRESS', 'FINISHED']).optional(),
})

export async function listPolls(req: FastifyRequest, reply: FastifyReply) {
  const { status } = listPollsQuery.parse(req.query)

  const polls = await prisma.poll.findMany({
    include: { options: true },
    orderBy: { createdAt: 'desc' },
  })

  const pollsWithStatus = await Promise.all(
    polls.map(async (poll) => {
      const currentStatus = getPollStatus(poll.startsAt, poll.endsAt)

      if (currentStatus !== poll.status) {
        await prisma.poll.update({
          where: { id: poll.id },
          data: { status: currentStatus },
        })
      }

      return { ...poll, status: currentStatus }
    })
  )

  const filtered = status
    ? pollsWithStatus.filter((p) => p.status === status)
    : pollsWithStatus

  return reply.send(filtered)
}
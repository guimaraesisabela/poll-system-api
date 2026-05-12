import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'

const updatePollParams = z.object({
  id: z.string().uuid(),
})

const updatePollBody = z.object({
  title: z.string().min(1).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  options: z.array(z.string().min(1)).min(3).optional(),
})

export async function updatePoll(req: FastifyRequest, reply: FastifyReply) {
  const { id } = updatePollParams.parse(req.params)
  const { title, startsAt, endsAt, options } = updatePollBody.parse(req.body)

  const poll = await prisma.poll.findUnique({ where: { id } })

  if (!poll) {
    return reply.status(404).send({ message: 'Poll not found' })
  }

  await prisma.poll.update({
    where: { id },
    data: {
      title,
      startsAt,
      endsAt,
      ...(options && {
        options: {
          deleteMany: {},
          create: options.map((opt) => ({ title: opt })),
        },
      }),
    },
  })

  return reply.status(204).send()
}
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'

const createPollBody = z.object({
  title: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  options: z.array(z.string().min(1)).min(3),
})

export async function createPoll(req: FastifyRequest, reply: FastifyReply) {
  const { title, startsAt, endsAt, options } = createPollBody.parse(req.body)

  const poll = await prisma.poll.create({
    data: {
      title,
      startsAt,
      endsAt,
      options: {
        create: options.map((opt) => ({ title: opt })),
      },
    },
    include: { options: true },
  })

  return reply.status(201).send(poll)
}
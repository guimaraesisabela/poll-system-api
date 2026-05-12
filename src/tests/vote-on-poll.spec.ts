import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'
import { app } from '../app.js'

describe('POST /polls/:pollId/votes', () => {

  it('deve registrar um voto em uma opcao', async () => {
    const poll = await prisma.poll.create({
      data: {
        title: 'Enquete de votação',
        startsAt: new Date('2026-05-13'),
        endsAt: new Date('2026-05-20'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
      include: { options: true },
    })

    const response = await app.inject({
      method: 'POST',
      url: `/polls/${poll.id}/votes`,
      body: { optionId: poll.options[0].id },
    })

    expect(response.statusCode).toBe(201)

    const updated = await prisma.pollOption.findUnique({
      where: { id: poll.options[0].id },
    })
    expect(updated?.votes).toBe(1)
  })

  it('deve retornar 404 para opcao inexistente', async () => {
    const poll = await prisma.poll.create({
      data: {
        title: 'Enquete',
        startsAt: new Date('2026-05-13'),
        endsAt: new Date('2026-05-20'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: `/polls/${poll.id}/votes`,
      body: { optionId: '00000000-0000-0000-0000-000000000000' },
    })

    expect(response.statusCode).toBe(404)
  })
})
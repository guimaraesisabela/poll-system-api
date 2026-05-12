import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'
import { app } from '../app.js'

describe('DELETE /polls/:id', () => {

  it('deve deletar uma enquete', async () => {
    const poll = await prisma.poll.create({
      data: {
        title: 'Enquete para deletar',
        startsAt: new Date('2026-05-13'),
        endsAt: new Date('2026-05-20'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/polls/${poll.id}`,
    })

    expect(response.statusCode).toBe(204)

    const deleted = await prisma.poll.findUnique({ where: { id: poll.id } })
    expect(deleted).toBeNull()
  })

  it('deve retornar 404 para enquete inexistente', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/polls/00000000-0000-0000-0000-000000000000',
    })

    expect(response.statusCode).toBe(404)
  })
})
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'
import { app } from '../app.js'

describe('PUT /polls/:id', () => {

  it('deve atualizar o titulo de uma enquete', async () => {
    const poll = await prisma.poll.create({
      data: {
        title: 'Titulo antigo',
        startsAt: new Date('2026-05-13'),
        endsAt: new Date('2026-05-20'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    const response = await app.inject({
      method: 'PUT',
      url: `/polls/${poll.id}`,
      body: { title: 'Titulo novo' },
    })

    expect(response.statusCode).toBe(204)

    const updated = await prisma.poll.findUnique({ where: { id: poll.id } })
    expect(updated?.title).toBe('Titulo novo')
  })

  it('deve retornar 404 para enquete inexistente', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/polls/00000000-0000-0000-0000-000000000000',
      body: { title: 'Novo titulo' },
    })

    expect(response.statusCode).toBe(404)
  })
})
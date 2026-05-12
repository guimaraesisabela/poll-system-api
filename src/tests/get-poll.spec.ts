import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'
import { app } from '../app.js'

describe('GET /polls/:id', () => {

  it('deve retornar uma enquete pelo id', async () => {
    const poll = await prisma.poll.create({
      data: {
        title: 'Enquete teste',
        startsAt: new Date('2026-05-13'),
        endsAt: new Date('2026-05-20'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: `/polls/${poll.id}`,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.id).toBe(poll.id)
    expect(body.title).toBe('Enquete teste')
  })

  it('deve retornar 404 para enquete inexistente', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/polls/00000000-0000-0000-0000-000000000000',
    })

    expect(response.statusCode).toBe(404)
  })
})
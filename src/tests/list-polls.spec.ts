import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'
import { app } from '../app.js'

describe('GET /polls', () => {

  it('deve listar todas as enquetes', async () => {
    await prisma.poll.create({
      data: {
        title: 'Enquete 1',
        startsAt: new Date('2026-05-13'),
        endsAt: new Date('2026-05-20'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/polls',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toHaveLength(1)
  })

  it('deve filtrar enquetes por status', async () => {
    await prisma.poll.create({
      data: {
        title: 'Finalizada',
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-01-10'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    await prisma.poll.create({
      data: {
        title: 'Não iniciada',
        startsAt: new Date('2026-06-01'),
        endsAt: new Date('2026-06-10'),
        options: { create: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/polls?status=FINISHED',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toHaveLength(1)
    expect(body[0].status).toBe('FINISHED')
  })

  it('deve retornar lista vazia quando nao houver enquetes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/polls',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(0)
  })
})  
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'
import { app } from '../app.js'

describe('POST /polls', () => {

  it('deve criar uma enquete com sucesso', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/polls',
      body: {
        title: 'Qual a melhor linguagem?',
        startsAt: '2026-05-13T00:00:00.000Z',
        endsAt: '2026-05-20T00:00:00.000Z',
        options: ['TypeScript', 'Python', 'Go'],
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.title).toBe('Qual a melhor linguagem?')
    expect(body.options).toHaveLength(3)
  })

  it('deve rejeitar enquete com menos de 3 opcoes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/polls',
      body: {
        title: 'Enquete inválida',
        startsAt: '2026-05-13T00:00:00.000Z',
        endsAt: '2026-05-20T00:00:00.000Z',
        options: ['Só uma opção', 'Duas opções'],
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('deve rejeitar enquete sem título', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/polls',
      body: {
        startsAt: '2026-05-13T00:00:00.000Z',
        endsAt: '2026-05-20T00:00:00.000Z',
        options: ['TypeScript', 'Python', 'Go'],
      },
    })

    expect(response.statusCode).toBe(400)
  })
})
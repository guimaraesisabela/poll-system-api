import { beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '../lib/prisma.js'

beforeAll(async () => {
  await prisma.$connect()
})

beforeEach(async () => {
  await prisma.pollOption.deleteMany()
  await prisma.poll.deleteMany()
})

afterAll(async () => {
  await prisma.pollOption.deleteMany()
  await prisma.poll.deleteMany()
  await prisma.$disconnect()
})
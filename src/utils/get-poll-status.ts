import { PollStatus } from '@prisma/client'

export function getPollStatus(startsAt: Date, endsAt: Date): PollStatus {
  const now = new Date()

  if (now < startsAt) {
    return PollStatus.NOT_STARTED
  }

  if (now >= startsAt && now < endsAt) {
    const halfTime = new Date((startsAt.getTime() + endsAt.getTime()) / 2)
    if (now < halfTime) {
      return PollStatus.STARTED
    }
    return PollStatus.IN_PROGRESS
  }

  return PollStatus.FINISHED
}
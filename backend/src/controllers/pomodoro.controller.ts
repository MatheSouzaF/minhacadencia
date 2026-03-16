import { Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middlewares/auth'

const configSchema = z.object({
  focusMinutes: z.number().min(1).max(120),
  shortBreak: z.number().min(1).max(60),
  longBreak: z.number().min(1).max(60),
  sessionsUntilLong: z.number().min(1).max(10),
  soundEnabled: z.boolean(),
})

export async function getPomodoroConfig(req: AuthRequest, res: Response): Promise<void> {
  const config = await prisma.pomodoroConfig.findUnique({
    where: { userId: req.userId },
  })

  if (!config) {
    // Retorna defaults
    res.json({ focusMinutes: 25, shortBreak: 5, longBreak: 15, sessionsUntilLong: 4, soundEnabled: true })
    return
  }

  res.json(config)
}

export async function upsertPomodoroConfig(req: AuthRequest, res: Response): Promise<void> {
  const parsed = configSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const config = await prisma.pomodoroConfig.upsert({
    where: { userId: req.userId },
    update: parsed.data,
    create: { userId: req.userId!, ...parsed.data },
  })

  res.json(config)
}

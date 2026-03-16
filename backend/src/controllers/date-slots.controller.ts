import { Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middlewares/auth'

// ─── GET /date-slots ──────────────────────────────────────────────────────────
// Retorna todos os date slots do usuário agrupados por data
export async function getDateSlots(req: AuthRequest, res: Response): Promise<void> {
  const slots = await prisma.dateSlot.findMany({
    where: { userId: req.userId },
    orderBy: [{ date: 'asc' }, { order: 'asc' }],
  })

  const result: Record<string, typeof slots> = {}
  for (const slot of slots) {
    if (!result[slot.date]) result[slot.date] = []
    result[slot.date].push(slot)
  }

  res.json(result)
}

// ─── POST /date-slots ─────────────────────────────────────────────────────────
const dateSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  note: z.string().optional(),
  category: z.string(),
  order: z.number().default(0),
})

export async function addDateSlot(req: AuthRequest, res: Response): Promise<void> {
  const parsed = dateSlotSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const slot = await prisma.dateSlot.create({
    data: { userId: req.userId!, ...parsed.data },
  })

  res.status(201).json(slot)
}

// ─── DELETE /date-slots/:id ───────────────────────────────────────────────────
export async function deleteDateSlot(req: AuthRequest, res: Response): Promise<void> {
  const slot = await prisma.dateSlot.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!slot) {
    res.status(404).json({ error: 'Slot não encontrado' })
    return
  }

  await prisma.dateSlot.delete({ where: { id: req.params.id } })
  res.status(204).send()
}

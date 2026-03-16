import { Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middlewares/auth'

// ─── GET /schedule ───────────────────────────────────────────────────────────
export async function getSchedule(req: AuthRequest, res: Response): Promise<void> {
  const days = await prisma.daySchedule.findMany({
    where: { userId: req.userId },
    orderBy: { order: 'asc' },
    include: { slots: { orderBy: { order: 'asc' } } },
  })
  res.json(days)
}

// ─── PUT /schedule/:day ──────────────────────────────────────────────────────
const daySchema = z.object({
  label: z.string(),
  tag: z.string(),
  tagType: z.string(),
})

export async function upsertDay(req: AuthRequest, res: Response): Promise<void> {
  const parsed = daySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const day = await prisma.daySchedule.upsert({
    where: { userId_day: { userId: req.userId!, day: req.params.day } },
    update: parsed.data,
    create: { userId: req.userId!, day: req.params.day, ...parsed.data },
    include: { slots: { orderBy: { order: 'asc' } } },
  })

  res.json(day)
}

// ─── POST /schedule/:day/slots ───────────────────────────────────────────────
const slotSchema = z.object({
  time: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  note: z.string().optional(),
  category: z.string(),
  order: z.number().default(0),
})

export async function addSlot(req: AuthRequest, res: Response): Promise<void> {
  const parsed = slotSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const daySchedule = await prisma.daySchedule.findUnique({
    where: { userId_day: { userId: req.userId!, day: req.params.day } },
  })
  if (!daySchedule) {
    res.status(404).json({ error: 'Dia não encontrado' })
    return
  }

  const slot = await prisma.slot.create({
    data: { dayScheduleId: daySchedule.id, ...parsed.data },
  })
  res.status(201).json(slot)
}

// ─── PUT /schedule/:day/slots/:slotId ────────────────────────────────────────
export async function updateSlot(req: AuthRequest, res: Response): Promise<void> {
  const parsed = slotSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const slot = await prisma.slot.findFirst({
    where: { id: req.params.slotId, daySchedule: { userId: req.userId } },
  })
  if (!slot) {
    res.status(404).json({ error: 'Slot não encontrado' })
    return
  }

  const updated = await prisma.slot.update({
    where: { id: req.params.slotId },
    data: parsed.data,
  })
  res.json(updated)
}

// ─── DELETE /schedule/:day/slots/:slotId ─────────────────────────────────────
export async function deleteSlot(req: AuthRequest, res: Response): Promise<void> {
  const slot = await prisma.slot.findFirst({
    where: { id: req.params.slotId, daySchedule: { userId: req.userId } },
  })
  if (!slot) {
    res.status(404).json({ error: 'Slot não encontrado' })
    return
  }

  await prisma.slot.delete({ where: { id: req.params.slotId } })
  res.status(204).send()
}

// ─── PUT /schedule/:day/slots/reorder ─────────────────────────────────────
const reorderSchema = z.object({
  slots: z.array(z.object({ id: z.string(), order: z.number() })),
})

export async function reorderSlots(req: AuthRequest, res: Response): Promise<void> {
  const parsed = reorderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  await Promise.all(
    parsed.data.slots.map(({ id, order }) =>
      prisma.slot.updateMany({
        where: { id, daySchedule: { userId: req.userId } },
        data: { order },
      })
    )
  )

  res.status(204).send()
}

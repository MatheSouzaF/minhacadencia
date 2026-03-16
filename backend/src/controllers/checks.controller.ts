import { Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middlewares/auth'

// ─── GET /checks?from=YYYY-MM-DD&to=YYYY-MM-DD ───────────────────────────────
export async function getChecks(req: AuthRequest, res: Response): Promise<void> {
  const { from, to } = req.query as { from?: string; to?: string }

  const checks = await prisma.dayCheck.findMany({
    where: {
      userId: req.userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: { checks: true },
    orderBy: { date: 'asc' },
  })

  // Formata para o shape esperado pelo frontend: Record<date, DayCheck>
  const result: Record<string, { date: string; checks: Record<string, boolean> }> = {}
  for (const dc of checks) {
    result[dc.date] = {
      date: dc.date,
      checks: Object.fromEntries(dc.checks.map((c) => [c.slotId, c.checked])),
    }
  }

  res.json(result)
}

// ─── POST /checks/toggle ─────────────────────────────────────────────────────
const toggleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotId: z.string().uuid(),
})

export async function toggleCheck(req: AuthRequest, res: Response): Promise<void> {
  const parsed = toggleSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const { date, slotId } = parsed.data

  // Garante que o slot pertence ao usuário (slot recorrente ou slot de data específica)
  const [slot, dateSlot] = await Promise.all([
    prisma.slot.findFirst({ where: { id: slotId, daySchedule: { userId: req.userId } } }),
    prisma.dateSlot.findFirst({ where: { id: slotId, userId: req.userId } }),
  ])
  if (!slot && !dateSlot) {
    res.status(404).json({ error: 'Slot não encontrado' })
    return
  }

  // Upsert DayCheck
  const dayCheck = await prisma.dayCheck.upsert({
    where: { userId_date: { userId: req.userId!, date } },
    update: {},
    create: { userId: req.userId!, date },
  })

  // Toggle SlotCheck
  const existing = await prisma.slotCheck.findUnique({
    where: { dayCheckId_slotId: { dayCheckId: dayCheck.id, slotId } },
  })

  if (existing) {
    await prisma.slotCheck.update({
      where: { id: existing.id },
      data: { checked: !existing.checked },
    })
  } else {
    await prisma.slotCheck.create({
      data: { dayCheckId: dayCheck.id, slotId, checked: true },
    })
  }

  res.status(204).send()
}

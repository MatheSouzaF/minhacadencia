import { Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middlewares/auth'

// ─── GET /monthly/goals?month=2026-03 ────────────────────────────────────────
export async function getGoals(req: AuthRequest, res: Response): Promise<void> {
  const { month } = req.query as { month?: string }

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ error: 'Parâmetro month inválido. Use formato YYYY-MM.' })
    return
  }

  const goals = await prisma.monthlyGoal.findMany({
    where: { userId: req.userId, month },
    include: { entries: true },
    orderBy: { title: 'asc' },
  })

  const result = goals.map((g) => ({
    id: g.id,
    month: g.month,
    title: g.title,
    emoji: g.emoji,
    unit: g.unit,
    target: g.target,
    color: g.color,
    entries: g.entries.map((e) => e.date),
  }))

  res.json(result)
}

// ─── POST /monthly/goals ──────────────────────────────────────────────────────
const createGoalSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(1).max(100),
  emoji: z.string().default('⭐'),
  unit: z.string().default('dias'),
  target: z.number().int().positive(),
  color: z.string().default('var(--gold)'),
})

export async function createGoal(req: AuthRequest, res: Response): Promise<void> {
  const parsed = createGoalSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { month, title, emoji, unit, target, color } = parsed.data

  const goal = await prisma.monthlyGoal.create({
    data: { userId: req.userId!, month, title, emoji, unit, target, color },
    include: { entries: true },
  })

  res.status(201).json({
    id: goal.id,
    month: goal.month,
    title: goal.title,
    emoji: goal.emoji,
    unit: goal.unit,
    target: goal.target,
    color: goal.color,
    entries: [],
  })
}

// ─── PUT /monthly/goals/:id ───────────────────────────────────────────────────
const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  emoji: z.string().optional(),
  unit: z.string().optional(),
  target: z.number().int().positive().optional(),
  color: z.string().optional(),
})

export async function updateGoal(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const parsed = updateGoalSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const existing = await prisma.monthlyGoal.findFirst({
    where: { id, userId: req.userId },
  })
  if (!existing) {
    res.status(404).json({ error: 'Meta não encontrada' })
    return
  }

  const goal = await prisma.monthlyGoal.update({
    where: { id },
    data: parsed.data,
    include: { entries: true },
  })

  res.json({
    id: goal.id,
    month: goal.month,
    title: goal.title,
    emoji: goal.emoji,
    unit: goal.unit,
    target: goal.target,
    color: goal.color,
    entries: goal.entries.map((e) => e.date),
  })
}

// ─── DELETE /monthly/goals/:id ────────────────────────────────────────────────
export async function deleteGoal(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const existing = await prisma.monthlyGoal.findFirst({
    where: { id, userId: req.userId },
  })
  if (!existing) {
    res.status(404).json({ error: 'Meta não encontrada' })
    return
  }

  await prisma.monthlyGoal.delete({ where: { id } })
  res.status(204).send()
}

// ─── POST /monthly/goals/toggle-entry ────────────────────────────────────────
const toggleEntrySchema = z.object({
  goalId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function toggleEntry(req: AuthRequest, res: Response): Promise<void> {
  const parsed = toggleEntrySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' })
    return
  }

  const { goalId, date } = parsed.data

  // Verifica que a meta pertence ao usuário
  const goal = await prisma.monthlyGoal.findFirst({
    where: { id: goalId, userId: req.userId },
  })
  if (!goal) {
    res.status(404).json({ error: 'Meta não encontrada' })
    return
  }

  const existing = await prisma.monthlyGoalEntry.findUnique({
    where: { goalId_date: { goalId, date } },
  })

  if (existing) {
    await prisma.monthlyGoalEntry.delete({ where: { id: existing.id } })
    res.json({ checked: false, date })
  } else {
    await prisma.monthlyGoalEntry.create({ data: { goalId, date } })
    res.json({ checked: true, date })
  }
}

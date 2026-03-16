/**
 * GoalAutoSync — componente headless
 *
 * Observa mudanças nos checks do cronograma semanal e sincroniza
 * automaticamente com as metas mensais do tipo Hábito.
 *
 * Lógica de match (por prioridade):
 *   1. emoji do slot === emoji da meta
 *   2. nome do slot contém o título da meta (ou vice-versa)
 *
 * Só sincroniza metas de hábito (unit !== '' e não é progresso numérico).
 */

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useSchedule } from '@/contexts/ScheduleContext'
import { useMonthly } from '@/contexts/MonthlyContext'
import { useCategories } from '@/contexts/CategoryContext'
import type { MonthlyGoal } from '@/types'

// Metas que fazem sentido auto-sincronizar: Hábito (dias/vezes/semanas/livros...)
// Progresso (R$, km...) e Conquista (unit='') não são auto-sincronizadas.
const PROGRESS_UNITS = new Set(['r$', 'km', 'páginas', 'horas', 'kg'])

function isHabitGoal(goal: MonthlyGoal): boolean {
  if (goal.unit === '') return false // milestone
  if (PROGRESS_UNITS.has(goal.unit.toLowerCase())) return false // progresso numérico
  return true
}

function matchesGoal(
  slotName: string,
  slotIcon: string | undefined,
  goal: MonthlyGoal
): boolean {
  // 1. Match por emoji (mais preciso)
  if (slotIcon && slotIcon === goal.emoji) return true

  // 2. Match por nome (case-insensitive, substring)
  const sn = slotName.toLowerCase()
  const gt = goal.title.toLowerCase()
  if (sn.includes(gt) || gt.includes(sn)) return true

  return false
}

export function GoalAutoSync() {
  const { state } = useSchedule()
  const { goals, toggleEntry } = useMonthly()
  const { categories } = useCategories()

  // Snapshot dos checks anteriores para detectar delta
  const prevChecksRef = useRef<typeof state.checks>({})

  useEffect(() => {
    const prev = prevChecksRef.current
    const curr = state.checks

    const today = format(new Date(), 'yyyy-MM')
    const habitGoals = goals.filter(isHabitGoal).filter((g) => g.month === today)

    if (habitGoals.length === 0) {
      prevChecksRef.current = curr
      return
    }

    // Construir mapa slotId → Slot para lookup rápido
    const slotMap = new Map(
      state.schedule.flatMap((day) => day.slots.map((s) => [s.id, s]))
    )

    // Percorrer todas as datas que mudaram
    for (const [date, dayCheck] of Object.entries(curr)) {
      const prevDay = prev[date]

      for (const [slotId, isChecked] of Object.entries(dayCheck.checks)) {
        const wasChecked = prevDay?.checks[slotId] ?? false
        if (isChecked === wasChecked) continue // sem mudança

        const slot = slotMap.get(slotId)
        if (!slot) continue

        // Slot icon: usa o do próprio slot ou o emoji da categoria
        const cat = categories.find((c) => c.id === slot.category)
        const slotIcon = slot.icon ?? cat?.emoji

        for (const goal of habitGoals) {
          if (!matchesGoal(slot.name, slotIcon, goal)) continue

          const alreadyHasEntry = goal.entries.includes(date)

          // Só chama toggleEntry quando o estado precisa mudar
          if (isChecked && !alreadyHasEntry) {
            toggleEntry(goal.id, date).catch(() => {})
          } else if (!isChecked && alreadyHasEntry) {
            toggleEntry(goal.id, date).catch(() => {})
          }
        }
      }
    }

    prevChecksRef.current = curr
  }, [state.checks, goals, categories, toggleEntry])

  return null
}

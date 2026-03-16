import { useMemo } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getDaysInMonth, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSchedule } from '@/contexts/ScheduleContext'
import { CATEGORY_LABELS, type Category, type DayOfWeek } from '@/types'

// ─── Utilitários ──────────────────────────────────────────────────────────────

/** Dado um Date, retorna o DayOfWeek correspondente */
function dateToDayOfWeek(date: Date): DayOfWeek {
  const jsDay = date.getDay() // 0=Sun
  const map: Record<number, DayOfWeek> = {
    0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
    4: 'quinta', 5: 'sexta', 6: 'sabado',
  }
  return map[jsDay]
}

// ─── Tipos de retorno ─────────────────────────────────────────────────────────

export interface DayProgressData {
  total: number
  checked: number
  percent: number
  pending: { slotId: string; name: string; time: string; category: Category }[]
  byCategory: CategoryProgressData[]
}

export interface CategoryProgressData {
  category: Category
  label: string
  total: number
  checked: number
  percent: number
}

export interface WeekProgressData {
  total: number
  checked: number
  percent: number
  days: {
    day: DayOfWeek
    label: string
    date: string
    total: number
    checked: number
    percent: number
  }[]
  bestCategory: CategoryProgressData | null
  worstCategory: CategoryProgressData | null
}

export interface MonthHeatmapDay {
  date: string
  percent: number
  total: number
  checked: number
  isCurrentMonth: boolean
}

export interface MonthProgressData {
  total: number
  checked: number
  percent: number
  heatmap: MonthHeatmapDay[]
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useProgress() {
  const { state } = useSchedule()
  const now = new Date()
  const todayISO = format(now, 'yyyy-MM-dd')

  // ── Progresso do dia ────────────────────────────────────────────────────────
  const dayProgress = useMemo((): DayProgressData => {
    const todayDow = dateToDayOfWeek(now)
    const daySchedule = state.schedule.find((d) => d.day === todayDow)
    const dayCheck = state.checks[todayISO] ?? { date: todayISO, checks: {} }

    if (!daySchedule) return { total: 0, checked: 0, percent: 0, pending: [], byCategory: [] }

    const slots = daySchedule.slots
    const total = slots.length
    const checked = slots.filter((s) => dayCheck.checks[s.id]).length
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0

    const pending = slots
      .filter((s) => !dayCheck.checks[s.id])
      .map((s) => ({ slotId: s.id, name: s.name, time: s.time, category: s.category }))

    // Por categoria
    const catMap = new Map<Category, { total: number; checked: number }>()
    for (const slot of slots) {
      const entry = catMap.get(slot.category) ?? { total: 0, checked: 0 }
      entry.total++
      if (dayCheck.checks[slot.id]) entry.checked++
      catMap.set(slot.category, entry)
    }
    const byCategory: CategoryProgressData[] = Array.from(catMap.entries()).map(([cat, v]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      total: v.total,
      checked: v.checked,
      percent: v.total > 0 ? Math.round((v.checked / v.total) * 100) : 0,
    }))

    return { total, checked, percent, pending, byCategory }
  }, [state, todayISO])

  // ── Progresso da semana ─────────────────────────────────────────────────────
  const weekProgress = useMemo((): WeekProgressData => {
    const weekStart = startOfWeek(now, { locale: ptBR, weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { locale: ptBR, weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    let total = 0
    let checked = 0
    const catAccum = new Map<Category, { total: number; checked: number }>()

    const days = weekDays.map((date) => {
      const dateISO = format(date, 'yyyy-MM-dd')
      const dow = dateToDayOfWeek(date)
      const daySchedule = state.schedule.find((d) => d.day === dow)
      const dayCheck = state.checks[dateISO] ?? { date: dateISO, checks: {} }
      const dayLabel = format(date, 'EEE', { locale: ptBR })

      if (!daySchedule) {
        return { day: dow, label: dayLabel, date: dateISO, total: 0, checked: 0, percent: 0 }
      }

      const dayTotal = daySchedule.slots.length
      const dayChecked = daySchedule.slots.filter((s) => dayCheck.checks[s.id]).length
      const dayPercent = dayTotal > 0 ? Math.round((dayChecked / dayTotal) * 100) : 0

      total += dayTotal
      checked += dayChecked

      // Acumular por categoria (só dias passados e hoje)
      if (date <= now) {
        for (const slot of daySchedule.slots) {
          const entry = catAccum.get(slot.category) ?? { total: 0, checked: 0 }
          entry.total++
          if (dayCheck.checks[slot.id]) entry.checked++
          catAccum.set(slot.category, entry)
        }
      }

      return { day: dow, label: dayLabel, date: dateISO, total: dayTotal, checked: dayChecked, percent: dayPercent }
    })

    const percent = total > 0 ? Math.round((checked / total) * 100) : 0

    const catList: CategoryProgressData[] = Array.from(catAccum.entries())
      .filter(([, v]) => v.total > 0)
      .map(([cat, v]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        total: v.total,
        checked: v.checked,
        percent: v.total > 0 ? Math.round((v.checked / v.total) * 100) : 0,
      }))

    const sorted = [...catList].sort((a, b) => b.percent - a.percent)
    const bestCategory = sorted[0] ?? null
    const worstCategory = sorted[sorted.length - 1] ?? null

    return { total, checked, percent, days, bestCategory, worstCategory }
  }, [state, todayISO])

  // ── Progresso do mês ────────────────────────────────────────────────────────
  const monthProgress = useMemo((): MonthProgressData => {
    const monthStart = startOfMonth(now)
    const daysInMonth = getDaysInMonth(now)

    // Padding inicial: quantos dias antes do início do mês (semana começa na seg)
    const startDow = (monthStart.getDay() + 6) % 7 // 0=seg ... 6=dom

    const heatmap: MonthHeatmapDay[] = []

    // Células vazias antes do mês
    for (let i = 0; i < startDow; i++) {
      heatmap.push({ date: '', percent: 0, total: 0, checked: 0, isCurrentMonth: false })
    }

    let monthTotal = 0
    let monthChecked = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d)
      const dateISO = format(date, 'yyyy-MM-dd')
      const dow = dateToDayOfWeek(date)
      const daySchedule = state.schedule.find((s) => s.day === dow)
      const dayCheck = state.checks[dateISO] ?? { date: dateISO, checks: {} }

      const dayTotal = daySchedule?.slots.length ?? 0
      const dayChecked = daySchedule
        ? daySchedule.slots.filter((s) => dayCheck.checks[s.id]).length
        : 0
      const dayPercent = dayTotal > 0 ? Math.round((dayChecked / dayTotal) * 100) : 0

      // Só contabiliza dias passados + hoje
      if (date <= now) {
        monthTotal += dayTotal
        monthChecked += dayChecked
      }

      heatmap.push({
        date: dateISO,
        percent: dayPercent,
        total: dayTotal,
        checked: dayChecked,
        isCurrentMonth: true,
      })
    }

    const percent = monthTotal > 0 ? Math.round((monthChecked / monthTotal) * 100) : 0
    return { total: monthTotal, checked: monthChecked, percent, heatmap }
  }, [state, todayISO])

  return { dayProgress, weekProgress, monthProgress, todayISO }
}

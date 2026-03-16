import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiFetch } from '@/lib/api'
import type { DaySchedule, DayCheck, Slot, DayOfWeek, Category, SpecificDateSlot } from '@/types'
import { DAY_ORDER } from '@/types'

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DAYS: { day: DayOfWeek; label: string; tag: string; tagType: string }[] = [
  { day: 'segunda',  label: 'Segunda',  tag: '', tagType: 'livre' },
  { day: 'terca',    label: 'Terça',    tag: '', tagType: 'livre' },
  { day: 'quarta',   label: 'Quarta',   tag: '', tagType: 'livre' },
  { day: 'quinta',   label: 'Quinta',   tag: '', tagType: 'livre' },
  { day: 'sexta',    label: 'Sexta',    tag: '', tagType: 'livre' },
  { day: 'sabado',   label: 'Sábado',   tag: '', tagType: 'livre' },
  { day: 'domingo',  label: 'Domingo',  tag: '', tagType: 'livre' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleState {
  schedule: DaySchedule[]
  checks: Record<string, DayCheck>
  dateSlots: Record<string, Slot[]>
}

interface ScheduleContextValue {
  state: ScheduleState
  isLoading: boolean
  toggleCheck: (date: string, slotId: string) => void
  addSlot: (day: DayOfWeek, slot: Omit<Slot, 'id' | 'order'>) => Promise<void>
  updateSlot: (day: DayOfWeek, slotId: string, changes: Partial<Omit<Slot, 'id'>>) => Promise<void>
  deleteSlot: (day: DayOfWeek, slotId: string) => Promise<void>
  reorderSlots: (day: DayOfWeek, slots: Slot[]) => Promise<void>
  addDateSlot: (date: string, slot: Omit<Slot, 'id' | 'order'>) => Promise<void>
  deleteDateSlot: (date: string, slotId: string) => Promise<void>
  isChecked: (date: string, slotId: string) => boolean
  getDayChecks: (date: string) => DayCheck
  getDaySchedule: (day: DayOfWeek) => DaySchedule | undefined
  getDateSlots: (date: string) => Slot[]
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

// ─── Migração de localStorage → API ──────────────────────────────────────────

const LS_SCHEDULE   = 'rotina:schedule'
const LS_CHECKS     = 'rotina:checks'
const LS_DATE_SLOTS = 'rotina:date-slots'
const LS_MIGRATED   = 'rotina:migrated-to-api'

async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem(LS_MIGRATED)) return

  try {
    const rawSchedule  = localStorage.getItem(LS_SCHEDULE)
    const rawDateSlots = localStorage.getItem(LS_DATE_SLOTS)

    if (rawSchedule) {
      const schedule = JSON.parse(rawSchedule) as DaySchedule[]
      for (const day of schedule) {
        if (!day.tag && day.slots.length === 0) continue // skip empty default days

        // Upsert o dia
        await apiFetch(`/schedule/${day.day}`, {
          method: 'PUT',
          body: JSON.stringify({ label: day.label, tag: day.tag, tagType: day.tagType }),
        })

        // Adiciona cada slot
        for (const slot of day.slots) {
          await apiFetch(`/schedule/${day.day}/slots`, {
            method: 'POST',
            body: JSON.stringify({
              time: slot.time,
              name: slot.name,
              icon: slot.icon,
              note: slot.note,
              category: slot.category,
              order: slot.order,
            }),
          })
        }
      }
    }

    if (rawDateSlots) {
      const dateSlots = JSON.parse(rawDateSlots) as Record<string, Slot[]>
      for (const [date, slots] of Object.entries(dateSlots)) {
        for (const slot of slots) {
          await apiFetch('/date-slots', {
            method: 'POST',
            body: JSON.stringify({
              date,
              time: slot.time,
              name: slot.name,
              icon: slot.icon,
              note: slot.note,
              category: slot.category,
              order: slot.order,
            }),
          })
        }
      }
    }
  } catch {
    // silently fail — próxima vez tenta novamente
    return
  }

  // Limpa localStorage e marca migração como feita
  localStorage.removeItem(LS_SCHEDULE)
  localStorage.removeItem(LS_CHECKS)
  localStorage.removeItem(LS_DATE_SLOTS)
  localStorage.setItem(LS_MIGRATED, '1')
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule]   = useState<DaySchedule[]>([])
  const [checks, setChecks]       = useState<Record<string, DayCheck>>({})
  const [dateSlots, setDateSlots] = useState<Record<string, Slot[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  // ── Carregamento inicial ──────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      // Migração única do localStorage (só roda se houver dados antigos)
      await migrateFromLocalStorage()

      const [schedRes, checksRes, dateSlotsRes] = await Promise.all([
        apiFetch('/schedule'),
        apiFetch('/checks'),
        apiFetch('/date-slots'),
      ])

      let loadedSchedule: DaySchedule[] = []
      if (schedRes.ok) {
        const data = await schedRes.json() as DaySchedule[]
        loadedSchedule = data

        // Se o usuário não tem dias cadastrados ainda, inicializa os 7 dias
        if (data.length === 0) {
          const created = await Promise.all(
            DEFAULT_DAYS.map((d) =>
              apiFetch(`/schedule/${d.day}`, {
                method: 'PUT',
                body: JSON.stringify({ label: d.label, tag: d.tag, tagType: d.tagType }),
              }).then((r) => r.ok ? r.json() : null)
            )
          )
          loadedSchedule = created.filter(Boolean) as DaySchedule[]
        }

        // Garante a ordem correta seg→dom
        loadedSchedule = DAY_ORDER.map(
          (day) => loadedSchedule.find((d) => d.day === day) ?? { day, label: day, tag: '', tagType: 'livre' as const, slots: [] }
        )
        setSchedule(loadedSchedule)
      }

      if (checksRes.ok) {
        const data = await checksRes.json() as Record<string, DayCheck>
        setChecks(data)
      }

      if (dateSlotsRes.ok) {
        const data = await dateSlotsRes.json() as Record<string, Slot[]>
        setDateSlots(data)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Checks ────────────────────────────────────────────────────────────────

  const toggleCheck = useCallback((date: string, slotId: string) => {
    // Optimistic update
    setChecks((prev) => {
      const existing = prev[date] ?? { date, checks: {} }
      return {
        ...prev,
        [date]: {
          ...existing,
          checks: { ...existing.checks, [slotId]: !existing.checks[slotId] },
        },
      }
    })

    // Sync com API em background
    apiFetch('/checks/toggle', {
      method: 'POST',
      body: JSON.stringify({ date, slotId }),
    }).catch(() => {
      // Reverte se falhar
      setChecks((prev) => {
        const existing = prev[date] ?? { date, checks: {} }
        return {
          ...prev,
          [date]: {
            ...existing,
            checks: { ...existing.checks, [slotId]: !existing.checks[slotId] },
          },
        }
      })
    })
  }, [])

  // ── Slots semanais ────────────────────────────────────────────────────────

  const addSlot = useCallback(async (day: DayOfWeek, slot: Omit<Slot, 'id' | 'order'>) => {
    const res = await apiFetch(`/schedule/${day}/slots`, {
      method: 'POST',
      body: JSON.stringify(slot),
    })
    if (res.ok) {
      const newSlot = await res.json() as Slot
      setSchedule((prev) =>
        prev.map((d) => d.day === day ? { ...d, slots: [...d.slots, newSlot] } : d)
      )
    }
  }, [])

  const updateSlot = useCallback(async (day: DayOfWeek, slotId: string, changes: Partial<Omit<Slot, 'id'>>) => {
    // Optimistic
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, slots: d.slots.map((s) => s.id === slotId ? { ...s, ...changes } : s) }
          : d
      )
    )
    await apiFetch(`/schedule/${day}/slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    })
  }, [])

  const deleteSlot = useCallback(async (day: DayOfWeek, slotId: string) => {
    // Optimistic
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, slots: d.slots.filter((s) => s.id !== slotId).map((s, i) => ({ ...s, order: i })) }
          : d
      )
    )
    await apiFetch(`/schedule/${day}/slots/${slotId}`, { method: 'DELETE' })
  }, [])

  const reorderSlots = useCallback(async (day: DayOfWeek, slots: Slot[]) => {
    setSchedule((prev) =>
      prev.map((d) => d.day === day ? { ...d, slots } : d)
    )
    await apiFetch(`/schedule/${day}/slots/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ slots: slots.map(({ id, order }) => ({ id, order })) }),
    })
  }, [])

  // ── Date slots ────────────────────────────────────────────────────────────

  const addDateSlot = useCallback(async (date: string, slot: Omit<Slot, 'id' | 'order'>) => {
    const res = await apiFetch('/date-slots', {
      method: 'POST',
      body: JSON.stringify({ date, ...slot }),
    })
    if (res.ok) {
      const newSlot = await res.json() as Slot
      setDateSlots((prev) => ({
        ...prev,
        [date]: [...(prev[date] ?? []), newSlot],
      }))
    }
  }, [])

  const deleteDateSlot = useCallback(async (date: string, slotId: string) => {
    // Optimistic
    setDateSlots((prev) => ({
      ...prev,
      [date]: (prev[date] ?? []).filter((s) => s.id !== slotId),
    }))
    await apiFetch(`/date-slots/${slotId}`, { method: 'DELETE' })
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isChecked = useCallback((date: string, slotId: string) =>
    checks[date]?.checks[slotId] ?? false
  , [checks])

  const getDayChecks = useCallback((date: string): DayCheck =>
    checks[date] ?? { date, checks: {} }
  , [checks])

  const getDaySchedule = useCallback((day: DayOfWeek) =>
    schedule.find((d) => d.day === day)
  , [schedule])

  const getDateSlots = useCallback((date: string): Slot[] =>
    dateSlots[date] ?? []
  , [dateSlots])

  const state: ScheduleState = { schedule, checks, dateSlots }

  return (
    <ScheduleContext.Provider value={{
      state,
      isLoading,
      toggleCheck,
      addSlot,
      updateSlot,
      deleteSlot,
      reorderSlots,
      addDateSlot,
      deleteDateSlot,
      isChecked,
      getDayChecks,
      getDaySchedule,
      getDateSlots,
    }}>
      {children}
    </ScheduleContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider')
  return ctx
}

export type { ScheduleState, SpecificDateSlot }
export type { Category }

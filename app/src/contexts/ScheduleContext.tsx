import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { DaySchedule, DayCheck, Slot, DayOfWeek, Category } from '@/types'
import { DAY_ORDER } from '@/types'

const emptySchedule: DaySchedule[] = DAY_ORDER.map((day) => {
  const labels: Record<string, string> = {
    segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
    quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
  }
  return { day, label: labels[day], tag: '', tagType: 'livre', slots: [] }
})

// ─── Tipos do estado ─────────────────────────────────────────────────────────

interface ScheduleState {
  schedule: DaySchedule[]
  checks: Record<string, DayCheck>
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type ScheduleAction =
  | { type: 'INIT'; payload: ScheduleState }
  | { type: 'TOGGLE_CHECK'; payload: { date: string; slotId: string } }
  | { type: 'ADD_SLOT'; payload: { day: DayOfWeek; slot: Omit<Slot, 'id' | 'order'> } }
  | { type: 'UPDATE_SLOT'; payload: { day: DayOfWeek; slotId: string; changes: Partial<Omit<Slot, 'id'>> } }
  | { type: 'DELETE_SLOT'; payload: { day: DayOfWeek; slotId: string } }
  | { type: 'REORDER_SLOTS'; payload: { day: DayOfWeek; slots: Slot[] } }

// ─── Reducer ─────────────────────────────────────────────────────────────────

function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'INIT':
      return action.payload

    case 'TOGGLE_CHECK': {
      const { date, slotId } = action.payload
      const existing = state.checks[date] ?? { date, checks: {} }
      return {
        ...state,
        checks: {
          ...state.checks,
          [date]: {
            ...existing,
            checks: {
              ...existing.checks,
              [slotId]: !existing.checks[slotId],
            },
          },
        },
      }
    }

    case 'ADD_SLOT': {
      const { day, slot } = action.payload
      return {
        ...state,
        schedule: state.schedule.map((d) => {
          if (d.day !== day) return d
          const newSlot: Slot = {
            ...slot,
            id: uuidv4(),
            order: d.slots.length,
          }
          return { ...d, slots: [...d.slots, newSlot] }
        }),
      }
    }

    case 'UPDATE_SLOT': {
      const { day, slotId, changes } = action.payload
      return {
        ...state,
        schedule: state.schedule.map((d) => {
          if (d.day !== day) return d
          return {
            ...d,
            slots: d.slots.map((s) =>
              s.id === slotId ? { ...s, ...changes } : s
            ),
          }
        }),
      }
    }

    case 'DELETE_SLOT': {
      const { day, slotId } = action.payload
      return {
        ...state,
        schedule: state.schedule.map((d) => {
          if (d.day !== day) return d
          return {
            ...d,
            slots: d.slots
              .filter((s) => s.id !== slotId)
              .map((s, i) => ({ ...s, order: i })),
          }
        }),
      }
    }

    case 'REORDER_SLOTS': {
      const { day, slots } = action.payload
      return {
        ...state,
        schedule: state.schedule.map((d) =>
          d.day === day ? { ...d, slots } : d
        ),
      }
    }

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ScheduleContextValue {
  state: ScheduleState
  toggleCheck: (date: string, slotId: string) => void
  addSlot: (day: DayOfWeek, slot: Omit<Slot, 'id' | 'order'>) => void
  updateSlot: (day: DayOfWeek, slotId: string, changes: Partial<Omit<Slot, 'id'>>) => void
  deleteSlot: (day: DayOfWeek, slotId: string) => void
  reorderSlots: (day: DayOfWeek, slots: Slot[]) => void
  isChecked: (date: string, slotId: string) => boolean
  getDayChecks: (date: string) => DayCheck
  getDaySchedule: (day: DayOfWeek) => DaySchedule | undefined
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

const LS_SCHEDULE = 'rotina:schedule'
const LS_CHECKS = 'rotina:checks'

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, {
    schedule: emptySchedule,
    checks: {},
  })

  // Carrega do localStorage na montagem
  useEffect(() => {
    try {
      const savedSchedule = localStorage.getItem(LS_SCHEDULE)
      const savedChecks = localStorage.getItem(LS_CHECKS)
      dispatch({
        type: 'INIT',
        payload: {
          schedule: savedSchedule ? JSON.parse(savedSchedule) as DaySchedule[] : emptySchedule,
          checks: savedChecks ? JSON.parse(savedChecks) as Record<string, DayCheck> : {},
        },
      })
    } catch {
      // mantém o estado inicial se localStorage falhar
    }
  }, [])

  // Persiste no localStorage sempre que o estado muda
  useEffect(() => {
    try {
      localStorage.setItem(LS_SCHEDULE, JSON.stringify(state.schedule))
      localStorage.setItem(LS_CHECKS, JSON.stringify(state.checks))
    } catch {
      // ignore
    }
  }, [state])

  const toggleCheck = (date: string, slotId: string) =>
    dispatch({ type: 'TOGGLE_CHECK', payload: { date, slotId } })

  const addSlot = (day: DayOfWeek, slot: Omit<Slot, 'id' | 'order'>) =>
    dispatch({ type: 'ADD_SLOT', payload: { day, slot } })

  const updateSlot = (day: DayOfWeek, slotId: string, changes: Partial<Omit<Slot, 'id'>>) =>
    dispatch({ type: 'UPDATE_SLOT', payload: { day, slotId, changes } })

  const deleteSlot = (day: DayOfWeek, slotId: string) =>
    dispatch({ type: 'DELETE_SLOT', payload: { day, slotId } })

  const reorderSlots = (day: DayOfWeek, slots: Slot[]) =>
    dispatch({ type: 'REORDER_SLOTS', payload: { day, slots } })

  const isChecked = (date: string, slotId: string) =>
    state.checks[date]?.checks[slotId] ?? false

  const getDayChecks = (date: string): DayCheck =>
    state.checks[date] ?? { date, checks: {} }

  const getDaySchedule = (day: DayOfWeek) =>
    state.schedule.find((d) => d.day === day)

  return (
    <ScheduleContext.Provider value={{
      state, toggleCheck, addSlot, updateSlot,
      deleteSlot, reorderSlots, isChecked, getDayChecks, getDaySchedule,
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

// Re-export para conveniência
export type { ScheduleAction, ScheduleState }
export type { Category }

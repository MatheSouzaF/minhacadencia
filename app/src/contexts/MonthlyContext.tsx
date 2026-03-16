import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { format } from 'date-fns'
import { apiFetch } from '@/lib/api'
import type { MonthlyGoal } from '@/types'

// ─── Context value ────────────────────────────────────────────────────────────

interface MonthlyContextValue {
  goals: MonthlyGoal[]
  currentMonth: string
  isLoading: boolean
  setCurrentMonth: (month: string) => void
  addGoal: (data: Omit<MonthlyGoal, 'id' | 'entries'>) => Promise<void>
  updateGoal: (id: string, data: Partial<Omit<MonthlyGoal, 'id' | 'entries'>>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleEntry: (goalId: string, date: string) => Promise<void>
}

const MonthlyContext = createContext<MonthlyContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MonthlyProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<MonthlyGoal[]>([])
  const [currentMonth, setCurrentMonth] = useState<string>(() =>
    format(new Date(), 'yyyy-MM')
  )
  const [isLoading, setIsLoading] = useState(false)

  const fetchGoals = useCallback(async (month: string) => {
    setIsLoading(true)
    try {
      const res = await apiFetch(`/monthly/goals?month=${month}`)
      if (res.ok) {
        const data = await res.json() as MonthlyGoal[]
        setGoals(data)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals(currentMonth)
  }, [currentMonth, fetchGoals])

  const addGoal = async (data: Omit<MonthlyGoal, 'id' | 'entries'>) => {
    const res = await apiFetch('/monthly/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const goal = await res.json() as MonthlyGoal
      setGoals((prev) => [...prev, goal])
    }
  }

  const updateGoal = async (id: string, data: Partial<Omit<MonthlyGoal, 'id' | 'entries'>>) => {
    const res = await apiFetch(`/monthly/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json() as MonthlyGoal
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    }
  }

  const deleteGoal = async (id: string) => {
    const res = await apiFetch(`/monthly/goals/${id}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
    }
  }

  const toggleEntry = async (goalId: string, date: string) => {
    // Optimistic update — UI responde imediatamente
    let optimisticChecked = false
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const alreadyChecked = g.entries.includes(date)
        optimisticChecked = !alreadyChecked
        const entries = alreadyChecked
          ? g.entries.filter((e) => e !== date)
          : [...g.entries.filter((e) => e !== date), date]
        return { ...g, entries }
      })
    )

    // Sincroniza com o servidor em background
    try {
      const res = await apiFetch('/monthly/goals/toggle-entry', {
        method: 'POST',
        body: JSON.stringify({ goalId, date }),
      })
      if (res.ok) {
        const { checked } = await res.json() as { checked: boolean; date: string }
        // Corrige se o servidor divergir do estado optimista
        if (checked !== optimisticChecked) {
          setGoals((prev) =>
            prev.map((g) => {
              if (g.id !== goalId) return g
              const entries = checked
                ? [...g.entries.filter((e) => e !== date), date]
                : g.entries.filter((e) => e !== date)
              return { ...g, entries }
            })
          )
        }
      }
    } catch {
      // API indisponível — mantém estado optimista
    }
  }

  return (
    <MonthlyContext.Provider
      value={{
        goals,
        currentMonth,
        isLoading,
        setCurrentMonth,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleEntry,
      }}
    >
      {children}
    </MonthlyContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMonthly(): MonthlyContextValue {
  const ctx = useContext(MonthlyContext)
  if (!ctx) throw new Error('useMonthly must be used within MonthlyProvider')
  return ctx
}

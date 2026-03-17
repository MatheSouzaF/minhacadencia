import { useState } from 'react'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMonthly } from '@/contexts/MonthlyContext'
import { GoalForm } from './GoalForm'
import { cn } from '@/utils/cn'
import type { MonthlyGoal } from '@/types'

interface GoalsListProps {
  month: string  // "2026-03"
}

export function GoalsList({ month }: GoalsListProps) {
  const { goals, addGoal, updateGoal, deleteGoal, toggleEntry } = useMonthly()
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<MonthlyGoal | null>(null)

  const todayISO = format(new Date(), 'yyyy-MM-dd')
  const monthDate = parse(month, 'yyyy-MM', new Date())
  const monthName = format(monthDate, 'MMMM', { locale: ptBR })

  async function handleSaveNew(data: Omit<MonthlyGoal, 'id' | 'entries'>) {
    await addGoal(data)
    setShowForm(false)
  }

  async function handleSaveEdit(data: Omit<MonthlyGoal, 'id' | 'entries'>) {
    if (!editGoal) return
    await updateGoal(editGoal.id, data)
    setEditGoal(null)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Deletar esta meta?')) return
    await deleteGoal(id)
  }

  async function handleToggleToday(goalId: string) {
    await toggleEntry(goalId, todayISO)
  }

  const isCurrentMonth = month === format(new Date(), 'yyyy-MM')

  return (
    <>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text)] capitalize">
            Metas de {monthName}
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--gold)] hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova meta
          </button>
        </div>

        {/* Goals */}
        {goals.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-2 text-center">
            Nenhuma meta ainda. Crie a primeira!
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const checkedToday = goal.entries.includes(todayISO)
              const doneCount = goal.entries.length
              const percent = goal.target > 0
                ? Math.min(100, Math.round((doneCount / goal.target) * 100))
                : 0

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="group relative bg-[var(--surface)] rounded-xl p-3 space-y-2"
                >
                  {/* Goal header */}
                  <div className="flex items-center gap-2">
                    {/* Color dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-base">{goal.emoji}</span>
                    <span
                      className="flex-1 text-sm font-medium text-[var(--text)] cursor-pointer hover:text-[var(--gold)] transition-colors"
                      onClick={() => setEditGoal(goal)}
                    >
                      {goal.title}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">
                      {doneCount}/{goal.target} {goal.unit}
                    </span>

                    {/* Today toggle */}
                    {isCurrentMonth && (
                      <button
                        onClick={() => handleToggleToday(goal.id)}
                        title={checkedToday ? 'Desmarcar hoje' : 'Marcar hoje'}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                          checkedToday
                            ? 'bg-[color-mix(in_srgb,var(--green)_20%,transparent)] text-[var(--green)]'
                            : 'bg-gray-200 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-gray-300'
                        )}
                      >
                        {checkedToday ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">hoje</span>
                      </button>
                    )}

                    {/* Delete on hover */}
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-md text-[var(--text-muted)] hover:text-[var(--rose)] hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: percent >= 100 ? 'var(--green)' : goal.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] w-8 text-right">
                      {percent}%
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* New goal form */}
      {showForm && (
        <GoalForm
          month={month}
          onSave={handleSaveNew}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit goal form */}
      {editGoal && (
        <GoalForm
          month={month}
          initialData={editGoal}
          onSave={handleSaveEdit}
          onCancel={() => setEditGoal(null)}
        />
      )}
    </>
  )
}

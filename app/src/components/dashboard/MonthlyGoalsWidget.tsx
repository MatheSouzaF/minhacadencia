import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useMonthly } from '@/contexts/MonthlyContext'

export function MonthlyGoalsWidget() {
  const { goals } = useMonthly()
  const visibleGoals = goals.slice(0, 3)

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-[var(--text)]">Metas do Mês</h3>
        <Link
          to="/mensal"
          className="flex items-center gap-1 text-xs text-[var(--gold)] hover:opacity-80 transition-opacity"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Goals */}
      {visibleGoals.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-muted)]">Nenhuma meta criada.</p>
          <Link
            to="/mensal"
            className="text-xs text-[var(--gold)] hover:opacity-80 transition-opacity mt-1 inline-block"
          >
            Criar primeira meta →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleGoals.map((goal) => {
            const doneCount = goal.entries.length
            const percent = goal.target > 0
              ? Math.min(100, Math.round((doneCount / goal.target) * 100))
              : 0

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{goal.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-[var(--text)] truncate">{goal.title}</span>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">
                    {doneCount}/{goal.target} {goal.unit}
                  </span>
                  <span className="text-xs font-semibold shrink-0" style={{ color: goal.color }}>
                    {percent}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: percent >= 100 ? 'var(--green)' : goal.color,
                    }}
                  />
                </div>
              </div>
            )
          })}

          {goals.length > 3 && (
            <p className="text-xs text-[var(--text-muted)] text-center pt-1">
              +{goals.length - 3} mais →{' '}
              <Link to="/mensal" className="text-[var(--gold)] hover:opacity-80 transition-opacity">
                Ver todas
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

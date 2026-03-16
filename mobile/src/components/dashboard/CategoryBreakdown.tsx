import type { CategoryProgressData } from '@/hooks/useProgress'
import { CATEGORY_ICONS } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  work: 'var(--work)', jiu: 'var(--blue)', pray: 'var(--gold)',
  read: 'var(--orange)', study: 'var(--purple)', video: 'var(--rose)',
  free: 'var(--green)', missa: 'var(--gold-light)', travel: 'var(--text-muted)',
}

interface CategoryBreakdownProps {
  categories: CategoryProgressData[]
  title?: string
}

export function CategoryBreakdown({ categories, title = 'Por categoria' }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="font-serif text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--text-muted)]">Nenhum dado disponível ainda.</p>
      </div>
    )
  }

  const sorted = [...categories].sort((a, b) => b.percent - a.percent)

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
      <h3 className="font-serif text-lg font-semibold text-[var(--text)]">{title}</h3>

      <div className="space-y-3">
        {sorted.map(({ category, label, total, checked, percent }) => {
          const color = CATEGORY_COLORS[category]
          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{CATEGORY_ICONS[category]}</span>
                  <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">{checked}/{total}</span>
                  <span
                    className="text-sm font-bold tabular-nums w-10 text-right"
                    style={{ color }}
                  >
                    {percent}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

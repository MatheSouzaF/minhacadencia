import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'
import type { WeekProgressData } from '@/hooks/useProgress'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CATEGORY_ICONS } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  work: 'var(--work)', jiu: 'var(--blue)', pray: 'var(--gold)',
  read: 'var(--orange)', study: 'var(--purple)', video: 'var(--rose)',
  free: 'var(--green)', missa: 'var(--gold-light)', travel: 'var(--text-muted)',
}

interface WeekProgressProps {
  data: WeekProgressData
}

export function WeekProgress({ data }: WeekProgressProps) {
  const todayISO = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[var(--text)]">Esta semana</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{data.checked}/{data.total} slots concluídos</p>
        </div>
        <span className="text-3xl font-bold text-[var(--gold)]">{data.percent}%</span>
      </div>

      {/* Barra geral */}
      <Progress value={data.percent} className="h-2.5" />

      {/* Mini barras por dia */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Dia a dia</p>
        <div className="grid grid-cols-7 gap-1.5">
          {data.days.map(({ day, label, date, total, checked, percent }) => {
            const isToday = date === todayISO
            const isFuture = date > todayISO
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                {/* Barra vertical */}
                <div className="relative w-full h-16 bg-[var(--border)] rounded-sm overflow-hidden">
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 transition-all duration-700',
                      isFuture ? 'bg-[var(--border)]' : percent === 100 ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'
                    )}
                    style={{ height: `${isFuture ? 0 : percent}%` }}
                  />
                </div>
                {/* Label */}
                <span className={cn(
                  'text-[10px] font-medium uppercase',
                  isToday ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'
                )}>
                  {label.slice(0, 3)}
                </span>
                {/* Count */}
                <span className="text-[10px] text-[var(--text-muted)]">
                  {isFuture ? `${total}` : `${checked}/${total}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Destaques */}
      {(data.bestCategory || data.worstCategory) && (
        <div className="grid grid-cols-2 gap-3">
          {data.bestCategory && (
            <div className="bg-[color-mix(in_srgb,var(--green)_8%,transparent)] border border-[color-mix(in_srgb,var(--green)_20%,transparent)] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--green)]" />
                <span className="text-xs text-[var(--text-muted)]">Mais cumprida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{CATEGORY_ICONS[data.bestCategory.category]}</span>
                <span className="text-sm font-medium text-[var(--text)]">{data.bestCategory.label}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: CATEGORY_COLORS[data.bestCategory.category] }}>
                {data.bestCategory.percent}%
              </span>
            </div>
          )}
          {data.worstCategory && data.worstCategory.category !== data.bestCategory?.category && (
            <div className="bg-[color-mix(in_srgb,var(--rose)_8%,transparent)] border border-[color-mix(in_srgb,var(--rose)_20%,transparent)] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-[var(--rose)]" />
                <span className="text-xs text-[var(--text-muted)]">Mais negligenciada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{CATEGORY_ICONS[data.worstCategory.category]}</span>
                <span className="text-sm font-medium text-[var(--text)]">{data.worstCategory.label}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: CATEGORY_COLORS[data.worstCategory.category] }}>
                {data.worstCategory.percent}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'
import type { DayProgressData } from '@/hooks/useProgress'
import { CATEGORY_ICONS } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  work: 'var(--work)', jiu: 'var(--blue)', pray: 'var(--gold)',
  read: 'var(--orange)', study: 'var(--purple)', video: 'var(--rose)',
  free: 'var(--green)', missa: 'var(--gold-light)', travel: 'var(--text-muted)',
}

interface DayProgressProps {
  data: DayProgressData
}

export function DayProgress({ data }: DayProgressProps) {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[var(--text)] capitalize">{today}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Progresso de hoje</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-[var(--gold)]">{data.percent}%</span>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{data.checked}/{data.total} slots</p>
        </div>
      </div>

      {/* Barra de progresso principal */}
      <Progress
        value={data.percent}
        className="h-3"
        indicatorClassName={data.percent === 100 ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'}
      />

      {/* Por categoria */}
      {data.byCategory.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Por categoria</p>
          <div className="space-y-2">
            {data.byCategory.map(({ category, label, checked, total, percent }) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-sm w-4">{CATEGORY_ICONS[category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-[var(--text-muted)]">{label}</span>
                    <span className="text-xs font-medium" style={{ color: CATEGORY_COLORS[category] }}>
                      {checked}/{total}
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-1.5"
                    indicatorClassName={cn(percent === 100 && 'bg-[var(--green)]')}
                    style={{ '--tw-bg-opacity': 1 } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pendentes */}
      {data.pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Pendentes
          </p>
          <div className="space-y-1">
            {data.pending.slice(0, 5).map(({ slotId, name, time, category }) => (
              <div key={slotId} className="flex items-center gap-2 text-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-[var(--text-muted)] font-mono text-xs">{time}</span>
                <span className="text-[var(--text)] truncate">{name}</span>
              </div>
            ))}
            {data.pending.length > 5 && (
              <p className="text-xs text-[var(--text-muted)] pl-3.5">
                +{data.pending.length - 5} mais...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Completo */}
      {data.percent === 100 && data.total > 0 && (
        <div className="flex items-center gap-2 text-[var(--green)] bg-[color-mix(in_srgb,var(--green)_10%,transparent)] rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Dia completo! Parabéns.</span>
        </div>
      )}
    </div>
  )
}

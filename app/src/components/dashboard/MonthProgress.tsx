import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/cn'
import type { MonthProgressData } from '@/hooks/useProgress'

interface MonthProgressProps {
  data: MonthProgressData
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function percentToColor(percent: number, total: number): string {
  if (total === 0) return 'var(--surface)'
  if (percent === 0)  return 'color-mix(in srgb, var(--rose) 25%, var(--surface))'
  if (percent < 40)   return 'color-mix(in srgb, var(--orange) 30%, var(--surface))'
  if (percent < 70)   return 'color-mix(in srgb, var(--gold) 40%, var(--surface))'
  if (percent < 100)  return 'color-mix(in srgb, var(--gold) 65%, var(--surface))'
  return 'color-mix(in srgb, var(--green) 70%, var(--surface))'
}

export function MonthProgress({ data }: MonthProgressProps) {
  const now = new Date()
  const todayISO = format(now, 'yyyy-MM-dd')
  const monthName = format(now, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[var(--text)] capitalize">{monthName}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{data.checked}/{data.total} slots concluídos</p>
        </div>
        <span className="text-3xl font-bold text-[var(--gold)]">{data.percent}%</span>
      </div>

      {/* Legenda dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{d}</div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="grid grid-cols-7 gap-1">
        {data.heatmap.map((cell, i) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${i}`} className="aspect-square rounded-sm" />
          }

          const dayNum = cell.date ? parseInt(cell.date.split('-')[2]) : 0
          const isToday = cell.date === todayISO
          const isFuture = cell.date > todayISO
          const bg = isFuture ? 'var(--surface)' : percentToColor(cell.percent, cell.total)

          return (
            <Tooltip key={cell.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'aspect-square rounded-sm flex items-center justify-center transition-all duration-200',
                    'text-[10px] font-medium cursor-help',
                    isToday && 'ring-1 ring-[var(--gold)] ring-offset-1 ring-offset-[var(--card)]',
                    !isFuture && 'hover:scale-110 hover:z-10 hover:ring-1 hover:ring-[var(--text-muted)]'
                  )}
                  style={{ backgroundColor: bg, color: cell.percent > 50 && !isFuture ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)' }}
                >
                  {dayNum}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{format(new Date(cell.date + 'T12:00:00'), "d 'de' MMM", { locale: ptBR })}</p>
                  {isFuture ? (
                    <p className="text-[var(--text-muted)]">{cell.total} slots planejados</p>
                  ) : (
                    <p>{cell.checked}/{cell.total} — {cell.percent}%</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Legenda de cores */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[10px] text-[var(--text-muted)]">Menos</span>
        {[0, 25, 50, 75, 100].map((p) => (
          <div
            key={p}
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: percentToColor(p, 1) }}
          />
        ))}
        <span className="text-[10px] text-[var(--text-muted)]">Mais</span>
      </div>
    </div>
  )
}

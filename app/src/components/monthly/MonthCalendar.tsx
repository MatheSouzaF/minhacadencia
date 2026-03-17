import { format, parse, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useMonthProgress } from '@/hooks/useProgress'

interface MonthCalendarProps {
  month: string           // "2026-03"
  selectedDay: string     // "2026-03-16"
  onSelectDay: (date: string) => void
  onChangeMonth: (month: string) => void
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

export function MonthCalendar({ month, selectedDay, onSelectDay, onChangeMonth }: MonthCalendarProps) {
  const monthData = useMonthProgress(month)
  const todayISO = format(new Date(), 'yyyy-MM-dd')

  const monthDate = parse(month, 'yyyy-MM', new Date())
  const monthLabel = format(monthDate, 'MMMM yyyy', { locale: ptBR })

  function handlePrev() {
    onChangeMonth(format(subMonths(monthDate, 1), 'yyyy-MM'))
  }

  function handleNext() {
    onChangeMonth(format(addMonths(monthDate, 1), 'yyyy-MM'))
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col h-full">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-[var(--text)] capitalize text-base">
          {monthLabel}
        </h3>
        <button
          onClick={handleNext}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-[11px] font-medium text-[var(--text-muted)] uppercase">{d}</div>
        ))}
      </div>

      {/* Calendar cells — preenche toda a altura restante */}
      <div className="grid grid-cols-7 auto-rows-fr gap-1 flex-1 min-h-0">
        {monthData.heatmap.map((cell, i) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${i}`} className="rounded-lg" />
          }

          const dayNum = cell.date ? parseInt(cell.date.split('-')[2]) : 0
          const isToday = cell.date === todayISO
          const isFuture = cell.date > todayISO
          const isSelected = cell.date === selectedDay
          const bg = isFuture ? 'var(--surface)' : percentToColor(cell.percent, cell.total)

          return (
            <button
              key={cell.date}
              onClick={() => onSelectDay(cell.date)}
              className={cn(
                'rounded-lg flex items-center justify-center transition-all duration-150',
                'text-sm font-medium cursor-pointer hover:scale-[1.03] hover:z-10',
                isFuture && 'opacity-40',
                isToday && 'ring-2 ring-[var(--gold)] ring-offset-1 ring-offset-[var(--card)]',
                isSelected && !isToday && 'ring-2 ring-white/60 ring-offset-1 ring-offset-[var(--card)]',
              )}
              style={{
                backgroundColor: bg,
                color: cell.percent > 50 && !isFuture ? 'rgba(0,0,0,0.7)' : 'var(--text-muted)',
              }}
            >
              {dayNum}
            </button>
          )
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 mt-3 border-t border-[var(--border)]">
        <span>{monthData.checked}/{monthData.total} slots</span>
        <span className="font-semibold text-[var(--gold)]">{monthData.percent}%</span>
      </div>
    </div>
  )
}

import { useSchedule } from '@/contexts/ScheduleContext'
import { usePomodoro } from '@/contexts/PomodoroContext'
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer'
import { PomodoroSettings } from '@/components/pomodoro/PomodoroSettings'
import { getTodayDayOfWeek } from '@/types'
import { useCategories } from '@/contexts/CategoryContext'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { Link2, Link2Off } from 'lucide-react'

export function PomodoroPage() {
  const { state } = useSchedule()
  const { timer, linkSlot } = usePomodoro()
  const { getCategoryById } = useCategories()
  const today = getTodayDayOfWeek()
  const todaySchedule = state.schedule.find((d) => d.day === today)
  const todayISO = format(new Date(), 'yyyy-MM-dd')
  const dayChecks = state.checks[todayISO]?.checks ?? {}

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-6 gap-8">
      {/* Timer central */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-[var(--text)]">Foco total</h2>
          <PomodoroSettings />
        </div>

        {/* Slot vinculado */}
        {timer.linkedSlotId && todaySchedule && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            <span>Focando em:</span>
            <span className="text-[var(--gold)] font-medium">
              {todaySchedule.slots.find((s) => s.id === timer.linkedSlotId)?.name ?? '—'}
            </span>
            <button
              onClick={() => linkSlot(undefined)}
              className="text-[var(--text-muted)] hover:text-[var(--rose)] transition-colors ml-1 cursor-pointer"
            >
              <Link2Off className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <PomodoroTimer />
      </div>

      {/* Slots do dia para vincular */}
      {todaySchedule && todaySchedule.slots.length > 0 && (
        <div className="w-full max-w-md">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-3 text-center">
            Vincular a um slot de hoje
          </p>
          <div className="space-y-1.5">
            {todaySchedule.slots.map((slot) => {
              const isLinked = timer.linkedSlotId === slot.id
              const isDone = dayChecks[slot.id]
              return (
                <button
                  key={slot.id}
                  onClick={() => linkSlot(isLinked ? undefined : slot.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer',
                    'border transition-all duration-200',
                    isLinked
                      ? 'border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] hover:bg-[color-mix(in_srgb,var(--gold)_15%,transparent)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--border)_50%,var(--text-muted))] hover:bg-[color-mix(in_srgb,var(--text-muted)_8%,var(--surface))]',
                    isDone && 'opacity-40'
                  )}
                >
                  <span className="text-sm">{getCategoryById(slot.category)?.emoji ?? ''}</span>
                  <div className="flex-1 min-w-0">
                    <span className={cn('text-sm', isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]')}>
                      {slot.name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] ml-2 font-mono">{slot.time}</span>
                  </div>
                  {isLinked && <Link2 className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

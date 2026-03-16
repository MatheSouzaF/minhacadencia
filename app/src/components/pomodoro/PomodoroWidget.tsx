import { useState } from 'react'
import { Timer, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { usePomodoro } from '@/contexts/PomodoroContext'
import { PomodoroTimer } from './PomodoroTimer'
import { useLocation } from 'react-router-dom'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function PomodoroWidget() {
  const { timer } = usePomodoro()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Não mostrar na página de pomodoro (já tem o timer completo)
  if (pathname === '/pomodoro') return null

  const isActive = timer.isRunning || timer.phase !== 'idle'

  return (
    <>
      {/* Botão flutuante — apenas desktop */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer',
          'border shadow-lg transition-all duration-300',
          isActive
            ? 'bg-[var(--gold)] text-[var(--bg)] border-[var(--gold-light)] shadow-[0_0_20px_color-mix(in_srgb,var(--gold)_40%,transparent)]'
            : 'bg-[var(--card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
        )}
      >
        <Timer className="w-4 h-4" />
        {isActive && (
          <span className="text-sm font-mono font-bold tabular-nums">
            {formatTime(timer.secondsLeft)}
          </span>
        )}
        {!isActive && <span className="text-sm font-medium">Pomodoro</span>}
      </button>

      {/* Popover compacto — apenas desktop */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className={cn(
            'hidden md:block fixed bottom-20 right-6 z-50',
            'bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl',
            'w-64'
          )}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-[var(--text)]">Pomodoro</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <PomodoroTimer compact />
          </div>
        </>
      )}
    </>
  )
}

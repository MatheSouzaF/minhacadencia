import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { usePomodoro } from '@/contexts/PomodoroContext'
import type { PomodoroPhase } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  idle:          'Pronto para focar',
  focus:         'Foco',
  'short-break': 'Pausa curta',
  'long-break':  'Pausa longa',
}

const PHASE_COLORS: Record<PomodoroPhase, string> = {
  idle:          'var(--text-muted)',
  focus:         'var(--gold)',
  'short-break': 'var(--green)',
  'long-break':  'var(--blue)',
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface PomodoroTimerProps {
  compact?: boolean
}

export function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const { timer, config, start, pause, reset, skip } = usePomodoro()
  const { phase, secondsLeft, isRunning, sessionCount } = timer

  const totalSeconds = (() => {
    if (phase === 'focus' || phase === 'idle') return config.focusMinutes * 60
    if (phase === 'short-break') return config.shortBreak * 60
    return config.longBreak * 60
  })()

  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0
  const phaseColor = PHASE_COLORS[phase]

  // Mobile full: width=280, viewBox="0 0 200 200", r=80, cx/cy=100
  // Compact: smaller ring
  const size = compact ? 96 : 280
  const vbSize = compact ? 80 : 200
  const cx = compact ? 40 : 100
  const r = compact ? 36 : 80
  const strokeWidth = compact ? 4 : 6
  const circumference = 2 * Math.PI * r

  return (
    <div className={cn('flex flex-col items-center', compact ? 'gap-2' : 'gap-5')}>
      {/* Label da fase */}
      <div className="text-center">
        <p
          className={cn('font-medium uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
          style={{ color: phaseColor }}
        >
          {PHASE_LABELS[phase]}
        </p>
        {!compact && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Sessão {sessionCount + 1} • {config.sessionsUntilLong - (sessionCount % config.sessionsUntilLong)} até pausa longa
          </p>
        )}
      </div>

      {/* Círculo SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${vbSize} ${vbSize}`}
          className="-rotate-90"
        >
          {/* Trilha */}
          <circle
            cx={cx} cy={cx}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Progresso */}
          <circle
            cx={cx} cy={cx}
            r={r}
            fill="none"
            stroke={phaseColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        {/* Timer no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn('font-mono font-bold tabular-nums', compact ? 'text-xl' : 'text-4xl')}
            style={{ color: phaseColor }}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Indicadores de sessão */}
      {!compact && (
        <div className="flex gap-2">
          {Array.from({ length: config.sessionsUntilLong }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                i < sessionCount % config.sessionsUntilLong
                  ? 'bg-[var(--gold)]'
                  : 'bg-[var(--border)]'
              )}
            />
          ))}
        </div>
      )}

      {/* Controles */}
      <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-4')}>
        <Button
          variant="ghost"
          size={compact ? 'icon-sm' : 'icon'}
          onClick={reset}
          className={cn('text-[var(--text-muted)] hover:text-[var(--text)]', !compact && 'w-12 h-12')}
        >
          <RotateCcw className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
        </Button>

        <Button
          variant="default"
          size={compact ? 'icon' : 'lg'}
          onClick={isRunning ? pause : start}
          className={cn(
            'font-semibold',
            !compact && 'w-16 h-16 rounded-full text-lg',
            phase === 'focus' || phase === 'idle'
              ? 'bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--bg)]'
              : phase === 'short-break'
                ? 'bg-[var(--green)] hover:opacity-90 text-[var(--bg)]'
                : 'bg-[var(--blue)] hover:opacity-90 text-[var(--bg)]'
          )}
        >
          {isRunning
            ? <Pause className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
            : <Play  className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
          }
        </Button>

        <Button
          variant="ghost"
          size={compact ? 'icon-sm' : 'icon'}
          onClick={skip}
          className={cn('text-[var(--text-muted)] hover:text-[var(--text)]', !compact && 'w-12 h-12')}
        >
          <SkipForward className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
        </Button>
      </div>
    </div>
  )
}

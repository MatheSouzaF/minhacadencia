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
  const circumference = 2 * Math.PI * (compact ? 36 : 80)

  return (
    <div className={cn('flex flex-col items-center gap-4', compact ? 'gap-2' : 'gap-6')}>
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

      {/* Círculo SVG com progresso */}
      <div className="relative" style={{ width: compact ? 96 : 220, height: compact ? 96 : 220 }}>
        <svg
          viewBox={compact ? '0 0 80 80' : '0 0 180 180'}
          className="w-full h-full -rotate-90"
        >
          {/* Trilha */}
          <circle
            cx={compact ? 40 : 90} cy={compact ? 40 : 90}
            r={compact ? 36 : 80}
            fill="none"
            stroke="var(--border)"
            strokeWidth={compact ? 4 : 6}
          />
          {/* Progresso */}
          <circle
            cx={compact ? 40 : 90} cy={compact ? 40 : 90}
            r={compact ? 36 : 80}
            fill="none"
            stroke={phaseColor}
            strokeWidth={compact ? 4 : 6}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        {/* Timer no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn('font-mono font-bold tabular-nums', compact ? 'text-xl' : 'text-5xl')}
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
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                i < sessionCount % config.sessionsUntilLong
                  ? 'bg-[var(--gold)]'
                  : 'bg-[var(--border)]'
              )}
            />
          ))}
        </div>
      )}

      {/* Controles */}
      <div className={cn('flex items-center', compact ? 'gap-1.5' : 'gap-3')}>
        <Button
          variant="ghost"
          size={compact ? 'icon-sm' : 'icon'}
          onClick={reset}
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <RotateCcw className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </Button>

        <Button
          variant="default"
          size={compact ? 'icon' : 'lg'}
          onClick={isRunning ? pause : start}
          className={cn(
            'font-semibold',
            !compact && 'px-8 gap-2',
            phase === 'focus' || phase === 'idle'
              ? 'bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--bg)]'
              : phase === 'short-break'
                ? 'bg-[var(--green)] hover:opacity-90 text-[var(--bg)]'
                : 'bg-[var(--blue)] hover:opacity-90 text-[var(--bg)]'
          )}
        >
          {isRunning ? (
            <><Pause className={compact ? 'w-4 h-4' : 'w-5 h-5'} /></>
          ) : (
            <><Play className={compact ? 'w-4 h-4' : 'w-5 h-5'} />{!compact && 'Iniciar'}</>
          )}
        </Button>

        <Button
          variant="ghost"
          size={compact ? 'icon-sm' : 'icon'}
          onClick={skip}
          className="text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <SkipForward className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </Button>
      </div>
    </div>
  )
}

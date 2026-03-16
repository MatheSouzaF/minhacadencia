import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { PomodoroConfig, PomodoroPhase, PomodoroState } from '@/types'
import { defaultPomodoroConfig } from '@/data/schedule.seed'

// ─── Actions ─────────────────────────────────────────────────────────────────

type PomodoroAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'TICK' }
  | { type: 'LINK_SLOT'; payload: string | undefined }
  | { type: 'UPDATE_CONFIG'; payload: Partial<PomodoroConfig> }
  | { type: 'LOAD_CONFIG'; payload: PomodoroConfig }

// ─── Estado combinado ────────────────────────────────────────────────────────

interface PomodoroFullState {
  timer: PomodoroState
  config: PomodoroConfig
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function phaseSeconds(phase: PomodoroPhase, config: PomodoroConfig): number {
  switch (phase) {
    case 'focus':       return config.focusMinutes * 60
    case 'short-break': return config.shortBreak * 60
    case 'long-break':  return config.longBreak * 60
    default:            return config.focusMinutes * 60
  }
}

function nextPhase(current: PomodoroPhase, sessionCount: number, sessionsUntilLong: number): PomodoroPhase {
  if (current !== 'focus') return 'focus'
  const newCount = sessionCount + 1
  return newCount % sessionsUntilLong === 0 ? 'long-break' : 'short-break'
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function pomodoroReducer(state: PomodoroFullState, action: PomodoroAction): PomodoroFullState {
  const { timer, config } = state

  switch (action.type) {
    case 'START':
      return { ...state, timer: { ...timer, isRunning: true, phase: timer.phase === 'idle' ? 'focus' : timer.phase } }

    case 'PAUSE':
      return { ...state, timer: { ...timer, isRunning: false } }

    case 'RESET':
      return {
        ...state,
        timer: {
          phase: 'idle',
          secondsLeft: config.focusMinutes * 60,
          sessionCount: timer.sessionCount,
          isRunning: false,
          linkedSlotId: timer.linkedSlotId,
        },
      }

    case 'SKIP': {
      const newPhase = nextPhase(timer.phase, timer.sessionCount, config.sessionsUntilLong)
      const newCount = timer.phase === 'focus' ? timer.sessionCount + 1 : timer.sessionCount
      return {
        ...state,
        timer: {
          ...timer,
          phase: newPhase,
          secondsLeft: phaseSeconds(newPhase, config),
          sessionCount: newCount,
          isRunning: false,
        },
      }
    }

    case 'TICK': {
      if (!timer.isRunning || timer.secondsLeft <= 0) return state
      if (timer.secondsLeft === 1) {
        // Sessão terminou — avança fase
        const newPhase = nextPhase(timer.phase, timer.sessionCount, config.sessionsUntilLong)
        const newCount = timer.phase === 'focus' ? timer.sessionCount + 1 : timer.sessionCount
        return {
          ...state,
          timer: {
            ...timer,
            phase: newPhase,
            secondsLeft: phaseSeconds(newPhase, config),
            sessionCount: newCount,
            isRunning: false,
          },
        }
      }
      return { ...state, timer: { ...timer, secondsLeft: timer.secondsLeft - 1 } }
    }

    case 'LINK_SLOT':
      return { ...state, timer: { ...timer, linkedSlotId: action.payload } }

    case 'UPDATE_CONFIG': {
      const newConfig = { ...config, ...action.payload }
      // Recalcula secondsLeft se não está rodando
      const newSeconds = timer.isRunning
        ? timer.secondsLeft
        : phaseSeconds(timer.phase === 'idle' ? 'focus' : timer.phase, newConfig)
      return {
        config: newConfig,
        timer: { ...timer, secondsLeft: newSeconds },
      }
    }

    case 'LOAD_CONFIG':
      return { ...state, config: action.payload }

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface PomodoroContextValue {
  timer: PomodoroState
  config: PomodoroConfig
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  linkSlot: (slotId: string | undefined) => void
  updateConfig: (changes: Partial<PomodoroConfig>) => void
  onSessionComplete?: () => void
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

// ─── Som via AudioContext ─────────────────────────────────────────────────────

function playBeep(type: 'focus' | 'break') {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(type === 'focus' ? 880 : 440, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)

    // Segundo beep para sessão de foco
    if (type === 'focus') {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.3)
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.3)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1)
      osc2.start(ctx.currentTime + 0.3)
      osc2.stop(ctx.currentTime + 1.1)
    }
  } catch {
    // AudioContext não disponível
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const LS_POMODORO = 'rotina:pomodoro'

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pomodoroReducer, {
    timer: {
      phase: 'idle',
      secondsLeft: defaultPomodoroConfig.focusMinutes * 60,
      sessionCount: 0,
      isRunning: false,
    },
    config: defaultPomodoroConfig,
  })

  const prevPhaseRef = useRef(state.timer.phase)

  // Carrega config do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_POMODORO)
      if (saved) {
        const config = JSON.parse(saved) as PomodoroConfig
        dispatch({ type: 'LOAD_CONFIG', payload: config })
      }
    } catch { /* ignore */ }
  }, [])

  // Persiste config
  useEffect(() => {
    try {
      localStorage.setItem(LS_POMODORO, JSON.stringify(state.config))
    } catch { /* ignore */ }
  }, [state.config])

  // setInterval do timer
  useEffect(() => {
    if (!state.timer.isRunning) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [state.timer.isRunning])

  // Som quando fase muda
  useEffect(() => {
    const prev = prevPhaseRef.current
    const curr = state.timer.phase
    if (prev !== curr && prev !== 'idle' && state.config.soundEnabled) {
      playBeep(curr === 'focus' ? 'focus' : 'break')
    }
    prevPhaseRef.current = curr
  }, [state.timer.phase, state.config.soundEnabled])

  const start = useCallback(() => dispatch({ type: 'START' }), [])
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])
  const skip = useCallback(() => dispatch({ type: 'SKIP' }), [])
  const linkSlot = useCallback((id: string | undefined) => dispatch({ type: 'LINK_SLOT', payload: id }), [])
  const updateConfig = useCallback((changes: Partial<PomodoroConfig>) => dispatch({ type: 'UPDATE_CONFIG', payload: changes }), [])

  return (
    <PomodoroContext.Provider value={{ timer: state.timer, config: state.config, start, pause, reset, skip, linkSlot, updateConfig }}>
      {children}
    </PomodoroContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider')
  return ctx
}

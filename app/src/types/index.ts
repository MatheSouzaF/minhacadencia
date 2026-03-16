// ─── Categoria dinâmica do usuário ──────────────────────────────────────────
export interface UserCategory {
  id: string        // slug único ex: "work", "jiu", ou uuid para customizadas
  name: string      // ex: "Trabalho"
  emoji: string     // ex: "💼"
  color: string     // CSS var ou hex ex: "var(--gold)" | "#f59e0b"
}

// Category agora é apenas string (id da UserCategory)
export type Category = string

// ─── Categorias padrão (sugestões no onboarding) ────────────────────────────
export const DEFAULT_CATEGORIES: UserCategory[] = [
  { id: 'work',   name: 'Trabalho',     emoji: '💼', color: 'var(--work)'       },
  { id: 'jiu',    name: 'Jiu-Jitsu',    emoji: '🥋', color: 'var(--blue)'       },
  { id: 'pray',   name: 'Oração',       emoji: '🙏', color: 'var(--gold)'       },
  { id: 'read',   name: 'Leitura',      emoji: '📚', color: 'var(--orange)'     },
  { id: 'study',  name: 'Estudos',      emoji: '⛪', color: 'var(--purple)'     },
  { id: 'video',  name: 'Vídeo',        emoji: '🎥', color: 'var(--rose)'       },
  { id: 'free',   name: 'Livre',        emoji: '💚', color: 'var(--green)'      },
  { id: 'missa',  name: 'Missa',        emoji: '✝️', color: 'var(--gold-light)' },
  { id: 'travel', name: 'Deslocamento', emoji: '🚌', color: 'var(--text-muted)' },
]

// Cores disponíveis para o usuário escolher
export const PALETTE_COLORS = [
  { label: 'Dourado',    value: 'var(--gold)'       },
  { label: 'Azul',       value: 'var(--blue)'       },
  { label: 'Rosa',       value: 'var(--rose)'       },
  { label: 'Verde',      value: 'var(--green)'      },
  { label: 'Roxo',       value: 'var(--purple)'     },
  { label: 'Laranja',    value: 'var(--orange)'     },
  { label: 'Trabalho',   value: 'var(--work)'       },
  { label: 'Cinza',      value: 'var(--text-muted)' },
  { label: 'Dourado claro', value: 'var(--gold-light)' },
]

// ─── Dias da semana ─────────────────────────────────────────────────────────
export type DayOfWeek =
  | 'segunda' | 'terca' | 'quarta' | 'quinta'
  | 'sexta' | 'sabado' | 'domingo'

// ─── Tag visual do dia ──────────────────────────────────────────────────────
export type TagType = 'jiu' | 'home' | 'namorada' | 'livre' | 'missa'

// ─── Slot — uma atividade num horário do dia ────────────────────────────────
export interface Slot {
  id: string
  time: string
  name: string
  icon?: string
  note?: string
  category: Category
  order: number
}

// ─── Cronograma de um dia ───────────────────────────────────────────────────
export interface DaySchedule {
  day: DayOfWeek
  label: string
  tag: string
  tagType: TagType
  slots: Slot[]
}

// ─── Checks de um dia (por data real, não por dia-da-semana) ────────────────
export interface DayCheck {
  date: string
  checks: {
    [slotId: string]: boolean
  }
}

// ─── Config do Pomodoro ─────────────────────────────────────────────────────
export interface PomodoroConfig {
  focusMinutes: number
  shortBreak: number
  longBreak: number
  sessionsUntilLong: number
  soundEnabled: boolean
}

// ─── Estado do Pomodoro ─────────────────────────────────────────────────────
export type PomodoroPhase = 'idle' | 'focus' | 'short-break' | 'long-break'

export interface PomodoroState {
  phase: PomodoroPhase
  secondsLeft: number
  sessionCount: number
  isRunning: boolean
  linkedSlotId?: string
}

// ─── Estado global da aplicação ─────────────────────────────────────────────
export interface AppState {
  schedule: DaySchedule[]
  checks: Record<string, DayCheck>
  pomodoroConfig: PomodoroConfig
}

export const DAY_ORDER: DayOfWeek[] = [
  'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
]

export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay()
  const map: Record<number, DayOfWeek> = {
    0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
    4: 'quinta',  5: 'sexta',   6: 'sabado',
  }
  return map[jsDay]
}

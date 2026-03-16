// ─── Categorias de atividade ────────────────────────────────────────────────
export type Category =
  | 'work'    // Trabalho presencial (azul escuro)
  | 'jiu'     // Jiu-Jitsu (azul)
  | 'pray'    // Oração (dourado)
  | 'read'    // Leitura (laranja)
  | 'study'   // Estudos Igreja (roxo)
  | 'video'   // Gravação/Edição de vídeo (rosa)
  | 'free'    // Tempo livre / namorada (verde)
  | 'missa'   // Missa dominical (dourado claro)
  | 'travel'  // Deslocamento (cinza)

// ─── Dias da semana ─────────────────────────────────────────────────────────
export type DayOfWeek =
  | 'segunda' | 'terca' | 'quarta' | 'quinta'
  | 'sexta' | 'sabado' | 'domingo'

// ─── Tag visual do dia ──────────────────────────────────────────────────────
export type TagType = 'jiu' | 'home' | 'namorada' | 'livre' | 'missa'

// ─── Slot — uma atividade num horário do dia ────────────────────────────────
export interface Slot {
  id: string           // uuid
  time: string         // ex: "05h45" | "06h00–08h10"
  name: string         // ex: "Oração matinal"
  icon?: string        // emoji ou nome do ícone lucide
  note?: string        // observação opcional
  category: Category
  order: number        // para drag-and-drop
}

// ─── Cronograma de um dia ───────────────────────────────────────────────────
export interface DaySchedule {
  day: DayOfWeek
  label: string        // "Segunda", "Terça"...
  tag: string          // "Jiu + Empresa", "Home Office"...
  tagType: TagType
  slots: Slot[]
}

// ─── Checks de um dia (por data real, não por dia-da-semana) ────────────────
export interface DayCheck {
  date: string         // ISO date: "2026-03-09"
  checks: {
    [slotId: string]: boolean
  }
}

// ─── Config do Pomodoro ─────────────────────────────────────────────────────
export interface PomodoroConfig {
  focusMinutes: number       // padrão: 25
  shortBreak: number         // padrão: 5
  longBreak: number          // padrão: 15
  sessionsUntilLong: number  // padrão: 4
  soundEnabled: boolean
}

// ─── Estado do Pomodoro ─────────────────────────────────────────────────────
export type PomodoroPhase = 'idle' | 'focus' | 'short-break' | 'long-break'

export interface PomodoroState {
  phase: PomodoroPhase
  secondsLeft: number
  sessionCount: number   // número de sessões de foco completadas
  isRunning: boolean
  linkedSlotId?: string  // slot ao qual a sessão está vinculada
}

// ─── Estado global da aplicação ─────────────────────────────────────────────
export interface AppState {
  schedule: DaySchedule[]
  checks: Record<string, DayCheck>   // chave: ISO date "YYYY-MM-DD"
  pomodoroConfig: PomodoroConfig
}

// ─── Mapeamento de categorias ───────────────────────────────────────────────
export const CATEGORY_LABELS: Record<Category, string> = {
  work:   'Trabalho',
  jiu:    'Jiu-Jitsu',
  pray:   'Oração',
  read:   'Leitura',
  study:  'Estudos',
  video:  'Vídeo',
  free:   'Livre',
  missa:  'Missa',
  travel: 'Deslocamento',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  work:   '💼',
  jiu:    '🥋',
  pray:   '🙏',
  read:   '📚',
  study:  '⛪',
  video:  '🎥',
  free:   '💚',
  missa:  '✝️',
  travel: '🚌',
}

export const DAY_ORDER: DayOfWeek[] = [
  'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
]

// Retorna o dia da semana atual como DayOfWeek (0=domingo, 1=segunda, ...)
export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay() // 0=Sun
  const map: Record<number, DayOfWeek> = {
    0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
    4: 'quinta', 5: 'sexta', 6: 'sabado',
  }
  return map[jsDay]
}

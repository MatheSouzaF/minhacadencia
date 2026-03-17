// ─── Categoria dinâmica do usuário ──────────────────────────────────────────
export interface UserCategory {
  id: string        // slug único ex: "work", "jiu", ou uuid para customizadas
  name: string      // ex: "Trabalho"
  emoji: string     // ex: "💼"
  color: string     // CSS var ou hex ex: "var(--gold)" | "#f59e0b"
  group?: string    // ex: "Profissional", "Saúde", "Fé"
}

// Category agora é apenas string (id da UserCategory)
export type Category = string

// ─── Grupos de categorias ───────────────────────────────────────────────────
export const CATEGORY_GROUPS = [
  'Profissional',
  'Saúde & Bem-estar',
  'Aprendizado',
  'Fé & Espiritualidade',
  'Esportes & Artes Marciais',
  'Vida Pessoal',
  'Criatividade & Hobby',
  'Digital & Conteúdo',
  'Logística',
] as const

// ─── Categorias padrão (sugestões no onboarding) ────────────────────────────
export const DEFAULT_CATEGORIES: UserCategory[] = [
  // Profissional
  { id: 'work',           name: 'Trabalho',         emoji: '💼', color: 'var(--work)',       group: 'Profissional' },
  { id: 'meetings',       name: 'Reuniões',          emoji: '🤝', color: 'var(--work)',       group: 'Profissional' },
  { id: 'freelance',      name: 'Freelance',         emoji: '💻', color: 'var(--blue)',       group: 'Profissional' },
  { id: 'networking',     name: 'Networking',        emoji: '🌐', color: 'var(--purple)',     group: 'Profissional' },
  { id: 'entrepreneur',   name: 'Empreendedorismo',  emoji: '🚀', color: 'var(--orange)',     group: 'Profissional' },
  { id: 'planning',       name: 'Planejamento',      emoji: '📋', color: 'var(--text-muted)', group: 'Profissional' },

  // Saúde & Bem-estar
  { id: 'health',         name: 'Saúde',             emoji: '❤️', color: 'var(--rose)',       group: 'Saúde & Bem-estar' },
  { id: 'meditation',     name: 'Meditação',         emoji: '🧘', color: 'var(--green)',      group: 'Saúde & Bem-estar' },
  { id: 'sleep',          name: 'Sono',              emoji: '😴', color: 'var(--purple)',     group: 'Saúde & Bem-estar' },
  { id: 'nutrition',      name: 'Nutrição',          emoji: '🥗', color: 'var(--green)',      group: 'Saúde & Bem-estar' },
  { id: 'therapy',        name: 'Terapia',           emoji: '🧠', color: 'var(--blue)',       group: 'Saúde & Bem-estar' },
  { id: 'doctor',         name: 'Médico',            emoji: '🏥', color: 'var(--rose)',       group: 'Saúde & Bem-estar' },

  // Aprendizado
  { id: 'study',          name: 'Estudos',           emoji: '📖', color: 'var(--purple)',     group: 'Aprendizado' },
  { id: 'read',           name: 'Leitura',           emoji: '📚', color: 'var(--orange)',     group: 'Aprendizado' },
  { id: 'courses',        name: 'Cursos',            emoji: '🎓', color: 'var(--blue)',       group: 'Aprendizado' },
  { id: 'language',       name: 'Idiomas',           emoji: '🗣️', color: 'var(--gold)',       group: 'Aprendizado' },
  { id: 'research',       name: 'Pesquisa',          emoji: '🔍', color: 'var(--text-muted)', group: 'Aprendizado' },
  { id: 'podcast',        name: 'Podcast',           emoji: '🎧', color: 'var(--purple)',     group: 'Aprendizado' },

  // Fé & Espiritualidade
  { id: 'pray',           name: 'Oração',            emoji: '🙏', color: 'var(--gold)',       group: 'Fé & Espiritualidade' },
  { id: 'missa',          name: 'Missa',             emoji: '✝️', color: 'var(--gold-light)', group: 'Fé & Espiritualidade' },
  { id: 'bible',          name: 'Bíblia',            emoji: '📖', color: 'var(--gold)',       group: 'Fé & Espiritualidade' },
  { id: 'retreat',        name: 'Retiro',            emoji: '⛺', color: 'var(--green)',      group: 'Fé & Espiritualidade' },
  { id: 'community',      name: 'Comunidade',        emoji: '👥', color: 'var(--orange)',     group: 'Fé & Espiritualidade' },
  { id: 'tithe',          name: 'Dízimo',            emoji: '💛', color: 'var(--gold-light)', group: 'Fé & Espiritualidade' },

  // Esportes & Artes Marciais
  { id: 'jiu',            name: 'Jiu-Jitsu',         emoji: '🥋', color: 'var(--blue)',       group: 'Esportes & Artes Marciais' },
  { id: 'gym',            name: 'Academia',          emoji: '🏋️', color: 'var(--rose)',       group: 'Esportes & Artes Marciais' },
  { id: 'run',            name: 'Corrida',           emoji: '🏃', color: 'var(--orange)',     group: 'Esportes & Artes Marciais' },
  { id: 'football',       name: 'Futebol',           emoji: '⚽', color: 'var(--green)',      group: 'Esportes & Artes Marciais' },
  { id: 'swim',           name: 'Natação',           emoji: '🏊', color: 'var(--blue)',       group: 'Esportes & Artes Marciais' },
  { id: 'bike',           name: 'Ciclismo',          emoji: '🚴', color: 'var(--green)',      group: 'Esportes & Artes Marciais' },
  { id: 'yoga',           name: 'Yoga',              emoji: '🧘', color: 'var(--purple)',     group: 'Esportes & Artes Marciais' },
  { id: 'martial',        name: 'Artes Marciais',    emoji: '🥊', color: 'var(--rose)',       group: 'Esportes & Artes Marciais' },
  { id: 'walk',           name: 'Caminhada',         emoji: '🚶', color: 'var(--green)',      group: 'Esportes & Artes Marciais' },

  // Vida Pessoal
  { id: 'family',         name: 'Família',           emoji: '👨‍👩‍👧', color: 'var(--gold)',       group: 'Vida Pessoal' },
  { id: 'relationship',   name: 'Relacionamento',    emoji: '💑', color: 'var(--rose)',       group: 'Vida Pessoal' },
  { id: 'finance',        name: 'Finanças',          emoji: '💰', color: 'var(--green)',      group: 'Vida Pessoal' },
  { id: 'house',          name: 'Casa',              emoji: '🏠', color: 'var(--orange)',     group: 'Vida Pessoal' },
  { id: 'shopping',       name: 'Compras',           emoji: '🛒', color: 'var(--text-muted)', group: 'Vida Pessoal' },
  { id: 'social',         name: 'Social',            emoji: '🎉', color: 'var(--purple)',     group: 'Vida Pessoal' },
  { id: 'free',           name: 'Tempo Livre',       emoji: '💚', color: 'var(--green)',      group: 'Vida Pessoal' },
  { id: 'pet',            name: 'Pet',               emoji: '🐾', color: 'var(--orange)',     group: 'Vida Pessoal' },

  // Criatividade & Hobby
  { id: 'music',          name: 'Música',            emoji: '🎵', color: 'var(--purple)',     group: 'Criatividade & Hobby' },
  { id: 'art',            name: 'Arte',              emoji: '🎨', color: 'var(--rose)',       group: 'Criatividade & Hobby' },
  { id: 'writing',        name: 'Escrita',           emoji: '✍️', color: 'var(--gold)',       group: 'Criatividade & Hobby' },
  { id: 'photo',          name: 'Fotografia',        emoji: '📷', color: 'var(--text-muted)', group: 'Criatividade & Hobby' },
  { id: 'games',          name: 'Jogos',             emoji: '🎮', color: 'var(--blue)',       group: 'Criatividade & Hobby' },
  { id: 'cooking',        name: 'Culinária',         emoji: '👨‍🍳', color: 'var(--orange)',     group: 'Criatividade & Hobby' },
  { id: 'craft',          name: 'Artesanato',        emoji: '🪡', color: 'var(--rose)',       group: 'Criatividade & Hobby' },
  { id: 'garden',         name: 'Jardinagem',        emoji: '🌱', color: 'var(--green)',      group: 'Criatividade & Hobby' },

  // Digital & Conteúdo
  { id: 'video',          name: 'Vídeo',             emoji: '🎥', color: 'var(--rose)',       group: 'Digital & Conteúdo' },
  { id: 'youtube',        name: 'YouTube',           emoji: '▶️', color: 'var(--rose)',       group: 'Digital & Conteúdo' },
  { id: 'social-media',   name: 'Redes Sociais',     emoji: '📱', color: 'var(--blue)',       group: 'Digital & Conteúdo' },
  { id: 'newsletter',     name: 'Newsletter',        emoji: '📧', color: 'var(--gold)',       group: 'Digital & Conteúdo' },
  { id: 'streaming',      name: 'Streaming',         emoji: '🎬', color: 'var(--purple)',     group: 'Digital & Conteúdo' },

  // Logística
  { id: 'travel',         name: 'Deslocamento',      emoji: '🚌', color: 'var(--text-muted)', group: 'Logística' },
  { id: 'errand',         name: 'Recados',           emoji: '📝', color: 'var(--text-muted)', group: 'Logística' },
  { id: 'admin',          name: 'Administração',     emoji: '🗂️', color: 'var(--text-muted)', group: 'Logística' },
  { id: 'volunteer',      name: 'Voluntariado',      emoji: '🤲', color: 'var(--green)',      group: 'Logística' },
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

// ─── Slot específico de data (não recorrente, só naquele dia) ───────────────
export interface SpecificDateSlot extends Slot {
  date: string  // "2026-03-22"
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

// ─── Meta mensal ────────────────────────────────────────────────────────────
export interface MonthlyGoal {
  id: string
  month: string        // "2026-03"
  title: string
  emoji: string
  unit: string         // "dias", "km", "livros"
  target: number
  color: string
  entries: string[]    // array of ISO dates where entry exists
}

export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay()
  const map: Record<number, DayOfWeek> = {
    0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
    4: 'quinta',  5: 'sexta',   6: 'sabado',
  }
  return map[jsDay]
}

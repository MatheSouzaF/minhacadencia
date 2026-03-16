# Modelo de Dados Detalhado

## Fase 1 — localStorage

### DaySchedule (template semanal)

```ts
interface Slot {
  id: string           // uuid v4
  time: string         // "05h45" | "06h00–08h10"
  name: string         // "Oração matinal"
  note?: string        // "10 min · antes de sair para o treino"
  category: Category
  order: number        // para drag-and-drop
}

interface DaySchedule {
  day: DayOfWeek       // "segunda" | "terca" | ...
  label: string        // "Segunda"
  tag: string          // "Jiu + Empresa"
  tagType: TagType     // "jiu" | "home" | "namorada" | "livre" | "missa"
  slots: Slot[]
}
```

### DayCheck (histórico de checks)

O check é vinculado à **data real**, não ao dia da semana.
Assim o histórico de terça 04/03 é independente de terça 11/03.

```ts
interface DayCheck {
  date: string                        // "2026-03-09"
  checks: Record<string, boolean>     // { [slotId]: true/false }
}

// localStorage: Record<dateISO, DayCheck>
// ex: { "2026-03-09": { date: "2026-03-09", checks: { "uuid-1": true } } }
```

### PomodoroConfig

```ts
interface PomodoroConfig {
  focusMinutes: number       // 25
  shortBreak: number         // 5
  longBreak: number          // 15
  sessionsUntilLong: number  // 4
  soundEnabled: boolean      // true
}
```

### PomodoroSession (runtime, não persiste)

```ts
type PomodoroPhase = 'idle' | 'focus' | 'short-break' | 'long-break'

interface PomodoroState {
  phase: PomodoroPhase
  secondsLeft: number
  sessionCount: number      // quantas sessões de foco completadas
  isRunning: boolean
  linkedSlotId?: string     // slot que está sendo focado (opcional)
}
```

---

## Fase 2 — PostgreSQL (referência futura)

```sql
-- Usuário
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template semanal
CREATE TABLE day_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  day TEXT NOT NULL,           -- 'segunda', 'terca'...
  label TEXT NOT NULL,
  tag TEXT NOT NULL,
  tag_type TEXT NOT NULL
);

-- Slots do template
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_schedule_id UUID REFERENCES day_schedules(id),
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  category TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- Checks diários
CREATE TABLE daily_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  slot_id UUID REFERENCES slots(id),
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, slot_id, date)
);
```

---

## Cálculo de Progresso

### Progresso do Dia

```
date = hoje (ex: "2026-03-09")
dayOfWeek = "segunda"
slots = schedule.find(d => d.day === dayOfWeek).slots
checks = checks[date]?.checks ?? {}

completed = slots.filter(s => checks[s.id] === true).length
total = slots.length
percent = Math.round((completed / total) * 100)
```

### Progresso da Semana

```
weekDates = [seg, ter, qua, qui, sex, sab, dom] da semana atual
para cada date:
  dayOfWeek = getDayOfWeek(date)
  slots = schedule.find(d => d.day === dayOfWeek).slots
  soma completed e total
```

### Progresso do Mês

```
daysInMonth = todos os dias do mês atual até hoje
para cada day: calcular percent
resultado: array de { date, percent } para o heatmap
```

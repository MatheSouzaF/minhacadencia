# Rotina Matheus — Arquitetura Geral

## Visão Geral

Aplicação web pessoal para gerenciamento da rotina semanal. O usuário pode visualizar, editar e acompanhar sua rotina diária com checks de tarefas, dashboard de progresso e um pomodoro integrado para sessões de foco.

**Stack:**
- **Front-end:** React (Vite) + TypeScript
- **Back-end:** Node.js + Express (fase 2)
- **Banco de dados:** PostgreSQL (fase 2)
- **Estilo:** Tailwind CSS + **Shadcn/ui** (seguindo o design system do cronograma.html — dark theme, paleta dourada)

---

## Fases de Desenvolvimento

| Fase | Escopo |
|------|--------|
| 1 (atual) | Front-end completo com estado local (localStorage) |
| 2 | API REST com Node/Express + PostgreSQL |
| 3 | Auth, multi-device sync, notificações |

---

## Estrutura de Pastas (Front-end)

```
src/
├── assets/               # fontes, ícones
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── schedule/
│   │   ├── WeekGrid.tsx          # grid semanal (7 cards)
│   │   ├── DayCard.tsx           # card de um dia
│   │   ├── SlotItem.tsx          # item de horário com checkbox
│   │   └── SlotEditor.tsx        # modal/inline para editar slot
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── DayProgress.tsx       # % concluído hoje
│   │   ├── WeekProgress.tsx      # % concluído na semana
│   │   ├── MonthProgress.tsx     # % concluído no mês
│   │   └── CategoryBreakdown.tsx # breakdown por categoria
│   ├── pomodoro/
│   │   ├── PomodoroWidget.tsx    # widget flutuante ou lateral
│   │   ├── PomodoroTimer.tsx     # lógica do timer
│   │   └── PomodoroSettings.tsx  # configurar minutos foco/pausa
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── ProgressBar.tsx
│       └── Checkbox.tsx
├── contexts/
│   ├── ScheduleContext.tsx       # estado do cronograma + checks
│   └── PomodoroContext.tsx       # estado do pomodoro
├── hooks/
│   ├── useSchedule.ts
│   ├── usePomodoro.ts
│   ├── useProgress.ts            # calcula % por dia/semana/mês
│   └── useLocalStorage.ts
├── pages/
│   ├── SchedulePage.tsx          # cronograma editável
│   ├── DashboardPage.tsx         # dashboard de progresso
│   └── PomodoroPage.tsx          # pomodoro em foco total
├── data/
│   └── schedule.seed.ts          # dados iniciais do cronograma.html
├── types/
│   └── index.ts
├── utils/
│   ├── dateUtils.ts
│   └── progressUtils.ts
├── App.tsx
└── main.tsx
```

---

## Modelo de Dados (Front-end / localStorage)

```ts
// types/index.ts

type Category =
  | 'work' | 'jiu' | 'pray' | 'read'
  | 'study' | 'video' | 'free' | 'missa' | 'travel'

type DayOfWeek =
  | 'segunda' | 'terca' | 'quarta' | 'quinta'
  | 'sexta' | 'sabado' | 'domingo'

interface Slot {
  id: string           // uuid
  time: string         // ex: "05h45" | "06h00–08h10"
  name: string
  note?: string
  category: Category
  order: number
}

interface DaySchedule {
  day: DayOfWeek
  label: string        // "Segunda", "Terça"...
  tag: string          // "Jiu + Empresa", "Home Office"...
  tagType: string      // "jiu" | "home" | "namorada" | "livre" | "missa"
  slots: Slot[]
}

// Checks — persistidos separadamente por data real
interface DayCheck {
  date: string         // ISO date: "2026-03-09"
  checks: {
    [slotId: string]: boolean
  }
}

// Estado global do localStorage
interface AppState {
  schedule: DaySchedule[]          // template semanal editável
  checks: Record<string, DayCheck> // histórico de checks por data
  pomodoroConfig: PomodoroConfig
}

interface PomodoroConfig {
  focusMinutes: number    // padrão: 25
  shortBreak: number      // padrão: 5
  longBreak: number       // padrão: 15
  sessionsUntilLong: number // padrão: 4
}
```

---

## Páginas e Funcionalidades

### 1. Schedule Page — `/`

- Exibe o grid semanal (7 cards, igual ao cronograma.html)
- Cada slot tem **checkbox** para marcar como concluído (persiste no check do dia atual)
- Slot concluído: visual riscado + opacidade reduzida
- **Edição inline:** clicar no nome do slot abre edição in-place (nome, horário, nota, categoria)
- **Adicionar slot:** botão `+` no final de cada DayCard
- **Remover slot:** ícone de lixeira ao hover no slot
- **Reordenar:** drag-and-drop entre slots do mesmo dia
- O cronograma editado é o **template** — se você mudar "Trabalho" para "Reunião", vale para todas as semanas futuras

### 2. Dashboard Page — `/dashboard`

Seção de progresso com 3 escopos:

**Hoje**
- Progress bar: X de Y slots concluídos
- % por categoria (ex: Trabalho 2/2 ✓, Oração 1/2...)
- Slots pendentes do dia listados

**Semana (atual)**
- Total de checks da semana / total de slots da semana
- Breakdown por dia: mini-barras Seg → Dom
- Categoria mais cumprida e mais negligenciada

**Mês**
- Calendário mensal com heatmap de % de conclusão por dia
- Linha do tempo: tendência de produtividade

### 3. Pomodoro — `/pomodoro` ou widget flutuante

**Estados:** `idle` → `focus` → `short-break` → `focus` → ... → `long-break`

- Timer central grande com contagem regressiva
- Indicador de sessão atual (1/4, 2/4...)
- Botões: Start / Pause / Reset / Skip
- Configurações: durar do foco, pausa curta, pausa longa
- Opcional: associar sessão pomodoro a um slot do dia (ex: "focando em: Trabalho 09h–12h")
- Som de notificação ao fim de cada sessão (simples, beep)

---

## Design System

Baseado no `cronograma.html` existente. Variáveis CSS mantidas:

```
--bg: #0f0e0c
--surface: #1a1814
--card: #211f1b
--border: #2e2b25
--gold: #c9a84c
--gold-light: #e8c97a
--text: #f0ead8
--text-muted: #8a8070
--green: #6abf8a    (livre / home)
--blue: #6aaabf     (jiu)
--rose: #bf6a7a     (namorada / vídeo)
--purple: #9a7abf   (estudos)
--orange: #bf9a6a   (leitura)
```

Tipografia:
- Títulos: `Playfair Display` (serif, elegante)
- Corpo: `DM Sans` (clean, legível)

---

## Roteamento

```
/                  → SchedulePage (cronograma semanal)
/dashboard         → DashboardPage
/pomodoro          → PomodoroPage (foco full screen)
```

Usando `react-router-dom v6`.

---

## Estado e Persistência (Fase 1)

- Tudo via **Context API + useReducer**
- Persistência via **localStorage** com hook `useLocalStorage`
- Nenhuma dependência de servidor na fase 1

```
localStorage keys:
  "rotina:schedule"    → DaySchedule[]
  "rotina:checks"      → Record<string, DayCheck>
  "rotina:pomodoro"    → PomodoroConfig
```

---

## Dependências Previstas (Front-end)

| Pacote | Uso |
|--------|-----|
| `react` + `react-dom` | core |
| `typescript` | tipagem |
| `vite` | bundler |
| `react-router-dom` | roteamento |
| `tailwindcss` | estilo utilitário |
| `shadcn/ui` | componentes base (Dialog, Button, Badge, Progress, Checkbox, Popover, Tooltip, Sheet, Separator) |
| `@radix-ui/*` | primitivos acessíveis (dependência do shadcn) |
| `lucide-react` | ícones (padrão shadcn) |
| `@dnd-kit/core` + `@dnd-kit/sortable` | drag-and-drop dos slots |
| `date-fns` | manipulação de datas |
| `uuid` | geração de IDs dos slots |
| `class-variance-authority` | variantes de componentes (padrão shadcn) |
| `clsx` + `tailwind-merge` | utilitários de classe (padrão shadcn) |

### Componentes Shadcn utilizados por feature

| Feature | Componentes Shadcn |
|---------|--------------------|
| Slot check | `Checkbox`, `Tooltip` |
| Editar slot | `Dialog`, `Input`, `Select`, `Textarea`, `Button` |
| Adicionar slot | `Dialog`, `Form` |
| Dashboard progress | `Progress` (customizado com as cores do design system) |
| Dashboard heatmap | custom component sobre `Tooltip` |
| Pomodoro settings | `Sheet` (drawer lateral), `Slider`, `Switch` |
| Pomodoro widget flutuante | `Popover` |
| Notificações/toast | `Sonner` (toaster recomendado pelo shadcn) |
| Sidebar/nav | `Separator`, `Button` (variant ghost) |

### Customização do tema Shadcn

O `globals.css` será configurado para mapear as variáveis CSS do design system original nas variáveis do shadcn:

```css
:root {
  --background: 30 5% 6%;           /* #0f0e0c */
  --foreground: 40 33% 90%;         /* #f0ead8 */
  --card: 30 7% 11%;                /* #1a1814 */
  --card-foreground: 40 33% 90%;
  --border: 32 9% 16%;              /* #2e2b25 */
  --primary: 40 52% 54%;            /* #c9a84c (gold) */
  --primary-foreground: 30 5% 6%;
  --muted: 32 9% 16%;
  --muted-foreground: 35 10% 48%;   /* #8a8070 */
  --accent: 40 52% 54%;
  --destructive: 350 45% 57%;       /* #bf6a7a (rose) */
  --radius: 0.75rem;
}
```

---

## Próximos Passos (Fase 2 — Back-end)

Quando o front estiver estável:

1. Criar API REST com Node + Express
2. Modelar tabelas PostgreSQL (`schedules`, `slots`, `daily_checks`, `users`)
3. Substituir localStorage por chamadas à API
4. Adicionar autenticação JWT simples
5. Sincronização multi-device

---

## Seed Data

O arquivo `src/data/schedule.seed.ts` terá os 7 dias do `cronograma.html` já convertidos para o formato `DaySchedule[]`, servindo como estado inicial do app na primeira vez que for aberto (sem dados no localStorage).

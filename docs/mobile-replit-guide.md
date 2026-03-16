# Guia de Arquitetura — Versão Mobile (Replit)

> Este documento descreve toda a arquitetura do projeto **Rotina Matheus** (versão web desktop)
> e fornece um plano passo a passo para recriar a versão mobile no Replit.

---

## 1. Visão Geral do Projeto

**Rotina Matheus** é um app de gestão de rotina semanal pessoal. Permite:

- Visualizar e editar uma grade semanal de atividades (slots)
- Marcar slots como concluídos por dia
- Acompanhar progresso diário, semanal e mensal via dashboard
- Usar um timer Pomodoro vinculado a slots específicos

**Stack atual (web desktop):**

| Camada | Tecnologia |
|--------|-----------|
| UI | React 19 + TypeScript |
| Bundler | Vite 7 |
| Estilos | Tailwind CSS v4 |
| Componentes | Radix UI primitives + shadcn/ui pattern |
| Animações | Framer Motion |
| Drag & Drop | dnd-kit |
| Roteamento | React Router DOM v7 |
| Estado | React Context + useReducer |
| Persistência | localStorage (apenas navegador) |
| Notificações | sonner (toast) |
| Data | date-fns |

---

## 2. Estrutura de Pastas (projeto web)

```
app/
└── src/
    ├── App.tsx                  ← entrada, providers, layout global, rotas
    ├── main.tsx                 ← bootstrap ReactDOM
    ├── index.css                ← design tokens (CSS vars) + Tailwind
    ├── types/index.ts           ← todos os tipos TypeScript
    ├── data/schedule.seed.ts    ← dados iniciais da rotina (7 dias)
    ├── utils/cn.ts              ← utilitário clsx + twMerge
    ├── hooks/
    │   ├── useLocalStorage.ts   ← hook genérico de persistência
    │   └── useProgress.ts       ← cálculos de progresso (dia/semana/mês)
    ├── contexts/
    │   ├── ScheduleContext.tsx  ← estado global da agenda + checks
    │   └── PomodoroContext.tsx  ← estado do timer Pomodoro
    ├── pages/
    │   ├── SchedulePage.tsx     ← tela de agenda semanal
    │   ├── DashboardPage.tsx    ← tela de progresso/métricas
    │   └── PomodoroPage.tsx     ← tela do timer Pomodoro
    └── components/
        ├── layout/
        │   ├── Sidebar.tsx      ← nav lateral (desktop)
        │   └── TopBar.tsx       ← barra superior com título e data
        ├── schedule/
        │   ├── WeekGrid.tsx     ← grade com os 7 DayCards
        │   ├── DayCard.tsx      ← card de um dia (slots + drag & drop)
        │   ├── SlotItem.tsx     ← item individual de atividade
        │   └── SlotEditor.tsx   ← modal para criar/editar slot
        ├── dashboard/
        │   ├── DayProgress.tsx       ← progresso do dia
        │   ├── WeekProgress.tsx      ← gráfico de barras da semana
        │   ├── MonthProgress.tsx     ← heatmap do mês
        │   └── CategoryBreakdown.tsx ← breakdown por categoria
        ├── pomodoro/
        │   ├── PomodoroTimer.tsx     ← anel SVG + controles
        │   ├── PomodoroSettings.tsx  ← modal de configuração
        │   └── PomodoroWidget.tsx    ← botão flutuante (mini-timer)
        └── ui/
            ├── badge.tsx, button.tsx, checkbox.tsx
            ├── dialog.tsx, input.tsx, progress.tsx
            ├── select.tsx, textarea.tsx, tooltip.tsx
```

---

## 3. Tipos de Dados (TypeScript)

Todos os tipos vivem em `src/types/index.ts`. Copie-os integralmente para o projeto mobile.

### 3.1 Categorias

```ts
type Category =
  | 'work'    // Trabalho — azul escuro
  | 'jiu'     // Jiu-Jitsu — azul
  | 'pray'    // Oração — dourado
  | 'read'    // Leitura — laranja
  | 'study'   // Estudos Igreja — roxo
  | 'video'   // Gravação/Edição de vídeo — rosa
  | 'free'    // Tempo livre / namorada — verde
  | 'missa'   // Missa — dourado claro
  | 'travel'  // Deslocamento — cinza
```

### 3.2 Entidades principais

```ts
interface Slot {
  id: string         // uuid v4
  time: string       // ex: "05h45", "06h00–08h10"
  name: string       // nome da atividade
  icon?: string      // emoji
  note?: string      // observação opcional
  category: Category
  order: number      // posição para drag & drop
}

interface DaySchedule {
  day: DayOfWeek     // 'segunda' | 'terca' | ... | 'domingo'
  label: string      // "Segunda", "Terça"...
  tag: string        // "Jiu + Empresa", "Home Office"...
  tagType: TagType   // 'jiu' | 'home' | 'namorada' | 'livre' | 'missa'
  slots: Slot[]
}

interface DayCheck {
  date: string       // ISO: "2026-03-09"
  checks: { [slotId: string]: boolean }
}

interface PomodoroConfig {
  focusMinutes: number       // padrão: 25
  shortBreak: number         // padrão: 5
  longBreak: number          // padrão: 15
  sessionsUntilLong: number  // padrão: 4
  soundEnabled: boolean
}
```

### 3.3 Chaves do localStorage

| Chave | Conteúdo |
|-------|----------|
| `rotina:schedule` | `DaySchedule[]` — grade semanal |
| `rotina:checks` | `Record<dateISO, DayCheck>` — histórico de checks |
| `rotina:pomodoro` | `PomodoroConfig` — configuração do timer |

---

## 4. Gerenciamento de Estado

### 4.1 ScheduleContext

`useReducer` com as seguintes actions:

| Action | Efeito |
|--------|--------|
| `INIT` | Carrega do localStorage (ou seed) |
| `TOGGLE_CHECK` | Alterna check de um slot em uma data |
| `ADD_SLOT` | Adiciona novo slot a um dia |
| `UPDATE_SLOT` | Atualiza campos de um slot |
| `DELETE_SLOT` | Remove slot e reordena os demais |
| `REORDER_SLOTS` | Substitui array de slots (resultado do drag) |

**API exposta pelo contexto:**
```ts
toggleCheck(day: DayOfWeek, slotId: string, date: string): void
addSlot(day: DayOfWeek, slot: Omit<Slot, 'id' | 'order'>): void
updateSlot(day: DayOfWeek, slotId: string, patch: Partial<Slot>): void
deleteSlot(day: DayOfWeek, slotId: string): void
reorderSlots(day: DayOfWeek, slots: Slot[]): void
isChecked(date: string, slotId: string): boolean
getDayChecks(date: string): DayCheck | undefined
getDaySchedule(day: DayOfWeek): DaySchedule | undefined
```

### 4.2 PomodoroContext

Timer implementado com `useReducer` + `setInterval`.

**Fases:** `idle` → `focus` → `short-break` → `focus` → ... → (a cada N sessões) `long-break`

**Actions:** `START`, `PAUSE`, `RESET`, `SKIP`, `TICK`, `LINK_SLOT`, `UPDATE_CONFIG`, `LOAD_CONFIG`

**Som:** Web AudioContext API — dois beeps no fim do foco, um beep no fim do intervalo.

---

## 5. Design System

### 5.1 Paleta de cores (modo escuro)

```css
--bg: #0f0e0c          /* fundo principal */
--surface: #1a1814      /* superfície secundária */
--card: #211f1b         /* fundo de cards */
--border: #2e2b25       /* bordas */
--gold: #c9a84c         /* cor de destaque principal */
--gold-light: #e8c97a   /* dourado claro */
--text: #f0ead8         /* texto principal */
--text-muted: #8a8070   /* texto secundário */
--green: #6abf8a
--blue: #6aaabf
--rose: #bf6a7a
--purple: #9a7abf
--orange: #bf9a6a
--work: #4a7abf         /* azul de trabalho */
```

### 5.2 Tipografia

- **Títulos:** `Playfair Display` (serif)
- **Corpo:** `DM Sans` (sans-serif)

### 5.3 Cores por categoria

| Categoria | Cor hex |
|-----------|---------|
| work | #4a7abf |
| jiu | #6aaabf |
| pray | #c9a84c |
| read | #bf9a6a |
| study | #9a7abf |
| video | #bf6a7a |
| free | #6abf8a |
| missa | #e8c97a |
| travel | #8a8070 |

---

## 6. Lógica de Progresso (hook `useProgress`)

O hook consome `ScheduleContext` e retorna 3 objetos memoizados:

### `dayProgress`
```ts
{
  total: number         // slots do dia
  checked: number       // slots marcados hoje
  percent: number       // 0–100
  pending: Slot[]       // slots ainda não feitos
  byCategory: Array<{
    category: Category
    total: number
    checked: number
    percent: number
  }>
}
```

### `weekProgress`
```ts
{
  total: number
  checked: number
  percent: number
  days: Array<{ day, label, total, checked, percent, isFuture }>
  bestCategory: Category
  worstCategory: Category
}
```

### `monthProgress`
```ts
{
  total: number
  checked: number
  percent: number
  heatmap: Array<{
    date: string         // ISO ou '' (célula vazia de alinhamento)
    total: number
    checked: number
    percent: number
    isToday: boolean
    isEmpty: boolean     // padding do calendário
  }>
}
```

---

## 7. Dados Iniciais (Seed)

A rotina semanal completa está em `src/data/schedule.seed.ts`. Abaixo o resumo:

| Dia | Tag | Atividades principais |
|-----|-----|-----------------------|
| Segunda | Jiu + Empresa | Oração, Jiu-Jitsu, Trabalho (2x), Leitura, Gravar vídeo, Oração noturna |
| Terça | Home Office | Oração, Trabalho (2x), Leitura, Estudos Igreja, Editar vídeo, Oração noturna |
| Quarta | Jiu + Namorada | Oração, Jiu-Jitsu, Trabalho (2x), Leitura, Deslocamento, Namorada, Oração noturna |
| Quinta | Home Office | Oração, Trabalho (2x), Leitura, Gravar vídeo 2, Estudos Igreja, Oração noturna |
| Sexta | Jiu + Namorada | Oração, Jiu-Jitsu, Trabalho (2x), Leitura, Deslocamento, Namorada, Oração noturna |
| Sábado | Na namorada | Oração, Leitura, Gravar+Editar vídeo, Namorada, Oração noturna |
| Domingo | Missa + Descanso | Oração, Deslocamento, Missa, Almoço família, Leitura, Editar vídeos, Descanso, Oração noturna |

---

## 8. Rotas

| Path | Página | Descrição |
|------|--------|-----------|
| `/` | SchedulePage | Grade semanal com 7 DayCards |
| `/dashboard` | DashboardPage | Progresso dia/semana/mês + breakdown |
| `/pomodoro` | PomodoroPage | Timer Pomodoro + lista de slots do dia |

---

## 9. Plano de Implementação — Versão Mobile no Replit

### Pré-requisitos no Replit

1. Criar um novo Repl do tipo **React + TypeScript** (Vite template)
2. Instalar as dependências:

```bash
npm install react-router-dom date-fns framer-motion lucide-react sonner uuid
npm install @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-progress
npm install @radix-ui/react-select @radix-ui/react-tooltip @radix-ui/react-label
npm install class-variance-authority clsx tailwind-merge
npm install -D tailwindcss @types/uuid
```

---

### Passo 1 — Configuração base

**1.1** Configure o `tailwind.config.js` (ou `vite.config.ts` com `@tailwindcss/vite`).

**1.2** Crie `src/index.css` com as variáveis CSS do design system (seção 5 acima).
Importe as fontes do Google Fonts no `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

**1.3** Crie `src/utils/cn.ts`:
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

**1.4** Crie `src/types/index.ts` com todos os tipos da seção 3.

---

### Passo 2 — Dados e persistência

**2.1** Crie `src/data/schedule.seed.ts` com a rotina completa (seção 7).

**2.2** Crie `src/hooks/useLocalStorage.ts`:
```ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setValue] as const
}
```

---

### Passo 3 — Contextos de estado

**3.1** Crie `src/contexts/ScheduleContext.tsx`

Implemente o `useReducer` com as 6 actions descritas na seção 4.1. Na inicialização:
- Tente carregar `rotina:schedule` do localStorage
- Se vazio, use o seed data

**3.2** Crie `src/contexts/PomodoroContext.tsx`

Implemente o ciclo de fases com `setInterval` (chama `dispatch({ type: 'TICK' })` a cada segundo).

---

### Passo 4 — Hook de progresso

Crie `src/hooks/useProgress.ts` conforme descrito na seção 6.

Lógica central:
```ts
// Para cada dia, encontre a data ISO desta semana
function getDateForDay(day: DayOfWeek): string {
  const today = new Date()
  const dayIndex = DAY_ORDER.indexOf(day)   // 0=segunda
  const todayIndex = (today.getDay() + 6) % 7  // ajusta domingo=6
  const diff = dayIndex - todayIndex
  const target = new Date(today)
  target.setDate(today.getDate() + diff)
  return target.toISOString().split('T')[0]
}
```

---

### Passo 5 — Layout mobile

Na versão mobile, substitua a `Sidebar` lateral por uma **Bottom Tab Bar** com 3 abas:

```
[ Cronograma ]  [ Dashboard ]  [ Pomodoro ]
```

Estrutura do `App.tsx` mobile:
```tsx
<BrowserRouter>
  <ScheduleProvider>
    <PomodoroProvider>
      <div className="flex flex-col h-dvh bg-[--bg]">
        <TopBar />                {/* título + data, altura fixa */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<SchedulePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
          </Routes>
        </main>
        <BottomNav />             {/* substitui o Sidebar */}
      </div>
      <Toaster />
    </PomodoroProvider>
  </ScheduleProvider>
</BrowserRouter>
```

**BottomNav — estrutura:**
```tsx
const tabs = [
  { path: '/',           icon: <CalendarDays />, label: 'Agenda'    },
  { path: '/dashboard',  icon: <BarChart2 />,    label: 'Dashboard' },
  { path: '/pomodoro',   icon: <Timer />,        label: 'Foco'      },
]
```

Estilo: fundo `--surface`, borda superior `--border`, ícone + label, item ativo com cor `--gold`.

---

### Passo 6 — Tela de Agenda (mobile)

Em vez da grade horizontal com 7 cards, use uma **lista vertical com scroll** ou **abas por dia**.

**Opção A — Abas deslizantes (recomendado):**
- Header com chips horizontais roláveis: Seg | Ter | Qua | Qui | Sex | Sáb | Dom
- Dia atual selecionado por padrão
- Swipe entre dias (ou troca ao clicar no chip)
- Mostra um único `DayCard` expandido por vez

**Opção B — Lista vertical:**
- Todos os 7 dias empilhados verticalmente
- Dia atual aparece primeiro e expandido
- Demais dias colapsados (clique para expandir)

**DayCard mobile:**
- Largura 100% da tela com padding lateral
- Header: nome do dia + tag + progresso circular (compacto)
- Lista de slots com `SlotItem` em tamanho full-width
- Botão "+ Adicionar" ao final

**SlotItem mobile:**
- Altura mínima de 56px (touch target)
- Checkbox à esquerda com tamanho 24x24
- Borda esquerda colorida por categoria
- Texto do nome + horário + nota
- Swipe para esquerda → botão de deletar (ou menu de longa pressão)

---

### Passo 7 — Tela de Dashboard (mobile)

Layout em coluna única (sem grid de 2 colunas):

```
DayProgress      ← card full-width
WeekProgress     ← card full-width (gráfico de barras compacto)
MonthProgress    ← card full-width (heatmap 7 colunas, células menores)
CategoryBreakdown ← card full-width
```

Ajuste as alturas dos gráficos para não ultrapassar `80vw`.

---

### Passo 8 — Tela Pomodoro (mobile)

Layout centralizado vertical com:

```
[Título "Foco Total"]
[Slot vinculado — pill]
[Anel SVG grande — ~280px]
[Controles: Reset | Play/Pause | Skip]
[Lista de slots do dia — scroll]
```

O anel SVG já usa `r=80` no componente original — mantenha. No mobile, defina `viewBox="0 0 200 200"` e `width="280"` para ocupar bem a tela.

---

### Passo 9 — SlotEditor mobile

O modal (`<Dialog>`) funciona bem no mobile, mas:
- Use `position: fixed, inset-x-0, bottom-0` para um **bottom sheet** em vez de dialog centrado
- Animação: `y: 100% → 0` (slide up)
- Handle bar no topo do sheet
- Campos com tamanho de fonte mínimo 16px (evita zoom automático do iOS)

---

### Passo 10 — PomodoroWidget mobile

Na versão mobile o widget flutuante pode ser simplificado:
- Esconder o widget nas telas que não são `/` e `/dashboard`
- Na tela `/pomodoro` já existe o timer completo
- Ou: manter o FAB mas posicioná-lo acima da BottomNav (`bottom: 72px`)

---

## 10. Diferenças Chave Desktop → Mobile

| Aspecto | Desktop (atual) | Mobile (Replit) |
|---------|----------------|-----------------|
| Navegação | Sidebar lateral 224px | Bottom Tab Bar |
| Agenda | Grade horizontal 7 colunas | Abas por dia (1 card por vez) |
| Layout dashboard | Grid 2×2 | Coluna única |
| SlotEditor | Dialog centralizado | Bottom sheet |
| Drag & Drop | dnd-kit (mouse) | Swipe touch ou remover |
| Pomodoro widget | FAB canto inferior direito | FAB acima da bottom nav |
| Scroll | Horizontal na grade | Vertical por tela |

---

## 11. Ordem de Criação dos Arquivos

Siga esta sequência para não ter erros de importação:

```
1. src/types/index.ts
2. src/utils/cn.ts
3. src/hooks/useLocalStorage.ts
4. src/data/schedule.seed.ts
5. src/contexts/ScheduleContext.tsx
6. src/contexts/PomodoroContext.tsx
7. src/hooks/useProgress.ts
8. src/components/ui/  (todos os primitivos)
9. src/components/layout/TopBar.tsx
10. src/components/layout/BottomNav.tsx    ← novo
11. src/components/schedule/SlotItem.tsx
12. src/components/schedule/SlotEditor.tsx
13. src/components/schedule/DayCard.tsx
14. src/components/schedule/WeekGrid.tsx   ← ou DayTabs.tsx (mobile)
15. src/components/dashboard/DayProgress.tsx
16. src/components/dashboard/WeekProgress.tsx
17. src/components/dashboard/MonthProgress.tsx
18. src/components/dashboard/CategoryBreakdown.tsx
19. src/components/pomodoro/PomodoroTimer.tsx
20. src/components/pomodoro/PomodoroSettings.tsx
21. src/components/pomodoro/PomodoroWidget.tsx
22. src/pages/SchedulePage.tsx
23. src/pages/DashboardPage.tsx
24. src/pages/PomodoroPage.tsx
25. src/App.tsx
26. src/main.tsx
```

---

## 12. Checklist Final

- [ ] Variáveis CSS do design system definidas
- [ ] Fontes Playfair Display + DM Sans importadas
- [ ] Tipos TypeScript copiados integralmente
- [ ] Seed data com os 7 dias completos
- [ ] ScheduleContext com `useReducer` e persistência no localStorage
- [ ] PomodoroContext com ciclo de fases e beep de áudio
- [ ] `useProgress` retornando day/week/month corretamente
- [ ] Bottom Tab Bar funcionando com active state
- [ ] TopBar mostrando título e data em pt-BR
- [ ] SchedulePage com abas por dia
- [ ] DayCard com lista de slots e progress circular
- [ ] SlotItem com checkbox, borda por categoria e delete
- [ ] SlotEditor como bottom sheet
- [ ] DashboardPage em coluna única
- [ ] PomodoroPage com anel SVG centralizado
- [ ] localStorage salvando e carregando entre sessões
- [ ] App funcionando em viewport 375px (iPhone SE)

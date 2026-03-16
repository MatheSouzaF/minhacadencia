# Plano de Execução — Front-end

## Ordem de Implementação

### Sprint 1 — Fundação
- [ ] Criar projeto com Vite + React + TypeScript
- [ ] Instalar e configurar Shadcn/ui (`npx shadcn@latest init`)
- [ ] Configurar tema no `globals.css` (mapear variáveis do cronograma.html → tokens Shadcn)
- [ ] Instalar componentes Shadcn iniciais: `button`, `dialog`, `input`, `select`, `checkbox`, `progress`, `badge`, `tooltip`, `sheet`, `separator`, `sonner`
- [ ] Configurar react-router-dom com as 3 rotas
- [ ] Criar tipos em `types/index.ts`
- [ ] Criar seed data `schedule.seed.ts` com os 7 dias do cronograma

### Sprint 2 — Cronograma (Schedule Page)
- [ ] `ScheduleContext` + reducer (CRUD de slots, toggle check)
- [ ] `useLocalStorage` hook
- [ ] `WeekGrid` — layout de 7 colunas responsivo
- [ ] `DayCard` — card do dia com header e lista de slots
- [ ] `SlotItem` — slot com checkbox, cores por categoria, hover actions
- [ ] Edição inline do slot (nome, horário, nota, categoria)
- [ ] Adicionar/remover slot
- [ ] Drag-and-drop para reordenar (dnd-kit)

### Sprint 3 — Dashboard
- [ ] `useProgress` hook — calcula % por dia/semana/mês
- [ ] `DayProgress` — progresso de hoje
- [ ] `WeekProgress` — breakdown Seg→Dom com mini barras
- [ ] `MonthProgress` — heatmap calendário do mês
- [ ] `CategoryBreakdown` — por categoria

### Sprint 4 — Pomodoro
- [ ] `PomodoroContext` + reducer (estados: idle/focus/short-break/long-break)
- [ ] `usePomodoro` hook (lógica do timer com setInterval)
- [ ] `PomodoroTimer` — display do timer
- [ ] `PomodoroWidget` — versão compacta flutuante (disponível em todas as páginas)
- [ ] `PomodoroPage` — versão full screen
- [ ] Som de notificação (AudioContext API — sem lib externa)
- [ ] Settings de duração

### Sprint 5 — Polimento
- [ ] Animações de transição (Framer Motion ou CSS puro)
- [ ] Responsividade mobile
- [ ] Empty states (primeiro acesso)
- [ ] Feedback visual ao fazer check (micro-animação)
- [ ] Toast de notificação ao completar pomodoro

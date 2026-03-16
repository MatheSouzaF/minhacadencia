import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const pageTitles: Record<string, string> = {
  '/': 'Cronograma Semanal',
  '/dashboard': 'Dashboard de Progresso',
  '/pomodoro': 'Pomodoro',
  '/categorias': 'Categorias',
}

export function TopBar() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Cadência'
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <header className="h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6">
      <div>
        <h2 className="text-[var(--text)] font-serif font-semibold text-base">{title}</h2>
      </div>
      <div className="text-[var(--text-muted)] text-sm capitalize">{today}</div>
    </header>
  )
}

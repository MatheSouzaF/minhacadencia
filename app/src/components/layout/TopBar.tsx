import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Waves } from 'lucide-react'

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
    <header className="h-14 bg-white border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6">
      {/* Logo — só aparece no mobile já que a sidebar some */}
      <div className="flex items-center gap-2 md:hidden">
        <Waves className="w-4 h-4 text-[var(--gold)] shrink-0" />
        <h1 className="text-[var(--gold)] font-semibold text-base leading-tight">
          Cadência
        </h1>
      </div>

      {/* Título da página — só no desktop */}
      <div className="hidden md:block">
        <h2 className="text-[var(--text)] font-semibold text-base">{title}</h2>
      </div>

      <div className="text-[var(--text-muted)] text-sm capitalize">{today}</div>
    </header>
  )
}

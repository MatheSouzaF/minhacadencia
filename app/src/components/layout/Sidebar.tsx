import { NavLink } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, Timer, LogOut, Tag, Waves } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/', icon: CalendarDays, label: 'Cronograma', end: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
]

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-56 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <div className="hidden md:flex items-center gap-2">
          <Waves className="w-4 h-4 text-[var(--gold)] shrink-0" />
          <h1 className="text-[var(--gold)] font-serif font-semibold text-lg leading-tight">
            Cadência
          </h1>
        </div>
        <div className="md:hidden flex items-center justify-center text-[var(--gold)]">
          <Waves className="w-5 h-5" />
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group cursor-pointer',
                isActive
                  ? 'bg-[color-mix(in_srgb,var(--gold)_15%,transparent)] text-[var(--gold)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden md:block font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="px-2 py-3 border-t border-[var(--border)]">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden md:block font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
